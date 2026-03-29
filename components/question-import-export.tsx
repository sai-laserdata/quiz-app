'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, LoaderCircle, Upload } from 'lucide-react';

export function QuestionImportExport() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleExport() {
    try {
      const response = await fetch('/api/admin/questions/export');
      if (!response.ok) {
        throw new Error('Export failed.');
      }
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'quiz-questions.json';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setMessage({ type: 'error', text: 'Failed to export questions.' });
    }
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setMessage(null);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const response = await fetch('/api/admin/questions/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: parsed.questions, replace: true })
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? 'Import failed.');
      }

      const result = await response.json();
      setMessage({ type: 'success', text: `Imported ${result.imported} questions. Refreshing...` });
      router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Import failed.' });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-2xl border border-sky-400/40 bg-sky-500/20 px-4 py-3 text-sm text-sky-100 transition hover:border-sky-300 hover:bg-sky-400/25"
        >
          <Download className="h-4 w-4" />
          Export Questions as JSON
        </button>

        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100 transition hover:border-amber-300/50 hover:bg-amber-300/15">
          {isImporting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Import Questions from JSON
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelected}
            className="hidden"
          />
        </label>
      </div>

      {message ? (
        <p className={message.type === 'error' ? 'text-sm text-rose-300' : 'text-sm text-emerald-300'}>
          {message.text}
        </p>
      ) : null}

      <p className="text-xs text-slate-500">
        Import replaces all current questions. Export first if you want to keep a backup.
      </p>
    </div>
  );
}
