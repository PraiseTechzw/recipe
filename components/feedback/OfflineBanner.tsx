import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface OfflineBannerProps {
  isOffline: boolean;
  style?: ViewStyle;
}

export function OfflineBanner({ isOffline, style }: OfflineBannerProps) {
  const { colors, typography, spacing } = useTheme();

  if (!isOffline) return null;

  return (
    <View style={[
      styles.container, 
      { backgroundColor: colors.warning, padding: spacing.s },
      style
    ]}>
      <Ionicons name="cloud-offline-outline" size={20} color="#000" style={{ marginRight: spacing.s }} />
      <Text style={[typography.bodySmall, { color: '#000', fontWeight: '600' }]}>
        You are offline. Changes will sync when online.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
