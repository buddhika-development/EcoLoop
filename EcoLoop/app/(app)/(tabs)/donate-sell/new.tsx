import { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Pressable } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function NewListing() {

    const [model, setModel] = useState("");
    const [action, setAction] = useState<"sell" | "donate">("sell");
    const [price, setPrice] = useState("");
    const isDonate = action === "donate";
    const priceDisplay = useMemo(() => (isDonate ? "FREE" : price), [isDonate, price]);


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

        {/* Model number */}
        <View className="mt-6">
          <Text className="text-xs text-gray-500 mb-2">Model Number</Text>
          <TextInput
            className="h-11 rounded-xl px-4 border border-gray-200 bg-gray-50"
            placeholder="mc-1020 cf"
            value={model}
            onChangeText={setModel}
          />
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
            className={`h-11 rounded-xl px-4 border ${
              isDonate ? "border-gray-200 bg-gray-50" : "border-gray-200 bg-white"
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
          onPress={() => {/* UI only; hook up later */}}
        >
          <MaterialIcons name="qr-code-scanner" size={18} />
          <Text className="ml-2 text-xs text-gray-600">Scan QR to prefill (optional)</Text>
        </TouchableOpacity>

        {/* Add button (UI only) */}
        <TouchableOpacity
          className="mt-6 h-12 rounded-xl items-center justify-center bg-green-600"
          onPress={() => {/* UI only; connect later */}}
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
      className={`px-5 h-10 rounded-full border ${
        active ? "bg-purple-600 border-purple-600" : "bg-[#DBDBEC] border-gray-300"
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
        className={`h-5 w-5 rounded-full border mr-2 items-center justify-center ${
          checked ? "border-purple-600" : "border-gray-400"
        }`}
      >
        {/* inner dot */}
        {checked ? <View className="h-2.5 w-2.5 rounded-full bg-purple-600" /> : null}
      </View>

      <Text className={checked ? "text-gray-900" : "text-gray-600"}>{label}</Text>
    </Pressable>
  );
}
