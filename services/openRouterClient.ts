const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openrouter/free";
const TIMEOUT_MS = 45_000;

type OpenRouterResponse = {
  choices?: Array<{
    message?: { content?: string | Array<{ type?: string; text?: string }> | null };
  }>;
  error?: { message?: string; code?: number | string };
};

export class OpenRouterClient {
  private readonly apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY?.trim() ?? "";

  async generateContent(prompt: string, imageBase64?: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error(
        "OpenRouter is not configured. Add EXPO_PUBLIC_OPENROUTER_API_KEY to your local .env file and restart Expo.",
      );
    }

    const content = imageBase64
      ? [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
          },
        ]
      : prompt;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "X-OpenRouter-Title": "Taste of Zimbabwe",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content }],
          response_format: { type: "json_object" },
          temperature: 0.4,
          max_tokens: 1800,
        }),
        signal: controller.signal,
      });

      const payload = (await response.json().catch(() => ({}))) as OpenRouterResponse;
      if (!response.ok) {
        throw this.toFriendlyError(response.status, payload.error?.message);
      }

      const message = payload.choices?.[0]?.message?.content;
      const text = Array.isArray(message)
        ? message.map((part) => part.text ?? "").join("\n").trim()
        : message?.trim();

      if (!text) {
        throw new Error("The AI returned an empty response. Please try again.");
      }

      return text;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("The AI request took too long. Check your connection and try again.");
      }
      if (error instanceof TypeError) {
        throw new Error("Could not reach OpenRouter. Check your internet connection and try again.");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private toFriendlyError(status: number, message?: string) {
    if (status === 401 || status === 403) {
      return new Error("OpenRouter rejected the API key. Check EXPO_PUBLIC_OPENROUTER_API_KEY in .env.");
    }
    if (status === 429) {
      return new Error("The free AI models are busy or rate limited. Please wait a moment and try again.");
    }
    if (status === 402) {
      return new Error("OpenRouter could not find an available free model for this request.");
    }
    if (status >= 500) {
      return new Error("OpenRouter is temporarily unavailable. Please try again shortly.");
    }
    return new Error(message || `OpenRouter request failed (${status}).`);
  }
}

export const openRouterClient = new OpenRouterClient();
