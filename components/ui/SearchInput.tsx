import { useTheme } from "@/theme/useTheme";
import React, { forwardRef } from "react";
import { TextInput, ViewStyle } from "react-native";
import { Input } from "./Input";

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  style?: ViewStyle;
  autoFocus?: boolean;
}

export const SearchInput = forwardRef<TextInput, SearchInputProps>(
  (
    {
      value,
      onChangeText,
      onClear,
      placeholder = "Search...",
      style,
      autoFocus,
    },
    ref,
  ) => {
    const { radius } = useTheme();

    return (
      <Input
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        leftIcon="search-outline"
        rightIcon={value.length > 0 && onClear ? "close-circle" : undefined}
        onRightIconPress={onClear}
        containerStyle={style}
        style={{ borderRadius: radius.round }}
        autoFocus={autoFocus}
      />
    );
  },
);
