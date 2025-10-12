import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

type Props = {
  value?: string | null;             
  categories: { id: string; label: string }[];
  onChange: (next: string) => void;
};

export default function CategoryChips({ value = "all", categories, onChange }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {[{ id: "all", label: "All" }, ...categories].map((c) => {
        const active = value === c.id;
        return (
          <TouchableOpacity
            key={c.id}
            onPress={() => onChange(c.id)}
            className={`px-3 py-2 mr-2 rounded-full border
              ${active ? "bg-brand-primary border-brand-primary" : "bg-white border-gray-300"}`}
          >
            <Text className={active ? "text-white font-semibold" : "text-gray-700 font-semibold"}>
              {c.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
