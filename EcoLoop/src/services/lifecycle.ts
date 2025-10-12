// src/services/lifecycle.ts
import { auth, db } from "@/src/lib/firebase";
import {
    collection, getDocs, onSnapshot, query, where,
    Timestamp, doc, updateDoc, serverTimestamp,
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
        title?: string;
        frequency?: "monthly" | "quarterly" | "yearly" | "custom" | "none";
        firstDate?: string | null;       // "YYYY-MM-DD"
        nextDate?: string | null;        // "YYYY-MM-DD"
        time?: string | null;            // "HH:mm"
        enabled?: boolean;
    };
    images?: string[];
    documents?: string[];
    createdAt?: any;
};

// ---------------------------------
// Helpers used across lifecycle UI
// ---------------------------------
export type Rule = "none" | "q3" | "q6" | "yearly";

const parseDate = (s?: string) => (s ? new Date(s + "T00:00:00") : undefined);
const daysBetween = (a: Date, b: Date) => Math.ceil((a.getTime() - b.getTime()) / 86400000);
const fmt = (d: Date) => d.toISOString().slice(0, 10);

export function addMonths(iso: string, months: number) {
    const d = new Date(iso + "T00:00:00");
    const nd = new Date(d);
    nd.setMonth(nd.getMonth() + months);
    // clamp month overflow (e.g., Jan 31 + 1m)
    if (nd.getDate() !== d.getDate()) nd.setDate(0);
    return fmt(nd);
}

/** Roll the next date forward based on rule and firstDate. */
export function computeNextDate(rule: Rule, firstDate?: string | null) {
    if (!firstDate) return null;
    const today = fmt(new Date());
    if (firstDate >= today) return firstDate;

    const step = rule === "q3" ? 3 : rule === "q6" ? 6 : rule === "yearly" ? 12 : 0;
    if (step === 0) return null;

    let d = firstDate;
    while (d < today) d = addMonths(d, step);
    return d;
}

/** Create a JS Date from an ISO date (YYYY-MM-DD) + time string (HH:mm). */
export function combineDateTime(isoDate: string, hhmm: string) {
    const [hh, mm] = hhmm.split(":").map(Number);
    const d = new Date(`${isoDate}T00:00:00`);
    d.setHours(hh ?? 0, mm ?? 0, 0, 0);
    return d;
}

/**
 * Persist maintenance settings *into the item document*.
 * We keep a simple embedded object at items/<id>.maintenance
 */
export async function saveMaintenanceForItem(
    itemId: string,
    opts: { title: string; firstDate: string; time: string; rule: Rule; enabled: boolean }
) {
    const nextDate = computeNextDate(opts.rule, opts.firstDate);
    const ref = doc(db, "items", itemId);

    await updateDoc(ref, {
        maintenance: {
            title: opts.title,
            enabled: opts.enabled,
            firstDate: opts.firstDate,
            time: opts.time,
            // map our compact Rule -> the strings you already use in docs
            frequency:
                opts.rule === "q3" ? "quarterly"
                    : opts.rule === "q6" ? "custom"     // you previously used "custom" for 6m
                        : opts.rule === "yearly" ? "yearly"
                            : "none",
            nextDate: nextDate ?? null,
        },
        updatedAt: serverTimestamp(),
    });
}

// ---------------------------------
// Live stats for the signed-in user
// ---------------------------------
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
export function computeStats(items: LifecycleItem[]) {
    const today = new Date();

    const itemsCount = items.length;

    const maintDue = items.filter((it) => {
        if (!it.maintenance?.enabled) return false;
        const nd = parseDate(it.maintenance?.nextDate ?? undefined);
        return nd ? nd <= today : false;
    }).length;

    const warrantyAlerts = items.filter((it) => {
        if (!it.trackWarranty || !it.warrantyExpiry) return false;
        const exp = parseDate(it.warrantyExpiry);
        if (!exp) return false;
        const days = daysBetween(exp, today);
        return days <= 30; // expiring in <= 30 days or already expired
    }).length;

    const soon = items
        .filter((it) => it.trackWarranty && it.warrantyExpiry)
        .map((it) => ({ name: it.name, exp: parseDate(it.warrantyExpiry!)! }))
        .filter((o) => daysBetween(o.exp, today) <= 60)
        .sort((a, b) => a.exp.getTime() - b.exp.getTime());

    const suggestion = soon[0]
        ? `“${soon[0].name}” warranty ${daysBetween(soon[0].exp, today) >= 0 ? "expires" : "expired"} on ${soon[0].exp.toISOString().slice(0, 10)}`
        : null;

    // simple placeholder: each tracked item = 3kg saved / year
    const ecoKgSaved = itemsCount * 3;

    return { itemsCount, maintDue, warrantyAlerts, suggestion, ecoKgSaved };
}
