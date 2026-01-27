import { useTheme } from "@/theme/useTheme";
import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius,
  style,
}: SkeletonProps) {
  const { colors, radius } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: borderRadius || radius.s,
          backgroundColor: colors.surfaceVariant,
          opacity: opacity as any,
        },
        style,
      ]}
    />
  );
}
