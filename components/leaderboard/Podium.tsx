import { COUNTRIES } from "@/constants/countries";
import { LeaderboardEntry } from "@/store/useStore";
import { useTheme } from "@/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";

interface PodiumProps {
  topThree: LeaderboardEntry[];
  mode: "weekly" | "allTime";
  style?: ViewStyle;
}

export function Podium({ topThree, mode, style }: PodiumProps) {
  const { colors, typography } = useTheme();

  // Enhanced animations
  const glowOpacity1 = useSharedValue(0.8);
  const glowOpacity2 = useSharedValue(0.6);
  const glowOpacity3 = useSharedValue(0.5);
  const trophyTranslateY = useSharedValue(0);
  const trophyRotate = useSharedValue(0);
  const crownScale = useSharedValue(1);

  React.useEffect(() => {
    // 1st Place: Intense pulse with slight scale
    glowOpacity1.value = withRepeat(
      withTiming(1, { duration: 1200 }),
      -1,
      true,
    );

    // Trophy Float with rotation
    trophyTranslateY.value = withRepeat(
      withTiming(-10, { duration: 2000 }),
      -1,
      true,
    );

    trophyRotate.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1000 }),
        withTiming(5, { duration: 1000 }),
      ),
      -1,
      true,
    );

    // Crown pulse
    crownScale.value = withRepeat(
      withSpring(1.15, { damping: 2, stiffness: 100 }),
      -1,
      true,
    );

    // 2nd Place: Smooth pulse
    setTimeout(() => {
      glowOpacity2.value = withRepeat(
        withTiming(0.85, { duration: 1800 }),
        -1,
        true,
      );
    }, 300);

    // 3rd Place: Gentle pulse
    setTimeout(() => {
      glowOpacity3.value = withRepeat(
        withTiming(0.75, { duration: 2200 }),
        -1,
        true,
      );
    }, 600);
  }, []);

  const animatedGlowStyle1 = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity1.value,
  }));
  const animatedGlowStyle2 = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity2.value,
  }));
  const animatedGlowStyle3 = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity3.value,
  }));
  const animatedTrophyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: trophyTranslateY.value },
      { rotate: `${trophyRotate.value}deg` },
    ],
  }));
  const animatedCrownStyle = useAnimatedStyle(() => ({
    transform: [{ scale: crownScale.value }],
  }));

  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  const renderPodiumStep = (
    entry: LeaderboardEntry | undefined,
    rank: number,
  ) => {
    if (!entry) return <View style={styles.emptyStep} />;

    const isFirst = rank === 1;
    const isSecond = rank === 2;
    const isThird = rank === 3;

    // Enhanced dimensions
    const avatarSize = isFirst ? 85 : isSecond ? 68 : 60;
    const pedestalHeight = isFirst ? 160 : isSecond ? 125 : 100;

    // Premium color palette
    const colors = {
      gold: {
        primary: "#FFD700",
        secondary: "#FFA500",
        accent: "#FFED4E",
        gradient: ["#FFD700", "#FFA500", "#FF8C00"],
        shadow: "#FFD700",
      },
      silver: {
        primary: "#E8E8E8",
        secondary: "#B8B8B8",
        accent: "#F5F5F5",
        gradient: ["#E8E8E8", "#C0C0C0", "#A8A8A8"],
        shadow: "#C0C0C0",
      },
      bronze: {
        primary: "#E5A157",
        secondary: "#CD7F32",
        accent: "#F4C430",
        gradient: ["#E5A157", "#CD7F32", "#A0522D"],
        shadow: "#CD7F32",
      },
    };

    let colorScheme = colors.bronze;
    if (isFirst) colorScheme = colors.gold;
    else if (isSecond) colorScheme = colors.silver;

    const score = (mode === "weekly" ? entry.weekly_xp : entry.total_xp) || 0;
    const glowStyle = isFirst
      ? animatedGlowStyle1
      : isSecond
        ? animatedGlowStyle2
        : animatedGlowStyle3;

    const avatarSource = React.useMemo(() => {
      const seedOrUrl = entry.chefs?.avatar_seed || entry.chef_id;
      if (
        seedOrUrl.startsWith("http") ||
        seedOrUrl.startsWith("file://") ||
        seedOrUrl.startsWith("data:")
      ) {
        return { uri: seedOrUrl };
      }
      return {
        uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${seedOrUrl}`,
      };
    }, [entry.chefs?.avatar_seed, entry.chef_id]);

    const countryFlag = COUNTRIES.find(
      (c) => c.name === entry.chefs?.country,
    )?.flag;

    return (
      <Animated.View
        entering={FadeInDown.delay(rank * 150)
          .springify()
          .damping(12)
          .stiffness(100)}
        style={[
          styles.stepContainer,
          { zIndex: isFirst ? 10 : isSecond ? 5 : 1 },
        ]}
      >
        {/* Floating Elements Container */}
        <View style={{ alignItems: "center", marginBottom: -30, zIndex: 3 }}>
          {/* Crown for 1st place */}
          {isFirst && (
            <Animated.View
              entering={ZoomIn.delay(500).springify()}
              style={styles.crownContainer}
            >
              <Animated.View style={animatedCrownStyle}>
                <Ionicons name="diamond" size={24} color={colorScheme.accent} />
              </Animated.View>
            </Animated.View>
          )}

          {/* Trophy Icon */}
          {isFirst && (
            <Animated.View
              entering={ZoomIn.delay(400).springify()}
              style={styles.trophyContainer}
            >
              <Animated.View style={animatedTrophyStyle}>
                <View
                  style={{
                    backgroundColor: "rgba(255, 215, 0, 0.1)",
                    borderRadius: 50,
                    padding: 12,
                  }}
                >
                  <Ionicons
                    name="trophy"
                    size={42}
                    color={colorScheme.primary}
                    style={{
                      shadowColor: colorScheme.shadow,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 1,
                      shadowRadius: 20,
                      elevation: 15,
                    }}
                  />
                </View>
              </Animated.View>
            </Animated.View>
          )}

          {/* Rank Badge */}
          {!isFirst && (
            <Animated.View
              entering={ZoomIn.delay(300).springify()}
              style={[
                styles.rankBadge,
                {
                  backgroundColor: colorScheme.primary,
                  borderColor: colorScheme.accent,
                },
              ]}
            >
              <Text style={[styles.rankBadgeText, { color: "#000" }]}>
                {rank}
              </Text>
            </Animated.View>
          )}

          {/* Avatar with enhanced styling */}
          <Animated.View
            style={[
              styles.avatarContainer,
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize / 2,
                borderWidth: isFirst ? 4 : 3,
                borderColor: colorScheme.accent,
                backgroundColor: "#1a1a1a",
                shadowColor: colorScheme.shadow,
                shadowOffset: { width: 0, height: isFirst ? 8 : 4 },
                shadowRadius: isFirst ? 25 : 15,
                elevation: isFirst ? 15 : 10,
              },
              glowStyle,
            ]}
          >
            {/* Inner glow ring */}
            <View
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: avatarSize / 2,
                borderWidth: 2,
                borderColor: colorScheme.primary,
                opacity: 0.3,
              }}
            />
            <Image
              source={avatarSource}
              style={{
                width: "90%",
                height: "90%",
                borderRadius: avatarSize / 2,
              }}
            />
          </Animated.View>
        </View>

        {/* Enhanced Pedestal */}
        <View style={styles.pedestalWrapper}>
          {/* Outer glow effect */}
          <View
            style={[
              styles.pedestalGlow,
              {
                height: pedestalHeight + 10,
                width: isFirst ? 110 : 90,
                backgroundColor: colorScheme.shadow,
                opacity: 0.2,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              },
            ]}
          />

          {/* Main pedestal */}
          <LinearGradient
            colors={[...colorScheme.gradient, "transparent"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[
              styles.pedestal,
              {
                height: pedestalHeight,
                width: isFirst ? 105 : 85,
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
                borderWidth: 1,
                borderColor: colorScheme.accent,
                borderBottomWidth: 0,
              },
            ]}
          >
            {/* Shine effect */}
            <LinearGradient
              colors={["rgba(255,255,255,0.3)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 0.3 }}
              style={StyleSheet.absoluteFill}
            />

            {/* Rank Watermark with gradient */}
            <Text
              style={[
                styles.rankWatermark,
                {
                  color: "rgba(255,255,255,0.08)",
                  fontSize: isFirst ? 90 : 70,
                },
              ]}
            >
              {rank}
            </Text>

            {/* Info Container with glass effect */}
            <View style={styles.infoContainer}>
              {/* Name with background */}
              <View
                style={[
                  styles.nameContainer,
                  {
                    backgroundColor: "rgba(0,0,0,0.4)",
                    borderRadius: 10,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    marginBottom: 6,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.bodySmall,
                    styles.nameText,
                    {
                      color: "#FFF",
                      textShadowColor: "black",
                      textShadowRadius: 3,
                      fontSize: isFirst ? 13 : 11,
                      fontWeight: "800",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {countryFlag ? `${countryFlag} ` : ""}
                  {entry.chefs?.chef_name || "Chef"}
                </Text>
              </View>

              {/* Enhanced Score Pill */}
              <LinearGradient
                colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0.3)"]}
                style={[
                  styles.scorePill,
                  {
                    borderWidth: 1,
                    borderColor: colorScheme.accent,
                  },
                ]}
              >
                <Ionicons
                  name="flash"
                  size={12}
                  color={colorScheme.accent}
                  style={{ marginRight: 2 }}
                />
                <Text
                  style={[
                    typography.caption,
                    {
                      color: "#FFF",
                      fontWeight: "900",
                      fontSize: isFirst ? 12 : 10,
                    },
                  ]}
                >
                  {score.toLocaleString()}
                </Text>
                <Text
                  style={[
                    typography.caption,
                    {
                      color: colorScheme.accent,
                      fontWeight: "600",
                      fontSize: 9,
                      marginLeft: 2,
                    },
                  ]}
                >
                  XP
                </Text>
              </LinearGradient>
            </View>

            {/* Bottom accent line */}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 3,
                backgroundColor: colorScheme.accent,
              }}
            />
          </LinearGradient>
        </View>

        {/* Sparkle effects for 1st place */}
        {isFirst && (
          <>
            <Animated.View
              style={[
                styles.sparkle,
                { top: 10, left: -5 },
                animatedGlowStyle1,
              ]}
            >
              <Ionicons name="sparkles" size={16} color={colorScheme.accent} />
            </Animated.View>
            <Animated.View
              style={[
                styles.sparkle,
                { top: 15, right: -5 },
                animatedGlowStyle1,
              ]}
            >
              <Ionicons name="sparkles" size={14} color={colorScheme.accent} />
            </Animated.View>
          </>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Background glow */}
      <View style={styles.backgroundGlow} />

      {/* 2nd Place (Left) */}
      <View style={styles.sideColumn}>{renderPodiumStep(second, 2)}</View>

      {/* 1st Place (Center) */}
      <View style={styles.centerColumn}>{renderPodiumStep(first, 1)}</View>

      {/* 3rd Place (Right) */}
      <View style={styles.sideColumn}>{renderPodiumStep(third, 3)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingTop: 50,
    paddingBottom: 10,
    marginBottom: 20,
    position: "relative",
  },
  backgroundGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 215, 0, 0.03)",
    borderRadius: 20,
  },
  centerColumn: {
    alignItems: "center",
    justifyContent: "flex-end",
    marginHorizontal: 2,
    zIndex: 10,
  },
  sideColumn: {
    alignItems: "center",
    justifyContent: "flex-end",
    marginHorizontal: -8,
    zIndex: 1,
  },
  stepContainer: {
    alignItems: "center",
    position: "relative",
  },
  emptyStep: {
    width: 85,
  },
  crownContainer: {
    marginBottom: -8,
    zIndex: 4,
  },
  trophyContainer: {
    marginBottom: 10,
    zIndex: 3,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  rankBadgeText: {
    fontSize: 14,
    fontWeight: "900",
  },
  avatarContainer: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  pedestalWrapper: {
    position: "relative",
    alignItems: "center",
  },
  pedestalGlow: {
    position: "absolute",
    bottom: -5,
  },
  pedestal: {
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 12,
    overflow: "hidden",
    position: "relative",
  },
  rankWatermark: {
    position: "absolute",
    top: -15,
    fontWeight: "900",
    fontStyle: "italic",
    zIndex: 0,
  },
  infoContainer: {
    alignItems: "center",
    zIndex: 1,
    width: "100%",
    paddingHorizontal: 6,
  },
  nameContainer: {
    maxWidth: "95%",
  },
  nameText: {
    textAlign: "center",
  },
  scorePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  sparkle: {
    position: "absolute",
    zIndex: 5,
  },
});
