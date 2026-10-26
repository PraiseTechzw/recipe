import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { Observe, ObserveRoot } from "expo-observe";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AppState, View } from "react-native";
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import { GlobalErrorBoundary } from "../components/feedback/GlobalErrorBoundary";
import { PostHogProvider } from "../components/PostHogProvider";
import { LoadingOverlay } from "../components/feedback/LoadingOverlay";
import { OfflineBanner } from "../components/feedback/OfflineBanner";
import { useOfflineStatus } from "../hooks/useOfflineStatus";
import i18n from "../i18n";
import { NotificationService } from "../services/notificationService";
import { SyncService } from "../services/syncService";
import { checkForStoreUpdate } from "../services/storeUpdateService";
import { useStore } from "../store/useStore";

import { toastConfig } from "../components/feedback/ToastConfig";

Observe.configure({
  integrations: {
    "expo-router": {
      filteredParams: [
        "id",
        "email",
        "password",
        "token",
        "access_token",
        "refresh_token",
        "code",
        "prompt",
        "query",
      ],
    },
  },
});

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayout() {
  const { isDarkMode, locale, setUserProfile, fetchRecipes, notificationPreferences } = useStore();
  const { isOffline } = useOfflineStatus();

  useEffect(() => {
    // 1. Sync Data
    const initData = async () => {
      try {
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
    const check = () => void checkForStoreUpdate();
    check();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") check();
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    void NotificationService.scheduleDailyReminder(notificationPreferences.dailyReminder).catch((error) => {
      console.warn("Daily reminder update unavailable", error);
    });
  }, [notificationPreferences.dailyReminder]);

  useEffect(() => {
    void NotificationService.scheduleWeeklyLeaderboardReminder(notificationPreferences.weeklyLeaderboard).catch((error) => {
      console.warn("Weekly reminder update unavailable", error);
    });
  }, [notificationPreferences.weeklyLeaderboard]);

  useEffect(() => {
    if (!isOffline) {
      void SyncService.initializeAppStateSync();
      void SyncService.syncRecipes();
    }
  }, [isOffline]);

  useEffect(() => {
    if (locale) i18n.locale = locale;
  }, [locale]);

  return (
    <GlobalErrorBoundary>
      <ThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
        <PostHogProvider>
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
        </PostHogProvider>
      </ThemeProvider>
    </GlobalErrorBoundary>
  );
}

export default ObserveRoot.wrap(RootLayout);
