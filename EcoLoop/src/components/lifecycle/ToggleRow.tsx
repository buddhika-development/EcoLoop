import { View, Text, Switch } from "react-native";
import { colors } from "@/src/theme/colors";

type Props = {
    label: string;
    value: boolean;
    onValueChange: (v: boolean) => void;
    hint?: string;
};

export default function ToggleRow({ label, value, onValueChange, hint }: Props) {
    return (
        <View className="bg-white rounded-2xl px-4 py-4 border border-gray-200 mb-3">
            <View className="flex-row items-center justify-between">
                <Text className="text-text font-semibold">{label}</Text>
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: "#ddd", true: colors.brand.primary }}
                    thumbColor={value ? "#fff" : "#fff"}
                />
            </View>
            {!!hint && <Text className="text-text-hint mt-1">{hint}</Text>}
        </View>
    );
}
