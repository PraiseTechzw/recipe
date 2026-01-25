import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '../models/recipe';

interface AppState {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  
  // Analytics session start time
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
      
      sessionStartTime: Date.now(),
      setSessionStartTime: (time) => set({ sessionStartTime: time }),
    }),
    {
      name: 'recipe-app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
