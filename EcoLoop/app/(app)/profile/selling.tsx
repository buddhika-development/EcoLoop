// app/(app)/profile/selling.tsx  (or your current path for this screen)
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  type DocumentReference,
  type DocumentData,
} from "firebase/firestore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { db } from "@/src/lib/firebase";
import { colors } from "@/src/theme/colors";

type ItemDoc = {
  name?: string;
  images?: string[];
  image?: string;
  model?: string;
  brand?: string;
  title?: string;
  productName?: string;
  displayName?: string;
};

type ListingDoc = {
  id: string;
  ownerUid: string;
  itemRef: string | DocumentReference<DocumentData>;
  type: "sell" | "donate";
  price: number | null;
  status: "active" | "inactive";
};

type JoinedRow = {
  id: string;
  title: string;
  type: "sell" | "donate";
  price: number | null;
};

const formatLKR = (n: number) =>
  `Rs. ${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

function cardShadow() {
  return Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 2 },
  });
}

function TypeBadge({ type }: { type: "sell" | "donate" }) {
  const isSell = type === "sell";
  const bg = isSell ? "#E7F0FF" : "#EAF7EA";
  const color = isSell ? "#1D4ED8" : "#16A34A";
  const iconName = isSell ? "pricetag-outline" : "gift-outline";
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Ionicons name={iconName as any} size={22} color={color} />
    </View>
  );
}

export default function SellingItems() {
  const insets = useSafeAreaInsets();
  const [rows, setRows] = useState<JoinedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const normalizePath = (p: string) =>
    p.trim().replace(/^\/+/, "").replace(/\/+/g, "/");

  async function fetchItemDocFlexible(
    itemRef: string | DocumentReference<DocumentData>
  ): Promise<ItemDoc | null> {
    try {
      if (!itemRef) return null;

      if (typeof itemRef !== "string") {
        const snap = await getDoc(itemRef);
        return snap.exists() ? (snap.data() as ItemDoc) : null;
      }

      const ref = doc(db, normalizePath(itemRef));
      const snap = await getDoc(ref);
      return snap.exists() ? (snap.data() as ItemDoc) : null;
    } catch {
      return null;
    }
  }

  const pickTitle = (item?: ItemDoc | null) => {
    const cand = [
      item?.name,
      item?.model,
      item?.title,
      item?.productName,
      item?.displayName,
      item?.brand,
    ];
    const found = cand.find((v) => typeof v === "string" && v.trim().length > 0);
    return found?.trim() ?? "Untitled";
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr(null);
      try {
        const q = query(collection(db, "listings"), where("status", "==", "active"));
        const snap = await getDocs(q);
        const listings: ListingDoc[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ListingDoc, "id">),
        }));

        const joined: JoinedRow[] = await Promise.all(
          listings.map(async (l) => {
            const item = await fetchItemDocFlexible(l.itemRef);
            return {
              id: l.id,
              title: pickTitle(item),
              type: l.type,
              price: l.type === "sell" ? l.price ?? 0 : null,
            };
          })
        );

        setRows(joined);
      } catch (e: any) {
        setErr(e?.message || "Failed to load items");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  async function handleDelete(listingId: string) {
    setDeletingIds((prev) => new Set(prev).add(listingId));
    try {
      await deleteDoc(doc(db, "listings", listingId));
      setRows((prev) => prev.filter((r) => r.id !== listingId));
    } catch (e: any) {
      Alert.alert("Delete failed", e?.message ?? "Something went wrong.");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(listingId);
        return next;
      });
    }
  }

  function confirmDelete(row: JoinedRow) {
    const title = row.title || "this item";
    const header =
      row.type === "sell" ? "Delete selling listing?" : "Delete donation listing?";
    Alert.alert(header, `Remove "${title}" from your listings?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => handleDelete(row.id) },
    ]);
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.brand.primary,
          paddingTop: insets.top + 10,
          paddingHorizontal: 16,
          paddingBottom: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: "row", alignItems: "center" }}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
          <View style={{ marginLeft: 8 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
              My Selling & Donation
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 2 }}>
              Active listings you’re offering for sale or donation
            </Text>
          </View>
        </TouchableOpacity>

        <View style={{ width: 24 }} />
      </View>

      {/* Body */}
      {loading && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      )}

      {!loading && err && (
        <View style={{ padding: 20 }}>
          <Text style={{ color: "#EF4444" }}>{err}</Text>
        </View>
      )}

      {!loading && !err && (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
          {rows.map((item) => (
            <View
              key={item.id}
              style={[
                styles.row,
                { borderColor: "#EEF0F5", backgroundColor: "#fff" },
                cardShadow(),
              ]}
            >
              <TypeBadge type={item.type} />

              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#1F2937" }}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>

                {item.type === "sell" && item.price != null ? (
                  <Text style={{ marginTop: 4, color: "#16A34A", fontWeight: "700" }}>
                    {formatLKR(item.price)}
                  </Text>
                ) : (
                  <View
                    style={{
                      alignSelf: "flex-start",
                      marginTop: 4,
                      borderRadius: 999,
                      borderWidth: 1,
                      borderColor: "#16A34A",
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <Text style={{ color: "#16A34A", fontSize: 12, fontWeight: "700" }}>
                      FREE
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={() => confirmDelete(item)}
                disabled={deletingIds.has(item.id)}
                hitSlop={10}
              >
                {deletingIds.has(item.id) ? (
                  <ActivityIndicator />
                ) : (
                  <MaterialIcons name="delete-outline" size={22} color="#374151" />
                )}
              </TouchableOpacity>
            </View>
          ))}

          {rows.length === 0 && (
            <View style={{ alignItems: "center", paddingVertical: 60 }}>
              <Ionicons name="cube-outline" size={28} color="#9CA3AF" />
              <Text style={{ marginTop: 8, color: "#6B7280" }}>No items to show</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
