import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import { GlobalErrorBoundary } from "../components/feedback/GlobalErrorBoundary";
import { LoadingOverlay } from "../components/feedback/LoadingOverlay";
import { OfflineBanner } from "../components/feedback/OfflineBanner";
import { useOfflineStatus } from "../hooks/useOfflineStatus";
import i18n from "../i18n";
import { NotificationService } from "../services/notificationService";
import { SeedService } from "../services/seedService";
import { SyncService } from "../services/syncService";
import { useStore } from "../store/useStore";

import { toastConfig } from "../components/feedback/ToastConfig";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const { isDarkMode, locale, setUserProfile, fetchRecipes, notificationPreferences } = useStore();
  const { isOffline } = useOfflineStatus();

  useEffect(() => {
    // 1. Sync Data
    const initData = async () => {
      try {
        await SeedService.seedInitialData();
        await fetchRecipes();
      } catch (e) {
        console.log("Initialization failed", e);
      }
    };
    initData();

    // 2. Setup Notifications
    const setupNotifications = async () => {
      try {
        const token =
          await NotificationService.registerForPushNotificationsAsync();
        if (token) {
          setUserProfile({ pushToken: token });
        }
      } catch (error) {
        // Notification support can vary between Expo Go and native builds.
        // Keep app startup available if the device cannot schedule reminders.
        console.warn("Notification setup unavailable", error);
      }
    };

    setupNotifications();
  }, [fetchRecipes, setUserProfile]);

  useEffect(() => {
    void NotificationService.scheduleDailyReminder(notificationPreferences.dailyReminder).catch((error) => {
      console.warn("Daily reminder update unavailable", error);
    });
  }, [notificationPreferences.dailyReminder]);

  useEffect(() => {
    if (!isOffline) {
      void SyncService.initializeAppStateSync();
      void SyncService.syncRecipes();
    }
  }, [isOffline]);

  if (locale) {
    i18n.locale = locale;
  }

  return (
    <GlobalErrorBoundary>
      <ThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }}>
          <OfflineBanner isOffline={isOffline} />
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="cooking/[id]"
              options={{ presentation: "fullScreenModal", headerShown: false }}
            />
            <Stack.Screen
              name="shopping-list"
              options={{ presentation: "modal", headerShown: false }}
            />
            <Stack.Screen
              name="onboarding"
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
              name="pantry-check"
              options={{
                presentation: "fullScreenModal",
                headerShown: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen
              name="account-choice"
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
              name="account-access"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(ai-chef)"
              options={{
                presentation: "fullScreenModal",
                headerShown: false,
                gestureEnabled: false,
              }}
            />
          </Stack>
        </View>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <LoadingOverlay />
        <Toast config={toastConfig} />
      </ThemeProvider>
    </GlobalErrorBoundary>
  );
}
