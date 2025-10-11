// src/services/market.ts
import { auth, db } from "@/src/lib/firebase";
import {
  collection, query, where, orderBy, getDocs,
  addDoc, doc, serverTimestamp, DocumentReference
} from "firebase/firestore";

export type ListingType = "sell" | "donate";

export type MyItem = {
  id: string;
  ownerUid: string;
  model: string;      
  name?: string;
  brand?: string;
  
};

export async function fetchMyItemsForDropdown(): Promise<MyItem[]> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Not signed in");
  // equality + orderBy is fine without composite index
  const q = query(
    collection(db, "items"),
    where("ownerUid", "==", uid),
    orderBy("model", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function createListing(
  itemId: string,
  type: ListingType,
  price?: number | null
) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Not signed in");

  const itemRef = doc(db, "items", itemId) as DocumentReference;

  return addDoc(collection(db, "listings"), {
    ownerUid: uid,
    itemRef,
    type,
    price: type === "donate" ? null : (price ?? null),
    status: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
