import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Chip({ label, selected = false, onPress, style }: ChipProps) {
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.primaryLight : colors.surfaceVariant,
          borderColor: selected ? colors.primary : colors.border,
          borderRadius: radius.round,
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.m,
        },
        style,
      ]}
    >
      <Text
        style={[
          typography.bodySmall,
          { color: selected ? colors.primary : colors.textSecondary, fontWeight: selected ? '600' : '400' },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});
