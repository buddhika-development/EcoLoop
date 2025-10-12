// src/services/item.ts
import { auth, db } from "@/src/lib/firebase";
import {
    addDoc, collection, serverTimestamp, Timestamp,
    updateDoc, doc, setDoc, arrayUnion,
    deleteDoc
} from "firebase/firestore";
import { uploadLocalFile } from "@/src/services/storage";
import { makeQrToken, tokenIndexId } from "@/src/lib/crypto";
import type { WizardDraft } from "@/src/hooks/useAddItemWizard";
import type { LocalFile } from "@/src/types/media";



export async function deleteItem(itemId: string) {
    const ref = doc(db, "items", itemId);
    await deleteDoc(ref);
}

function addMonths(iso: string, months: number) {
    const d = new Date(iso + "T00:00:00");
    const nd = new Date(d);
    nd.setMonth(nd.getMonth() + months);
    if (nd.getDate() !== d.getDate()) nd.setDate(0);
    return nd.toISOString().slice(0, 10);
}

export async function updateItemPartial(
    itemId: string,
    patch: Partial<{
        model: string | null;
        purchaseDate: string | null;       // YYYY-MM-DD
        warrantyMonths: number | null;
        warrantyExpiry: string | null;     // optional override
        maintenance: any;                  // small patch (time, firstDate, enabled, etc.)
    }>
) {
    // auto compute expiry if purchaseDate + months provided and no explicit override
    if (
        patch.purchaseDate &&
        typeof patch.warrantyMonths === "number" &&
        (patch.warrantyExpiry === undefined || patch.warrantyExpiry === null)
    ) {
        patch.warrantyExpiry =
            patch.warrantyMonths > 0 ? addMonths(patch.purchaseDate, patch.warrantyMonths) : null;
    }

    await updateDoc(doc(db, "items", itemId), patch as any);
}

export async function addItemDocuments(itemId: string, files: LocalFile[]) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Not signed in");

    const uploaded: string[] = [];
    for (const f of files) {
        const key = `users/${uid}/items/${itemId}/docs/${Date.now()}-${f.name}`;
        const url = await uploadLocalFile(f, key);
        uploaded.push(url);
    }
    if (uploaded.length) {
        await updateDoc(doc(db, "items", itemId), {
            documents: arrayUnion(...uploaded),
        });
    }
}


const toTs = (iso?: string) => (iso ? Timestamp.fromDate(new Date(iso + "T00:00:00")) : undefined);

export type CreatedItem = { id: string; qrToken: string };

export async function createItemFromWizard(draft: WizardDraft): Promise<CreatedItem> {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Not signed in");

    // 1) Shell doc
    const refCol = collection(db, "items");
    const base = {
        ownerUid: uid,
        name: draft.name,
        category: draft.category,
        brand: draft.brand || null,
        model: draft.model || null,
        description: draft.description || null,

        purchaseDate: draft.purchaseDate || null,
        warrantyMonths: draft.warrantyMonths ?? 0,
        warrantyExpiry: draft.warrantyExpiry || null,
        trackWarranty: !!draft.trackWarranty,

        maintenance: {
            frequency: draft.maintenance?.frequency || "none",
            firstDate: draft.maintenance?.firstDate || null,
            time: draft.maintenance?.time || null,
            enabled: !!draft.maintenance?.enabled,
            nextDate: draft.maintenance?.nextDate || null,
        },

        images: [] as string[],
        documents: [] as string[],
        createdAt: serverTimestamp(),
        status: "active",
    };

    const docRef = await addDoc(refCol, base);
    const itemId = docRef.id;

    // 2) Upload media
    const upImgs = draft.imagesLocal || [];
    const upDocs = draft.docsLocal || [];

    const [imageUrls, docUrls] = await Promise.all([
        Promise.all(upImgs.map((f: LocalFile, idx) =>
            uploadLocalFile(f, `users/${uid}/items/${itemId}/images/${idx}-${f.name}`)
        )),
        Promise.all(upDocs.map((f: LocalFile, idx) =>
            uploadLocalFile(f, `users/${uid}/items/${itemId}/docs/${idx}-${f.name}`)
        )),
    ]);

    // 3) Opaque app-only QR token
    const { token: qrToken } = await makeQrToken(itemId, uid);

    // 4) Save to the item
    await updateDoc(docRef, {
        images: imageUrls,
        documents: docUrls,
        qrCode: qrToken,                 // store the token string on the item
        qrToken: qrToken,
        updatedAt: serverTimestamp(),
    });

    // 5) Minimal public index (no private data)
    //    This lets you *optionally* check if a token is “known” without revealing details.
    try {
        const indexId = await tokenIndexId(qrToken);
        await setDoc(doc(db, "items_public_tokens", indexId), {
            createdAt: serverTimestamp(),
            // don’t store itemId/uid in this public doc (keep it anonymous)
            // you already have integrity via signature in the token itself
            v: 1,
        });
    } catch { console.warn("Failed to create public index doc"); }

    return { id: itemId, qrToken };
}
