import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { sampleParticipants, sampleQuestions } from '@/lib/quiz/sample-data';
import { elapsedSince, pickServedAnswers, scoreQuiz } from '@/lib/quiz/scoring';
import { QuizRequestError } from '@/lib/quiz/errors';
import { generateGoldenTicketCode, sanitizePlayerName } from '@/lib/utils';
import { QUESTIONS_PER_QUIZ, pickRandom } from '@/lib/quiz/config';
import type { AdminParticipant, PlayerFormValues, QuestionOptionKey, QuizQuestion, QuizResult } from '@/lib/types';

type DemoAttempt = {
  id: string;
  name: string;
  email: string;
  linkedinUrl: string;
  company: string;
  startedAt: string;
  submittedAt: string | null;
  timeTakenMs: number | null;
  answers: Record<string, QuestionOptionKey>;
  servedQuestionIds?: string[];
  correctAnswers: number;
  totalQuestions: number;
  scorePercentage: number;
  goldenTicketCode: string | null;
};

type DemoStore = {
  questions: QuizQuestion[];
  attempts: DemoAttempt[];
};

const demoStorePath = path.join(process.cwd(), 'data', 'demo-store.json');

let storeInitialized = false;
let cachedStore: DemoStore | null = null;

function buildInitialStore(): DemoStore {
  return {
    questions: sampleQuestions,
    attempts: sampleParticipants.map((participant) => ({
      id: participant.id,
      name: participant.name,
      email: participant.email,
      linkedinUrl: participant.linkedinUrl,
      company: participant.company,
      startedAt: participant.submittedAt,
      submittedAt: participant.submittedAt,
      timeTakenMs: participant.timeTakenMs,
      answers: {},
      correctAnswers: participant.correctAnswers,
      totalQuestions: participant.totalQuestions,
      scorePercentage: participant.scorePercentage,
      goldenTicketCode: participant.goldenTicketCode
    }))
  };
}

async function ensureDemoStore() {
  if (storeInitialized) return;

  await mkdir(path.dirname(demoStorePath), { recursive: true });

  try {
    const contents = await readFile(demoStorePath, 'utf8');
    const parsed = JSON.parse(contents) as Partial<DemoStore>;
    if (!parsed.questions || parsed.questions.length === 0) {
      const initial = buildInitialStore();
      await writeFile(demoStorePath, JSON.stringify(initial, null, 2), 'utf8');
      cachedStore = initial;
      storeInitialized = true;
      return;
    }

    const migratedAttempts =
      parsed.attempts?.map((attempt) => {
        if (!attempt?.goldenTicketCode?.startsWith('IGGY-PRO-2026-')) {
          return attempt;
        }

        return {
          ...attempt,
          goldenTicketCode: generateGoldenTicketCode(attempt.id)
        };
      }) ?? [];

    const needsMigration = migratedAttempts.some(
      (attempt, index) => attempt?.goldenTicketCode !== parsed.attempts?.[index]?.goldenTicketCode
    );

    if (needsMigration) {
      const migrated = { questions: parsed.questions as QuizQuestion[], attempts: migratedAttempts as DemoAttempt[] };
      await writeFile(demoStorePath, JSON.stringify(migrated, null, 2), 'utf8');
      cachedStore = migrated;
    } else {
      cachedStore = { questions: parsed.questions as QuizQuestion[], attempts: (parsed.attempts ?? []) as DemoAttempt[] };
    }
  } catch {
    const initial = buildInitialStore();
    await writeFile(demoStorePath, JSON.stringify(initial, null, 2), 'utf8');
    cachedStore = initial;
  }

  storeInitialized = true;
}

async function readStore(): Promise<DemoStore> {
  await ensureDemoStore();
  if (cachedStore) return cachedStore;
  const file = await readFile(demoStorePath, 'utf8');
  cachedStore = JSON.parse(file) as DemoStore;
  return cachedStore;
}

async function writeStore(store: DemoStore) {
  await ensureDemoStore();
  cachedStore = store;
  await writeFile(demoStorePath, JSON.stringify(store, null, 2), 'utf8');
}

export async function getDemoQuestions() {
  const store = await readStore();
  return store.questions.slice().sort((left, right) => left.position - right.position);
}

export async function getDemoParticipants() {
  const store = await readStore();

  return store.attempts
    .filter((attempt) => attempt.submittedAt)
    .slice()
    .sort((left, right) => {
      if (!left.submittedAt || !right.submittedAt) {
        return 0;
      }
      return right.submittedAt.localeCompare(left.submittedAt);
    })
    .map<AdminParticipant>((attempt) => ({
      id: attempt.id,
      name: attempt.name,
      email: attempt.email,
      linkedinUrl: attempt.linkedinUrl,
      company: attempt.company,
      correctAnswers: attempt.correctAnswers,
      totalQuestions: attempt.totalQuestions,
      scorePercentage: attempt.scorePercentage,
      timeTakenMs: attempt.timeTakenMs ?? 0,
      goldenTicketCode: attempt.goldenTicketCode,
      submittedAt: attempt.submittedAt ?? attempt.startedAt
    }));
}

