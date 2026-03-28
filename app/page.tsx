import Link from 'next/link';
import { ArrowRight, Play, Trophy } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-10 lg:px-10">
      <section className="tech-panel rounded-[2.5rem] px-8 py-12 lg:px-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="max-w-4xl">
            <p className="mono-heading text-xs text-sky-300">Industry IQ Quiz Platform</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl">
              Measure real systems thinking before the first booth conversation starts.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300">
              Engineers take a fast, forward-only systems quiz. Top performers earn a Golden Ticket, and your team gets a much
              cleaner signal on who to prioritize at the conference.
            </p>
          </div>

          <div className="grid gap-4">
            <Link
              href="/quiz"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/40 bg-sky-500/20 px-6 py-4 text-base font-medium text-sky-100 transition hover:border-sky-300 hover:bg-sky-400/25"
            >
              <Play className="h-5 w-5" />
              Take Quiz
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 px-6 py-4 text-base text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
            >
              <Trophy className="h-5 w-5" />
              View Leaderboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
