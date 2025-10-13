import React, { useMemo } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Platform,
    Alert,
    SafeAreaView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { router } from "expo-router";

import { auth } from "@/src/lib/firebase";
import { colors } from "@/src/theme/colors";
import { useUserProfile } from "@/src/hooks/useUserProfile";

const AVATAR_PLACEHOLDER =
    "https://ui-avatars.com/api/?name=U&background=8B5CF6&color=fff&size=128&rounded=true";

function cardShadow() {
    return Platform.select({
        ios: {
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 6 },
        },
        android: { elevation: 4 },
    });
}

export default function ProfileScreen() {
    const insets = useSafeAreaInsets();

    // fallback to auth user if hook unavailable
    const { user: profUser } = (() => {
        try {
            // @ts-ignore
            return useUserProfile?.() ?? { user: null };
        } catch {
            return { user: null };
        }
    })();

    const fbUser = auth.currentUser;
    const displayName = profUser?.displayName || fbUser?.displayName || "User";
    const photoURL = profUser?.photoURL || fbUser?.photoURL || AVATAR_PLACEHOLDER;
    const firstName = useMemo(
        () => (displayName || "User").trim().split(/\s+/)[0],
        [displayName]
    );

    async function onSignOut() {
        try {
            await signOut(auth);
            router.replace("/(auth)/login");
        } catch (e: any) {
            Alert.alert("Sign out failed", e?.message || "Try again.");
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F7FB" }}>
            {/* Header */}
            <View
                style={{
                    backgroundColor: colors.brand.primary,
                    paddingTop: insets.top + 10,
                    paddingHorizontal: 16,
                    paddingBottom: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                    activeOpacity={0.8}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                    <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginLeft: 6 }}>
                        Profile
                    </Text>
                </TouchableOpacity>
                <View style={{ width: 24 }} />
            </View>

            {/* Body */}
            <View
                style={{
                    flex: 1,
                    alignItems: "center",
                    paddingTop: 26,
                    paddingHorizontal: 20,
                }}
            >
                {/* Avatar */}
                <Image
                    source={{ uri: photoURL }}
                    style={{
                        width: 92,
                        height: 92,
                        borderRadius: 46,
                        borderWidth: 3,
                        borderColor: "#fff",
                    }}
                />

                {/* Greeting */}
                <Text
                    style={{
                        marginTop: 16,
                        fontSize: 24,
                        fontWeight: "800",
                        color: colors.brand?.primary || "#6D28D9",
                    }}
                >
                    Welcome Back {firstName}
                </Text>

                {/* Buttons */}
                <TouchableOpacity
                    onPress={() => router.push("/(app)/profile/edit")}
                    activeOpacity={0.9}
                    style={[
                        {
                            marginTop: 28,
                            width: "82%",
                            backgroundColor: "#fff",
                            paddingVertical: 16,
                            borderRadius: 16,
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: "#EFEFF5",
                        },
                        cardShadow(),
                    ]}
                >
                    <Text style={{ fontWeight: "700", color: "#111827" }}>
                        Edit Profile Details
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push("/(app)/profile/selling")}
                    activeOpacity={0.9}
                    style={[
                        {
                            marginTop: 18,
                            width: "82%",
                            backgroundColor: "#fff",
                            paddingVertical: 16,
                            borderRadius: 16,
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: "#EFEFF5",
                        },
                        cardShadow(),
                    ]}
                >
                    <Text style={{ fontWeight: "700", color: "#111827" }}>
                        My Selling/Donate
                    </Text>
                </TouchableOpacity>

                {/* Sign out */}
                <TouchableOpacity
                    onPress={onSignOut}
                    activeOpacity={0.9}
                    style={[
                        {
                            marginTop: 28,
                            width: "70%",
                            backgroundColor: "#EF4444",
                            paddingVertical: 14,
                            borderRadius: 12,
                            alignItems: "center",
                        },
                        Platform.select({ android: { elevation: 2 } }),
                    ]}
                >
                    <Text style={{ color: "white", fontWeight: "800" }}>Sign Out</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
