import type { NextResponse } from 'next/server';

import { ATTEMPT_COOKIE_MAX_AGE_S } from '@/lib/quiz/config';

/**
 * The quiz no longer asks who you are, so "one attempt per person" is anchored
 * on this cookie instead of an email address. It holds nothing but the attempt
 * id, and the only power it grants is over that one attempt -- reading its
 * result back, and naming it for the leaderboard.
 *
 * A new browser profile defeats it. That is the right trade at a booth: the
 * cost of a determined replay is one duplicate row, the cost of a hard gate is
 * everyone who won't hand over an email.
 */
export const ATTEMPT_COOKIE = 'ld_quiz_attempt';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Returns the attempt id the browser is carrying, or null if there isn't a usable one. */
export function readAttemptCookie(request: Request): string | null {
  const header = request.headers.get('cookie');

  if (!header) {
    return null;
  }

  for (const part of header.split(';')) {
    const separator = part.indexOf('=');

    if (separator === -1) {
      continue;
    }

    if (part.slice(0, separator).trim() !== ATTEMPT_COOKIE) {
      continue;
    }

    const value = decodeURIComponent(part.slice(separator + 1).trim());
    return UUID_PATTERN.test(value) ? value : null;
  }

  return null;
}

export function attachAttemptCookie<T extends NextResponse>(response: T, attemptId: string): T {
  response.cookies.set(ATTEMPT_COOKIE, attemptId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ATTEMPT_COOKIE_MAX_AGE_S
  });

  return response;
}
