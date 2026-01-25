import { Recipe } from '../models/recipe';
import { RECIPES } from '../data/recipes';

// Simple hash function for daily rotation
const getDailyHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getRecipeOfTheDay = (): Recipe => {
  const today = new Date().toDateString(); // Updates every 24 hours
  const index = getDailyHash(today) % RECIPES.length;
  return RECIPES[index];
};

export const getRecommendedRecipes = (
  viewHistory: string[], 
  categoryScores: Record<string, number>
): Recipe[] => {
  // 1. Identify top categories
  const sortedCategories = Object.entries(categoryScores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .map(([cat]) => cat);
    
  const topCategory = sortedCategories[0];

  // 2. Filter recipes
  let recommended = RECIPES.filter(r => {
    // Don't show recently viewed (top 3) to encourage discovery
    if (viewHistory.slice(0, 3).includes(r.id)) return false;
    
    // Prioritize top category if exists
    if (topCategory && r.category === topCategory) return true;
    
    return false;
  });

  // 3. Fallback to random if not enough data
  if (recommended.length < 2) {
    recommended = RECIPES.filter(r => !viewHistory.includes(r.id));
  }

  return recommended.slice(0, 5); // Return top 5
};

export const getRandomRecipe = (): Recipe => {
  const index = Math.floor(Math.random() * RECIPES.length);
  return RECIPES[index];
};

export const searchRecipes = (query: string, categoryFilter?: string | null): Recipe[] => {
  const lowerQuery = query.toLowerCase();
  
  return RECIPES.filter(r => {
    const matchesSearch = 
      r.title.toLowerCase().includes(lowerQuery) || 
      r.ingredients.some(s => 
          // Check if ingredients structure is sectioned or flat (our mock data is sectioned)
          Array.isArray(s.data) 
            ? s.data.some(i => i.name.toLowerCase().includes(lowerQuery))
            : false
      );
      
    const matchesCategory = categoryFilter && categoryFilter !== 'All' 
      ? r.category === categoryFilter 
      : true;

    return matchesSearch && matchesCategory;
  });
};
