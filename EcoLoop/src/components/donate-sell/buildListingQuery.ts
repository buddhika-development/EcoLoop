import { collection, query, where, orderBy, type QueryConstraint } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import type { Tab, FilterState } from "./FilterTypes";

export function buildListingQuery(
  db: Firestore,
  tab: Tab,
  filters: FilterState
) {
  const base = collection(db, "listings");

  const constraints: QueryConstraint[] = [
    where("status", "==", "active"),
    where("type", "==", tab),
    orderBy("createdAt", "desc"),
  ];

  // Category: assumes you denormalized `category` onto the listing.
  // If category lives only on the item doc, add it to listings on create (recommended).
  if (filters.category && filters.category !== "all") {
    constraints.push(where("category", "==", filters.category));
  }

  // Price filters for SELL only
  if (tab === "sell") {
    if (typeof filters.minPrice === "number") {
      constraints.push(where("price", ">=", filters.minPrice));
    }
    if (typeof filters.maxPrice === "number") {
      constraints.push(where("price", "<=", filters.maxPrice));
    }
  }

  return query(base, ...constraints);
}
