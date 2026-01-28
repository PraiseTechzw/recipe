import React, { forwardRef } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export const Input = forwardRef<TextInput, InputProps>(({ 
  label, 
  error, 
  leftIcon, 
  rightIcon, 
  onRightIconPress, 
  containerStyle,
  style,
  ...props 
}, ref) => {
  const { colors, spacing, radius, typography } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
          {label}
        </Text>
      )}
      <View style={[
        styles.inputContainer,
        { 
          backgroundColor: colors.surfaceVariant, 
          borderRadius: radius.m,
          borderColor: error ? colors.error : 'transparent',
          borderWidth: 1,
          paddingHorizontal: spacing.s,
        }
      ]}>
        {leftIcon && (
          <Ionicons name={leftIcon} size={20} color={colors.textSecondary} style={{ marginRight: spacing.s }} />
        )}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textSecondary}
          style={[
            styles.input,
            typography.body,
            { color: colors.text, paddingVertical: spacing.s },
            style
          ]}
          {...props}
        />
        {rightIcon && (
          <Ionicons 
            name={rightIcon} 
            size={20} 
            color={colors.textSecondary} 
            onPress={onRightIconPress}
          />
        )}
      </View>
      {error && (
        <Text style={[typography.caption, { color: colors.error, marginTop: spacing.xs }]}>
          {error}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
  },
});
