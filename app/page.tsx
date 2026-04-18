import Link from 'next/link';
import { Play } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-6 py-10 lg:px-10">
      <p className="mb-6 text-center text-sm font-medium uppercase tracking-[0.2em] text-sky-300/80">
        Welcome to Rust India Conference 2026
      </p>

      <section className="tech-panel rounded-[2.5rem] px-8 py-14 lg:px-14 lg:py-20">
        <div className="flex flex-col items-center text-center">
          <a href="https://laserdata.com" target="_blank" rel="noopener noreferrer">
            <img
              src="/laserdata-logo.svg"
              alt="LaserData"
              width={200}
              height={38}
              className="transition hover:opacity-80"
            />
          </a>

          <h1 className="mt-8 max-w-3xl text-5xl font-bold tracking-tight text-slate-50 sm:text-6xl lg:text-7xl">
            Can You Think in Streams?
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            A rapid-fire quiz on real streaming architectures. Score high & faster and walk away with <strong className="text-amber-200">exclusive Iggy swag</strong>.
          </p>

          <Link
            href="/quiz"
            className="mt-10 inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/40 bg-sky-500/20 px-10 py-5 text-lg font-medium text-sky-100 transition hover:border-sky-300 hover:bg-sky-400/25"
          >
            <Play className="h-5 w-5" />
            Take the Challenge
          </Link>
        </div>
      </section>
    </main>
  );
}
