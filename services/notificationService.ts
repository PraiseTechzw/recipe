import { isRunningInExpoGo } from 'expo';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { getAllScheduledNotificationsAsync } from 'expo-notifications/build/getAllScheduledNotificationsAsync';
import { getExpoPushTokenAsync } from 'expo-notifications/build/getExpoPushTokenAsync';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { Platform } from 'react-native';

// Import the specific modules used here. The package barrel also loads the
// topic subscription native module, which is not included in Expo Go.
setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  async registerForPushNotificationsAsync() {
    // Expo Go does not include native remote push support. Local notifications
    // remain available there.
    if (isRunningInExpoGo()) return undefined;

    if (Platform.OS === 'android') {
      await setNotificationChannelAsync('default', {
        name: 'default',
        importance: 5,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (!Device.isDevice) {
      console.log('Must use a physical device for push notifications');
      return undefined;
    }

    const { status: existingStatus } = await getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission was not granted');
      return undefined;
    }

    try {
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
      if (!projectId) {
        console.warn('Expo project ID is missing; unable to register a push token');
        return undefined;
      }

      const token = (await getExpoPushTokenAsync({ projectId })).data;
      console.log('Push Token:', token);
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return undefined;
    }
  },

  async scheduleDailyReminder() {
    if (Platform.OS === 'android') {
      await setNotificationChannelAsync('default', {
        name: 'default',
        importance: 5,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const scheduled = await getAllScheduledNotificationsAsync();
    const hasDaily = scheduled.some((notification) => notification.content.title === 'Time to cook! 🍳');
    if (hasDaily) return;

    const trigger: any = Platform.OS === 'android'
      ? { type: 'daily', hour: 17, minute: 0, channelId: 'default' }
      : { type: 'calendar', hour: 17, minute: 0, repeats: true };

    await scheduleNotificationAsync({
      content: {
        title: 'Time to cook! 🍳',
        body: 'Discover a new Zimbabwean recipe for dinner tonight.',
        sound: true,
      },
      trigger,
    });
  },

  async sendLocalNotification(title: string, body: string, data = {}) {
    await scheduleNotificationAsync({
      content: { title, body, data, sound: true },
      trigger: null,
    });
  },
};
