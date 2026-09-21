import Link from 'next/link';
import { Play } from 'lucide-react';
import { IggyReleaseChip } from '@/components/iggy-release';
import { CORRECT_TO_WIN, QUESTIONS_PER_QUIZ } from '@/lib/quiz/config';

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col justify-center px-6 py-16 lg:px-10">
      <section className="tech-panel rounded-xl px-8 py-14 lg:px-14 lg:py-16">
        <div className="flex flex-col items-center text-center">
          <a href="https://laserdata.com" target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/laserdata-logo.svg"
              alt="LaserData"
              width={180}
              height={34}
              className="transition hover:opacity-80"
            />
          </a>

          {/* States the relationship the app never previously explained. */}
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50">
            Real-time data infrastructure for streams and agents, built on the{' '}
            <span className="text-sky-300">Apache Iggy</span> streaming engine.
          </p>

          <h1 className="mt-8 max-w-3xl text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
            Can You Think in Streams?
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/65">
            {QUESTIONS_PER_QUIZ} questions on real streaming architectures. Forward-only, against the clock.
            Get {CORRECT_TO_WIN} right and the Iggy tee is yours.
          </p>

          <Link
            href="/quiz"
            className="mt-10 inline-flex items-center justify-center gap-2 rounded-lg bg-ld-lime px-8 py-4 text-base font-medium text-ld-ink transition-colors duration-150 hover:bg-white"
          >
            <Play className="h-4 w-4" />
            Take the Challenge
          </Link>

          <div className="mt-10">
            <IggyReleaseChip />
          </div>
        </div>
      </section>
    </main>
  );
}
