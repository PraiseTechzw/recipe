import { processGamificationEvent } from "@/engines/gamificationEngine";
import {
    ExtendedUserStats,
    GamificationEvent,
    GamificationEventPayload,
    GamificationEventType,
    UserGamificationState,
} from "@/types/gamification";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const generateAvatarSeed = () => Math.random().toString(36).substring(7);

const getStartOfWeek = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface GamificationState extends UserGamificationState {
  // Identity
  chefId: string | null;
  chefName: string | null;
  avatarSeed: string | null;

  // Weekly Tracking
  weeklyXp: number;
  lastWeekSync: string; // ISO string of start of week (Monday)

  // Actions
  initChefIdentity: () => void;
  setChefName: (name: string) => void;
  applyGamificationEvent: (
    type: GamificationEventType,
    payload: GamificationEventPayload,
  ) => { xpAwarded: number; messages: string[] };
  computeWeeklyResetIfNeeded: () => void;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      // Initial State
      chefId: null,
      chefName: null,
      avatarSeed: null,
      xp: 0,
      level: 1,
      achievements: [],
      weeklyXp: 0,
      lastWeekSync: getStartOfWeek().toISOString(),
      stats: {
        recipesCompleted: 0,
        streakDays: 0,
        lastCookDate: null,
        pantryMatches: 0,
        reviewsCount: 0,
        cuisinesCount: 0,
        totalCooks: 0,
        shares: 0,
        favorites: 0,
        healthyCount: 0,
        dessertCount: 0,
        cookedCuisines: [] as string[],
      } as ExtendedUserStats,

      // Actions
      initChefIdentity: () => {
        const state = get();
        if (!state.chefId) {
          // Generate a simple UUID-like string
          const newId =
            "chef_" +
            Date.now().toString(36) +
            Math.random().toString(36).substr(2, 9);
          set({ chefId: newId });
        }

        if (!state.avatarSeed) {
          set({ avatarSeed: generateAvatarSeed() });
        }
      },

      setChefName: (name: string) => set({ chefName: name }),

      applyGamificationEvent: (type, payload) => {
        const currentState = get();

        // 1. Check for weekly reset before processing
        get().computeWeeklyResetIfNeeded();

        // 2. Process Event via Engine
        const event: GamificationEvent = { type, payload };
        const result = processGamificationEvent(currentState, event);

        // 3. Update State
        set({
          xp: result.newState.xp,
          level: result.newState.level,
          achievements: result.newState.achievements,
          stats: result.newState.stats,
          weeklyXp: currentState.weeklyXp + result.xpAwarded,
        });

        return {
          xpAwarded: result.xpAwarded,
          messages: result.messages,
        };
      },

      computeWeeklyResetIfNeeded: () => {
        const state = get();
        const currentWeekStart = getStartOfWeek().toISOString();

        if (state.lastWeekSync !== currentWeekStart) {
          set({
            weeklyXp: 0,
            lastWeekSync: currentWeekStart,
          });
        }
      },
    }),
    {
      name: "gamification-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        chefId: state.chefId,
        chefName: state.chefName,
        avatarSeed: state.avatarSeed,
        xp: state.xp,
        level: state.level,
        achievements: state.achievements,
        weeklyXp: state.weeklyXp,
        lastWeekSync: state.lastWeekSync,
        stats: state.stats,
      }),
    },
  ),
);

// ============================================================================
// HELPERS
// ============================================================================

function getStartOfWeek() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
