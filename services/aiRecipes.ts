import { z } from "zod";
import { openRouterClient } from "./openRouterClient";
import type { OpenRouterAgentStage, OpenRouterAgentTool } from "./openRouterClient";
import { getPantryMatches } from "./recommendations";
import { Recipe } from "../models/recipe";

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
  source: z.enum(["ai", "cookbook"]).optional(),
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
  mood?: string;
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

    try {
      const rawText = await openRouterClient.generateContent(prompt, imageBase64);
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
    recipeLibrary: Recipe[] = [],
    onAgentStage?: (stage: OpenRouterAgentStage) => void,
  ): Promise<GeneratedRecipeResult> {
    const prefsString = preferences
      ? `
      Dietary restrictions: ${preferences.diet || "None"}
      Allergies: ${preferences.allergies?.join(", ") || "None"}
      Time limit: ${preferences.timeLimit || "None"}
      Servings: ${preferences.servings || "2"}
      What the cook is in the mood for: ${preferences.mood || "No additional preference"}
      `
      : "";

    const pantryString =
      pantryItems.length > 0
        ? `Available Pantry Items (Use these if relevant): ${pantryItems.join(", ")}`
        : "No extra pantry items available.";

    const tools: OpenRouterAgentTool[] = [
      {
        type: "function",
        function: {
          name: "search_cookbook",
          description: "Search the user's saved and published recipe collection for dishes related to their ingredients and craving. Call this before composing the recipe so the recommendation can reuse or improve a real matching idea.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Short craving, cuisine, or ingredient phrase to match against cookbook recipes." },
            },
            required: ["query"],
            additionalProperties: false,
          },
        },
      },
    ];
    const prompt = `Use these inputs to create one Zimbabwean or African-inspired recipe.\n\nMAIN INGREDIENTS: ${ingredients.join(", ")}\n${pantryString}\n\nPREFERENCES:\n${prefsString}\n\nIf the cookbook search returns a suitable recipe, adapt that recipe to these ingredients and preferences; otherwise create a new dish. Use the main ingredients where practical, clearly include pantry ingredients, and do not claim the user has ingredients outside these lists. Make quantities and cooking steps useful and realistic. Return only a JSON object with title, description, time_minutes, servings, category, ingredients [{name, quantity}], steps [{text, timer_minutes, tip}], optional nutrition {calories, protein_g, carbs_g, fat_g}, and optional safety_warnings. No markdown.`;

    const initialCookbookMatches = getPantryMatches([...pantryItems, ...ingredients], recipeLibrary);
    let cookbookMatches = initialCookbookMatches;
    try {
      const rawText = await openRouterClient.runToolAgent(
        "You are a careful Zimbabwean cooking agent. Use the search_cookbook tool before drafting. Treat pantry and dietary preferences as the source of truth. Never alter saved data or claim that you saved anything. Final output must be the requested recipe JSON only.",
        prompt,
        tools,
        async (name, args) => {
          if (name !== "search_cookbook") return { error: "Unknown tool." };
          const query = typeof args.query === "string" ? args.query.toLowerCase().trim() : "";
          const pantryMatches = getPantryMatches([...pantryItems, ...ingredients], recipeLibrary);
          const queryMatches = query
            ? recipeLibrary.filter((recipe) => {
                const searchable = [recipe.title, recipe.category, recipe.description, ...recipe.tags, ...recipe.ingredients.flatMap((section) => section.data.map((item) => item.name))].join(" ").toLowerCase();
                return query.split(/\s+/).filter(Boolean).some((word) => searchable.includes(word));
              }).slice(0, 4)
            : [];
          const matched = Array.from(new Map([...pantryMatches, ...queryMatches].map((recipe) => [recipe.id, recipe])).values()).slice(0, 5);
          cookbookMatches = matched;
          return {
            count: matched.length,
            recipes: matched.map((recipe) => ({
              title: recipe.title,
              description: recipe.description.slice(0, 180),
              category: recipe.category,
              time: recipe.time,
              servings: recipe.servings,
              ingredients: recipe.ingredients.flatMap((section) => section.data.map((item) => ({ name: item.name, quantity: item.quantity ?? "" }))).slice(0, 8),
              steps: recipe.steps.map((step) => step.instruction || step.description || "").filter(Boolean).slice(0, 6),
            })),
          };
        },
        1,
        onAgentStage,
      );
      onAgentStage?.("checking");
      const cleanedJson = this.cleanJson(rawText);
      try {
        const recipe = GenerateRecipeResponseSchema.parse(JSON.parse(cleanedJson));
        onAgentStage?.("complete");
        return { ...recipe, source: "ai" };
      } catch {
        throw new Error("AI Chef couldn’t finish the recipe this time. Please try again in a moment.");
      }
    } catch (error) {
      const fallback = this.toCookbookRecipe(
        cookbookMatches.find((recipe) => this.canUseCookbookFallback(recipe, preferences)) ??
          initialCookbookMatches.find((recipe) => this.canUseCookbookFallback(recipe, preferences)),
      );
      if (fallback) {
        console.warn("[AI Chef] Model response unavailable; returning a validated cookbook recipe.");
        onAgentStage?.("checking");
        onAgentStage?.("complete");
        return fallback;
      }
      throw error;
    }
  }

  private canUseCookbookFallback(recipe: Recipe, preferences?: RecipePreferences) {
    // Do not bypass an explicit dietary or allergy constraint.
    if (preferences?.diet || preferences?.allergies?.length) return false;
    if (preferences?.timeLimit) {
      const requestedMinutes = Number.parseInt(preferences.timeLimit, 10);
      const recipeMinutes = Number.parseInt(recipe.time, 10);
      if (Number.isFinite(requestedMinutes) && Number.isFinite(recipeMinutes) && recipeMinutes > requestedMinutes) return false;
    }
    return true;
  }

  private toCookbookRecipe(recipe?: Recipe): GeneratedRecipeResult | null {
    if (!recipe) return null;
    const timeMinutes = Number.parseInt(recipe.time, 10);
    const ingredients = recipe.ingredients.flatMap((section) => section.data)
      .filter((ingredient) => ingredient.name.trim())
      .map((ingredient) => ({ name: ingredient.name, quantity: ingredient.quantity ?? "" }));
    const steps = recipe.steps
      .map((step) => ({ text: step.instruction || step.description || "", tip: step.tip }))
      .filter((step) => step.text.trim());

    if (!Number.isFinite(timeMinutes) || timeMinutes < 1 || recipe.servings < 1 || ingredients.length === 0 || steps.length === 0) {
      return null;
    }

    try {
      return GenerateRecipeResponseSchema.parse({
        title: recipe.title,
        description: recipe.description,
        time_minutes: timeMinutes,
        servings: recipe.servings,
        category: recipe.category,
        ingredients,
        steps,
        source: "cookbook",
      });
    } catch {
      return null;
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
