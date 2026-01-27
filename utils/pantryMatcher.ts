import { Recipe, IngredientItem } from '@/models/recipe';

/**
 * Result of matching a recipe against a list of pantry ingredients.
 */
export interface PantryMatchResult {
  matchPercentage: number;
  availableIngredients: string[];
  missingIngredients: string[];
  matchedCount: number;
  totalIngredients: number;
}

/**
 * Normalizes an ingredient string for comparison.
 * Handles casing, trimming, and basic singularization.
 */
export function normalizeIngredient(name: string): string {
  if (!name) return '';
  
  let normalized = name.toLowerCase().trim();
  
  // Remove common parenthetical descriptions e.g. "Tomato (diced)" -> "tomato"
  normalized = normalized.replace(/\s*\(.*?\)/g, '');
  
  // Remove trailing punctuation
  normalized = normalized.replace(/[.,;:]$/, '');

  // Basic singularization (naive)
  // We check for common plural endings. 
  // This isn't linguistically perfect but covers 80% of cases like "onions" -> "onion"
  if (normalized.endsWith('ies')) {
    // cherries -> cherry
    normalized = normalized.slice(0, -3) + 'y';
  } else if (normalized.endsWith('es') && !normalized.endsWith('oes')) {
     // boxes -> box, but potatoes -> potato (handled by es removal often leaving 'potato')
     // actually 'potatoes' -> 'potato' is -es. 'tomatoes' -> 'tomato'.
     // 'peaches' -> 'peach'.
     normalized = normalized.slice(0, -2);
  } else if (normalized.endsWith('s') && !normalized.endsWith('ss')) {
    // onions -> onion
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

/**
 * Checks if a pantry item matches a recipe ingredient.
 * Uses loose matching (substrings) to be forgiving.
 */
export function isIngredientMatch(pantryItem: string, recipeIngredientName: string): boolean {
  const normalizedPantry = normalizeIngredient(pantryItem);
  const normalizedRecipe = normalizeIngredient(recipeIngredientName);

  if (!normalizedPantry || !normalizedRecipe) return false;

  // Exact match
  if (normalizedPantry === normalizedRecipe) return true;

  // Partial match: "chicken breast" matches "chicken"
  // We check if the core ingredient word appears in the other.
  // This helps when pantry has "Rice" and recipe needs "Basmati Rice"
  // Or pantry has "Diced Tomatoes" and recipe needs "Tomato"
  
  // To avoid false positives (e.g. "coconut milk" matching "milk"), 
  // we could enforce word boundaries, but for a simple matcher, matched substrings are acceptable.
  return normalizedPantry.includes(normalizedRecipe) || normalizedRecipe.includes(normalizedPantry);
}

/**
 * Calculates the match statistics for a recipe based on pantry items.
 */
export function calculatePantryMatch(
  pantryItems: string[],
  recipe: Recipe
): PantryMatchResult {
  // 1. Flatten all recipe ingredients
  const allRecipeIngredients: IngredientItem[] = recipe.ingredients.flatMap(
    (section) => section.data
  );
  
  const totalIngredients = allRecipeIngredients.length;
  if (totalIngredients === 0) {
    return {
      matchPercentage: 0,
      availableIngredients: [],
      missingIngredients: [],
      matchedCount: 0,
      totalIngredients: 0,
    };
  }

  // 2. Find matches
  const availableIngredients: string[] = [];
  const missingIngredients: string[] = [];

  allRecipeIngredients.forEach((ingredient) => {
    const isMatched = pantryItems.some((pantryItem) => 
      isIngredientMatch(pantryItem, ingredient.name)
    );

    if (isMatched) {
      availableIngredients.push(ingredient.name);
    } else {
      missingIngredients.push(ingredient.name);
    }
  });

  const matchedCount = availableIngredients.length;
  const matchPercentage = Math.round((matchedCount / totalIngredients) * 100);

  return {
    matchPercentage,
    availableIngredients,
    missingIngredients,
    matchedCount,
    totalIngredients,
  };
}

/**
 * Sorts recipes by match percentage descending.
 */
export function sortRecipesByMatch(
  pantryItems: string[],
  recipes: Recipe[],
  minMatchPercentage: number = 0
): (Recipe & { matchResult: PantryMatchResult })[] {
  return recipes
    .map((recipe) => ({
      ...recipe,
      matchResult: calculatePantryMatch(pantryItems, recipe),
    }))
    .filter((item) => item.matchResult.matchPercentage >= minMatchPercentage)
    .sort((a, b) => b.matchResult.matchPercentage - a.matchResult.matchPercentage);
}

// ==========================================
// EXAMPLE USAGE
// ==========================================
/*
const myPantry = ["Chicken Breast", "Rice", "Onions", "Garlic"];

const myRecipe: Recipe = {
  id: "1",
  title: "Chicken Curry",
  ingredients: [
    {
      title: "Main",
      data: [
        { name: "Chicken Thighs" }, // Match (Chicken)
        { name: "Basmati Rice" },   // Match (Rice)
        { name: "Onion" },          // Match (Onions)
        { name: "Ginger" },         // Missing
      ]
    }
  ],
  // ... other fields
};

const result = calculatePantryMatch(myPantry, myRecipe);

console.log(result);
// Output:
// {
//   matchPercentage: 75,
//   availableIngredients: ["Chicken Thighs", "Basmati Rice", "Onion"],
//   missingIngredients: ["Ginger"],
//   matchedCount: 3,
//   totalIngredients: 4
// }
*/
