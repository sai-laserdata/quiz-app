'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';

export function AdminSignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClientSupabaseBrowser();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );
}
