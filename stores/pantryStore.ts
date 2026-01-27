import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { IngredientItem, ShoppingItem } from '@/models/recipe';

interface PantryState {
  // Pantry (Ingredients user has)
  pantry: string[]; // List of ingredient IDs or keys
  setPantry: (ingredients: string[]) => void;
  addToPantry: (ingredient: string) => void;
  removeFromPantry: (ingredient: string) => void;

  // Shopping List (Ingredients user needs)
  shoppingList: ShoppingItem[];
  addToShoppingList: (ingredients: IngredientItem[]) => void;
  toggleShoppingItem: (id: string) => void;
  removeFromShoppingList: (id: string) => void;
  clearShoppingList: () => void;
}

export const usePantryStore = create<PantryState>()(
  persist(
    (set) => ({
      pantry: [],
      setPantry: (ingredients) => set({ pantry: ingredients }),
      addToPantry: (ingredient) => set((state) => ({
        pantry: state.pantry.includes(ingredient) ? state.pantry : [...state.pantry, ingredient]
      })),
      removeFromPantry: (ingredient) => set((state) => ({
        pantry: state.pantry.filter(i => i !== ingredient)
      })),

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
    }),
    {
      name: 'pantry-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
