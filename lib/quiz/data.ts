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
import { hasSupabaseEnv } from '@/lib/supabase/env';
import { scoreQuiz } from '@/lib/quiz/scoring';
import type {
  AdminAnalytics,
  AdminParticipant,
  LeadFormValues,
  LeaderboardEntry,
  QuestionOptionKey,
  QuizQuestion,
  QuizResult
} from '@/lib/types';

import { QUESTIONS_PER_QUIZ, pickRandom } from '@/lib/quiz/config';

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
  if (!hasSupabaseEnv()) {
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
  if (!hasSupabaseEnv()) {
    return hasDemoSubmittedAttempt(email);
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('id')
    .eq('email', email)
    .not('submitted_at', 'is', null)
    .limit(1);

  if (error) {
    throw new Error(`Failed to check for existing attempt: ${error.message}`);
  }

  return (data ?? []).length > 0;
}

export async function startQuizAttempt(lead: LeadFormValues) {
  if (!hasSupabaseEnv()) {
    const demo = await startDemoAttempt(lead);
    return {
      attemptId: demo.attemptId,
      questions: demo.questions.map(({ correctOption: _correctOption, isActive: _isActive, ...question }) => question)
    };
  }

  const attemptId = randomUUID();
  const allQuestions = await getActiveQuestions();
  const questions = pickRandom(allQuestions, QUESTIONS_PER_QUIZ);
  const publicQuestions = questions.map(({ correctOption: _correctOption, isActive: _isActive, ...question }) => question);

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from('quiz_attempts').insert({
    id: attemptId,
    name: lead.name,
    email: lead.email,
    linkedin_url: lead.linkedinUrl,
    company: lead.company,
    started_at: new Date().toISOString(),
    total_questions: questions.length
  });

  if (error) {
    throw new Error(`Failed to create quiz attempt: ${error.message}`);
  }

  return { attemptId, questions: publicQuestions };
}

export async function submitQuizAttempt(input: {
  attemptId: string;
  answers: Record<string, QuestionOptionKey>;
  elapsedMs: number;
}): Promise<QuizResult> {
  if (!hasSupabaseEnv()) {
    return submitDemoAttempt(input);
  }

  const allQuestions = await getActiveQuestions();
  const answeredIds = new Set(Object.keys(input.answers));
  const questions = allQuestions.filter((q) => answeredIds.has(q.id));
  const result = scoreQuiz(questions, input.answers, input.attemptId, input.elapsedMs);

  const supabase = createServiceRoleClient();

  const answerRows = questions.map((question, index) => ({
    attempt_id: input.attemptId,
    question_id: question.id,
    selected_option: input.answers[question.id] ?? null,
    is_correct: input.answers[question.id] === question.correctOption,
    answer_order: index + 1
  }));

  const { error: answersError } = await supabase.from('quiz_answers').upsert(answerRows, {
    onConflict: 'attempt_id,question_id'
  });

  if (answersError) {
    throw new Error(`Failed to save answers: ${answersError.message}`);
  }

  const { error: attemptError } = await supabase
    .from('quiz_attempts')
    .update({
      submitted_at: new Date().toISOString(),
      time_taken_ms: result.elapsedMs,
      correct_answers: result.correctAnswers,
      score_percentage: result.scorePercentage,
      golden_ticket_code: result.goldenTicketCode
    })
    .eq('id', input.attemptId);

  if (attemptError) {
    throw new Error(`Failed to finalize attempt: ${attemptError.message}`);
  }

  return result;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!hasSupabaseEnv()) {
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
    .select('name, company, correct_answers, total_questions, score_percentage, time_taken_ms, golden_ticket_code')
    .not('submitted_at', 'is', null)
    .order('correct_answers', { ascending: false })
    .order('time_taken_ms', { ascending: true })
    .limit(100);

  if (error) {
    throw new Error(`Failed to load leaderboard: ${error.message}`);
  }

  return (data ?? []).map((entry, index) => ({
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
  if (!hasSupabaseEnv()) {
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
  if (!hasSupabaseEnv()) {
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
  if (!hasSupabaseEnv()) {
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
  if (!hasSupabaseEnv()) {
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
  if (!hasSupabaseEnv()) {
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
  if (!hasSupabaseEnv()) {
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
  if (!hasSupabaseEnv()) {
    await clearAllDemoParticipants();
    return;
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from('quiz_attempts').delete().neq('id', '');

  if (error) {
    throw new Error(`Failed to clear participants: ${error.message}`);
  }
}
