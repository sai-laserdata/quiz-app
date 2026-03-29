import { NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/admin/auth';
import { getAllQuestions } from '@/lib/quiz/data';

export async function GET() {
  try {
    await assertAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const questions = await getAllQuestions();

    const exportData = {
      questions: questions.map((q) => ({
        position: q.position,
        prompt: q.prompt,
        optionA: q.options.A,
        optionB: q.options.B,
        optionC: q.options.C,
        optionD: q.options.D,
        correctOption: q.correctOption,
        isActive: q.isActive
      }))
    };

    return NextResponse.json(exportData);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Export failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
