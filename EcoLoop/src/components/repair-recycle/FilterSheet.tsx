import { useMemo, useState } from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { CATEGORIES } from "../../features/repair-recycle/categories";

type Props = {
  visible: boolean;
  onClose: ()=>void;
  initial: { type: "repair"|"recycle"|"both"; categories: string[]; rating_gte?: number; openNow?: boolean };
  onApply: (v: Props["initial"])=>void;
};

export default function FilterSheet({ visible, onClose, initial, onApply }: Props){
  const [type, setType] = useState(initial.type);
  const [selected, setSelected] = useState<string[]>(initial.categories || []);
  const [openNow, setOpenNow] = useState(!!initial.openNow);
  const [rating, setRating] = useState(initial.rating_gte ?? 0);

  const options = useMemo(()=>{
    if (type === "both") return [...CATEGORIES.repair, ...CATEGORIES.recycle];
    return type === "repair" ? CATEGORIES.repair : CATEGORIES.recycle;
  },[type]);

  const toggle = (key: string) => {
    setSelected(prev => prev.includes(key) ? prev.filter(k=>k!==key) : [...prev, key]);
  };

  const apply = () => onApply({ type, categories: selected, rating_gte: rating, openNow });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.header}>
            <Text style={s.title}>Filters</Text>
            <TouchableOpacity onPress={onClose}><Text style={s.link}>Close</Text></TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>

            <Text style={s.label}>Shop Type</Text>
            <View style={s.row}>
              {(["repair","recycle","both"] as const).map(v=>(
                <TouchableOpacity key={v} onPress={()=>setType(v)} style={[s.chip, type===v && s.chipActive]}>
                  <Text style={[s.chipText, type===v && s.chipTextActive]}>{v.toUpperCase()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>Categories</Text>
            <View style={s.wrap}>
              {options.map(({ key, label, Icon, color })=>(
                <TouchableOpacity key={key} onPress={()=>toggle(key)} style={[s.pill, selected.includes(key) && { backgroundColor: color + "22", borderColor: color }]}>
                  <Icon name="tag" size={14} color={color} />
                  <Text style={s.pillText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>Quick Filters</Text>
            <View style={s.row}>
              <TouchableOpacity onPress={()=>setOpenNow(!openNow)} style={[s.chip, openNow && s.chipActiveAccent]}>
                <Text style={[s.chipText, openNow && s.chipTextActiveAccent]}>{openNow ? "Open Now ✓" : "Open Now"}</Text>
              </TouchableOpacity>
              {[4,3.5,3].map(r=>(
                <TouchableOpacity key={r} onPress={()=>setRating(r)} style={[s.chip, rating===r && s.chipActive]}>
                  <Text style={[s.chipText, rating===r && s.chipTextActive]}>{r}★+</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={()=>setRating(0)} style={s.chip}><Text style={s.chipText}>Any Rating</Text></TouchableOpacity>
            </View>

          </ScrollView>

          <View style={s.footer}>
            <TouchableOpacity onPress={()=>{ setType("both"); setSelected([]); setOpenNow(false); setRating(0); }} style={s.btnOutline}>
              <Text style={[s.btnText, { color: colors.brand.primary }]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={apply} style={s.btnPrimary}>
              <Text style={[s.btnText, { color: colors.text.inverse }]}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay:{ flex:1, backgroundColor:"rgba(0,0,0,0.35)", justifyContent:"flex-end" },
  sheet:{ backgroundColor:"#fff", borderTopLeftRadius:16, borderTopRightRadius:16, maxHeight:"86%" },
  header:{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", padding:16, borderBottomWidth:1, borderColor: colors.surface.foreground },
  title:{ fontSize:18, fontWeight:"700", color: colors.text.base },
  link:{ color: colors.brand.primary },
  label:{ marginTop:12, marginHorizontal:16, marginBottom:8, color: colors.text.hint, fontWeight:"600" },
  row:{ flexDirection:"row", gap:8, paddingHorizontal:16, flexWrap:"wrap" },
  wrap:{ flexDirection:"row", gap:8, paddingHorizontal:16, flexWrap:"wrap" },
  chip:{ paddingVertical:8, paddingHorizontal:12, borderRadius:10, backgroundColor:"#fff", borderWidth:1, borderColor: colors.surface.foreground },
  chipActive:{ backgroundColor: colors.brand.primary, borderColor: colors.brand.primary },
  chipText:{ color: colors.text.base, fontWeight:"600" },
  chipTextActive:{ color: colors.text.inverse },
  chipActiveAccent:{ backgroundColor: colors.brand.accent },
  chipTextActiveAccent:{ color: colors.text.inverse, fontWeight:"700" },
  pill:{ flexDirection:"row", alignItems:"center", gap:6, paddingHorizontal:12, paddingVertical:8, backgroundColor:"#fff", borderWidth:1, borderColor: colors.surface.foreground, borderRadius:24 },
  pillText:{ color: colors.text.base },
  footer:{ flexDirection:"row", gap:10, padding:16, borderTopWidth:1, borderColor: colors.surface.foreground },
  btnOutline:{ flex:1, alignItems:"center", justifyContent:"center", padding:12, borderWidth:1, borderColor: colors.brand.primary, borderRadius:12 },
  btnPrimary:{ flex:1, alignItems:"center", justifyContent:"center", padding:12, backgroundColor: colors.brand.primary, borderRadius:12 },
  btnText:{ fontWeight:"700" },
});
