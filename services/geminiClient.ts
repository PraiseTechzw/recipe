import { GenerateContentResponse, GoogleGenAI } from "@google/genai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";

// Configuration for retry logic
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;
const TIMEOUT_MS = 15000; // 15 seconds timeout

export class GeminiClient {
  private client: GoogleGenAI;
  private modelName: string;

  constructor(modelName: string = "gemini-3-flash-preview") {
    this.modelName = modelName;
    this.client = new GoogleGenAI({ apiKey: API_KEY });
  }

  private setModel(name: string) {
    this.modelName = name;
  }

  /**
   * Generates content with retry, timeout, and error mapping.
   */
  async generateContent(prompt: string, parts?: any[]): Promise<string> {
    if (!API_KEY) {
      throw new Error("Missing AI API key. Set EXPO_PUBLIC_GEMINI_API_KEY.");
    }

    // Construct the parts array for the new SDK
    const contentParts: any[] = [{ text: prompt }];
    if (parts) {
      contentParts.push(...parts);
    }

    let attempt = 0;

    while (attempt < MAX_RETRIES) {
      try {
        const result = (await Promise.race([
          this.client.models.generateContent({
            model: this.modelName,
            contents: [
              {
                role: "user",
                parts: contentParts,
              },
            ],
            config: {
              responseMimeType: "application/json",
            },
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("TIMEOUT")), TIMEOUT_MS),
          ),
        ])) as GenerateContentResponse;

        const text = result.text;

        if (!text) {
          throw new Error("EMPTY_RESPONSE");
        }

        return text;
      } catch (error: any) {
        const rawMessage =
          error?.message ||
          error?.status ||
          error?.code ||
          error?.cause?.message ||
          "Unknown error";
        console.log(`Gemini error: ${rawMessage}`);
        attempt++;

        const isModelNotFound =
          rawMessage.includes("404") ||
          rawMessage.toLowerCase().includes("not found") ||
          rawMessage.toLowerCase().includes("not supported");

        if (isModelNotFound) {
          if (this.modelName === "gemini-1.5-flash") {
            console.log("Switching to gemini-1.5-pro...");
            this.setModel("gemini-1.5-pro");
            continue;
          } else if (this.modelName === "gemini-1.5-pro") {
            console.log("Switching to gemini-2.0-flash-exp...");
            this.setModel("gemini-2.0-flash-exp");
            continue;
          } else if (this.modelName === "gemini-2.0-flash-exp") {
            console.log("Switching to gemini-2.0-flash...");
            this.setModel("gemini-2.0-flash");
            continue;
          } else if (this.modelName === "gemini-2.0-flash") {
            console.log("Switching to gemini-2.5-flash...");
            this.setModel("gemini-2.5-flash");
            continue;
          }
        }

        const isRetryable =
          error.message === "TIMEOUT" ||
          error.message.includes("503") ||
          error.message.includes("network") ||
          error.message.includes("fetch failed");

        if (isRetryable && attempt < MAX_RETRIES) {
          const delay = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
          console.log(
            `Gemini retry ${attempt}/${MAX_RETRIES} after ${delay}ms`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // Map errors to friendly messages
        if (error.message === "TIMEOUT") {
          throw new Error(
            "Request timed out. Please check your connection and try again.",
          );
        }
        if (
          rawMessage.includes("401") ||
          rawMessage.toLowerCase().includes("unauthorized")
        ) {
          throw new Error(
            "Invalid API key or unauthorized. Verify EXPO_PUBLIC_GEMINI_API_KEY.",
          );
        }
        if (rawMessage.includes("403")) {
          throw new Error(
            "Access forbidden. Check model availability and billing.",
          );
        }
        if (error.message.includes("429")) {
          throw new Error("Too many requests. Please try again in a moment.");
        }
        if (rawMessage.toLowerCase().includes("expired")) {
          throw new Error(
            "API Key expired. Please generate a new one in Google AI Studio.",
          );
        }
        if (rawMessage.toLowerCase().includes("api key")) {
          throw new Error("API Key issue. Please check your configuration.");
        }

        throw error;
      }
    }
    throw new Error("AI service unavailable. Please try again.");
  }
}

export const geminiClient = new GeminiClient();
