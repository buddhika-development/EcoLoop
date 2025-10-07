import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";

export default function FabChatbot({ onPress }: { onPress: () => void }) {
    const insets = useSafeAreaInsets();
    return (
        <View style={[styles.wrap, { bottom: (insets.bottom || 0) + 72 }]}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.btn}>
                <Ionicons name="chatbubbles" size={22} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { position: "absolute", right: 16, zIndex: 50 },
    btn: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: colors.brand.primary,
        alignItems: "center", justifyContent: "center",
        elevation: 5,
    },
});
