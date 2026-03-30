import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { sampleParticipants, sampleQuestions } from '@/lib/quiz/sample-data';
import { scoreQuiz } from '@/lib/quiz/scoring';
import { generateGoldenTicketCode } from '@/lib/utils';
import { QUESTIONS_PER_QUIZ, pickRandom } from '@/lib/quiz/config';
import type { AdminParticipant, LeadFormValues, QuestionOptionKey, QuizQuestion, QuizResult } from '@/lib/types';

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
  await mkdir(path.dirname(demoStorePath), { recursive: true });

  try {
    const contents = await readFile(demoStorePath, 'utf8');
    const parsed = JSON.parse(contents) as Partial<DemoStore>;
    if (!parsed.questions || parsed.questions.length === 0) {
      await writeFile(demoStorePath, JSON.stringify(buildInitialStore(), null, 2), 'utf8');
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
      await writeFile(
        demoStorePath,
        JSON.stringify(
          {
            questions: parsed.questions,
            attempts: migratedAttempts
          },
          null,
          2
        ),
        'utf8'
      );
    }
  } catch {
    await writeFile(demoStorePath, JSON.stringify(buildInitialStore(), null, 2), 'utf8');
  }
}

async function readStore() {
  await ensureDemoStore();
  const file = await readFile(demoStorePath, 'utf8');
  return JSON.parse(file) as DemoStore;
}

async function writeStore(store: DemoStore) {
  await ensureDemoStore();
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

export async function hasDemoSubmittedAttempt(email: string): Promise<boolean> {
  const store = await readStore();
  return store.attempts.some(
    (attempt) =>
      attempt.email.toLowerCase() === email.toLowerCase() &&
      attempt.submittedAt !== null
  );
}

export async function startDemoAttempt(lead: LeadFormValues) {
  const store = await readStore();
  const attemptId = randomUUID();
  const allQuestions = store.questions.filter((question) => question.isActive).sort((left, right) => left.position - right.position);
  const questions = pickRandom(allQuestions, QUESTIONS_PER_QUIZ);

  store.attempts.push({
    id: attemptId,
    name: lead.name,
    email: lead.email,
    linkedinUrl: lead.linkedinUrl,
    company: lead.company,
    startedAt: new Date().toISOString(),
    submittedAt: null,
    timeTakenMs: null,
    answers: {},
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
  elapsedMs: number;
}): Promise<QuizResult> {
  const store = await readStore();
  const allQuestions = store.questions.filter((question) => question.isActive);
  const answeredIds = new Set(Object.keys(input.answers));
  const questions = allQuestions.filter((q) => answeredIds.has(q.id));
  const result = scoreQuiz(questions, input.answers, input.attemptId, input.elapsedMs);
  const attempt = store.attempts.find((entry) => entry.id === input.attemptId);

  if (attempt) {
    attempt.answers = input.answers;
    attempt.submittedAt = new Date().toISOString();
    attempt.timeTakenMs = input.elapsedMs;
    attempt.correctAnswers = result.correctAnswers;
    attempt.totalQuestions = result.totalQuestions;
    attempt.scorePercentage = result.scorePercentage;
    attempt.goldenTicketCode = result.goldenTicketCode;
    await writeStore(store);
  }

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
