import { NextResponse } from 'next/server';
import { submitQuizAttempt } from '@/lib/quiz/data';
import { QuizRequestError } from '@/lib/quiz/errors';
import type { QuizSubmitPayload } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as QuizSubmitPayload;

    if (typeof payload?.attemptId !== 'string' || !payload.attemptId || typeof payload?.answers !== 'object' || !payload.answers) {
      return NextResponse.json({ error: 'Invalid submission payload.' }, { status: 400 });
    }

    // Scoring and timing are derived server-side from the recorded attempt.
    const result = await submitQuizAttempt({
      attemptId: payload.attemptId,
      answers: payload.answers
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof QuizRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('quiz/submit failed', error);
    return NextResponse.json({ error: 'Unable to submit quiz.' }, { status: 500 });
  }
}
