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

/**
 * Everything the quiz asks for up front, which is now one optional field.
 * An empty name is a valid entry: the player can add one afterwards, or not.
 */
export type PlayerFormValues = {
  name: string;
};

export type QuizStartPayload = {
  player: PlayerFormValues;
  /**
   * Set when the person in front of the device is not the one who played on it.
   * Skips the already-played check and issues a fresh attempt -- the booth
   * tablet gets passed around, and the next player should not need staff help.
   */
  restart?: boolean;
};

export type QuizStartResponse = {
  attemptId: string;
  questions: QuizQuestionPublic[];
};

/**
 * Returned with 409 from /api/quiz/start when the attempt cookie points at a
 * run that is already finished. Carries the result back so someone who closed
 * the tab gets their claim code again instead of a dead end.
 */
export type AlreadyPlayedResponse = {
  alreadyPlayed: true;
  name: string;
  result: QuizResult;
};

export type QuizNamePayload = {
  attemptId: string;
  name: string;
};

export type QuizSubmitPayload = {
  attemptId: string;
  answers: Record<string, QuestionOptionKey>;
};

export type QuizResult = {
  attemptId: string;
  correctAnswers: number;
  totalQuestions: number;
  scorePercentage: number;
  elapsedMs: number;
  goldenTicketCode: string | null;
  /** Prompts the participant got wrong. Already shown to them, so safe to return. */
  missedPrompts: string[];
};

export type LeaderboardEntry = {
  id: string;
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
  /** Legacy: collected before the quiz dropped its entry form. Empty on new attempts. */
  email: string;
  /** Legacy, as above. */
  linkedinUrl: string;
  company: string;
  correctAnswers: number;
  totalQuestions: number;
  scorePercentage: number;
  timeTakenMs: number;
  goldenTicketCode: string | null;
  submittedAt: string;
};
