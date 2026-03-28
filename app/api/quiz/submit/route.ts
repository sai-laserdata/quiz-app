import { NextResponse } from 'next/server';
import { submitQuizAttempt } from '@/lib/quiz/data';
import type { QuizSubmitPayload } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as QuizSubmitPayload;

    if (!payload.attemptId || !payload.answers || typeof payload.elapsedMs !== 'number') {
      return NextResponse.json({ error: 'Invalid submission payload.' }, { status: 400 });
    }

    const result = await submitQuizAttempt(payload);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to submit quiz.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
