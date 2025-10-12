// src/services/maintenanceLogs.ts
import { db, auth } from "@/src/lib/firebase";
import {
    addDoc,
    collection,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";

export type MaintenanceLog = {
    id: string;
    title: string;
    date: string;           // "YYYY-MM-DD"
    description?: string;
    createdAt?: any;
    updatedAt?: any;
};

function isoToTimestamp(iso: string) {
    // store midnight local time for the given date
    return Timestamp.fromDate(new Date(iso + "T00:00:00"));
}

export function listenMaintenanceLogs(
    itemId: string,
    cb: (logs: MaintenanceLog[]) => void
) {
    const coll = collection(db, "items", itemId, "maintenance_logs");
    const q = query(coll, orderBy("dateTs", "desc"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
        const list: MaintenanceLog[] = [];
        snap.forEach((d) =>
            list.push({ id: d.id, ...(d.data() as any) })
        );
        cb(list);
    });
}

export async function addMaintenanceLog(
    itemId: string,
    data: { title: string; date: string; description?: string }
) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Not signed in");

    const coll = collection(db, "items", itemId, "maintenance_logs");
    await addDoc(coll, {
        title: data.title.trim(),
        date: data.date,               // keep nice string for UI
        dateTs: isoToTimestamp(data.date),
        description: data.description?.trim() || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
}

export async function updateMaintenanceLog(
    itemId: string,
    logId: string,
    patch: Partial<{ title: string; date: string; description: string }>
) {
    const ref = doc(db, "items", itemId, "maintenance_logs", logId);
    await updateDoc(ref, {
        ...(patch.title != null ? { title: patch.title.trim() } : {}),
        ...(patch.date != null ? { date: patch.date, dateTs: isoToTimestamp(patch.date) } : {}),
        ...(patch.description != null ? { description: patch.description.trim() } : {}),
        updatedAt: serverTimestamp(),
    });
}

export async function deleteMaintenanceLog(itemId: string, logId: string) {
    await deleteDoc(doc(db, "items", itemId, "maintenance_logs", logId));
}
