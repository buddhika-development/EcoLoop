// src/services/notifications.ts
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform, LogBox } from "react-native";

export const isExpoGo = Constants.appOwnership === "expo";

// Silence the Expo Go push warning in dev (it’s only about push, not local schedule)
LogBox.ignoreLogs([
    "expo-notifications: Android Push notifications (remote notifications) functionality",
]);

// Basic handler so local notifications show banners/alerts
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function ensureNotifPermission(): Promise<boolean> {
    // In Expo Go on Android, requesting permission is fine,
    // but push token registration is disabled (that’s OK for local schedule).
    const { status } = await Notifications.getPermissionsAsync();
    if (status === "granted") return true;
    const { status: asked } = await Notifications.requestPermissionsAsync();
    return asked === "granted";
}

async function ensureAndroidChannel() {
    if (Platform.OS !== "android") return;
    await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.DEFAULT,
    });
}

/** Schedule a local notification at an exact Date (device local time). */
export async function scheduleLocalAt(date: Date, title: string, body: string) {
    // If running in Expo Go on Android, local scheduling often works,
    // but the package logs a scary error about push support.
    // To avoid confusing testers, you can short-circuit here:
    if (isExpoGo && Platform.OS === "android") {
        // Don’t crash: just no-op and tell the caller it’s not scheduled.
        return { id: null as string | null, skipped: true as const };
    }

    await ensureAndroidChannel();

    const trigger: Notifications.DateTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
    };

    const id = await Notifications.scheduleNotificationAsync({
        content: { title, body, sound: "default" },
        trigger,
    });

    return { id, skipped: false as const };
}
