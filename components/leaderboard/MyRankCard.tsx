import { COUNTRIES } from "@/constants/countries";
import { LeaderboardEntry } from "@/store/useStore";
import { useTheme } from "@/theme/useTheme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface MyRankCardProps {
  userRank: number | null;
  entry?: LeaderboardEntry;
  mode: "weekly" | "allTime";
}

export function MyRankCard({ userRank, entry, mode }: MyRankCardProps) {
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  if (!userRank && !entry) return null;

  const score = entry
    ? (mode === "weekly" ? entry.weekly_xp : entry.total_xp) || 0
    : 0;

  const countryFlag = React.useMemo(() => {
    if (!entry?.chefs?.country) return null;
    return COUNTRIES.find((c) => c.name === entry.chefs?.country)?.flag;
  }, [entry?.chefs?.country]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom + spacing.s,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          shadowColor: "#000", // Shadows are usually black even in dark mode, or handled by elevation
        },
      ]}
    >
      {/* Header pill */}
      <View style={styles.headerPillContainer}>
        <View
          style={[
            styles.headerPill,
            { backgroundColor: colors.surfaceVariant },
          ]}
        >
          <Text
            style={[
              typography.caption,
              { color: colors.textSecondary, fontWeight: "600" },
            ]}
          >
            YOUR RANKING
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Rank Circle */}
        <View style={[styles.rankCircle, { backgroundColor: colors.primary }]}>
          <Text style={styles.rankText}>#{userRank || "?"}</Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text
            style={[
              typography.body,
              { fontWeight: "bold", color: colors.text },
            ]}
          >
            {countryFlag ? `${countryFlag} ` : ""}
            {entry?.chefs?.chef_name || "You"}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {userRank
              ? `Top ${((userRank / 10000) * 100).toFixed(1)}%`
              : "Keep cooking to rank up!"}
          </Text>
        </View>

        {/* Score */}
        <View style={styles.score}>
          <Text style={[typography.h4, { color: colors.primary }]}>
            {score}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            XP
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  headerPillContainer: {
    position: "absolute",
    top: -10,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  headerPill: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 10,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  rankCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  info: {
    flex: 1,
  },
  score: {
    alignItems: "flex-end",
  },
});
