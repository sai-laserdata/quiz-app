import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getLeaderboard } from '@/lib/quiz/data';
import { AutoRefresh } from '@/components/auto-refresh';
import { LeaderboardTable } from '@/components/leaderboard-table';
import { requireAdmin } from '@/lib/admin/auth';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  await requireAdmin();
  const entries = await getLeaderboard();

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 lg:px-10">
      <AutoRefresh intervalMs={10000} />
      <Link href="/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-slate-100">
        <ArrowLeft className="h-4 w-4" />
        Back to admin
      </Link>

      <section className="tech-panel rounded-xl p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mono-heading text-xs text-sky-300">Leaderboard</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-50">Top performers</h1>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-slate-400">
            <span className="rounded-full border border-slate-700 px-3 py-1">Primary sort: Correct answers desc</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">Tiebreak: Time taken asc</span>
          </div>
        </div>

        <LeaderboardTable entries={entries} />
      </section>
    </main>
  );
}
