import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';

interface XPBadgeProps {
  xp: number;
  style?: ViewStyle;
}

export function XPBadge({ xp, style }: XPBadgeProps) {
  const { colors, typography, spacing, radius } = useTheme();

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: colors.warning, // Gold-ish
        borderRadius: radius.s,
        paddingHorizontal: spacing.s,
        paddingVertical: 2
      },
      style
    ]}>
      <Text style={[typography.caption, { color: '#000', fontWeight: 'bold' }]}>
        {xp} XP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
});
