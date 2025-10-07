import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMyItems, fetchItemById, createItem } from "./api";

export function useItemsQuery() {
    return useQuery({ queryKey: ["items"], queryFn: fetchMyItems });
}

export function useItemQuery(id: string) {
    return useQuery({ queryKey: ["item", id], queryFn: () => fetchItemById(id), enabled: !!id });
}

export function useCreateItemMutation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createItem,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["items"] }),
    });
}
