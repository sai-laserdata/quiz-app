import Link from 'next/link';
import { Download, Trash2 } from 'lucide-react';
import { getParticipants } from '@/lib/quiz/data';
import { deleteParticipantAction, clearAllParticipantsAction } from '@/lib/admin/actions';
import { formatDuration, formatScore } from '@/lib/utils';

// Auth-gated and per-request: never prerender this at build time, which would
// otherwise bake participant data into static HTML.
export const dynamic = 'force-dynamic';

export default async function AdminParticipantsPage() {
  const participants = await getParticipants();

  return (
    <div className="tech-panel rounded-xl p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mono-heading text-xs text-slate-400">Participants</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-50">All quiz participants and their results</h2>
        </div>
        <div className="flex items-center gap-3">
          {participants.length > 0 ? (
            <form action={clearAllParticipantsAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg border border-rose-400/35 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 transition hover:border-rose-300 hover:bg-rose-500/15"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </button>
            </form>
          ) : null}
          <Link
            href="/admin/participants/export"
            className="inline-flex items-center gap-2 rounded-lg border border-sky-400/40 bg-sky-500/20 px-4 py-3 text-sm text-sky-100 transition hover:border-sky-300 hover:bg-sky-400/25"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Link>
        </div>
      </div>

      {participants.length === 0 ? (
        <p className="mt-6 text-sm text-slate-400">No participants yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
            <thead className="bg-slate-950/70 text-slate-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">LinkedIn</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Ticket</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/30 text-slate-200">
              {participants.map((participant) => (
                <tr key={participant.id}>
                  <td className="px-4 py-3">{participant.name}</td>
                  <td className="px-4 py-3">{participant.company}</td>
                  {/* Legacy columns: populated only for attempts taken while the entry form existed. */}
                  <td className="px-4 py-3">{participant.email || '—'}</td>
                  <td className="px-4 py-3">
                    {participant.linkedinUrl ? (
                      <a href={participant.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:text-sky-200">
                        View profile
                      </a>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {formatScore(participant.scorePercentage)} ({participant.correctAnswers}/{participant.totalQuestions})
                  </td>
                  <td className="px-4 py-3">{formatDuration(participant.timeTakenMs)}</td>
                  <td className="px-4 py-3">{participant.goldenTicketCode ?? '—'}</td>
                  <td className="px-4 py-3">
                    <form action={deleteParticipantAction}>
                      <input type="hidden" name="id" value={participant.id} />
                      <button
                        type="submit"
                        className="rounded-xl border border-rose-400/25 bg-rose-500/10 p-2 text-rose-300 transition hover:border-rose-300 hover:bg-rose-500/15"
                        title="Delete participant"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
