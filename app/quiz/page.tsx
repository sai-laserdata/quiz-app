import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { QuizShell } from '@/components/quiz-shell';

export default function QuizPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-10 lg:px-10">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-slate-100">
        <ArrowLeft className="h-4 w-4" />
        Back to landing page
      </Link>
      <QuizShell />
    </main>
  );
}
