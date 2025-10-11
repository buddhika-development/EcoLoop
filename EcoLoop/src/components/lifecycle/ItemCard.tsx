// src/components/lifecycle/ItemCard.tsx
import { memo, useMemo } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/src/theme/colors";
import type { ItemDoc } from "@/src/hooks/useMyItems";

const CAT_META: Record<ItemDoc["category"], { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
    "home-appliance": { icon: "home-outline", color: "#E8F5E9" },
    electronics: { icon: "tv-outline", color: "#E8F0FF" },
    "office-equipment": { icon: "business-outline", color: "#EAF3FF" },
    furniture: { icon: "bed-outline", color: "#FFF3E0" },
    other: { icon: "apps-outline", color: "#F3F4F6" },
};

function addMonths(iso: string, months: number) {
    const d = new Date(iso + "T00:00:00");
    const nd = new Date(d);
    nd.setMonth(nd.getMonth() + months);
    if (nd.getDate() !== d.getDate()) nd.setDate(0);
    return nd.toISOString().slice(0, 10);
}

function warrantyExpiry(item: ItemDoc): string | null {
    if (item.warrantyExpiry) return item.warrantyExpiry;
    if (item.purchaseDate && (item.warrantyMonths ?? 0) > 0) {
        return addMonths(item.purchaseDate, item.warrantyMonths || 0);
    }
    return null;
}

function daysUntil(iso: string) {
    const today = new Date();
    const target = new Date(iso + "T00:00:00");
    const ms = target.getTime() - new Date(today.toDateString()).getTime();
    return Math.round(ms / (1000 * 60 * 60 * 24));
}

function formatDate(iso?: string | null) {
    if (!iso) return "—";
    const d = new Date(iso + "T00:00:00");
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}/${m}/${day}`;
}

export function computeWarrantyBadge(item: ItemDoc): { text: string; tint: string; textColor: string } {
    const exp = warrantyExpiry(item);
    if (!exp || (item.warrantyMonths ?? 0) <= 0) {
        return { text: "No Warranty", tint: "#F3F4F6", textColor: "#6B7280" };
    }
    const d = daysUntil(exp);
    if (d < 0) return { text: "Warranty expired", tint: "#FDECEC", textColor: "#B91C1C" };
    if (d <= 7) return { text: `Warranty ends in ${d} days`, tint: "#FEF2F2", textColor: "#DC2626" };
    if (d <= 30) return { text: `Warranty ends in ${d} days`, tint: "#FFF7ED", textColor: "#C2410C" };
    if (d <= 365) return { text: `Warranty ends in ${Math.ceil(d / 30)} months`, tint: "#ECFDF5", textColor: "#065F46" };
    return { text: `Warranty ends in 1+ year`, tint: "#ECFDF5", textColor: "#065F46" };
}

type Props = {
    item: ItemDoc;
    onPress?: () => void;
};

function ItemCardBase({ item, onPress }: Props) {
    const meta = CAT_META[item.category];
    const badge = useMemo(() => computeWarrantyBadge(item), [item]);

    const cover = item.images?.[0];

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            className="mb-4"
            style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.surface.foreground,
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 3 },
                elevation: 2,
            }}
        >
            <View className="flex-row p-3">
                {/* left color rail */}
                <View style={{ width: 5, borderRadius: 8, backgroundColor: meta.color, marginRight: 10 }} />

                {/* thumbnail */}
                <View
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: 14,
                        backgroundColor: meta.color,
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        marginRight: 12,
                    }}
                >
                    {cover ? (
                        <Image source={{ uri: cover }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                    ) : (
                        <Ionicons name={meta.icon} size={22} color={colors.brand.primary} />
                    )}
                </View>

                {/* content */}
                <View style={{ flex: 1 }}>
                    <View className="flex-row items-center justify-between">
                        <Text className="text-base font-extrabold text-text" numberOfLines={1}>
                            {item.name || "Untitled"}
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={colors.text.hint} />
                    </View>

                    {/* warranty badge */}
                    <View
                        style={{
                            alignSelf: "flex-start",
                            marginTop: 6,
                            backgroundColor: badge.tint,
                            borderRadius: 999,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                        }}
                    >
                        <Text style={{ fontSize: 12, color: badge.textColor, fontWeight: "600" }}>{badge.text}</Text>
                    </View>

                    {/* maintenance info */}
                    <Text className="text-[12px] text-text-hint mt-6">
                        Next maintenance: {formatDate(item.maintenance?.nextDate)}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const ItemCard = memo(ItemCardBase);
export default ItemCard;
