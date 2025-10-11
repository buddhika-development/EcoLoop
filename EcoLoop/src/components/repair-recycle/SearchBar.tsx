import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { FontAwesome5 } from "@expo/vector-icons";

export default function SearchBar({
  value,
  onChange,
  onOpenFilter,
  filterCount = 0,
  onOpenSaved,
}: {
  value: string;
  onChange: (t: string) => void;
  onOpenFilter: () => void;
  filterCount?: number;
  onOpenSaved?: () => void;
}) {
  return (
    <View style={s.wrap}>
      {/* Search input */}
      <View style={s.field}>
        <FontAwesome5 name="search" size={16} color={colors.text.hint} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Search shops by name"
          placeholderTextColor={colors.text.hint}
          style={s.input}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChange("")}>
            <FontAwesome5 name="times" size={14} color={colors.text.hint} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter icon + badge */}
      <View style={{ position: "relative" }}>
        <TouchableOpacity onPress={onOpenFilter} style={s.filterBtn}>
          <FontAwesome5 name="sliders-h" size={16} color={colors.brand.primary} />
        </TouchableOpacity>
        {filterCount > 0 && (
          <View style={s.badge}>
            <Text style={s.badgeText}>{filterCount}</Text>
          </View>
        )}
      </View>

      {/* Bookmark (Saved shops) */}
      <TouchableOpacity onPress={onOpenSaved} style={s.filterBtn}>
        <FontAwesome5 name="bookmark" size={16} color={colors.brand.primary} />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  field: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface.base,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: colors.surface.foreground,
  },
  input: {
    flex: 1,
    color: colors.text.base,
  },
  filterBtn: {
    height: 44,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.surface.foreground,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ef4444",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
  },
});
