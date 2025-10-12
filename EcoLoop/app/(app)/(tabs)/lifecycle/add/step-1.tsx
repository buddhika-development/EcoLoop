// app/(app)/(tabs)/lifecycle/add/step-1.tsx
import { useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import StepHeader from "@/src/components/lifecycle/stepHeader";
import Field from "@/src/components/lifecycle/Field";
import CategorySelect, { CategoryValue } from "@/src/components/lifecycle/CategorySelect";
import { colors } from "@/src/theme/colors";
import { step1Schema, Step1Values } from "@/src/validators/itemSchemas";
import { useAddItemWizard } from "@/src/hooks/useAddItemWizard";

// ---------- simple AI suggestion (local stub) ----------
function guessCategory(name: string): CategoryValue {
    const n = name.toLowerCase();
    if (/(fridge|refrigerator|microwave|oven|vacuum|washer|dryer|dishwasher|washing machine|air[-\s]?fryer)/.test(n))
        return "home-appliance";
    if (/(phone|tablet|laptop|tv|camera|headphone|monitor|console|speaker|earbud)/.test(n))
        return "electronics";
    if (/(printer|fax|photocopier|projector|scanner|shredder)/.test(n))
        return "office-equipment";
    if (/(sofa|chair|table|desk|wardrobe|bed|shelf|cabinet)/.test(n))
        return "furniture";
    return "other";
}

export default function Step1() {
    const { draft, setPartial } = useAddItemWizard();

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<Step1Values>({
        resolver: zodResolver(step1Schema),
        defaultValues: {
            name: draft.name || "",
            category: (draft.category as CategoryValue) || "home-appliance",
            brand: draft.brand || "",
            model: draft.model || "",
            description: draft.description || "",
        },
    });

    // fill AI suggestion when user taps the chip
    const onSuggest = (currentName?: string) => {
        const name = (currentName || "").trim();
        if (!name) {
            Alert.alert("AI Suggestion", "Type an item name first (e.g., Samsung TV)");
            return;
        }
        const c = guessCategory(name);
        setValue("category", c, { shouldValidate: true });
    };

    const onSaveDraft = handleSubmit((data) => {
        setPartial(data);
        Alert.alert("Saved", "Your draft is saved. You can come back anytime.");
    });

    const onNext = handleSubmit((data) => {
        setPartial(data);
        router.push("/(app)/(tabs)/lifecycle/add/step-2");
    });

    const onBack = () => {
        router.push("/(app)/(tabs)/lifecycle");
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-surface-subtle">
            <View>
                <StepHeader title="Add New Item" step={1} total={5} />
                <TouchableOpacity
                    onPress={onBack}
                    activeOpacity={0.8}
                    hitSlop={10}
                    style={{
                        position: "absolute",
                        top: Platform.OS === "ios" ? 30 : 10,
                        left: 16,
                        zIndex: 2, // <— keep button above but small hit area
                        backgroundColor: "rgba(255,255,255,0.7)",
                        borderRadius: 999,
                        padding: 8,
                    }}
                >
                    <Ionicons name="arrow-back" size={22} color={colors.text.base} />
                </TouchableOpacity>
            </View>

            <View
                style={{
                    flex: 1,
                    position: "relative",
                    zIndex: 0, // <— ensures ScrollView & children get touch priority
                }}
            >
                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                    {/* Item name + AI chip */}
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { value, onChange } }) => (
                            <>
                                <Field
                                    label="Item Name *"
                                    error={errors.name?.message}
                                    inputProps={{
                                        placeholder: "e.g., Samsung TV",
                                        value,
                                        onChangeText: onChange,
                                        autoCapitalize: "words",
                                        returnKeyType: "next",
                                    }}
                                />
                                <TouchableOpacity
                                    onPress={() => onSuggest(value)}
                                    activeOpacity={0.9}
                                    style={{
                                        alignSelf: "flex-start",
                                        marginTop: -6,
                                        marginBottom: 6,
                                        backgroundColor: "#EEE8FF",
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 999,
                                        flexDirection: "row",
                                        alignItems: "center",
                                    }}
                                >
                                    <Ionicons name="sparkles-outline" size={16} color={colors.brand.primary} />
                                    <Text style={{ color: colors.brand.primary, marginLeft: 6, fontWeight: "600" }}>
                                        AI Suggest Category
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    />

                    {/* Category */}
                    <Controller
                        control={control}
                        name="category"
                        render={({ field: { value, onChange } }) => (
                            <CategorySelect value={value as CategoryValue} onChange={onChange} error={errors.category?.message} />
                        )}
                    />

                    {/* Brand */}
                    <Controller
                        control={control}
                        name="brand"
                        render={({ field: { value, onChange } }) => (
                            <Field
                                label="Brand"
                                error={errors.brand?.message}
                                inputProps={{ placeholder: "e.g., Samsung", value, onChangeText: onChange }}
                            />
                        )}
                    />

                    {/* Model */}
                    <Controller
                        control={control}
                        name="model"
                        render={({ field: { value, onChange } }) => (
                            <Field
                                label="Model Number"
                                error={errors.model?.message}
                                inputProps={{ placeholder: "e.g., QLED X55", value, onChangeText: onChange }}
                            />
                        )}
                    />

                    {/* Description / Note */}
                    <Controller
                        control={control}
                        name="description"
                        render={({ field: { value, onChange } }) => (
                            <Field
                                label="Description / Note"
                                error={errors.description?.message}
                                inputProps={{
                                    placeholder: "Any notes you want to remember...",
                                    multiline: true,
                                    numberOfLines: 4,
                                    value,
                                    onChangeText: onChange,
                                    style: { textAlignVertical: "top", minHeight: 100 },
                                }}
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
            </View>
        </KeyboardAvoidingView>
    );
}
