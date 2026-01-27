import { create } from 'zustand';

export interface LeaderboardEntry {
  chef_id: string;
  total_xp: number;
  weekly_xp: number;
  level: number;
  // Joins
  chefs?: {
    chef_name: string;
    avatar_seed: string;
    country: string;
  };
}

interface LeaderboardState {
  topWeekly: LeaderboardEntry[];
  topAllTime: LeaderboardEntry[];
  
  // "Around Me" might be separate or integrated. 
  // Storing it separately ensures we don't mess up the top lists.
  neighbors: LeaderboardEntry[]; 

  isLoading: boolean;
  error: string | null;

  // Actions
  setTopWeekly: (entries: LeaderboardEntry[]) => void;
  setTopAllTime: (entries: LeaderboardEntry[]) => void;
  setNeighbors: (entries: LeaderboardEntry[]) => void;
  
  // Merges a single updated row into existing lists if present
  upsertEntry: (entry: LeaderboardEntry) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useLeaderboardStore = create<LeaderboardState>((set) => ({
  topWeekly: [],
  topAllTime: [],
  neighbors: [],
  isLoading: false,
  error: null,

  setTopWeekly: (entries) => set({ topWeekly: entries }),
  setTopAllTime: (entries) => set({ topAllTime: entries }),
  setNeighbors: (entries) => set({ neighbors: entries }),

  upsertEntry: (entry) => set((state) => {
    // Helper to update a list
    const updateList = (list: LeaderboardEntry[], sortKey: 'weekly_xp' | 'total_xp') => {
      const exists = list.find(e => e.chef_id === entry.chef_id);
      
      let newList;
      if (exists) {
        // Update existing
        newList = list.map(e => e.chef_id === entry.chef_id ? { ...e, ...entry } : e);
      } else {
        // We generally don't add new entries from realtime unless they belong in the list
        // Realtime just sends the changed row. We don't know if it qualifies for top 50 
        // without comparing to the last item. 
        // For simplicity: if it's not in the list, ignore it OR re-fetch.
        // Here we'll only update if it exists to avoid visual jumping/inconsistencies.
        newList = list;
      }
      
      // Re-sort to maintain order
      return newList.sort((a, b) => b[sortKey] - a[sortKey]);
    };

    return {
      topWeekly: updateList(state.topWeekly, 'weekly_xp'),
      topAllTime: updateList(state.topAllTime, 'total_xp'),
      // Neighbors logic is tricky with realtime, often best to just re-fetch neighbors 
      // when own score changes, but we can attempt update.
      neighbors: state.neighbors.map(e => e.chef_id === entry.chef_id ? { ...e, ...entry } : e)
    };
  }),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
