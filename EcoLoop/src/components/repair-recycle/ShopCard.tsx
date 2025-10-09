import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { FontAwesome5 } from "@expo/vector-icons";

export default function ShopCard({ shop, onPress }: { shop: any; onPress: ()=>void }) {
  return (
    <TouchableOpacity onPress={onPress} style={s.card}>
      <View style={{ flex:1 }}>
        <Text style={s.name}>{shop.name}</Text>
        <Text style={s.rowText}>
          {(shop.categories || []).join(", ")}
        </Text>
        <View style={s.row}>
          <Text style={s.rating}>{shop.rating?.avg?.toFixed?.(1) ?? "0.0"}★</Text>
          {shop.openNow ? (
            <Text style={[s.badge, { backgroundColor:"#e9f9ef", color: colors.brand.accent }]}>OPEN</Text>
          ) : (
            <Text style={[s.badge, { backgroundColor:"#fff3e8", color:"#c26c1c" }]}>CLOSED</Text>
          )}
          {shop.distanceKm != null && (
            <Text style={s.muted}>{shop.distanceKm.toFixed(1)} km away</Text>
          )}
        </View>
      </View>
      <FontAwesome5 name={shop.type === "recycle" ? "recycle" : "wrench"} size={18} color={shop.type==="recycle" ? colors.brand.accent : colors.brand.primary} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  card:{ backgroundColor:"#fff", borderRadius:12, borderWidth:1, borderColor: colors.surface.foreground, padding:12, flexDirection:"row", gap:12, alignItems:"center" },
  name:{ fontSize:16, fontWeight:"700", color: colors.text.base, marginBottom:4 },
  row:{ flexDirection:"row", alignItems:"center", gap:8, marginTop:6 },
  rowText:{ color: colors.text.hint },
  rating:{ color: colors.text.base, fontWeight:"700" },
  badge:{ paddingHorizontal:8, paddingVertical:2, borderRadius:999, overflow:"hidden", fontWeight:"700" },
  muted:{ color: colors.text.hint }
});
