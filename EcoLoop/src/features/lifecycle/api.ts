import { api } from "../../services/api";

export async function fetchMyItems() {
    const { data } = await api.get("/lifecycle/items");
    return data?.data ?? [];
}

export async function fetchItemById(id: string) {
    const { data } = await api.get(`/lifecycle/items/${id}`);
    return data?.data;
}

export async function createItem(payload: any) {
    const { data } = await api.post("/lifecycle/items", payload);
    return data?.data;
}
