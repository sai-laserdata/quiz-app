'use client';

import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, Clock3, Download, LoaderCircle, Play, Trophy, UserRound } from 'lucide-react';

import { cn, firstNameOf, formatDuration, formatScore } from '@/lib/utils';
import { CORRECT_TO_WIN, NAME_MAX_LENGTH } from '@/lib/quiz/config';
import { FollowRow } from '@/components/follow-links';
import { IggyReleaseStrip } from '@/components/iggy-release';
import { LaserDataCloudCard } from '@/components/laserdata-cloud';
import type {
  AlreadyPlayedResponse,
  QuestionOptionKey,
  QuizQuestionPublic,
  QuizResult,
  QuizStartResponse
} from '@/lib/types';

type QuizPhase = 'intro' | 'in-progress' | 'complete' | 'already-played';

const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function QuizShell() {
  const [phase, setPhase] = useState<QuizPhase>('intro');
  // What they typed on the way in, and the name the run is actually recorded
  // under. They diverge when someone adds a name at the finish instead.
  const [nameInput, setNameInput] = useState('');
  const [playerName, setPlayerName] = useState('');
  /** The finished run this device is already carrying, shown before a restart. */
  const [previousRun, setPreviousRun] = useState<{ name: string; result: QuizResult } | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);
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
    await startRun(false);
  }

  async function startRun(restart: boolean) {
    setIsStarting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/quiz/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ player: { name: nameInput.trim() }, restart })
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);

        // This browser already has a finished run. Name it for whoever is
        // holding the device now: their own result if they came back for the
        // claim code, or a stranger's if the tablet just changed hands.
        if (response.status === 409 && body?.alreadyPlayed) {
          const played = body as AlreadyPlayedResponse;
          setPreviousRun({ name: played.name, result: played.result });
          setPhase('already-played');
          return;
        }

        throw new Error(body?.error ?? 'Unable to start the quiz. Please try again.');
      }

      const payload = (await response.json()) as QuizStartResponse;
      setPreviousRun(null);
      setPlayerName(nameInput.trim());
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
    // Display-only: the recorded time comes back from the server.
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
          answers
        })
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'Unable to submit the quiz. Please try again.');
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

  async function handleSaveName(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = nameInput.trim();

    if (!name || !attemptId) {
      return;
    }

    setIsSavingName(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/quiz/name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ attemptId, name })
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'Unable to save your name.');
      }

      const payload = (await response.json()) as { name: string };
      setPlayerName(payload.name);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save your name.');
    } finally {
      setIsSavingName(false);
    }
  }

  const firstName = firstNameOf(playerName);

  function handleDownloadTicket(code: string, correct: number, total: number) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Safari <16.4 has no roundRect; fall back to a plain rect there.
    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, w, h, r);
      } else {
        ctx.rect(x, y, w, h);
      }
    };

    // Background
    ctx.fillStyle = '#070c0f';
    ctx.fillRect(0, 0, 800, 400);

    // Border
    ctx.strokeStyle = 'rgba(252, 211, 77, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    roundRect(16, 16, 768, 368, 24);
    ctx.stroke();

    // Title
    ctx.fillStyle = '#fcd34d';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('CLAIM CODE', 40, 60);

    // Main heading
    ctx.fillStyle = '#fffbeb';
    ctx.font = '600 36px system-ui, sans-serif';
    ctx.fillText('Nice work.', 40, 110);

    // Score
    ctx.fillStyle = 'rgba(255, 251, 235, 0.7)';
    ctx.font = '18px system-ui, sans-serif';
    ctx.fillText('Show this code at the booth.', 40, 150);

    // Code background
    ctx.fillStyle = 'rgba(252, 211, 77, 0.1)';
    ctx.strokeStyle = 'rgba(252, 211, 77, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    roundRect(40, 180, 420, 80, 16);
    ctx.fill();
    ctx.stroke();

    // Code text
    ctx.fillStyle = '#fffbeb';
    ctx.font = 'bold 40px monospace';
    ctx.fillText(code, 70, 235);

    // Footer
    ctx.fillStyle = 'rgba(252, 211, 77, 0.6)';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('LIMITED STOCK. FIRST CLAIMED, FIRST SERVED.', 40, 310);

    // Branding
    ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText('LaserData Quiz — laserdata.com', 40, 360);

    // Download
    const link = document.createElement('a');
    link.download = `golden-ticket-${code}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <section className="tech-panel rounded-xl p-8">
        <div className="mb-6 space-y-3">
          <h2 className="text-2xl font-semibold text-white">LaserData Quiz</h2>
          {phase === 'intro' ? (
            <>
              <p className="max-w-2xl text-sm leading-7 text-slate-300">
                Real streaming-system scenarios. Forward-only, against the clock.
              </p>
              {isDemoMode ? (
                <p className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                  Demo mode is active. Attempts are written to a local file instead of Supabase.
                </p>
              ) : null}
            </>
          ) : null}
        </div>

        {phase === 'intro' ? (
          <form className="grid gap-4" onSubmit={handleStartQuiz}>
            {/* One field, and even this one is skippable. Nothing here blocks Start. */}
            <NameInput
              label="Your name"
              placeholder="Ada Lovelace"
              value={nameInput}
              onChange={setNameInput}
              hint="Optional. We only use it to say hi and to put you on the booth leaderboard — no email, no signup."
            />

            {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}

            <button
              type="submit"
              disabled={isStarting}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-ld-lime px-5 py-3 font-medium text-ld-ink transition-colors duration-150 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isStarting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Start Quiz
            </button>
          </form>
        ) : null}

        {phase === 'already-played' && previousRun ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-6">
              <p className="mono-heading text-[10px] text-white/50">Already played</p>
              <h3 className="mt-3 text-xl font-semibold leading-tight text-white">
                {previousRun.name.trim()
                  ? `${previousRun.name} already played on this device.`
                  : 'This device already has a finished run.'}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {previousRun.result.correctAnswers} of {previousRun.result.totalQuestions} correct in{' '}
                {formatDuration(previousRun.result.elapsedMs)}.
              </p>

              {previousRun.result.goldenTicketCode ? (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <div className="rounded-lg border border-amber-200/30 bg-amber-100/10 px-4 py-3 font-mono text-xl font-medium tracking-[0.2em] text-amber-50">
                    {previousRun.result.goldenTicketCode}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadTicket(
                        previousRun.result.goldenTicketCode!,
                        previousRun.result.correctAnswers,
                        previousRun.result.totalQuestions
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm text-white/70 transition-colors duration-150 hover:border-white/25 hover:text-white"
                  >
                    <Download className="h-4 w-4" />
                    Save
                  </button>
                </div>
              ) : null}
            </div>

            {/* The booth tablet gets passed around. Whoever is holding it now
                should be able to play without going to find staff. */}
            <div className="space-y-3 border-t border-white/[0.08] pt-5">
              <p className="text-sm text-white/60">
                Someone else&rsquo;s turn?{nameInput.trim() ? ` We’ll start a fresh run for ${nameInput.trim()}.` : ''}
              </p>

              {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}

              <button
                type="button"
                disabled={isStarting}
                onClick={() => startRun(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-ld-lime px-5 py-3 font-medium text-ld-ink transition-colors duration-150 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isStarting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Start a new run
              </button>
            </div>
          </div>
        ) : null}

        {phase === 'in-progress' && currentQuestion ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-lg border border-sky-400/15 bg-slate-950/40 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {/* Once, on the way in. A greeting on every screen stops reading as warmth. */}
                {firstName && currentIndex === 0 ? (
                  <p className="mb-1.5 text-sm text-slate-400">Hey {firstName} &mdash; here we go.</p>
                ) : null}
                <p className="mono-heading text-xs text-sky-300">Question {currentIndex + 1} / {questions.length}</p>
                <p className="mt-2 text-lg text-slate-100">{currentQuestion.prompt}</p>
              </div>
              <div className="rounded-lg border border-sky-400/20 bg-slate-900/80 px-5 py-4 text-right">
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
                    'rounded-lg border px-4 py-4 text-left transition',
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
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-ld-lime px-5 py-3 font-medium text-ld-ink transition-colors duration-150 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                {currentIndex === questions.length - 1 ? 'Submit Quiz' : 'Submit Answer'}
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
              <div className="rounded-xl border border-amber-300/25 bg-amber-300/[0.06] p-6">
                <p className="mono-heading text-[10px] text-amber-200/80">Claim code</p>
                <h3 className="mt-3 text-2xl font-semibold leading-tight text-amber-50">
                  {firstName ? `Nice work, ${firstName}.` : 'Nice work.'}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-amber-100/70">
                  Show this code at the booth.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {/* The one element that earns emphasis here -- it's what gets read out at the booth. */}
                  <div className="rounded-lg border border-amber-200/30 bg-amber-100/10 px-5 py-3.5 font-mono text-2xl font-medium tracking-[0.2em] text-amber-50 sm:text-3xl">
                    {result.goldenTicketCode}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadTicket(result.goldenTicketCode!, result.correctAnswers, result.totalQuestions)}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm text-white/70 transition-colors duration-150 hover:border-white/25 hover:text-white"
                  >
                    <Download className="h-4 w-4" />
                    Save
                  </button>
                </div>

                <p className="mt-4 text-xs text-amber-200/50">Limited stock, first claimed first served.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/[0.025] p-6">
                <p className="mono-heading text-[10px] text-white/50">Challenge Complete</p>
                <h3 className="mt-3 text-xl font-semibold leading-tight text-white">
                  {result.correctAnswers} of {result.totalQuestions}. You needed {Math.min(CORRECT_TO_WIN, result.totalQuestions)}.
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">
                  All of this is load-bearing in a real streaming engine. The release below is a decent place to see why.
                </p>

                {result.missedPrompts.length > 0 ? (
                  <ul className="mt-5 grid gap-2">
                    {result.missedPrompts.map((prompt) => (
                      <li
                        key={prompt}
                        className="flex items-start gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2.5 text-[13px] leading-relaxed text-white/60"
                      >
                        <span className="mono-heading mt-0.5 shrink-0 text-[9px] text-white/35">Missed</span>
                        {prompt}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}

            {!playerName.trim() ? (
              <form className="space-y-2.5" onSubmit={handleSaveName}>
                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    type="text"
                    value={nameInput}
                    maxLength={NAME_MAX_LENGTH}
                    onChange={(event) => setNameInput(event.target.value)}
                    placeholder="Your name"
                    aria-label="Your name"
                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.025] px-4 py-2.5 text-sm text-white outline-none transition-colors duration-150 placeholder:text-white/30 focus:border-white/25"
                  />
                  <button
                    type="submit"
                    disabled={!nameInput.trim() || isSavingName}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/70 transition-colors duration-150 hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isSavingName ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    Add to leaderboard
                  </button>
                </div>
                <p className="text-xs text-white/40">Optional &mdash; puts you on the booth board.</p>
              </form>
            ) : (
              <p className="text-xs text-white/40">You&rsquo;re on the board as {playerName}.</p>
            )}

            <FollowRow firstName={firstName} />

            <LaserDataCloudCard />
            <IggyReleaseStrip />
          </div>
        ) : null}
      </section>
    </div>
  );
}

function NameInput(props: {
  label: string;
  placeholder: string;
  value: string;
  hint?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="mono-heading text-[11px] text-slate-400">{props.label}</span>
      <span className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/55 px-4 py-3 text-sm text-slate-200">
        <span className="text-sky-300">
          <UserRound className="h-4 w-4" />
        </span>
        <input
          type="text"
          value={props.value}
          maxLength={NAME_MAX_LENGTH}
          onChange={(event) => props.onChange(event.target.value)}
          placeholder={props.placeholder}
          className="w-full bg-transparent outline-none placeholder:text-slate-600"
        />
      </span>
      {props.hint ? <span className="text-xs text-slate-500">{props.hint}</span> : null}
    </label>
  );
}

function MetricCard(props: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-sky-400/15 bg-slate-950/40 p-4">
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
