import { supabase } from "../lib/supabase";

const MODEL = "openrouter/free";
const TIMEOUT_MS = 45_000;

type OpenRouterContent = string | { type?: string; text?: string }[] | null;

type OpenRouterResponse = {
  id?: string;
  model?: string;
  choices?: {
    finish_reason?: string | null;
    message?: {
      role?: "assistant";
      content?: OpenRouterContent;
      tool_calls?: OpenRouterToolCall[];
      refusal?: string | null;
    };
  }[];
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
    toolCallCount: message?.tool_calls?.length ?? 0,
    hasRefusal: Boolean(message?.refusal),
    hasProviderError: Boolean(payload.error?.message),
  });
}

export class OpenRouterClient {
  private async requestCompletion(completion: Record<string, unknown>) {
    const { data: current } = await supabase.auth.getSession();
    if (!current.session) {
      const { error: authError } = await supabase.auth.signInAnonymously();
      if (authError) throw new Error("AI Chef needs a secure app session. Please try again.");
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const { data, error } = await supabase.functions.invoke("openrouter-completion", {
        body: { completion },
        signal: controller.signal,
      });
      if (error) {
        const status = (error as { context?: Response }).context?.status;
        if (status === 401 || status === 403) throw new Error("Your secure AI session expired. Please try again.");
        if (status === 429) throw new Error("AI Chef is receiving many requests. Please try again shortly.");
        throw new Error("AI Chef is temporarily unavailable. Please try again shortly.");
      }
      return data as OpenRouterResponse;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("The AI request took too long. Check your connection and try again.");
      }
      if (error instanceof TypeError) {
        throw new Error("Could not reach AI Chef. Check your internet connection and try again.");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  async generateContent(
    prompt: string,
    imageBase64?: string,
    maxTokens = 1800,
    retryEmptyResponse = true,
  ): Promise<string> {
    const content = imageBase64
      ? [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
          },
        ]
      : prompt;

    try {
      const payload = await this.requestCompletion({
          model: MODEL,
          messages: [{ role: "user", content }],
          response_format: { type: "json_object" },
          temperature: 0.4,
          max_tokens: maxTokens,
      });
      logOpenRouterResponse(imageBase64 ? "vision" : "completion", 200, payload);

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
      const toolsAvailable = toolRounds < maxToolRounds && tools.length > 0;
      const stage = toolsAvailable ? "agent-tool-step" : "agent-final";
      console.log("[OpenRouter] request", { stage, model: MODEL, toolRound: toolRounds, messages: messages.length, toolsAvailable });
      let payload: OpenRouterResponse;
      try {
        payload = await this.requestCompletion({
            model: MODEL,
            messages,
            ...(toolsAvailable
              ? { tools, tool_choice: toolRounds === 0 ? "required" : "auto" }
              : { response_format: { type: "json_object" } }),
            temperature: 0.35,
            max_tokens: toolsAvailable ? 700 : 1800,
        });
        logOpenRouterResponse(stage, 200, payload);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          throw new Error("The AI request took too long. Check your connection and try again.");
        }
        if (error instanceof TypeError) {
          throw new Error("Could not reach OpenRouter. Check your internet connection and try again.");
        }
        throw error;
      }

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

}

export const openRouterClient = new OpenRouterClient();
