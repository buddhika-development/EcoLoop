// src/services/reminders.ts
import type { ItemDoc } from "@/src/hooks/useMyItems";
import { updateItemPartial } from "@/src/services/item";

export type ReminderKind = "maintenance" | "warranty";

export type ReminderRow = {
    // stable unique id for FlatList key: `${kind}:${itemId}`
    id: string;
    kind: ReminderKind;
    itemId: string;
    itemName: string;

    // human display
    title: string;         // e.g. "Maintenance due" / "Warranty ends"
    date: string;          // "YYYY-MM-DD"
    time?: string | null;  // "HH:mm" (maintenance only)

    // for sorting (more recent first)
    sortKey: string; // `${date}T${time ?? "00:00"}`
};

/** Build reminders from user's items (derived client-side). */
export function buildRemindersFromItems(items: ItemDoc[]): ReminderRow[] {
    const rows: ReminderRow[] = [];

    for (const it of items) {
        // Maintenance reminder
        if (it.maintenance?.enabled && it.maintenance?.nextDate) {
            rows.push({
                id: `maintenance:${it.id}`,
                kind: "maintenance",
                itemId: it.id,
                itemName: it.name ?? "Item",
                title: "Maintenance due",
                date: it.maintenance.nextDate,
                time: it.maintenance.time ?? null,
                sortKey: `${it.maintenance.nextDate}T${it.maintenance.time ?? "00:00"}`,
            });
        }

        // Warranty reminder
        if (it.trackWarranty && it.warrantyExpiry) {
            rows.push({
                id: `warranty:${it.id}`,
                kind: "warranty",
                itemId: it.id,
                itemName: it.name ?? "Item",
                title: "Warranty ends",
                date: it.warrantyExpiry,
                time: null,
                sortKey: `${it.warrantyExpiry}T00:00`,
            });
        }
    }

    // newest date first
    rows.sort((a, b) => (a.sortKey < b.sortKey ? 1 : -1));
    return rows;
}

/** Dismiss/delete a reminder in a simple, predictable way */
export async function dismissReminder(itemId: string, kind: ReminderKind) {
    if (kind === "maintenance") {
        // simplest UX: turn maintenance reminders off for that item
        await updateItemPartial(itemId, { maintenance: { enabled: false } as any });
        return;
    }
    if (kind === "warranty") {
        // simplest UX: stop tracking warranty reminder for that item
        await updateItemPartial(itemId, { trackWarranty: false } as any);
        return;
    }
}
