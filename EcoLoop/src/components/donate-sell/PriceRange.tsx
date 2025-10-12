import React, { useState, useEffect } from "react";
import { View, Text, TextInput } from "react-native";

type Props = {
  min?: number | null;
  max?: number | null;
  onChange: (next: { min?: number | null; max?: number | null }) => void;
  disabled?: boolean;
};

export default function PriceRange({ min, max, onChange, disabled }: Props) {
  const [localMin, setLocalMin] = useState<string>(min?.toString() ?? "");
  const [localMax, setLocalMax] = useState<string>(max?.toString() ?? "");

  useEffect(() => {
    setLocalMin(min?.toString() ?? "");
    setLocalMax(max?.toString() ?? "");
  }, [min, max]);

  const parse = (s: string) => {
    const n = Number(s.replace(/[^0-9]/g, ""));
    return Number.isFinite(n) ? n : null;
  };

  return (
    <View className="mt-3">
      <Text className={`mb-2 ${disabled ? "text-gray-400" : "text-gray-800"} font-semibold`}>
        Price range (LKR)
      </Text>

      <View className="flex-row">
        <View className={`flex-1 mr-2 border rounded-lg px-3 py-2 ${disabled ? "bg-gray-100 border-gray-200" : "border-gray-300"}`}>
          <Text className={`text-xs ${disabled ? "text-gray-400" : "text-gray-500"}`}>Min</Text>
          <TextInput
            editable={!disabled}
            keyboardType="numeric"
            value={localMin}
            onChangeText={(t) => {
              setLocalMin(t);
              onChange({ min: parse(t), max: parse(localMax) });
            }}
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            className={`mt-1 ${disabled ? "text-gray-400" : "text-gray-900"}`}
          />
        </View>

        <View className={`flex-1 ml-2 border rounded-lg px-3 py-2 ${disabled ? "bg-gray-100 border-gray-200" : "border-gray-300"}`}>
          <Text className={`text-xs ${disabled ? "text-gray-400" : "text-gray-500"}`}>Max</Text>
          <TextInput
            editable={!disabled}
            keyboardType="numeric"
            value={localMax}
            onChangeText={(t) => {
              setLocalMax(t);
              onChange({ min: parse(localMin), max: parse(t) });
            }}
            placeholder="50000"
            placeholderTextColor="#9CA3AF"
            className={`mt-1 ${disabled ? "text-gray-400" : "text-gray-900"}`}
          />
        </View>
      </View>
    </View>
  );
}
