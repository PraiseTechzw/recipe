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

import { supabase } from "@/lib/supabase";
import { toastConfig } from "../components/feedback/ToastConfig";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const { isDarkMode, locale, setUserProfile, fetchRecipes } = useStore();
  const { isOffline } = useOfflineStatus();

  useEffect(() => {
    // 1. Sync Data
    const initData = async () => {
      try {
        await SeedService.seedInitialData();
        await fetchRecipes();
        await SyncService.syncRecipes();
      } catch (e) {
        console.log("Initialization failed", e);
      }
    };
    initData();

    // 2. Setup Auth Listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      useStore.getState().setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      useStore.getState().setSession(session);
    });

    // 3. Setup Notifications
    const setupNotifications = async () => {
      const token =
        await NotificationService.registerForPushNotificationsAsync();
      if (token) {
        setUserProfile({ pushToken: token });
      }
      await NotificationService.scheduleDailyReminder();
    };

    setupNotifications();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchRecipes, setUserProfile]);

  if (locale) {
    i18n.locale = locale;
  }

  return (
    <GlobalErrorBoundary>
      <ThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
        <View style={{ flex: 1 }}>
          <OfflineBanner isOffline={isOffline} />
          <Stack key={locale}>
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
              name="auth"
              options={{
                headerShown: false,
                gestureEnabled: false,
              }}
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
        <StatusBar style="auto" />
        <LoadingOverlay />
        <Toast config={toastConfig} />
      </ThemeProvider>
    </GlobalErrorBoundary>
  );
}