export async function getDemoAttemptSnapshot(attemptId: string) {
  const store = await readStore();
  const attempt = store.attempts.find((entry) => entry.id === attemptId);

  if (!attempt || !attempt.submittedAt) {
    return null;
  }

  const questionsById = new Map(store.questions.map((question) => [question.id, question]));
  const missedPrompts = (attempt.servedQuestionIds ?? [])
    .map((questionId) => questionsById.get(questionId))
    .filter((question): question is QuizQuestion => Boolean(question))
    .filter((question) => attempt.answers[question.id] !== question.correctOption)
    .map((question) => question.prompt);

  return {
    name: attempt.name,
    result: {
      attemptId: attempt.id,
      correctAnswers: attempt.correctAnswers,
      totalQuestions: attempt.totalQuestions,
      scorePercentage: attempt.scorePercentage,
      elapsedMs: attempt.timeTakenMs ?? 0,
      goldenTicketCode: attempt.goldenTicketCode,
      missedPrompts
    }
  };
}

export async function setDemoAttemptName(attemptId: string, name: string) {
  const store = await readStore();
  const attempt = store.attempts.find((entry) => entry.id === attemptId);

  if (!attempt) {
    throw new QuizRequestError('Unknown quiz attempt.', 404);
  }

  attempt.name = sanitizePlayerName(name);
  await writeStore(store);
}

export async function startDemoAttempt(player: PlayerFormValues) {
  const store = await readStore();

  const attemptId = randomUUID();
  const allQuestions = store.questions.filter((question) => question.isActive).sort((left, right) => left.position - right.position);
  const questions = pickRandom(allQuestions, QUESTIONS_PER_QUIZ);

  store.attempts.push({
    id: attemptId,
    name: player.name,
    email: '',
    linkedinUrl: '',
    company: '',
    startedAt: new Date().toISOString(),
    submittedAt: null,
    timeTakenMs: null,
    answers: {},
    servedQuestionIds: questions.map((question) => question.id),
    correctAnswers: 0,
    totalQuestions: questions.length,
    scorePercentage: 0,
    goldenTicketCode: null
  });

  await writeStore(store);

  return {
    attemptId,
    questions
  };
}

export async function submitDemoAttempt(input: {
  attemptId: string;
  answers: Record<string, QuestionOptionKey>;
}): Promise<QuizResult> {
  const store = await readStore();
  const attempt = store.attempts.find((entry) => entry.id === input.attemptId);

  if (!attempt) {
    throw new QuizRequestError('Unknown quiz attempt.', 404);
  }

  if (attempt.submittedAt) {
    throw new QuizRequestError('This quiz attempt has already been submitted.', 409);
  }

  const servedQuestionIds = attempt.servedQuestionIds ?? [];

  if (servedQuestionIds.length === 0) {
    throw new QuizRequestError('This quiz attempt has no recorded questions. Please start a new quiz.', 409);
  }

  const questionsById = new Map(store.questions.map((question) => [question.id, question]));
  const questions = servedQuestionIds
    .map((questionId) => questionsById.get(questionId))
    .filter((question): question is QuizQuestion => Boolean(question));

  const answers = pickServedAnswers(servedQuestionIds, input.answers);
  const result = scoreQuiz(questions, answers, input.attemptId, elapsedSince(attempt.startedAt));

  attempt.answers = answers;
  attempt.submittedAt = new Date().toISOString();
  attempt.timeTakenMs = result.elapsedMs;
  attempt.correctAnswers = result.correctAnswers;
  attempt.totalQuestions = result.totalQuestions;
  attempt.scorePercentage = result.scorePercentage;
  attempt.goldenTicketCode = result.goldenTicketCode;
  await writeStore(store);

  return result;
}

export async function upsertDemoQuestion(input: {
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
  const store = await readStore();
  const question: QuizQuestion = {
    id: input.id ?? randomUUID(),
    position: input.position,
    prompt: input.prompt,
    options: {
      A: input.optionA,
      B: input.optionB,
      C: input.optionC,
      D: input.optionD
    },
    correctOption: input.correctOption,
    isActive: input.isActive
  };

  const existingIndex = store.questions.findIndex((entry) => entry.id === question.id);

  if (existingIndex >= 0) {
    store.questions[existingIndex] = question;
  } else {
    store.questions.push(question);
  }

  await writeStore(store);
}

export async function deleteDemoQuestion(id: string) {
  const store = await readStore();
  store.questions = store.questions.filter((question) => question.id !== id);
  await writeStore(store);
}

export async function deleteDemoParticipant(id: string) {
  const store = await readStore();
  store.attempts = store.attempts.filter((attempt) => attempt.id !== id);
  await writeStore(store);
}

export async function clearAllDemoParticipants() {
  const store = await readStore();
  store.attempts = [];
  await writeStore(store);
}
