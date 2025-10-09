import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { FontAwesome5 } from "@expo/vector-icons";

export default function SearchBar({ value, onChange, onOpenFilter }: {
  value: string; onChange: (t:string)=>void; onOpenFilter: ()=>void;
}) {
  return (
    <View style={s.wrap}>
      <View style={s.field}>
        <FontAwesome5 name="search" size={16} color={colors.text.hint} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Search shops by name"
          placeholderTextColor={colors.text.hint}
          style={s.input}
        />
      </View>
      <TouchableOpacity onPress={onOpenFilter} style={s.filterBtn}>
        <FontAwesome5 name="sliders-h" size={16} color={colors.brand.primary} />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap:{ flexDirection:"row", gap:10, alignItems:"center", marginBottom:8 },
  field:{ flex:1, flexDirection:"row", alignItems:"center", gap:8, backgroundColor: colors.surface.base, borderRadius:12, paddingHorizontal:12, height:44, borderWidth:1, borderColor: colors.surface.foreground },
  input:{ flex:1, color: colors.text.base },
  filterBtn:{ height:44, width:44, alignItems:"center", justifyContent:"center", backgroundColor:"#fff", borderRadius:12, borderWidth:1, borderColor: colors.surface.foreground }
});
