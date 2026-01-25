import { GoogleGenerativeAI } from '@google/generative-ai';

// TODO: Replace with your actual Gemini API Key
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';

const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateRecipeFromImage(base64Image: string) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert Zimbabwean chef. Analyze this image of ingredients.
      1. Identify the ingredients visible in the photo.
      2. Suggest a creative, authentic Zimbabwean or African-inspired recipe using these ingredients. You may assume common pantry staples (salt, oil, water, onions, tomatoes) are available.
      3. Return ONLY a valid JSON object with this structure:
      {
        "title": "Recipe Name",
        "description": "A brief, mouth-watering description.",
        "time": "e.g. 45 mins",
        "calories": "e.g. 350 kcal",
        "ingredients": [
          {"name": "Ingredient 1", "quantity": "1 cup"},
          {"name": "Ingredient 2", "quantity": "2 tbsp"}
        ],
        "steps": [
          "Step 1 description",
          "Step 2 description"
        ],
        "category": "One of: Grains, Relishes, Meats, Drinks, Vegetarian"
      }
    `;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg",
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw error;
  }
}
