// app/(app)/(tabs)/lifecycle/add/step-4.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
    Platform,
    Modal,
    Pressable,
    KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";

import StepHeader from "@/src/components/lifecycle/stepHeader";
import DateField from "@/src/components/lifecycle/DateField";
import { colors } from "@/src/theme/colors";
import { useAddItemWizard } from "@/src/hooks/useAddItemWizard";
import { ensureNotifPermission, scheduleLocalAt, isExpoGo } from "@/src/services/notification";



// ---------- types & constants ----------
type Rule = "none" | "q3" | "q6" | "yearly" | "custom";

const RULE_LABELS: Record<Rule, string> = {
    none: "None",
    q3: "Every 3 months",
    q6: "Every 6 months",
    yearly: "Yearly",
    custom: "Custom",
};

// ---------- helpers ----------
const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
const parseIso = (iso: string) => new Date(iso + "T00:00:00");

function addMonths(iso: string, months: number) {
    const d = parseIso(iso);
    const nd = new Date(d);
    nd.setMonth(nd.getMonth() + months);
    // clamp EOM overflow
    if (nd.getDate() !== d.getDate()) nd.setDate(0);
    return fmtDate(nd);
}

function combineDateTime(isoDate: string, hhmm: string) {
    const [hh, mm] = hhmm.split(":").map(Number);
    const d = new Date(`${isoDate}T00:00:00`);
    d.setHours(hh ?? 0, mm ?? 0, 0, 0);
    return d;
}

function nowUTC() {
    const d = new Date();
    return d;
}

/**
 * Computes the next reminder date (YYYY-MM-DD) based on:
 *  - rule
 *  - firstDate
 *  - today (push forward if the firstDate is in the past)
 */
function computeNextDate(rule: Rule, firstDate?: string): string | null {
    if (!firstDate) return null;
    const today = fmtDate(nowUTC());

    // if firstDate is still in the future → that's the next one
    if (firstDate >= today) return firstDate;

    // otherwise roll forward according to the rule
    switch (rule) {
        case "none":
            return null;
        case "q3": {
            let d = firstDate;
            while (d < today) d = addMonths(d, 3);
            return d;
        }
        case "q6": {
            let d = firstDate;
            while (d < today) d = addMonths(d, 6);
            return d;
        }
        case "yearly": {
            let d = firstDate;
            while (d < today) d = addMonths(d, 12);
            return d;
        }
        case "custom":
            return firstDate;
    }
}

// ---------- small UI helpers ----------
function Pill({ children }: { children: React.ReactNode }) {
    return (
        <View className="px-2 py-1 rounded-full bg-surface-foreground/30">
            <Text className="text-xs text-text-hint">{children}</Text>
        </View>
    );
}

function Row({ children }: { children: React.ReactNode }) {
    return (
        <View className="flex-row items-center justify-between px-4 py-3 rounded-xl bg-white border border-surface-foreground mb-3">
            {children}
        </View>
    );
}

// ---------- Select Modal ----------
function SelectModal({
    visible,
    onClose,
    value,
    onSelect,
}: {
    visible: boolean;
    onClose: () => void;
    value: Rule;
    onSelect: (r: Rule) => void;
}) {
    const items: Rule[] = ["none", "q3", "q6", "yearly", "custom"];
    return (
        <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
            <Pressable onPress={onClose} className="flex-1 bg-black/40 items-center justify-center px-6">
                <Pressable className="w-full rounded-2xl bg-white p-2" onPress={() => { }}>
                    {items.map((r, i) => (
                        <TouchableOpacity
                            key={r}
                            activeOpacity={0.8}
                            onPress={() => {
                                onSelect(r);
                                onClose();
                            }}
                            className="flex-row items-center justify-between px-4 py-3"
                            style={{ borderBottomWidth: i < items.length - 1 ? 1 : 0, borderColor: "#eee" }}
                        >
                            <Text className="text-base">{RULE_LABELS[r]}</Text>
                            {value === r ? <Ionicons name="checkmark" size={18} color={colors.brand.primary} /> : null}
                        </TouchableOpacity>
                    ))}
                </Pressable>
            </Pressable>
        </Modal>
    );
}

