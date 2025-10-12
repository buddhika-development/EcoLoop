const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const BASE = "https://generativelanguage.googleapis.com/v1beta";

export type EcoTip = { tip: string; category?: string };

export async function getEcoTipClient(topic = "lifecycle care"): Promise<EcoTip> {
    if (!GEMINI_KEY) throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY");

    const prompt = `
Return ONE concise, practical eco tip as JSON for the topic "${topic}".
Rules:
- 1–2 sentences max.
- Beginner-friendly, actionable.
- With emojis.
- Respond ONLY as JSON: {"tip":"...", "category":"..."}
`;

    const res = await fetch(
        `${BASE}/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.6, maxOutputTokens: 120 },
            }),
        }
    );

    console.log("Gemini response status:", res.status);
    const responseBody = await res.json();
    console.log("Gemini raw:", JSON.stringify(responseBody, null, 2));

    if (!res.ok) {
        const msg = responseBody?.error?.message || "Unknown Gemini error";
        throw new Error(`Gemini error: ${msg}`);
    }

    // ✅ extract text from candidates safely
    const text =
        responseBody?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    // Try to parse JSON, else fallback
    try {
        const obj = JSON.parse(text);
        console.log("✅ Parsed Gemini tip:", obj);
        return { tip: obj.tip ?? text, category: obj.category ?? "general" };
    } catch (err) {
        console.warn("⚠️ Gemini returned plain text, not JSON:", text);
        return { tip: text || "♻️ Maintain devices regularly to extend life.", category: "general" };
    }
}
