import { useColorScheme } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from './tokens';
import { useStore } from '../store/useStore';

export function useTheme() {
  const colorScheme = useColorScheme();
  const storeIsDarkMode = useStore((state) => state.isDarkMode);
  
  // Prioritize store setting if it's explicitly managed, 
  // but arguably we should respect the user's choice. 
  // Since Profile has a toggle that sets storeIsDarkMode, we use that.
  const isDark = storeIsDarkMode;
  
  const colors = isDark ? COLORS.dark : COLORS.light;

  return {
    colors,
    spacing: SPACING,
    radius: RADIUS,
    typography: TYPOGRAPHY,
    shadows: SHADOWS,
    isDark,
  };
}
