import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { BADGES, LEVELS } from '@/constants/gamification';

export interface UserStats {
  recipesCooked: number;
  savedRecipes: number;
  sharedRecipes: number;
  daysStreak: number;
  lastCookDate?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  chefLevel: string;
  xp: number;
  badges: string[];
  dietaryPreferences: string[];
  avatar?: string;
  bio?: string;
  stats: UserStats;
}

interface UserState {
  // Profile
  userProfile: UserProfile;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  
  // Preferences
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  locale: string;
  setLocale: (locale: string) => void;
  hasOnboarded: boolean;
  setHasOnboarded: (val: boolean) => void;

  // Gamification
  addXP: (amount: number) => void;
  unlockBadge: (badgeId: string) => void;
  incrementStat: (stat: keyof UserStats, amount?: number) => void;
  
  // Analytics/History
  viewHistory: string[];
  categoryScores: Record<string, number>;
  logRecipeView: (id: string, category: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userProfile: {
        id: 'guest_user', // Default ID for name-only user
        name: 'Guest',
        chefLevel: 'Beginner',
        xp: 0,
        badges: [],
        dietaryPreferences: [],
        stats: {
          recipesCooked: 0,
          savedRecipes: 0,
          sharedRecipes: 0,
          daysStreak: 0,
        },
      },
      setUserProfile: (updates) => set((state) => ({
        userProfile: { ...state.userProfile, ...updates }
      })),

      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      
      locale: 'en',
      setLocale: (locale) => set({ locale }),
      
      hasOnboarded: false,
      setHasOnboarded: (val) => set({ hasOnboarded: val }),

      addXP: (amount) => set((state) => {
        const newXP = state.userProfile.xp + amount;
        // Check level up logic could go here or in a separate helper
        // For now just update XP and Level
        let newLevel = state.userProfile.chefLevel;
        for (const level of LEVELS) {
            if (newXP >= level.minXP) {
                newLevel = level.title;
            }
        }
        
        return {
          userProfile: {
            ...state.userProfile,
            xp: newXP,
            chefLevel: newLevel
          }
        };
      }),

      unlockBadge: (badgeId) => set((state) => {
        if (state.userProfile.badges.includes(badgeId)) return state;
        return {
          userProfile: {
            ...state.userProfile,
            badges: [...state.userProfile.badges, badgeId]
          }
        };
      }),

      incrementStat: (stat, amount = 1) => set((state) => ({
        userProfile: {
          ...state.userProfile,
          stats: {
            ...state.userProfile.stats,
            [stat]: state.userProfile.stats[stat] + amount
          }
        }
      })),

      viewHistory: [],
      categoryScores: {},
      logRecipeView: (id, category) => set((state) => {
        const newHistory = [id, ...state.viewHistory.filter(i => i !== id)].slice(0, 50);
        const newScores = { ...state.categoryScores };
        newScores[category] = (newScores[category] || 0) + 1;
        return {
          viewHistory: newHistory,
          categoryScores: newScores
        };
      }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
