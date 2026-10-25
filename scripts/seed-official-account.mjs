import { createClient } from "@supabase/supabase-js";

const email = "praisetechzw@gmail.com";
const profileId = "praisetechzw";
const name = "Praise Masunga";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.PRAISE_MASUNGA_PASSWORD;

if (!supabaseUrl || !serviceRoleKey || !password) {
  throw new Error(
    "Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and PRAISE_MASUNGA_PASSWORD in a private environment file before running this script.",
  );
}

if (password.length < 12) {
  throw new Error("PRAISE_MASUNGA_PASSWORD must be at least 12 characters long.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: usersPage, error: listError } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});
if (listError) throw listError;

let authUser = usersPage.users.find(
  (user) => user.email?.toLowerCase() === email.toLowerCase(),
);

if (!authUser) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });
  if (error) throw error;
  authUser = data.user;
} else if (authUser.user_metadata?.full_name !== name) {
  const { data, error } = await supabase.auth.admin.updateUserById(authUser.id, {
    user_metadata: { ...authUser.user_metadata, full_name: name },
  });
  if (error) throw error;
  authUser = data.user;
}

const { error: profileError } = await supabase
  .from("profiles")
  .upsert(
    {
      id: profileId,
      auth_user_id: authUser.id,
      name,
      bio: "Official account for Taste of Zimbabwe recipes.",
      chef_level: "Master Chef",
      xp: 99999,
      badges: ["Verified", "Admin"],
    },
    { onConflict: "id" },
  );
if (profileError) throw profileError;

console.log(`Created/linked ${name} (${email}) to profile ${profileId}.`);
