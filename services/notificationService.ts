import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
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
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;
        if (!projectId) {
            // If projectId is missing (common in bare workflow or misconfig), try without it
            // or log a warning. For now, we proceed.
             console.log('Project ID not found, attempting default registration');
        }
        
        token = (await Notifications.getExpoPushTokenAsync({
          projectId,
        })).data;
        
        console.log('Push Token:', token);
      } catch (e) {
        console.error('Error getting push token:', e);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  },

  async scheduleDailyReminder() {
    // Check if already scheduled to avoid duplicates
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const hasDaily = scheduled.some(n => n.content.title === "Time to cook!");
    
    if (hasDaily) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to cook! 🍳",
        body: "Discover a new Zimbabwean recipe for dinner tonight.",
        sound: true,
      },
      trigger: {
        hour: 17, // 5 PM
        minute: 0,
        repeats: true,
      },
    });
  },

  async sendLocalNotification(title: string, body: string, data = {}) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Immediate
    });
  }
};
