import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { BADGES, getLevel } from "../constants/gamification";
import { NotificationService } from "../services/notificationService";
import { RECIPES } from "../data/recipes";
import { supabase } from "../lib/supabase";
import {
    IngredientItem,
    IngredientSection,
    Recipe,
    ShoppingItem,
    Step,
} from "../models/recipe";

export interface Category {
  id: string;
  name: string;
}

export interface IngredientOption {
  id: string;
  key: string;
  icon: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string; // ISO string or relative time
  read: boolean;
  type: "recipe" | "achievement" | "news" | "system";
  data?: any; // For navigation or other actions
}

export interface UserStats {
  recipesCooked: number;
  savedRecipes: number;
  sharedRecipes: number;
  daysStreak: number;
  lastCookDate?: string;
}

interface SupabaseRecipe {
  id: string;
  original_id?: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  tags: string[];
  time: string;
  servings: number;
  calories: string;
  ingredients: IngredientSection[];
  steps: Step[];
  is_traditional: boolean;
  rating: number;
  author?: {
    name: string;
    avatar_url: string;
  };
}

export interface LeaderboardEntry {
  chef_id: string;
  total_xp: number;
  weekly_xp: number;
  level: number;
  chefs?: {
    chef_name: string;
    avatar_seed: string;
    country: string;
  };
}

interface AppState {
  favorites: string[];
  xpRewardedFavoriteIds: string[];
  toggleFavorite: (id: string) => number;
  isFavorite: (id: string) => boolean;

  // Configuration
  categories: Category[];
  commonIngredients: IngredientOption[];
  dietaryOptions: string[];
  experienceLevels: string[];

  // Global Recipes (from Supabase)
  recipes: Recipe[];
  fetchRecipes: () => Promise<void>;

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
  resetForLogout: () => void;
  hasTriggeredReviewPrompt: boolean;

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
  setUserProfile: (profile: Partial<AppState["userProfile"]>) => void;
  addXP: (amount: number) => void;
  checkBadges: () => void;
  unlockBadge: (badgeId: string) => void;
  incrementStat: (
    stat: Exclude<keyof UserStats, "lastCookDate">,
    amount?: number,
  ) => void;

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

