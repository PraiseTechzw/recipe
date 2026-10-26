import { Image } from "expo-image";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const mascot = require("../../assets/images/ai-chef-mascot.png");

export function AIMascot({ size = 64, animated = true }: { size?: number; animated?: boolean }) {
  const bob = useSharedValue(0);

  useEffect(() => {
    if (!animated) return;
    bob.value = withRepeat(
      withSequence(
        withTiming(-2, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
  }, [animated, bob]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: animated ? bob.value : 0 }],
  }));

  return (
    <Animated.View
      accessibilityRole="image"
      accessibilityLabel="Zimbabwe Traditional Recipes AI Chef mascot"
      style={[styles.wrap, { width: size, height: size }, floatStyle]}
    >
      <Image source={mascot} style={styles.image} contentFit="contain" transition={150} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  image: { width: "100%", height: "100%" },
});
