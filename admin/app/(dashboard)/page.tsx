import { createClient } from "@/utils/supabase/server";

export const revalidate = 0;

async function getStats() {
  const supabase = await createClient();

  // Check admin setup
  let isAdmin = false;
  let setupNeeded = false;
  
  try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) {
          // If RPC fails with specific error, likely function doesn't exist
          // But generic error might happen too. 
          // For now, assume if error, setup is needed.
          setupNeeded = true;
      } else {
          isAdmin = !!data;
      }
  } catch (e) {
      setupNeeded = true;
  }

  if (setupNeeded || !isAdmin) {
      return { setupNeeded, isAdmin, userCount: 0, recipeCount: 0, recentLogs: [] };
  }

  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });
  const { count: recipeCount } = await supabase
    .from("recipes")
    .select("*", { count: "exact", head: true });

  // Fetch recent audit logs
  const { data: recentLogs } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    setupNeeded,
    isAdmin,
    userCount: userCount || 0,
    recipeCount: recipeCount || 0,
    recentLogs: recentLogs || [],
  };
}

export default async function Home() {
  const stats = await getStats();

  if (stats.setupNeeded) {
      return (
          <div className="bg-orange-50 p-8 rounded-lg border border-orange-200">
              <h1 className="text-2xl font-bold text-orange-800 mb-4">Admin Setup Required</h1>
              <p className="mb-4 text-orange-700">The admin database tables and functions are missing. Please run the following SQL in your Supabase SQL Editor:</p>
              <div className="bg-gray-900 p-4 rounded text-gray-100 text-sm overflow-auto mb-4 font-mono max-h-96">
                <pre>{`-- Admin Whitelist Table
CREATE TABLE IF NOT EXISTS admin_whitelist (
  email TEXT PRIMARY KEY,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE admin_whitelist ENABLE ROW LEVEL SECURITY;

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  admin_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
DECLARE
  current_email TEXT;
BEGIN
  -- Get email from JWT
  current_email := auth.jwt() ->> 'email';
  
  -- Check if email exists in whitelist
  IF current_email IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (SELECT 1 FROM admin_whitelist WHERE email = current_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
CREATE POLICY "Admins can view whitelist" ON admin_whitelist FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can insert audit logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (is_admin());

-- INSERT YOUR EMAIL MANUALLY INTO admin_whitelist table after running this!
`}</pre>
              </div>
              <p className="text-orange-700 font-bold">After running the SQL, manually insert your email into the 'admin_whitelist' table.</p>
          </div>
      );
  }

  if (!stats.isAdmin) {
      return (
          <div className="bg-red-50 p-8 rounded-lg border border-red-200 text-center">
              <h1 className="text-2xl font-bold text-red-800 mb-4">Access Denied</h1>
              <p className="text-red-700">You do not have admin privileges. Please ask an administrator to add your email to the whitelist.</p>
          </div>
      );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-gray-500 text-sm font-medium uppercase">
            Total Users
          </h2>
          <p className="text-4xl font-bold text-gray-900 mt-2">
            {stats.userCount}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-gray-500 text-sm font-medium uppercase">
            Total Recipes
          </h2>
          <p className="text-4xl font-bold text-gray-900 mt-2">
            {stats.recipeCount}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">
            Recent Admin Activity
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {stats.recentLogs.length === 0 ? (
            <p className="p-6 text-gray-500 text-sm">
              No activity recorded yet.
            </p>
          ) : (
            stats.recentLogs.map((log: any) => (
              <div
                key={log.id}
                className="p-6 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {log.action}
                  </p>
                  <p className="text-sm text-gray-500">
                    {log.entity_type} - {log.entity_id}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
