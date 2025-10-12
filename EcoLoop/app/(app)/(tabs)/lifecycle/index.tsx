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
import { useEcoTipClient } from "@/src/hooks/useEcoTipClient";


const heroBg = require("@/assets/lifecycleBG.png");

// ⬇️ a touch taller for better overlap + hero presence
const HERO_HEIGHT = 280;

export default function LifecycleHub() {
    const insets = useSafeAreaInsets();
    const { loading, itemsCount, maintDue, warrantyAlerts, ecoKgSaved, suggestion } =
        useLifecycleStats();

    const { data: ecoTip, loading: tipLoading } = useEcoTipClient("lifecycle care");

    // --- simple hero animation (fade + scale from 1.05 -> 1) ---
    const bgProgress = useSharedValue(0);
    React.useEffect(() => {
        console.log("Gemini tip:", ecoTip);
        bgProgress.value = withTiming(1, {
            duration: 850,
            easing: Easing.out(Easing.cubic),
        });
    }, []);

    React.useEffect(() => {
        if (ecoTip) console.log("✅ Eco tip shown:", ecoTip.tip);
    }, [ecoTip]);


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
                    borderBottomLeftRadius: 32,
                    borderBottomRightRadius: 32,
                    overflow: "hidden",
                }}
            >
                {/* background artwork (animated) */}
                <Animated.Image
                    source={heroBg}
                    resizeMode="cover"
                    style={[
                        {
                            position: "absolute",
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: "100%",
                            height: HERO_HEIGHT,
                        },
                        bgAnimStyle,
                    ]}
                />

                {/* subtle overlay for readability */}
                <View className="absolute inset-0 bg-black/5" />

                {/* hero content */}
                <View className="px-6 pt-2">
                    <Animated.View entering={FadeInDown.duration(500).delay(80)}>
                        <Text className="text-white text-[30px] font-extrabold">Lifecycle Hub</Text>
                        <Text className="text-white/85 mt-1">
                            Track, maintain, and extend your items' life.
                        </Text>
                    </Animated.View>

                    {/* stat cluster in a soft glass panel */}
                    <View className="mt-4">
                        <View className="rounded-2xl bg-white/10 border border-white/15 px-3 py-2">
                            <View className="flex-row items-stretch">
                                <Animated.View
                                    className="flex-1 mr-2"
                                    entering={FadeInUp.delay(150).duration(400)}
                                >
                                    <StatPill value={loading ? "…" : itemsCount} label="items" />
                                </Animated.View>
                                <Animated.View
                                    className="flex-1 mx-1"
                                    entering={FadeInUp.delay(230).duration(420)}
                                >
                                    <StatPill value={loading ? "…" : maintDue} label="Maintenances due" />
                                </Animated.View>
                                <Animated.View
                                    className="flex-1 ml-2"
                                    entering={FadeInUp.delay(310).duration(440)}
                                >
                                    <StatPill value={loading ? "…" : warrantyAlerts} label="Warranty alerts" />
                                </Animated.View>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* ---------- BODY ---------- */}
            <ScrollView
                contentContainerStyle={{ paddingBottom: 40 }}
                className="px-5 -mt-6"
            >
                {/* eco impact card slightly overlapping hero for depth */}
                <Animated.View
                    entering={FadeIn.duration(400).delay(120)}
                    className="rounded-2xl"
                    style={{
                        shadowColor: "#000",
                        shadowOpacity: 0.06,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 6 },
                        elevation: 3,
                    }}
                >
                    <EcoCard
                        title="Eco impact"
                        subtitle={`You saved ${loading ? "…" : ecoKgSaved} kg of e-waste this year.`}
                        rightIcon="leaf"
                    />
                </Animated.View>

                {!!suggestion && (
                    <Animated.View
                        className="mt-3"
                        entering={FadeIn.duration(400).delay(180)}
                        style={{
                            shadowColor: "#000",
                            shadowOpacity: 0.04,
                            shadowRadius: 8,
                            shadowOffset: { width: 0, height: 4 },
                            elevation: 2,
                        }}
                    >
                        <EcoCard title="Smart suggestion" subtitle={suggestion} rightIcon="bulb" />
                    </Animated.View>
                )}

                <Animated.Text
                    className="text-text font-bold text-[17px] mt-6 mb-3"
                    entering={FadeInDown.duration(350).delay(220)}
                >
                    Quick actions
                </Animated.Text>

                {/* tighter grid with consistent gutters */}
                <View className="flex-row -mx-2 flex-wrap">
                    <Animated.View
                        className="w-1/2 px-2 mb-3"
                        entering={FadeInUp.delay(260).duration(380)}
                    >
                        <QuickActionButton
                            icon="add"
                            label="Add Item"
                            onPress={() => router.push("/(app)/(tabs)/lifecycle/add/step-1")}
                        />
                    </Animated.View>
                    <Animated.View
                        className="w-1/2 px-2 mb-3"
                        entering={FadeInUp.delay(300).duration(380)}
                    >
                        <QuickActionButton
                            icon="qr-code-outline"
                            label="Scan QR"
                            onPress={() => router.push("/(app)/(tabs)/lifecycle/item/scan")}
                        />
                    </Animated.View>
                    <Animated.View
                        className="w-1/2 px-2 mb-3"
                        entering={FadeInUp.delay(340).duration(380)}
                    >
                        <QuickActionButton
                            icon="notifications-outline"
                            label="Reminders"
                            onPress={() => router.push("/(app)/(tabs)/lifecycle/item/reminders")}
                        />
                    </Animated.View>
                    <Animated.View
                        className="w-1/2 px-2 mb-3"
                        entering={FadeInUp.delay(380).duration(380)}
                    >
                        <QuickActionButton
                            icon="list-outline"
                            label="My Items"
                            onPress={() => router.push("/(app)/(tabs)/lifecycle/item/list")}
                        />
                    </Animated.View>
                </View>

                <Animated.Text
                    className="text-text font-bold text-[17px] mt-6 mb-2"
                    entering={FadeInDown.delay(420).duration(300)}
                >
                    Tip
                </Animated.Text>

                <Animated.View
                    entering={FadeIn.delay(450).duration(350)}
                    className="bg-white rounded-2xl px-5 py-4 border border-surface-foreground/60"
                    style={{
                        shadowColor: "#000",
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 3 },
                        elevation: 2,
                    }}
                >
                    <Text className="text-text">
                        {tipLoading
                            ? "Loading a smart sustainability tip…"
                            : (ecoTip?.tip ?? "Keep devices longer by maintaining them.")}
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
