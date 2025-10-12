import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import StepHeader from "@/src/components/lifecycle/stepHeader";
import Field from "@/src/components/lifecycle/Field";
import DateField from "@/src/components/lifecycle/DateField";
import ToggleRow from "@/src/components/lifecycle/ToggleRow";
import { colors } from "@/src/theme/colors";
import { step2Schema, Step2Values } from "@/src/validators/itemSchemas";
import { useAddItemWizard } from "@/src/hooks/useAddItemWizard";

// ---------- helpers ----------
function fmt(d: Date) {
    return d.toISOString().slice(0, 10);
}
function addMonths(isoDate: string, months: number) {
    const d = new Date(isoDate + "T00:00:00");
    const nd = new Date(d);
    nd.setMonth(nd.getMonth() + (months || 0));
    // clamp if month overflowed (e.g., Jan 31 + 1m)
    if (nd.getDate() !== d.getDate()) nd.setDate(0);
    return fmt(nd);
}

export default function Step2() {
    const { draft, setPartial } = useAddItemWizard();

    // If user manually edits expiry we stop auto-sync
    const [expiryEdited, setExpiryEdited] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<Step2Values>({
        resolver: zodResolver(step2Schema),
        defaultValues: {
            purchaseDate: draft.purchaseDate || "",
            warrantyMonths: draft.warrantyMonths ?? 0,
            warrantyExpiry: draft.warrantyExpiry || "",
            trackWarranty: draft.trackWarranty ?? false,
        },
    });

    // --- AUTO COMPUTE EXPIRY (AFTER RENDER) ---
    const purchaseDate = watch("purchaseDate");
    const warrantyMonths = watch("warrantyMonths");

    useEffect(() => {
        if (expiryEdited) return;
        if (!purchaseDate) return;
        const monthsNum = Number(warrantyMonths || 0);
        if (Number.isNaN(monthsNum) || monthsNum < 0) return;

        const computed = addMonths(purchaseDate, monthsNum);
        // safe to update here (not during render)
        setValue("warrantyExpiry", computed, { shouldValidate: true, shouldDirty: false });
    }, [purchaseDate, warrantyMonths, expiryEdited, setValue]);

    const onBack = () => router.push("/(app)/(tabs)/lifecycle/add/step-1");

    const onSaveDraft = handleSubmit((data) => {
        setPartial(data);
        Alert.alert("Saved", "Your draft is saved. You can come back anytime.");
    });

    const onNext = handleSubmit((data) => {
        setPartial(data);
        router.push("/(app)/(tabs)/lifecycle/add/step-3");
    });

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-surface-subtle">
            {/* Header + Back */}
            <View>
                <StepHeader title="Add New Item" step={2} total={5} />
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

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                {/* Purchase date (required) */}
                <Controller
                    control={control}
                    name="purchaseDate"
                    render={({ field: { value, onChange } }) => (
                        <DateField
                            label="Purchase Date *"
                            value={value}
                            onChange={(iso) => onChange(iso)}
                            error={errors.purchaseDate?.message}
                            maximumDate={new Date()}
                        />
                    )}
                />

                {/* Warranty months (number) */}
                <Controller
                    control={control}
                    name="warrantyMonths"
                    render={({ field: { value, onChange } }) => (
                        <Field
                            label="Warranty (months)"
                            error={errors.warrantyMonths?.message?.toString()}
                            inputProps={{
                                placeholder: "e.g., 24",
                                keyboardType: "number-pad",
                                value: String(value ?? ""),
                                onChangeText: (t: string) => {
                                    const n = parseInt(t.replace(/[^\d]/g, ""), 10);
                                    onChange(Number.isFinite(n) ? n : 0);
                                },
                            }}
                        />
                    )}
                />

                {/* Warranty expiry (auto, but editable) */}
                <Controller
                    control={control}
                    name="warrantyExpiry"
                    render={({ field: { value, onChange } }) => (
                        <DateField
                            label="Warranty expiry (auto)"
                            value={value}
                            onChange={(iso) => {
                                setExpiryEdited(true);
                                onChange(iso);
                            }}
                            error={errors.warrantyExpiry?.message}
                            minimumDate={purchaseDate ? new Date(purchaseDate + "T00:00:00") : undefined}
                        />
                    )}
                />

                {/* Track warranty reminder toggle */}
                <Controller
                    control={control}
                    name="trackWarranty"
                    render={({ field: { value, onChange } }) => (
                        <ToggleRow
                            label="Track warranty reminder"
                            value={!!value}
                            onValueChange={onChange}
                            hint="We'll notify you before it expires"
                        />
                    )}
                />

                {/* Footer buttons */}
                <View className="flex-row mt-6">
                    <TouchableOpacity
                        onPress={onSaveDraft}
                        activeOpacity={0.9}
                        className="flex-1 mr-2 rounded-xl bg-white border border-surface-foreground py-3 items-center"
                    >
                        <Text className="text-text font-semibold">{isSubmitting ? "Saving…" : "Save draft"}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onNext}
                        activeOpacity={0.9}
                        className="flex-1 ml-2 rounded-xl py-3 items-center"
                        style={{ backgroundColor: colors.brand.accent }}
                    >
                        <Text className="text-white font-semibold">Next</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
