import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry, style }: ErrorStateProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={[styles.container, { padding: spacing.xl }, style]}>
      <Ionicons 
        name="alert-circle-outline" 
        size={48} 
        color={colors.error} 
        style={{ marginBottom: spacing.m }} 
      />
      <Text style={[typography.h3, { color: colors.text, textAlign: 'center', marginBottom: spacing.s }]}>
        {title}
      </Text>
      <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginBottom: spacing.l }]}>
        {message}
      </Text>
      {onRetry && (
        <Button title="Try Again" onPress={onRetry} variant="outline" />
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
