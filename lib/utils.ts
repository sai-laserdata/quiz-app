import clsx from 'clsx';

export function cn(...values: Array<string | false | null | undefined>) {
  return clsx(...values);
}

export function formatDuration(ms: number) {
  const totalMs = Math.max(0, Math.round(ms));
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const milliseconds = totalMs % 1000;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
}

export function formatScore(scorePercentage: number) {
  return `${scorePercentage.toFixed(1)}%`;
}

/**
 * Crockford-style alphabet: no 0/O, 1/I/L, or U, so codes read aloud at a busy
 * booth cannot be transcribed ambiguously.
 */
const TICKET_ALPHABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';
const TICKET_LENGTH = 5;

/**
 * Deterministic per (seed, salt). 30^5 ~= 24.3M codes; `golden_ticket_code` is
 * unique in the database, so the caller bumps `salt` and retries on the rare
 * collision rather than failing the participant's submission.
 */
export function generateGoldenTicketCode(seed: string, salt = 0) {
  const normalizedSeed = seed.trim().toUpperCase();
  let state = 2166136261 >>> 0;

  for (const character of normalizedSeed) {
    state = (state * 33 + character.charCodeAt(0)) >>> 0;
  }

  state = (state + salt * 2654435761) >>> 0;

  const token: string[] = [];

  while (token.length < TICKET_LENGTH) {
    state = (state * 1664525 + 1013904223) >>> 0;
    // High bits: the low bits of an LCG cycle poorly.
    token.push(TICKET_ALPHABET[(state >>> 16) % TICKET_ALPHABET.length]);
  }

  return `IGGY-${token.join('')}`;
}

/** Single definition of email identity, used for the one-attempt-per-person rule. */
export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
