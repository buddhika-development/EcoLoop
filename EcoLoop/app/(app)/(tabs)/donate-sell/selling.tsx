import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  type DocumentReference,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { deleteDoc } from "firebase/firestore";
import { router } from "expo-router";

type ItemDoc = {
  name?: string;
  images?: string[];
  image?: string; 
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

export default function SellingItems() {
  const [rows, setRows] = useState<JoinedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const normalizePath = (p: string) =>
  p.trim().replace(/^\/+/, "").replace(/\/+/g, "/");

const handleDelete = async (listingId: string) => {
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
};

const confirmDelete = (row: JoinedRow) => {
  const title = row.title || "this item";
  const header =
    row.type === "sell" ? "Delete selling listing?" : "Delete donation listing?";
  Alert.alert(header, `Remove "${title}" from your listings?`, [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: () => handleDelete(row.id) },
  ]);
};

  
async function fetchItemDocFlexible(itemRef: string | DocumentReference<DocumentData>): Promise<ItemDoc | null> {
  try {
    if (!itemRef) return null;

    if (typeof itemRef !== "string") {
      const snap = await getDoc(itemRef);
      return snap.exists() ? (snap.data() as ItemDoc) : null;
    }

    let path = normalizePath(itemRef as string);
    const ref = doc(db, path);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as ItemDoc) : null;
  } catch {
    return null;
  }
}


const pickTitle = (item?: ItemDoc | null) => {
  const cand = [
    item?.name,
    (item as any)?.model,
    (item as any)?.title,
    (item as any)?.productName,
    (item as any)?.displayName,
    (item as any)?.brand,
  ];
  const found = cand.find((v) => typeof v === "string" && v.trim().length > 0);
  return found?.trim() ?? "Untitled";
};

const TypeBadge = ({ type }: { type: "sell" | "donate" }) => {
    const isSell = type === "sell";
    const bg = isSell ? "bg-[#E7F0FF]" : "bg-[#EAF7EA]";
    const color = isSell ? "#1D4ED8" : "#16A34A";
    const iconName = isSell ? "pricetag-outline" : "gift-outline";
    return (
      <View className={`w-14 h-14 rounded-xl mr-3 items-center justify-center ${bg}`}>
        <Ionicons name={iconName as any} size={24} color={color} />
      </View>
    );
  };


useEffect(() => {
  
  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const q = query(
        collection(db, "listings"),
        where("status", "==", "active"),
       );

      const snap = await getDocs(q);
      const listings: ListingDoc[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ListingDoc, "id">),
      }));

      const joined: JoinedRow[] = await Promise.all(
        listings.map(async (l) => {
          const item = await fetchItemDocFlexible(l.itemRef);
          const title = pickTitle(item);
          return {
            id: l.id,
            title,
            type: l.type,
            price: l.type === "sell" ? (l.price ?? 0) : null,
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


  
  return (
    <View className="flex-1 bg-white">
      
        <View className="flex-row items-center px-4 pt-6 pb-3 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 p-1 rounded-full bg-gray-100"
        >
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <View>
          <Text className="text-xl font-bold text-gray-900">Selling & Donation</Text>
          <Text className="text-xs text-gray-500 mt-0.5">
            Active listings you’re offering for sale or donation
          </Text>
        </View>
      </View>
        
        {!loading && !err && (
            <ScrollView className="mt-4 px-4 mb-24">
                {rows.map((item) => (
                    <View
                        key={item.id}
                        className="flex-row items-center bg-white rounded-2xl p-3 mb-3 shadow-sm border border-gray-100"
                    >
                
                {/* Left icon instead of image */}
                <TypeBadge type={item.type} />

                {/* Title + Price/Free */}
                <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-800" numberOfLines={1}>
                        {item.title}
                    </Text>
                    {item.type === "sell" && item.price != null ? (
                    <Text className="text-sm font-semibold text-green-600 mt-1">
                        {formatLKR(item.price)}
                    </Text>
                    ) : (
                    <View className="self-start mt-1 rounded-full border border-green-600 px-2 py-0.5">
                        <Text className="text-xs font-semibold text-green-600">FREE</Text>
                    </View>
                    )}
                </View>
                
                <TouchableOpacity
                    onPress={() => confirmDelete(item)}
                    disabled={deletingIds.has(item.id)}
                >
                    {deletingIds.has(item.id) ? (
                    <ActivityIndicator />
                    ) : (
                    <MaterialIcons name="delete-outline" size={22} color="#444" />
                    )}
                </TouchableOpacity>
                
            </View>
        ))}

            {rows.length === 0 && (
                <View className="items-center justify-center py-16">
                    <Ionicons name="cube-outline" size={28} color="#9CA3AF" />
                    <Text className="mt-2 text-gray-500">No items to show</Text>
                </View>
            )}
        </ScrollView>
    )}

      

      
    </View>
  );
}
