import { useEffect, useState } from "react";
import { computeStats, listenUserItems, LifecycleItem } from "@/src/services/lifecycle";

export function useLifecycleStats() {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<LifecycleItem[]>([]);
    const [stats, setStats] = useState({
        itemsCount: 0,
        maintDue: 0,
        warrantyAlerts: 0,
        suggestion: null as string | null,
        ecoKgSaved: 0,
    });

    useEffect(() => {
        let unsub: (() => void) | undefined;
        try {
            unsub = listenUserItems((list) => {
                setItems(list);
                setStats(computeStats(list));
                setLoading(false);
            });
        } catch (e) {
            console.warn(e);
            setLoading(false);
        }
        return () => unsub?.();
    }, []);

    return { loading, items, ...stats };
}
