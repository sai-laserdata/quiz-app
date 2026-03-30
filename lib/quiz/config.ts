export const QUESTIONS_PER_QUIZ = 5;

export function pickRandom<T>(items: T[], count: number): T[] {
  const shuffled = items.slice().sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
