import { db } from "@/src/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  DocumentData,
  Query,
} from "firebase/firestore";

const DAY_KEYS = ["sun","mon","tue","wed","thu","fri","sat"] as const;

function normalizeHours(raw: any) {
  type Interval = { open: string; close: string };
  const out: Record<string, Interval[]> = {};

  if (!raw || typeof raw !== "object") {
    for (const d of DAY_KEYS) out[d] = [];
    return out;
  }

  for (const k of Object.keys(raw)) {
    const key = k.slice(0,3).toLowerCase(); 
    const val = raw[k];

    const pushIfValid = (o: any, arr: Interval[]) => {
      const open = (o?.open ?? "").trim();
      const close = (o?.close ?? "").trim();
      if (open && close) arr.push({ open, close });
    };

    const list: Interval[] = [];

    if (Array.isArray(val)) {
      // [{open,close}] or ["10:00-22:00"]
      for (const item of val) {
        if (item && typeof item.open === "string" && typeof item.close === "string") {
          pushIfValid(item, list);
        } else if (typeof item === "string") {
          const parts = item.replace("–","-").split("-");
          if (parts.length === 2) {
            const o = parts[0].trim(), c = parts[1].trim();
            if (o && c) list.push({ open: o, close: c });
          }
        }
      }
    } else if (val && typeof val === "object") {
      // {open:"HH:mm", close:"HH:mm"}  
      pushIfValid(val, list);
    } else if (typeof val === "string") {
      // "10:00-22:00"
      const parts = val.replace("–","-").split("-");
      if (parts.length === 2) {
        const o = parts[0].trim(), c = parts[1].trim();
        if (o && c) list.push({ open: o, close: c });
      }
    }

    out[key] = list;
  }

  for (const d of DAY_KEYS) if (!out[d]) out[d] = [];
  return out;
}

/** ---------- Types ---------- */
export type DayInterval = { open: string; close: string };

export type Shop = {
  id: string;
  name: string;
  type: "repair" | "recycle";
  categories: string[];
  contact?: { phone?: string; email?: string };
  address?: string;
  location: { lat: number; lng: number };
  hours: Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", DayInterval[]>;
  rating?: { avg: number; count: number };
  logoUrl?: string;
  createdAt?: string | number;
  updatedAt?: string | number;
};

export type ShopQuery = {
  q?: string;
  type?: "repair" | "recycle" | "both";
  categories?: string[];
  rating_gte?: number;
  openNow?: boolean;
  lat?: number;
  lng?: number;
  radiusKm?: number;
};

export type ShopView = Shop & {
  openNow?: boolean;
  distanceKm?: number;
};

/** ---------- Helpers ---------- */
function normStr(s?: string) {
  return (s || "").toLowerCase().trim();
}

function nameMatches(q: string | undefined, name: string) {
  if (!q) return true;
  return normStr(name).includes(normStr(q));
}

function categoriesMatch(filter: string[] | undefined, cats: string[]) {
  if (!filter || filter.length === 0) return true;
  const set = new Set(cats.map(normStr));
  return filter.some((c) => set.has(normStr(c)));
}

function ratingOk(min: number | undefined, rating?: { avg?: number }) {
  if (!min) return true;
  if (!rating || typeof rating.avg !== "number") return false;
  return rating.avg >= min;
}

function toMins(t: string) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t);
  if (!m) return NaN;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

export function isOpenNow(hours: Record<string, DayInterval[]>) {
  try {
    const now = new Date();
    const dayIdx = now.getDay(); // 0=Sun
    const key = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][dayIdx];
    const prevKey = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"][dayIdx];
    const minsNow = now.getHours() * 60 + now.getMinutes();

    const inIntervals = (list: DayInterval[], overnightOnly = false) =>
      list?.some((x) => {
        const a = toMins(x.open);
        const b = toMins(x.close);
        if (isNaN(a) || isNaN(b)) return false;
        // overnight window (e.g., 18:00 -> 02:00)
        if (b < a) {
          return overnightOnly ? minsNow < b : minsNow >= a || minsNow < b;
        }
        if (overnightOnly) return false;
        return minsNow >= a && minsNow < b;
      });

    const today = (hours?.[key] || []) as DayInterval[];
    const prev = (hours?.[prevKey] || []) as DayInterval[];

    return inIntervals(today) || inIntervals(prev, true);
  } catch {
    return false;
  }
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** ---------- Firestore mapping ---------- */
function toShop(id: string, data: DocumentData): Shop {
  return {
    id,
    name: data.name,
    type: data.type,
    categories: data.categories || [],
    contact: data.contact,
    address: data.address,
    location: data.location,
    hours: normalizeHours(data.hours),
    rating: data.rating,
    logoUrl: data.logoUrl,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/** ---------- Repo functions ---------- */
export async function listShops(params: ShopQuery = {}): Promise<ShopView[]> {
  const colRef = collection(db, "shops");
  let qRef: Query<DocumentData> = colRef as unknown as Query<DocumentData>;

  // Optional server-side type filter
  /*if (params.type === "repair") {
    qRef = query(colRef, where("type", "==", "repair"));
  } else if (params.type === "recycle") {
    qRef = query(colRef, where("type", "==", "recycle"));
  }*/

  const snap = await getDocs(qRef);
  const items: Shop[] = snap.docs.map((d) => toShop(d.id, d.data()));

  // Client-side filters
  let out: ShopView[] = items.filter((s) =>
    nameMatches(params.q, s.name) &&
    categoriesMatch(params.categories, s.categories) &&
    ratingOk(params.rating_gte, s.rating)
  );

  // openNow
  if (params.openNow) {
    out = out.filter((s) => isOpenNow(s.hours as any));
  }

  // distance & radius
  if (params.lat != null && params.lng != null) {
    out = out
      .map((s) => {
        const hasLoc = s.location && typeof s.location.lat === "number" && typeof s.location.lng === "number";
        const dist = hasLoc ? haversineKm(params.lat!, params.lng!, s.location.lat, s.location.lng) : undefined;
        return { ...s, distanceKm: dist };
      })
      .sort((a, b) => (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY));

    if (params.radiusKm && params.radiusKm > 0) {
      out = out.filter((s) => (s.distanceKm ?? Infinity) <= params.radiusKm!);
    }
  }

  // Tag open flag on every item (useful for cards)
  out = out.map((s) => ({ ...s, openNow: isOpenNow(s.hours as any) }));
  return out;
}

export async function getShopById(id: string): Promise<Shop | null> {
  const ref = doc(db, "shops", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return toShop(snap.id, snap.data());
}
