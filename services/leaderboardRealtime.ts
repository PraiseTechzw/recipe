import { getLevel } from "@/constants/gamification";
import { supabase } from "@/lib/supabase";
import { LeaderboardEntry, useStore } from "@/store/useStore";

/**
 * Service to manage Leaderboard Data (Real Version)
 */
class LeaderboardRealtimeService {
  /**
   * Fetches initial data: Top 50 Weekly, Top 50 All-Time.
   */
  async fetchGlobalLeaderboards() {
    const store = useStore.getState();
    store.setLeaderboardLoading(true);
    store.setLeaderboardError(null);

    try {
      // Fetch from Supabase profiles
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, name, xp, country, avatar_url")
        .order("xp", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching leaderboard:", error);
        // Fallback to empty if offline or error
        store.setTopAllTime([]);
        store.setTopWeekly([]);
        store.setLeaderboardLoading(false);
        return;
      }

      // Map profiles to LeaderboardEntry
      const entries: LeaderboardEntry[] = (profiles || []).map((p) => {
        const levelInfo = getLevel(p.xp || 0);
        return {
          chef_id: p.id,
          total_xp: p.xp || 0,
          weekly_xp: 0, // We don't track weekly XP yet
          level: levelInfo.level,
          trend: "same",
          chefs: {
            chef_name: p.name || "Unknown Chef",
            avatar_seed: p.avatar_url || p.name || "Chef",
            country: p.country || "Unknown",
          },
        };
      });

      // For now, use the same data for weekly (or filter if we had date data)
      store.setTopAllTime(entries);
      store.setTopWeekly(entries); // Todo: Implement real weekly tracking

      // Update user rank
      const myId = store.userProfile.id;
      const myRank = entries.findIndex((e) => e.chef_id === myId);
      if (myRank !== -1) {
        store.setUserRank(myRank + 1);
      } else {
        store.setUserRank(null);
      }

      store.setLeaderboardLoading(false);
    } catch (err) {
      console.error("Leaderboard fetch error:", err);
      store.setLeaderboardError("Failed to load leaderboard");
      store.setLeaderboardLoading(false);
    }
  }

  /**
   * Fetches "Around Me" - simulated
   */
  async fetchAroundMe(myChefId: string, sortBy: "weekly_xp" | "total_xp") {
    // In this mock version, fetchGlobalLeaderboards handles rank calculation
    // So this is just a placeholder or could refine neighbors
    const store = useStore.getState();
    const list = sortBy === "weekly_xp" ? store.topWeekly : store.topAllTime;
    const myIndex = list.findIndex((item) => item.chef_id === myChefId);

    if (myIndex !== -1) {
      const start = Math.max(0, myIndex - 2);
      const end = Math.min(list.length, myIndex + 3);
      store.setNeighbors(list.slice(start, end));
    }
  }

  /**
   * Subscribes to realtime changes - Mock implementation
   */
  subscribe() {
    useStore.getState().setLeaderboardLive(true);
  }

  /**
   * Cleans up subscription.
   */
  unsubscribe() {
    useStore.getState().setLeaderboardLive(false);
  }
}

export const leaderboardService = new LeaderboardRealtimeService();
