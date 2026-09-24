import { NextResponse } from 'next/server';
import { setAttemptName } from '@/lib/quiz/data';
import { QuizRequestError } from '@/lib/quiz/errors';
import { readAttemptCookie } from '@/lib/quiz/player-session';
import { sanitizePlayerName } from '@/lib/utils';
import type { QuizNamePayload } from '@/lib/types';

/**
 * Adds a name to a finished run, for the player who skipped the field up front.
 * Authorised by the attempt cookie alone -- it can only ever name the attempt
 * this browser started, so there is nothing here to authenticate against.
 */
export async function POST(request: Request) {
  try {
    const payload = (await request.json().catch(() => null)) as QuizNamePayload | null;
    const attemptId = readAttemptCookie(request);

    if (!attemptId || !payload?.attemptId || attemptId !== payload.attemptId) {
      return NextResponse.json({ error: 'This quiz attempt is not yours to name.' }, { status: 403 });
    }

    const name = sanitizePlayerName(payload.name);

    if (!name) {
      return NextResponse.json({ name: '' });
    }

    return NextResponse.json({ name: await setAttemptName(attemptId, name) });
  } catch (error) {
    if (error instanceof QuizRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('quiz/name failed', error);
    return NextResponse.json({ error: 'Unable to save your name.' }, { status: 500 });
  }
}
