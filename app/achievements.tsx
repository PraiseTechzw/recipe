import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BADGES, getLevel, getNextLevel } from "../constants/gamification";
import { useStore } from "../store/useStore";
import { useTheme } from "../theme/useTheme";

type FilterType = "All" | "Unlocked" | "Locked";

const CATEGORY_COLORS: Record<string, string> = {
  cooking: "#E57A2E",
  social: "#4D8C80",
  collection: "#7A6AB0",
  streak: "#D75B44",
};

const getCategoryColor = (category: string) => CATEGORY_COLORS[category] || "#6B8D65";

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, shadows } = useTheme();
  const [filter, setFilter] = useState<FilterType>("All");

  const { userProfile } = useStore();
  const { xp, badges: unlockedIds } = userProfile;
  const levelInfo = getLevel(xp);
  const nextLevel = getNextLevel(xp);
  const level = levelInfo.level;

  // -------------------------------------------------------------------------
  // HELPERS
  // -------------------------------------------------------------------------

  // Calculate Progress to Next Level
  const nextLevelXP = nextLevel?.minXP ?? levelInfo.minXP;
  const currentLevelXP = levelInfo.minXP;

  const progressPercent = Math.min(
    nextLevel ? 100 : 100,
    Math.max(0, nextLevel ? ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100 : 100),
  );

  // -------------------------------------------------------------------------
  // FILTERING
  // -------------------------------------------------------------------------

  const filteredAchievements = BADGES.filter((item) => {
    const isUnlocked = unlockedIds.includes(item.id);
    if (filter === "Unlocked") return isUnlocked;
    if (filter === "Locked") return !isUnlocked;
    return true;
  });

  // Sort: Unlocked first, then by XP reward
  filteredAchievements.sort((a, b) => {
    const aUnlocked = unlockedIds.includes(a.id);
    const bUnlocked = unlockedIds.includes(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return b.xpReward - a.xpReward;
  });

  const unlockedCount = unlockedIds.length;
  const totalCount = BADGES.length;

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.surfaceVariant }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Achievements</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* XP Card */}
        <LinearGradient
          colors={["#FF9966", "#FF5E62"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.xpCard}
        >
          <View style={styles.xpRow}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelNum}>{level}</Text>
              <Text style={styles.levelLabel}>LEVEL</Text>
            </View>

            <View style={styles.xpInfo}>
              <Text style={styles.xpTotalText}>{xp.toLocaleString()} XP</Text>
              <Text style={styles.xpNextText}>
                {nextLevel ? `${nextLevel.title} · ${nextLevelXP.toLocaleString()} XP` : "Maximum level reached"}
              </Text>

              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${progressPercent}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {nextLevel ? `${Math.max(0, nextLevelXP - xp)} XP to go` : "Level complete"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Badges Grid (Preview of Unlocked) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Badges</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
              {unlockedCount}/{totalCount}
            </Text>
          </View>

          <View style={styles.badgesGrid}>
            {unlockedIds.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No badges unlocked yet. Get cooking!
              </Text>
            ) : (
              BADGES.filter((a) => unlockedIds.includes(a.id)).map((badge) => (
                <View key={badge.id} style={styles.badgeItem}>
                  <View
                    style={[
                      styles.badgeIconContainer,
                      { backgroundColor: getCategoryColor(badge.category) },
                    ]}
                  >
                    <Text style={{ fontSize: 24 }}>{badge.icon}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={[styles.tabsContainer, { backgroundColor: colors.surfaceVariant }]}>
          {(["All", "Unlocked", "Locked"] as FilterType[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabButton, { backgroundColor: filter === t ? colors.surface : "transparent" }, filter === t && shadows.small]}
              onPress={() => setFilter(t)}
            >
              <Text
                style={[styles.tabText, { color: filter === t ? colors.primary : colors.textSecondary }]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Achievements List */}
        <View style={styles.listContainer}>
          {filteredAchievements.map((item) => {
            const isUnlocked = unlockedIds.includes(item.id);
            return (
              <View
                key={item.id}
                style={[styles.achievementRow, { backgroundColor: colors.surface, borderColor: colors.border, opacity: isUnlocked ? 1 : 0.78 }]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    isUnlocked
                      ? { backgroundColor: getCategoryColor(item.category) }
                      : { backgroundColor: colors.surfaceVariant },
                  ]}
                >
                  {isUnlocked ? (
                    <Text style={{ fontSize: 24 }}>{item.icon}</Text>
                  ) : (
                    <Ionicons name="lock-closed" size={22} color={colors.textSecondary} />
                  )}
                </View>

                <View style={styles.rowContent}>
                  <Text
                    style={[styles.rowTitle, { color: colors.text }]}
                  >
                    {item.name}
                  </Text>
                  <Text style={[styles.rowDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.description}
                  </Text>
                  {!isUnlocked && (
                    <Text style={styles.rewardText}>+{item.xpReward} XP</Text>
                  )}
                </View>

                {isUnlocked && (
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  xpCard: {
    margin: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#FF5E62",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  xpRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  levelBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
    marginRight: 20,
  },
  levelNum: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
  },
  levelLabel: {
    fontSize: 8,
    color: "#FFF",
    fontWeight: "bold",
  },
  xpInfo: {
    flex: 1,
  },
  xpTotalText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  xpNextText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 4,
    marginBottom: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFF",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: "600",
    textAlign: "right",
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#757575",
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  badgeItem: {
    marginBottom: 8,
  },
  badgeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    color: "#999",
    fontStyle: "italic",
  },
  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#E65100",
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  achievementRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rowLocked: {
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconLocked: {
    backgroundColor: "#E0E0E0",
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  rowDesc: {
    fontSize: 13,
    color: "#757575",
    lineHeight: 18,
  },
  rewardText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "bold",
    color: "#FF9800",
  },
});
