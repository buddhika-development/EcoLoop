import { useMemo, useRef, useState } from "react";
import {
    View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator,
    Alert, TextInput, Linking, Platform
} from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { colors } from "@/src/theme/colors";
import { useItem } from "@/src/hooks/useItem";
import { addItemDocuments, deleteItem, updateItemPartial } from "@/src/services/item";
import type { LocalFile } from "@/src/types/media";
import DateField from "@/src/components/lifecycle/DateField";

function addMonths(iso: string, months: number) {
    const d = new Date(iso + "T00:00:00");
    const nd = new Date(d);
    nd.setMonth(nd.getMonth() + months);
    if (nd.getDate() !== d.getDate()) nd.setDate(0);
    return nd.toISOString().slice(0, 10);
}
function daysUntil(iso: string) {
    const today = new Date();
    const target = new Date(iso + "T00:00:00");
    const ms = target.getTime() - new Date(today.toDateString()).getTime();
    return Math.round(ms / (1000 * 60 * 60 * 24));
}
function warrantyExpiry(purchase?: string | null, months?: number | null, override?: string | null) {
    if (override) return override;
    if (purchase && (months ?? 0) > 0) return addMonths(purchase, months || 0);
    return null;
}
function formatDate(iso?: string | null) {
    if (!iso) return "—";
    const d = new Date(iso + "T00:00:00");
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}/${m}/${day}`;
}

export default function ItemDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { item, loading, isOwner } = useItem(id!);

    const [editing, setEditing] = useState(false);
    const [model, setModel] = useState<string>("");
    const [purchaseDate, setPurchaseDate] = useState<string | undefined>();
    const [warrantyMonths, setWarrantyMonths] = useState<string>("");

    const qrRef = useRef<any>(null);

    // seed local fields when item loads
    useMemo(() => {
        if (!item) return;
        setModel(item.model ?? "");
        setPurchaseDate(item.purchaseDate ?? undefined);
        setWarrantyMonths(String(item.warrantyMonths ?? 0));
    }, [item]);

    const exp = useMemo(
        () => warrantyExpiry(item?.purchaseDate, item?.warrantyMonths ?? null, item?.warrantyExpiry ?? null),
        [item?.purchaseDate, item?.warrantyMonths, item?.warrantyExpiry]
    );

    async function saveEdits() {
        try {
            await updateItemPartial(id!, {
                model: model.trim() || null,
                purchaseDate: purchaseDate ?? null,
                warrantyMonths: Number.isFinite(Number(warrantyMonths)) ? Number(warrantyMonths) : 0,
            });
            setEditing(false);
            Alert.alert("Saved", "Item information updated.");
        } catch (e: any) {
            console.error(e);
            Alert.alert("Error", e?.message || "Failed to update item.");
        }
    }

    async function pickDocs() {
        if (!item) return;
        const current = item.documents?.length ?? 0;
        const remaining = Math.max(0, 3 - current);
        if (remaining <= 0) {
            Alert.alert("Limit reached", "You can upload up to 3 documents.");
            return;
        }
        const res = await DocumentPicker.getDocumentAsync({
            multiple: true,
            copyToCacheDirectory: false,
            type: ["application/pdf", "image/*"],
        });
        if (res.canceled) return;

        const picked = res.assets.slice(0, remaining).map<LocalFile>((a) => ({
            uri: a.uri,
            name: a.name || `doc-${Date.now()}`,
            mime: a.mimeType || "application/octet-stream",
            size: a.size ?? 0,
        }));

        try {
            await addItemDocuments(id!, picked);
            Alert.alert("Uploaded", `${picked.length} file(s) added.`);
        } catch (e: any) {
            console.error(e);
            Alert.alert("Upload failed", e?.message || "Could not upload documents.");
        }
    }

    async function shareQr() {
        try {
            if (!item?.qrCode) {
                Alert.alert("No QR", "This item has no QR token.");
                return;
            }

            // Export QR as base64
            const dataUrl: string = await new Promise((resolve, reject) => {
                qrRef.current?.toDataURL((d: string) => resolve(`data:image/png;base64,${d}`));
                setTimeout(() => reject(new Error("QR export timeout")), 1500);
            });

            const base64 = dataUrl.split(",")[1];

            // Write to temporary file (legacy API works in SDK 54)
            const dir = FileSystem.cacheDirectory || FileSystem.documentDirectory || "";
            const path = `${dir}item-${id}-qr.png`;

            await FileSystem.writeAsStringAsync(path, base64, { encoding: "base64" });

            // ✅ Use plain file:// URI (works in Expo Go)
            await Sharing.shareAsync(path, {
                dialogTitle: "Share QR code",
                mimeType: "image/png",
            });
        } catch (e) {
            console.error("QR Share error:", e);
            Alert.alert("Error", "Could not export or share QR code.");
        }
    }



    async function saveQr() {
        if (Platform.OS === "web") {
            Alert.alert("Unsupported on web", "Use Share to download on web.");
            return;
        }
        await shareQr(); // the share sheet generally lets user “Save to device”
    }

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator />
            </View>
        );
    }
    if (!item) {
        return (
            <View className="flex-1 items-center justify-center">
                <Text className="text-text-hint">Item not found.</Text>
            </View>
        );
    }

    const imgs = item.images ?? [];
    const docs = item.documents ?? [];
    const nextMaint = item.maintenance?.nextDate ? formatDate(item.maintenance?.nextDate) : "—";

    const warrantyBadge = (() => {
        if (!exp || (item.warrantyMonths ?? 0) <= 0) return { text: "No Warranty", tint: "#F3F4F6", color: "#6B7280" };
        const d = daysUntil(exp);
        if (d < 0) return { text: "Warranty expired", tint: "#FDECEC", color: "#B91C1C" };
        if (d <= 7) return { text: `Warranty ends in ${d} days`, tint: "#FEF2F2", color: "#DC2626" };
        if (d <= 30) return { text: `Warranty ends in ${d} days`, tint: "#FFF7ED", color: "#C2410C" };
        if (d <= 365) return { text: `Warranty ends in ${Math.ceil(d / 30)} months`, tint: "#ECFDF5", color: "#065F46" };
        return { text: `Warranty ends in 1+ year`, tint: "#ECFDF5", color: "#065F46" };
    })();


    const qrValue = (item.qrCode ?? item.qrToken ?? "").toString().trim();


    return (
        <View className="flex-1 bg-surface-subtle">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-4 pt-6 pb-3 flex-row items-center justify-between">
                <TouchableOpacity
                    onPress={() => router.back()}
                    activeOpacity={0.8}
                    style={{ padding: 8, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.05)" }}
                >
                    <Ionicons name="arrow-back" size={20} color={colors.text.base} />
                </TouchableOpacity>
                <Text className="text-xl font-extrabold text-text" numberOfLines={1}>
                    {item.name || "Item"}
                </Text>
                {isOwner ? (
                    <TouchableOpacity onPress={() => setEditing((v) => !v)} className="px-3 py-2 rounded-lg" style={{ backgroundColor: colors.surface.base, borderWidth: 1, borderColor: colors.surface.foreground }}>
                        <Text className="font-semibold">{editing ? "Done" : "Edit"}</Text>
                    </TouchableOpacity>
                ) : <View style={{ width: 64 }} />}
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="px-4">
                {/* Action chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: "/(app)/(tabs)/lifecycle/item/logs", params: { itemId: id! } })}
                        className="px-3 py-2 rounded-full mr-8" style={{ backgroundColor: colors.surface.foreground }}>
                        <Text>Maintenance Log</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: "/(app)/(tabs)/lifecycle/item/schedule", params: { itemId: id! } })}
                        className="px-3 py-2 rounded-full mr-8" style={{ backgroundColor: colors.surface.foreground }}>
                        <Text>Schedule Maintenance</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => Alert.alert("Transfer", "Coming next: secure ownership transfer")}
                        className="px-3 py-2 rounded-full" style={{ backgroundColor: colors.surface.foreground }}>
                        <Text>Transfer Ownership</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Images gallery */}
                <View className="rounded-2xl border mb-3" style={{ borderColor: colors.surface.foreground, backgroundColor: "#fff" }}>
                    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
                        {imgs.length ? (
                            imgs.map((u, i) => (
                                <Image key={i} source={{ uri: u }} style={{ width: 320, height: 190, borderRadius: 16, margin: 8 }} />
                            ))
                        ) : (
                            <View className="items-center justify-center" style={{ width: 320, height: 190, margin: 8 }}>
                                <Ionicons name="image" size={28} color={colors.text.hint} />
                                <Text className="text-text-hint mt-1">No images</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>

                {/* QR section */}

                <View className="bg-white rounded-2xl border p-4 mb-3" style={{ borderColor: colors.surface.foreground }}>
                    <Text className="font-bold mb-2">QR Code</Text>
                    <View className="items-center">
                        {qrValue ? (
                            <QRCode
                                value={qrValue}
                                size={240}
                                color={colors.text.base}           // strong contrast
                                backgroundColor={colors.surface.base} // strong contrast
                                ecl="H"
                                quietZone={16}            // white border so scanners lock quickly
                                getRef={(r) => (qrRef.current = r!)}
                            />
                        ) : (
                            <Text className="text-text-hint">No QR token</Text>
                        )}

                        <Text className="text-xs text-text-hint mt-2">
                            Scan inside EcoLoop app to open this item
                        </Text>

                        <View className="flex-row gap-2 mt-3">
                            <TouchableOpacity
                                onPress={shareQr}
                                className="px-3 py-2 rounded-lg"
                                style={{ backgroundColor: colors.surface.base, borderWidth: 1, borderColor: colors.surface.foreground }}
                            >
                                <Text className="font-semibold">Share</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={saveQr}
                                className="px-3 py-2 rounded-lg"
                                style={{ backgroundColor: colors.brand.accent }}
                            >
                                <Text className="font-semibold text-white">Save to device</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>


                {/* Specs (editable subset if owner) */}
                <View className="bg-white rounded-2xl border p-4 mb-3" style={{ borderColor: colors.surface.foreground }}>
                    <Text className="font-bold mb-3">Specs</Text>

                    {/* Name & Category read-only here to keep flow clean */}
                    <Row k="Category" v={item.category} />
                    <Row k="Brand" v={item.brand || "—"} />
                    {/* Model editable */}
                    <RowEdit
                        label="Model"
                        value={model}
                        editing={editing}
                        onChange={setModel}
                    />
                    {/* Purchase date editable */}
                    <RowDate
                        label="Purchase date"
                        value={purchaseDate}
                        editing={editing}
                        onChange={setPurchaseDate}
                    />
                    {/* Warranty months editable */}
                    <RowEdit
                        label="Warranty (months)"
                        value={warrantyMonths}
                        keyboardType="numeric"
                        editing={editing}
                        onChange={setWarrantyMonths}
                    />
                    <Row k="Expiry date" v={formatDate(exp)} />

                    {editing && (
                        <TouchableOpacity onPress={saveEdits} className="mt-3 rounded-xl py-3 items-center" style={{ backgroundColor: colors.brand.accent }}>
                            <Text className="text-white font-semibold">Save changes</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Status */}
                <View className="bg-white rounded-2xl border p-4 mb-3" style={{ borderColor: colors.surface.foreground }}>
                    <Text className="font-bold mb-3">Status</Text>
                    <View style={{ alignSelf: "flex-start", backgroundColor: warrantyBadge.tint, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                        <Text style={{ color: warrantyBadge.color, fontWeight: "600" }}>{warrantyBadge.text}</Text>
                    </View>
                    <Text className="text-[12px] text-text-hint mt-6">
                        Next maintenance: {nextMaint}
                    </Text>
                </View>

                {/* Attachments */}
                <View className="bg-white rounded-2xl border p-4" style={{ borderColor: colors.surface.foreground }}>
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="font-bold">Attachments</Text>
                        {isOwner && (docs.length < 3) && (
                            <TouchableOpacity onPress={pickDocs} className="px-3 py-2 rounded-lg" style={{ backgroundColor: colors.surface.base, borderWidth: 1, borderColor: colors.surface.foreground }}>
                                <Text className="font-semibold">Add document</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    {docs.length === 0 ? (
                        <Text className="text-text-hint">No attachments</Text>
                    ) : (
                        docs.map((u, i) => (
                            <TouchableOpacity key={i} onPress={() => Linking.openURL(u)} className="py-2">
                                <Text className="text-brand-primary">{`Document ${i + 1}`}</Text>
                            </TouchableOpacity>
                        ))
                    )}
                </View>



                {/* Delete Item Button (only for owner) */}
                {isOwner && (
                    <TouchableOpacity
                        onPress={() =>
                            Alert.alert(
                                "Delete Item",
                                "Are you sure you want to permanently delete this item?",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    {
                                        text: "Delete",
                                        style: "destructive",
                                        onPress: async () => {
                                            try {
                                                await deleteItem(id!);
                                                Alert.alert("Deleted", "Item removed successfully.");
                                                router.back();
                                            } catch (e: any) {
                                                console.error(e);
                                                Alert.alert("Error", e?.message || "Failed to delete item.");
                                            }
                                        },
                                    },
                                ]
                            )
                        }
                        className="mt-6 rounded-xl py-3 items-center"
                        style={{ backgroundColor: "#DC2626" }}
                    >
                        <Text className="text-white font-semibold">Delete Item</Text>
                    </TouchableOpacity>
                )}


            </ScrollView>
        </View>
    );
}

/* ------- small row components ------- */
function Row({ k, v }: { k: string; v: string | number }) {
    return (
        <View className="flex-row items-center justify-between py-2" style={{ borderTopWidth: 1, borderColor: "#eee" }}>
            <Text className="text-text-hint">{k}</Text>
            <Text className="text-text">{String(v)}</Text>
        </View>
    );
}
function RowEdit({
    label, value, onChange, editing, keyboardType,
}: {
    label: string;
    value: string;
    onChange: (s: string) => void;
    editing: boolean;
    keyboardType?: "default" | "numeric";
}) {
    return (
        <View className="flex-row items-center justify-between py-2" style={{ borderTopWidth: 1, borderColor: "#eee" }}>
            <Text className="text-text-hint">{label}</Text>
            {editing ? (
                <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="—"
                    keyboardType={keyboardType}
                    className="text-text text-right"
                    style={{ minWidth: 120 }}
                />
            ) : (
                <Text className="text-text">{value || "—"}</Text>
            )}
        </View>
    );
}
function RowDate({
    label, value, onChange, editing,
}: {
    label: string;
    value?: string;
    onChange: (iso?: string) => void;
    editing: boolean;
}) {
    return (
        <View className="flex-row items-center justify-between py-2" style={{ borderTopWidth: 1, borderColor: "#eee" }}>
            <Text className="text-text-hint">{label}</Text>
            {editing ? (
                <View style={{ minWidth: 160 }}>
                    <DateField label="" value={value} onChange={onChange} minimumDate={new Date(2000, 0, 1)} />
                </View>
            ) : (
                <Text className="text-text">{formatDate(value)}</Text>
            )}
        </View>
    );
}
