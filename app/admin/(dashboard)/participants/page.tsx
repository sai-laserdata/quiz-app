import Link from 'next/link';
import { Download } from 'lucide-react';
import { getParticipants } from '@/lib/quiz/data';
import { formatDuration, formatScore } from '@/lib/utils';

export default async function AdminParticipantsPage() {
  const participants = await getParticipants();

  return (
    <div className="tech-panel rounded-[2rem] p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mono-heading text-xs text-slate-400">Lead Export</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-50">Qualified leads and their performance data</h2>
        </div>
        <Link
          href="/admin/participants/export"
          className="inline-flex items-center gap-2 rounded-2xl border border-sky-400/40 bg-sky-500/20 px-4 py-3 text-sm text-sky-100 transition hover:border-sky-300 hover:bg-sky-400/25"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800">
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/30 text-slate-200">
            {participants.map((participant) => (
              <tr key={participant.id}>
                <td className="px-4 py-3">{participant.name}</td>
                <td className="px-4 py-3">{participant.company}</td>
                <td className="px-4 py-3">{participant.email}</td>
                <td className="px-4 py-3">
                  <a href={participant.linkedinUrl} target="_blank" rel="noreferrer" className="text-sky-300 hover:text-sky-200">
                    View profile
                  </a>
                </td>
                <td className="px-4 py-3">
                  {formatScore(participant.scorePercentage)} ({participant.correctAnswers}/{participant.totalQuestions})
                </td>
                <td className="px-4 py-3">{formatDuration(participant.timeTakenMs)}</td>
                <td className="px-4 py-3">{participant.goldenTicketCode ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
