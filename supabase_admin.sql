-- Admin Whitelist Table
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

-- RLS Policies for Admin Whitelist
CREATE POLICY "Admins can view whitelist" 
ON admin_whitelist FOR SELECT 
TO authenticated 
USING (is_admin());

-- RLS Policies for Audit Logs
CREATE POLICY "Admins can view audit logs" 
ON audit_logs FOR SELECT 
TO authenticated 
USING (is_admin());

CREATE POLICY "Admins can insert audit logs" 
ON audit_logs FOR INSERT 
TO authenticated 
WITH CHECK (is_admin());

-- Seed initial admin (Replace with your actual admin email)
-- INSERT INTO admin_whitelist (email) VALUES ('admin@example.com') ON CONFLICT DO NOTHING;
