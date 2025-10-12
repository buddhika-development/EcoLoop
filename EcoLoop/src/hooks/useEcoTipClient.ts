import * as React from "react";
import { EcoTip, getEcoTipClient } from "@/src/services/geminiClient";

export function useEcoTipClient(topic = "lifecycle care") {
    const [data, setData] = React.useState<EcoTip | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        let mounted = true;
        setLoading(true);
        getEcoTipClient(topic)
            .then((d) => mounted && setData(d))
            .catch((e) => mounted && setError(e.message || "error"))
            .finally(() => mounted && setLoading(false));
        return () => { mounted = false; };
    }, [topic]);

    return { data, loading, error };
}
