// app/(app)/(tabs)/lifecycle/item/schedule.tsx
import { useEffect, useMemo, useState } from "react";
import {
    View, Text, TouchableOpacity, ScrollView, Alert, Platform, KeyboardAvoidingView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, router } from "expo-router";

import { colors } from "@/src/theme/colors";
import StepHeader from "@/src/components/lifecycle/stepHeader";
import Field from "@/src/components/lifecycle/Field";
import { saveMaintenanceForItem, computeNextDate, combineDateTime } from "@/src/services/lifecycle";
import { ensureNotifPermission, isExpoGo, scheduleLocalAt } from "@/src/services/notification";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

type Rule = "none" | "q3" | "q6" | "yearly";
const RULE_LABELS: Record<Rule, string> = {
    none: "None",
    q3: "Every 3 months",
    q6: "Every 6 months",
    yearly: "Yearly",
};

const fmt = (d: Date) => d.toISOString().slice(0, 10);

export default function ScheduleMaintenance() {
    const { itemId } = useLocalSearchParams<{ itemId: string }>();

    // UI state
    const [title, setTitle] = useState("Clean Water filter");
    const [dateIso, setDateIso] = useState(fmt(new Date()));
    const [timeStr, setTimeStr] = useState("09:00");
    const [repeat, setRepeat] = useState<Rule>("none");
    const [enabled, setEnabled] = useState(true);

    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [timePickerOpen, setTimePickerOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [itemName, setItemName] = useState<string>("");

    // load the item name for header
    useEffect(() => {
        if (!itemId) return;
        (async () => {
            const snap = await getDoc(doc(db, "items", String(itemId)));
            if (snap.exists()) setItemName((snap.data() as any)?.name ?? "Item");
        })();
    }, [itemId]);

    const nextDate = useMemo(() => computeNextDate(repeat, dateIso), [repeat, dateIso]);

    async function onSave() {
        if (!itemId) {
            Alert.alert("Missing item", "We couldn't find the item.");
            return;
        }
        if (!title.trim()) {
            Alert.alert("Title required", "Please enter a title.");
            return;
        }
        if (!dateIso) {
            Alert.alert("Date required", "Please pick a date.");
            return;
        }
        if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr)) {
            Alert.alert("Time required", "Please pick a valid time.");
            return;
        }

        try {
            setSaving(true);

            // 1) Save to Firestore inside the item doc
            await saveMaintenanceForItem(String(itemId), {
                title: title.trim(),
                firstDate: dateIso,
                time: timeStr,
                rule: repeat,
                enabled,
            });

            // 2) Schedule a local notification for the next occurrence
            if (enabled) {
                const granted = await ensureNotifPermission();
                if (!granted) {
                    Alert.alert(
                        "Permission needed",
                        isExpoGo
                            ? "Expo Go doesn’t support notifications. Build a dev client to enable them."
                            : "Please allow notifications to schedule reminders."
                    );
                } else {
                    const targetIso = nextDate ?? dateIso;
                    const fireAt = combineDateTime(targetIso, timeStr);
                    if (fireAt <= new Date()) {
                        Alert.alert("In the past", "Pick a future date/time.");
                    } else {
                        const res = await scheduleLocalAt(
                            fireAt,
                            title.trim(),
                            "It’s time to service your item. Tap to view details."
                        );
                        if (res.skipped) {
                            Alert.alert("Expo Go limitation", "Saved, but notifications are disabled in Expo Go.");
                        } else {
                            Alert.alert("Scheduled", "Your maintenance reminder has been scheduled.");
                        }
                    }
                }
            }

            router.replace(`/(app)/(tabs)/lifecycle/item/${itemId}`);
        } catch (e: any) {
            console.warn(e);
            Alert.alert("Couldn’t save", e?.message ?? "Please try again.");
        } finally {
            setSaving(false);
        }
    }

    function TimeButton() {
        return (
            <TouchableOpacity
                onPress={() => setTimePickerOpen(true)}
                activeOpacity={0.9}
                className="px-3 py-2 rounded-lg bg-surface-foreground/20"
            >
                <Text className="font-semibold">{timeStr}</Text>
            </TouchableOpacity>
        );
    }

    function RepeatRow() {
        return (
            <View className="rounded-xl bg-white border border-surface-foreground px-4 py-3">
                <Text className="text-text mb-2">Repeat</Text>
                <View className="flex-row flex-wrap -mx-1">
                    {(["none", "q3", "q6", "yearly"] as Rule[]).map((r) => {
                        const active = repeat === r;
                        return (
                            <TouchableOpacity
                                key={r}
                                onPress={() => setRepeat(r)}
                                className="px-2 mx-1 my-1 h-9 rounded-full items-center justify-center"
                                style={{
                                    backgroundColor: active ? colors.brand.accent : "#EEE",
                                }}
                            >
                                <Text style={{ color: active ? "#fff" : "#333", fontWeight: "600" }}>
                                    {RULE_LABELS[r]}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-surface-subtle">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header bar you already use in wizard pages */}
            <View>
                <StepHeader title="Schedule a Maintenance" step={0} />
                <TouchableOpacity
                    onPress={() => router.back()}
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
                {/* Item name */}
                <Text className="text-xl font-extrabold mb-4">{itemName || "Item"}</Text>

                {/* Title */}
                <Field
                    label="Title"
                    inputProps={{
                        value: title,
                        onChangeText: setTitle,
                        placeholder: "e.g., Clean Water filter",
                    }}
                />

                {/* Reminder date */}
                <Text className="mt-4 mb-2 text-text">Reminder date</Text>
                <TouchableOpacity
                    onPress={() => setDatePickerOpen(true)}
                    activeOpacity={0.9}
                    className="rounded-xl bg-white border border-surface-foreground px-4 py-3"
                >
                    <Text className="text-text">{dateIso}</Text>
                </TouchableOpacity>

                {datePickerOpen && (
                    <DateTimePicker
                        value={new Date(dateIso + "T00:00:00")}
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(e, date) => {
                            setDatePickerOpen(Platform.OS === "ios"); // keep spinner open on iOS until outside tap
                            if (date) setDateIso(fmt(date));
                        }}
                    />
                )}

                {/* Time */}
                <Text className="mt-4 mb-2 text-text">Time</Text>
                <View className="rounded-xl bg-white border border-surface-foreground px-4 py-3 flex-row items-center justify-between">
                    <Text className="text-text">Remind me at</Text>
                    <TimeButton />
                </View>
                {timePickerOpen && (
                    <DateTimePicker
                        value={combineDateTime(dateIso, timeStr)}
                        mode="time"
                        is24Hour
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(e, date) => {
                            setTimePickerOpen(Platform.OS === "ios");
                            if (!date) return;
                            const hh = String(date.getHours()).padStart(2, "0");
                            const mm = String(date.getMinutes()).padStart(2, "0");
                            setTimeStr(`${hh}:${mm}`);
                        }}
                    />
                )}

                {/* Repeat */}
                <Text className="mt-4 mb-2 text-text">Repeat</Text>
                <RepeatRow />

                {/* Toggle notifications */}
                <View className="rounded-xl bg-white border border-surface-foreground px-4 py-3 mt-4 flex-row items-center justify-between">
                    <Text className="text-text">Notification for maintenance</Text>
                    <TouchableOpacity
                        onPress={() => setEnabled((v) => !v)}
                        activeOpacity={0.8}
                        className={`px-4 h-9 rounded-full items-center justify-center ${enabled ? "bg-brand-accent" : "bg-surface-foreground/30"}`}
                    >
                        <Text className={`font-semibold ${enabled ? "text-white" : "text-text"}`}>{enabled ? "On" : "Off"}</Text>
                    </TouchableOpacity>
                </View>

                {/* Buttons */}
                <View className="flex-row mt-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        activeOpacity={0.9}
                        className="flex-1 mr-2 rounded-xl bg-white border border-surface-foreground py-3 items-center"
                    >
                        <Text className="text-text font-semibold">Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={onSave}
                        disabled={saving}
                        activeOpacity={0.9}
                        className="flex-1 ml-2 rounded-xl py-3 items-center"
                        style={{ backgroundColor: colors.brand.accent, opacity: saving ? 0.6 : 1 }}
                    >
                        <Text className="text-white font-semibold">{saving ? "Saving…" : "Save"}</Text>
                    </TouchableOpacity>
                </View>

                {/* Next occurrence hint */}
                <Text className="text-xs text-text-hint mt-4">
                    Next reminder:{" "}
                    <Text className="text-text font-semibold">
                        {enabled ? (nextDate ? `${nextDate} at ${timeStr}` : "—") : "— (notifications off)"}
                    </Text>
                </Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
