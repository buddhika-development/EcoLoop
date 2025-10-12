import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
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
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterState>(value);

  const isSell = tab === "sell";

  const apply = () => {
    setOpen(false);
    const cleaned: FilterState = {
      category: draft.category ?? null,
      minPrice: isSell ? draft.minPrice ?? null : null,
      maxPrice: isSell ? draft.maxPrice ?? null : null,
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
          Filters{value?.category && value.category !== "all" ? `: ${value.category}` : ""}
          {isSell && (value.minPrice || value.maxPrice)
            ? `  •  LKR ${value.minPrice ?? 0} - ${value.maxPrice ?? "∞"}`
            : ""}
        </Text>

        <TouchableOpacity
          onPress={() => {
            setDraft(value);
            setOpen(true);
          }}
          className="px-3 py-2 rounded-xl bg-black"
        >
          <Text className="text-white font-semibold">Filters</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={open} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white rounded-t-3xl p-16 px-5 pt-5 pb-6">
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

            <View className="flex-row justify-end mt-5">
              <TouchableOpacity onPress={clear} className="px-4 py-2 rounded-xl border border-gray-300 mr-2">
                <Text className="text-gray-700 font-semibold">Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={apply} className="px-4 py-2 rounded-xl bg-black">
                <Text className="text-white font-semibold">Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
