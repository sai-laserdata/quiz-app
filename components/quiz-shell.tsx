'use client';

import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, Binary, Building2, Clock3, Linkedin, LoaderCircle, Mail, Play, Trophy, UserRound } from 'lucide-react';
import { cn, formatDuration, formatScore } from '@/lib/utils';
import type { LeadFormValues, QuestionOptionKey, QuizQuestionPublic, QuizResult, QuizStartResponse } from '@/lib/types';

type QuizPhase = 'lead-capture' | 'in-progress' | 'complete';

const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const initialLeadForm: LeadFormValues = isDemoMode
  ? {
      name: 'Ada Lovelace',
      email: 'ada.lovelace@gmail.com',
      linkedinUrl: '',
      company: ''
    }
  : {
      name: '',
      email: '',
      linkedinUrl: '',
      company: ''
    };

export function QuizShell() {
  const [phase, setPhase] = useState<QuizPhase>('lead-capture');
  const [lead, setLead] = useState<LeadFormValues>(initialLeadForm);
  const [questions, setQuestions] = useState<QuizQuestionPublic[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionOptionKey>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const timerOriginRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const currentQuestion = questions[currentIndex];
  const selectedOption = currentQuestion ? answers[currentQuestion.id] : undefined;

  useEffect(() => {
    if (phase !== 'in-progress' || timerOriginRef.current === null) {
      return;
    }

    const tick = () => {
      if (timerOriginRef.current === null) {
        return;
      }
      setElapsedMs(Math.round(performance.now() - timerOriginRef.current));
      animationFrameRef.current = window.requestAnimationFrame(tick);
    };

    animationFrameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [phase]);

  async function handleStartQuiz(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsStarting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/quiz/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lead })
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'Unable to start the quiz. Please try again.');
      }

      const payload = (await response.json()) as QuizStartResponse;
      setAttemptId(payload.attemptId);
      setQuestions(payload.questions);
      setAnswers({});
      setCurrentIndex(0);
      setResult(null);
      setElapsedMs(0);
      timerOriginRef.current = performance.now();
      setPhase('in-progress');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to start the quiz.');
    } finally {
      setIsStarting(false);
    }
  }

  async function handleNextOrSubmit() {
    if (!currentQuestion || !selectedOption || !attemptId) {
      return;
    }

    const isFinalQuestion = currentIndex === questions.length - 1;

    if (!isFinalQuestion) {
      setCurrentIndex((value) => value + 1);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const stopAt = performance.now();
    const finalElapsedMs = timerOriginRef.current === null ? elapsedMs : Math.round(stopAt - timerOriginRef.current);

    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }
    setElapsedMs(finalElapsedMs);
    timerOriginRef.current = null;

    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          attemptId,
          answers,
          elapsedMs: finalElapsedMs
        })
      });

      if (!response.ok) {
        throw new Error('Unable to submit the quiz. Please try again.');
      }

      const payload = (await response.json()) as QuizResult;
      setResult(payload);
      setPhase('complete');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to submit the quiz.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateLeadField(field: keyof LeadFormValues, value: string) {
    setLead((current) => ({
      ...current,
      [field]: value
    }));
  }

  const isAllowedEmail = /^[^\s@]+@(gmail\.com|googlemail\.com|outlook\.com|hotmail\.com|live\.com)$/i.test(lead.email);

  const canStartQuiz =
    lead.name.trim().length > 1 &&
    isAllowedEmail;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="tech-panel rounded-3xl p-8">
        <div className="mb-6 space-y-3">
          <p className="mono-heading text-xs text-sky-300">Conference Lead Engine</p>
          <h2 className="text-3xl font-semibold text-slate-50">High-Performance Systems IQ</h2>
          <p className="max-w-2xl text-sm leading-7 text-slate-300">
            Screen for real systems intuition in under three minutes. The flow captures conference leads, measures speed with
            millisecond precision, and rewards top scorers with a Golden Ticket for booth redemption.
          </p>
          {isDemoMode ? (
            <p className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
              Demo mode is active. The attendee fields are pre-filled so you can start the quiz immediately.
            </p>
          ) : null}
        </div>

        {phase === 'lead-capture' ? (
          <form className="grid gap-4" onSubmit={handleStartQuiz}>
            <LeadInput
              icon={<UserRound className="h-4 w-4" />}
              label="Full Name"
              placeholder="Ada Lovelace"
              value={lead.name}
              onChange={(value) => updateLeadField('name', value)}
            />
            <LeadInput
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              placeholder="you@gmail.com"
              value={lead.email}
              type="email"
              onChange={(value) => updateLeadField('email', value)}
              hint={lead.email && !isAllowedEmail ? 'Only Gmail and Outlook emails are accepted.' : undefined}
            />
            <LeadInput
              icon={<Linkedin className="h-4 w-4" />}
              label="LinkedIn Profile URL (optional)"
              placeholder="https://www.linkedin.com/in/ada-lovelace"
              value={lead.linkedinUrl}
              onChange={(value) => updateLeadField('linkedinUrl', value)}
            />
            <LeadInput
              icon={<Building2 className="h-4 w-4" />}
              label="Company (optional)"
              placeholder="Kernel Labs"
              value={lead.company}
              onChange={(value) => updateLeadField('company', value)}
            />

            {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}

            <button
              type="submit"
              disabled={!canStartQuiz || isStarting}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/40 bg-sky-500/20 px-5 py-3 font-medium text-sky-100 transition hover:border-sky-300 hover:bg-sky-400/25 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isStarting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Start Quiz
            </button>
          </form>
        ) : null}

        {phase === 'in-progress' && currentQuestion ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-2xl border border-sky-400/15 bg-slate-950/40 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mono-heading text-xs text-sky-300">Question {currentIndex + 1} / {questions.length}</p>
                <p className="mt-2 text-lg text-slate-100">{currentQuestion.prompt}</p>
              </div>
              <div className="rounded-2xl border border-sky-400/20 bg-slate-900/80 px-5 py-4 text-right">
                <p className="mono-heading text-[11px] text-slate-400">Elapsed</p>
                <RollingTimer ms={elapsedMs} />
              </div>
            </div>

            <div className="grid gap-3">
              {(Object.entries(currentQuestion.options) as Array<[QuestionOptionKey, string]>).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAnswers((current) => ({ ...current, [currentQuestion.id]: key }))}
                  className={cn(
                    'rounded-2xl border px-4 py-4 text-left transition',
                    selectedOption === key
                      ? 'border-sky-300 bg-sky-500/15 text-sky-50 shadow-[0_0_0_1px_rgba(125,211,252,0.25)_inset]'
                      : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-sky-700/60 hover:bg-slate-900/80'
                  )}
                >
                  <span className="mono-heading mr-3 text-xs text-sky-300">{key}</span>
                  {label}
                </button>
              ))}
            </div>

            {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}

            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Forward-only flow. No backtracking.</p>
              <button
                type="button"
                disabled={!selectedOption || isSubmitting}
                onClick={handleNextOrSubmit}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/40 bg-sky-500/20 px-5 py-3 font-medium text-sky-100 transition hover:border-sky-300 hover:bg-sky-400/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                {currentIndex === questions.length - 1 ? 'Submit Quiz' : 'Lock Answer'}
              </button>
            </div>
          </div>
        ) : null}

        {phase === 'complete' && result ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard label="Score" value={formatScore(result.scorePercentage)} icon={<Trophy className="h-4 w-4" />} />
              <MetricCard label="Correct" value={`${result.correctAnswers}/${result.totalQuestions}`} icon={<BadgeCheck className="h-4 w-4" />} />
              <MetricCard label="Time" value={formatDuration(result.elapsedMs)} icon={<Clock3 className="h-4 w-4" />} />
            </div>

            {result.goldenTicketCode ? (
              <div className="relative overflow-hidden rounded-3xl border-2 border-amber-300/60 bg-gradient-to-br from-amber-300/20 via-yellow-200/15 to-amber-500/10 p-8 shadow-[0_0_60px_rgba(250,204,21,0.2)]">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.08)_45%,rgba(255,255,255,0.12)_50%,rgba(255,255,255,0.08)_55%,transparent_60%)] animate-[shimmer_3s_ease-in-out_infinite]" />
                <div className="relative">
                  <p className="mono-heading text-xs text-amber-200">Golden Ticket Unlocked</p>
                  <h3 className="mt-3 text-4xl font-bold text-amber-50">You Win a T-Shirt!</h3>
                  <p className="mt-1 text-2xl font-semibold text-amber-100/90">Visit the booth. Skip the small talk.</p>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-amber-100/80">
                    You scored at least 90%. Show the code below at the booth to claim your t-shirt and jump straight into the
                    architecture conversation.
                  </p>
                  <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border-2 border-amber-200/50 bg-amber-100/15 px-6 py-5 text-3xl font-bold tracking-[0.3em] text-amber-50 shadow-[0_0_30px_rgba(250,204,21,0.15)]">
                    <Trophy className="h-7 w-7 text-amber-300" />
                    {result.goldenTicketCode}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-800 bg-slate-950/45 p-6">
                <p className="mono-heading text-xs text-slate-400">Challenge Complete</p>
                <h3 className="mt-3 text-xl font-semibold text-slate-100">
                  Solid effort! The Golden Ticket threshold is 90%.
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  You scored {formatScore(result.scorePercentage)} — not far off. Swing by the booth anyway and mention your score.
                  Strong engineers are always worth talking to.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </section>

      <aside className="space-y-6">
        <div className="tech-panel rounded-3xl p-6">
          <p className="mono-heading text-xs text-slate-400">Signal Criteria</p>
          <div className="mt-4 space-y-4 text-sm text-slate-300">
            <div className="flex items-start gap-3">
              <Binary className="mt-0.5 h-4 w-4 text-sky-300" />
              <p>One question at a time with no back button, so the ranking reflects first-principles recall under pressure.</p>
            </div>
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 h-4 w-4 text-sky-300" />
              <p>The timer starts on the first question render and is frozen at the exact click of the final submit action.</p>
            </div>
            <div className="flex items-start gap-3">
              <Trophy className="mt-0.5 h-4 w-4 text-sky-300" />
              <p>Leaderboard rank is based on correct answers first, then fastest completion time as the tiebreaker.</p>
            </div>
          </div>
        </div>

        <div className="tech-panel rounded-3xl p-6">
          <p className="mono-heading text-xs text-slate-400">Conference Hook</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li>Capture name, work email, LinkedIn, and company before the quiz starts.</li>
            <li>Route high scorers to an in-person booth redemption flow with a unique code.</li>
            <li>Feed the leaderboard and admin analytics from the same normalized results table.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function LeadInput(props: {
  label: string;
  placeholder: string;
  value: string;
  icon: React.ReactNode;
  type?: string;
  hint?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="mono-heading text-[11px] text-slate-400">{props.label}</span>
      <span className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/55 px-4 py-3 text-sm text-slate-200">
        <span className="text-sky-300">{props.icon}</span>
        <input
          type={props.type ?? 'text'}
          value={props.value}
          onChange={(event) => props.onChange(event.target.value)}
          placeholder={props.placeholder}
          className="w-full bg-transparent outline-none placeholder:text-slate-600"
        />
      </span>
      {props.hint ? <span className="text-xs text-rose-300">{props.hint}</span> : null}
    </label>
  );
}

