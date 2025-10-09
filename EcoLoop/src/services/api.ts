import axios from "axios";
import { auth } from "../lib/firebase";

export const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_BASE || "http://10.0.2.2:4000",
    timeout: 10000,
});

api.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
        const token = await user.getIdToken(); // auto-refresh handled by Firebase
        if (config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return config;
});
