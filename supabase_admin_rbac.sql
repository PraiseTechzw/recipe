-- ============================================================================
-- ADMIN RBAC SCHEMA
-- ============================================================================

-- 1. Create Admin Roles Enum
DO $$ BEGIN
    CREATE TYPE public.admin_role AS ENUM ('owner', 'admin', 'moderator', 'analyst', 'support');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Admin Users Table (Links to auth.users)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL, -- Cached for display
  role admin_role NOT NULL DEFAULT 'support',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Admin Audit Logs (Renamed/New table as requested)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  admin_id UUID REFERENCES public.admin_users(id),
  admin_email TEXT, -- Snapshot in case user is deleted
  admin_role admin_role, -- Snapshot of role at time of action
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Add Shadow Ban Column to Profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_shadow_banned BOOLEAN DEFAULT FALSE;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get current user's admin role
CREATE OR REPLACE FUNCTION public.get_admin_role()
RETURNS admin_role AS $$
DECLARE
  current_role admin_role;
BEGIN
  SELECT role INTO current_role
  FROM public.admin_users
  WHERE id = auth.uid();
  
  RETURN current_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission level (hierarchy check)
-- owner > admin > moderator > analyst > support
CREATE OR REPLACE FUNCTION public.auth_has_role(required_role admin_role)
RETURNS BOOLEAN AS $$
DECLARE
  user_role admin_role;
BEGIN
  user_role := get_admin_role();
  
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;

  IF required_role = 'owner' THEN
    RETURN user_role = 'owner';
  ELSIF required_role = 'admin' THEN
    RETURN user_role IN ('owner', 'admin');
  ELSIF required_role = 'moderator' THEN
    RETURN user_role IN ('owner', 'admin', 'moderator');
  ELSIF required_role = 'analyst' THEN
    RETURN user_role IN ('owner', 'admin', 'moderator', 'analyst');
  ELSIF required_role = 'support' THEN
    RETURN user_role IN ('owner', 'admin', 'moderator', 'analyst', 'support');
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- ADMIN_USERS Policies
-- Only Owner and Admin can manage admin users
CREATE POLICY "Owners and Admins can view admin users"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (auth_has_role('admin'));

CREATE POLICY "Owners can insert/update/delete admin users"
  ON public.admin_users FOR ALL
  TO authenticated
  USING (auth_has_role('owner'));

-- ADMIN_AUDIT_LOGS Policies
-- All admins can insert logs (via trigger or app logic)
CREATE POLICY "Admins can insert audit logs"
  ON public.admin_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth_has_role('support'));

-- Read access based on role
-- Analyst+ can view logs
CREATE POLICY "Analyst+ can view audit logs"
  ON public.admin_audit_logs FOR SELECT
  TO authenticated
  USING (auth_has_role('analyst'));

-- ============================================================================
-- TRIGGERS (Auto-update updated_at)
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
