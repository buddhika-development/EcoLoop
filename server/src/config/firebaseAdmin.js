import admin from "firebase-admin";
import { FB_PROJECT_ID, FB_CLIENT_EMAIL, FB_PRIVATE_KEY, FB_STORAGE_BUCKET } from "./env.js";

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: FB_PROJECT_ID,
            clientEmail: FB_CLIENT_EMAIL,
            privateKey: FB_PRIVATE_KEY,
        }),
        storageBucket: FB_STORAGE_BUCKET,
    });
    console.log("[firebase] admin initialized");
}

export const fb = admin;
export const db = admin.firestore();
export const auth = admin.auth();
export const bucket = admin.storage().bucket();
