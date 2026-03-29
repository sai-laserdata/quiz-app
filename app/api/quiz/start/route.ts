import { NextResponse } from 'next/server';
import { hasSubmittedAttempt, startQuizAttempt } from '@/lib/quiz/data';
import type { QuizStartPayload } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as QuizStartPayload;
    const lead = payload.lead;

    if (!lead?.name || !lead?.email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    const allowedEmailPattern = /^[^\s@]+@(gmail\.com|googlemail\.com|outlook\.com|hotmail\.com|live\.com)$/i;
    if (!allowedEmailPattern.test(lead.email)) {
      return NextResponse.json({ error: 'Only Gmail and Outlook email addresses are accepted.' }, { status: 400 });
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
    const message = error instanceof Error ? error.message : 'Unable to start quiz.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
