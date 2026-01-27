import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';

interface SegmentedControlProps {
  values: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  style?: ViewStyle;
}

export function SegmentedControl({ values, selectedIndex, onChange, style }: SegmentedControlProps) {
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: colors.surfaceVariant, 
        borderRadius: radius.m,
        padding: 2,
      },
      style
    ]}>
      {values.map((value, index) => {
        const isSelected = index === selectedIndex;
        return (
          <TouchableOpacity
            key={value}
            onPress={() => onChange(index)}
            style={[
              styles.segment,
              {
                backgroundColor: isSelected ? colors.surface : 'transparent',
                borderRadius: radius.s,
                shadowOpacity: isSelected ? 0.1 : 0,
                shadowRadius: 2,
                elevation: isSelected ? 1 : 0,
              }
            ]}
          >
            <Text style={[
              typography.bodySmall,
              { color: isSelected ? colors.text : colors.textSecondary, fontWeight: isSelected ? '600' : '400' }
            ]}>
              {value}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 32,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
