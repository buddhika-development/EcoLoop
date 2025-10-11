import { useMemo, useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Pressable, Modal, FlatList, ActivityIndicator, Alert, } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { db } from "@/src/lib/firebase";
import { collection, query, where, orderBy, getDocs, addDoc, doc, serverTimestamp, } from "firebase/firestore";
import { useUserProfile } from "@/src/hooks/useUserProfile";

type ListingType = "sell" | "donate";

type MyItem = {
  id: string;
  ownerUid: string;
  model?: string;
  name?: string;
  brand?: string;
};

export default function NewListing() {

  const { user } = useUserProfile();

  const [items, setItems] = useState<MyItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string>("");

  // const [model, setModel] = useState("");
  const [action, setAction] = useState<"sell" | "donate">("sell");
  const [price, setPrice] = useState("");
  const isDonate = action === "donate";
  const priceDisplay = useMemo(() => (isDonate ? "FREE" : price), [isDonate, price]);

  const params = useLocalSearchParams<{ itemId?: string }>();


  useEffect(() => {
    if (!user?.uid) {
      setItems([]);
      setLoadingItems(false);
      return;
    }

    if (typeof params.itemId === "string" && params.itemId) {
      setSelectedItemId(params.itemId);
    }

    (async () => {
      try {
        const q = query(
          collection(db, "items"),
          where("ownerUid", "==", user.uid),
          orderBy("model", "asc")
        );
        const snap = await getDocs(q);
        const mine = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as MyItem[];
        setItems(mine);
      } catch (e: any) {
        console.error(e);
        Alert.alert("Error", e?.message ?? "Failed to load your items.");
      } finally {
        setLoadingItems(false);
      }
    })();
  }, [user?.uid, params.itemId]);

  const selectedItem = useMemo(
    () => items.find((i) => i.id === selectedItemId) || null,
    [items, selectedItemId]
  );

  const onAdd = async () => {
    if (!user?.uid) {
      Alert.alert("Not signed in", "Please sign in to add a listing.");
      return;
    }
    if (!selectedItemId) {
      Alert.alert("Select model", "Please choose a model number from the list.");
      return;
    }
    if (action === "sell") {
      const n = Number(price);
      if (!price || Number.isNaN(n) || n <= 0) {
        Alert.alert("Invalid price", "Enter a valid price greater than 0.");
        return;
      }
    }

    try {
      const itemRef = doc(db, "items", selectedItemId);
      console.log("Creating listing payload →", {
        ownerUid: user?.uid,
        itemRef: `items/${selectedItemId}`,
        type: action,
        price: action === "donate" ? null : Number(price),
        status: "active"
      });

      await addDoc(collection(db, "listings"), {
        ownerUid: user.uid,
        itemRef,
        type: action,
        price: action === "donate" ? null : Number(price),
        status: "active",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      Alert.alert(
        "Success",
        action === "donate" ? "Donation listing created." : "Selling listing created.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (e: any) {
      console.error(e);
      Alert.alert("Error", e?.message ?? "Failed to create listing.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      {/* Top bar */}
      <View className="h-14 flex-row items-center px-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Title */}
        <Text className="mt-4 text-3xl font-extrabold text-purple-700 leading-9 text-center">
          Add Item To{"\n"}Sell/Donate
        </Text>

        {/* <View className="mt-6">
          <Text className="text-xs text-gray-500 mb-2">Model Number</Text>
          <TextInput
            className="h-11 rounded-xl px-4 border border-gray-200 bg-gray-50"
            placeholder="mc-1020 cf"
            value={model}
            onChangeText={setModel}
          />
        </View> */}

        {/* 🔸 CHANGED: Model number → dropdown */}
        <View className="mt-6">
          <Text className="text-xs text-gray-500 mb-2">Model Number</Text>

          <Pressable
            onPress={() => setPickerOpen(true)}
            className="h-11 rounded-xl px-4 border border-gray-200 bg-gray-50 justify-center"
          >
            <Text className={selectedItem ? "text-gray-900" : "text-gray-400"}>
              {selectedItem
                ? `${selectedItem.model ?? "Unknown model"}${selectedItem.name ? ` • ${selectedItem.name}` : ""
                }`
                : loadingItems
                  ? "Loading..."
                  : "Select your model"}
            </Text>
          </Pressable>

          {/* 🔹 ADDED modal picker */}
          <Modal visible={pickerOpen} animationType="slide" onRequestClose={() => setPickerOpen(false)}>
            <View className="flex-1 bg-white">
              <View className="px-4 py-3 border-b border-gray-200 flex-row items-center">
                <TouchableOpacity onPress={() => setPickerOpen(false)}>
                  <Text className="text-lg">✕</Text>
                </TouchableOpacity>
                <Text className="flex-1 text-center font-semibold text-lg">Choose Model</Text>
                <View style={{ width: 24 }} />
              </View>

              {loadingItems ? (
                <View className="flex-1 items-center justify-center">
                  <ActivityIndicator />
                </View>
              ) : (
                <FlatList
                  data={items}
                  keyExtractor={(it) => it.id}
                  ItemSeparatorComponent={() => <View className="h-[1px] bg-gray-100" />}
                  renderItem={({ item }) => (
                    <Pressable
                      onPress={() => {
                        setSelectedItemId(item.id);
                        setPickerOpen(false);
                      }}
                      className="px-4 py-3"
                    >
                      <Text className="font-semibold">{item.model ?? "Unknown model"}</Text>
                      <Text className="text-gray-500 mt-0.5">
                        {item.name ?? item.brand ?? "Item"} • #{item.id.slice(0, 6)}
                      </Text>
                    </Pressable>
                  )}
                />
              )}
            </View>
          </Modal>
        </View>


        {/* Choose Action */}
        <View className="mt-6">
          <Text className="text-xs text-gray-500 mb-2">Choose Action</Text>
          <View className="flex-row items-center gap-x-8 rounded-xl px-3 py-2">
            <Radio
              label="Sell"
              checked={action === "sell"}
              onPress={() => setAction("sell")}
            />
            <Radio
              label="Donate"
              checked={action === "donate"}
              onPress={() => setAction("donate")}
            />
          </View>
        </View>

        {/* Price */}
        <View className="mt-6">
          <Text className="text-xs text-gray-500 mb-2">Price</Text>
          <TextInput
            className={`h-11 rounded-xl px-4 border ${isDonate ? "border-gray-200 bg-gray-50" : "border-gray-200 bg-white"
              }`}
            placeholder="Enter price"
            keyboardType="numeric"
            value={priceDisplay}
            onChangeText={(t) => !isDonate && setPrice(t)}
            editable={!isDonate}
          />
        </View>

        {/* Scan QR hint */}
        <TouchableOpacity
          className="mt-4 flex-row items-center"
          onPress={() => { router.push("/(app)/(tabs)/lifecycle/item/scan"); }}
        >
          <MaterialIcons name="qr-code-scanner" size={18} />
          <Text className="ml-2 text-xs text-gray-600">Scan QR to prefill (optional)</Text>
        </TouchableOpacity>

        {/* Add button (UI only) */}
        <TouchableOpacity
          className="mt-6 h-12 rounded-xl items-center justify-center bg-green-600"
          onPress={onAdd}
        >
          <Text className="text-white font-semibold">Add</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SegmentButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-5 h-10 rounded-full border ${active ? "bg-purple-600 border-purple-600" : "bg-[#DBDBEC] border-gray-300"
        } items-center justify-center`}
    >
      <Text className={`font-medium ${active ? "text-white" : "text-gray-700"}`}>{label}</Text>
    </TouchableOpacity>
  );
}

function Radio({
  label,
  checked,
  onPress,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center"
      accessibilityRole="radio"
      accessibilityState={{ checked }}
    >
      {/* outer circle */}
      <View
        className={`h-5 w-5 rounded-full border mr-2 items-center justify-center ${checked ? "border-purple-600" : "border-gray-400"
          }`}
      >
        {/* inner dot */}
        {checked ? <View className="h-2.5 w-2.5 rounded-full bg-purple-600" /> : null}
      </View>

      <Text className={checked ? "text-gray-900" : "text-gray-600"}>{label}</Text>
    </Pressable>
  );
}
