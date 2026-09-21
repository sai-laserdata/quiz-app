import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AdminLoginForm } from '@/components/admin-login-form';
import { isDemoMode } from '@/lib/supabase/env';

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-10 lg:px-10">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-slate-100">
        <ArrowLeft className="h-4 w-4" />
        Back to quiz
      </Link>
      <AdminLoginForm demoMode={isDemoMode()} />
    </main>
  );
}
