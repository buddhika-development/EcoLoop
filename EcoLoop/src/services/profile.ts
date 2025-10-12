// src/services/profile.ts
import { auth, db } from "@/src/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

type Address = {
    line1?: string;
    line2?: string;
    city?: string;
    postalCode?: string;
    country?: string;
};

export type UserProfile = {
    email: string;
    fullName: string;
    nic: string;
    phone?: string;
    dob?: string; // "YYYY-MM-DD"
    gender?: "male" | "female" | "other";
    address?: Address;
    profilePic?: string | null;
    createdAt?: any;
    updatedAt?: any;
};

// ---- helper: remove any `undefined` keys (recursively) ----
function pruneUndefinedDeep<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) {
        return obj.map(pruneUndefinedDeep) as unknown as T;
    }
    const entries = Object.entries(obj as Record<string, any>)
        .filter(([, v]) => v !== undefined) // drop undefined
        .map(([k, v]) => [k, pruneUndefinedDeep(v)]);
    return Object.fromEntries(entries) as T;
}

/**
 * Creates Auth user + writes /users/{uid} document.
 * Ensures no `undefined` values go to Firestore.
 */
export async function registerWithProfile(
    email: string,
    password: string,
    profile: Omit<UserProfile, "email" | "profilePic">
) {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const uid = cred.user.uid;

    // keep displayName in Auth
    if (profile.fullName) {
        await updateProfile(cred.user, { displayName: profile.fullName });
    }

    // Build the doc and prune undefineds (especially inside `address`)
    const docData = pruneUndefinedDeep({
        email,
        fullName: profile.fullName,
        nic: profile.nic,
        phone: profile.phone || null,
        dob: profile.dob || null,
        gender: profile.gender || null,
        address: profile.address
            ? {
                line1: profile.address.line1,
                line2: profile.address.line2, // will be removed if undefined
                city: profile.address.city,
                postalCode: profile.address.postalCode,
                country: profile.address.country,
            }
            : null,
        profilePic: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, "users", uid), docData);
    return uid;
}

export async function getMyProfile() {
    const uid = auth.currentUser?.uid;
    console.log("getMyProfile", { uid });
    if (!uid) throw new Error("Not signed in");
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? { id: snap.id, ...snap.data(), } : null;
}

export async function getUserProfile({ userId }: { userId: string }) {
    const uid = auth.currentUser?.uid;
    console.log("getUserProfile", { userId, uid });
    if (!uid) throw new Error("Not signed in");
    if (!userId) throw new Error("No userId provided");
    if (userId === uid) return getMyProfile(); // optional optimization
    const snap = await getDoc(doc(db, "users", userId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateMyProfile(partial: Partial<UserProfile>) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Not signed in");
    const payload = pruneUndefinedDeep({
        ...partial,
        updatedAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "users", uid), payload as any);
}

export async function updateMyProfilePic(url: string) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Not signed in");
    await updateDoc(doc(db, "users", uid), {
        profilePic: url,
        updatedAt: serverTimestamp(),
    });
    await updateProfile(auth.currentUser!, { photoURL: url });
}

export async function getUserProfile({ userId }: { userId: string }) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Not signed in");
    if (!userId) throw new Error("No userId provided");
    if (userId === uid) return getMyProfile(); // optional optimization
    const snap = await getDoc(doc(db, "users", userId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}