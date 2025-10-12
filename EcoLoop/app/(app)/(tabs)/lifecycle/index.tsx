import { ScrollView, View, Text, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Animated, {
    Easing,
    FadeIn,
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { colors } from "@/src/theme/colors";
import { useLifecycleStats } from "@/src/hooks/useLifecycleStats";
import StatPill from "@/src/components/lifecycle/StatPill";
import QuickActionButton from "@/src/components/lifecycle/QuickActionButton";
import EcoCard from "@/src/components/lifecycle/EcoCard";
import React from "react";

const heroBg = require("@/assets/lifecycleBG.png");
const HERO_HEIGHT = 260;

export default function LifecycleHub() {
    const insets = useSafeAreaInsets();
    const { loading, itemsCount, maintDue, warrantyAlerts, ecoKgSaved, suggestion } =
        useLifecycleStats();

    // --- simple hero animation (fade + scale from 1.05 -> 1) ---
    const bgProgress = useSharedValue(0);
    React.useEffect(() => {
        bgProgress.value = withTiming(1, {
            duration: 850,
            easing: Easing.out(Easing.cubic),
        });
    }, []);

    const bgAnimStyle = useAnimatedStyle(() => ({
        opacity: 0.25 + 0.75 * bgProgress.value,
        transform: [{ scale: 1.05 - 0.05 * bgProgress.value }],
    }));

    return (
        <View className="flex-1 bg-surface-subtle">
            {/* ---------- HERO ---------- */}
            <View
                style={{
                    paddingTop: insets.top,
                    height: HERO_HEIGHT,
                    backgroundColor: colors.brand.primary,
                    borderBottomLeftRadius: 80,
                    borderBottomRightRadius: 80,
                    overflow: "hidden",
                }}
            >
                {/* Background artwork (animated) */}
                <Animated.Image
                    source={heroBg}
                    resizeMode="cover"
                    style={[
                        {
                            position: "absolute",
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: -70,
                            width: "100%",
                            height: HERO_HEIGHT + 60,
                        },
                        bgAnimStyle,
                    ]}
                />

                {/* Hero content */}
                <View className="px-6">
                    <Animated.View entering={FadeInDown.duration(500).delay(80)}>
                        <Text className="text-white text-[30px] font-extrabold mt-2">Lifecycle Hub</Text>
                        <Text className="text-white/90 mt-1">
                            Track, maintain, and extend your items' life.
                        </Text>
                    </Animated.View>

                    {/* Stats row (staggered) */}
                    <View className="flex-row mt-4 items-stretch">
                        <Animated.View style={{ flex: 1, marginRight: 8 }} entering={FadeInUp.delay(150).duration(400)}>
                            <StatPill value={loading ? "…" : itemsCount} label="items" />
                        </Animated.View>
                        <Animated.View style={{ flex: 1, marginHorizontal: 4 }} entering={FadeInUp.delay(230).duration(420)}>
                            <StatPill value={loading ? "…" : maintDue} label="Maintenances due" />
                        </Animated.View>
                        <Animated.View style={{ flex: 1, marginLeft: 8 }} entering={FadeInUp.delay(310).duration(440)}>
                            <StatPill value={loading ? "…" : warrantyAlerts} label="Warranty alerts" />
                        </Animated.View>
                    </View>
                </View>
            </View>

            {/* ---------- BODY ---------- */}
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="px-5 -mt-6">
                <Animated.View entering={FadeIn.duration(400).delay(120)}>
                    <EcoCard
                        title="Eco impact"
                        subtitle={`You saved ${loading ? "…" : ecoKgSaved} kg of e-waste this year.`}
                        rightIcon="leaf"
                    />
                </Animated.View>

                {!!suggestion && (
                    <Animated.View className="mt-3" entering={FadeIn.duration(400).delay(180)}>
                        <EcoCard title="Smart suggestion" subtitle={suggestion} rightIcon="bulb" />
                    </Animated.View>
                )}

                <Animated.Text
                    className="text-text font-bold text-lg mt-5 mb-3"
                    entering={FadeInDown.duration(350).delay(220)}
                >
                    Quick actions
                </Animated.Text>

                <View className="flex-row -mx-2 flex-wrap">
                    <Animated.View className="w-1/2 px-2 mb-3" entering={FadeInUp.delay(260).duration(380)}>
                        <QuickActionButton
                            icon="add"
                            label="Add Item"
                            onPress={() => router.push("/(app)/(tabs)/lifecycle/add/step-1")}
                        />
                    </Animated.View>
                    <Animated.View className="w-1/2 px-2 mb-3" entering={FadeInUp.delay(300).duration(380)}>
                        <QuickActionButton
                            icon="qr-code-outline"
                            label="Scan QR"
                            onPress={() => router.push("/(app)/(tabs)/lifecycle/item/scan")}
                        />
                    </Animated.View>
                    <Animated.View className="w-1/2 px-2" entering={FadeInUp.delay(340).duration(380)}>
                        <QuickActionButton
                            icon="notifications-outline"
                            label="Reminders"
                            onPress={() => router.push("/(app)/(tabs)/lifecycle/item/reminders")}
                        />
                    </Animated.View>
                    <Animated.View className="w-1/2 px-2" entering={FadeInUp.delay(380).duration(380)}>
                        <QuickActionButton
                            icon="list-outline"
                            label="My Items"
                            onPress={() => router.push("/(app)/(tabs)/lifecycle/item/list")}
                        />
                    </Animated.View>
                </View>

                <Animated.Text
                    className="text-text font-bold text-lg mt-6 mb-2"
                    entering={FadeInDown.delay(420).duration(300)}
                >
                    Tip
                </Animated.Text>
                <Animated.View
                    entering={FadeIn.delay(450).duration(350)}
                    className="bg-white rounded-2xl px-5 py-4"
                    style={{
                        shadowColor: "#000",
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 3 },
                        elevation: 2,
                    }}
                >
                    <Text className="text-text">
                        Recycling one TV saves ~1 kg of copper. Small steps → big impact 🌱
                    </Text>
                </Animated.View>

                {loading && (
                    <View className="absolute inset-0 items-center justify-center">
                        <ActivityIndicator />
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
