import React, { createContext, useContext, useMemo, useState } from "react";
import type { LocalFile } from "@/src/types/media";

export type WizardDraft = {
    // step 1 (example; keep your existing)
    name?: string;
    category?: "home-appliance" | "electronics" | "office-equipment" | "furniture" | "other";
    brand?: string;
    model?: string;
    description?: string;

    // step 2
    purchaseDate?: string;       // YYYY-MM-DD
    warrantyMonths?: number;
    warrantyExpiry?: string;     // YYYY-MM-DD
    trackWarranty?: boolean;

    // step 3 (local selections held until final save)
    imagesLocal?: LocalFile[];
    docsLocal?: LocalFile[];

    // step 4
    maintenance?: {
        frequency?: "monthly" | "quarterly" | "yearly" | "custom" | "none";
        firstDate?: string;        // YYYY-MM-DD
        time?: string;             // HH:mm
        enabled?: boolean;
        nextDate?: string;         // computed later
    };
};

type WizardContextType = {
    draft: WizardDraft;
    setPartial: (patch: Partial<WizardDraft>) => void;
    reset: () => void;
};

const WizardContext = createContext<WizardContextType>({
    draft: {},
    setPartial: () => { },
    reset: () => { },
});

export function AddItemWizardProvider({ children }: { children: React.ReactNode }) {
    const [draft, setDraft] = useState<WizardDraft>({});

    const setPartial = (patch: Partial<WizardDraft>) =>
        setDraft((prev) => ({ ...prev, ...patch }));

    const reset = () => setDraft({});

    const value = useMemo(() => ({ draft, setPartial, reset }), [draft]);

    return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export const useAddItemWizard = () => useContext(WizardContext);
