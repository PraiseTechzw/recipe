import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useStore } from "../store/useStore";
import Logo from "../components/Logo";

export default function AnimatedSplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hasOnboarded } = useStore();

  // Animation values
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [scaleAnim] = useState(() => new Animated.Value(0.8));

  useEffect(() => {
    // Start Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigation Logic after delay
    const timer = setTimeout(() => {
      // If not onboarded, go to Onboarding Flow
      // If onboarded, go to Tabs
      if (!hasOnboarded) {
        router.replace("/onboarding");
      } else {
        router.replace("/(tabs)");
      }
    }, 2500); // 2.5s splash duration

    return () => clearTimeout(timer);
  }, [fadeAnim, hasOnboarded, router, scaleAnim]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Logo size="large" color="#203A2E" mutedColor="#68766B" />
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5EBD8",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
});
