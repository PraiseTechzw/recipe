import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export type AdminRole = 'owner' | 'admin' | 'moderator' | 'analyst' | 'support';

const ROLE_HIERARCHY: Record<AdminRole, number> = {
  owner: 5,
  admin: 4,
  moderator: 3,
  analyst: 2,
  support: 1,
};

export async function getAdminUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!adminUser) {
    return null;
  }

  return { ...user, ...adminUser };
}

export async function requireAdminRole(minRole: AdminRole) {
  const admin = await getAdminUser();

  if (!admin) {
    redirect('/login');
  }

  if (ROLE_HIERARCHY[admin.role as AdminRole] < ROLE_HIERARCHY[minRole]) {
    throw new Error(`Unauthorized: Requires ${minRole} role`);
  }

  return admin;
}
