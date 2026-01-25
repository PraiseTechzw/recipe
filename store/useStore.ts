import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { BADGES, getLevel } from '../constants/gamification';
import { IngredientItem, ShoppingItem } from '../models/recipe';

interface UserStats {
  recipesCooked: number;
  savedRecipes: number;
  sharedRecipes: number;
  daysStreak: number;
  lastCookDate?: string;
}

interface AppState {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  // User Recipes
  myRecipes: Recipe[];
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  
  // Shopping List
  shoppingList: ShoppingItem[];
  addToShoppingList: (ingredients: IngredientItem[]) => void;
  toggleShoppingItem: (id: string) => void;
  removeFromShoppingList: (id: string) => void;
  clearShoppingList: () => void;

  // Pantry & Onboarding
  pantry: string[];
  setPantry: (ingredients: string[]) => void;
  hasOnboarded: boolean;
  setHasOnboarded: (val: boolean) => void;

  // User Profile & Gamification
  userProfile: {
    id: string;
    name: string;
    chefLevel: string;
    xp: number;
    badges: string[];
    dietaryPreferences: string[];
    pushToken?: string;
    avatar?: string;
    bio?: string;
    stats: UserStats;
  };
  setUserProfile: (profile: Partial<AppState['userProfile']>) => void;
  addXP: (amount: number) => void;
  checkBadges: () => void;
  unlockBadge: (badgeId: string) => void;
  incrementStat: (stat: keyof UserStats, amount?: number) => void;

  // Intelligence & Analytics
  viewHistory: string[]; // List of recipe IDs viewed
  categoryScores: Record<string, number>; // Category name -> interaction score
  logRecipeView: (id: string, category: string) => void;

  // Session
  sessionStartTime: number;
  setSessionStartTime: (time: number) => void;

  // Settings
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  locale: string;
  setLocale: (locale: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (id) => {
        set((state) => {
          const isFav = state.favorites.includes(id);
          return {
            favorites: isFav 
              ? state.favorites.filter((favId) => favId !== id)
              : [...state.favorites, id]
          };
        });
        get().checkBadges();
      },
      isFavorite: (id) => get().favorites.includes(id),

      // User Recipes
      myRecipes: [],
      addRecipe: (recipe) => set((state) => ({
        myRecipes: [recipe, ...state.myRecipes]
      })),
      updateRecipe: (id, updates) => set((state) => ({
        myRecipes: state.myRecipes.map(r => r.id === id ? { ...r, ...updates } : r)
      })),
      deleteRecipe: (id) => set((state) => ({
        myRecipes: state.myRecipes.filter(r => r.id !== id)
      })),
      
      // Shopping List
      shoppingList: [],
      addToShoppingList: (ingredients) => set((state) => {
        const newItems = ingredients.map(ing => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: ing.name,
            quantity: ing.quantity,
            checked: false
        }));
        return { shoppingList: [...state.shoppingList, ...newItems] };
      }),
      toggleShoppingItem: (id) => set((state) => ({
        shoppingList: state.shoppingList.map(item => 
            item.id === id ? { ...item, checked: !item.checked } : item
        )
      })),
      removeFromShoppingList: (id) => set((state) => ({
        shoppingList: state.shoppingList.filter(item => item.id !== id)
      })),
      clearShoppingList: () => set({ shoppingList: [] }),

      // Pantry
      pantry: [],
      setPantry: (ingredients) => set({ pantry: ingredients }),
      hasOnboarded: false,
      setHasOnboarded: (val) => set({ hasOnboarded: val }),

      // User Profile & Gamification
      userProfile: {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: 'Guest',
        chefLevel: 'Beginner',
        xp: 0,
        badges: [],
        dietaryPreferences: [],
        stats: {
          recipesCooked: 0,
          savedRecipes: 0,
          sharedRecipes: 0,
          daysStreak: 0
        }
      },
      setUserProfile: (profile) => set((state) => ({
        userProfile: { ...state.userProfile, ...profile }
      })),
      addXP: (amount) => set((state) => {
        const newXP = state.userProfile.xp + amount;
        const newLevel = getLevel(newXP);
        return { 
          userProfile: { 
            ...state.userProfile, 
            xp: newXP, 
            chefLevel: newLevel.title 
          } 
        };
      }),
      incrementStat: (stat, amount = 1) => {
        set((state) => {
          const currentStats = state.userProfile.stats || {
            recipesCooked: 0,
            savedRecipes: 0,
            sharedRecipes: 0,
            daysStreak: 0
          };
          
          let newStats = { ...currentStats };

          if (stat === 'recipesCooked') {
            const today = new Date().toISOString().split('T')[0];
            const lastDate = currentStats.lastCookDate;
            
            if (lastDate !== today) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                
                if (lastDate === yesterdayStr) {
                    newStats.daysStreak = (currentStats.daysStreak || 0) + 1;
                } else {
                    newStats.daysStreak = 1;
                }
                newStats.lastCookDate = today;
            }
          }
          
          newStats[stat] = (newStats[stat] || 0) + amount;
          return { userProfile: { ...state.userProfile, stats: newStats } };
        });
        get().checkBadges();
      },
      unlockBadge: (badgeId) => set((state) => {
        if (state.userProfile.badges.includes(badgeId)) return {};
        
        // Add XP for badge
        const badge = BADGES.find(b => b.id === badgeId);
        if (badge) {
            // We can't call get().addXP here safely inside set if we want to avoid recursion issues or strict mode warnings, 
            // but we can just update XP manually here.
            const newXP = state.userProfile.xp + badge.xpReward;
            const newLevel = getLevel(newXP);
            
            return { 
                userProfile: { 
                    ...state.userProfile, 
                    badges: [...state.userProfile.badges, badgeId],
                    xp: newXP,
                    chefLevel: newLevel.title
                } 
            };
        }
        
        return { userProfile: { ...state.userProfile, badges: [...state.userProfile.badges, badgeId] } };
      }),
      checkBadges: () => {
        const state = get();
        const { stats, xp, badges } = state.userProfile;
        const currentStats = stats || { recipesCooked: 0, savedRecipes: 0, sharedRecipes: 0, daysStreak: 0 };
        
        BADGES.forEach(badge => {
            if (badges.includes(badge.id)) return;
            
            let unlocked = false;
            switch(badge.id) {
                case 'first_cook':
                    if (currentStats.recipesCooked >= 1) unlocked = true;
                    break;
                case 'week_streak':
                    if (currentStats.daysStreak >= 7) unlocked = true;
                    break;
                case 'collector':
                    if (state.favorites.length >= 20) unlocked = true;
                    break;
                case 'master_chef':
                     if (getLevel(xp).level >= 10) unlocked = true;
                     break;
            }
            
            if (unlocked) {
                state.unlockBadge(badge.id);
            }
        });
      },

      // Theme
      isDarkMode: false,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      // Analytics
      viewHistory: [],
      categoryScores: {},
      logRecipeView: (id, category) => set((state) => {
        // Add to history (limit to last 20)
        const newHistory = [id, ...state.viewHistory.filter(rid => rid !== id)].slice(0, 20);
        
        // Increment category score
        const currentScore = state.categoryScores[category] || 0;
        const newScores = { ...state.categoryScores, [category]: currentScore + 1 };
        
        return {
            viewHistory: newHistory,
            categoryScores: newScores
        };
      }),

      sessionStartTime: Date.now(),
      setSessionStartTime: (time) => set({ sessionStartTime: time }),

      // Settings
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      locale: 'en',
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'recipe-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
