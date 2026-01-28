import { supabase } from "@/lib/supabase";
import { useStore } from "@/store/useStore";
import { RealtimeChannel } from "@supabase/supabase-js";

// Limit fetches
const LIMIT = 50;

/**
 * Service to manage Leaderboard Data & Realtime Subscriptions
 */
class LeaderboardRealtimeService {
  private channel: RealtimeChannel | null = null;

  /**
   * Fetches initial data: Top 50 Weekly, Top 50 All-Time.
   */
  async fetchGlobalLeaderboards() {
    const store = useStore.getState();
    store.setLeaderboardLoading(true);
    store.setLeaderboardError(null);

    try {
      // 1. Fetch Weekly
      const { data: weekly, error: weeklyError } = await supabase
        .from("leaderboard")
        .select(
          `
          *,
          chefs (chef_name, avatar_seed, country)
        `,
        )
        .order("weekly_xp", { ascending: false })
        .limit(LIMIT);

      if (weeklyError) throw weeklyError;

      // 2. Fetch All-Time
      const { data: allTime, error: allTimeError } = await supabase
        .from("leaderboard")
        .select(
          `
          *,
          chefs (chef_name, avatar_seed, country)
        `,
        )
        .order("total_xp", { ascending: false })
        .limit(LIMIT);

      if (allTimeError) throw allTimeError;

      store.setTopWeekly(weekly as unknown as LeaderboardEntry[]);
      store.setTopAllTime(allTime as unknown as LeaderboardEntry[]);
    } catch (err: any) {
      console.error("Leaderboard fetch error:", err);
      store.setLeaderboardError(err.message);
    } finally {
      store.setLeaderboardLoading(false);
    }
  }

  /**
   * Fetches "Around Me" - entries with scores just above and below the current user.
   * Fallback strategy: Since we can't efficiently calculate RANK() in simple RLS-limited select,
   * we fetch 5 rows with score > myScore and 5 rows with score < myScore.
   */
  async fetchAroundMe(myChefId: string, myWeeklyXp: number) {
    const store = useStore.getState();

    try {
      // Fetch 5 above
      const { data: above } = await supabase
        .from("leaderboard")
        .select(`*, chefs (chef_name, avatar_seed, country)`)
        .gt("weekly_xp", myWeeklyXp)
        .order("weekly_xp", { ascending: true }) // closest to me
        .limit(5);

      // Fetch 5 below
      const { data: below } = await supabase
        .from("leaderboard")
        .select(`*, chefs (chef_name, avatar_seed, country)`)
        .lte("weekly_xp", myWeeklyXp) // includes me potentially if distinct
        .neq("chef_id", myChefId) // exclude me explicitly
        .order("weekly_xp", { ascending: false }) // closest to me
        .limit(5);

      // Fetch Me (to ensure I am in the list with joined data)
      const { data: me } = await supabase
        .from("leaderboard")
        .select(`*, chefs (chef_name, avatar_seed, country)`)
        .eq("chef_id", myChefId)
        .single();

      const neighbors = [
        ...(above || []).reverse(), // reverse to show highest first
        ...(me ? [me] : []),
        ...(below || []),
      ];

      store.setNeighbors(neighbors as unknown as LeaderboardEntry[]);
    } catch (err) {
      console.error("Fetch neighbors error:", err);
    }
  }

  /**
   * Subscribes to realtime changes on the leaderboard table.
   * On change, it fetches the related chef details (since realtime payload lacks joins)
   * and updates the store.
   */
  subscribe() {
    if (this.channel) return;

    this.channel = supabase
      .channel("public:leaderboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leaderboard" },
        async (payload) => {
          // Payload only contains raw table data, not the joined 'chefs' data.
          // We must fetch the full entry to display name/avatar.
          const newRow = payload.new as any;
          if (!newRow || !newRow.chef_id) return;

          // Fetch full details
          const { data, error } = await supabase
            .from("leaderboard")
            .select(`*, chefs (chef_name, avatar_seed, country)`)
            .eq("chef_id", newRow.chef_id)
            .single();

          if (!error && data) {
            useStore
              .getState()
              .upsertLeaderboardEntry(data as unknown as LeaderboardEntry);
          }
        },
      )
      .subscribe();
  }

  /**
   * Cleans up subscription.
   */
  unsubscribe() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}

export const leaderboardService = new LeaderboardRealtimeService();
