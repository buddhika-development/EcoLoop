import React, { useMemo, useState } from "react";
import { View, Text, SafeAreaView, TextInput, FlatList, TouchableOpacity, Image, Pressable } from "react-native";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { cssInterop } from "nativewind";
import { router } from "expo-router";

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
type Item = {
  id: string;
  title: string;
  yearsUsed: number;
  price: number;
  rating: number; // 0..5
  type: Tab;
};
type SegmentedProps = { value: Tab; onChange: (v: Tab) => void };
type ProductCardProps = { item: Item };

const ITEMS: Item[] = [
  { id: "1", title: "Singer Television", yearsUsed: 4, price: 9000, rating: 4, type: "sell" },
  { id: "2", title: "Microwave Oven", yearsUsed: 3, price: 3000, rating: 5, type: "sell" },
  { id: "3", title: "Damro Wardrobe", yearsUsed: 5, price: 4500, rating: 4, type: "sell" },
  { id: "4", title: "HP Probook", yearsUsed: 2, price: 275000, rating: 5, type: "sell" },
  { id: "5", title: "Study Table", yearsUsed: 2, price: 0, rating: 4, type: "donate" },
  { id: "6", title: "Kids Bicycle", yearsUsed: 1, price: 0, rating: 5, type: "donate" },
];

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
    <View className="w-[48%] bg-surface border border-surface-foreground rounded-2xl p-4 mr-3 mb-4">
      <View className="h-[110px] rounded-xl items-center justify-center mb-3 bg-surface-subtle">
        <F name="image" size={32} className="text-text-hint" />
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
    </View>
  );
}

export default function DonateSell() {

  const [tab, setTab] = useState<Tab>("sell");
  const [query, setQuery] = useState<string>("");

  const data = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase();
    return ITEMS.filter(
      (it) => it.type === tab && (q.length === 0 || it.title.toLowerCase().includes(q))
    );
  }, [tab, query]);

  return (
    <SafeAreaView className="flex-1 bg-surface-subtle">
      {/* Header */}
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
            placeholderTextColor="#787F8D"  // text.hint from your config
            value={query}
            onChangeText={setQuery}
            className="flex-1 ml-2 text-text"
          />
        </View>

        {/* Grid */}
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard item={item} />}
          numColumns={2}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
        />
      </View>



    </SafeAreaView>
  );
}
