// src/hooks/useMyItems.ts
import { useEffect, useMemo, useState } from "react";
import { onSnapshot, collection, query, where, orderBy } from "firebase/firestore";
import { auth, db } from "@/src/lib/firebase";

export type ItemDoc = {
    id: string;
    ownerUid: string;
    name: string;
    category: "home-appliance" | "electronics" | "office-equipment" | "furniture" | "other";
    brand?: string | null;
    model?: string | null;
    description?: string | null;
    purchaseDate?: string | null;        // YYYY-MM-DD
    warrantyMonths?: number | null;      // example: 24
    warrantyExpiry?: string | null;      // YYYY-MM-DD (optional override)
    trackWarranty?: boolean;
    maintenance?: {
        frequency?: "monthly" | "quarterly" | "yearly" | "custom" | "none";
        firstDate?: string | null;
        time?: string | null;
        enabled?: boolean;
        nextDate?: string | null;
    };
    images?: string[];                   // first image used as cover
    documents?: string[];
    createdAt?: any;
    status?: "active" | "saving" | "archived";
    qrCode?: string | null;
    qrToken?: string | null;
};

export function useMyItems() {
    const [items, setItems] = useState<ItemDoc[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (!uid) {
            setItems([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "items"),
            where("ownerUid", "==", uid),
            orderBy("createdAt", "desc")
        );

        const unsub = onSnapshot(q, (snap) => {
            const list: ItemDoc[] = [];
            snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
            setItems(list);

            console.log("Fetched items:", list);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    return { items, loading };
}
