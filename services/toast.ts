import Toast from 'react-native-toast-message';

export const ToastService = {
  success: (title: string, message?: string) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },
  error: (title: string, message?: string) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 4000,
    });
  },
  info: (title: string, message?: string) => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },
  // Custom toast for gamification
  achievement: (title: string, xp: number) => {
    Toast.show({
      type: 'success', // Could be custom type 'achievement' if registered
      text1: `Achievement Unlocked: ${title}`,
      text2: `+${xp} XP`,
      position: 'bottom',
      visibilityTime: 4000,
    });
  },
  action: (title: string, message: string, actionLabel: string, onAction: () => void) => {
    Toast.show({
      type: 'action',
      text1: title,
      text2: message,
      position: 'bottom',
      visibilityTime: 5000,
      autoHide: true,
      props: {
        action: {
          label: actionLabel,
          onPress: onAction
        }
      }
    });
  }
};
