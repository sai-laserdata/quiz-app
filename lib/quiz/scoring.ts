import type { QuestionOptionKey, QuizQuestion } from '@/lib/types';
import { generateGoldenTicketCode } from '@/lib/utils';

export function scoreQuiz(questions: QuizQuestion[], answers: Record<string, QuestionOptionKey>, attemptId: string, elapsedMs: number) {
  const correctAnswers = questions.reduce((sum, question) => {
    return sum + Number(answers[question.id] === question.correctOption);
  }, 0);

  const totalQuestions = questions.length;
  const scorePercentage = totalQuestions === 0 ? 0 : (correctAnswers / totalQuestions) * 100;
  const goldenTicketCode = scorePercentage >= 90 ? generateGoldenTicketCode(attemptId) : null;

  return {
    attemptId,
    correctAnswers,
    totalQuestions,
    scorePercentage,
    elapsedMs,
    goldenTicketCode
  };
}
