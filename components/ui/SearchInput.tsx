import React from 'react';
import { ViewStyle } from 'react-native';
import { Input } from './Input';
import { useTheme } from '@/theme/useTheme';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
}

export function SearchInput({ value, onChangeText, placeholder = 'Search...', style }: SearchInputProps) {
  const { radius } = useTheme();
  
  return (
    <Input
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      leftIcon="search-outline"
      containerStyle={style}
      style={{ borderRadius: radius.round }}
    />
  );
}
