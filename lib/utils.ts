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

export function generateGoldenTicketCode(seed: string) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const normalizedSeed = seed.trim().toUpperCase();
  let state = 0;

  for (const character of normalizedSeed) {
    state = (state * 33 + character.charCodeAt(0)) >>> 0;
  }

  const token: string[] = [];

  while (token.length < 4) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const nextCharacter = alphabet[state % alphabet.length];

    if (!token.includes(nextCharacter)) {
      token.push(nextCharacter);
    }
  }

  return `IGGY-${token.join('')}`;
}
