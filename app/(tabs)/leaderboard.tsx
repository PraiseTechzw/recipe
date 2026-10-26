import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { leaderboardService } from "@/services/leaderboardRealtime";
import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/useStore";
import { useTheme } from "@/theme/useTheme";

// Components
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { LeaderboardRow } from "@/components/leaderboard/LeaderboardRow";
import { MyRankCard } from "@/components/leaderboard/MyRankCard";
import { Podium } from "@/components/leaderboard/Podium";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

type LeaderboardTab = "weekly" | "allTime";

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  // const router = useRouter();
  const { colors, typography, shadows } = useTheme();

  // Local State
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("weekly");
  const [currentChefId, setCurrentChefId] = useState<string | null>(null);
  // const [refreshing, setRefreshing] = useState(false);

  // Store Selectors
  const topWeekly = useStore((state) => state.topWeekly);
  const topAllTime = useStore((state) => state.topAllTime);
  const neighbors = useStore((state) => state.neighbors);
  const userRank = useStore((state) => state.userRank);
  const isLoading = useStore((state) => state.isLeaderboardLoading);
  const error = useStore((state) => state.leaderboardError);
  const isLive = useStore((state) => state.isLeaderboardLive);

  // Derived Data
  const fullData = activeTab === "weekly" ? topWeekly : topAllTime;
  const topThree = fullData.slice(0, 3);
  const listData = fullData.slice(3);

  // Visibility Check for Sticky Footer
  const amIVisibleInList = fullData.some(
    (item) => item.chef_id === currentChefId,
  );
  const myEntry = neighbors.find((item) => item.chef_id === currentChefId);

  const fetchData = useCallback(async () => {
    leaderboardService.fetchGlobalLeaderboards();
    const { data: { session } } = await supabase.auth.getSession();
    const chefId = session?.user.id ?? null;
    setCurrentChefId(chefId);
    if (chefId) {
      const sortBy = activeTab === "weekly" ? "weekly_xp" : "total_xp";
      leaderboardService.fetchAroundMe(chefId, sortBy);
    }
  }, [activeTab]);

  // Lifecycle
  useEffect(() => {
    fetchData();
    leaderboardService.subscribe();
    return () => {
      leaderboardService.unsubscribe();
    };
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleTabChange = (index: number) => {
    setActiveTab(index === 0 ? "weekly" : "allTime");
  };

  const renderHeader = () => (
    <View style={[styles.headerContainer, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.small]}>
      {/* 1) Header Title & Status */}
      <View style={styles.titleRow}>
        <View>
          <Text style={[typography.h2, { color: colors.text }]}>
            Leaderboard
          </Text>
          <View style={styles.subtitleRow}>
            <Text style={[typography.body, { color: colors.textSecondary }]}>
              {activeTab === "weekly" ? "This Week" : "All Time Legends"}
            </Text>
            {isLive && !error && (
              <View
                style={[
                  styles.liveBadge,
                  { backgroundColor: colors.success + "20" },
                ]}
              >
                <View
                  style={[styles.liveDot, { backgroundColor: colors.success }]}
                />
                <Text
                  style={[
                    typography.caption,
                    { color: colors.success, fontWeight: "700" },
                  ]}
                >
                  LIVE
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={[styles.headerTrophy, { backgroundColor: colors.primary + "16" }]}>
          <Ionicons name="trophy" size={21} color={colors.primary} />
        </View>
      </View>

      {/* 2) Controls */}
      <View style={styles.controlsContainer}>
        <SegmentedControl
          values={["Weekly", "All-time"]}
          selectedIndex={activeTab === "weekly" ? 0 : 1}
          onChange={handleTabChange}
          style={styles.segmentedControl}
        />

        <View style={styles.globalLabel}>
          <Ionicons name="globe-outline" size={15} color={colors.textSecondary} />
          <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: "700" }]}>
            Global kitchen leaderboard
          </Text>
        </View>
      </View>

      {/* Offline Banner */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: colors.error + "16" }]}>
          <Ionicons name="cloud-offline" size={16} color={colors.error} />
          <Text
            style={[typography.caption, { color: colors.error, marginLeft: 6 }]}
          >
            Offline mode • Showing cached data
          </Text>
        </View>
      )}

      {/* 3) Top 3 Podium */}
      {isLoading && fullData.length === 0 ? (
        <View style={styles.podiumSkeleton}>
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Skeleton
              width={60}
              height={60}
              borderRadius={30}
              style={{ marginBottom: 8 }}
            />
            <Skeleton width={70} height={12} />
          </View>
          <View style={{ alignItems: "center", marginHorizontal: 20 }}>
            <Skeleton
              width={80}
              height={80}
              borderRadius={40}
              style={{ marginBottom: 8 }}
            />
            <Skeleton width={90} height={16} />
          </View>
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Skeleton
              width={60}
              height={60}
              borderRadius={30}
              style={{ marginBottom: 8 }}
            />
            <Skeleton width={70} height={12} />
          </View>
        </View>
      ) : (
        topThree.length > 0 && (
          <Podium topThree={topThree} mode={activeTab} style={styles.podium} />
        )
      )}
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, backgroundColor: colors.background },
      ]}
    >
      <FlatList
        data={listData}
        renderItem={({ item, index }) => (
          <LeaderboardRow
            item={item}
            rank={index + 4} // +1 for 0-index, +3 for top 3
            isMe={item.chef_id === currentChefId}
            mode={activeTab}
          />
        )}
        keyExtractor={(item) => item.chef_id}
        contentContainerStyle={{ paddingBottom: 100 }} // Space for sticky footer
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !isLoading
            ? () => (
                <EmptyState
                  title="No Chefs Yet"
                  description="Be the first to cook a recipe and climb the ranks!"
                  icon="trophy-outline"
                  actionLabel={error ? "Retry Connection" : undefined}
                  onAction={error ? fetchData : undefined}
                  style={{ marginTop: 40 }}
                />
              )
            : undefined
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />

      {/* 5) Sticky My Rank Footer */}
      {/* Show if: Not loading AND I'm not in the visible list AND I have a rank entry */}
      {!isLoading && !amIVisibleInList && (userRank || myEntry) && (
        <MyRankCard userRank={userRank} entry={myEntry} mode={activeTab} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 10,
    paddingBottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  headerTrophy: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  controlsContainer: {
    marginBottom: 20,
  },
  segmentedControl: {
    marginBottom: 12,
  },
  globalLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingTop: 10,
    paddingHorizontal: 2,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#B0002012",
    padding: 10,
    borderRadius: 12,
    marginBottom: 16,
  },
  podiumSkeleton: {
    height: 180,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingBottom: 20,
  },
  podium: {
    marginTop: 10,
  },
});
