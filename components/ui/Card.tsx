import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme/useTheme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'flat';
}

export function Card({ children, onPress, style, variant = 'elevated' }: CardProps) {
  const { colors, radius, spacing, shadows } = useTheme();

  const getStyle = () => {
    const baseStyle: ViewStyle = {
      backgroundColor: colors.surface,
      borderRadius: radius.l,
      padding: spacing.m,
    };

    if (variant === 'elevated') {
      return { ...baseStyle, ...shadows.small };
    }
    if (variant === 'outlined') {
      return { ...baseStyle, borderWidth: 1, borderColor: colors.border };
    }
    // flat
    return { ...baseStyle, backgroundColor: colors.surfaceVariant };
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={[getStyle(), style]} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[getStyle(), style]}>{children}</View>;
}
