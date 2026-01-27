import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const HapticService = {
  selection: () => {
    if (!isWeb) Haptics.selectionAsync();
  },
  light: () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
  medium: () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
  heavy: () => {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },
  success: () => {
    if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
  error: () => {
    if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
  warning: () => {
    if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },
};
