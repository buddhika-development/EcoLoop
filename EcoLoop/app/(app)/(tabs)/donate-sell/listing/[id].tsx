import { useEffect, useState, useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  doc,
  getDoc,
  getDocs,
  query,
  where,
  collection,
  type DocumentReference,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";

type ItemDoc = {
  id?: string;                 
  name?: string;
  model?: string;
  images?: string[];
  purchaseDate?: string;       
  brand?: string;
  category?: string;
};

type ListingDoc = {
  ownerUid: string;
  itemRef: string | DocumentReference<DocumentData>; 
  type: "sell" | "donate";
  price: number | null;
  status: "active" | "inactive";
  createdAt?: any;
  updatedAt?: any;
};

type OwnerDoc = {
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  profilePic?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
};

function yearsSince(dateStr?: string): number {
  if (!dateStr) return 0;
  const [y, m, d] = dateStr.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return 0;
  const start = new Date(y, m - 1, d).getTime();
  const now = Date.now();
  const diffYears = (now - start) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(0, Math.floor(diffYears));
}

function getPathParts(pathLike: string) {
  const path = pathLike.replace(/^\//, "");
  const [col, docId] = path.split("/");
  return { col, docId };
}

async function resolveItem(itemIdOrPath: string): Promise<{ docId: string; data: ItemDoc } | null> {
  const maybePath = getPathParts(itemIdOrPath);
  if (maybePath.col === "items" && maybePath.docId) {
    const snap = await getDoc(doc(db, "items", maybePath.docId));
    if (snap.exists()) return { docId: snap.id, data: snap.data() as ItemDoc };
  }

  const directSnap = await getDoc(doc(db, "items", itemIdOrPath));
  if (directSnap.exists()) {
    return { docId: directSnap.id, data: directSnap.data() as ItemDoc };
  }

  const qs = await getDocs(query(collection(db, "items"), where("id", "==", itemIdOrPath)));
  if (!qs.empty) {
    const first = qs.docs[0];
    return { docId: first.id, data: first.data() as ItemDoc };
  }

  return null;
}

async function resolveListing(opts: {
  maybeListingId?: string;     
  itemFieldId?: string;        
  itemDocId?: string;          
}) : Promise<{ id: string; data: ListingDoc } | null> {
  const { maybeListingId, itemFieldId, itemDocId } = opts;

  if (maybeListingId) {
    const lsSnap = await getDoc(doc(db, "listings", maybeListingId));
    if (lsSnap.exists()) return { id: lsSnap.id, data: lsSnap.data() as ListingDoc };
  }

  const strCandidates = new Set<string>();
  if (itemFieldId) {
    strCandidates.add(`/items/${itemFieldId}`);
    strCandidates.add(`items/${itemFieldId}`);
  }
  if (itemDocId) {
    strCandidates.add(`/items/${itemDocId}`);
    strCandidates.add(`items/${itemDocId}`);
  }

  for (const s of strCandidates) {
    const qs = await getDocs(query(collection(db, "listings"), where("itemRef", "==", s)));
    if (!qs.empty) {
      const d = qs.docs[0];
      return { id: d.id, data: d.data() as ListingDoc };
    }
  }

  const refCandidates: Array<DocumentReference<DocumentData>> = [];
  if (itemFieldId) refCandidates.push(doc(db, "items", itemFieldId));
  if (itemDocId) refCandidates.push(doc(db, "items", itemDocId));

  for (const ref of refCandidates) {
    const qs = await getDocs(query(collection(db, "listings"), where("itemRef", "==", ref)));
    if (!qs.empty) {
      const d = qs.docs[0];
      return { id: d.id, data: d.data() as ListingDoc };
    }
  }

  return null;
}

export default function ListingItemPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const param = Array.isArray(params.id) ? params.id[0] : params.id;

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<ItemDoc | null>(null);
  const [listing, setListing] = useState<ListingDoc | null>(null);
  const [owner, setOwner] = useState<OwnerDoc | null>(null);
  
  const addressText = useMemo(() => {
    if (!owner?.address) return undefined;
    const { line1, line2, city, country } = owner.address;
    return [line1, line2, city, country].filter(Boolean).join(", ");
  }, [owner]);

  const mainImage = useMemo(() => item?.images?.[0] ?? "https://via.placeholder.com/300", [item]);
  const displayName = useMemo(() => item?.name ?? item?.model ?? "Untitled", [item]);
  const usedYears = useMemo(() => yearsSince(item?.purchaseDate), [item]);

  useEffect(() => {
  if (!param) return;

  (async () => {
    try {
      setLoading(true);
      console.log("🔵 Route param:", param);

      let itemResolved = await resolveItem(param);
      let listingResolved: { id: string; data: ListingDoc } | null = null;

      if (itemResolved) {
        listingResolved = await resolveListing({
          maybeListingId: param,
          itemFieldId: itemResolved.data.id,
          itemDocId: itemResolved.docId,
        });
      } else {
        listingResolved = await resolveListing({
          maybeListingId: param,
          itemFieldId: param,
          itemDocId: param,
        });

        if (listingResolved?.data?.itemRef) {
          const refVal = listingResolved.data.itemRef;
          const path = typeof refVal === "string" ? refVal : (refVal as DocumentReference).path;
          itemResolved = await resolveItem(path);
        }
      }

      console.log("itemResolved:", itemResolved?.docId, itemResolved?.data?.id, itemResolved?.data?.name);
      console.log("listingResolved:", listingResolved?.id, listingResolved?.data);
      if (listingResolved?.data) {
        console.log("Listing price from Firestore:", listingResolved.data.price);
        console.log("Listing itemRef (raw):", listingResolved.data.itemRef);
      }

      if (!itemResolved) {
        setItem(null);
        setListing(null);
        setOwner(null);
        setLoading(false);
        return;
      }

      setItem(itemResolved.data);
      if (listingResolved) setListing(listingResolved.data);

      if (listingResolved?.data?.ownerUid) {
        const ownerSnap = await getDoc(doc(db, "users", listingResolved.data.ownerUid));
        if (ownerSnap.exists()) setOwner(ownerSnap.data() as OwnerDoc);
      }
    } catch (err) {
      console.error("Detail load error:", err);
    } finally {
      setLoading(false);
    }
  })();
}, [param]);


  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-2 text-gray-500">Loading…</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-gray-500">Item not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-3">
          <Text className="text-blue-600">Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const price = listing?.price ?? 0; 
  const showPrice = true;

  return (
         
    <ScrollView className="px-10 pt-5 pb-8 bg-white flex-1">
      {/* 1) Top image */}
      <Image source={{ uri: mainImage }} className="w-full h-56 rounded-xl" />

      {/* 2) Name (from items) */}
      <Text className="text-2xl font-bold mt-4">{displayName}</Text>

      {/* 3) Price (from listings) */}
      <Text className="text-green-700 text-xl mb-2 font-bold">
        Rs. {price.toLocaleString("en-LK")}
      </Text>

      {/* 4) Used years */}
      <View className="self-start px-3 py-1 rounded-full bg-[#7C3AED] mb-2">
        <Text className="text-[white] font-medium">
          Used {usedYears} {usedYears === 1 ? "year" : "years"}
        </Text>
      </View>

      {/* 5) Common description */}
      <Text className="text-gray-600 mb-3">
        A reliable item in good condition, suitable for everyday use. Clean and well-maintained.
      </Text>

      {item?.images && item.images.length > 1 && (
        <View className="flex-row flex-wrap gap-3 mb-6">
            {item.images.slice(1).map((img, index) => (
            <Image
                key={index}
                source={{ uri: img }}
                className="w-[48%] h-40 rounded-xl"
                resizeMode="cover"
            />
            ))}
        </View>
       )}

      {/* 6) Owner (name, email, phone only) */}
      {owner && (
        <View className="mt-8 border-t border-t pt-5">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <Image
                        source={{ uri: owner.profilePic || "https://i.pravatar.cc/100" }}
                        className="w-12 h-12 rounded-full mr-3"
                    />
                <View>
                    <Text className="text-lg font-semibold text-gray-900">
                        {owner.fullName || owner.name || "—"}
                    </Text>
                </View>
            </View>
        </View>

        <View className="mt-4 flex-row items-center">
            {owner.phone ? (
                <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${owner.phone}`)}
                    className="flex-row items-center mr-6"
                >
                    <Ionicons name="call" size={22} color="#16A34A" />
                    <Text className="ml-2 text-blue-600">{owner.phone}</Text>
                </TouchableOpacity>
            ) : null}

            {owner.email ? (
                <TouchableOpacity
                    onPress={() => Linking.openURL(`mailto:${owner.email}`)}
                    className="flex-row items-center"
                >
                    <Ionicons name="mail" size={22} color="#7C3AED" />
                    <Text className="ml-2 text-blue-600">{owner.email}</Text>
                </TouchableOpacity>
            ) : null}
        </View>

        {addressText ? (
            <View className="mt-3 flex-row items-start">
                <Ionicons name="location-sharp" size={22} color="#6B7280" />{/* gray */}
                <Text className="ml-2 text-gray-700 flex-1">{addressText}</Text>
            </View>
        ) : null}

    </View>
    )}
    </ScrollView>
  );
}
