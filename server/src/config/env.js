import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 4000;
export const CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

export const FB_PROJECT_ID = process.env.FB_PROJECT_ID;
export const FB_CLIENT_EMAIL = process.env.FB_CLIENT_EMAIL;
export const FB_PRIVATE_KEY = (process.env.FB_PRIVATE_KEY || "").replace(/\\n/g, "\n");
export const FB_STORAGE_BUCKET = process.env.FB_STORAGE_BUCKET;
