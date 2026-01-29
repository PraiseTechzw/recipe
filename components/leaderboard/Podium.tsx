import { LeaderboardEntry } from "@/store/useStore";
import { useTheme } from "@/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";

interface PodiumProps {
  topThree: LeaderboardEntry[];
  mode: "weekly" | "allTime";
  style?: ViewStyle;
}

export function Podium({ topThree, mode, style }: PodiumProps) {
  const { colors, typography, spacing, radius } = useTheme();

  // Helper to get correct item for position (1st, 2nd, 3rd)
  // Input array is sorted by rank (0=1st, 1=2nd, 2=3rd)
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

    // Height based on rank
    const stepHeight = isFirst ? 140 : isSecond ? 110 : 90;
    const avatarSize = isFirst ? 80 : 60;
    const borderColor = isFirst ? "#FFD700" : isSecond ? "#C0C0C0" : "#CD7F32";
    const rankColor = isFirst ? "#FFD700" : isSecond ? "#C0C0C0" : "#CD7F32";

    const score = (mode === "weekly" ? entry.weekly_xp : entry.total_xp) || 0;

    return (
      <Animated.View
        entering={FadeInDown.delay(rank * 100).springify()}
        style={[styles.stepContainer, { zIndex: isFirst ? 10 : 1 }]}
      >
        {/* Avatar Section */}
        <View style={[styles.avatarWrapper, { marginBottom: spacing.s }]}>
          {isFirst && (
            <Animated.View entering={ZoomIn.delay(400).springify()}>
              <Ionicons
                name="crown"
                size={24}
                color="#FFD700"
                style={styles.crown}
              />
            </Animated.View>
          )}
          <View
            style={[
              styles.avatarBorder,
              {
                width: avatarSize + 6,
                height: avatarSize + 6,
                borderRadius: (avatarSize + 6) / 2,
                borderColor: borderColor,
              },
            ]}
          >
            <Image
              source={{
                uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${entry.chefs?.avatar_seed || entry.chef_id}`,
              }}
              style={{
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize / 2,
                backgroundColor: "#fff",
              }}
            />
            <View style={[styles.rankBadge, { backgroundColor: rankColor }]}>
              <Text style={styles.rankText}>{rank}</Text>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <Text style={[typography.bodySmall, styles.nameText]} numberOfLines={1}>
          {entry.chefs?.chef_name || "Chef"}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {score.toLocaleString()} XP
        </Text>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, style]}>
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
    paddingVertical: 20,
    marginBottom: 10,
  },
  centerColumn: {
    alignItems: "center",
    justifyContent: "flex-end",
    marginHorizontal: 10,
    paddingBottom: 20, // Push up slightly
  },
  sideColumn: {
    alignItems: "center",
    justifyContent: "flex-end",
    marginHorizontal: 4,
  },
  stepContainer: {
    alignItems: "center",
  },
  emptyStep: {
    width: 80,
  },
  avatarWrapper: {
    alignItems: "center",
    position: "relative",
  },
  avatarBorder: {
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  crown: {
    position: "absolute",
    top: -24,
    zIndex: 20,
  },
  rankBadge: {
    position: "absolute",
    bottom: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  rankText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  nameText: {
    fontWeight: "600",
    maxWidth: 90,
    textAlign: "center",
  },
});
