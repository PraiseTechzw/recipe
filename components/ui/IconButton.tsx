import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';

interface IconButtonProps {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'surface';
  style?: ViewStyle;
}

export function IconButton({ 
  name, 
  onPress, 
  size = 24, 
  color, 
  variant = 'ghost',
  style 
}: IconButtonProps) {
  const { colors, spacing, radius } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.secondary;
      case 'surface': return colors.surface;
      default: return 'transparent';
    }
  };

  const getIconColor = () => {
    if (color) return color;
    switch (variant) {
      case 'primary': return '#FFFFFF';
      case 'secondary': return '#FFFFFF';
      case 'surface': return colors.text;
      default: return colors.text;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          padding: spacing.s,
          borderRadius: radius.round,
          backgroundColor: getBackgroundColor(),
          alignItems: 'center',
          justifyContent: 'center',
        },
        style
      ]}
    >
      <Ionicons name={name} size={size} color={getIconColor()} />
    </TouchableOpacity>
  );
}
