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

export const getRecipeOfTheDay = (sourceRecipes: Recipe[]): Recipe | undefined => {
  if (sourceRecipes.length === 0) return undefined;
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

const PANTRY_INGREDIENT_ALIASES: Record<string, string[]> = {
  "mealie-meal": ["mealie meal", "cornmeal", "maize meal", "sadza"],
  beef: ["beef", "nyama yemombe"],
  chicken: ["chicken", "huku", "inkukhu"],
  tomatoes: ["tomato", "tomatoes", "madomasi", "amatamatisi"],
  onions: ["onion", "onions", "hanyanisi", "anyanisi"],
  greens: ["greens", "covo", "rape", "collards", "muriwo", "imibhida"],
  "peanut-butter": ["peanut butter", "dovi", "idobi"],
  kapenta: ["kapenta", "matemba", "dried kapenta"],
  beans: ["beans", "nyemba", "sugar beans", "bhinzi", "indumba"],
  oil: ["oil", "cooking oil", "vegetable oil", "mafuta"],
  salt: ["salt", "munyu", "isawudo"],
  garlic: ["garlic", "galikhi", "igaliki"],
  rice: ["rice", "mupunga", "ilayisi"],
  maize: ["maize", "corn", "hominy", "mapopo", "samp", "chibage", "umumbu", "mealie meal"],
  sorghum: ["sorghum", "mapfunde", "amabele"],
  groundnuts: ["groundnuts", "peanuts", "nzungu", "amantongomane"],
  "sweet-potatoes": ["sweet potato", "sweet potatoes", "mbambaira", "ubhatata"],
  pumpkin: ["pumpkin", "butternut", "manhanga", "ithanga"],
  potatoes: ["potato", "potatoes", "mbatatisi", "amazambane"],
  fish: ["fish", "bream", "kapenta", "hove", "inhlanzi"],
  "mopane-worms": ["mopane worms", "mopane worm", "madora", "macimbi", "amacimbi"],
  eggs: ["egg", "eggs", "mazai", "amaqanda"],
  milk: ["milk", "mukaka", "ubisi"],
  flour: ["flour", "hupfu", "impuphu"],
  sugar: ["sugar", "shuga", "ushukela"],
  ginger: ["ginger"],
  "green-pepper": ["green pepper", "green peppers", "bell pepper", "capsicum", "upelepele"],
  carrots: ["carrot", "carrots", "makarotsi", "izaqathi"],
  spinach: ["spinach", "spinachi", "isipinashi"],
  cabbage: ["cabbage", "makabichi", "ikhaphetshu"],
};

const ingredientWords = (value: string) =>
  value
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .match(/[a-z0-9]+/g) ?? [];

const sameIngredientWord = (left: string, right: string) =>
  left === right || left === `${right}s` || right === `${left}s`;

const containsIngredientPhrase = (ingredient: string, phrase: string) => {
  const ingredientParts = ingredientWords(ingredient);
  const phraseParts = ingredientWords(phrase);
  if (phraseParts.length === 0 || phraseParts.length > ingredientParts.length) {
    return false;
  }

  return ingredientParts.some((_, start) =>
    phraseParts.every(
      (part, offset) =>
        ingredientParts[start + offset] !== undefined &&
        sameIngredientWord(ingredientParts[start + offset], part),
    ),
  );
};

export const getPantryMatches = (pantry: string[], sourceRecipes: Recipe[]): Recipe[] => {
  if (!pantry?.length || !sourceRecipes.length) return [];

  const pantryAliasGroups = pantry.map((item) =>
    [item, ...(PANTRY_INGREDIENT_ALIASES[item] ?? [])].filter(Boolean),
  );

  return sourceRecipes
    .map((recipe, sourceIndex) => {
      const recipeIngredients = recipe.ingredients.flatMap((section) =>
        section.data.map((ingredient) =>
          [ingredient.name, ingredient.description].filter(Boolean).join(" "),
        ),
      );
      const matchedIngredients = pantryAliasGroups.filter((aliases) =>
        aliases.some((alias) =>
          recipeIngredients.some((ingredient) =>
            containsIngredientPhrase(ingredient, alias),
          ),
        ),
      ).length;

      return { recipe, sourceIndex, matchedIngredients };
    })
    .filter((result) => result.matchedIngredients > 0)
    .sort(
      (left, right) =>
        right.matchedIngredients - left.matchedIngredients ||
        left.sourceIndex - right.sourceIndex,
    )
    .slice(0, 5)
    .map((result) => result.recipe);
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
