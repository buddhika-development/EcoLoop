import { useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from "react-native";
import { colors } from "@/src/theme/colors";
import SearchBar from "@/src/components/repair-recycle/SearchBar";
import FilterSheet from "@/src/components/repair-recycle/FilterSheet";
import RRMapView, { RRMapHandle } from "@/src/components/repair-recycle/MapView";
import ListView from "@/src/components/repair-recycle/ListView";
import { useCurrentLocation, useDebounce, useShops } from "@/src/features/repair-recycle/hooks";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";

type Filters = {
  type:"repair"|"recycle"|"both";
  categories:string[];
  rating_gte?:number;
  openNow?:boolean;
};

function countActiveFilters(f: Filters) {
  let n = 0;
  if (f.type && f.type !== "both") n++;
  if (f.categories && f.categories.length > 0) n++;
  if (f.rating_gte && f.rating_gte > 0) n++;
  if (f.openNow) n++;
  return n;
}

export default function ShopFinder() {
  const router = useRouter();
  const mapRef = useRef<RRMapHandle>(null);

  const { coords } = useCurrentLocation();

  const [mode, setMode] = useState<"map"|"list">("map");
  const [q, setQ] = useState("");
  const qDebounced = useDebounce(q, 350);

  const [filters, setFilters] = useState<Filters>({
    type:"both", categories:[], rating_gte:0, openNow:false
  });
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data, loading } = useShops({
    q: qDebounced || undefined,
    type: filters.type,
    categories: filters.categories.length ? filters.categories : undefined,
    rating_gte: filters.rating_gte && filters.rating_gte>0 ? filters.rating_gte : undefined,
    openNow: filters.openNow || undefined,
  });

  const filtered = useMemo(()=> data, [data]);
  const filterCount = useMemo(() => countActiveFilters(filters), [filters]);

  const onOpenFilter = () => setSheetOpen(true);
  const onApplyFilter = (v:Filters) => { setFilters(v); setSheetOpen(false); };

  const goToShop = (id:string) => router.push(`/repair-recycle/shop/${id}`);

  const recenter = () => {
    if (!coords) return;
    mapRef.current?.recenterTo(coords.lat, coords.lng);
  };

  const openSaved = () => {
    router.push("/repair-recycle/saved");
  };
  

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.root}>
        {/* Content area — either Map or List, both full-screen */}
        {mode==="map" ? (
          <RRMapView ref={mapRef} data={filtered} userLoc={coords || undefined} onPressMarker={goToShop} />
        ) : (
          <ScrollView contentContainerStyle={{ paddingTop: 120, paddingBottom: 24 }}>
            <View style={{ paddingHorizontal: 16 }}>
              <ListView data={filtered} onPressItem={goToShop} />
            </View>
          </ScrollView>
        )}

        {/* Floating: Search + Filter + Bookmark */}
        <View style={s.floatingTop}>
          <View style={{ paddingHorizontal: 16 }}>
          <SearchBar
              value={q}
              onChange={setQ}
              onOpenFilter={onOpenFilter}
              filterCount={filterCount}
              onOpenSaved={openSaved}
          />
          </View>

          {/* Floating: Map/List toggle */}
          <View style={[s.toggle, { marginTop: 8 }]}>
            <TouchableOpacity onPress={()=>setMode("map")} style={[s.toggleBtn, mode==="map" && s.toggleActive]}>
              <Text style={[s.toggleText, mode==="map" && s.toggleTextActive]}>Map</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>setMode("list")} style={[s.toggleBtn, mode==="list" && s.toggleActive]}>
              <Text style={[s.toggleText, mode==="list" && s.toggleTextActive]}>List</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Floating: Near Me FAB (map only) */}
        {mode == "map" && (
          <View style={s.fabWrap}>
            <TouchableOpacity onPress={recenter} style={s.fab}>
              <FontAwesome5 name="crosshairs" size={18} color={colors.text.inverse} />
            </TouchableOpacity>
          </View>
        )}

        <FilterSheet
          visible={sheetOpen}
          onClose={()=>setSheetOpen(false)}
          initial={filters}
          onApply={onApplyFilter}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:{ flex:1, backgroundColor: colors.surface.subtle },
  root:{ flex:1 },
  floatingTop:{
    position:"absolute", left:0, right:0, top:0,
    paddingTop: 8,
  },
  toggle:{
    alignSelf:"center",
    flexDirection:"row",
    backgroundColor:"#fff",
    borderWidth:1, borderColor: colors.surface.foreground,
    borderRadius:12, overflow:"hidden"
  },
  toggleBtn:{ paddingVertical:8, paddingHorizontal:16 },
  toggleActive:{ backgroundColor: colors.brand.primary },
  toggleText:{ color: colors.text.base, fontWeight:"700" },
  toggleTextActive:{ color: colors.text.inverse },
  fabWrap:{ position:"absolute", right:18, bottom:70 },
  fab:{
    width:53, height:53, borderRadius:30,
    backgroundColor: colors.brand.primary,
    alignItems:"center", justifyContent:"center",
    shadowColor:"#000", shadowOpacity:0.2, shadowRadius:6, elevation:4
  }
});
