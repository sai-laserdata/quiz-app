import { NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/admin/auth';
import { saveQuestion, removeQuestion, getAllQuestions } from '@/lib/quiz/data';
import type { QuestionOptionKey } from '@/lib/types';

type QuestionImportItem = {
  position: number;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: QuestionOptionKey;
  isActive?: boolean;
};

export async function POST(request: Request) {
  try {
    await assertAdmin();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const questions: QuestionImportItem[] = body.questions;

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Request body must contain a non-empty "questions" array.' },
        { status: 400 }
      );
    }

    for (const [index, q] of questions.entries()) {
      if (!q.prompt || !q.optionA || !q.optionB || !q.optionC || !q.optionD || !q.correctOption) {
        return NextResponse.json(
          { error: `Question at index ${index} is missing required fields.` },
          { status: 400 }
        );
      }
      if (!['A', 'B', 'C', 'D'].includes(q.correctOption)) {
        return NextResponse.json(
          { error: `Question at index ${index} has invalid correctOption "${q.correctOption}".` },
          { status: 400 }
        );
      }
    }

    if (body.replace) {
      const existing = await getAllQuestions();
      for (const q of existing) {
        await removeQuestion(q.id);
      }
    }

    for (const q of questions) {
      await saveQuestion({
        position: q.position,
        prompt: q.prompt,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
        isActive: q.isActive ?? true
      });
    }

    return NextResponse.json({ imported: questions.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Import failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
