import React, { useMemo, useState } from "react";
import {
    View, Text, Image, Alert, ScrollView, TouchableOpacity,
    KeyboardAvoidingView, Platform
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import StepHeader from "@/src/components/lifecycle/stepHeader";
import { colors } from "@/src/theme/colors";
import { useAddItemWizard } from "@/src/hooks/useAddItemWizard";
import type { LocalFile } from "@/src/types/media";

// ---- Config ----
const MAX_IMAGES = 3;
const MAX_DOCS = 3;
const MAX_SIZE_MB = 5;    // hard limit
const WARN_TOO_SMALL_IMAGE_KB = 200;
const bytes = (mb: number) => mb * 1024 * 1024;

export default function Step3() {
    const { draft, setPartial } = useAddItemWizard();

    const [images, setImages] = useState<LocalFile[]>(draft.imagesLocal ?? []);
    const [docs, setDocs] = useState<LocalFile[]>(draft.docsLocal ?? []);

    const canAddImage = images.length < MAX_IMAGES;
    const canAddDoc = docs.length < MAX_DOCS;

    const headerRight = useMemo(
        () => `${images.length}/${MAX_IMAGES} images • ${docs.length}/${MAX_DOCS} docs`,
        [images.length, docs.length]
    );

    // ---- Helpers ----
    type SizeHint = { size?: number | null; fileSize?: number | null };

    const bytes = (mb: number) => mb * 1024 * 1024;

    const probeSize = async (uri: string, hint?: SizeHint): Promise<number> => {
        // Use sizes from pickers when available
        if (hint?.size != null) return Number(hint.size);
        if (hint?.fileSize != null) return Number(hint.fileSize);

        // Fallback to legacy FS (SDK 54: use /legacy shim)
        try {
            const info = await FileSystem.getInfoAsync(uri);
            const s = (info as any)?.size;
            if (info.exists && typeof s === "number") return Number(s);
        } catch {
            // ignore, will return -1
        }
        return -1;
    };

    const ensureSizeAndBuildFile = async (
        uri: string,
        fallbackName: string,
        mime = "application/octet-stream",
        hint?: SizeHint
    ): Promise<LocalFile | null> => {
        const size = await probeSize(uri, hint);

        if (size <= 0) {
            Alert.alert("File error", "Could not read file size. Please try another file.");
            return null;
        }
        if (size > bytes(MAX_SIZE_MB)) {
            Alert.alert("Too large", `File exceeds ${MAX_SIZE_MB}MB limit.`);
            return null;
        }
        const name = uri.split("/").pop() || fallbackName;
        return { uri, name, size, mime };
    };


    // ---- Pickers ----
    const pickImage = async () => {
        if (!canAddImage) return Alert.alert("Limit reached", `You can add up to ${MAX_IMAGES} images.`);

        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) return Alert.alert("Permission required", "Please allow gallery access.");

        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.9,
            selectionLimit: 1, // iOS multi-select; fine to keep 1
        });
        if (res.canceled || !res.assets?.[0]) return;

        const a = res.assets[0]; // { uri, fileName?, mimeType?, fileSize? }
        const file = await ensureSizeAndBuildFile(
            a.uri,
            a.fileName || "photo.jpg",
            a.mimeType || "image/jpeg",
            { fileSize: (a as any).fileSize } // ← hint for size
        );
        if (!file) return;

        if (file.size < WARN_TOO_SMALL_IMAGE_KB * 1024) {
            Alert.alert("Low quality?", "This image is quite small and may look blurry.");
        }
        setImages((prev) => [...prev, file].slice(0, MAX_IMAGES));
    };

    const pickDoc = async () => {
        if (!canAddDoc) return Alert.alert("Limit reached", `You can add up to ${MAX_DOCS} documents.`);

        const res = await DocumentPicker.getDocumentAsync({
            multiple: false,
            type: ["application/pdf", "image/png", "image/jpeg"],
            copyToCacheDirectory: true,
        });
        if (res.canceled || !res.assets?.[0]) return;

        const a = res.assets[0]; // { uri, name?, mimeType?, size? }
        const file = await ensureSizeAndBuildFile(
            a.uri,
            a.name || "document",
            a.mimeType || "application/octet-stream",
            { size: (a as any).size } // ← hint for size
        );
        if (!file) return;

        setDocs((prev) => [...prev, file].slice(0, MAX_DOCS));
    };


    // ---- Remove ----
    const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));
    const removeDoc = (idx: number) => setDocs((prev) => prev.filter((_, i) => i !== idx));

    // ---- Actions ----
    const onSkip = () => {
        setPartial({ imagesLocal: images, docsLocal: docs });
        router.push("/(app)/(tabs)/lifecycle/add/step-4");
    };

    const onNext = () => {
        if (images.length < 1) {
            return Alert.alert("Add an image", "Please add at least one image of the item.");
        }
        setPartial({ imagesLocal: images, docsLocal: docs });
        router.push("/(app)/(tabs)/lifecycle/add/step-4");
    };

    const onBack = () => router.push("/(app)/(tabs)/lifecycle/add/step-2");

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-surface-subtle">
            {/* Header */}
            <View>
                {/* If you **did** add subtitle prop in StepHeader, keep subtitle={headerRight}; otherwise remove it */}
                <StepHeader title="Add New Item" step={3} total={5} subtitle={headerRight} />
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
                {/* Images */}
                <Text className="text-lg font-semibold mb-2">Item photos <Text className="text-red-500">*</Text></Text>
                <Text className="text-text-hint mb-3">Add up to {MAX_IMAGES} images (max {MAX_SIZE_MB}MB each). At least one is required.</Text>

                <View className="flex-row flex-wrap gap-3">
                    {images.map((img, idx) => (
                        <View key={idx} style={{ width: 100 }}>
                            <View style={{ borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: colors.surface.foreground }}>
                                <Image source={{ uri: img.uri }} style={{ width: 100, height: 100 }} resizeMode="cover" />
                            </View>
                            <TouchableOpacity onPress={() => removeImage(idx)} className="mt-1 self-center px-2 py-1 rounded-full bg-red-50">
                                <Text className="text-red-600 text-xs">Remove</Text>
                            </TouchableOpacity>
                        </View>
                    ))}

                    {canAddImage && (
                        <TouchableOpacity
                            onPress={pickImage}
                            activeOpacity={0.9}
                            style={{
                                width: 100, height: 100, borderRadius: 12,
                                borderWidth: 1, borderStyle: "dashed", borderColor: colors.surface.foreground,
                                alignItems: "center", justifyContent: "center", backgroundColor: "white",
                            }}
                        >
                            <Ionicons name="image" size={26} color={colors.brand.primary} />
                            <Text className="text-[12px] mt-1">Add photo</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Docs */}
                <Text className="text-lg font-semibold mt-8 mb-2">Documents (optional)</Text>
                <Text className="text-text-hint mb-3">PDF/JPG/PNG. Up to {MAX_DOCS} files (max {MAX_SIZE_MB}MB each).</Text>

                <View className="gap-2">
                    {docs.map((d, idx) => (
                        <View key={idx} className="flex-row items-center justify-between rounded-xl bg-white border border-surface-foreground px-3 py-2">
                            <View className="flex-row items-center gap-2">
                                <MaterialCommunityIcons name="file-document" size={20} color={colors.brand.primary} />
                                <View style={{ maxWidth: "70%" }}>
                                    <Text numberOfLines={1} className="font-medium">{d.name}</Text>
                                    <Text className="text-xs text-text-hint">{(d.size / (1024 * 1024)).toFixed(2)} MB</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => removeDoc(idx)} className="px-2 py-1 rounded-full bg-red-50">
                                <Text className="text-red-600 text-xs">Remove</Text>
                            </TouchableOpacity>
                        </View>
                    ))}

                    {canAddDoc && (
                        <TouchableOpacity
                            onPress={pickDoc}
                            activeOpacity={0.9}
                            className="rounded-xl bg-white border border-dashed border-surface-foreground px-4 py-3 flex-row items-center justify-center gap-2"
                        >
                            <MaterialCommunityIcons name="file-plus" size={20} color={colors.brand.primary} />
                            <Text className="font-medium">Add document</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Footer */}
                <View className="flex-row mt-10">
                    <TouchableOpacity
                        onPress={onSkip}
                        activeOpacity={0.9}
                        className="flex-1 mr-2 rounded-xl bg-white border border-surface-foreground py-3 items-center"
                    >
                        <Text className="text-text font-semibold">Skip for now</Text>
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
