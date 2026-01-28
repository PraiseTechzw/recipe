import { supabase } from "@/lib/supabase";
import { LeaderboardEntry, useStore } from "@/store/useStore";
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

      store.setTopWeekly((weekly || []) as unknown as LeaderboardEntry[]);

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

      store.setTopAllTime((allTime || []) as unknown as LeaderboardEntry[]);
      store.setLeaderboardLastUpdated(Date.now());
    } catch (err: any) {
      console.error("Leaderboard fetch error:", err);
      store.setLeaderboardError(err.message || "Failed to fetch leaderboard");
      // Keep existing data in store (offline support) if fetch fails
    } finally {
      store.setLeaderboardLoading(false);
    }
  }

  /**
   * Fetches "Around Me" - entries with scores just above and below the current user.
   * Also calculates the user's exact rank.
   */
  async fetchAroundMe(myChefId: string, sortBy: "weekly_xp" | "total_xp") {
    const store = useStore.getState();

    try {
      // 1. Fetch Me to get accurate XP
      const { data: me } = await supabase
        .from("leaderboard")
        .select(`*, chefs (chef_name, avatar_seed, country)`)
        .eq("chef_id", myChefId)
        .single();

      if (!me) return;
      const myXp = me[sortBy];

      // 2. Fetch 2 above (people with MORE xp, closest to me)
      const { data: above } = await supabase
        .from("leaderboard")
        .select(`*, chefs (chef_name, avatar_seed, country)`)
        .gt(sortBy, myXp)
        .order(sortBy, { ascending: true })
        .limit(2);

      // 3. Fetch 2 below (people with LESS or EQUAL xp, closest to me)
      const { data: below } = await supabase
        .from("leaderboard")
        .select(`*, chefs (chef_name, avatar_seed, country)`)
        .lte(sortBy, myXp)
        .neq("chef_id", myChefId)
        .order(sortBy, { ascending: false })
        .limit(2);

      const neighbors = [...(above || []).reverse(), me, ...(below || [])];

      store.setNeighbors(neighbors as unknown as LeaderboardEntry[]);

      // 4. Calculate Rank
      const { count } = await supabase
        .from("leaderboard")
        .select("*", { count: "exact", head: true })
        .gt(sortBy, myXp);

      store.setUserRank((count || 0) + 1);
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
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          useStore.getState().setLeaderboardLive(true);
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          useStore.getState().setLeaderboardLive(false);
        }
      });
  }

  /**
   * Cleans up subscription.
   */
  unsubscribe() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
      useStore.getState().setLeaderboardLive(false);
    }
  }
}

export const leaderboardService = new LeaderboardRealtimeService();
