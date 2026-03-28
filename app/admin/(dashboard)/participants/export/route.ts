import { assertAdmin } from '@/lib/admin/auth';
import { getParticipants } from '@/lib/quiz/data';

export async function GET() {
  try {
    await assertAdmin();
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }

  const participants = await getParticipants();
  const header = ['name', 'email', 'linkedin_url', 'company', 'score_percentage', 'correct_answers', 'total_questions', 'time_taken_ms', 'golden_ticket_code', 'submitted_at'];

  const rows = participants.map((participant) =>
    [
      participant.name,
      participant.email,
      participant.linkedinUrl,
      participant.company,
      participant.scorePercentage,
      participant.correctAnswers,
      participant.totalQuestions,
      participant.timeTakenMs,
      participant.goldenTicketCode ?? '',
      participant.submittedAt
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(',')
  );

  const csv = [header.join(','), ...rows].join('\n');

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="quiz-leads.csv"'
    }
  });
}
