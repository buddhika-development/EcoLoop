// src/features/repair-recycle/hooks.ts
import { useEffect, useMemo, useState } from "react";
import * as Location from "expo-location";
import { getShopById, listShops, Shop, ShopQuery } from "./api";

/**
 * Debounce any value — good for search inputs.
 */
export function useDebounce<T>(value: T, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/**
 * Get current device location (foreground permission).
 * NOTE: works on real devices/emulators with location enabled.
 */
export function useCurrentLocation() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Location permission not granted");
          setLoading(false);
          return;
        }
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      } catch (e: any) {
        setError(e?.message || "Failed to get location");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { coords, error, loading };
}

/**
 * Fetch shops list using Firestore repo.
 * - Accepts ShopQuery (q, type, categories, rating_gte, openNow, lat/lng/radiusKm)
 */
export function useShops(
  query: ShopQuery,
  opts?: {
    attachUserLocation?: boolean; // auto include user coords into query
    refreshKey?: any;             // change this value to force refetch
  }
) {
  const { coords } = useCurrentLocation(); // optional; safe to ignore if you don't want auto-lat/lng
  const [data, setData] = useState<(Shop & { openNow?: boolean; distanceKm?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Build final params
  const params = useMemo<ShopQuery>(() => {
    if (opts?.attachUserLocation && coords) {
      return { ...query, lat: coords.lat, lng: coords.lng };
    }
    return query;
  }, [query, coords, opts?.attachUserLocation]);

  const refresh = async () => {
    try {
      setLoading(true);
      const res = await listShops(params);
      setData(res);
      setErr(null);
    } catch (e: any) {
      setErr(e?.message || "Failed to fetch shops");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params), opts?.refreshKey]);

  return { data, loading, error: err, refresh, userCoords: coords };
}

/**
 * Fetch a single shop by id.
 */
export function useShop(id?: string) {
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [err, setErr] = useState<string | null>(null);

  const refresh = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await getShopById(id);
      setShop(res);
      setErr(null);
    } catch (e: any) {
      setErr(e?.message || "Failed to fetch shop");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return { shop, loading, error: err, refresh };
}
