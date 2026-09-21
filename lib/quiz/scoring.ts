import type { QuestionOptionKey, QuizQuestion } from '@/lib/types';
import { generateGoldenTicketCode } from '@/lib/utils';
import { CORRECT_TO_WIN } from '@/lib/quiz/config';

export function scoreQuiz(questions: QuizQuestion[], answers: Record<string, QuestionOptionKey>, attemptId: string, elapsedMs: number) {
  const correctAnswers = questions.reduce((sum, question) => {
    return sum + Number(answers[question.id] === question.correctOption);
  }, 0);

  const missedPrompts = questions
    .filter((question) => answers[question.id] !== question.correctOption)
    .map((question) => question.prompt);

  const totalQuestions = questions.length;
  const scorePercentage = totalQuestions === 0 ? 0 : (correctAnswers / totalQuestions) * 100;
  const threshold = Math.min(CORRECT_TO_WIN, totalQuestions);
  const goldenTicketCode = correctAnswers >= threshold ? generateGoldenTicketCode(attemptId) : null;

  return {
    attemptId,
    correctAnswers,
    totalQuestions,
    scorePercentage,
    elapsedMs,
    goldenTicketCode,
    missedPrompts
  };
}

/**
 * Elapsed time is derived from the server-recorded start, never from a value
 * the client sends -- otherwise any participant can claim a 1ms finish.
 */
export function elapsedSince(startedAt: string) {
  const startedMs = new Date(startedAt).getTime();

  if (!Number.isFinite(startedMs)) {
    return 0;
  }

  return Math.max(0, Date.now() - startedMs);
}

/**
 * Keeps only well-formed answers for questions the server actually served, so
 * the client cannot choose its own question set or its own denominator.
 */
export function pickServedAnswers(
  servedQuestionIds: string[],
  answers: Record<string, QuestionOptionKey> | null | undefined
) {
  const selected: Record<string, QuestionOptionKey> = {};

  for (const questionId of servedQuestionIds) {
    const answer = answers?.[questionId];

    if (answer === 'A' || answer === 'B' || answer === 'C' || answer === 'D') {
      selected[questionId] = answer;
    }
  }

  return selected;
}
