import { Recipe } from '../models/recipe';

// Simple hash function for daily rotation
const getDailyHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getRecipeOfTheDay = (sourceRecipes: Recipe[]): Recipe => {
  const today = new Date().toDateString(); // Updates every 24 hours
  const index = getDailyHash(today) % sourceRecipes.length;
  return sourceRecipes[index];
};

export const getRecommendedRecipes = (
  viewHistory: string[], 
  categoryScores: Record<string, number>,
  sourceRecipes: Recipe[]
): Recipe[] => {
  // 1. Identify top categories
  const sortedCategories = Object.entries(categoryScores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .map(([cat]) => cat);
    
  const topCategory = sortedCategories[0];

  // 2. Filter recipes
  let recommended = sourceRecipes.filter(r => {
    // Don't show recently viewed (top 3) to encourage discovery
    if (viewHistory.slice(0, 3).includes(r.id)) return false;
    
    // Prioritize top category if exists
    if (topCategory && r.category === topCategory) return true;
    
    return false;
  });

  // 3. Fallback to random if not enough data
  if (recommended.length < 2) {
    recommended = sourceRecipes.filter(r => !viewHistory.includes(r.id));
  }

  return recommended.slice(0, 5); // Return top 5
};

export const getPantryMatches = (pantry: string[], sourceRecipes: Recipe[]): Recipe[] => {
  if (!pantry || pantry.length === 0) return [];
  
  const lowerPantry = pantry.map(p => p.toLowerCase());
  
  return sourceRecipes.filter(r => {
    // Flatten all ingredients from all sections
    const allIngredients = r.ingredients.flatMap(section => section.data.map(item => item.name.toLowerCase()));
    
    // Check for at least one match
    return allIngredients.some(ing => 
      lowerPantry.some(pantryItem => ing.includes(pantryItem) || pantryItem.includes(ing))
    );
  }).slice(0, 5); // Limit to 5 matches
};

export const getRandomRecipe = (sourceRecipes: Recipe[]): Recipe => {
  const index = Math.floor(Math.random() * sourceRecipes.length);
  return sourceRecipes[index];
};

export const searchRecipes = (query: string, categoryFilter: string | null | undefined, sourceRecipes: Recipe[]): Recipe[] => {
  const lowerQuery = query.toLowerCase();
  
  return sourceRecipes.filter(r => {
    const matchesSearch = 
      r.title.toLowerCase().includes(lowerQuery) || 
      r.ingredients.some(s => 
          // Check if ingredients structure is sectioned or flat (our mock data is sectioned)
          Array.isArray(s.data) 
            ? s.data.some(i => i.name.toLowerCase().includes(lowerQuery))
            : false
      );
      
    const matchesCategory = categoryFilter && categoryFilter !== 'All' 
      ? r.category === categoryFilter || r.tags?.includes(categoryFilter)
      : true;

    return matchesSearch && matchesCategory;
  });
};
