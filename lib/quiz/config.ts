export const QUESTIONS_PER_QUIZ = 5;
export const CORRECT_TO_WIN = 3;

/** Total attempt rows one email may create, finished or not. */
export const MAX_ATTEMPTS_PER_EMAIL = 10;

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
