const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "openrouter/free";
const TIMEOUT_MS = 45_000;

type OpenRouterContent = string | Array<{ type?: string; text?: string }> | null;

type OpenRouterResponse = {
  id?: string;
  model?: string;
  choices?: Array<{
    finish_reason?: string | null;
    message?: {
      role?: "assistant";
      content?: OpenRouterContent;
      tool_calls?: OpenRouterToolCall[];
      refusal?: string | null;
    };
  }>;
  error?: { message?: string; code?: number | string };
};

type OpenRouterToolCall = {
  id: string;
  function: { name: string; arguments: string };
};

export type OpenRouterAgentTool = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

export type OpenRouterAgentStage =
  | "preparing"
  | "searching"
  | "writing"
  | "checking"
  | "complete"
  | "error";

type AgentMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content?: string;
  tool_call_id?: string;
  tool_calls?: OpenRouterToolCall[];
};

function getMessageText(content?: OpenRouterContent): string {
  if (Array.isArray(content)) {
    return content
      .filter((part) => part.type === undefined || part.type === "text" || part.type === "output_text")
      .map((part) => typeof part.text === "string" ? part.text : "")
      .filter(Boolean)
      .join("\n")
      .trim();
  }
  return typeof content === "string" ? content.trim() : "";
}

function logOpenRouterResponse(
  stage: string,
  status: number,
  payload: OpenRouterResponse,
  requestId?: string | null,
) {
  const firstChoice = payload.choices?.[0];
  const message = firstChoice?.message;
  const text = getMessageText(message?.content);
  console.log("[OpenRouter] response", {
    stage,
    status,
    requestId: requestId ?? payload.id ?? null,
    model: payload.model ?? null,
    choiceCount: payload.choices?.length ?? 0,
    finishReason: firstChoice?.finish_reason ?? null,
    messageKeys: message ? Object.keys(message) : [],
    contentType: Array.isArray(message?.content) ? "parts" : typeof message?.content,
    contentLength: text.length,
    contentPreview: text ? text.slice(0, 240) : null,
    toolCallCount: message?.tool_calls?.length ?? 0,
    refusal: message?.refusal ?? null,
    providerError: payload.error?.message ?? null,
  });
}

export class OpenRouterClient {
  private readonly apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY?.trim() ?? "";

