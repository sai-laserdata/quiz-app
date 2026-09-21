import { redirect } from 'next/navigation';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase/server';
import { shouldUseDemoStore } from '@/lib/supabase/env';

export async function getAuthenticatedUserId() {
  // Throws outside development when Supabase is unconfigured, rather than
  // handing out admin access.
  if (shouldUseDemoStore()) {
    return 'demo-admin';
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

export async function isUserAdmin(userId: string) {
  if (shouldUseDemoStore()) {
    return true;
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('user_id')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to verify admin access: ${error.message}`);
  }

  return Boolean(data?.user_id);
}

export async function requireAdmin() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    redirect('/admin/login');
  }

  const isAdmin = await isUserAdmin(userId);

  if (!isAdmin) {
    redirect('/admin/login');
  }

  return userId;
}

export async function assertAdmin() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const isAdmin = await isUserAdmin(userId);

  if (!isAdmin) {
    throw new Error('Unauthorized');
  }

  return userId;
}
