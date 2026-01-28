import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LeaderboardEntry } from "@/store/useStore";
import { useTheme } from "@/theme/useTheme";
import { LevelPill } from "../ui/LevelPill";

interface LeaderboardRowProps {
  item: LeaderboardEntry;
  rank: number;
  isMe: boolean;
  mode: "weekly" | "allTime";
}

export function LeaderboardRow({ item, rank, isMe, mode }: LeaderboardRowProps) {
  const { colors, typography, spacing, radius } = useTheme();

  const score = mode === "weekly" ? item.weekly_xp : item.total_xp;

  return (
    <View style={[
      styles.container,
      isMe && { backgroundColor: colors.primary + "10" } // 10% opacity primary
    ]}>
      {/* Rank */}
      <View style={styles.rankContainer}>
        <Text style={[
          typography.body, 
          styles.rankText,
          isMe && { color: colors.primary, fontWeight: "bold" }
        ]}>
          {rank}
        </Text>
      </View>

      {/* Avatar */}
      <Image
        source={{
          uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${item.chefs?.avatar_seed || item.chef_id}`,
        }}
        style={styles.avatar}
      />

      {/* Info */}
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text 
            style={[
              typography.body, 
              styles.nameText,
              isMe && { color: colors.primary, fontWeight: "700" }
            ]} 
            numberOfLines={1}
          >
            {item.chefs?.chef_name || "Chef"}
          </Text>
          {isMe && (
            <View style={[styles.youBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.youText}>YOU</Text>
            </View>
          )}
        </View>
        <LevelPill level={item.level} style={{ transform: [{ scale: 0.8 }], alignSelf: 'flex-start', marginLeft: -4 }} />
      </View>

      {/* Score */}
      <View style={styles.scoreContainer}>
        <Text style={[typography.h4, { color: colors.text }]}>
          {score}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          XP
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rankContainer: {
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  rankText: {
    color: "#666",
    fontWeight: "600",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f0f0",
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
  nameText: {
    fontWeight: "600",
    marginRight: 6,
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
  },
});
