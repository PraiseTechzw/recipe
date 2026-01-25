import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import i18n from '../i18n';
import { NotificationService } from '../services/notificationService';
import { SyncService } from '../services/syncService';
import { useStore } from '../store/useStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { isDarkMode, locale, setUserProfile } = useStore();

  useEffect(() => {
    // 1. Sync Data
    SyncService.syncRecipes().catch(e => console.log('Initial sync failed', e));

    // 2. Setup Notifications
    const setupNotifications = async () => {
        const token = await NotificationService.registerForPushNotificationsAsync();
        if (token) {
            setUserProfile({ pushToken: token });
        }
        await NotificationService.scheduleDailyReminder();
    };
    
    setupNotifications();
  }, []);

  if (locale) {
    i18n.locale = locale;
  }

  return (
    <ThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
      <Stack key={locale}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="cooking/[id]" options={{ presentation: 'fullScreenModal', headerShown: false }} />
        <Stack.Screen name="shopping-list" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="pantry-check" options={{ presentation: 'fullScreenModal', headerShown: false, gestureEnabled: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
