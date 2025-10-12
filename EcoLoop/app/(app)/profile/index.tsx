import { useUserProfile } from "@/src/hooks/useUserProfile";
import { auth, storage } from "@/src/lib/firebase";
import { updateMyProfile, updateMyProfilePic } from "@/src/services/profile";
import { colors } from "@/src/theme/colors";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Profile Screen:
 * - Custom purple header with back button
 * - Shows avatar (photo or initial)
 * - Editable details: name, phone, dob, address
 * - Read-only: email, NIC, gender
 * - Change photo, save, sign out
 */

export default function ProfileScreen() {
    const { user, profile, loading } = useUserProfile();
    const insets = useSafeAreaInsets();

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [dob, setDob] = useState("");
    const [line1, setLine1] = useState("");
    const [line2, setLine2] = useState("");
    const [city, setCity] = useState("");
    const [postalCode, setPostal] = useState("");

    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!profile) return;
        setFullName(profile.fullName || "");
        setPhone(profile.phone || "");
        setDob(profile.dob || "");
        setLine1(profile.address?.line1 || "");
        setLine2(profile.address?.line2 || "");
        setCity(profile.address?.city || "");
        setPostal(profile.address?.postalCode || "");
    }, [profile]);

    async function pickAndUploadPhoto() {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission needed", "We need access to your photos.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (result.canceled) return;

            const asset = result.assets[0];
            if (!asset?.uri) return;

            setUploading(true);

            const uid = user?.uid!;
            const fileRef = ref(storage, `users/${uid}/profile.jpg`);

            const resp = await fetch(asset.uri);
            const blob = await resp.blob();
            await uploadBytes(fileRef, blob);

            const url = await getDownloadURL(fileRef);
            await updateMyProfilePic(url);

            Alert.alert("Updated", "Profile picture updated.");
        } catch (e: any) {
            Alert.alert("Upload failed", e.message);
        } finally {
            setUploading(false);
        }
    }

    async function onSave() {
        try {
            setSaving(true);
            await updateMyProfile({
                fullName: fullName || undefined,
                phone: phone || undefined,
                dob: dob || undefined,
                address: {
                    line1: line1 || undefined,
                    line2: line2 || undefined,
                    city: city || undefined,
                    postalCode: postalCode || undefined,
                    country: profile?.address?.country || "LK",
                },
            });
            Alert.alert("Saved", "Profile updated.");
        } catch (e: any) {
            Alert.alert("Update failed", e.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator />
            </View>
        );
    }

    const displayName =
        profile?.fullName ||
        user?.displayName ||
        (user?.email ? user.email.split("@")[0] : "User");
    const initial = displayName.trim().charAt(0).toUpperCase();
    const photo = profile?.profilePic || user?.photoURL || null;

    return (
        <View style={{ flex: 1, backgroundColor: colors.surface.subtle }}>
            {/* ===== Custom Header ===== */}
            <View
                style={{
                    backgroundColor: colors.brand.primary,
                    paddingTop: insets.top + 10,
                    paddingHorizontal: 16,
                    paddingBottom: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                    }}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                    <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>Profile</Text>
                </TouchableOpacity>

                <View style={{ width: 24 }} /> {/* Spacer for symmetry */}
            </View>

            {/* ===== Main Content ===== */}
            <ScrollView
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Avatar */}
                <View style={{ alignItems: "center", marginTop: 12, marginBottom: 16 }}>
                    <View
                        style={{
                            width: 100,
                            height: 100,
                            borderRadius: 50,
                            overflow: "hidden",
                            backgroundColor: colors.brand.primary,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {photo ? (
                            <Image source={{ uri: photo }} style={{ width: "100%", height: "100%" }} />
                        ) : (
                            <Text style={{ color: "#fff", fontSize: 38, fontWeight: "800" }}>{initial}</Text>
                        )}
                    </View>

                    <TouchableOpacity
                        onPress={pickAndUploadPhoto}
                        style={{
                            marginTop: 10,
                            backgroundColor: colors.brand.accent,
                            borderRadius: 10,
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                        }}
                    >
                        <Text style={{ color: "#fff", fontWeight: "600" }}>
                            {uploading ? "Uploading..." : "Change Photo"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Read-only fields */}
                {[
                    { label: "Email", value: user?.email },
                    { label: "NIC", value: profile?.nic },
                    { label: "Gender", value: profile?.gender },
                ].map((f) => (
                    <View key={f.label} style={{ marginBottom: 10 }}>
                        <Text style={{ color: colors.text.hint, marginBottom: 4 }}>{f.label}</Text>
                        <View
                            style={{
                                backgroundColor: colors.surface.base,
                                paddingHorizontal: 12,
                                paddingVertical: 12,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: colors.surface.foreground,
                            }}
                        >
                            <Text style={{ color: colors.text.base }}>{f.value || "-"}</Text>
                        </View>
                    </View>
                ))}

                {/* Editable fields */}
                {[
                    { label: "Full Name", value: fullName, onChange: setFullName },
                    { label: "Phone", value: phone, onChange: setPhone },
                    { label: "Date of Birth", value: dob, onChange: setDob },
                    { label: "Address Line 1", value: line1, onChange: setLine1 },
                    { label: "Address Line 2", value: line2, onChange: setLine2 },
                    { label: "City", value: city, onChange: setCity },
                    { label: "Postal Code", value: postalCode, onChange: setPostal },
                ].map((f) => (
                    <View key={f.label} style={{ marginBottom: 10 }}>
                        <Text style={{ color: colors.text.hint, marginBottom: 4 }}>{f.label}</Text>
                        <TextInput
                            placeholder={f.label}
                            placeholderTextColor={colors.text.hint}
                            value={f.value}
                            onChangeText={f.onChange}
                            style={{
                                backgroundColor: colors.surface.base,
                                paddingHorizontal: 12,
                                paddingVertical: 12,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: colors.surface.foreground,
                                color: colors.text.base,
                            }}
                        />
                    </View>
                ))}

                {/* Buttons */}
                <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                    <TouchableOpacity
                        onPress={() => router.push("/(app)/(tabs)/donate-sell/selling")}
                        style={{
                            flex: 1,
                            backgroundColor: colors.brand.primary,
                            paddingVertical: 12,
                            borderRadius: 12,
                            alignItems: "center",
                        }}
                    >
                        <Text style={{ color: "#fff", fontWeight: "700" }}>
                            {saving ? "Saving..." : "Save"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={async () => {
                            await signOut(auth);
                            router.replace("/(auth)/login");
                        }}
                        style={{
                            width: 120,
                            backgroundColor: "#ef4444",
                            paddingVertical: 12,
                            borderRadius: 12,
                            alignItems: "center",
                        }}
                    >
                        <Text style={{ color: "#fff", fontWeight: "700" }}>Sign out</Text>
                    </TouchableOpacity>
                </View>

                
            </ScrollView>
        </View>
    );
}
