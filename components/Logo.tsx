import { Image, StyleSheet, Text, View } from "react-native";

type LogoSize = "small" | "medium" | "large";

const SIZE: Record<LogoSize, { mark: number; title: number; subtitle: number }> = {
  small: { mark: 32, title: 11, subtitle: 5.5 },
  medium: { mark: 44, title: 16, subtitle: 7.5 },
  large: { mark: 112, title: 30, subtitle: 11 },
};

export default function Logo({
  size = "medium",
  color = "#203A2E",
  mutedColor = "#68766B",
}: {
  size?: LogoSize;
  color?: string;
  mutedColor?: string;
}) {
  const dimensions = SIZE[size];

  return (
    <View style={styles.container} accessibilityRole="image" accessibilityLabel="Zimbabwe Traditional Recipes">
      <Image
        source={require("../assets/images/brand-mark.png")}
        style={{ width: dimensions.mark, height: dimensions.mark }}
        resizeMode="contain"
      />
      <View style={styles.wordmark}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[styles.title, { color, fontSize: dimensions.title }]}
        >
          ZIMBABWE
        </Text>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[styles.subtitle, { color: mutedColor, fontSize: dimensions.subtitle }]}
        >
          TRADITIONAL RECIPES
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  wordmark: {
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontWeight: "900",
    letterSpacing: 0.45,
  },
  subtitle: {
    fontWeight: "800",
    letterSpacing: 1.05,
  },
});
