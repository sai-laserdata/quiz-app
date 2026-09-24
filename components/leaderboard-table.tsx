'use client';

import { useState } from 'react';
import { Medal, Search, TimerReset, Trash2 } from 'lucide-react';
import { deleteParticipantAction } from '@/lib/admin/actions';
import { cn, displayName, formatDuration, formatScore } from '@/lib/utils';

type Entry = {
  id: string;
  rank: number;
  name: string;
  company: string;
  correctAnswers: number;
  totalQuestions: number;
  scorePercentage: number;
  timeTakenMs: number;
  goldenTicketCode: string | null;
};

export function LeaderboardTable({ entries }: { entries: Entry[] }) {
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? entries.filter((e) => {
        const q = query.toLowerCase();
        return (
          displayName(e.name).toLowerCase().includes(q) ||
          e.company.toLowerCase().includes(q) ||
          (e.goldenTicketCode && e.goldenTicketCode.toLowerCase().includes(q))
        );
      })
    : entries;

  return (
    <>
      <div className="mt-6 flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/55 px-4 py-3 text-sm text-slate-200">
        <Search className="h-4 w-4 text-sky-300" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, company, or ticket code..."
          className="w-full bg-transparent outline-none placeholder:text-slate-600"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-center text-sm text-slate-400">
          No results found for &ldquo;{query}&rdquo;
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800">
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
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/30 text-slate-200">
              {filtered.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2">
                      <Medal className="h-4 w-4 text-sky-300" />
                      {entry.rank}
                    </span>
                  </td>
                  <td className={cn('px-4 py-3', entry.name.trim() ? undefined : 'italic text-slate-500')}>
                    {displayName(entry.name)}
                  </td>
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
                  <td className="px-4 py-3">
                    {entry.goldenTicketCode ? (
                      <span className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs font-medium text-amber-200">
                        {entry.goldenTicketCode}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <form action={deleteParticipantAction}>
                      <input type="hidden" name="id" value={entry.id} />
                      <button
                        type="submit"
                        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                        title={`Delete ${displayName(entry.name)}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
