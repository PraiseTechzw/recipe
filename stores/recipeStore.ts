import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { RECIPES } from '@/data/recipes';
import { Recipe } from '@/models/recipe';

interface RecipeState {
  // Global Recipes (Static + Fetched)
  recipes: Recipe[];
  setRecipes: (recipes: Recipe[]) => void;
  
  // User Created Recipes
  myRecipes: Recipe[];
  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;

  // Favorites
  favorites: string[]; // IDs
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      recipes: RECIPES,
      setRecipes: (recipes) => set({ recipes }),

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
    }),
    {
      name: 'recipe-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
