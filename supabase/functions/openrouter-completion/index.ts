// Deno resolves npm: specifiers at runtime; ESLint's Node resolver does not.
// eslint-disable-next-line import/no-unresolved
import { createClient } from "npm:@supabase/supabase-js@2";

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
    const { data: limitAllowed, error: limitError } = await userClient.rpc("consume_ai_request_limit");
    if (limitError) {
      return Response.json({ error: { message: "AI service is not ready" } }, { status: 503, headers: corsHeaders });
    }
    if (limitAllowed !== true) {
      return Response.json({ error: { message: "You have reached the AI request limit. Try again later." } }, { status: 429, headers: corsHeaders });
    }

    const { completion } = await request.json();
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
    if (!upstream.ok && upstream.status !== 429) {
      return Response.json(
        { error: { message: "AI Chef is temporarily unavailable. Please try again shortly." } },
        { status: upstream.status === 401 || upstream.status === 403 ? 503 : upstream.status >= 500 ? 503 : 502, headers: corsHeaders },
      );
    }
    const responseBody = await upstream.text();
    return new Response(responseBody, {
      status: upstream.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error && error.name === "TimeoutError"
      ? "The AI request timed out"
      : "The AI service could not complete this request";
    return Response.json({ error: { message } }, { status: 502, headers: corsHeaders });
  }
});

