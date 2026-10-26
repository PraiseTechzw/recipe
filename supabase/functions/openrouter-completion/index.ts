// Deno resolves npm: specifiers at runtime; ESLint's Node resolver does not.
// eslint-disable-next-line import/no-unresolved
import { PostHog } from "npm:posthog-node";
// eslint-disable-next-line import/no-unresolved
import { createClient } from "npm:@supabase/supabase-js@2";

const posthogProjectToken = Deno.env.get("POSTHOG_PROJECT_TOKEN");
const posthogHost = Deno.env.get("POSTHOG_HOST");

if ((!posthogProjectToken || !posthogHost) && Deno.env.get("DENO_ENV") === "development") {
  const missingVariable = posthogProjectToken ? "POSTHOG_HOST" : "POSTHOG_PROJECT_TOKEN";
  throw new Error(
    `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
  );
}

const posthog = posthogProjectToken && posthogHost
  ? new PostHog(posthogProjectToken, {
      host: posthogHost,
      privacyMode: false,
      enableExceptionAutocapture: false,
      flushAt: 1,
      flushInterval: 0,
    })
  : undefined;

type AIObservabilityContext = {
  traceId: string;
  sessionId: string;
  analyticsConsent: boolean;
};

type OpenRouterResponse = {
  choices?: Array<{
    finish_reason?: string | null;
    message?: {
      role?: "assistant";
      content?: unknown;
      tool_calls?: unknown;
    };
  }>;
  error?: { message?: string };
  usage?: { prompt_tokens?: number; completion_tokens?: number };
};

function getObservabilityContext(value: unknown): AIObservabilityContext {
  if (
    value &&
    typeof value === "object" &&
    typeof (value as { traceId?: unknown }).traceId === "string" &&
    typeof (value as { sessionId?: unknown }).sessionId === "string"
  ) {
    return {
      traceId: (value as AIObservabilityContext).traceId,
      sessionId: (value as AIObservabilityContext).sessionId,
      analyticsConsent: (value as { analyticsConsent?: unknown }).analyticsConsent === true,
    };
  }

  const traceId = crypto.randomUUID();
  return { traceId, sessionId: `ai-recipe-${traceId}`, analyticsConsent: false };
}

function parseOpenRouterResponse(responseBody: string): OpenRouterResponse | undefined {
  try {
    return JSON.parse(responseBody) as OpenRouterResponse;
  } catch {
    return undefined;
  }
}

async function captureGeneration(
  context: AIObservabilityContext,
  completion: Record<string, unknown>,
  responseBody: string | undefined,
  status: number | undefined,
  latencyMs: number,
  requestError?: unknown,
) {
  if (!posthog || !context.analyticsConsent) return;

  const payload = responseBody ? parseOpenRouterResponse(responseBody) : undefined;
  const choices = payload?.choices?.map((choice) => ({
    role: choice.message?.role ?? "assistant",
    has_content: Boolean(choice.message?.content),
    tool_call_count: Array.isArray(choice.message?.tool_calls) ? choice.message.tool_calls.length : 0,
  })) ?? [];

  try {
    posthog.capture({
      distinctId: context.traceId,
      event: "$ai_generation",
      properties: {
        $ai_trace_id: context.traceId,
        $ai_session_id: context.sessionId,
        $ai_span_id: crypto.randomUUID(),
        $ai_parent_id: context.traceId,
        $ai_span_name: "openrouter_chat_completion",
        $ai_model: "openrouter/free",
        $ai_provider: "openrouter",
        $ai_input: Array.isArray(completion.messages) ? completion.messages.map((message) => ({
          role: (message as { role?: unknown }).role,
          content_length: typeof (message as { content?: unknown }).content === "string"
            ? ((message as { content: string }).content).length
            : 0,
        })) : [],
        $ai_output_choices: choices,
        $ai_latency: latencyMs / 1_000,
        $ai_http_status: status,
        $ai_is_error: Boolean(requestError) || (status !== undefined && status >= 400),
        ...(payload?.choices?.[0]?.finish_reason ? { $ai_stop_reason: payload.choices[0].finish_reason } : {}),
        ...(typeof payload?.usage?.prompt_tokens === "number" ? { $ai_input_tokens: payload.usage.prompt_tokens } : {}),
        ...(typeof payload?.usage?.completion_tokens === "number" ? { $ai_output_tokens: payload.usage.completion_tokens } : {}),
        ...(typeof completion.temperature === "number" ? { $ai_temperature: completion.temperature } : {}),
        ...(typeof completion.max_tokens === "number" ? { $ai_max_tokens: completion.max_tokens } : {}),
        ...(Array.isArray(completion.tools) ? { $ai_tools: completion.tools } : {}),
      },
    });
    await posthog.flush();
  } catch (error) {
    console.error("[PostHog] AI generation capture failed", error);
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return Response.json({ error: { message: "Method not allowed" } }, { status: 405, headers: corsHeaders });
  }
  const declaredLength = Number(request.headers.get("Content-Length") ?? 0);
  if (declaredLength > 12_000_000) {
    return Response.json({ error: { message: "AI request is too large" } }, { status: 413, headers: corsHeaders });
  }

  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) {
    return Response.json({ error: { message: "AI service is not configured" } }, { status: 503, headers: corsHeaders });
  }

  try {
    const authorization = request.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!authorization || !supabaseUrl || !anonKey) {
      return Response.json({ error: { message: "A secure app session is required" } }, { status: 401, headers: corsHeaders });
    }
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return Response.json({ error: { message: "A secure app session is required" } }, { status: 401, headers: corsHeaders });
    }
    const { data: limitAllowed, error: limitError } = await userClient.rpc("consume_ai_request_limit");
    if (limitError) {
      return Response.json({ error: { message: "AI service is not ready" } }, { status: 503, headers: corsHeaders });
    }
    if (limitAllowed !== true) {
      return Response.json({ error: { message: "You have reached the AI request limit. Try again later." } }, { status: 429, headers: corsHeaders });
    }

    const { completion, observability: rawObservability } = await request.json();
    if (!completion || completion.model !== "openrouter/free" || !Array.isArray(completion.messages)) {
      return Response.json({ error: { message: "Invalid AI request" } }, { status: 400, headers: corsHeaders });
    }
    if (completion.messages.length > 40 || JSON.stringify(completion).length > 12_000_000) {
      return Response.json({ error: { message: "AI request is too large" } }, { status: 413, headers: corsHeaders });
    }
    if (completion.messages.some((message: unknown) =>
      !message || typeof message !== "object" ||
      !["system", "user", "assistant", "tool"].includes((message as { role?: string }).role ?? "")
    )) {
      return Response.json({ error: { message: "Invalid message format" } }, { status: 400, headers: corsHeaders });
    }
    const maxTokens = Number(completion.max_tokens ?? 1800);
    if (!Number.isFinite(maxTokens) || maxTokens < 1 || maxTokens > 3200) {
      return Response.json({ error: { message: "Invalid output limit" } }, { status: 400, headers: corsHeaders });
    }
    const temperature = Number(completion.temperature ?? 0.4);
    if (!Number.isFinite(temperature) || temperature < 0 || temperature > 1.5) {
      return Response.json({ error: { message: "Invalid generation settings" } }, { status: 400, headers: corsHeaders });
    }
    if (completion.tools !== undefined && (!Array.isArray(completion.tools) || completion.tools.length > 8)) {
      return Response.json({ error: { message: "Invalid tool configuration" } }, { status: 400, headers: corsHeaders });
    }
    const observability = getObservabilityContext(rawObservability);

    // Forward only the completion fields used by the app. This prevents
    // callers from overriding routing, credentials, or upstream request data.
    const upstreamBody = {
      model: "openrouter/free",
      messages: completion.messages,
      max_tokens: maxTokens,
      temperature,
      ...(completion.tools ? { tools: completion.tools, tool_choice: completion.tool_choice } : {}),
      ...(completion.response_format ? { response_format: completion.response_format } : {}),
    };

    const generationStartedAt = Date.now();
    try {
      const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Title": "Zimbabwe Traditional Recipes",
        },
        body: JSON.stringify(upstreamBody),
        signal: AbortSignal.timeout(45_000),
      });
      const responseBody = await upstream.text();
      await captureGeneration(
        observability,
        completion,
        responseBody,
        upstream.status,
        Date.now() - generationStartedAt,
      );
      if (!upstream.ok && upstream.status !== 429) {
        return Response.json(
          { error: { message: "AI Chef is temporarily unavailable. Please try again shortly." } },
          { status: upstream.status === 401 || upstream.status === 403 ? 503 : upstream.status >= 500 ? 503 : 502, headers: corsHeaders },
        );
      }
      return new Response(responseBody, {
        status: upstream.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (error) {
      await captureGeneration(
        observability,
        completion,
        undefined,
        undefined,
        Date.now() - generationStartedAt,
        error,
      );
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error && error.name === "TimeoutError"
      ? "The AI request timed out"
      : "The AI service could not complete this request";
    return Response.json({ error: { message } }, { status: 502, headers: corsHeaders });
  }
});

