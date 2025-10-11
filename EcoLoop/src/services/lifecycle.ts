import { auth, db } from "@/src/lib/firebase";
import {
    collection, getDocs, onSnapshot, query, where, Timestamp,
} from "firebase/firestore";

export type LifecycleItem = {
    id: string;
    ownerUid: string;
    name: string;
    category?: string;
    brand?: string;
    model?: string;
    purchaseDate?: string;             // "YYYY-MM-DD"
    warrantyMonths?: number;
    warrantyExpiry?: string;           // "YYYY-MM-DD"
    trackWarranty?: boolean;
    maintenance?: {
        frequency?: "monthly" | "quarterly" | "yearly" | "custom";
        nextDate?: string;               // "YYYY-MM-DD"
        enabled?: boolean;
    };
    images?: string[];
    documents?: string[];
    createdAt?: any;
};

// ---- Helpers ----
const parseDate = (s?: string) => (s ? new Date(s + "T00:00:00") : undefined);
const daysBetween = (a: Date, b: Date) => Math.ceil((a.getTime() - b.getTime()) / 86400000);

// ---- Live stats for the signed-in user ----
export function listenUserItems(cb: (items: LifecycleItem[]) => void) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Not signed in");

    const ref = query(collection(db, "items"), where("ownerUid", "==", uid));
    return onSnapshot(ref, (snap) => {
        const list: LifecycleItem[] = [];
        snap.forEach((doc) => list.push({ id: doc.id, ...(doc.data() as any) }));
        cb(list);
    });
}

// Derived counts computed client-side.
// (Simple & robust. If you later add indexed fields like `maintenanceNextDate`,
// you can move these to Firestore queries.)
export function computeStats(items: LifecycleItem[]) {
    const today = new Date();

    const itemsCount = items.length;

    const maintDue = items.filter((it) => {
        if (!it.maintenance?.enabled) return false;
        const nd = parseDate(it.maintenance?.nextDate);
        return nd ? nd <= today : false;
    }).length;

    const warrantyAlerts = items.filter((it) => {
        if (!it.trackWarranty || !it.warrantyExpiry) return false;
        const exp = parseDate(it.warrantyExpiry);
        if (!exp) return false;
        const days = daysBetween(exp, today);
        // expiring in <= 30 days OR already expired
        return days <= 30;
    }).length;

    // Smart suggestion: pick the earliest expiring warranty within next 60 days
    const soon = items
        .filter((it) => it.trackWarranty && it.warrantyExpiry)
        .map((it) => ({ name: it.name, exp: parseDate(it.warrantyExpiry!)! }))
        .filter((o) => daysBetween(o.exp, today) <= 60)
        .sort((a, b) => a.exp.getTime() - b.exp.getTime());

    const suggestion = soon[0]
        ? `“${soon[0].name}” warranty ${daysBetween(soon[0].exp, today) >= 0 ? "expires" : "expired"} on ${soon[0].exp.toISOString().slice(0, 10)}`
        : null;

    // Eco impact (simple placeholder logic: each tracked item = 3kg saved / year)
    const ecoKgSaved = itemsCount * 3;

    return { itemsCount, maintDue, warrantyAlerts, suggestion, ecoKgSaved };
}
