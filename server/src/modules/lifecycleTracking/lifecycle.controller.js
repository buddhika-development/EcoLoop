import { db, fb } from "../../config/firebaseAdmin.js";

export async function myItems(req, res, next) {
    try {
        const q = await db.collection("items").where("ownerUid", "==", req.user.uid).get();
        res.json({ ok: true, data: q.docs.map(d => ({ id: d.id, ...d.data() })) });
    } catch (e) { next(e); }
}

export async function getItem(req, res, next) {
    try {
        const doc = await db.collection("items").doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ ok: false, error: "Not found" });
        res.json({ ok: true, data: { id: doc.id, ...doc.data() } });
    } catch (e) { next(e); }
}

export async function createItem(req, res, next) {
    try {
        const { name, category } = req.body;
        if (!name) return res.status(400).json({ ok: false, error: "name required" });
        const ref = await db.collection("items").add({
            name, category: category || null,
            ownerUid: req.user.uid,
            status: "active",
            createdAt: Date.now(),
            lifecycleEvents: [],
        });
        res.status(201).json({ ok: true, data: { id: ref.id } });
    } catch (e) { next(e); }
}

export async function addEvent(req, res, next) {
    try {
        const { type, note } = req.body;
        if (!type) return res.status(400).json({ ok: false, error: "type required" });
        await db.collection("items").doc(req.params.id).update({
            lifecycleEvents: fb.firestore.FieldValue.arrayUnion({ type, note: note || "", at: Date.now() }),
        });
        res.json({ ok: true });
    } catch (e) { next(e); }
}
