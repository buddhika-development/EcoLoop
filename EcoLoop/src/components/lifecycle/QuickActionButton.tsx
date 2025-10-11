import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/src/theme/colors";

type Props = {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress?: () => void;
};

export default function QuickActionButton({ icon, label, onPress }: Props) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                paddingVertical: 16,
                paddingHorizontal: 14,
                flexDirection: "row",
                alignItems: "center",
                // shadow
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
                elevation: 2,
            }}
        >
            <View
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: colors.surface.foreground,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                }}
            >
                <Ionicons name={icon} size={18} color={colors.brand.primary} />
            </View>
            <Text style={{ color: colors.text.base, fontWeight: "600" }}>{label}</Text>
        </TouchableOpacity>
    );
}
