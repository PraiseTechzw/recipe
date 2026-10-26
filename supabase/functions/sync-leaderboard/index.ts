import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const levelThresholds = [
  0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7000, 9000,
  11500, 14500, 18000, 22000, 26500, 31500, 37000, 43000, 50000, 58000,
  67000, 77000, 88000,
];

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: corsHeaders });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authorization = request.headers.get("Authorization");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!authorization || !supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: "Leaderboard sync is not configured" }, 503);
  }

  const caller = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userError } = await caller.auth.getUser();
  if (userError || !userData.user) return json({ error: "A valid app session is required" }, 401);

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: appState, error: stateError } = await admin
    .from("chef_app_state")
    .select("state")
    .eq("auth_user_id", userData.user.id)
    .maybeSingle();
  if (stateError) return json({ error: "Could not load the saved chef profile" }, 503);

  const profile = appState?.state?.userProfile;
  if (!profile || typeof profile !== "object") return json({ error: "No saved chef profile was found" }, 409);

  // Bind public leaderboard identity to the validated Supabase user so a client
  // cannot choose another chef's row through its locally editable app-state JSON.
  const chefId = userData.user.id;
  const chefName = typeof profile.name === "string" ? profile.name.trim().slice(0, 48) : "";
  const totalXp = profile.xp;
  if (!chefId || chefId.length > 120 || !Number.isSafeInteger(totalXp) || totalXp < 0 || totalXp > 1_000_000_000) {
    return json({ error: "Saved chef progress is invalid" }, 422);
  }

  const monday = new Date();
  const day = monday.getUTCDay() || 7;
  monday.setUTCDate(monday.getUTCDate() - day + 1);
  monday.setUTCHours(0, 0, 0, 0);
  const currentWeek = monday.toISOString().slice(0, 10);
  const weeklyXp = profile.weeklyXpWeek === currentWeek && Number.isSafeInteger(profile.weeklyXp)
    ? Math.min(Math.max(profile.weeklyXp, 0), totalXp)
    : 0;
  const badges = Array.isArray(profile.badges) ? profile.badges : [];
  const level = levelThresholds.reduce((current, threshold, index) => totalXp >= threshold ? index + 1 : current, 1);

  const { error: chefError } = await admin.from("chefs").upsert({
    chef_id: chefId,
    chef_name: chefName || "Guest Chef",
    avatar_seed: chefId.slice(-12),
    updated_at: new Date().toISOString(),
  }, { onConflict: "chef_id" });
  if (chefError) return json({ error: "Could not update chef profile" }, 503);

  const { error: scoreError } = await admin.from("leaderboard").upsert({
    chef_id: chefId,
    total_xp: totalXp,
    weekly_xp: weeklyXp,
    level,
    achievements_count: Math.min(badges.length, 100),
    last_active_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: "chef_id" });
  if (scoreError) return json({ error: "Could not update leaderboard score" }, 503);

  return json({ synced: true, totalXp, weeklyXp, level });
});
