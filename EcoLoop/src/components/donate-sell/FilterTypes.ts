export type Tab = "sell" | "donate";

export type FilterState = {
  category?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
};
