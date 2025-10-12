import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";

export default function FabPlus() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    // only show on education hub main pages (not inside chat, etc.)
    const isEducationHub = !!pathname?.includes("/education-hub");
    const isChatScreen = pathname?.includes("/education-hub/(chat)/ChatInterface") || 
                        pathname?.includes("/ChatInterface");

    if (!isEducationHub || isChatScreen) return null;

    const onPress = () => {
        // Navigate to a 'new' creation screen for the Education Hub if present
        // Use a relative route that matches your app router. Update if needed.
        router.push("/education-hub/post/new");
    };

    return (
        <View style={[styles.wrap, { bottom: (insets.bottom || 0) + 136 }]}> 
            <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.btn}>
                <Ionicons name="add" size={26} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: { position: "absolute", right: 16, zIndex: 60 },
    btn: {
        width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.brand.primary,
        alignItems: "center", justifyContent: "center",
        elevation: 6,
    },
});
