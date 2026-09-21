import { Clock3, Trophy, UsersRound } from 'lucide-react';
import { getAdminAnalytics, getLeaderboard } from '@/lib/quiz/data';
import { formatDuration, formatScore } from '@/lib/utils';

// Auth-gated and per-request: never prerender this at build time, which would
// otherwise bake participant data into static HTML.
export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const [analytics, leaderboard] = await Promise.all([getAdminAnalytics(), getLeaderboard()]);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <OverviewCard label="Total Participants" value={String(analytics.totalParticipants)} icon={<UsersRound className="h-4 w-4" />} />
        <OverviewCard label="Average Score" value={formatScore(analytics.averageScore)} icon={<Trophy className="h-4 w-4" />} />
        <OverviewCard label="Average Time" value={formatDuration(analytics.averageTimeMs)} icon={<Clock3 className="h-4 w-4" />} />
      </div>

      <div className="tech-panel rounded-xl p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="mono-heading text-xs text-slate-400">Top Performers</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-50">Leaderboard</h2>
          </div>
          <p className="text-sm text-slate-400">Sorted by score, then fastest time.</p>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
            <thead className="bg-slate-950/70 text-slate-400">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Participant</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Correct</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/30 text-slate-200">
              {leaderboard.slice(0, 8).map((entry) => (
                <tr key={`${entry.rank}-${entry.name}`}>
                  <td className="px-4 py-3">{entry.rank}</td>
                  <td className="px-4 py-3">{entry.name}</td>
                  <td className="px-4 py-3">{entry.company}</td>
                  <td className="px-4 py-3">
                    {entry.correctAnswers}/{entry.totalQuestions}
                  </td>
                  <td className="px-4 py-3">{formatDuration(entry.timeTakenMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OverviewCard(props: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="tech-panel rounded-xl p-5">
      <p className="mono-heading flex items-center gap-2 text-[11px] text-slate-400">
        {props.icon}
        {props.label}
      </p>
      <p className="mt-4 text-3xl font-semibold text-slate-50">{props.value}</p>
    </div>
  );
}
