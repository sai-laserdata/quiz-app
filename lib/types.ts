export type QuestionOptionKey = 'A' | 'B' | 'C' | 'D';

export type QuizQuestion = {
  id: string;
  position: number;
  prompt: string;
  options: Record<QuestionOptionKey, string>;
  correctOption: QuestionOptionKey;
  isActive: boolean;
};

export type QuizQuestionPublic = Omit<QuizQuestion, 'correctOption' | 'isActive'>;

export type LeadFormValues = {
  name: string;
  email: string;
  linkedinUrl: string;
  company: string;
};

export type QuizStartPayload = {
  lead: LeadFormValues;
};

export type QuizStartResponse = {
  attemptId: string;
  questions: QuizQuestionPublic[];
};

export type QuizSubmitPayload = {
  attemptId: string;
  answers: Record<string, QuestionOptionKey>;
  elapsedMs: number;
};

export type QuizResult = {
  attemptId: string;
  correctAnswers: number;
  totalQuestions: number;
  scorePercentage: number;
  elapsedMs: number;
  goldenTicketCode: string | null;
};

export type LeaderboardEntry = {
  rank: number;
  name: string;
  company: string;
  correctAnswers: number;
  totalQuestions: number;
  scorePercentage: number;
  timeTakenMs: number;
  goldenTicketCode: string | null;
};

export type AdminAnalytics = {
  totalParticipants: number;
  averageScore: number;
  averageTimeMs: number;
};

export type AdminParticipant = {
  id: string;
  name: string;
  email: string;
  linkedinUrl: string;
  company: string;
  correctAnswers: number;
  totalQuestions: number;
  scorePercentage: number;
  timeTakenMs: number;
  goldenTicketCode: string | null;
  submittedAt: string;
};
