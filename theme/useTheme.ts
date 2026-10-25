import { useStore } from '../store/useStore';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from './tokens';

export function useTheme() {
  const isDark = useStore((state) => state.isDarkMode);
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
