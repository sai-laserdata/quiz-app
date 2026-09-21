import { randomUUID } from 'crypto';
import {
  clearAllDemoParticipants,
  deleteDemoParticipant,
  deleteDemoQuestion,
  getDemoParticipants,
  getDemoQuestions,
  hasDemoSubmittedAttempt,
  startDemoAttempt,
  submitDemoAttempt,
  upsertDemoQuestion
} from '@/lib/quiz/demo-store';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { shouldUseDemoStore } from '@/lib/supabase/env';
import { elapsedSince, pickServedAnswers, scoreQuiz } from '@/lib/quiz/scoring';
import { QuizRequestError } from '@/lib/quiz/errors';
import type {
  AdminAnalytics,
  AdminParticipant,
  LeadFormValues,
  LeaderboardEntry,
  QuestionOptionKey,
  QuizQuestion,
  QuizResult
} from '@/lib/types';

import { MAX_ATTEMPTS_PER_EMAIL, QUESTIONS_PER_QUIZ, pickRandom } from '@/lib/quiz/config';
import { generateGoldenTicketCode, normalizeEmail } from '@/lib/utils';

const MAX_TICKET_CODE_ATTEMPTS = 5;

function mapQuestionRow(row: {
  id: string;
  position: number;
  prompt: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: QuestionOptionKey;
 }): QuizQuestion {
  return {
    id: row.id,
    position: row.position,
    prompt: row.prompt,
    options: {
      A: row.option_a,
      B: row.option_b,
      C: row.option_c,
      D: row.option_d
    },
    correctOption: row.correct_option,
    isActive: (row as { is_active?: boolean }).is_active ?? true
  };
}

