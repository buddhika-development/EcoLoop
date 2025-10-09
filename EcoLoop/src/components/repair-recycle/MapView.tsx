import React, { forwardRef, useImperativeHandle, useRef } from "react";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { View, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { FontAwesome5 } from "@expo/vector-icons";

export type RRMapHandle = {
  recenterTo: (lat:number, lng:number)=>void;
};

type Props = {
  data: any[];
  userLoc?: { lat:number; lng:number } | null;
  onPressMarker: (id:string)=>void;
};

const RRMapView = forwardRef<RRMapHandle, Props>(({ data, userLoc, onPressMarker }, ref) => {
  const mapRef = useRef<MapView>(null);

  useImperativeHandle(ref, () => ({
    recenterTo(lat:number, lng:number) {
      const region: Region = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
      };
      mapRef.current?.animateToRegion(region, 400);
    }
  }), []);

  const initial = {
    latitude: userLoc?.lat ?? 6.9271,
    longitude: userLoc?.lng ?? 79.8612,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  };

  return (
    <View style={s.wrap}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        initialRegion={initial}
      >
        {/* User location (blue dot) */}
        {userLoc && (
          <Marker
            coordinate={{ latitude: userLoc.lat, longitude: userLoc.lng }}
            title="You"
            pinColor="#2b6cb0"
          />
        )}

        {/* Shop markers */}
        {data.map(s => (
          s.location && (
            <Marker
              key={s.id}
              coordinate={{ latitude: s.location.lat, longitude: s.location.lng }}
              onPress={()=>onPressMarker(s.id)}
            >
              <View style={[
                sBadge.pin,
                { backgroundColor: s.type==="recycle" ? colors.brand.accent : colors.brand.primary }
              ]}>
                <FontAwesome5
                  name={s.type==="recycle" ? "recycle" : "wrench"}
                  size={14}
                  color="#fff"
                />
              </View>
            </Marker>
          )
        ))}
      </MapView>
    </View>
  );
});

export default RRMapView;

const s = StyleSheet.create({
  wrap:{ flex:1, borderRadius:0, overflow:"hidden" }
});

const sBadge = StyleSheet.create({
  pin:{
    width:30, height:30, borderRadius:19,
    borderWidth:3, borderColor:"#fff",
    alignItems:"center", justifyContent:"center",
    shadowColor:"#000", shadowOpacity:0.2, shadowRadius:4, elevation:3
  }
});
