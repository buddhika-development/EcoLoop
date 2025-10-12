import { useState, useMemo } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import StepHeader from "@/src/components/lifecycle/stepHeader";
import { colors } from "@/src/theme/colors";
import { useAddItemWizard } from "@/src/hooks/useAddItemWizard";
import { createItemFromWizard } from "@/src/services/item";

export default function Step5() {
    const { draft, reset } = useAddItemWizard();
    const [saving, setSaving] = useState(false);

    const onBack = () => router.push("/(app)/(tabs)/lifecycle/add/step-4");

    const onSave = async () => {
        try {
            if (!draft.name || !draft.category) {
                return Alert.alert("Missing info", "Please complete required fields in previous steps.");
            }
            setSaving(true);
            const { id } = await createItemFromWizard(draft);
            reset();
            Alert.alert("Saved!", "Your item has been added.", [
                {
                    text: "View item",
                    onPress: () =>
                        router.push({
                            pathname: "/(app)/(tabs)/lifecycle/item/[id]",
                            params: { id }
                        }),
                },
            ]);
        } catch (e: any) {
            console.error(e);
            Alert.alert("Error", e?.message || "Failed to save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    // Preview helpers
    const cover = draft.imagesLocal?.[0]?.uri;

    return (
        <View className="flex-1 bg-surface-subtle">
            <View>
                <StepHeader title="Add New Item" step={5} total={5} subtitle="Preview" />
                <TouchableOpacity
                    onPress={onBack}
                    activeOpacity={0.8}
                    style={{
                        position: "absolute",
                        top: Platform.OS === "ios" ? 30 : 10,
                        left: 16,
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: "rgba(255,255,255,0.7)",
                        borderRadius: 999,
                        padding: 8,
                    }}
                >
                    <Ionicons name="arrow-back" size={22} color={colors.text.base} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
                {/* Hero preview image */}
                <View className="rounded-2xl overflow-hidden border border-surface-foreground mb-4 bg-white">
                    {cover ? (
                        <Image source={{ uri: cover }} style={{ width: "100%", height: 180 }} resizeMode="cover" />
                    ) : (
                        <View className="items-center justify-center" style={{ height: 180 }}>
                            <Ionicons name="image" size={28} color={colors.text.hint} />
                            <Text className="text-text-hint mt-1">No image</Text>
                        </View>
                    )}
                </View>

                {/* Summary cards */}
                <View className="bg-white rounded-2xl border border-surface-foreground p-14px px-4 py-4 mb-3">
                    <Text className="text-lg font-extrabold text-text">{draft.name}</Text>
                    <Text className="text-text-hint mt-1">{draft.category}</Text>
                    {!!draft.description && <Text className="mt-3 text-text">{draft.description}</Text>}

                    <View className="flex-row flex-wrap gap-2 mt-3">
                        {!!draft.brand && <Pill>Brand: {draft.brand}</Pill>}
                        {!!draft.model && <Pill>Model: {draft.model}</Pill>}
                    </View>
                </View>

                <Info
                    title="Purchase & Warranty"
                    rows={[
                        ["Purchase date", draft.purchaseDate || "—"],
                        ["Warranty (months)", String(draft.warrantyMonths ?? 0)],
                        ["Expiry", draft.warrantyExpiry || "—"],
                        ["Track warranty", draft.trackWarranty ? "Yes" : "No"],
                    ]}
                />

                <Info
                    title="Maintenance"
                    rows={[
                        ["Rule", draft.maintenance?.frequency || "none"],
                        ["First date", draft.maintenance?.firstDate || "—"],
                        ["Time", draft.maintenance?.time || "—"],
                        ["Notifications", draft.maintenance?.enabled ? "On" : "Off"],
                        ["Next reminder", draft.maintenance?.nextDate || "—"],
                    ]}
                />

                {/* Save */}
                <TouchableOpacity
                    disabled={saving}
                    onPress={onSave}
                    activeOpacity={0.9}
                    className="mt-6 rounded-xl py-3 items-center"
                    style={{ backgroundColor: colors.brand.accent, opacity: saving ? 0.7 : 1 }}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-semibold">Save Item</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

function Pill({ children }: { children: React.ReactNode }) {
    return (
        <View className="px-2 py-1 rounded-full bg-surface-foreground/30">
            <Text className="text-xs text-text-hint">{children}</Text>
        </View>
    );
}

function Info({
    title,
    rows,
}: {
    title: string;
    rows: [string, string | number | null | undefined][];
}) {
    return (
        <View className="bg-white rounded-2xl border border-surface-foreground px-4 py-4 mb-3">
            <Text className="text-base font-bold mb-2">{title}</Text>
            {rows.map(([k, v], i) => (
                <View
                    key={i}
                    className="flex-row items-center justify-between py-2"
                    style={{ borderTopWidth: i === 0 ? 0 : 1, borderColor: "#eee" }}
                >
                    <Text className="text-text-hint">{k}</Text>
                    <Text className="text-text">{v ?? "—"}</Text>
                </View>
            ))}
        </View>
    );
}
