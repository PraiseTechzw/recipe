export interface ShoppingItem {
  id: string;
  name: string;
  quantity?: string;
  checked: boolean;
}

export interface IngredientItem {
  name: string;
  quantity?: string;
  description?: string;
}

export interface IngredientSection {
  title: string;
  data: IngredientItem[];
}

export interface Step {
  instruction: string;
  description?: string;
  tip?: string;
  image?: string;
  video?: string;
  highlightedWord?: string;
}

export interface Author {
  name: string;
  avatar: string;
  country?: string;
}

export interface Recipe {
  id: string;
  remoteId?: string;
  title: string;
  description: string;
  image: any; // Using require() or uri string
  category: string;
  tags: string[];
  time: string;
  servings: number;
  calories: string; // e.g. "520 Kcal"
  ingredients: IngredientSection[];
  steps: Step[];
  isTraditional: boolean;
  rating?: number;
  reviews?: number;
  author?: Author;
}
