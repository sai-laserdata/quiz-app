export const QUESTIONS_PER_QUIZ = 5;
export const CORRECT_TO_WIN = 3;

/** Longest name we store. Long enough for a real one, short enough for a table cell. */
export const NAME_MAX_LENGTH = 60;

/**
 * How long the one-attempt cookie lives: a single conference day. Identity is
 * optional now, so this cookie -- not an email address -- is what stops one
 * person from filling the leaderboard.
 */
export const ATTEMPT_COOKIE_MAX_AGE_S = 12 * 60 * 60;

/** Coarse burst guard on the public start endpoint. */
export const START_RATE_LIMIT = 30;
export const START_RATE_WINDOW_MS = 60_000;

export function pickRandom<T>(items: T[], count: number): T[] {
  const shuffled = items.slice();

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
}
