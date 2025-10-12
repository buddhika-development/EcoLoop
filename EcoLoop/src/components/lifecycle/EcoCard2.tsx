import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/src/theme/colors";


export default function EcoCard({
    title,
    subtitle,
    rightIcon = "leaf",
}: {
    title: string;
    subtitle?: string;
    rightIcon?: keyof typeof Ionicons.glyphMap;
}) {
    return (
        <View
            style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                paddingVertical: 14,
                paddingHorizontal: 16,
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
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text.base }}>{title}</Text>
                {!!subtitle && (
                    <Text style={{ marginTop: 4, color: colors.text.hint }} numberOfLines={2}>
                        {subtitle}
                    </Text>
                )}

            </View>
            <View
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.surface.foreground,
                }}
            >
                <Ionicons name={rightIcon} size={18} color={colors.brand.accent} />
            </View>
        </View>
    );
}
