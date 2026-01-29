import { LeaderboardEntry } from "@/store/useStore";
import { useTheme } from "@/theme/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { COUNTRIES } from "../../constants/countries";
import { LevelPill } from "../ui/LevelPill";

interface LeaderboardRowProps {
  item: LeaderboardEntry;
  rank: number;
  isMe: boolean;
  mode: "weekly" | "allTime";
}

export const LeaderboardRow = React.memo(function LeaderboardRow({
  item,
  rank,
  isMe,
  mode,
}: LeaderboardRowProps) {
  const { colors, typography } = useTheme();

  const score = (mode === "weekly" ? item.weekly_xp : item.total_xp) || 0;
  const countryFlag = COUNTRIES.find(
    (c) => c.name === item.chefs?.country,
  )?.flag;

  const avatarSource = React.useMemo(() => {
    const seedOrUrl = item.chefs?.avatar_seed || item.chef_id;
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
  }, [item.chefs?.avatar_seed, item.chef_id]);

  const renderTrend = () => {
    if (!item.trend || item.trend === "same") {
      return <Ionicons name="remove" size={12} color={colors.textSecondary} />;
    }
    if (item.trend === "up") {
      return <Ionicons name="caret-up" size={12} color={colors.success} />;
    }
    if (item.trend === "down") {
      return <Ionicons name="caret-down" size={12} color={colors.error} />;
    }
    if (item.trend === "new") {
      return (
        <View style={[styles.newBadge, { backgroundColor: colors.success }]}>
          <Text style={styles.newText}>NEW</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(rank * 50).springify()}
      style={[
        styles.container,
        { borderBottomColor: colors.border },
        isMe && { backgroundColor: colors.primary + "10" }, // 10% opacity primary
      ]}
      accessible={true}
      accessibilityLabel={`Rank ${rank}, ${item.chefs?.chef_name || "Chef"}, Level ${item.level || 1}, ${score.toLocaleString()} XP`}
      accessibilityRole="text"
    >
      {/* Rank & Trend */}
      <View style={styles.rankContainer}>
        <Text
          style={[
            typography.body,
            styles.rankText,
            { color: colors.textSecondary },
            isMe && { color: colors.primary, fontWeight: "bold" },
          ]}
        >
          {rank}
        </Text>
        <View style={styles.trendContainer}>{renderTrend()}</View>
      </View>

      {/* Avatar */}
      <Image
        source={avatarSource}
        style={[styles.avatar, { backgroundColor: colors.surfaceVariant }]}
      />

      {/* Info */}
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text
            style={[
              typography.body,
              styles.nameText,
              { color: colors.text },
              isMe && { color: colors.primary, fontWeight: "700" },
            ]}
            numberOfLines={1}
          >
            {item.chefs?.chef_name || "Chef"}
          </Text>
          {isMe && (
            <View
              style={[styles.youBadge, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.youText}>YOU</Text>
            </View>
          )}
        </View>
        <View style={styles.detailsRow}>
          <LevelPill
            level={item.level || 1}
            style={{
              transform: [{ scale: 0.8 }],
              alignSelf: "flex-start",
              marginLeft: -4,
              marginRight: 8,
            }}
          />
          {item.chefs?.country && (
            <Text
              style={[
                typography.caption,
                { color: colors.textSecondary, fontSize: 10 },
              ]}
            >
              {countryFlag ? `${countryFlag} ` : ""}
              {item.chefs.country}
            </Text>
          )}
        </View>
      </View>

      {/* Score */}
      <View style={styles.scoreContainer}>
        <Text style={[typography.h4, { color: colors.text }]}>
          {score.toLocaleString()}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          XP
        </Text>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  rankContainer: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    gap: 2,
  },
  rankText: {
    fontWeight: "600",
    fontSize: 16,
  },
  trendContainer: {
    height: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  newBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "bold",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  nameText: {
    fontWeight: "600",
    marginRight: 6,
    fontSize: 16,
  },
  youBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  youText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  scoreContainer: {
    alignItems: "flex-end",
    minWidth: 80,
  },
});
