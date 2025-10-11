// app/_layout.tsx
import { useEffect } from "react";
import { Platform } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/src/providers/AuthProvider";
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";
import { auth } from "@/src/lib/firebase";
import { verifyAndParseToken } from "@/src/lib/crypto";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const router = useRouter();

  // Android: set a default channel (you already had this)
  useEffect(() => {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("maintenance-default", {
        name: "Maintenance Reminders",
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        enableVibrate: true,
        enableLights: true,
        lightColor: "#00A76F",
      }).catch(() => { });
    }
  }, []);

  // ✅ Deep-link handling for ecoloop://item?d=...&s=...
  useEffect(() => {
    const handle = async (url: string | null) => {
      if (!url) return;
      const parsed = await verifyAndParseToken(url);
      if (!parsed) return; // invalid signature or malformed
      // security: only allow if current user matches token owner
      const uid = auth.currentUser?.uid;
      if (!uid || uid !== parsed.ownerUid) {
        // Not the owner; ignore (or show a toast)
        return;
      }
      router.push(`/(app)/(tabs)/lifecycle/item/${parsed.itemId}`);
    };

    // initial cold start
    Linking.getInitialURL().then(handle).catch(() => { });

    // runtime events
    const sub = Linking.addEventListener("url", e => handle(e.url));
    return () => sub.remove();
  }, [router]);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
