import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';

interface LevelPillProps {
  level: number;
  style?: ViewStyle;
}

export function LevelPill({ level, style }: LevelPillProps) {
  const { colors, typography, spacing, radius } = useTheme();

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: colors.secondary, 
        borderRadius: radius.round,
        paddingHorizontal: spacing.s,
        paddingVertical: 2
      },
      style
    ]}>
      <Text style={[typography.caption, { color: '#FFF', fontWeight: 'bold' }]}>
        Lvl {level}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
});
