import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

if (!API_KEY) {
  console.warn("Gemini API Key is missing. AI features will not work.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Configuration for retry logic
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;
const TIMEOUT_MS = 15000; // 15 seconds timeout

export class GeminiClient {
  private model: GenerativeModel;

  constructor(modelName: string = "gemini-1.5-flash") {
    this.model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: { responseMimeType: "application/json" },
    });
  }

  /**
   * Generates content with retry, timeout, and error mapping.
   */
  async generateContent(prompt: any, parts?: any[]): Promise<string> {
    let attempt = 0;
    
    const input = parts ? [prompt, ...parts] : prompt;

    while (attempt < MAX_RETRIES) {
      try {
        const result = await Promise.race([
          this.model.generateContent(input),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("TIMEOUT")), TIMEOUT_MS)
          ),
        ]) as any; // Cast to any because Promise.race return type inference is tricky with timeout

        const response = await result.response;
        const text = response.text();
        
        if (!text) {
             throw new Error("EMPTY_RESPONSE");
        }
        
        return text;

      } catch (error: any) {
        attempt++;
        const isRetryable =
          error.message === "TIMEOUT" ||
          error.message.includes("503") ||
          error.message.includes("network") ||
          error.message.includes("fetch failed");

        if (isRetryable && attempt < MAX_RETRIES) {
          const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
          console.log(`Gemini retry ${attempt}/${MAX_RETRIES} after ${delay}ms`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // Map errors to friendly messages
        if (error.message === "TIMEOUT") {
            throw new Error("Request timed out. Please check your connection and try again.");
        }
        if (error.message.includes("429")) {
            throw new Error("Too many requests. Please try again in a moment.");
        }
        if (error.message.includes("API key")) {
             throw new Error("Invalid API Key configuration.");
        }
        
        throw new Error("AI Service unavailable. Please try again later.");
      }
    }
    throw new Error("Max retries exceeded.");
  }
}

export const geminiClient = new GeminiClient();
