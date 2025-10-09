// app/(app)/_layout.tsx
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/src/providers/AuthProvider";
import "@/app/global.css";

export default function AppLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    {/* Tabs group as main home navigation */}
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                    {/* Profile screen outside tabs (so not shown in bottom nav) */}
                    <Stack.Screen
                        name="profile"
                        options={{
                            headerShown: false,
                            presentation: "card",
                        }}
                    />
                </Stack>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
