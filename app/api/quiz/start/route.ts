import { NextResponse } from 'next/server';
import { getAttemptSnapshot, startQuizAttempt } from '@/lib/quiz/data';
import { QuizRequestError } from '@/lib/quiz/errors';
import { consumeRateLimit } from '@/lib/quiz/rate-limit';
import { attachAttemptCookie, readAttemptCookie } from '@/lib/quiz/player-session';
import { START_RATE_LIMIT, START_RATE_WINDOW_MS } from '@/lib/quiz/config';
import { sanitizePlayerName } from '@/lib/utils';
import type { AlreadyPlayedResponse, QuizStartPayload } from '@/lib/types';

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
    const payload = (await request.json().catch(() => null)) as QuizStartPayload | null;
    const existingAttemptId = readAttemptCookie(request);

    // One attempt per browser. A finished run hands the result straight back
    // rather than erroring -- people close the tab and come looking for their
    // claim code, and the next person at a shared tablet deserves an
    // explanation rather than a stranger's score. An unfinished attempt is an
    // abandoned or refreshed run, so it falls through to a fresh one.
    if (existingAttemptId && !payload?.restart) {
      const snapshot = await getAttemptSnapshot(existingAttemptId);

      if (snapshot) {
        const body: AlreadyPlayedResponse = {
          alreadyPlayed: true,
          name: snapshot.name,
          result: snapshot.result
        };
        return NextResponse.json(body, { status: 409 });
      }
    }

    // The name is optional, and so is the whole payload. Nothing here can block a start.
    const player = { name: sanitizePlayerName(payload?.player?.name) };

    const result = await startQuizAttempt(player);
    return attachAttemptCookie(NextResponse.json(result), result.attemptId);
  } catch (error) {
    if (error instanceof QuizRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error('quiz/start failed', error);
    return NextResponse.json({ error: 'Unable to start quiz.' }, { status: 500 });
  }
}
