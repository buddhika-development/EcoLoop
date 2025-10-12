// src/lib/crypto.ts
import * as Crypto from "expo-crypto";

/**
 * NOTE (student demo):
 * We emulate a signature by hashing SECRET + ":" + payload.
 * For production, use a **real HMAC** on a server you control.
 */
const SECRET = process.env.EXPO_PUBLIC_QR_SECRET || "dev-secret-only";

/** Fast SHA256(hex) */
export async function sha256Hex(input: string) {
    return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input);
}

/** "HMAC-like" signature for demo */
export async function signPayloadHex(payload: string) {
    return sha256Hex(`${SECRET}:${payload}`);
}

/** Create an opaque deep-link token that only your app understands */
export async function makeQrToken(itemId: string, ownerUid: string) {
    const payloadObj = { i: itemId, o: ownerUid, v: 1 }; // item, owner, version
    const payload = JSON.stringify(payloadObj);
    const sig = await signPayloadHex(payload);
    const token = `ecoloop://item?d=${encodeURIComponent(payload)}&s=${sig}`;
    return { token, payload, sig };
}

/** Verify token integrity and return the parsed payload if valid */
export async function verifyAndParseToken(url: string):
    Promise<{ itemId: string; ownerUid: string } | null> {
    try {
        const u = new URL(url);
        if (u.protocol !== "ecoloop:") return null;
        const d = u.searchParams.get("d");
        const s = u.searchParams.get("s");
        if (!d || !s) return null;

        const expect = await signPayloadHex(d);
        if (expect !== s) return null;

        const parsed = JSON.parse(d) as { i: string; o: string; v: number };
        if (!parsed?.i || !parsed?.o) return null;
        return { itemId: parsed.i, ownerUid: parsed.o };
    } catch {
        return null;
    }
}


/** Backwards-compat: boolean verifier expected by older code */
export async function verifyQrToken(url: string): Promise<boolean> {
    return (await verifyAndParseToken(url)) !== null;
}

/** Convenience alias if you just want the payload (same as verifyAndParseToken) */
export async function parseQrToken(
    url: string
): Promise<{ itemId: string; ownerUid: string } | null> {
    return verifyAndParseToken(url);
}

/** Optional: anonymous id for public index docs (no raw token stored) */
export async function tokenIndexId(token: string) {
    // hash the full token so the index key doesn’t reveal itemId/uid
    return sha256Hex(token);
}