  async generateContent(
    prompt: string,
    imageBase64?: string,
    maxTokens = 1800,
    retryEmptyResponse = true,
  ): Promise<string> {
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
          "X-Title": "Zimbabwe Traditional Recipes",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: "user", content }],
          response_format: { type: "json_object" },
          temperature: 0.4,
          max_tokens: maxTokens,
        }),
        signal: controller.signal,
      });

      const payload = (await response.json().catch(() => ({}))) as OpenRouterResponse;
      logOpenRouterResponse(imageBase64 ? "vision" : "completion", response.status, payload, response.headers.get("x-request-id"));
      if (!response.ok) {
        throw this.toFriendlyError(response.status, payload.error?.message);
      }

      const choice = payload.choices?.[0];
      if (choice?.finish_reason === "length") {
        if (retryEmptyResponse) {
          console.warn("[OpenRouter] Completion reached its output limit; retrying once.");
          return this.generateContent(prompt, imageBase64, Math.min(maxTokens * 2, 3200), false);
        }
        throw new Error("The AI response was cut off. Please try again.");
      }
      const text = getMessageText(choice?.message?.content);

      if (!text) {
        if (retryEmptyResponse) {
          console.warn("[OpenRouter] Empty completion; retrying once.");
          return this.generateContent(prompt, imageBase64, maxTokens, false);
        }
        throw new Error("The AI provider returned no text after a retry. Please try again in a moment.");
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

  /** Run a small, bounded tool loop. Tool handlers must stay local and side-effect free. */
  async runToolAgent(
    systemPrompt: string,
    userPrompt: string,
    tools: OpenRouterAgentTool[],
    executeTool: (name: string, args: Record<string, unknown>) => Promise<unknown>,
    maxToolRounds = 2,
    onStage?: (stage: OpenRouterAgentStage) => void,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OpenRouter is not configured. Add EXPO_PUBLIC_OPENROUTER_API_KEY to your local .env file and restart Expo.");
    }

    const messages: AgentMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];
    let toolRounds = 0;
    let recoveryAttempts = 0;

    const recoverWithCompactFinal = () => {
      if (recoveryAttempts >= 1) return false;
      recoveryAttempts += 1;
      toolRounds = maxToolRounds;
      messages.push({
        role: "user",
        content: "Return the complete requested JSON now. Keep it concise and use the original request and any cookbook results already present above. Do not call tools again. If there are no cookbook results, create a recipe only from the listed ingredients and preferences.",
      });
      return true;
    };

    while (true) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
      let response: Response;
      const toolsAvailable = toolRounds < maxToolRounds && tools.length > 0;
      const stage = toolsAvailable ? "agent-tool-step" : "agent-final";
      console.log("[OpenRouter] request", { stage, model: MODEL, toolRound: toolRounds, messages: messages.length, toolsAvailable });
      try {
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
            "X-Title": "Zimbabwe Traditional Recipes",
          },
          body: JSON.stringify({
            model: MODEL,
            messages,
            ...(toolsAvailable
              ? { tools, tool_choice: toolRounds === 0 ? "required" : "auto" }
              : { response_format: { type: "json_object" } }),
            temperature: 0.35,
            max_tokens: toolsAvailable ? 700 : 1800,
          }),
          signal: controller.signal,
        });
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

      const payload = (await response.json().catch(() => ({}))) as OpenRouterResponse;
      logOpenRouterResponse(stage, response.status, payload, response.headers.get("x-request-id"));
      if (!response.ok) throw this.toFriendlyError(response.status, payload.error?.message);

      const choice = payload.choices?.[0];
      const message = choice?.message;
      if (!message) {
        if (recoverWithCompactFinal()) {
          console.warn("[OpenRouter] Successful response had no assistant message; trying one compact final response.");
          continue;
        }
        throw new Error("The model returned no assistant message after a retry. Please try again in a moment.");
      }
      const calls = message.tool_calls ?? [];
      if (calls.length > 0 && toolRounds < maxToolRounds) {
        onStage?.("searching");
        console.log("[OpenRouter] tool calls", { names: calls.map((call) => call.function.name), count: calls.length });
        messages.push({ role: "assistant", content: getMessageText(message.content), tool_calls: calls });
        for (const call of calls) {
          let output: unknown;
          const toolStartedAt = Date.now();
          try {
            const args = JSON.parse(call.function.arguments || "{}") as Record<string, unknown>;
            output = await executeTool(call.function.name, args);
          } catch (error) {
            output = { error: error instanceof Error ? error.message : "Tool could not complete." };
          }
          console.log("[OpenRouter] tool completed", {
            name: call.function.name,
            elapsedMs: Date.now() - toolStartedAt,
            resultCount: typeof output === "object" && output !== null && "count" in output ? (output as { count: unknown }).count : null,
            failed: typeof output === "object" && output !== null && "error" in output,
          });
          messages.push({ role: "tool", tool_call_id: call.id, content: JSON.stringify(output) });
        }
        toolRounds += 1;
        onStage?.("writing");
        continue;
      }
      onStage?.("writing");

      const text = getMessageText(message.content);
      if (choice?.finish_reason === "length") {
        if (recoverWithCompactFinal()) {
          console.warn("[OpenRouter] Final response reached its output limit; retrying once with a compact response.");
          continue;
        }
        throw new Error("The AI response was cut off. Please try again.");
      }
      if (!text) {
        if (recoverWithCompactFinal()) {
          console.warn("[OpenRouter] Successful response had no assistant text; trying one compact final response.");
          continue;
        }
        throw new Error("The model returned no recipe text after a retry. Please try again in a moment.");
      }
      return text;
    }
  }

  private toFriendlyError(status: number, message?: string) {
    if (status === 401 || status === 403) {
      return new Error("OpenRouter rejected the API key. Check EXPO_PUBLIC_OPENROUTER_API_KEY in .env.");
    }
    if (status === 429) {
      return new Error("AI Chef is taking a little longer than usual. Please wait a moment and try again.");
    }
    if (status === 402) {
      return new Error("AI Chef is temporarily unavailable. Please try again shortly.");
    }
    if (status >= 500) {
      return new Error("OpenRouter is temporarily unavailable. Please try again shortly.");
    }
    return new Error(message || `OpenRouter request failed (${status}).`);
  }
}

export const openRouterClient = new OpenRouterClient();