function MetricCard(props: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-sky-400/15 bg-slate-950/40 p-4">
      <p className="mono-heading flex items-center gap-2 text-[11px] text-slate-400">
        {props.icon}
        {props.label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-slate-50">{props.value}</p>
    </div>
  );
}

function RollingTimer({ ms }: { ms: number }) {
  const totalMinutes = Math.floor(ms / 60000);
  const secondsWithinMinute = (ms % 60000) / 1000;
  const wholeSeconds = Math.floor(secondsWithinMinute);
  const secondFraction = (ms % 1000) / 1000;
  const centiseconds = Math.floor((ms % 1000) / 10);
  const secondRollProgress = getMechanicalRollProgress(secondFraction);
  const onesSecondDigit = wholeSeconds % 10;
  const tensSecondDigit = Math.floor(wholeSeconds / 10) % 6;

  const timerTokens: Array<
    | { type: 'digit'; digit: number; cycleLength?: number; progress?: number }
    | { type: 'separator'; value: string }
  > = [
    { type: 'digit', digit: Math.floor(totalMinutes / 10) % 10 },
    { type: 'digit', digit: totalMinutes % 10 },
    { type: 'separator', value: ':' },
    {
      type: 'digit',
      digit: tensSecondDigit,
      cycleLength: 6,
      progress: onesSecondDigit === 9 ? secondRollProgress : 0
    },
    {
      type: 'digit',
      digit: onesSecondDigit,
      cycleLength: 10,
      progress: secondRollProgress
    },
    { type: 'separator', value: '.' },
    { type: 'digit', digit: Math.floor(centiseconds / 10) },
    { type: 'digit', digit: centiseconds % 10 }
  ];

  return (
    <div className="timer-readout timer-odometer mt-3 inline-flex items-center gap-2 text-3xl font-semibold text-sky-200">
      {timerTokens.map((token, index) =>
        token.type === 'digit' ? (
          <RollingDigit
            key={`${index}-${token.digit}-${token.cycleLength ?? 10}`}
            digit={token.digit}
            cycleLength={token.cycleLength}
            progress={token.progress}
          />
        ) : (
          <span key={`${index}-${token.value}`} className="timer-separator">
            {token.value}
          </span>
        )
      )}
    </div>
  );
}

