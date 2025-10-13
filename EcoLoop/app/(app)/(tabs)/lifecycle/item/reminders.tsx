// app/(app)/(tabs)/lifecycle/item/reminders.tsx
import React, { useMemo, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Alert,
    Platform,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { colors } from "@/src/theme/colors";
import { useMyItems } from "@/src/hooks/useMyItems";
import {
    buildRemindersFromItems,
    dismissReminder,
    type ReminderRow,
} from "@/src/services/reminders";

function cardShadow() {
    return Platform.select({
        ios: {
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
        },
        android: { elevation: 2 },
    });
}

function Badge({ label }: { label: string }) {
    return (
        <View style={styles.badge}>
            <Text style={styles.badgeText}>{label}</Text>
        </View>
    );
}

function ReminderCard({
    row,
    onDelete,
}: {
    row: ReminderRow;
    onDelete: (row: ReminderRow) => void;
}) {
    const isMaint = row.kind === "maintenance";
    const leftColor = isMaint ? colors.brand.primary : "#0EA5E9"; // purple vs sky

    return (
        <View style={[styles.card, cardShadow()]}>
            {/* left color rail */}
            <View style={[styles.rail, { backgroundColor: leftColor }]} />

            {/* left icon bubble */}
            <View
                style={[
                    styles.iconBubble,
                    { backgroundColor: leftColor + "22", borderColor: leftColor + "55" },
                ]}
            >
                <Ionicons
                    name={isMaint ? "construct-outline" : "shield-checkmark-outline"}
                    size={22}
                    color={leftColor}
                />
            </View>

            {/* content */}
            <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                    {row.title}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
                    <Badge label={row.itemName} />
                </View>

                <View style={{ marginTop: 6 }}>
                    <Text style={styles.meta}>
                        Date : <Text style={styles.metaStrong}>{row.date}</Text>
                    </Text>
                    {row.time ? (
                        <Text style={styles.meta}>
                            Time : <Text style={styles.metaStrong}>{row.time}</Text>
                        </Text>
                    ) : null}
                </View>
            </View>

            {/* delete */}
            <TouchableOpacity style={styles.delBtn} onPress={() => onDelete(row)} hitSlop={10}>
                <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
        </View>
    );
}

export default function RemindersScreen() {
    const insets = useSafeAreaInsets();
    const { items, loading } = useMyItems();

    const [q, setQ] = useState("");
    const [busyId, setBusyId] = useState<string | null>(null);

    const reminders = useMemo(() => buildRemindersFromItems(items), [items]);

    const filtered = useMemo(() => {
        const t = q.trim().toLowerCase();
        if (!t) return reminders;
        return reminders.filter(
            (r) =>
                r.itemName.toLowerCase().includes(t) ||
                r.title.toLowerCase().includes(t) ||
                r.date.includes(t)
        );
    }, [q, reminders]);

    const onDelete = useCallback((row: ReminderRow) => {
        Alert.alert(
            row.kind === "maintenance" ? "Delete maintenance reminder?" : "Delete warranty reminder?",
            `This will stop reminders for “${row.itemName}”.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setBusyId(row.id);
                            await dismissReminder(row.itemId, row.kind);
                        } catch (e: any) {
                            Alert.alert("Failed", e?.message ?? "Could not update reminder.");
                        } finally {
                            setBusyId(null);
                        }
                    },
                },
            ]
        );
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            {/* Header */}
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
                    style={{ flexDirection: "row", alignItems: "center" }}
                    activeOpacity={0.8}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                    <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginLeft: 8 }}>
                        Reminders
                    </Text>
                </TouchableOpacity>

                <View style={{ width: 24 }} />
            </View>

            {/* Search */}
            <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 }}>
                <View style={[styles.searchBox, cardShadow()]}>
                    <Ionicons name="search-outline" size={18} color="#6B7280" />
                    <TextInput
                        value={q}
                        onChangeText={setQ}
                        placeholder="Search reminder..."
                        placeholderTextColor="#9CA3AF"
                        style={styles.searchInput}
                    />
                    {q.length > 0 && (
                        <TouchableOpacity onPress={() => setQ("")} hitSlop={10}>
                            <Ionicons name="close-circle" size={16} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* List */}
            {loading ? (
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator />
                </View>
            ) : (
                <FlatList
                    contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                    data={filtered}
                    keyExtractor={(r) => r.id}
                    renderItem={({ item }) => (
                        <View>
                            <ReminderCard row={item} onDelete={onDelete} />
                            {busyId === item.id ? (
                                <View style={{ position: "absolute", right: 16, top: 16 }}>
                                    <ActivityIndicator />
                                </View>
                            ) : null}
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={{ alignItems: "center", paddingVertical: 60 }}>
                            <Ionicons name="notifications-off-outline" size={28} color="#9CA3AF" />
                            <Text style={{ marginTop: 8, color: "#6B7280" }}>No reminders yet</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F3F4F6",
        borderRadius: 14,
        paddingHorizontal: 10,
        height: 42,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        color: "#111827",
        paddingVertical: 0,
    },

    card: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 16,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#EEF0F5",
        padding: 12,
        marginBottom: 12,
    },
    rail: {
        width: 4,
        height: "100%",
        borderRadius: 999,
        marginRight: 10,
    },
    iconBubble: {
        width: 40,
        height: 40,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    cardBody: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: "800", color: "#1F2937" },
    meta: { fontSize: 12, color: "#6B7280", marginTop: 2 },
    metaStrong: { color: "#111827", fontWeight: "600" },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        backgroundColor: "#F1F5F9",
    },
    badgeText: { fontSize: 11, color: "#334155", fontWeight: "600" },
    delBtn: { padding: 6, marginLeft: 8 },
});
