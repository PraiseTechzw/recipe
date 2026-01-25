import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { IngredientItem, ShoppingItem } from '../models/recipe';

interface AppState {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  
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
    name: string;
    chefLevel: 'Beginner' | 'Home Cook' | 'Pro';
    xp: number;
    badges: string[];
    dietaryPreferences: string[];
    avatar?: string;
  };
  setUserProfile: (profile: Partial<AppState['userProfile']>) => void;
  addXP: (amount: number) => void;
  unlockBadge: (badgeId: string) => void;

  // Intelligence & Analytics
  viewHistory: string[]; // List of recipe IDs viewed
  categoryScores: Record<string, number>; // Category name -> interaction score
  logRecipeView: (id: string, category: string) => void;

  // Session
  sessionStartTime: number;
  setSessionStartTime: (time: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (id) => set((state) => {
        const isFav = state.favorites.includes(id);
        return {
          favorites: isFav 
            ? state.favorites.filter((favId) => favId !== id)
            : [...state.favorites, id]
        };
      }),
      isFavorite: (id) => get().favorites.includes(id),
      
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
        name: 'Guest',
        chefLevel: 'Beginner',
        xp: 0,
        badges: [],
        dietaryPreferences: []
      },
      setUserProfile: (profile) => set((state) => ({
        userProfile: { ...state.userProfile, ...profile }
      })),
      addXP: (amount) => set((state) => {
        const newXP = state.userProfile.xp + amount;
        // Simple level up logic could go here
        return { userProfile: { ...state.userProfile, xp: newXP } };
      }),
      unlockBadge: (badgeId) => set((state) => {
        if (state.userProfile.badges.includes(badgeId)) return {};
        return { userProfile: { ...state.userProfile, badges: [...state.userProfile.badges, badgeId] } };
      }),

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
    }),
    {
      name: 'recipe-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
