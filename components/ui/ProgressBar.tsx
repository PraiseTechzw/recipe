import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  trackColor?: string;
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({ progress, color, trackColor, height = 8, style }: ProgressBarProps) {
  const { colors, radius } = useTheme();

  return (
    <View style={[
      styles.track, 
      { 
        height, 
        backgroundColor: trackColor || colors.surfaceVariant, 
        borderRadius: radius.round 
      }, 
      style
    ]}>
      <View style={[
        styles.fill, 
        { 
          width: `${Math.min(Math.max(progress, 0), 1) * 100}%`, 
          backgroundColor: color || colors.primary, 
          borderRadius: radius.round 
        } 
      ]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
