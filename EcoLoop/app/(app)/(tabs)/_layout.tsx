// app/(app)/(tabs)/_layout.tsx
import FabChatbot from "@/src/components/FabChatbot";
import Header from "@/src/components/Header";
import { colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1, backgroundColor: colors.brand.primary }}>
            <StatusBar style="light" translucent={false} backgroundColor={colors.brand.primary} />
            <View style={{ height: insets.top, backgroundColor: colors.brand.primary }} />
            <Header />

            <View style={{ flex: 1 }}>
                <Tabs
                    screenOptions={{
                        headerShown: false,
                        tabBarHideOnKeyboard: true,
                        tabBarActiveTintColor: colors.surface.base,
                        tabBarInactiveTintColor: colors.surface.foreground,
                        tabBarLabelStyle: { fontSize: 12, marginBottom: 2 },
                        tabBarItemStyle: { paddingVertical: 4 },
                        tabBarStyle: {
                            height: 60 + (insets.bottom || 0),
                            paddingTop: 6,
                            paddingBottom: Math.max(insets.bottom, 8),
                            backgroundColor: colors.brand.primary,
                            borderTopWidth: 1,
                            borderTopColor: colors.surface.foreground,
                            elevation: 12,
                            shadowColor: colors.surface.foreground,
                            shadowOpacity: 0.06,
                            shadowRadius: 6,
                            shadowOffset: { width: 0, height: -2 },
                        },
                    }}
                >
                    <Tabs.Screen
                        name="home"
                        options={{
                            title: "Home",
                            tabBarIcon: ({ size, color }) => <Ionicons name="home" size={size} color={color} />,
                        }}
                    />
                    <Tabs.Screen
                        name="repair-recycle"
                        options={{
                            title: "Repair",
                            tabBarIcon: ({ size, color }) => <Ionicons name="build" size={size} color={color} />,
                        }}
                    />
                    <Tabs.Screen
                        name="donate-sell"
                        options={{
                            title: "Donate",
                            tabBarIcon: ({ size, color }) => (
                                <Ionicons name="swap-horizontal" size={size} color={color} />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="lifecycle"
                        options={{
                            title: "Lifecycle",
                            tabBarIcon: ({ size, color }) => (
                                <Ionicons name="analytics" size={size} color={color} />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="education-hub"
                        options={{
                            title: "Education",
                            tabBarIcon: ({ size, color }) => <Ionicons name="book" size={size} color={color} />,
                        }}
                    />
                </Tabs>

                <FabChatbot />
            </View>
        </View>
    );
}
