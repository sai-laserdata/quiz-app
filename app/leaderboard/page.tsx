import Link from 'next/link';
import { ArrowLeft, Medal, TimerReset } from 'lucide-react';
import { getLeaderboard } from '@/lib/quiz/data';
import { formatDuration, formatScore } from '@/lib/utils';
import { AutoRefresh } from '@/components/auto-refresh';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  const entries = await getLeaderboard();

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10 lg:px-10">
      <AutoRefresh intervalMs={10000} />
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-slate-100">
        <ArrowLeft className="h-4 w-4" />
        Back to quiz
      </Link>

      <section className="tech-panel rounded-[2rem] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mono-heading text-xs text-sky-300">Public Leaderboard</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-50">Fastest strong signals rise to the top</h1>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-slate-400">
            <span className="rounded-full border border-slate-700 px-3 py-1">Primary sort: Correct answers desc</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">Tiebreak: Time taken asc</span>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
            <thead className="bg-slate-950/70 text-slate-400">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Participant</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Correct</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Ticket</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/30 text-slate-200">
              {entries.map((entry) => (
                <tr key={`${entry.rank}-${entry.name}`}>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <Medal className="h-4 w-4 text-sky-300" />
                      {entry.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">{entry.name}</td>
                  <td className="px-4 py-3">{entry.company}</td>
                  <td className="px-4 py-3">
                    {entry.correctAnswers}/{entry.totalQuestions}
                  </td>
                  <td className="px-4 py-3">{formatScore(entry.scorePercentage)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <TimerReset className="h-4 w-4 text-slate-500" />
                      {formatDuration(entry.timeTakenMs)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{entry.goldenTicketCode ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
