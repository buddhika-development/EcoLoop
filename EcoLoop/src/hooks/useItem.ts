// src/hooks/useItem.ts
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/src/lib/firebase";
import type { ItemDoc } from "./useMyItems";

export function useItem(itemId: string) {
    const [item, setItem] = useState<ItemDoc | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!itemId) return;
        const ref = doc(db, "items", itemId);
        const unsub = onSnapshot(ref, (snap) => {
            const data = snap.exists() ? ({ id: snap.id, ...(snap.data() as any) }) : null;
            setItem(data);
            setLoading(false);
            // one-time lightweight debug: comment out after verifying
            if (data) console.log("Item snapshot:", { id: data.id, hasQR: !!data.qrCode, qr: data.qrCode?.slice(0, 32) });
        });
        return () => unsub();
    }, [itemId]);

    const uid = auth.currentUser?.uid;
    const isOwner = !!uid && item?.ownerUid === uid;

    return { item, loading, isOwner };
}
