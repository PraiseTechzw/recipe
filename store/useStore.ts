import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AppState {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  
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
