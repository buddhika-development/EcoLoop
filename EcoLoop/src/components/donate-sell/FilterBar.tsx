// 
// FilterBar.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import CategoryChips from "./CategoryChips";
import PriceRange from "./PriceRange";
import type { Tab, FilterState } from "./FilterTypes";

type Props = {
  tab: Tab;
  value: FilterState;
  onApply: (next: FilterState) => void;
  onClear?: () => void;
  categories: { id: string; label: string }[];
};

export default function FilterBar({ tab, value, onApply, onClear, categories }: Props) {
  // ✅ Hooks always at top-level
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterState>(value);
  const isSell = tab === "sell";

  const apply = () => {
    setOpen(false);
    const cleaned: FilterState = {
      category: draft.category && draft.category !== "all" ? draft.category : "all",
      minPrice: isSell && typeof draft.minPrice === "number" ? draft.minPrice : null,
      maxPrice: isSell && typeof draft.maxPrice === "number" ? draft.maxPrice : null,
    };
    onApply(cleaned);
  };

  const clear = () => {
    const cleared: FilterState = { category: "all", minPrice: null, maxPrice: null };
    setDraft(cleared);
    onApply(cleared);
    onClear?.();
    setOpen(false);
  };

  return (
    <>
      <View className="flex-row items-center justify-between mt-3">
        <Text className="text-gray-500">
          Filters
          {value?.category && value.category !== "all" ? `: ${value.category}` : ""}
          {isSell && (value.minPrice || value.maxPrice)
            ? `  •  LKR ${value.minPrice ?? 0} - ${value.maxPrice ?? "∞"}`
            : ""}
        </Text>

        <TouchableOpacity
          onPress={() => {
            setDraft({
              category: value.category ?? "all",
              minPrice: typeof value.minPrice === "number" ? value.minPrice : null,
              maxPrice: typeof value.maxPrice === "number" ? value.maxPrice : null,
            });
            setOpen(true);
          }}
          className="px-3 py-2 rounded-xl bg-brand-primary"
        >
          <Text className="text-white font-semibold">Filters</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ Modal renders outside tree; we provide a local SafeAreaProvider */}
      <Modal visible={open} animationType="slide" transparent>
        <SafeAreaProvider>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
            style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.3)" }}
          >
            <View className="bg-white rounded-t-3xl pt-5">
              {/* Use SafeAreaView so buttons aren’t hidden behind the home bar */}
              <SafeAreaView edges={["bottom"]}>
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 16 }}
                  showsVerticalScrollIndicator={false}
                >
                  <Text className="text-lg font-bold text-gray-900 mb-3">Filter</Text>

                  <Text className="text-gray-800 font-semibold mb-2">Category</Text>
                  <CategoryChips
                    value={draft.category ?? "all"}
                    categories={categories}
                    onChange={(id) => setDraft((p) => ({ ...p, category: id }))}
                  />

                  <PriceRange
                    disabled={!isSell}
                    min={draft.minPrice ?? null}
                    max={draft.maxPrice ?? null}
                    onChange={({ min, max }) => setDraft((p) => ({ ...p, minPrice: min, maxPrice: max }))}
                  />

                  <View className="flex-row justify-end mt-5 mb-2">
                    <TouchableOpacity onPress={clear} className="px-4 py-2 rounded-xl border border-gray-300 mr-2">
                      <Text className="text-gray-700 font-semibold">Clear</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={apply} className="px-4 py-2 rounded-xl bg-brand-primary">
                      <Text className="text-white font-semibold">Apply</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </SafeAreaView>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaProvider>
      </Modal>
    </>
  );
}
