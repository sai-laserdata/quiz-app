import Image from 'next/image';
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
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-10 lg:px-10">
      <AutoRefresh intervalMs={10000} />
      <div className="grid min-h-[calc(100vh-5rem)] gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col">
          <Link href="/admin" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-slate-100">
            <ArrowLeft className="h-4 w-4" />
            Back to admin
          </Link>

          <section className="tech-panel flex-1 rounded-[2rem] p-6">
            <div>
              <p className="mono-heading text-xs text-sky-300">Leaderboard</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-50">Top performers</h1>
            </div>

            <LeaderboardTable entries={entries} />
          </section>
        </div>

        <aside className="flex items-center justify-center lg:sticky lg:top-0 lg:h-screen lg:self-start">
          <div className="tech-panel flex w-full flex-col items-center gap-6 rounded-[2rem] p-10">
            <p className="mono-heading text-base text-sky-300">Scan to Play</p>
            <div className="rounded-2xl bg-white p-5">
              <Image
                src="/quiz-qr.png"
                alt="QR code to start the quiz"
                width={340}
                height={340}
                className="h-auto w-full"
                priority
              />
            </div>
            <p className="text-center text-base text-slate-300">
              Scan to take the quiz!
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
