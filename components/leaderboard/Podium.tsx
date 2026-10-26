import { Ionicons } from "@expo/vector-icons";
import { getChefAvatarUri } from "@/utils/chefIdentity";
import { LeaderboardEntry } from "@/store/useStore";
import { useTheme } from "@/theme/useTheme";
import React from "react";
import { Image, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";

interface PodiumProps {
  topThree: LeaderboardEntry[];
  mode: "weekly" | "allTime";
  style?: ViewStyle;
}

export function Podium({ topThree, mode, style }: PodiumProps) {
  const { colors, typography, spacing } = useTheme();
  const [first, second, third] = topThree;

  const renderPodiumStep = (entry: LeaderboardEntry | undefined, rank: number) => {
    if (!entry) return <View style={styles.emptyStep} />;

    const isFirst = rank === 1;
    const isSecond = rank === 2;
    const avatarSize = isFirst ? 76 : 60;
    const medal = isFirst ? "#E9B949" : isSecond ? "#AEB8C4" : "#C47A4A";
    const score = (mode === "weekly" ? entry.weekly_xp : entry.total_xp) || 0;

    return (
      <Animated.View entering={FadeInDown.delay(rank * 100).springify()} style={styles.stepContainer}>
        <View style={[styles.avatarWrapper, { marginBottom: spacing.s }]}>
          {isFirst && (
            <Animated.View entering={ZoomIn.delay(400).springify()} style={styles.crownWrap}>
              <Ionicons name="trophy" size={20} color="#E9B949" />
            </Animated.View>
          )}
          <View
            style={[
              styles.avatarBorder,
              {
                width: avatarSize + 8,
                height: avatarSize + 8,
                borderRadius: (avatarSize + 8) / 2,
                borderColor: medal,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <Image
              source={{ uri: getChefAvatarUri(entry.chefs?.avatar_seed || entry.chef_id) }}
              style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2, backgroundColor: colors.surfaceVariant }}
            />
            <View style={[styles.rankBadge, { backgroundColor: medal, borderColor: colors.surface }]}>
              <Text style={[styles.rankText, { color: isSecond ? "#26313A" : "#FFFFFF" }]}>{rank}</Text>
            </View>
          </View>
        </View>
        <Text style={[typography.bodySmall, styles.nameText, { color: colors.text }]} numberOfLines={1}>
          {entry.chefs?.chef_name || "Chef"}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          {score.toLocaleString()} XP
        </Text>
        <View
          style={[
            styles.platform,
            {
              height: isFirst ? 40 : isSecond ? 31 : 24,
              backgroundColor: isFirst ? colors.primary + "22" : colors.surfaceVariant,
              borderTopColor: medal,
            },
          ]}
        >
          <Text style={[styles.platformLabel, { color: isFirst ? colors.primary : colors.textSecondary }]}>
            {isFirst ? "CHAMPION" : `#${rank}`}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.sideColumn}>{renderPodiumStep(second, 2)}</View>
      <View style={styles.centerColumn}>{renderPodiumStep(first, 1)}</View>
      <View style={styles.sideColumn}>{renderPodiumStep(third, 3)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingTop: 18,
    paddingBottom: 4,
    marginBottom: 8,
  },
  centerColumn: { alignItems: "center", justifyContent: "flex-end", width: 112, marginHorizontal: 2 },
  sideColumn: { alignItems: "center", justifyContent: "flex-end", width: 100, marginHorizontal: 1 },
  stepContainer: { alignItems: "center", width: "100%" },
  emptyStep: { width: 100 },
  avatarWrapper: { alignItems: "center", position: "relative" },
  avatarBorder: { borderWidth: 3, justifyContent: "center", alignItems: "center" },
  crownWrap: { position: "absolute", top: -23, zIndex: 20 },
  rankBadge: {
    position: "absolute",
    bottom: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  rankText: { fontSize: 11, fontWeight: "900" },
  nameText: { fontWeight: "800", maxWidth: 98, textAlign: "center" },
  platform: {
    width: "92%",
    marginTop: 8,
    borderTopWidth: 3,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  platformLabel: { fontSize: 9, fontWeight: "900", letterSpacing: 0.7 },
});
