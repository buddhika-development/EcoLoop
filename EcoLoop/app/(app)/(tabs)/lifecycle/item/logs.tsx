// app/(app)/(tabs)/lifecycle/item/logs.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
    View, Text, TouchableOpacity, FlatList, Modal, Pressable,
    TextInput, Platform, Alert, KeyboardAvoidingView,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import { colors } from "@/src/theme/colors";
import { useItem } from "@/src/hooks/useItem"; // you already have this hook
import {
    listenMaintenanceLogs,
    addMaintenanceLog,
    MaintenanceLog,
} from "@/src/services/maintenanceLogs";

function fmt(d: Date) { return d.toISOString().slice(0, 10); }

export default function MaintenanceLogs() {
    const { itemId } = useLocalSearchParams<{ itemId: string }>();
    const { item } = useItem(itemId!);

    const [logs, setLogs] = useState<MaintenanceLog[]>([]);
    const [loading, setLoading] = useState(true);

    // modal state
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [date, setDate] = useState(fmt(new Date()));
    const [desc, setDesc] = useState("");
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        if (!itemId) return;
        const unsub = listenMaintenanceLogs(itemId, (list) => {
            setLogs(list);
            setLoading(false);
        });
        return unsub;
    }, [itemId]);

    async function onSave() {
        if (!title.trim()) return Alert.alert("Missing title", "Please enter a log title.");
        if (!date) return Alert.alert("Missing date", "Pick a date for the log.");
        try {
            await addMaintenanceLog(itemId!, { title, date, description: desc });
            setOpen(false);
            setTitle("");
            setDate(fmt(new Date()));
            setDesc("");
            Alert.alert("Saved", "Maintenance log added.");
        } catch (e: any) {
            console.error(e);
            Alert.alert("Error", e?.message ?? "Failed to add log.");
        }
    }

    const Header = (
        <View className="px-4 pt-6 pb-2">
            <View className="flex-row items-center justify-between">
                <TouchableOpacity
                    onPress={() => router.back()}
                    activeOpacity={0.8}
                    style={{ padding: 8, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.05)" }}
                >
                    <Ionicons name="arrow-back" size={20} color={colors.text.base} />
                </TouchableOpacity>

                <Text className="text-xl font-extrabold text-text">Maintenance Logs</Text>

                <TouchableOpacity
                    onPress={() => setOpen(true)}
                    className="px-3 py-2 rounded-full"
                    style={{ backgroundColor: "#16A34A" }}
                >
                    <Text className="text-white font-semibold">+ Add New</Text>
                </TouchableOpacity>
            </View>

            <Text className="text-lg font-semibold text-text mt-3">
                {item?.name || "Item"}
            </Text>
        </View>
    );

    return (
        <View className="flex-1 bg-surface-subtle">
            <Stack.Screen options={{ headerShown: false }} />
            {Header}

            {/* timeline list */}
            <FlatList
                contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 28 }}
                data={logs}
                keyExtractor={(l) => l.id}
                ListEmptyComponent={
                    <View className="mt-20 items-center opacity-70">
                        <Ionicons name="construct-outline" size={28} color={colors.text.hint} />
                        <Text className="text-text-hint mt-2">No maintenance logs yet.</Text>
                    </View>
                }
                renderItem={({ item, index }) => (
                    <TimelineRow
                        first={index === 0}
                        last={index === logs.length - 1}
                        title={item.title}
                        date={item.date}
                        description={item.description || ""}
                    />
                )}
            />

            {/* Add modal */}
            <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)} transparent>
                <Pressable onPress={() => setOpen(false)} className="flex-1 bg-black/35" />
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    className="absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl p-5"
                    style={{ borderTopWidth: 1, borderColor: "#E7E7EF" }}
                >
                    <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-2xl font-extrabold text-brand-primary">Add Maintenance Logs</Text>
                        <TouchableOpacity onPress={() => setOpen(false)}>
                            <Ionicons name="close" size={22} />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-lg font-semibold mb-3">{item?.name || "Item"}</Text>

                    {/* title */}
                    <Text className="text-xs text-text-hint mb-1">Log Title</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Clean Water filter"
                        className="h-11 rounded-xl px-4 bg-white border border-surface-foreground mb-3"
                    />

                    {/* date */}
                    <Text className="text-xs text-text-hint mb-1">Date</Text>
                    <TouchableOpacity
                        onPress={() => setShowPicker(true)}
                        className="h-11 rounded-xl px-4 border border-surface-foreground bg-white flex-row items-center justify-between mb-3"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="calendar-outline" size={16} color={colors.text.hint} />
                            <Text className="ml-2">{date}</Text>
                        </View>
                        <Ionicons name="chevron-down" size={16} color={colors.text.hint} />
                    </TouchableOpacity>

                    {showPicker && (
                        <DateTimePicker
                            value={new Date(date + "T00:00:00")}
                            mode="date"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            maximumDate={new Date()}
                            onChange={(e, selected) => {
                                setShowPicker(Platform.OS === "ios"); // keep spinner open on iOS
                                if (!selected) return;
                                const iso = selected.toISOString().slice(0, 10);
                                setDate(iso);
                            }}
                        />
                    )}

                    {/* description */}
                    <Text className="text-xs text-text-hint mb-1">Description</Text>
                    <TextInput
                        value={desc}
                        onChangeText={setDesc}
                        placeholder="What did you do / replace?"
                        className="rounded-xl px-4 py-3 bg-white border border-surface-foreground"
                        style={{ minHeight: 100, textAlignVertical: "top" }}
                        multiline
                    />

                    {/* actions */}
                    <View className="flex-row mt-5">
                        <TouchableOpacity
                            onPress={() => setOpen(false)}
                            className="flex-1 mr-2 h-12 rounded-xl items-center justify-center bg-white border border-surface-foreground"
                        >
                            <Text className="text-text font-semibold">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onSave}
                            className="flex-1 ml-2 h-12 rounded-xl items-center justify-center"
                            style={{ backgroundColor: "#16A34A" }}
                        >
                            <Text className="text-white font-semibold">Save</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

function TimelineRow({
    first, last, title, date, description,
}: { first: boolean; last: boolean; title: string; date: string; description: string }) {
    return (
        <View className="flex-row">
            {/* left rail */}
            <View style={{ width: 28, alignItems: "center" }}>
                {/* dot */}
                <View style={{
                    width: 10, height: 10, borderRadius: 999, backgroundColor: "#7C3AED", marginTop: 12,
                }} />
                {/* line */}
                <View style={{
                    flex: 1, width: 2, backgroundColor: "#E5E7EB",
                    marginTop: 4, marginBottom: last ? 22 : 0,
                }} />
            </View>

            {/* content */}
            <View style={{ flex: 1, paddingBottom: 16 }}>
                <Text className="text-xs text-text-hint mb-2">{date}</Text>
                <View className="rounded-xl bg-white border border-surface-foreground px-3 py-2">
                    <Text className="font-semibold">{title}</Text>
                    {!!description && <Text className="text-text-hint mt-1">{description}</Text>}
                </View>
            </View>
        </View>
    );
}