// ---------- screen ----------
export default function Step4() {
    const { draft, setPartial } = useAddItemWizard();

    const [rule, setRule] = useState<Rule>(() => {
        const f = draft.maintenance?.frequency;
        if (!f || f === "none") return "none";
        if (f === "monthly") return "custom";
        if (f === "quarterly") return "q3";
        if (f === "yearly") return "yearly";
        return (draft.maintenance?.frequency as any) === "custom" ? "custom" : "none";
    });

    const [firstDate, setFirstDate] = useState<string | undefined>(draft.maintenance?.firstDate);
    const [timeStr, setTimeStr] = useState<string>(draft.maintenance?.time ?? "09:00");
    const [enabled, setEnabled] = useState<boolean>(!!draft.maintenance?.enabled);

    const [timePickerOpen, setTimePickerOpen] = useState(false);
    const [selOpen, setSelOpen] = useState(false);

    const nextDate = useMemo(() => computeNextDate(rule, firstDate), [rule, firstDate]);

    const headerRight = useMemo(() => {
        const parts: string[] = [RULE_LABELS[rule]];
        if (enabled) parts.push("Notifications On");
        return parts.join(" • ");
    }, [rule, enabled]);

    const onBack = () => router.push("/(app)/(tabs)/lifecycle/add/step-3");

    const onSkip = () => {
        setPartial({
            maintenance: {
                frequency:
                    rule === "q3"
                        ? "quarterly"
                        : rule === "q6"
                            ? "custom"
                            : rule === "yearly"
                                ? "yearly"
                                : rule === "custom"
                                    ? "custom"
                                    : "none",
                firstDate,
                time: timeStr,
                enabled,
                nextDate: nextDate ?? undefined,
            },
        });
        router.push("/(app)/(tabs)/lifecycle/add/step-5");
    };

    const onNext = async () => {
        if (enabled) {
            if (rule === "none") return Alert.alert("Select rule", "Please choose a maintenance rule.");
            if (!firstDate) return Alert.alert("Missing date", "Please pick the first reminder date.");
            if (!timeStr || !/^\d{2}:\d{2}$/.test(timeStr))
                return Alert.alert("Missing time", "Please pick a valid time (HH:mm).");
        }

        setPartial({
            maintenance: {
                frequency:
                    rule === "q3"
                        ? "quarterly"
                        : rule === "q6"
                            ? "custom"
                            : rule === "yearly"
                                ? "yearly"
                                : rule === "custom"
                                    ? "custom"
                                    : "none",
                firstDate,
                time: timeStr,
                enabled,
                nextDate: nextDate ?? undefined,
            },
        });

        // Schedule if enabled
        if (enabled) {
            const granted = await ensureNotifPermission();
            if (!granted) {
                const msg = isExpoGo
                    ? "Expo Go doesn’t support notifications. Build a dev client to enable them."
                    : "Please allow notifications to schedule reminders.";
                Alert.alert("Permission needed", msg);
                return;
            }

            const targetIso = nextDate ?? firstDate!;
            const fireAt = combineDateTime(targetIso, timeStr);
            if (fireAt <= new Date()) {
                Alert.alert("In the past", "The next reminder time is in the past. Please pick a future date/time.");
                return;
            }

            try {
                const res = await scheduleLocalAt(
                    fireAt,
                    "Maintenance reminder",
                    "It’s time to service your item. Tap to view details."
                );

                if (res.skipped) {
                    Alert.alert("Expo Go limitation", "Notifications are disabled in Expo Go, but your settings were saved.");
                } else {
                    Alert.alert("Scheduled", "Your maintenance reminder has been scheduled.");
                }
            } catch (e: any) {
                console.warn("schedule error", e);
                Alert.alert(
                    "Couldn’t schedule",
                    "Failed to schedule the reminder. You can continue and try again later."
                );
            }
        }

        router.push("/(app)/(tabs)/lifecycle/add/step-5");
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-surface-subtle">
            {/* Header */}
            <View>
                <StepHeader title="Add New Item" step={4} total={5} subtitle={headerRight} />
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
                {/* Rule */}
                <Text className="text-lg font-semibold mb-2">Maintenance rule</Text>
                <TouchableOpacity
                    onPress={() => setSelOpen(true)}
                    activeOpacity={0.9}
                    className="rounded-xl bg-white border border-surface-foreground px-4 py-3 flex-row items-center justify-between mb-3"
                >
                    <Text className="font-medium">{RULE_LABELS[rule]}</Text>
                    <Ionicons name="chevron-down" size={18} color={colors.text.hint} />
                </TouchableOpacity>
                <SelectModal
                    visible={selOpen}
                    value={rule}
                    onClose={() => setSelOpen(false)}
                    onSelect={(r) => setRule(r)}
                />

                {/* First reminder date */}
                <Text className="text-lg font-semibold mt-2 mb-2">First reminder date</Text>
                <DateField
                    label=""
                    value={firstDate}
                    onChange={(iso) => setFirstDate(iso)}
                    error={undefined}
                    minimumDate={new Date()}
                />
                <View className="mt-1 flex-row gap-2">
                    <Pill>Earliest: Today</Pill>
                    <Pill>Auto-computes next reminder</Pill>
                </View>

                {/* Time */}
                <Text className="text-lg font-semibold mt-6 mb-2">Time</Text>
                <Row>
                    <Text className="text-text">Remind me at</Text>
                    <TouchableOpacity
                        onPress={() => setTimePickerOpen(true)}
                        activeOpacity={0.9}
                        className="px-3 py-2 rounded-lg bg-surface-foreground/20"
                    >
                        <Text className="font-semibold">{timeStr}</Text>
                    </TouchableOpacity>
                </Row>

                {timePickerOpen && (
                    <DateTimePicker
                        value={combineDateTime(firstDate ?? fmtDate(new Date()), timeStr)}
                        mode="time"
                        is24Hour
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(e, date) => {
                            setTimePickerOpen(Platform.OS === "ios"); // keep open on iOS spinner
                            if (!date) return;
                            const hh = String(date.getHours()).padStart(2, "0");
                            const mm = String(date.getMinutes()).padStart(2, "0");
                            setTimeStr(`${hh}:${mm}`);
                        }}
                    />
                )}

                {/* Toggle notifications */}
                <Text className="text-lg font-semibold mt-6 mb-2">Notifications</Text>
                <Row>
                    <Text className="text-text">Notification for maintenance</Text>
                    <TouchableOpacity
                        onPress={() => setEnabled((v) => !v)}
                        activeOpacity={0.8}
                        className={`px-3 py-2 rounded-full ${enabled ? "bg-brand-accent" : "bg-surface-foreground/30"
                            }`}
                    >
                        <Text className={`font-semibold ${enabled ? "text-white" : "text-text"}`}>
                            {enabled ? "On" : "Off"}
                        </Text>
                    </TouchableOpacity>
                </Row>

                {/* Next reminder (auto) */}
                <View className="mt-2 px-4">
                    <Text className="text-text-hint">
                        Next reminder:{" "}
                        <Text className="font-semibold text-text">
                            {enabled
                                ? nextDate
                                    ? `${nextDate} at ${timeStr}`
                                    : "— (set rule/date)"
                                : "— (notifications off)"}
                        </Text>
                    </Text>
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
