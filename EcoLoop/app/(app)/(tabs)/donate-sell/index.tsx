import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, TextInput, FlatList, TouchableOpacity, Image, Pressable, ActivityIndicator } from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { router } from "expo-router";
import { collection, onSnapshot, query as qf, where, getDoc, DocumentReference, doc, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import FilterBar from "@/src/components/donate-sell/FilterBar";
import { buildListingQuery } from "@/src/components/donate-sell/buildListingQuery";
import { FilterState } from "@/src/components/donate-sell/FilterTypes";

async function fetchItemDocFlexible(itemRef: any) {
  // 1) Try the reference directly
  try {
    if (itemRef) {
      const snap = await getDoc(itemRef as DocumentReference);
      if (snap.exists()) return { id: snap.id, ...(snap.data() as any) };
    }
  } catch { }

  // 2) Try by ref.id (e.g., "item_001")
  try {
    const refId = (itemRef as any)?.id;
    if (refId) {
      // first attempt: assume doc id == refId
      const direct = await getDoc(doc(db, "items", String(refId)));
      if (direct.exists()) return { id: direct.id, ...(direct.data() as any) };

      // second attempt: query by field { id: refId }
      const itemsCol = collection(db, "items");
      const q = qf(itemsCol, where("id", "==", String(refId)));
      const qs = await getDocs(q);
      if (!qs.empty) {
        const first = qs.docs[0];
        return { id: first.id, ...(first.data() as any) };
      }
    }
  } catch { }

  // 3) If someone saved a string path, support it: "/items/item_001" or "items/item_001"
  try {
    if (typeof itemRef === "string") {
      const path = itemRef.replace(/^\//, "");
      const [col, docId] = path.split("/");
      if (col === "items" && docId) {
        const snap = await getDoc(doc(db, "items", docId));
        if (snap.exists()) return { id: snap.id, ...(snap.data() as any) };
      }
    }
  } catch { }

  return null;
}


const I = cssInterop(Ionicons, {
  className: { target: "style", nativeStyleToProp: { color: "color", fontSize: "size" } },
});
const M = cssInterop(MaterialIcons, {
  className: { target: "style", nativeStyleToProp: { color: "color", fontSize: "size" } },
});
const F = cssInterop(Feather, {
  className: { target: "style", nativeStyleToProp: { color: "color", fontSize: "size" } },
});

type Tab = "sell" | "donate";

type ListingDoc = {
  ownerUid: string;
  itemRef: string | DocumentReference;
  type: "sell" | "donate";
  price: number | null;
  status: "active" | "inactive";
  createdAt?: any;
  updatedAt?: any;
};

type ItemDoc = {
  id?: string;
  name?: string;
  model?: string;
  images?: string[];
  purchaseDate?: string;
  yearsUsed?: number;
  rating?: number;
  category?: string;
};

type Item = {
  id: string;
  title: string;
  yearsUsed: number;
  price: number;
  rating: number; // 0..5
  type: Tab;
  imageUrl?: string;
  category?: string;
};

type SegmentedProps = { value: Tab; onChange: (v: Tab) => void };
type ProductCardProps = { item: Item };

function resolveImageForCard(listing: ListingDoc, item: any): string | undefined {
  // priority: item.images → item.imageUrl → listing.images → listing.imageUrl
  const fromItemArr = firstImageUrl(item?.images);
  if (fromItemArr) return fromItemArr;

  if (typeof item?.imageUrl === "string" && item.imageUrl) return item.imageUrl;

  const fromListingArr = firstImageUrl((listing as any)?.images);
  if (fromListingArr) return fromListingArr;

  if (typeof (listing as any)?.imageUrl === "string" && (listing as any).imageUrl) {
    return (listing as any).imageUrl;
  }
  return undefined;
}


function firstImageUrl(images: any): string | undefined {
  if (!images) return undefined;

  let u: string | undefined;

  if (Array.isArray(images)) {
    u = typeof images[0] === "string" ? images[0] : undefined;
  } else if (typeof images === "object") {
    const vals = Object.values(images);
    u = typeof vals[0] === "string" ? (vals[0] as string) : undefined;
  }

  if (!u) return undefined;

  if (u.startsWith("gs://")) {
    const without = u.slice(5); // strip "gs://"
    const slash = without.indexOf("/");
    if (slash > 0) {
      const bucket = without.slice(0, slash);
      const path = encodeURIComponent(without.slice(slash + 1));
      return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${path}?alt=media`;
    }
  }
  return u;
}



function yearsSince(dateStr?: string): number {
  if (!dateStr) return 0;
  const [y, m, d] = dateStr.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return 0;
  const start = new Date(y, m - 1, d).getTime();
  const now = Date.now();
  const diffYears = (now - start) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, Math.floor(diffYears));
}

function getItemDocIdFromRef(ref: any): string | null {
  if (ref?.id) return String(ref.id);
  if (typeof ref === "string") {
    const path = ref.replace(/^\//, "");
    const [col, docId] = path.split("/");
    if (col === "items" && docId) return docId;
  }
  return null;
}

function toCardItem(listingId: string, listing: ListingDoc, item: ItemDoc & { id?: string }) {
  const itemId = item.id || getItemDocIdFromRef(listing.itemRef) || listingId;
  const listingAny = listing as any;

  return {
    id: itemId,
    listingId,
    title: listingAny.itemName ?? item.name ?? item.model ?? "Untitled",
    yearsUsed: item.yearsUsed ?? yearsSince(item.purchaseDate),
    price: listing.type === "donate" ? 0 : (listing.price ?? 0),
    rating: item.rating ?? 0,
    type: listing.type,
    category: listingAny.itemCategory ?? item.category ?? undefined,
    imageUrl:
      listingAny.itemImage ??
      firstImageUrl((item as any).images) ??
      (item as any).imageUrl ??
      (listingAny.images ? firstImageUrl(listingAny.images) : undefined),
  };
}



function Segmented({ value, onChange }: SegmentedProps) {
  return (
    <View className="flex-row rounded-full p-1 bg-surface-subtle border border-surface-foreground ">
      {(["sell", "donate"] as Tab[]).map((key) => {
        const active = value === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            className={`flex-1 items-center py-2 rounded-full ${active ? "bg-brand-primary" : "bg-surface-subtle"
              }`}
          >
            <Text
              className={`font-semibold ${active ? "text-text-inverse" : "text-text-hint"
                }`}
            >
              {key === "sell" ? "Sell" : "Donate"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ProductCard({ item }: ProductCardProps) {
  return (
    <Pressable
      onPress={() => router.push(`/(app)/(tabs)/donate-sell/listing/${item.id}`)}
      className="w-[48%] bg-surface border border-surface-foreground rounded-2xl p-4 mr-3 mb-4">
      <View className="h-[110px] rounded-xl items-center justify-center mb-3 bg-surface-subtle overflow-hidden">
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={{ width: "100%", height: "100%", borderRadius: 12 }}
            resizeMode="cover"
            onError={(e) => console.log("Image load error:", item.imageUrl, e.nativeEvent?.error)}
          />
        ) : (
          <F name="image" size={32} className="text-text-hint" />
        )}
      </View>

      <Text numberOfLines={1} className="font-semibold text-text">
        {item.title}
      </Text>

      <Text className="text-xs text-text-hint">
        Used {item.yearsUsed} {item.yearsUsed === 1 ? "year" : "years"}
      </Text>

      {item.type === "donate" || item.price === 0 ? (
        <View className="mt-1 self-start px-2 py-0.5 rounded-md border border-brand-accent bg-surface-subtle">
          <Text className="font-extrabold tracking-wider text-brand-accent">FREE</Text>
        </View>
      ) : (
        <Text className="mt-1 font-bold text-brand-accent">
          Rs. {item.price.toLocaleString("en-LK")}
        </Text>
      )}

      <View className="flex-row mt-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Text
            key={i}
            className={`text-xs mr-1 ${i < item.rating ? "text-amber-500" : "text-surface-foreground"
              }`}
          >
            ★
          </Text>
        ))}
      </View>
    </Pressable>
  );
}

export default function DonateSell() {


  const [tab, setTab] = useState<Tab>("sell");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    minPrice: null,
    maxPrice: null,
  });



  useEffect(() => {
    setLoading(true);

    const ref = collection(db, "listings");
    // const q = qf(ref, where("status", "==", "active"), where("type", "==", tab));
    const q = buildListingQuery(db, tab, filters);

    const unsub = onSnapshot(
      q,
      async (snap) => {
        try {
          const joined = await Promise.all(
            snap.docs.map(async (d, idx) => {
              const listing = d.data() as ListingDoc;

              // DEBUG: show raw listing + hint
              console.log(`[#${idx}] listing ${d.id} → type=${listing.type}, price=${listing.price}`);

              // Flexible fetch that covers all cases described above
              let itemData = await fetchItemDocFlexible(listing.itemRef);

              if (!itemData) {
                console.warn(`⚠️ Item not found for listing ${d.id}. itemRef=`, listing.itemRef);
                // keep a minimal card so UI stays stable
                return toCardItem(d.id, listing, { id: "unknown" });
              }

              // DEBUG: show what we got
              console.log(`[#${idx}] itemData keys:`, Object.keys(itemData));

              if (itemData) {
                const preview = firstImageUrl((itemData as any).images) || (itemData as any).imageUrl;
                console.log(`🖼️ Image preview for listing ${d.id}:`, preview);
              }

              return toCardItem(d.id, listing, itemData);
            })
          );

          const filtered = !filters.category || filters.category === "all"
            ? joined
            : joined.filter((x) => x && (x.category ?? "unknown") === filters.category);

          setItems(filtered);
        } catch (e) {
          console.log("🔥 join error:", e);
        } finally {
          setLoading(false);
        }
      }
    );


    return () => unsub();
  }, [tab, filters]);




  return (
    <SafeAreaView className="flex-1 bg-surface-subtle">
      <View className="flex-row items-center justify-between px-4 pt-2 pb-3 bg-surface">
        <View className="flex-row items-center">
          <View>
            <Text className="font-bold text-2xl text-brand-primary-700">What you need</Text>
            <Text className="font-bold text-2xl text-brand-primary-700">to pick</Text>
          </View>
        </View>

        <TouchableOpacity
          className="px-3 py-2 rounded-2xl bg-brand-primary"
          onPress={() => router.push("/(app)/(tabs)/donate-sell/new")}>
          <I name="add" size={20} className="text-text-inverse" />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View className="px-4 mt-3">
        <Segmented value={tab} onChange={setTab} />

        {/* Search */}
        <View className="flex-row items-center h-11 mt-3 px-3 bg-surface border border-surface-foreground rounded-xl">
          <I name="search" size={18} className="text-text-hint" />
          <TextInput
            placeholder="Tell us your need..."
            placeholderTextColor="#787F8D"
            className="flex-1 ml-2 text-text"
          />
        </View>

        {/* Filters */}
        <FilterBar
          tab={tab}
          value={filters}
          onApply={setFilters}
          categories={[
            { id: "electronics", label: "Electronics" },
            { id: "home-appliance", label: "Home Appliances" },
            { id: "furniture", label: "Furniture" },
            { id: "office-appliance", label: "Office Appliances" },
          ]}
        />

        {/* Grid */}
        {loading ? (
          <View className="mt-6 items-center">
            <ActivityIndicator />
            <Text className="mt-2 text-text-hint">Loading items…</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ProductCard item={item} />}
            numColumns={2}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 110 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="py-16 items-center">
                <Text className="text-text-hint">
                  No {tab === "sell" ? "selling" : "donation"} items yet.
                </Text>
              </View>
            }
          />
        )}
      </View>



    </SafeAreaView>
  );
}

