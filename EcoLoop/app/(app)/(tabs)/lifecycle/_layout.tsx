import { Stack } from "expo-router";
export default function LifecycleLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="item/[id]" />
            <Stack.Screen name="add/step-1" />
        </Stack>
    );
}
