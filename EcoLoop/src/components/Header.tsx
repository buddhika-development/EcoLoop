import { View, TouchableOpacity, Image, StyleSheet, Text } from "react-native";
import { colors } from "../theme/colors";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { Link, router } from "expo-router";

/**
 * Header:
 * - Left: EcoLoop logo (purple bg version) from assets/logo2.png
 * - Right: User avatar. If no photo, show initial in a circle.
 * - Tap avatar => navigate to Profile screen (/(app)/profile)
 */
export default function Header() {
    const { user, profile } = useUserProfile();

    const displayName =
        profile?.fullName ||
        user?.displayName ||
        (user?.email ? user.email.split("@")[0] : "U");

    const initial = (displayName ?? "U").trim().charAt(0).toUpperCase();
    const avatarUrl = profile?.profilePic || user?.photoURL || null;

    return (
        <View style={styles.wrapper}>
            <Link href="/(app)/(tabs)/home" asChild>
                <Image
                    source={require("@/assets/logo2.png")}
                    resizeMode="contain"
                    style={styles.logo}
                />
            </Link>

            <View style={{ flex: 1 }} />

            <TouchableOpacity
                style={styles.avatarBtn}
                onPress={() => router.push("/(app)/profile" as any)}
                activeOpacity={0.8}
            >
                {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
                ) : (
                    <View style={styles.initialCircle}>
                        <Text style={styles.initialText}>{initial}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        height: 56,
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.brand.primary,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.surface.foreground,
    },
    logo: { width: 70, height: 70, marginTop: -12, marginLeft: -6 },
    avatarBtn: { width: 36, height: 36, borderRadius: 18, overflow: "hidden" },
    avatarImg: { width: "100%", height: "100%" },
    initialCircle: {
        width: "100%",
        height: "100%",
        borderRadius: 18,
        backgroundColor: "#FFFFFF33",
        alignItems: "center",
        justifyContent: "center",
    },
    initialText: { color: "#fff", fontWeight: "700" },
});
