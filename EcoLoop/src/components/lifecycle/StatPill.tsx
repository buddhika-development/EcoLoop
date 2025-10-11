import { View, Text, ViewStyle } from "react-native";
import { colors } from "@/src/theme/colors";

export default function StatPill({
    value,
    label,
    style,
}: {
    value: number | string;
    label: string;
    style?: ViewStyle;
}) {
    return (
        <View
            style={[
                {
                    flex: 1,               // <- equal widths for 3 pills
                    minHeight: 84,
                    backgroundColor: colors.surface.base,
                    borderRadius: 16,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    // card shadow
                    shadowColor: "#000",
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 3 },
                    elevation: 2,
                },
                style,
            ]}
        >
            <Text style={{ fontSize: 17, fontWeight: "800", color: colors.text.base }}>
                {String(value)}
            </Text>
            <Text style={{ marginTop: 4, color: colors.text.hint, textAlign: "center" }}>{label}</Text>
        </View>
    );
}
