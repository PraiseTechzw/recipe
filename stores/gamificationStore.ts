import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  UserGamificationState, 
  GamificationEventType, 
  GamificationEventPayload, 
  ExtendedUserStats 
} from '@/types/gamification';
import { processGamificationEvent } from '@/engines/gamificationEngine';

// ============================================================================
// TYPES
// ============================================================================

interface GamificationStoreState {
  // Identity
  chefId: string | null;
  chefName: string;

  // Gamification State (Persisted)
  xp: number;
  level: number;
  achievements: string[]; // IDs
  stats: ExtendedUserStats;

  // Time-based State
  weeklyXp: number;
  lastWeeklyReset: number; // Timestamp of last reset

  // Actions
  initChefIdentity: () => Promise<void>;
  setChefName: (name: string) => void;
  applyGamificationEvent: (type: GamificationEventType, payload: GamificationEventPayload) => void;
  computeWeeklyResetIfNeeded: () => void;
  
  // Debug/Dev
  resetGamification: () => void;
}

// ============================================================================
// HELPERS
// ============================================================================

const INITIAL_STATS: ExtendedUserStats = {
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
  cookedCuisines: [],
};

function generateUUID(): string {
  // Simple UUID v4 generator for offline identity
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getWeekNumber(d: Date): number {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

// ============================================================================
// STORE
// ============================================================================

export const useGamificationStore = create<GamificationStoreState>()(
  persist(
    (set, get) => ({
      chefId: null,
      chefName: 'Chef',
      xp: 0,
      level: 1,
      achievements: [],
      stats: INITIAL_STATS,
      weeklyXp: 0,
      lastWeeklyReset: Date.now(),

      initChefIdentity: async () => {
        const { chefId } = get();
        if (!chefId) {
          set({ chefId: generateUUID() });
        }
      },

      setChefName: (name) => {
        set({ chefName: name });
      },

      applyGamificationEvent: (type, payload) => {
        const state = get();
        
        // 1. Check for weekly reset before applying XP
        get().computeWeeklyResetIfNeeded();

        // 2. Construct current state for engine
        const currentGamificationState: UserGamificationState = {
          xp: state.xp,
          level: state.level,
          achievements: state.achievements,
          stats: state.stats
        };

        // 3. Process Event
        const result = processGamificationEvent(currentGamificationState, { type, payload });

        // 4. Update Store
        set((prev) => ({
          xp: result.newState.xp,
          level: result.newState.level,
          achievements: result.newState.achievements,
          stats: result.newState.stats as ExtendedUserStats,
          weeklyXp: prev.weeklyXp + result.xpAwarded,
        }));

        // Optional: In a real app, you might emit a toast here using the result.messages
        if (result.messages.length > 0) {
            console.log('[Gamification]', result.messages.join(' | '));
        }
      },

      computeWeeklyResetIfNeeded: () => {
        const { lastWeeklyReset } = get();
        const lastDate = new Date(lastWeeklyReset);
        const currentDate = new Date();
        
        const lastWeek = getWeekNumber(lastDate);
        const currentWeek = getWeekNumber(currentDate);
        
        // Reset if week number changed or it's been more than a week (handles year boundary roughly)
        // A simple check is: is it a different ISO week?
        // Note: This logic resets on first open of the new week.
        if (lastWeek !== currentWeek || currentDate.getFullYear() !== lastDate.getFullYear()) {
             set({
                 weeklyXp: 0,
                 lastWeeklyReset: Date.now()
             });
        }
      },

      resetGamification: () => {
        set({
            xp: 0,
            level: 1,
            achievements: [],
            stats: INITIAL_STATS,
            weeklyXp: 0,
            lastWeeklyReset: Date.now()
        });
      }
    }),
    {
      name: 'gamification-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
