import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function SectionHeader({ title, actionLabel, onAction, style }: SectionHeaderProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={[styles.container, { marginBottom: spacing.s }, style]}>
      <Text style={[typography.h3, { color: colors.text }]}>{title}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction}>
          <Text style={[typography.bodySmall, { color: colors.primary }]}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
});
