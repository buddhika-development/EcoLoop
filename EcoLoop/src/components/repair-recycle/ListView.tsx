import { View, Text, FlatList, StyleSheet } from "react-native";
import ShopCard from "./ShopCard";
import { colors } from "../../theme/colors";

export default function ListView({ data, onPressItem }:{ data:any[]; onPressItem:(id:string)=>void }) {
  const repair = data.filter(s=>s.type==="repair");
  const recycle = data.filter(s=>s.type==="recycle");

  const Section = ({ title, list }:{title:string; list:any[]}) => (
    <View>
      <Text style={s.title}>{title}</Text>
      <FlatList
        data={list}
        keyExtractor={(item)=>item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={()=><View style={{ height:10 }}/>}
        renderItem={({item})=>(
          <ShopCard shop={item} onPress={()=>onPressItem(item.id)} />
        )}
      />
    </View>
  );

  return (
    <View style={{ gap:16 }}>
      {repair.length>0 && <Section title="Repair Shops" list={repair} />}
      {recycle.length>0 && <Section title="Recycle Shops" list={recycle} />}
      {repair.length===0 && recycle.length===0 && (
        <Text style={s.empty}>No shops found. Try changing filters.</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  title:{ fontSize:16, fontWeight:"800", color: colors.text.base, marginBottom:8 },
  empty:{ color: colors.text.hint, textAlign:"center", paddingVertical:32 }
});
