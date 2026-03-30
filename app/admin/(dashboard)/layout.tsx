import Link from 'next/link';
import type { Route } from 'next';
import { BarChart3, ClipboardList, DatabaseZap, Trophy } from 'lucide-react';
import { requireAdmin } from '@/lib/admin/auth';
import { AdminSignOutButton } from '@/components/admin-signout-button';
import { hasSupabaseEnv } from '@/lib/supabase/env';

export default async function AdminDashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-8 lg:px-10">
      <header className="tech-panel mb-8 flex flex-col gap-6 rounded-[2rem] p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mono-heading text-xs text-sky-300">Admin Dashboard</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-50">LaserData Quiz Admin</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Manage questions, view participants, and track quiz performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!hasSupabaseEnv() ? (
            <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs text-amber-100">Demo mode</span>
          ) : null}
          {hasSupabaseEnv() ? <AdminSignOutButton /> : null}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="tech-panel h-fit rounded-[2rem] p-4">
          <nav className="grid gap-2">
            <NavLink href="/admin" icon={<BarChart3 className="h-4 w-4" />} label="Overview" />
            <NavLink href="/admin/questions" icon={<ClipboardList className="h-4 w-4" />} label="Questions" />
            <NavLink href="/admin/participants" icon={<DatabaseZap className="h-4 w-4" />} label="Participants" />
            <NavLink href="/leaderboard" icon={<Trophy className="h-4 w-4" />} label="Leaderboard" />
          </nav>
        </aside>

        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}

function NavLink(props: { href: Route; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={props.href}
      className="flex items-center gap-3 rounded-2xl border border-transparent px-4 py-3 text-sm text-slate-300 transition hover:border-sky-400/20 hover:bg-slate-900/70 hover:text-slate-50"
    >
      <span className="text-sky-300">{props.icon}</span>
      {props.label}
    </Link>
  );
}
