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

          <section className="tech-panel flex-1 rounded-xl p-6">
            <div>
              <p className="mono-heading text-xs text-sky-300">Leaderboard</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-50">Top performers</h1>
            </div>

            <LeaderboardTable entries={entries} />
          </section>
        </div>

        <aside className="flex items-center justify-center lg:sticky lg:top-0 lg:h-screen lg:self-start">
          <div className="tech-panel flex w-full flex-col items-center gap-6 rounded-xl p-10">
            <Image
              src="/laserdata-logo.svg"
              alt="LaserData logo"
              width={160}
              height={40}
              className="h-auto"
              priority
            />
            <div className="text-center">
              <h2 className="text-xl font-semibold text-slate-50">Can You Think in Streams?</h2>
              <p className="mt-2 text-sm text-slate-400">
                Scan, solve, score. Get 3 right and the Iggy tee is yours.
              </p>
            </div>
            <div className="rounded-lg bg-white p-5">
              <Image
                src="/quiz-qr.png"
                alt="QR code to start the quiz"
                width={340}
                height={340}
                className="h-auto w-full"
                priority
              />
            </div>
            <p className="mono-heading text-sm text-sky-300">Scan to Play</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
