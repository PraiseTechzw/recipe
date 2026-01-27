import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/theme/useTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium', 
  loading = false, 
  disabled = false,
  style,
  textStyle,
  icon
}: ButtonProps) {
  const { colors, spacing, radius, typography } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return colors.surfaceVariant;
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.secondary;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      case 'danger': return colors.error;
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textSecondary;
    switch (variant) {
      case 'primary': return '#FFFFFF';
      case 'secondary': return '#FFFFFF';
      case 'outline': return colors.primary;
      case 'ghost': return colors.text;
      case 'danger': return '#FFFFFF';
      default: return '#FFFFFF';
    }
  };

  const getBorder = () => {
    if (variant === 'outline') return { borderWidth: 1, borderColor: disabled ? colors.border : colors.primary };
    return {};
  };

  const getPadding = () => {
    switch (size) {
      case 'small': return { paddingVertical: spacing.xs, paddingHorizontal: spacing.s };
      case 'large': return { paddingVertical: spacing.m, paddingHorizontal: spacing.l };
      default: return { paddingVertical: spacing.s, paddingHorizontal: spacing.m }; // medium
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { 
          backgroundColor: getBackgroundColor(),
          borderRadius: radius.m,
          opacity: disabled ? 0.6 : 1,
        },
        getPadding(),
        getBorder(),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[
            styles.text, 
            typography.button, 
            { color: getTextColor(), marginLeft: icon ? spacing.s : 0 },
            size === 'small' && { fontSize: 14 },
            textStyle
          ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
