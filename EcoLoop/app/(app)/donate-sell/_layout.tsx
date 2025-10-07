import { Stack } from "expo-router";
export default function DonateSellLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="new" />
            <Stack.Screen name="listing/[id]" />
        </Stack>
    );
}
