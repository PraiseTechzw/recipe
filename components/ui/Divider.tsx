import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';

interface DividerProps {
  style?: ViewStyle;
}

export function Divider({ style }: DividerProps) {
  const { colors } = useTheme();
  return <View style={[{ height: 1, backgroundColor: colors.border, width: '100%' }, style]} />;
}
