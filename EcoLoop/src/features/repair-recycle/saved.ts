// src/features/repair-recycle/saved.ts
import { db } from "@/src/lib/firebase";
import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc, serverTimestamp,
} from "firebase/firestore";
import { getShopById, type ShopView } from "./api";

const colPath = (uid: string) => collection(db, "user_saved_shops", uid, "shops");
const docPath = (uid: string, shopId: string) => doc(db, "user_saved_shops", uid, "shops", shopId);

export async function saveShop(uid: string, shopId: string) {
  await setDoc(docPath(uid, shopId), {
    shopId,
    savedAt: serverTimestamp(),
  }, { merge: true });
}

export async function unsaveShop(uid: string, shopId: string) {
  await deleteDoc(docPath(uid, shopId));
}

export async function isShopSaved(uid: string, shopId: string): Promise<boolean> {
  const d = await getDoc(docPath(uid, shopId));
  return d.exists();
}

export async function listSavedShopIds(uid: string): Promise<string[]> {
  const snap = await getDocs(colPath(uid));
  return snap.docs.map(d => (d.data()?.shopId as string)).filter(Boolean);
}

export async function listSavedShops(uid: string): Promise<ShopView[]> {
  const ids = await listSavedShopIds(uid);
  const shops = await Promise.all(ids.map(id => getShopById(id)));
  // filter nulls and tag openNow like in your api list (getShopById returns Shop|null)
  return (shops.filter(Boolean) as any[]).map((s) => ({
    ...s,
    openNow: undefined,       // optional: could compute if needed
  })) as ShopView[];
}
