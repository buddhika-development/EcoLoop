import { auth } from "../config/firebaseAdmin.js";

export async function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization || "";
        const token = header.startsWith("Bearer ") ? header.slice(7) : null;
        if (!token) return res.status(401).json({ ok: false, error: "Missing token" });
        const decoded = await auth.verifyIdToken(token);
        req.user = { uid: decoded.uid, email: decoded.email };
        next();
    } catch {
        res.status(401).json({ ok: false, error: "Invalid token" });
    }
}
