'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';

export function AdminLoginForm({ demoMode }: { demoMode: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (demoMode) {
      router.push('/admin');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const supabase = createClientSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="tech-panel mx-auto w-full max-w-lg rounded-[2rem] p-8">
      <p className="mono-heading text-xs text-sky-300">Admin Access</p>
      <h1 className="mt-4 text-3xl font-semibold text-slate-50">Question control and lead analytics</h1>
      <p className="mt-3 text-sm leading-7 text-slate-300">
        Sign in with your Supabase admin credentials to manage the quiz, inspect participants, and export conference leads.
      </p>

      {demoMode ? (
        <div className="mt-6 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
          Supabase environment variables are not configured, so admin auth is bypassed in demo mode.
          <div className="mt-3">
            <Link href="/admin" className="text-amber-50 underline underline-offset-4">
              Continue to the demo dashboard
            </Link>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <label className="grid gap-2">
          <span className="mono-heading text-[11px] text-slate-400">Email</span>
          <span className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/55 px-4 py-3 text-sm text-slate-200">
            <Mail className="h-4 w-4 text-sky-300" />
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@yourstartup.com"
              className="w-full bg-transparent outline-none placeholder:text-slate-600"
            />
          </span>
        </label>

        <label className="grid gap-2">
          <span className="mono-heading text-[11px] text-slate-400">Password</span>
          <span className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/55 px-4 py-3 text-sm text-slate-200">
            <LockKeyhole className="h-4 w-4 text-sky-300" />
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••••"
              className="w-full bg-transparent outline-none placeholder:text-slate-600"
            />
          </span>
        </label>

        {errorMessage ? <p className="text-sm text-rose-300">{errorMessage}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/40 bg-sky-500/20 px-5 py-3 font-medium text-sky-100 transition hover:border-sky-300 hover:bg-sky-400/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
          Sign In
        </button>
      </form>
    </div>
  );
}
