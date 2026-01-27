import { Recipe } from '@/models/recipe';
import { sortRecipesByMatch } from '@/utils/pantryMatcher';
import { useRecipeStore } from '@/stores/recipeStore';
import { usePantryStore } from '@/stores/pantryStore';

// ============================================================================
// PURE SELECTORS (Testable, Deterministic)
// ============================================================================

/**
 * Selects featured recipes based on engagement (reviews/rating).
 * Since we don't have a 'views' field yet, we use reviews count as a proxy for popularity.
 * Returns top 5 recipes.
 */
export const selectFeaturedRecipes = (recipes: Recipe[]): Recipe[] => {
  return [...recipes]
    .sort((a, b) => {
      const reviewsA = a.reviews || 0;
      const reviewsB = b.reviews || 0;
      if (reviewsB !== reviewsA) return reviewsB - reviewsA;
      
      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      return ratingB - ratingA;
    })
    .slice(0, 5);
};

/**
 * Selects a deterministic "Recipe of the Day" based on the current date.
 * Uses a pseudo-random seed derived from YYYYMMDD to pick a recipe.
 */
export const selectRecipeOfTheDay = (recipes: Recipe[]): Recipe | null => {
  if (recipes.length === 0) return null;

  const today = new Date();
  // Seed = YYYYMMDD
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  // Simple LCG-like step to mix bits or just modulo
  // We want it to be stable for the whole day
  const index = seed % recipes.length;
  
  return recipes[index];
};

/**
 * Selects recipes that match the user's pantry ingredients with >= 60% match rate.
 */
export const selectPantryReadyRecipes = (
  recipes: Recipe[], 
  pantryIngredients: string[]
) => {
  return sortRecipesByMatch(pantryIngredients, recipes, 60);
};

// ============================================================================
// HOOKS (Connects Stores to Selectors)
// ============================================================================

/**
 * Custom hook to get all Home screen data in one go.
 * Reactive to store changes.
 */
export const useHomeData = () => {
  const recipes = useRecipeStore((state) => state.recipes);
  const pantry = usePantryStore((state) => state.pantry);

  const featuredRecipes = selectFeaturedRecipes(recipes);
  const recipeOfTheDay = selectRecipeOfTheDay(recipes);
  // Note: This calculation might be expensive if recipe list is huge. 
  // In a real app, we might want to memoize this or debounce updates.
  const pantryReadyRecipes = selectPantryReadyRecipes(recipes, pantry);

  return {
    featuredRecipes,
    recipeOfTheDay,
    pantryReadyRecipes,
  };
};
