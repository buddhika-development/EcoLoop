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
  ];

  const hasMin = typeof filters.minPrice === "number";
  const hasMax = typeof filters.maxPrice === "number";

  if (tab === "sell" && (hasMin || hasMax)) {
    if (hasMin) constraints.push(where("price", ">=", filters.minPrice as number));
    if (hasMax) constraints.push(where("price", "<=", filters.maxPrice as number));
    // When using inequalities on price, first orderBy must match the field
    constraints.push(orderBy("price", "asc"));
    constraints.push(orderBy("createdAt", "desc"));
  } else {
    constraints.push(orderBy("createdAt", "desc"));
  }

  return query(base, ...constraints);
}
