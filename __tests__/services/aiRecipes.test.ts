import { aiRecipeService, AIRecipeService } from '../../services/aiRecipes';
import { geminiClient } from '../../services/geminiClient';
import { ZodError } from 'zod';

// Mock geminiClient
jest.mock('../../services/geminiClient', () => ({
  geminiClient: {
    generateContent: jest.fn(),
  },
}));

describe('AIRecipeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractIngredients', () => {
    it('should successfully extract and parse ingredients', async () => {
      const mockResponse = JSON.stringify({
        ingredients: [{ name: 'tomato', confidence: 0.9 }],
        notes: 'Fresh',
        warnings: [],
      });
      (geminiClient.generateContent as jest.Mock).mockResolvedValue(mockResponse);

      const result = await aiRecipeService.extractIngredients('base64data');

      expect(result.ingredients).toHaveLength(1);
      expect(result.ingredients[0].name).toBe('tomato');
      expect(geminiClient.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('Extract ingredients'),
        expect.anything()
      );
    });

    it('should throw ZodError on invalid JSON structure', async () => {
      const mockResponse = JSON.stringify({
        wrongField: 'oops',
      });
      (geminiClient.generateContent as jest.Mock).mockResolvedValue(mockResponse);

      await expect(aiRecipeService.extractIngredients('base64data')).rejects.toThrow(ZodError);
    });
  });

  describe('generateRecipe', () => {
    const mockIngredients = ['chicken', 'rice'];
    const mockRecipeResponse = JSON.stringify({
      title: 'Chicken Rice',
      description: 'Tasty',
      time_minutes: 30,
      servings: 2,
      category: 'Meats',
      ingredients: [{ name: 'chicken', quantity: '100g' }, { name: 'rice', quantity: '1 cup' }],
      steps: [{ text: 'Cook it', timer_minutes: 20 }],
      nutrition: { calories: 500, protein_g: 30, carbs_g: 40, fat_g: 10 },
    });

    it('should generate recipe with valid response', async () => {
      (geminiClient.generateContent as jest.Mock).mockResolvedValue(mockRecipeResponse);

      const result = await aiRecipeService.generateRecipe(mockIngredients);

      expect(result.title).toBe('Chicken Rice');
      expect(geminiClient.generateContent).toHaveBeenCalled();
    });

    it('should include pantry items in the prompt', async () => {
      (geminiClient.generateContent as jest.Mock).mockResolvedValue(mockRecipeResponse);
      
      const pantryItems = ['salt', 'pepper'];
      await aiRecipeService.generateRecipe(mockIngredients, pantryItems);

      expect(geminiClient.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('Available Pantry Items (Use these if relevant): salt, pepper'),
        undefined // No image part for recipe generation
      );
    });

    it('should handle empty pantry items gracefully', async () => {
      (geminiClient.generateContent as jest.Mock).mockResolvedValue(mockRecipeResponse);
      
      await aiRecipeService.generateRecipe(mockIngredients, []);

      expect(geminiClient.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('No extra pantry items available'),
        undefined
      );
    });

    it('should include preferences in the prompt', async () => {
      (geminiClient.generateContent as jest.Mock).mockResolvedValue(mockRecipeResponse);
      
      const preferences = { diet: 'Vegan', timeLimit: '15 mins' };
      await aiRecipeService.generateRecipe(mockIngredients, [], preferences);

      expect(geminiClient.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('Dietary restrictions: Vegan'),
        undefined
      );
      expect(geminiClient.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('Time limit: 15 mins'),
        undefined
      );
    });
  });
});
