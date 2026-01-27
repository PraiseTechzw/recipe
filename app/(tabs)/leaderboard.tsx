import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { leaderboardService } from "@/services/leaderboardRealtime";
import {
    LeaderboardEntry,
    useLeaderboardStore,
} from "@/stores/leaderboardStore";
import { useUserStore } from "@/stores/userStore";

type LeaderboardTab = "weekly" | "allTime";

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("weekly");

  // Store selectors
  const topWeekly = useLeaderboardStore((state) => state.topWeekly);
  const topAllTime = useLeaderboardStore((state) => state.topAllTime);
  const isLoading = useLeaderboardStore((state) => state.isLoading);
  const userProfile = useUserStore((state) => state.userProfile);

  // Data based on tab
  const data = activeTab === "weekly" ? topWeekly : topAllTime;

  // Initialize and Subscribe
  useEffect(() => {
    fetchData();
    leaderboardService.subscribe();

    return () => {
      leaderboardService.unsubscribe();
    };
  }, []);

  const fetchData = useCallback(() => {
    leaderboardService.fetchGlobalLeaderboards();
    // Also fetch neighbors if we have a user ID
    if (userProfile.id) {
      // We pass 0 for XP as a fallback if not found,
      // but ideally we should pass current XP from store if available there
      // or let the service handle it.
      // The service expects (chefId, xp).
      // Let's use the XP from userProfile for now.
      const currentXp =
        activeTab === "weekly"
          ? 0 // We don't track weekly XP in userStore yet, so neighbors might be inaccurate for weekly
          : userProfile.xp;

      leaderboardService.fetchAroundMe(userProfile.id, currentXp);
    }
  }, [userProfile.id, userProfile.xp, activeTab]);

  const onRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const renderItem = ({
    item,
    index,
  }: {
    item: LeaderboardEntry;
    index: number;
  }) => {
    const isMe = item.chef_id === userProfile.id;
    const rank = index + 1;

    // Determine avatar
    // If we have a seed, we can use a service like dicebear or just a placeholder
    // For this app, let's assume we use a simple generic avatar or initials if no image
    // The store interface has avatar_seed.

    return (
      <View style={[styles.row, isMe && styles.meRow]}>
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, rank <= 3 && styles.topRank]}>
            {rank}
          </Text>
        </View>

        <View style={styles.avatarContainer}>
          {/* Placeholder for avatar based on seed */}
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>
              {item.chefs?.chef_name?.substring(0, 1).toUpperCase() || "?"}
            </Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <Text
            style={[styles.chefName, isMe && styles.meText]}
            numberOfLines={1}
          >
            {item.chefs?.chef_name || "Unknown Chef"}
            {isMe && " (You)"}
          </Text>
          <Text style={styles.levelText}>Lvl {item.level}</Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            {activeTab === "weekly" ? item.weekly_xp : item.total_xp} XP
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={styles.liveContainer}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeTab === "weekly" && styles.segmentActive,
          ]}
          onPress={() => setActiveTab("weekly")}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === "weekly" && styles.segmentTextActive,
            ]}
          >
            Weekly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segmentButton,
            activeTab === "allTime" && styles.segmentActive,
          ]}
          onPress={() => setActiveTab("allTime")}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === "allTime" && styles.segmentTextActive,
            ]}
          >
            All Time
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.chef_id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor="#E65100"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isLoading
                ? "Loading chefs..."
                : "No chefs found yet. Be the first!"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  liveContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAF50",
    marginRight: 6,
  },
  liveText: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "600",
  },
  segmentContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 15,
    backgroundColor: "#EEEEEE",
    borderRadius: 12,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 10,
  },
  segmentActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#757575",
  },
  segmentTextActive: {
    color: "#E65100",
  },
  listContent: {
    paddingBottom: 100, // Space for tab bar
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  meRow: {
    backgroundColor: "#FFF3E0", // Light orange highlight
  },
  rankContainer: {
    width: 30,
    alignItems: "center",
    marginRight: 10,
  },
  rankText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#757575",
  },
  topRank: {
    color: "#E65100",
    fontWeight: "bold",
    fontSize: 18,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#757575",
  },
  infoContainer: {
    flex: 1,
  },
  chefName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  meText: {
    color: "#E65100",
  },
  levelText: {
    fontSize: 12,
    color: "#999",
  },
  scoreContainer: {
    alignItems: "flex-end",
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
  },
});
