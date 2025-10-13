// src/services/ecoImpactAI.ts
import * as Crypto from "expo-crypto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LifecycleItem } from "@/src/services/lifecycle";

const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const BASE = "https://generativelanguage.googleapis.com/v1beta";

export type EcoImpactAI = {
    totalKgSavedThisYear: number;       // total estimate for this year
    perItem?: { id: string; kg: number; note?: string }[];
    methodNote?: string;                // short explanation
};

// --- robust JSON helpers (same style you used for tips) ---
function stripCodeFence(s: string) {
    const fenced = s.match(/^```[\w-]*\n([\s\S]*?)\n```$/);
    if (fenced) return fenced[1].trim();
    return s.replace(/^```[\w-]*\n?/, "").replace(/```$/, "").trim();
}
function parseJsonLenient(s: string): any | null {
    try { return JSON.parse(s); } catch { }
    try { return JSON.parse(stripCodeFence(s)); } catch { }
    const m = s.match(/{[\s\S]*}/);
    if (m) { try { return JSON.parse(m[0]); } catch { } }
    return null;
}

// Keep the payload tiny & anonymous
function toAIPayload(items: LifecycleItem[]) {
    return items.map((it) => ({
        id: it.id,
        cat: it.category ?? "other",
        // age helps AI judge replacement timing
        purchaseYear: it.purchaseDate ? Number(it.purchaseDate.slice(0, 4)) : null,
        // signals longevity behaviors
        maintenanceEnabled: !!it.maintenance?.enabled,
        nextMaint: it.maintenance?.nextDate ?? null,
        // warranty can defer replacement
        warrantyMonths: it.warrantyMonths ?? 0,
        warrantyExpiry: it.warrantyExpiry ?? null,
    }));
}

async function sha256Hex(s: string) {
    return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, s);
}

/**
 * Calls Gemini to estimate e-waste avoided (kg) for this year based on items kept & maintained.
 * Caches per inventory hash so you don’t re-hit the API unnecessarily.
 */
export async function getEcoImpactAI(items: LifecycleItem[]): Promise<EcoImpactAI | null> {
    if (!GEMINI_KEY) return null; // quietly skip if key missing

    const payload = toAIPayload(items);
    const signature = await sha256Hex(JSON.stringify(payload));
    const CACHE_KEY = `ecoImpactAI:${signature}`;

    // 1) cache check
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
        try { return JSON.parse(cached) as EcoImpactAI; } catch { }
    }

    // 2) build prompt (Sri Lanka context + strict JSON)
    const prompt = `
You are estimating **e-waste avoided this year** (in kilograms) for Sri Lankan households.
User gives an anonymized inventory of items they are keeping/maintaining (not throwing away).

Return **strict JSON** with:
{
  "totalKgSavedThisYear": <number>,
  "perItem": [{"id":"<id>","kg":<number>,"note":"<short why>"}...],
  "methodNote": "<1 sentence about assumptions>"
}

Assumptions:
- Typical weights by category (Sri Lanka context): 
  home-appliance (12–70kg), electronics (0.2–8kg), office-equipment (2–20kg), furniture (10–50kg), other (0.5–5kg).
- If maintenance is enabled or warranty active, the item is likely to be **kept** this year (avoids replacement → avoids e-waste).
- If purchase year is recent (≤ 2 years), assume near-zero avoided e-waste this year (not end-of-life yet).
- Cap per-item yearly savings to a reasonable fraction of typical weight (e.g., 10–50%), unless an item is clearly at end-of-life but got repaired.
- Keep numbers realistic and conservative.

NEVER include comments or Markdown. Respond only JSON.

Inventory:
${JSON.stringify(payload)}
`;

    // 3) call Gemini
    const res = await fetch(`${BASE}/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.4,         // keep estimates stable
                topP: 0.9,
                topK: 40,
                maxOutputTokens: 200
            }
        }),
    });

    const body = await res.json();
    if (!res.ok) {
        console.warn("ecoImpactAI error:", body?.error?.message || body);
        return null;
    }

    const text: string = body?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    const parsed = parseJsonLenient(text);
    if (!parsed || typeof parsed !== "object") return null;

    const total = Number(parsed.totalKgSavedThisYear ?? 0);
    const perItem = Array.isArray(parsed.perItem) ? parsed.perItem : [];
    const methodNote = typeof parsed.methodNote === "string" ? parsed.methodNote : undefined;

    const result: EcoImpactAI = {
        totalKgSavedThisYear: Number.isFinite(total) ? total : 0,
        perItem: perItem
            .filter((x: any) => x && typeof x.id === "string")
            .map((x: any) => ({ id: x.id, kg: Number(x.kg) || 0, note: x.note })),
        methodNote,
    };

    // 4) cache
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(result));

    return result;
}
