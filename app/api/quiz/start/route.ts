import { NextResponse } from 'next/server';
import { hasSubmittedAttempt, startQuizAttempt } from '@/lib/quiz/data';
import { QuizRequestError } from '@/lib/quiz/errors';
import { consumeRateLimit } from '@/lib/quiz/rate-limit';
import { START_RATE_LIMIT, START_RATE_WINDOW_MS } from '@/lib/quiz/config';
import type { QuizStartPayload } from '@/lib/types';

export async function POST(request: Request) {
  // Coarse burst guard. Not keyed on IP: a conference shares one NAT, so an IP
  // limit would lock out the queue rather than the abuser.
  const burst = consumeRateLimit('quiz:start', START_RATE_LIMIT, START_RATE_WINDOW_MS);

  if (!burst.allowed) {
    return NextResponse.json(
      { error: 'The quiz is busy right now. Please try again in a moment.' },
      { status: 429, headers: { 'Retry-After': String(burst.retryAfterSeconds) } }
    );
  }

  try {
    const payload = (await request.json()) as QuizStartPayload;
    const lead = payload.lead;

    if (!lead?.name || !lead?.email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    // Default optional fields
    lead.linkedinUrl = lead.linkedinUrl || '';
    lead.company = lead.company || '';

    const alreadyTaken = await hasSubmittedAttempt(lead.email);
    if (alreadyTaken) {
      return NextResponse.json(
        { error: "You've already taken the quiz. Each participant gets one attempt." },
        { status: 409 }
      );
    }

    const result = await startQuizAttempt(lead);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof QuizRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('quiz/start failed', error);
    return NextResponse.json({ error: 'Unable to start quiz.' }, { status: 500 });
  }
}
