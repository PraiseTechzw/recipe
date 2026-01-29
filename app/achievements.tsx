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
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BADGES, getLevel } from "../constants/gamification";
import { useStore } from "../store/useStore";
import { useTheme } from "../theme/useTheme";

type FilterType = "All" | "Unlocked" | "Locked";

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, typography, isDark, shadows } = useTheme();
  const [filter, setFilter] = useState<FilterType>("All");

  const { userProfile } = useStore();
  const { xp, badges: unlockedIds } = userProfile;
  const levelInfo = getLevel(xp);
  const level = levelInfo.level;

  // -------------------------------------------------------------------------
  // HELPERS
  // -------------------------------------------------------------------------

  const nextLevelXP = levelInfo.nextLevelXP || levelInfo.minXP + 1000;
  const currentLevelXP = levelInfo.minXP;

  const progressPercent = Math.min(
    100,
    Math.max(0, ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100),
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "chef":
        return "#FF9800";
      case "social":
        return "#2196F3";
      case "health":
        return "#4CAF50";
      case "collection":
        return "#9C27B0";
      default:
        return colors.primary;
    }
  };

  // -------------------------------------------------------------------------
  // FILTERING
  // -------------------------------------------------------------------------

  const filteredAchievements = BADGES.filter((item) => {
    const isUnlocked = unlockedIds.includes(item.id);
    if (filter === "Unlocked") return isUnlocked;
    if (filter === "Locked") return !isUnlocked;
    return true;
  });

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backButton,
            { backgroundColor: isDark ? colors.surfaceVariant : "#F5F5F5" },
          ]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Achievements
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* XP Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <LinearGradient
            colors={[colors.primary, "#FF5E62"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.xpCard, { shadowColor: colors.primary }]}
          >
            <View style={styles.xpRow}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelNum}>{level}</Text>
                <Text style={styles.levelLabel}>LEVEL</Text>
              </View>

              <View style={styles.xpInfo}>
                <Text style={styles.xpTotalText}>{xp.toLocaleString()} XP</Text>
                <Text style={styles.xpNextText}>
                  Next Level: {nextLevelXP.toLocaleString()} XP
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
                  {Math.floor(nextLevelXP - xp)} XP to go
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Filter Tabs */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <View
            style={[
              styles.tabsContainer,
              { backgroundColor: isDark ? colors.surfaceVariant : "#EEE" },
            ]}
          >
            {(["All", "Unlocked", "Locked"] as FilterType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.tabButton,
                  filter === t && {
                    backgroundColor: colors.surface,
                    shadowColor: "#000",
                  },
                  filter === t && styles.tabActive,
                ]}
                onPress={() => setFilter(t)}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        filter === t ? colors.primary : colors.textSecondary,
                    },
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Stats Summary */}
        <View style={styles.summaryContainer}>
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            You've unlocked{" "}
            <Text style={{ color: colors.primary, fontWeight: "bold" }}>
              {unlockedCount}
            </Text>{" "}
            of {totalCount} badges
          </Text>
        </View>

        {/* Achievements List */}
        <View style={styles.listContainer}>
          {filteredAchievements.map((item, index) => {
            const isUnlocked = unlockedIds.includes(item.id);
            const categoryColor = getCategoryColor(item.category);

            return (
              <Animated.View
                key={item.id}
                entering={FadeInUp.delay(300 + index * 50).springify()}
              >
                <View
                  style={[
                    styles.achievementRow,
                    {
                      backgroundColor: colors.surface,
                      borderColor: isUnlocked ? colors.border : "transparent",
                      shadowColor: shadows.small.shadowColor,
                    },
                    !isUnlocked && {
                      backgroundColor: isDark
                        ? colors.surfaceVariant
                        : "#F9F9F9",
                      opacity: 0.7,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: isUnlocked
                          ? isDark
                            ? "rgba(255,255,255,0.05)"
                            : "#F5F5F5"
                          : isDark
                            ? "rgba(255,255,255,0.02)"
                            : "#EEE",
                      },
                    ]}
                  >
                    {isUnlocked ? (
                      <Image
                        source={item.icon}
                        style={{ width: 40, height: 40 }}
                        contentFit="contain"
                      />
                    ) : (
                      <Ionicons
                        name="lock-closed"
                        size={20}
                        color={colors.textSecondary}
                      />
                    )}
                  </View>

                  <View style={styles.rowContent}>
                    <Text
                      style={[
                        styles.rowTitle,
                        { color: colors.text, opacity: isUnlocked ? 1 : 0.6 },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[styles.rowDesc, { color: colors.textSecondary }]}
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>

                    <View style={styles.metaRow}>
                      <View
                        style={[
                          styles.pill,
                          {
                            backgroundColor: isUnlocked
                              ? categoryColor + "20"
                              : colors.border,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.pillText,
                            {
                              color: isUnlocked
                                ? categoryColor
                                : colors.textSecondary,
                            },
                          ]}
                        >
                          {item.category.toUpperCase()}
                        </Text>
                      </View>

                      {!isUnlocked && (
                        <Text
                          style={[styles.rewardText, { color: colors.primary }]}
                        >
                          +{item.xpReward} XP
                        </Text>
                      )}
                    </View>
                  </View>

                  {isUnlocked && (
                    <View style={styles.checkIcon}>
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={colors.success}
                      />
                    </View>
                  )}
                </View>
              </Animated.View>
            );
          })}
        </View>

        {/* Bottom spacer for tab bar */}
        <View style={{ height: 100 }} />
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
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  scrollContent: {
    paddingTop: 20,
  },
  xpCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 24,
    padding: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  xpRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  levelBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    marginRight: 20,
  },
  levelNum: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFF",
  },
  levelLabel: {
    fontSize: 9,
    color: "#FFF",
    fontWeight: "800",
    marginTop: -2,
    opacity: 0.9,
  },
  xpInfo: {
    flex: 1,
  },
  xpTotalText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFF",
    marginBottom: 4,
  },
  xpNextText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 10,
    fontWeight: "500",
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 3,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFF",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: "700",
    textAlign: "right",
    opacity: 0.9,
  },
  tabsContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  tabActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
  },
  summaryContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  achievementRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  rowContent: {
    flex: 1,
    paddingVertical: 2,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  rowDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pillText: {
    fontSize: 10,
    fontWeight: "700",
  },
  rewardText: {
    fontSize: 12,
    fontWeight: "800",
  },
  checkIcon: {
    marginLeft: 8,
    marginTop: 12,
  },
});
