import { Stack } from "expo-router";
import { AddItemWizardProvider } from "@/src/hooks/useAddItemWizard";

export default function AddItemLayout() {
    return (
        <AddItemWizardProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </AddItemWizardProvider>
    );
}
