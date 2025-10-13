// src/hooks/useLifecycleStats.ts
import { useEffect, useState } from "react";
import { computeStats, listenUserItems, LifecycleItem } from "@/src/services/lifecycle";
import { getEcoImpactAI } from "@/src/services/ecoImpactAI";

export function useLifecycleStats() {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState<LifecycleItem[]>([]);
    const [stats, setStats] = useState({
        itemsCount: 0,
        maintDue: 0,
        warrantyAlerts: 0,
        suggestion: null as string | null,
        ecoKgSaved: 0,                // client fallback
        ecoMethodNote: null as string | null,
    });

    useEffect(() => {
        let unsub: (() => void) | undefined;
        try {
            unsub = listenUserItems(async (list) => {
                setItems(list);
                // 1) compute fast local stats
                const s = computeStats(list);
                setStats((prev) => ({
                    ...prev,
                    itemsCount: s.itemsCount,
                    maintDue: s.maintDue,
                    warrantyAlerts: s.warrantyAlerts,
                    suggestion: s.suggestion,
                    ecoKgSaved: s.ecoKgSaved,     // fallback immediately
                    ecoMethodNote: null,
                }));
                setLoading(false);

                // 2) kick off AI refinement (non-blocking)
                try {
                    const ai = list.length ? await getEcoImpactAI(list) : null;
                    if (ai) {
                        setStats((prev) => ({
                            ...prev,
                            ecoKgSaved: Math.max(0, Math.round(ai.totalKgSavedThisYear)),
                            ecoMethodNote: ai.methodNote ?? null,
                        }));
                    }
                } catch (e) {
                    console.warn("ecoImpactAI failed; using fallback", e);
                }
            });
        } catch (e) {
            console.warn(e);
            setLoading(false);
        }
        return () => unsub?.();
    }, []);

    return { loading, items, ...stats };
}
