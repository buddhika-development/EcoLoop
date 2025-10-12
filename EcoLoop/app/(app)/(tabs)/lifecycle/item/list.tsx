// app/(app)/(tabs)/lifecycle/index.tsx
import { useMemo, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    FlatList,
    ActivityIndicator,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { colors } from "@/src/theme/colors";
import ItemCard from "@/src/components/lifecycle/ItemCard";
import { useMyItems, ItemDoc } from "@/src/hooks/useMyItems";

function Header() {
    return (
        <View className="px-5 pt-6 pb-3" style={{ backgroundColor: "transparent" }}>
            <Text className="text-3xl font-extrabold text-text">My Items</Text>
        </View>
    );
}

export default function LifecycleHome() {
    const { items, loading } = useMyItems();
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter((it) =>
            [it.name, it.brand, it.model, it.category]
                .filter(Boolean)
                .some((s) => String(s).toLowerCase().includes(q))
        );
    }, [items, query]);

    return (
        <View className="flex-1 bg-surface-subtle">
            <View className="px-4 pt-2  flex-row items-center justify-between">
                <TouchableOpacity
                    onPress={() => router.back()}
                    activeOpacity={0.8}
                    style={{ padding: 8, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.05)" }}
                >
                    <Ionicons name="arrow-back" size={20} color={colors.text.base} />
                </TouchableOpacity>
            </View>

            <Header />

            {/* Segmented buttons */}
            <View className="px-5 flex-row gap-3 mb-3">
                <TouchableOpacity
                    activeOpacity={0.9}
                    className="flex-1 rounded-full items-center py-2"
                    style={{ backgroundColor: colors.surface.base, borderWidth: 1, borderColor: colors.surface.foreground }}
                >
                    <Text className="font-semibold text-text">Items</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => router.push("/(app)/(tabs)/lifecycle/item/reminders")}
                    className="flex-1 rounded-full items-center py-2"
                    style={{ backgroundColor: "#F5F7FB", borderWidth: 1, borderColor: colors.surface.foreground }}
                >
                    <Text className="font-semibold text-text-hint">Reminders</Text>
                </TouchableOpacity>
            </View>

            {/* Search + Add */}
            <View className="px-5 flex-row items-center gap-3">
                <View
                    className="flex-1 flex-row items-center px-3 rounded-xl bg-white border"
                    style={{ borderColor: colors.surface.foreground, height: 44 }}
                >
                    <Ionicons name="search" size={18} color={colors.text.hint} />
                    <TextInput
                        placeholder="Search items..."
                        placeholderTextColor="#9AA0A6"
                        value={query}
                        onChangeText={setQuery}
                        className="flex-1 ml-2 text-text"
                        returnKeyType="search"
                    />
                </View>

                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => router.push("/(app)/(tabs)/lifecycle/add/step-1")}
                    className="flex-row items-center rounded-xl px-3 py-2"
                    style={{ backgroundColor: colors.brand.accent }}
                >
                    <Ionicons name="add" size={18} color="#fff" />
                    <Text className="text-white font-bold ml-1">Add item</Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            <View className="flex-1 px-5 mt-4">
                {loading ? (
                    <View className="mt-10 items-center">
                        <ActivityIndicator />
                        <Text className="text-text-hint mt-2">Loading…</Text>
                    </View>
                ) : filtered.length === 0 ? (
                    <View className="mt-16 items-center">
                        <Ionicons name="cube-outline" size={42} color={colors.text.hint} />
                        <Text className="text-text-hint mt-2">No items found</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filtered}
                        keyExtractor={(it) => it.id}
                        renderItem={({ item }) => (
                            <ItemCard
                                item={item as ItemDoc}
                                onPress={() => router.push(`/(app)/(tabs)/lifecycle/item/${item.id}`)}
                            />
                        )}
                        contentContainerStyle={{ paddingBottom: 32 }}
                    />
                )}
            </View>
        </View>
    );
}