  // Notifications
  notificationPreferences: {
    dailyReminder: boolean;
    weeklyLeaderboard: boolean;
    newBadges: boolean;
    newRecipes: boolean;
  };
  setNotificationPreferences: (
    prefs: Partial<AppState["notificationPreferences"]>,
  ) => void;
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "read" | "time">,
  ) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;

  // Leaderboard
  topWeekly: LeaderboardEntry[];
  topAllTime: LeaderboardEntry[];
  neighbors: LeaderboardEntry[];
  userRank: number | null;
  isLeaderboardLoading: boolean;
  leaderboardError: string | null;
  isLeaderboardLive: boolean;
  leaderboardLastUpdated: number;
  setTopWeekly: (entries: LeaderboardEntry[]) => void;
  setTopAllTime: (entries: LeaderboardEntry[]) => void;
  setNeighbors: (entries: LeaderboardEntry[]) => void;
  setUserRank: (rank: number | null) => void;
  upsertLeaderboardEntry: (entry: LeaderboardEntry) => void;
  setLeaderboardLoading: (loading: boolean) => void;
  setLeaderboardError: (error: string | null) => void;
  setLeaderboardLive: (live: boolean) => void;
  setLeaderboardLastUpdated: (time: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      favorites: [],
      xpRewardedFavoriteIds: [],
      toggleFavorite: (id: string) => {
        let awardedXP = 0;
        set((state) => {
          const isFav = state.favorites.includes(id);
          if (isFav) return { favorites: state.favorites.filter((favId) => favId !== id) };

          const rewardedIds = state.xpRewardedFavoriteIds ?? [];
          if (rewardedIds.includes(id)) return { favorites: [...state.favorites, id] };

          awardedXP = 5;
          const xp = state.userProfile.xp + awardedXP;
          const stats = state.userProfile.stats ?? { recipesCooked: 0, savedRecipes: 0, sharedRecipes: 0, daysStreak: 0 };
          return {
            favorites: [...state.favorites, id],
            xpRewardedFavoriteIds: [...rewardedIds, id],
            userProfile: {
              ...state.userProfile,
              xp,
              chefLevel: getLevel(xp).title,
              stats: { ...stats, savedRecipes: (stats.savedRecipes ?? 0) + 1 },
            },
          };
        });
        get().checkBadges();
        return awardedXP;
      },
      isFavorite: (id: string) => get().favorites.includes(id),

      // Configuration
      categories: [
        { id: "1", name: "Grains" },
        { id: "2", name: "Relishes" },
        { id: "3", name: "Meats" },
        { id: "4", name: "Drinks" },
        { id: "5", name: "Stew" },
        { id: "6", name: "Vegetarian" },
        { id: "7", name: "Dinner" },
        { id: "8", name: "Traditional" },
      ],
      commonIngredients: [
        { id: "mealie-meal", key: "mealieMeal", icon: "🍚" },
        { id: "beef", key: "beef", icon: "🥩" },
        { id: "chicken", key: "chicken", icon: "🍗" },
        { id: "tomatoes", key: "tomatoes", icon: "🍅" },
        { id: "onions", key: "onions", icon: "🧅" },
        { id: "greens", key: "greens", icon: "🥬" },
        { id: "peanut-butter", key: "peanutButter", icon: "🥜" },
        { id: "kapenta", key: "kapenta", icon: "🐟" },
        { id: "beans", key: "beans", icon: "🫘" },
        { id: "oil", key: "oil", icon: "🫗" },
        { id: "salt", key: "salt", icon: "🧂" },
        { id: "garlic", key: "garlic", icon: "🧄" },
        { id: "rice", key: "rice", icon: "🍚" },
        { id: "maize", key: "maize", icon: "🌽" },
        { id: "sorghum", key: "sorghum", icon: "🌾" },
        { id: "groundnuts", key: "groundnuts", icon: "🥜" },
        { id: "sweet-potatoes", key: "sweetPotatoes", icon: "🍠" },
        { id: "pumpkin", key: "pumpkin", icon: "🎃" },
        { id: "potatoes", key: "potatoes", icon: "🥔" },
        { id: "fish", key: "fish", icon: "🐟" },
        { id: "mopane-worms", key: "mopaneWorms", icon: "🥘" },
        { id: "eggs", key: "eggs", icon: "🥚" },
        { id: "milk", key: "milk", icon: "🥛" },
        { id: "flour", key: "flour", icon: "🌾" },
        { id: "sugar", key: "sugar", icon: "🍬" },
        { id: "ginger", key: "ginger", icon: "🫚" },
        { id: "green-pepper", key: "greenPepper", icon: "🫑" },
        { id: "carrots", key: "carrots", icon: "🥕" },
        { id: "spinach", key: "spinach", icon: "🥬" },
        { id: "cabbage", key: "cabbage", icon: "🥬" },
      ],
      dietaryOptions: ["Vegetarian", "Vegan", "Gluten-Free", "Halal", "None"],
      experienceLevels: ["Beginner", "Home Cook", "Pro"],

      // Global Recipes
      recipes: RECIPES,
      fetchRecipes: async () => {
        try {
          const { data, error } = await supabase.from("recipes").select(`
                    *,
                    author:author_id (
                        name,
                        avatar_url
                    )
                `);
          // We can filter by author_id if we only want official ones,
          // or fetch all public recipes. User asked for "Top Zimbabwean Recipes by Praise Masunga"
          // but "also sync them with cloud".
          // Let's fetch all recipes that are NOT current user's (since those are in myRecipes)
          // Actually, let's just fetch everything for now and maybe filter in UI.
          // But for "Top Recipes", let's assume they are the ones from Praise Masunga.
          // .eq('author_id', 'praisetechzw');

          if (error) {
            console.log("Supabase fetch error:", error.message);
            return;
          }

          if (data && data.length > 0) {
            const mappedRecipes: Recipe[] = data.map((r: SupabaseRecipe) => ({
              id: r.original_id || r.id,
              remoteId: r.id,
              title: r.title,
              description: r.description,
              image: r.image_url,
              category: r.category,
              tags: r.tags,
              time: r.time,
              servings: r.servings,
              calories: r.calories,
              ingredients: r.ingredients,
              steps: r.steps,
              isTraditional: r.is_traditional,
              rating: Number(r.rating),
              author: {
                name: r.author?.name || "Chef",
                avatar: r.author?.avatar_url || "https://i.pravatar.cc/150",
              },
            }));

            // We want to combine these with local recipes or just use these?
            // The prompt says "create... and sync them".
            // If we replace `recipes` with fetched data, we get the cloud version.
            const previousRecipes = get().recipes;
            const previousIds = new Set(previousRecipes.map((recipe) => recipe.id));
            const mergedRecipes = new Map(previousRecipes.map((recipe) => [recipe.id, recipe]));
            mappedRecipes.forEach((recipe) => mergedRecipes.set(recipe.id, recipe));
            set({ recipes: Array.from(mergedRecipes.values()) });
            const firstNewRecipe = previousRecipes.length > 0
              ? mappedRecipes.find((recipe) => !previousIds.has(recipe.id))
              : undefined;
            if (firstNewRecipe) {
              get().addNotification({
                title: "New recipes added",
                message: `${firstNewRecipe.title} is ready to explore.`,
                type: "recipe",
                data: { recipeId: firstNewRecipe.id },
              });
            }
          }
        } catch (e) {
          console.log("Error in fetchRecipes:", e);
        }
      },

      // User Recipes
      myRecipes: [],
      addRecipe: (recipe) =>
        set((state) => ({
          myRecipes: [recipe, ...state.myRecipes],
        })),
      updateRecipe: (id, updates) =>
        set((state) => ({
          myRecipes: state.myRecipes.map((r) =>
            r.id === id ? { ...r, ...updates } : r,
          ),
        })),
      deleteRecipe: (id) =>
        set((state) => ({
          myRecipes: state.myRecipes.filter((r) => r.id !== id),
        })),

      // Shopping List
      shoppingList: [],
      addToShoppingList: (ingredients: IngredientItem[]) =>
        set((state) => {
          const newItems = ingredients.map((ing) => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: ing.name,
            quantity: ing.quantity,
            checked: false,
          }));
          return { shoppingList: [...state.shoppingList, ...newItems] };
        }),
      toggleShoppingItem: (id: string) =>
        set((state) => ({
          shoppingList: state.shoppingList.map((item) =>
            item.id === id ? { ...item, checked: !item.checked } : item,
          ),
        })),
      removeFromShoppingList: (id: string) =>
        set((state) => ({
          shoppingList: state.shoppingList.filter((item) => item.id !== id),
        })),
      clearShoppingList: () => set({ shoppingList: [] }),

      // Pantry
      pantry: [],
      setPantry: (ingredients: string[]) => set({ pantry: ingredients }),
      hasOnboarded: false,
      setHasOnboarded: (val: boolean) => set({ hasOnboarded: val }),
      resetForLogout: () => set({
        favorites: [],
        xpRewardedFavoriteIds: [],
        myRecipes: [],
        shoppingList: [],
        pantry: [],
        hasOnboarded: false,
        userProfile: {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: "Guest",
          chefLevel: "Beginner",
          xp: 0,
          badges: [],
          dietaryPreferences: [],
          stats: { recipesCooked: 0, savedRecipes: 0, sharedRecipes: 0, daysStreak: 0 },
        },
        notifications: [],
        viewHistory: [],
        categoryScores: {},
        neighbors: [],
        userRank: null,
        leaderboardError: null,
        isLeaderboardLive: false,
      }),
      hasTriggeredReviewPrompt: false,

      // User Profile & Gamification
      userProfile: {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: "Guest",
        chefLevel: "Beginner",
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
      setUserProfile: (profile) =>
        set((state) => ({
          userProfile: { ...state.userProfile, ...profile },
        })),
      addXP: (amount) =>
        set((state) => {
          const newXP = state.userProfile.xp + amount;
          const newLevel = getLevel(newXP);
          return {
            userProfile: {
              ...state.userProfile,
              xp: newXP,
              chefLevel: newLevel.title,
            },
          };
        }),
      incrementStat: (stat, amount = 1) => {
        set((state) => {
          const currentStats = state.userProfile.stats || {
            recipesCooked: 0,
            savedRecipes: 0,
            sharedRecipes: 0,
            daysStreak: 0,
          };

          let newStats = { ...currentStats };

          if (stat === "recipesCooked") {
            const today = new Date().toISOString().split("T")[0];
            const lastDate = currentStats.lastCookDate;

            if (lastDate !== today) {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split("T")[0];

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
      unlockBadge: (badgeId) => {
        if (get().userProfile.badges.includes(badgeId)) return;
        const badge = BADGES.find((item) => item.id === badgeId);
        set((state) => {
          const newXP = state.userProfile.xp + (badge?.xpReward ?? 0);
          return {
            userProfile: {
              ...state.userProfile,
              badges: [...state.userProfile.badges, badgeId],
              xp: newXP,
              chefLevel: getLevel(newXP).title,
            },
          };
        });
        get().addNotification({
          title: "Badge unlocked",
          message: badge?.name ?? "You earned a new chef badge.",
          type: "achievement",
        });
      },
      checkBadges: () => {
        const state = get();
        const { stats, xp, badges } = state.userProfile;
        const currentStats = stats || {
          recipesCooked: 0,
          savedRecipes: 0,
          sharedRecipes: 0,
          daysStreak: 0,
        };

        BADGES.forEach((badge) => {
          if (badges.includes(badge.id)) return;

          let unlocked = false;
          switch (badge.id) {
            case "first_cook":
              if (currentStats.recipesCooked >= 1) unlocked = true;
              break;
            case "week_streak":
              if (currentStats.daysStreak >= 7) unlocked = true;
              break;
            case "collector":
              if (state.favorites.length >= 20) unlocked = true;
              break;
            case "master_chef":
              if (getLevel(xp).level >= 10) unlocked = true;
              break;
          }

          if (unlocked) {
            state.unlockBadge(badge.id);
          }
        });
      },

      // Analytics
      viewHistory: [],
      categoryScores: {},
      logRecipeView: (id: string, category: string) =>
        set((state) => {
          // Add to history (limit to last 20)
          const newHistory = [
            id,
            ...state.viewHistory.filter((rid) => rid !== id),
          ].slice(0, 20);

          // Increment category score
          const currentScore = state.categoryScores[category] || 0;
          const newScores = {
            ...state.categoryScores,
            [category]: currentScore + 1,
          };

          return {
            viewHistory: newHistory,
            categoryScores: newScores,
          };
        }),

      sessionStartTime: Date.now(),
      setSessionStartTime: (time: number) => set({ sessionStartTime: time }),

      // Settings
      isDarkMode: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      locale: "en",
      setLocale: (locale: string) => set({ locale }),

      // Notifications
      notificationPreferences: {
        dailyReminder: false,
        weeklyLeaderboard: true,
        newBadges: true,
        newRecipes: true,
      },
      setNotificationPreferences: (
        prefs: Partial<AppState["notificationPreferences"]>,
      ) =>
        set((state) => ({
          notificationPreferences: {
            ...state.notificationPreferences,
            ...prefs,
          },
        })),
      notifications: [],
      addNotification: (notification: Omit<Notification, "id" | "read" | "time">) => {
        set((state) => ({
          notifications: [
            {
              id: Date.now().toString(),
              read: false,
              time: new Date().toISOString(),
              ...notification,
            },
            ...state.notifications,
          ],
        }));
        const preferences = get().notificationPreferences;
        const shouldSendLocal =
          (notification.type === "achievement" && preferences.newBadges) ||
          (notification.type === "recipe" && preferences.newRecipes);
        if (shouldSendLocal) {
          void NotificationService.sendLocalNotification(notification.title, notification.message)
            .catch((error) => console.warn("Could not show local notification", error));
        }
      },
      markNotificationAsRead: (id: string) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),
      markAllNotificationsAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      clearNotifications: () => set({ notifications: [] }),

      // Leaderboard
      topWeekly: [],
      topAllTime: [],
      neighbors: [],
      userRank: null,
      isLeaderboardLoading: false,
      leaderboardError: null,
      isLeaderboardLive: false,
      leaderboardLastUpdated: 0,
      setTopWeekly: (entries: LeaderboardEntry[]) =>
        set({ topWeekly: entries }),
      setTopAllTime: (entries: LeaderboardEntry[]) =>
        set({ topAllTime: entries }),
      setNeighbors: (entries: LeaderboardEntry[]) =>
        set({ neighbors: entries }),
      setUserRank: (rank: number | null) => set({ userRank: rank }),
      upsertLeaderboardEntry: (entry: LeaderboardEntry) =>
        set((state) => {
          // Update in weekly if present
          const weeklyIndex = state.topWeekly.findIndex(
            (e) => e.chef_id === entry.chef_id,
          );
          let newWeekly = [...state.topWeekly];
          if (weeklyIndex >= 0) {
            newWeekly[weeklyIndex] = { ...newWeekly[weeklyIndex], ...entry };
          }

          // Update in allTime if present
          const allTimeIndex = state.topAllTime.findIndex(
            (e) => e.chef_id === entry.chef_id,
          );
          let newAllTime = [...state.topAllTime];
          if (allTimeIndex >= 0) {
            newAllTime[allTimeIndex] = {
              ...newAllTime[allTimeIndex],
              ...entry,
            };
          }

          return { topWeekly: newWeekly, topAllTime: newAllTime };
        }),
      setLeaderboardLoading: (loading: boolean) =>
        set({ isLeaderboardLoading: loading }),
      setLeaderboardError: (error: string | null) =>
        set({ leaderboardError: error }),
      setLeaderboardLive: (live: boolean) => set({ isLeaderboardLive: live }),
      setLeaderboardLastUpdated: (time: number) =>
        set({ leaderboardLastUpdated: time }),
    }),
    {
      name: "recipe-app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Partial<AppState>;
        return {
          ...currentState,
          ...persisted,
          // These are app configuration, not user data. Always use the latest
          // shipped options so existing installs receive newly added choices.
          categories: currentState.categories,
          commonIngredients: currentState.commonIngredients,
          dietaryOptions: currentState.dietaryOptions,
          experienceLevels: currentState.experienceLevels,
        };
      },
    },
  ),
);
