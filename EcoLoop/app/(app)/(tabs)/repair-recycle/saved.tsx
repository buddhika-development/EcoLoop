// app/(app)/repair-recycle/saved.tsx
import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "@/src/theme/colors";
import { auth } from "@/src/lib/firebase";
import { listSavedShops, unsaveShop } from "@/src/features/repair-recycle/saved";
import type { ShopView } from "@/src/features/repair-recycle/api";
import ShopCard from "@/src/components/repair-recycle/ShopCard";

export default function SavedShopsScreen() {
  const router = useRouter();
  const uid = auth.currentUser?.uid;

  const [rows, setRows] = useState<ShopView[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const data = await listSavedShops(uid);
      setRows(data);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => { load(); }, [load]);

  const openShop = (id: string) => router.push(`/repair-recycle/shop/${id}`);

  const onUnsave = (shopId: string) => {
    if (!uid) return;
    Alert.alert("Remove saved shop?", "This will remove it from your saved list.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await unsaveShop(uid, shopId);
          load();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.subtle }}>
      {/* header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.iconBtn}>
          <MaterialIcons name="arrow-back" size={20} color={colors.text.base} />
        </TouchableOpacity>
        <Text style={s.title}>Saved Shops</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={rows}
        keyExtractor={(x) => x.id}
        contentContainerStyle={{ padding: 16, gap: 10, flexGrow: 1 }}
        renderItem={({ item }) => (
          <View style={{ gap: 8 }}>
            <ShopCard shop={item} onPress={() => openShop(item.id)} />
            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity onPress={() => onUnsave(item.id)} style={s.unsaveBtn}>
                <MaterialIcons name="bookmark-remove" size={18} color={colors.brand.primary} />
                <Text style={s.unsaveText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={s.empty}>
            <MaterialIcons name="bookmark-border" size={40} color={colors.surface.foreground} />
            <Text style={{ color: colors.text.hint, marginTop: 8 }}>
              {loading ? "Loading…" : "No saved shops yet."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBtn: {
    height: 40, width: 40, borderRadius: 12, backgroundColor: "#fff",
    borderWidth: 1, borderColor: colors.surface.foreground,
    alignItems: "center", justifyContent: "center",
  },
  title: { flex: 1, textAlign: "center", fontWeight: "800", color: colors.text.base, fontSize: 16 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60 },
  unsaveBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 10, paddingVertical: 8,
    borderRadius: 10, backgroundColor: "#fff",
    borderWidth: 1, borderColor: colors.surface.foreground,
  },
  unsaveText: { color: colors.brand.primary, fontWeight: "700" },
});
