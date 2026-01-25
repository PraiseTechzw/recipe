import { GoogleGenerativeAI } from '@google/generative-ai';

// TODO: Replace with your actual Gemini API Key
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';

const genAI = new GoogleGenerativeAI(API_KEY);

export async function generateRecipeFromImage(base64Image: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Analyze this image of ingredients and suggest a Zimbabwean or African-inspired recipe that can be made with them. Return the response in JSON format with fields: title, description, time, calories, ingredients (array of objects with name, quantity), steps (array of strings), and category.";

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg",
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown code blocks if present
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw error;
  }
}