function RollingDigit({
  digit,
  cycleLength = 10,
  progress = 0
}: {
  digit: number;
  cycleLength?: number;
  progress?: number;
}) {
  const [offset, setOffset] = useState(0);
  const previousDigitRef = useRef(digit);

  useEffect(() => {
    const previousDigit = previousDigitRef.current;

    if (previousDigit === digit) {
      return;
    }

    if (digit < previousDigit) {
      setOffset((current) => current + cycleLength);
    }

    previousDigitRef.current = digit;
  }, [digit, cycleLength]);

  const position = offset + digit + progress;

  const totalCells = Math.max(cycleLength * 3, Math.ceil(position) + cycleLength + 4);

  return (
    <span className="rolling-digit-shell" aria-hidden="true">
      <span className="rolling-digit-gloss rolling-digit-gloss-top" />
      <span className="rolling-digit-gloss rolling-digit-gloss-bottom" />
      <span className="rolling-digit-stack" style={{ transform: `translateY(-${position}em)` }}>
        {Array.from({ length: totalCells }, (_, index) => (
          <span key={index} className="rolling-digit-cell">
            {index % cycleLength}
          </span>
        ))}
      </span>
    </span>
  );
}

function getMechanicalRollProgress(fraction: number) {
  const rollWindow = 0.18;
  const rollStart = 1 - rollWindow;

  if (fraction <= rollStart) {
    return 0;
  }

  return (fraction - rollStart) / rollWindow;
}