export async function getActiveQuestions() {
  if (shouldUseDemoStore()) {
    return (await getDemoQuestions()).filter((question) => question.isActive);
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('questions')
    .select('id, position, prompt, option_a, option_b, option_c, option_d, correct_option, is_active')
    .eq('is_active', true)
    .order('position', { ascending: true });

  if (error) {
    throw new Error(`Failed to load questions: ${error.message}`);
  }

  return (data ?? []).map(mapQuestionRow);
}

export async function hasSubmittedAttempt(email: string): Promise<boolean> {
  if (shouldUseDemoStore()) {
    return hasDemoSubmittedAttempt(email);
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('id')
    .eq('email_normalized', normalizeEmail(email))
    .not('submitted_at', 'is', null)
    .limit(1);

  if (error) {
    throw new Error(`Failed to check for existing attempt: ${error.message}`);
  }

  return (data ?? []).length > 0;
}

/**
 * Bounds row growth from someone repeatedly hitting "Start Quiz" without
 * finishing. Keyed on the person rather than the IP, because a conference
 * shares one NAT.
 */
async function assertAttemptQuotaAvailable(email: string) {
  const supabase = createServiceRoleClient();
  const { count, error } = await supabase
    .from('quiz_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('email_normalized', normalizeEmail(email));

  if (error) {
    throw new Error(`Failed to check attempt quota: ${error.message}`);
  }

  if ((count ?? 0) >= MAX_ATTEMPTS_PER_EMAIL) {
    throw new QuizRequestError('Too many quiz attempts for this email address.', 429);
  }
}

export async function startQuizAttempt(lead: LeadFormValues) {
  if (shouldUseDemoStore()) {
    const demo = await startDemoAttempt(lead);
    return {
      attemptId: demo.attemptId,
      questions: demo.questions.map(({ correctOption: _correctOption, isActive: _isActive, ...question }) => question)
    };
  }

  await assertAttemptQuotaAvailable(lead.email);

  const attemptId = randomUUID();
  const allQuestions = await getActiveQuestions();
  const questions = pickRandom(allQuestions, QUESTIONS_PER_QUIZ);

  if (questions.length === 0) {
    throw new QuizRequestError('No active questions are configured for the quiz.', 503);
  }

  const publicQuestions = questions.map(({ correctOption: _correctOption, isActive: _isActive, ...question }) => question);

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from('quiz_attempts').insert({
    id: attemptId,
    name: lead.name,
    email: lead.email,
    linkedin_url: lead.linkedinUrl,
    company: lead.company,
    started_at: new Date().toISOString(),
    total_questions: questions.length,
    served_question_ids: questions.map((question) => question.id)
  });

  if (error) {
    throw new Error(`Failed to create quiz attempt: ${error.message}`);
  }

  return { attemptId, questions: publicQuestions };
}

export async function submitQuizAttempt(input: {
  attemptId: string;
  answers: Record<string, QuestionOptionKey>;
}): Promise<QuizResult> {
  if (shouldUseDemoStore()) {
    return submitDemoAttempt(input);
  }

  const supabase = createServiceRoleClient();

  const { data: attempt, error: lookupError } = await supabase
    .from('quiz_attempts')
    .select('id, started_at, submitted_at, served_question_ids')
    .eq('id', input.attemptId)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Failed to load quiz attempt: ${lookupError.message}`);
  }

  if (!attempt) {
    throw new QuizRequestError('Unknown quiz attempt.', 404);
  }

  if (attempt.submitted_at) {
    throw new QuizRequestError('This quiz attempt has already been submitted.', 409);
  }

  const servedQuestionIds: string[] = attempt.served_question_ids ?? [];

  if (servedQuestionIds.length === 0) {
    throw new QuizRequestError('This quiz attempt has no recorded questions. Please start a new quiz.', 409);
  }

  // Score against the questions the server served, including the answer key,
  // rather than anything the client echoes back.
  const { data: questionRows, error: questionsError } = await supabase
    .from('questions')
    .select('id, position, prompt, option_a, option_b, option_c, option_d, correct_option, is_active')
    .in('id', servedQuestionIds);

  if (questionsError) {
    throw new Error(`Failed to load questions for scoring: ${questionsError.message}`);
  }

  const questionsById = new Map((questionRows ?? []).map((row) => [row.id, mapQuestionRow(row)]));
  const questions = servedQuestionIds
    .map((questionId) => questionsById.get(questionId))
    .filter((question): question is QuizQuestion => Boolean(question));

  const answers = pickServedAnswers(servedQuestionIds, input.answers);
  let result = scoreQuiz(questions, answers, input.attemptId, elapsedSince(attempt.started_at));

  // Guarded update: only the first submission wins, so a replayed request
  // cannot overwrite a recorded result. `golden_ticket_code` is unique, so a
  // code collision is retried with a fresh salt rather than costing the
  // participant their result.
  for (let salt = 0; ; salt += 1) {
    const { data: finalized, error: attemptError } = await supabase
      .from('quiz_attempts')
      .update({
        submitted_at: new Date().toISOString(),
        time_taken_ms: result.elapsedMs,
        correct_answers: result.correctAnswers,
        total_questions: result.totalQuestions,
        score_percentage: result.scorePercentage,
        golden_ticket_code: result.goldenTicketCode
      })
      .eq('id', input.attemptId)
      .is('submitted_at', null)
      .select('id');

    if (!attemptError) {
      if (!finalized || finalized.length === 0) {
        throw new QuizRequestError('This quiz attempt has already been submitted.', 409);
      }
      break;
    }

    const isTicketCollision =
      attemptError.code === '23505' &&
      `${attemptError.message} ${attemptError.details ?? ''}`.includes('golden_ticket_code');

    if (!isTicketCollision || !result.goldenTicketCode || salt >= MAX_TICKET_CODE_ATTEMPTS) {
      throw new Error(`Failed to finalize attempt: ${attemptError.message}`);
    }

    result = { ...result, goldenTicketCode: generateGoldenTicketCode(input.attemptId, salt + 1) };
  }

  const answerRows = questions.map((question, index) => ({
    attempt_id: input.attemptId,
    question_id: question.id,
    selected_option: answers[question.id] ?? null,
    is_correct: answers[question.id] === question.correctOption,
    answer_order: index + 1
  }));

  const { error: answersError } = await supabase.from('quiz_answers').upsert(answerRows, {
    onConflict: 'attempt_id,question_id'
  });

  if (answersError) {
    throw new Error(`Failed to save answers: ${answersError.message}`);
  }

  return result;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  if (shouldUseDemoStore()) {
    const participants = await getDemoParticipants();
    return participants
      .slice()
      .sort((left, right) => {
        if (left.correctAnswers !== right.correctAnswers) {
          return right.correctAnswers - left.correctAnswers;
        }
        return left.timeTakenMs - right.timeTakenMs;
      })
      .map((participant, index) => ({
        id: participant.id,
        rank: index + 1,
        name: participant.name,
        company: participant.company,
        correctAnswers: participant.correctAnswers,
        totalQuestions: participant.totalQuestions,
        scorePercentage: participant.scorePercentage,
        timeTakenMs: participant.timeTakenMs,
        goldenTicketCode: participant.goldenTicketCode
      }));
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('id, name, company, correct_answers, total_questions, score_percentage, time_taken_ms, golden_ticket_code')
    .not('submitted_at', 'is', null)
    .order('correct_answers', { ascending: false })
    .order('time_taken_ms', { ascending: true })
    .limit(100);

  if (error) {
    throw new Error(`Failed to load leaderboard: ${error.message}`);
  }

  return (data ?? []).map((entry, index) => ({
    id: entry.id,
    rank: index + 1,
    name: entry.name,
    company: entry.company,
    correctAnswers: entry.correct_answers,
    totalQuestions: entry.total_questions,
    scorePercentage: Number(entry.score_percentage ?? 0),
    timeTakenMs: entry.time_taken_ms,
    goldenTicketCode: entry.golden_ticket_code
  }));
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  if (shouldUseDemoStore()) {
    const participants = await getDemoParticipants();
    return {
      totalParticipants: participants.length,
      averageScore:
        participants.length === 0 ? 0 : participants.reduce((sum, participant) => sum + participant.scorePercentage, 0) / participants.length,
      averageTimeMs:
        participants.length === 0 ? 0 : participants.reduce((sum, participant) => sum + participant.timeTakenMs, 0) / participants.length
    };
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.rpc('quiz_admin_summary');

  if (error) {
    throw new Error(`Failed to load analytics: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : data;
  return {
    totalParticipants: Number(row?.total_participants ?? 0),
    averageScore: Number(row?.average_score ?? 0),
    averageTimeMs: Number(row?.average_time_ms ?? 0)
  };
}

export async function getParticipants(): Promise<AdminParticipant[]> {
  if (shouldUseDemoStore()) {
    return getDemoParticipants();
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select(
      'id, name, email, linkedin_url, company, correct_answers, total_questions, score_percentage, time_taken_ms, golden_ticket_code, submitted_at'
    )
    .not('submitted_at', 'is', null)
    .order('submitted_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to load participants: ${error.message}`);
  }

  return (data ?? []).map((participant) => ({
    id: participant.id,
    name: participant.name,
    email: participant.email,
    linkedinUrl: participant.linkedin_url,
    company: participant.company,
    correctAnswers: participant.correct_answers,
    totalQuestions: participant.total_questions,
    scorePercentage: Number(participant.score_percentage ?? 0),
    timeTakenMs: participant.time_taken_ms,
    goldenTicketCode: participant.golden_ticket_code,
    submittedAt: participant.submitted_at
  }));
}

export async function getAllQuestions() {
  if (shouldUseDemoStore()) {
    return getDemoQuestions();
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('questions')
    .select('id, position, prompt, option_a, option_b, option_c, option_d, correct_option, is_active')
    .order('position', { ascending: true });

  if (error) {
    throw new Error(`Failed to load questions: ${error.message}`);
  }

  return (data ?? []).map(mapQuestionRow);
}

export async function saveQuestion(input: {
  id?: string;
  position: number;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: QuestionOptionKey;
  isActive: boolean;
}) {
  if (shouldUseDemoStore()) {
    await upsertDemoQuestion(input);
    return;
  }

  const supabase = createServiceRoleClient();
  const payload = {
    position: input.position,
    prompt: input.prompt,
    option_a: input.optionA,
    option_b: input.optionB,
    option_c: input.optionC,
    option_d: input.optionD,
    correct_option: input.correctOption,
    is_active: input.isActive
  };

  if (input.id) {
    const { error } = await supabase.from('questions').update(payload).eq('id', input.id);
    if (error) {
      throw new Error(`Failed to update question: ${error.message}`);
    }
    return;
  }

  const { error } = await supabase.from('questions').insert(payload);
  if (error) {
    throw new Error(`Failed to create question: ${error.message}`);
  }
}

export async function removeQuestion(id: string) {
  if (shouldUseDemoStore()) {
    await deleteDemoQuestion(id);
    return;
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from('questions').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete question: ${error.message}`);
  }
}

export async function removeParticipant(id: string) {
  if (shouldUseDemoStore()) {
    await deleteDemoParticipant(id);
    return;
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from('quiz_attempts').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete participant: ${error.message}`);
  }
}

export async function clearAllParticipants() {
  if (shouldUseDemoStore()) {
    await clearAllDemoParticipants();
    return;
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from('quiz_attempts').delete().not('id', 'is', null);

  if (error) {
    throw new Error(`Failed to clear participants: ${error.message}`);
  }
}
