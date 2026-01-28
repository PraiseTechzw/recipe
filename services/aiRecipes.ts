import { z } from "zod";
import { geminiClient } from "./geminiClient";

// --- Schemas ---

const IngredientConfidenceSchema = z.object({
  name: z.string(),
  confidence: z.number().optional(), // AI might not always return this, but prompt requests it
});

const ExtractIngredientsResponseSchema = z.object({
  ingredients: z.array(IngredientConfidenceSchema),
  notes: z.string().optional(),
  warnings: z.array(z.string()).optional(),
});

const RecipeIngredientSchema = z.object({
  name: z.string(),
  quantity: z.string(),
});

const RecipeStepSchema = z.object({
  text: z.string(),
  timer_minutes: z.number().optional(),
  tip: z.string().optional(),
});

const NutritionSchema = z.object({
  calories: z
    .number()
    .or(z.string())
    .transform((val) => Number(val) || 0),
  protein_g: z
    .number()
    .or(z.string())
    .transform((val) => Number(val) || 0),
  carbs_g: z
    .number()
    .or(z.string())
    .transform((val) => Number(val) || 0),
  fat_g: z
    .number()
    .or(z.string())
    .transform((val) => Number(val) || 0),
});

const GenerateRecipeResponseSchema = z.object({
  title: z.string(),
  description: z.string(),
  time_minutes: z
    .number()
    .or(z.string())
    .transform((val) => Number(val) || 0),
  servings: z
    .number()
    .or(z.string())
    .transform((val) => Number(val) || 0),
  category: z.string(),
  ingredients: z.array(RecipeIngredientSchema),
  steps: z.array(RecipeStepSchema),
  nutrition: NutritionSchema.optional(),
  safety_warnings: z.array(z.string()).optional(),
});

export type ExtractedIngredientsResult = z.infer<
  typeof ExtractIngredientsResponseSchema
>;
export type GeneratedRecipeResult = z.infer<
  typeof GenerateRecipeResponseSchema
>;

// --- Interfaces ---

export interface RecipePreferences {
  diet?: string; // e.g., "Vegetarian", "Vegan", "Keto"
  allergies?: string[];
  timeLimit?: string; // e.g., "30 mins"
  servings?: number;
}

// --- Service ---

export class AIRecipeService {
  /**
   * Extracts ingredients from an image.
   */
  async extractIngredients(
    imageBase64: string,
  ): Promise<ExtractedIngredientsResult> {
    const prompt = `
      You are an expert chef assistant. Analyze this image.
      1. Identify all food ingredients visible in the photo.
      2. Return ONLY a valid JSON object with this structure:
      {
        "ingredients": [{"name":"tomato","confidence":0.92}],
        "notes": "Any brief observations about freshness or type.",
        "warnings": ["List any non-food items or unclear items if present"]
      }
      Strictly JSON. No markdown formatting.
    `;

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: "image/jpeg",
      },
    };

    try {
      const rawText = await geminiClient.generateContent(prompt, [imagePart]);
      const cleanedJson = this.cleanJson(rawText);
      const parsed = JSON.parse(cleanedJson);
      return ExtractIngredientsResponseSchema.parse(parsed);
    } catch (error) {
      // Propagate error for UI handling
      throw error;
    }
  }

  /**
   * Generates a recipe based on ingredients and preferences.
   */
  async generateRecipe(
    ingredients: string[],
    pantryItems: string[] = [],
    preferences?: RecipePreferences,
  ): Promise<GeneratedRecipeResult> {
    const prefsString = preferences
      ? `
      Dietary restrictions: ${preferences.diet || "None"}
      Allergies: ${preferences.allergies?.join(", ") || "None"}
      Time limit: ${preferences.timeLimit || "None"}
      Servings: ${preferences.servings || "2"}
      `
      : "";

    const pantryString =
      pantryItems.length > 0
        ? `Available Pantry Items (Use these if relevant): ${pantryItems.join(", ")}`
        : "No extra pantry items available.";

    const prompt = `
      You are an expert Zimbabwean chef.
      Create an authentic Zimbabwean or African-inspired recipe using these MAIN ingredients: ${ingredients.join(", ")}.
      ${pantryString}
      
      Instructions:
      1. PRIORITIZE using the MAIN ingredients provided.
      2. Suggest using available pantry items where they fit naturally.
      3. List any missing ingredients needed to complete the dish.
      
      Preferences:
      ${prefsString}

      Return ONLY a valid JSON object with this structure:
      {
        "title": "Recipe Name",
        "description": "A brief, mouth-watering description.",
        "time_minutes": 45,
        "servings": 2,
        "category": "Relishes|Meats|Grains|Drinks|Vegetarian",
        "ingredients": [
          {"name": "Ingredient 1", "quantity": "1 cup"},
          {"name": "Ingredient 2", "quantity": "2 tbsp"}
        ],
        "steps": [
          {"text": "Step 1 description", "timer_minutes": 0, "tip": "Optional tip"}
        ],
        "nutrition": {
          "calories": 350,
          "protein_g": 20,
          "carbs_g": 45,
          "fat_g": 10
        },
        "safety_warnings": []
      }
      
      Strictly JSON. No markdown formatting.
    `;

    try {
      const rawText = await geminiClient.generateContent(prompt);
      const cleanedJson = this.cleanJson(rawText);
      const parsed = JSON.parse(cleanedJson);
      return GenerateRecipeResponseSchema.parse(parsed);
    } catch (error) {
      // Propagate error for UI handling
      throw error;
    }
  }

  private cleanJson(text: string): string {
    // Remove markdown code blocks if present
    let cleaned = text.replace(/```json/g, "").replace(/```/g, "");
    // Trim whitespace
    cleaned = cleaned.trim();
    // Attempt to find start and end of JSON object
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    return cleaned;
  }
}

export const aiRecipeService = new AIRecipeService();
