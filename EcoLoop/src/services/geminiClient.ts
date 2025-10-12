// services/geminiClient.ts
const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const BASE = "https://generativelanguage.googleapis.com/v1beta";

export type EcoTip = { tip: string; category?: string };

// --- helpers ---
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

/**
 * Ask for a *new* tip each time by:
 *  - rotating subtopics (energy/water/repair/e-waste/food/transport/cleaning)
 *  - passing up to N recent tips so the model avoids semantic repeats
 *  - nudging creativity via temperature/topP/topK
 */
export async function getEcoTipClient(
    topic = "Lifecycle Care tips for Sri Lankans about household items",
    recentTips: string[] = [],              // <-- pass your last N tips here
    region = "Sri Lanka",                   // helps localize advice
): Promise<EcoTip> {

    if (!GEMINI_KEY) throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY");

    // Rotate micro-topics to diversify what you get over time.
    const MICRO_TOPICS = [
        "energy efficiency at home",
        "water saving",
        "repair & maintenance",
        "e-waste handling & recycling",
        "appliance usage habits",
        "food storage to reduce waste",
        "cleaning & detergents",
        "safe disposal (batteries, bulbs)",
        "buying durable products",
        "extending device lifespan"
    ];
    const dayIndex = Math.floor(Date.now() / (24 * 60 * 60 * 1000));
    const chosenMicro = MICRO_TOPICS[dayIndex % MICRO_TOPICS.length];

    // Keep the recent list short so the prompt stays small
    const recent = recentTips.slice(-6);
    const recentBlock = recent.length
        ? `Avoid repeating or paraphrasing these recent tips (or anything too similar):\n- ${recent.join("\n- ")}\n\n`
        : "";

    // Strong instructions for JSON + novelty + locality.
    const prompt = `
Return ONE concise, practical eco tip as **strict JSON** for the topic:
"${topic}" (micro-focus today: "${chosenMicro}") in ${region}.

${recentBlock}Requirements:
- A *new*, non-obvious, non-repetitive tip that differs meaningfully from the recent list.
- 1–2 sentences max, beginner-friendly, actionable.
- Contextualized for everyday Sri Lankan households (availability, climate, costs).
- Include 1–2 relevant emojis (but keep it professional).
- Don't mention this prompt, "recent tips", or meta commentary.

Respond ONLY as JSON like:
{"tip":"...", "category":"<one of: energy, water, repair, e-waste, usage, food, cleaning, disposal, buying, lifespan>"}
`;

    const res = await fetch(
        `${BASE}/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.85,   // a bit more creative than 0.6
                    topP: 0.95,
                    topK: 40,
                    maxOutputTokens: 120,
                },
            }),
        }
    );

    const body = await res.json();
    if (!res.ok) {
        const msg = body?.error?.message || "Unknown Gemini error";
        throw new Error(`Gemini error: ${msg}`);
    }

    const text: string = body?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    const obj = parseJsonLenient(text);

    if (obj && typeof obj === "object") {
        const tip = typeof obj.tip === "string" ? obj.tip : null;
        const category = typeof obj.category === "string" ? obj.category : undefined;
        if (tip) return { tip, category: category ?? "general" };
    }

    const fallback = stripCodeFence(text) || "♻️ Repair first, replace later—small fixes can add years to a device’s life.";
    return { tip: fallback, category: "general" };
}