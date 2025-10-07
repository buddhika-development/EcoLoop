import axios from "axios";
export const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_BASE || "http://10.0.2.2:4000",
    timeout: 10000,
});
