import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({ title, description, icon, actionLabel, onAction, style }: EmptyStateProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={[styles.container, { padding: spacing.xl }, style]}>
      {icon && (
        <Ionicons 
          name={icon} 
          size={64} 
          color={colors.textSecondary} 
          style={{ marginBottom: spacing.m, opacity: 0.5 }} 
        />
      )}
      <Text style={[typography.h3, { color: colors.text, textAlign: 'center', marginBottom: spacing.s }]}>
        {title}
      </Text>
      {description && (
        <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.l }]}>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="primary" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});
