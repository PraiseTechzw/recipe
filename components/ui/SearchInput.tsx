import { useTheme } from "@/theme/useTheme";
import React from "react";
import { ViewStyle } from "react-native";
import { Input } from "./Input";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  style?: ViewStyle;
}

export function SearchInput({
  value,
  onChangeText,
  onClear,
  placeholder = "Search...",
  style,
}: SearchInputProps) {
  const { radius } = useTheme();

  return (
    <Input
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      leftIcon="search-outline"
      rightIcon={value.length > 0 && onClear ? "close-circle" : undefined}
      onRightIconPress={onClear}
      containerStyle={style}
      style={{ borderRadius: radius.round }}
    />
  );
}
