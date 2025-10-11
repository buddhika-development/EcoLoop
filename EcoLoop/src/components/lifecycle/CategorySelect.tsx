// src/components/lifecycle/CategorySelect.tsx
import { View, Text } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { colors } from "@/src/theme/colors";

const CATEGORIES = [
    { label: "Home Appliances", value: "home-appliance" },
    { label: "Electronics", value: "electronics" },
    { label: "Office Equipment", value: "office-equipment" },
    { label: "Furniture", value: "furniture" },
    { label: "Other", value: "other" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

export default function CategorySelect({
    value,
    onChange,
    error,
}: {
    value?: CategoryValue;
    onChange: (v: CategoryValue) => void;
    error?: string;
}) {
    return (
        <View className="mb-3">
            <Text className="text-text font-semibold mb-1">Category</Text>
            <View
                className="rounded-xl bg-white border"
                style={{ borderColor: error ? "#F87171" : colors.surface.foreground }}
            >
                <Picker
                    selectedValue={value}
                    onValueChange={(v) => onChange(v as CategoryValue)}
                    dropdownIconColor={colors.text.base}
                >
                    {CATEGORIES.map((c) => (
                        <Picker.Item key={c.value} label={c.label} value={c.value} />
                    ))}
                </Picker>
            </View>
            {!!error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
        </View>
    );
}
