// app/(app)/repair-recycle/shop/[id].tsx
import { useEffect, useMemo, useState , useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking,
  Modal, TextInput, Alert, KeyboardAvoidingView, Platform, Image
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { MaterialIcons, FontAwesome, FontAwesome5 } from "@expo/vector-icons";

import { colors } from "@/src/theme/colors";
import { useShop } from "@/src/features/repair-recycle/hooks";
import { dayLabel, formatIntervals, isOpenNow as isOpenNowFn, nextChange } from "@/src/features/repair-recycle/utils/hours";
import { getCategoryMeta } from "@/src/features/repair-recycle/categories";
import {
  createReviewAndUpdateShopRating,
  listRecentReviews,
  deleteReviewAndUpdateShopRating,
  type Review,
} from "@/src/features/repair-recycle/reviews";
import {
  saveShop,
  unsaveShop,
  isShopSaved,
} from "@/src/features/repair-recycle/saved";
import { auth } from "@/src/lib/firebase";

export default function ShopDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { shop, loading, error, refresh } = useShop(id);

  const [expanded, setExpanded] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [revOpen, setRevOpen] = useState(false);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");

  const [saved, setSaved] = useState(false);

  // Load reviews
  useEffect(() => {
    if (!id) return;
    (async () => {
      const list = await listRecentReviews(id, 15);
      setReviews(list);
    })();
  }, [id]);

  // Check saved state whenever id or user changes
  useEffect(() => {
    (async () => {
      if (!id) return;
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setSaved(false);
        return;
      }
      try {
        const ok = await isShopSaved(uid, id);
        setSaved(ok);
      } catch {
        setSaved(false);
      }
    })();
  }, [id, auth.currentUser?.uid]);

  // "My review first" ordering
  const sortedReviews = useMemo(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return reviews;
    const mine: Review[] = [];
    const others: Review[] = [];
    for (const r of reviews) (r.userId === uid ? mine : others).push(r);
    return [...mine, ...others];
  }, [reviews]);

  const openNow = useMemo(() => (shop ? isOpenNowFn(shop.hours as any) : false), [shop]);
  const changeHint = useMemo(() => (shop ? nextChange(shop.hours as any) : null), [shop]);
  const typeColor = shop?.type === "recycle" ? colors.brand.accent : colors.brand.primary;

  const onCall = () => {
    const tel = shop?.contact?.phone;
    if (!tel) return;
    Linking.openURL(`tel:${tel}`);
  };
  const onWhatsApp = () => {
    const tel = shop?.contact?.phone;
    if (!tel) return;
    const p = tel.replace(/[^\d]/g, "");
    Linking.openURL(`https://wa.me/${p}`);
  };
  const onDirections = () => {
    const loc = shop?.location;
    if (!loc) return;
    const q = encodeURIComponent(`${loc.lat},${loc.lng} (${shop?.name})`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`);
  };

  const onToggleSave = useCallback(async () => {
    if (!id) return;
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to save shops.");
      return;
    }
    try {
      if (saved) {
        await unsaveShop(user.uid, id);
        setSaved(false);
      } else {
        await saveShop(user.uid, id);
        setSaved(true);
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Could not update saved state.");
    }
  }, [id, saved]);

  const submitReview = async () => {
    if (!id) return;
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Sign in required", "Please sign in to leave a review.");
        return;
      }

      // Build payload WITHOUT undefined fields (comment is optional)
      const payload: any = {
        userId: user.uid,
        displayName: user.displayName ?? undefined,
        photoURL: user.photoURL ?? undefined,      // store avatar if available
        stars,
      };
      if (comment.trim().length > 0) payload.comment = comment.trim();

      await createReviewAndUpdateShopRating(id, payload);

      setRevOpen(false);
      setComment("");
      setStars(5);

      const list = await listRecentReviews(id, 15);
      setReviews(list);

      Alert.alert("Thanks!", "Your review was submitted.");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to submit review");
    }
  };

  const onDeleteReview = async (reviewId: string) => {
    if (!id) return;
    Alert.alert("Delete review?", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteReviewAndUpdateShopRating(id, reviewId);
            const list = await listRecentReviews(id, 15);
            setReviews(list);
            Alert.alert("Deleted", "Your review was removed.");
          } catch (e: any) {
            Alert.alert("Error", e?.message || "Failed to delete review");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: colors.surface.subtle }]}>
        <Text style={{ color: colors.text.hint }}>Loading…</Text>
      </View>
    );
  }
  if (error || !shop) {
    return (
      <View style={[s.center, { backgroundColor: colors.surface.subtle, padding: 16 }]}>
        <Text style={{ color: colors.text.base, fontWeight: "700", marginBottom: 8 }}>
          Couldn’t load shop
        </Text>
        <TouchableOpacity style={s.btnPrimary} onPress={refresh}>
          <Text style={s.btnPrimaryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface.subtle }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 28 }}>
        {/* Top bar — back + (logo + name) + save */}
        <View style={s.topRow}>
          <TouchableOpacity onPress={() => router.back()} style={s.iconBtn}>
            <MaterialIcons name="arrow-back" size={20} color={colors.text.base} />
          </TouchableOpacity>

          <View style={s.topTitleWrap}>
            <View style={s.logoCircleSm}>
              <FontAwesome5 name={shop.type === "recycle" ? "recycle" : "wrench"} size={16} color="#fff" />
            </View>
            <Text style={s.topTitle} numberOfLines={1}>{shop.name}</Text>
          </View>

          <TouchableOpacity style={s.iconBtn} onPress={onToggleSave}>
            <MaterialIcons
              name={saved ? "bookmark" : "bookmark-border"}
              size={20}
              color={colors.text.base}
            />
          </TouchableOpacity>
        </View>

        {/* Card: Status + Rating */}
        <View style={s.card}>
          <View style={s.rowBetween}>
            {/* ⬇️ replaced black text star with a gold FontAwesome star */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 }}>
              <FontAwesome name="star" size={18} color="#fbbf24" />
              <Text style={s.big}>{(shop.rating?.avg ?? 0).toFixed(1)}</Text>
              <Text style={s.muted}>({shop.rating?.count ?? 0})</Text>
            </View>
            {openNow ? (
              <Text style={[s.badge, { backgroundColor: "#e9f9ef", color: colors.brand.accent }]}>
                OPEN{changeHint?.kind === "until" ? ` • until ${changeHint.time}` : ""}
              </Text>
            ) : (
              <Text style={[s.badge, { backgroundColor: "#fff3e8", color: "#c26c1c" }]}>
                CLOSED{changeHint?.kind === "opens" ? ` • opens ${changeHint.time}` : ""}
              </Text>
            )}
          </View>
        </View>

        {/* Card: Quick actions */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Quick Actions</Text>
          <View style={s.actions}>
            <ActionBtn label="Call" icon="phone" onPress={onCall} />
            <ActionBtn label="Directions" icon="directions" onPress={onDirections} />
            <ActionBtn label="WhatsApp" icon="whatsapp" onPress={onWhatsApp} />
          </View>
        </View>

        {/* Card: Services */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Services</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
            <Chip text={shop.type === "recycle" ? "Recycle" : "Repair"} color={typeColor} />
            {(shop.categories || []).map((raw) => {
              const meta = getCategoryMeta("repair", raw) || getCategoryMeta("recycle", raw);
              if (!meta) {
                return (
                  <View key={raw} style={s.catPill}>
                    <FontAwesome5 name="tag" size={14} color={colors.text.hint} />
                    <Text style={{ color: colors.text.base }}>{raw}</Text>
                  </View>
                );
              }
              const { Icon, iconName, color } = meta;
              return (
                <View key={meta.key} style={s.catPill}>
                  {/* @ts-ignore */}
                  <Icon name={iconName} size={14} color={color} />
                  <Text style={{ color: colors.text.base }}>{meta.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Card: Location */}
        {(shop.address || shop.location) && (
          <View style={s.card}>
            <Text style={s.sectionTitle}>Location</Text>
            {shop.address ? (
              <Text style={{ color: colors.text.base, marginBottom: 8 }}>{shop.address}</Text>
            ) : null}

            {shop.location ? (
              <View style={s.mapWrap}>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  style={{ flex: 1 }}
                  initialRegion={{
                    latitude: shop.location.lat,
                    longitude: shop.location.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  onPress={onDirections}
                >
                  <Marker
                    coordinate={{ latitude: shop.location.lat, longitude: shop.location.lng }}
                    title={shop.name}
                  />
                </MapView>
              </View>
            ) : null}

            <View style={{ marginTop: 10, flexDirection: "row", gap: 10 }}>
              <TouchableOpacity style={s.btnOutline} onPress={onDirections}>
                <Text style={s.btnOutlineText}>Open in Maps</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Card: Opening hours */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Opening Hours</Text>
          <TodayHours hours={shop.hours} />
          <TouchableOpacity onPress={() => setExpanded(!expanded)} style={{ marginTop: 8 }}>
            <Text style={{ color: colors.brand.primary, fontWeight: "700" }}>
              {expanded ? "Hide week schedule" : "Show week schedule"}
            </Text>
          </TouchableOpacity>
          {expanded && <WeekHours hours={shop.hours} />}
        </View>

        {/* Card: Reviews (my review first) */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Reviews</Text>

          {/* ⬇️ replaced black text star line with gold icon next to average */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
            <FontAwesome name="star" size={18} color="#fbbf24" />
            <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text.base }}>
              {(shop.rating?.avg ?? 0).toFixed(1)}
            </Text>
            <Text style={s.muted}>({shop.rating?.count ?? 0})</Text>
          </View>

          <View style={{ marginTop: 10, gap: 10 }}>
            {sortedReviews.length === 0 ? (
              <Text style={s.muted}>No reviews yet.</Text>
            ) : (
              sortedReviews.map((r) => {
                const isMine = auth.currentUser?.uid && r.userId === auth.currentUser.uid;
                return (
                  <View key={r.id} style={s.reviewCard}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Avatar uri={(r as any).photoURL} name={r.displayName || "User"} />
                        <Text style={{ fontWeight: "700", color: colors.text.base }}>
                          {r.displayName || "User"}
                        </Text>
                      </View>
                      {isMine && (
                        <TouchableOpacity onPress={() => onDeleteReview(r.id)} style={{ padding: 6 }}>
                          <MaterialIcons name="delete-outline" size={18} color={colors.text.hint} />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* ⬇️ star row for each review (gold filled up to r.stars) */}
                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                      {[1,2,3,4,5].map((n) => (
                        <FontAwesome
                          key={n}
                          name="star"
                          size={14}
                          color={n <= r.stars ? "#fbbf24" : "#E5E7EB"}
                          style={{ marginRight: 2 }}
                        />
                      ))}
                    </View>

                    {!!r.comment && (
                      <Text style={{ color: colors.text.base, marginTop: 6 }}>{r.comment}</Text>
                    )}
                  </View>
                );
              })
            )}
          </View>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <TouchableOpacity style={s.btnPrimary} onPress={() => setRevOpen(true)}>
              <Text style={s.btnPrimaryText}>Leave a review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Leave a review — centered popup with keyboard avoiding + sticky submit */}
      <Modal
        visible={revOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRevOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={s.modalOverlayCenter}
        >
          <View style={s.popupCard}>
            {/* Header: only one back button */}
            <View style={s.popupHeader}>
              <TouchableOpacity onPress={() => setRevOpen(false)} style={{ padding: 4 }}>
                <MaterialIcons name="chevron-left" size={26} color={colors.text.base} />
              </TouchableOpacity>
              <Text style={s.popupTitle}>Leave a review</Text>
              {/* spacer to balance */}
              <View style={{ width: 26 }} />
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 90 }}>
              {/* Stars */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Text style={{ color: colors.text.base, fontWeight: "700" }}>Rating</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {[1,2,3,4,5].map((n) => (
                    <TouchableOpacity key={n} onPress={() => setStars(n)}>
                      <FontAwesome
                        name="star"
                        size={24}
                        color={n <= stars ? "#f59e0b" : "#E5E7EB"} // filled stars
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Comment (optional) */}
              <View style={{ marginTop: 14 }}>
                <Text style={{ color: colors.text.base, fontWeight: "700", marginBottom: 6 }}>
                  Comment (optional)
                </Text>
                <TextInput
                  placeholder="Share your experience…"
                  placeholderTextColor={colors.text.hint}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  style={s.input}
                />
              </View>
            </ScrollView>

            {/* Sticky submit bar */}
            <View style={s.popupFooter}>
              <TouchableOpacity
                style={[s.btnPrimary, { opacity: stars ? 1 : 0.6 }]}
                disabled={!stars}
                onPress={submitReview}
              >
                <Text style={s.btnPrimaryText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

/* ---------- small components ---------- */

function Avatar({ uri, name }: { uri?: string; name: string }) {
  if (uri) {
    return <Image source={{ uri }} style={s.avatar} />;
  }
  const initial = name?.trim()?.[0]?.toUpperCase() || "U";
  return (
    <View style={s.avatarFallback}>
      <Text style={{ color: "#fff", fontWeight: "800" }}>{initial}</Text>
    </View>
  );
}

function ActionBtn({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: "phone" | "directions" | "whatsapp";
  onPress: () => void;
}) {
  const IconSet = icon === "whatsapp" ? FontAwesome : MaterialIcons;
  const iconName =
    icon === "whatsapp"
      ? "whatsapp"
      : (icon as React.ComponentProps<typeof MaterialIcons>["name"]);

  return (
    <TouchableOpacity onPress={onPress} style={s.actionBtn}>
      <IconSet name={iconName as any} size={18} color={colors.brand.primary} />
      <Text style={{ color: colors.text.base, fontWeight: "700" }}>{label}</Text>
    </TouchableOpacity>
  );
}

function Chip({ text, color }: { text: string; color: string }) {
  return (
    <View style={[s.badgePill, { borderColor: color, backgroundColor: color + "14" }]}>
      <Text style={{ color }}>{text}</Text>
    </View>
  );
}

function TodayHours({ hours }: { hours: any }) {
  const open = isOpenNowFn(hours);
  const hint = nextChange(hours);
  const now = new Date();
  const key = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][now.getDay()] as keyof typeof hours;
  const list = (hours?.[key] || []) as Array<{ open: string; close: string }>;
  return (
    <View style={{ marginTop: 6 }}>
      <Text style={{ color: colors.text.base }}>
        <Text style={{ fontWeight: "800" }}>Today • </Text>
        {list.length ? formatIntervals(list) : "Closed"}
        {hint ? (open ? ` (until ${hint.time})` : ` (opens ${hint.time})`) : ""}
      </Text>
    </View>
  );
}

function WeekHours({ hours }: { hours: any }) {
  const order = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
  const todayIdx = new Date().getDay();
  const todayKey = (["sun", "mon", "tue", "wed", "thu", "fri", "sat"][todayIdx]) as (typeof order)[number];
  return (
    <View style={s.weekBox}>
      {order.map((k, i) => (
        <View
          key={k}
          style={[
            s.rowBetween,
            {
              paddingHorizontal: 12,
              paddingVertical: 10,
              backgroundColor: k === todayKey ? "#f6f3ff" : "#fff",
              borderTopWidth: i === 0 ? 0 : 1,
              borderColor: colors.surface.foreground,
            },
          ]}
        >
          <Text style={{ color: colors.text.base, fontWeight: "700", width: 60 }}>
            {dayLabel(k as any)}
          </Text>
          <Text style={{ color: colors.text.base, flex: 1 }}>
            {formatIntervals((hours?.[k] || []) as any)}
          </Text>
        </View>
      ))}
    </View>
  );
}

/* ---------- styles ---------- */
const s = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  topTitleWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, minWidth: 0 },
  logoCircleSm: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.brand.primary, alignItems: "center", justifyContent: "center" },
  topTitle: { color: colors.text.base, fontSize: 16, fontWeight: "800", flexShrink: 1 },
  iconBtn: {
    height: 40, width: 40, borderRadius: 12, backgroundColor: "#fff",
    borderWidth: 1, borderColor: colors.surface.foreground, alignItems: "center", justifyContent: "center",
  },

  card: { backgroundColor: colors.surface.base, borderWidth: 1, borderColor: colors.surface.foreground, borderRadius: 12, padding: 12 },
  mapWrap: { height: 160, borderRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: colors.surface.foreground, marginTop: 6 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  name: { fontSize: 18, fontWeight: "800", color: colors.text.base },
  big: { fontSize: 20, fontWeight: "800", color: colors.text.base },
  muted: { color: colors.text.hint },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: colors.text.base },

  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, overflow: "hidden", fontWeight: "800" },
  badgePill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, backgroundColor: "#fff" },
  catPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999,
    backgroundColor: colors.surface.subtle, borderWidth: 1, borderColor: colors.surface.foreground,
  },

  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
  actionBtn: {
    flex: 1, height: 44, borderRadius: 12, backgroundColor: "#fff",
    borderWidth: 1, borderColor: colors.surface.foreground, alignItems: "center",
    justifyContent: "center", flexDirection: "row", gap: 8,
  },

  reviewCard: { backgroundColor: "#fff", borderWidth: 1, borderColor: colors.surface.foreground, borderRadius: 12, padding: 12 },
  btnPrimary: { flex: 1, backgroundColor: colors.brand.primary, padding: 12, borderRadius: 12, alignItems: "center" },
  btnPrimaryText: { color: colors.text.inverse, fontWeight: "800" },
  btnOutline: { flex: 1, alignItems: "center", justifyContent: "center", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.brand.primary, backgroundColor: "#fff" },
  btnOutlineText: { color: colors.brand.primary, fontWeight: "800" },

  // avatar
  avatar: { width: 28, height: 28, borderRadius: 14 },
  avatarFallback: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.brand.primary, alignItems: "center", justifyContent: "center" },

  // centered popup
  modalOverlayCenter: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center", padding: 16 },
  popupCard: {
    width: "92%", maxHeight: "88%", backgroundColor: "#fff", borderRadius: 16,
    borderWidth: 1, borderColor: colors.surface.foreground, overflow: "hidden",
  },
  popupHeader: {
    height: 56, paddingHorizontal: 10,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderBottomWidth: 1, borderColor: colors.surface.foreground,
  },
  popupTitle: { fontSize: 16, fontWeight: "800", color: colors.text.base },

  input: {
    minHeight: 100, borderRadius: 12, borderWidth: 1, borderColor: colors.surface.foreground,
    padding: 12, textAlignVertical: "top", backgroundColor: "#fff", color: colors.text.base,
  },
  popupFooter: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    padding: 12, backgroundColor: "#fff", borderTopWidth: 1, borderColor: colors.surface.foreground,
  },

  // week schedule box
  weekBox: { marginTop: 8, borderWidth: 1, borderColor: colors.surface.foreground, borderRadius: 12 },
});
