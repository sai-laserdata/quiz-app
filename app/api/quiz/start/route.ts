import { NextResponse } from 'next/server';
import { startQuizAttempt } from '@/lib/quiz/data';
import type { QuizStartPayload } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as QuizStartPayload;
    const lead = payload.lead;

    if (!lead?.name || !lead?.email || !lead?.linkedinUrl || !lead?.company) {
      return NextResponse.json({ error: 'Missing required lead fields.' }, { status: 400 });
    }

    const result = await startQuizAttempt(lead);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to start quiz.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
