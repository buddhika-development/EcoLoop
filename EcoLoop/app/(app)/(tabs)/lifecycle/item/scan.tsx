// app/(app)/(tabs)/lifecycle/item/scan.tsx
import { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Image, Platform } from "react-native";
import { Stack, router } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";

import { colors } from "@/src/theme/colors";
import { auth, db } from "@/src/lib/firebase";
import { verifyQrToken } from "@/src/lib/crypto";
import { doc, getDoc } from "firebase/firestore";

type ScannedItem = {
    id: string;
    name?: string;
    model?: string | null;
    brand?: string | null;
    images?: string[];
    ownerUid: string;
    warrantyMonths?: number | null;
    warrantyExpiry?: string | null;
    maintenance?: { nextDate?: string | null };
};

function formatDate(iso?: string | null) {
    if (!iso) return "—";
    const d = new Date(iso + "T00:00:00");
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

export default function QRScan() {
    const [permission, requestPermission] = useCameraPermissions();
    const [busy, setBusy] = useState(false);
    const [scannedItem, setScannedItem] = useState<ScannedItem | null>(null);

    useEffect(() => {
        // only request once when permission is undefined
        if (!permission) return;
        if (!permission.granted && !permission.canAskAgain) return;
        if (!permission.granted) requestPermission();
    }, [permission]);

    const scanningEnabled = !busy && !scannedItem;

    async function onBarcodeScanned({ data }: { data: string }) {
        if (!scanningEnabled) return;
        setBusy(true);

        try {
            const ok = await verifyQrToken(data);
            if (!ok) {
                Alert.alert("Invalid QR", "This code is not an EcoLoop item QR.");
                setBusy(false);
                return;
            }

            // parse itemId from token
            let itemId = "";
            try {
                const url = new URL(data);
                const d = url.searchParams.get("d");
                if (!d) throw new Error("Missing payload");
                const payload = JSON.parse(decodeURIComponent(d));
                itemId = String(payload.i || "");
            } catch {
                Alert.alert("Invalid QR", "Could not read item information.");
                setBusy(false);
                return;
            }

            if (!itemId) {
                Alert.alert("Invalid QR", "Item id is missing.");
                setBusy(false);
                return;
            }

            // fetch item
            const snap = await getDoc(doc(db, "items", itemId));
            if (!snap.exists()) {
                Alert.alert("Not found", "This item no longer exists.");
                setBusy(false);
                return;
            }

            const dataAny = snap.data() as any;
            const item: ScannedItem = {
                id: snap.id,
                name: dataAny.name,
                model: dataAny.model ?? null,
                brand: dataAny.brand ?? null,
                images: dataAny.images ?? [],
                ownerUid: dataAny.ownerUid,
                warrantyMonths: dataAny.warrantyMonths ?? null,
                warrantyExpiry: dataAny.warrantyExpiry ?? null,
                maintenance: dataAny.maintenance ?? {},
            };
            setScannedItem(item);
        } catch (e: any) {
            console.error(e);
            Alert.alert("Error", e?.message ?? "Failed to scan.");
            setBusy(false);
        }
    }

    const isOwner = useMemo(() => {
        const uid = auth.currentUser?.uid;
        return !!uid && scannedItem?.ownerUid === uid;
    }, [scannedItem?.ownerUid]);

    const cover = scannedItem?.images?.[0] ?? null;
    const nextMaint = scannedItem?.maintenance?.nextDate ? formatDate(scannedItem.maintenance?.nextDate) : "—";
    const topTitle = scannedItem?.name || "Item";

    if (!permission)
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator />
            </View>
        );

    if (!permission.granted)
        return (
            <View className="flex-1 items-center justify-center px-8">
                <Text className="text-center mb-4">
                    Camera permission denied. Enable it in settings to scan QR codes.
                </Text>
                <TouchableOpacity
                    onPress={requestPermission}
                    className="px-4 py-3 rounded-xl"
                    style={{ backgroundColor: colors.brand.accent }}
                >
                    <Text className="text-white font-semibold">Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );

    return (
        <View className="flex-1 bg-black">
            <Stack.Screen options={{ headerShown: false }} />
            <View style={{ flex: 1, overflow: "hidden" }}>

                {/* live camera feed */}
                <CameraView
                    style={{ flex: 1 }}
                    facing="back"
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                    onBarcodeScanned={onBarcodeScanned}
                    onCameraReady={() => { setBusy(false); }}
                    onMountError={(e) => {
                        console.error("Camera error", e);
                        Alert.alert("Camera error", "Could not access the camera.");
                        setBusy(false);
                    }}
                />
            </View>
            {/* overlay crosshair */}
            <View
                pointerEvents="none"
                style={{
                    position: "absolute",
                    alignSelf: "center",
                    top: "25%",
                    width: "70%",
                    height: "45%",
                    borderRadius: 22,
                    borderWidth: 4,
                    borderColor: "rgba(255,255,255,0.8)",
                }}
            />

            {/* bottom card */}
            {scannedItem && (
                <Animated.View
                    entering={FadeInUp.duration(220)}
                    exiting={FadeOutDown.duration(180)}
                    style={{
                        backgroundColor: "#fff",
                        paddingHorizontal: 16,
                        paddingTop: 14,
                        paddingBottom: 18,
                        borderTopLeftRadius: 22,
                        borderTopRightRadius: 22,
                        borderWidth: 1,
                        borderColor: "#E7E7EF",
                    }}
                >
                    {/* dismiss */}
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-xs text-text-hint">QR scan</Text>
                        <TouchableOpacity
                            onPress={() => {
                                setScannedItem(null);
                                setBusy(false);
                            }}
                            hitSlop={10}
                            className="rounded-full p-1"
                            style={{ backgroundColor: "#F3F4F6" }}
                        >
                            <Ionicons name="close" size={16} />
                        </TouchableOpacity>
                    </View>

                    <Text className="text-xl font-extrabold text-brand-primary">{topTitle}</Text>
                    <Text className="text-text-hint mt-1">
                        {scannedItem.model || scannedItem.brand || "—"}
                    </Text>

                    {!!cover && (
                        <Image
                            source={{ uri: cover }}
                            style={{
                                width: "100%",
                                height: 120,
                                borderRadius: 14,
                                marginTop: 10,
                                marginBottom: 8,
                            }}
                            resizeMode="cover"
                        />
                    )}

                    <View
                        style={{
                            alignSelf: "flex-start",
                            backgroundColor: "#FFF7ED",
                            borderRadius: 999,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            marginTop: 6,
                        }}
                    >
                        <Text style={{ color: "#C2410C", fontWeight: "600", fontSize: 12 }}>
                            {scannedItem.warrantyExpiry
                                ? `Warranty ends: ${formatDate(scannedItem.warrantyExpiry)}`
                                : (scannedItem.warrantyMonths ?? 0) > 0
                                    ? `Warranty: ${scannedItem.warrantyMonths} months`
                                    : "No warranty info"}
                        </Text>
                    </View>

                    <Text className="text-[12px] text-text-hint mt-8">
                        Next maintenance: {nextMaint}
                    </Text>

                    <View className="mt-10 flex-row items-center gap-x-10">
                        <TouchableOpacity
                            onPress={() => router.push(`/(app)/(tabs)/lifecycle/item/${scannedItem.id}`)}
                            className="flex-1 h-11 rounded-lg items-center justify-center"
                            style={{ backgroundColor: colors.brand.accent }}
                        >
                            <Text className="text-white font-semibold">View Full Details</Text>
                        </TouchableOpacity>

                        {isOwner ? (
                            <TouchableOpacity
                                onPress={() =>
                                    router.push({
                                        pathname: "/(app)/(tabs)/donate-sell/new",
                                        params: { itemId: scannedItem.id },
                                    })
                                }
                                className="flex-1 h-11 rounded-lg items-center justify-center border"
                                style={{ borderColor: colors.surface.foreground, backgroundColor: "#fff" }}
                            >
                                <Text className="font-semibold">Donate/Sell</Text>
                            </TouchableOpacity>
                        ) : (
                            <View
                                className="flex-1 h-11 rounded-lg items-center justify-center border opacity-60"
                                style={{ borderColor: colors.surface.foreground, backgroundColor: "#fff" }}
                            >
                                <Text className="font-semibold">Owner actions hidden</Text>
                            </View>
                        )}
                    </View>
                </Animated.View>
            )}

            {/* back button */}
            <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.8}
                style={{
                    position: "absolute",
                    top: Platform.OS === "ios" ? 50 : 24,
                    left: 16,
                    padding: 8,
                    borderRadius: 999,
                    backgroundColor: "rgba(0,0,0,0.35)",
                }}
            >
                <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}
