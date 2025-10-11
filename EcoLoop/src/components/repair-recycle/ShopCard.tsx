import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { colors } from "@/src/theme/colors";
import type { ShopView } from "@/src/features/repair-recycle/api";

type Props = {
  shop: ShopView;
  onPress?: () => void;
};

export default function ShopCard({ shop, onPress }: Props) {
  const open = shop.openNow;
  const rating = shop.rating?.avg ?? 0;
  const count = shop.rating?.count ?? 0;

  // dynamic color for logo background
  const logoBg =
    shop.type === "recycle" ? colors.brand.accent : colors.brand.primary;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={s.card}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        {/* Logo / Fallback */}
        {shop.logoUrl ? (
          <Image source={{ uri: shop.logoUrl }} style={s.logo} />
        ) : (
          <View style={[s.logoFallback, { backgroundColor: logoBg }]}>
            <FontAwesome5 name={shop.type === "recycle" ? "recycle" : "wrench"} size={22} color="#fff" />
          </View>
        )}

        {/* Main info */}
        <View style={{ flex: 1, gap: 4 }}>
          {/* Shop name + open status */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text numberOfLines={1} style={s.name}>
              {shop.name}
            </Text>
            <Text
              style={[
                s.badge,
                open
                  ? { backgroundColor: "#e9f9ef", color: colors.brand.accent }
                  : { backgroundColor: "#fff3e8", color: "#c26c1c" },
              ]}
            >
              {open ? "Open" : "Closed"}
            </Text>
          </View>

          {/* Rating */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <FontAwesome name="star" size={14} color="#fbbf24" />
            <Text style={s.ratingText}>{rating.toFixed(1)}</Text>
            <Text style={s.muted}>({count})</Text>
          </View>

          {/* Address */}
          {shop.address ? (
            <Text numberOfLines={1} style={s.addr}>
              {shop.address}
            </Text>
          ) : null}

          {/* Categories (first 2 only) */}
          <View
            style={{
              flexDirection: "row",
              gap: 6,
              marginTop: 2,
              flexWrap: "wrap",
            }}
          >
            {shop.categories?.slice(0, 2).map((c) => (
              <View key={c} style={s.catPill}>
                <Text style={{ color: colors.text.base }}>{c}</Text>
              </View>
            ))}
            {shop.categories && shop.categories.length > 2 && (
              <View style={s.catPill}>
                <Text style={{ color: colors.text.base }}>
                  +{shop.categories.length - 2} more
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.base,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surface.foreground,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.surface.subtle,
  },
  logoFallback: {
    width: 56,
    height: 56,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    color: colors.text.base,
    fontWeight: "800",
    fontSize: 16,
    maxWidth: "70%",
  },
  ratingText: { color: colors.text.base, fontWeight: "700" },
  muted: { color: colors.text.hint },
  addr: { color: colors.text.base },
  catPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.surface.foreground,
    backgroundColor: colors.surface.subtle,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
    fontWeight: "800",
  },
});
