// src/features/repair-recycle/reviews.ts
import { db } from "@/src/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

export type Review = {
  id: string;
  userId: string;
  displayName?: string;
  stars: number;     // 1..5
  comment?: string;
  createdAt: any;    // Timestamp
};

/**
 * List recent reviews. We return as-is (latest first).
 * "My review first" sorting is handled in the screen (needs current user).
 */
export async function listRecentReviews(shopId: string, take = 5): Promise<Review[]> {
  const col = collection(db, "shops", shopId, "shopReviews");
  const q = query(col, orderBy("createdAt", "desc"), limit(take));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

/** Compute aggregate (sum, count, avg) by scanning reviews. */
export async function computeShopRatingFromReviews(shopId: string) {
  const col = collection(db, "shops", shopId, "shopReviews");
  const q = query(col); // all reviews (OK for MVP/class project)
  const snap = await getDocs(q);

  let sum = 0, count = 0;
  snap.forEach((d) => {
    const stars = Number((d.data() as any)?.stars);
    if (Number.isFinite(stars)) { sum += stars; count += 1; }
  });

  const avg = count > 0 ? Number((sum / count).toFixed(2)) : 0;
  return { sum, count, avg };
}

/** Create a review then recompute & store shop.rating (sum/count/avg). */
export async function createReviewAndUpdateShopRating(
  shopId: string,
  payload: { userId: string; displayName?: string; stars: number; comment?: string }
) {
  const col = collection(db, "shops", shopId, "shopReviews");
  await addDoc(col, {
    ...payload,
    createdAt: serverTimestamp(),
  });

  const { sum, count, avg } = await computeShopRatingFromReviews(shopId);
  await updateDoc(doc(db, "shops", shopId), { rating: { sum, count, avg } });

  return { sum, count, avg };
} 

/** Delete a review (author-only via rules) then recompute & store aggregate. */
export async function deleteReviewAndUpdateShopRating(shopId: string, reviewId: string) {
  await deleteDoc(doc(db, "shops", shopId, "shopReviews", reviewId));

  const { sum, count, avg } = await computeShopRatingFromReviews(shopId);
  await updateDoc(doc(db, "shops", shopId), { rating: { sum, count, avg } });

  return { sum, count, avg };
}
