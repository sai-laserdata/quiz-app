'use server';

import { revalidatePath } from 'next/cache';
import { assertAdmin } from '@/lib/admin/auth';
import { clearAllParticipants, removeParticipant, removeQuestion, saveQuestion } from '@/lib/quiz/data';
import type { QuestionOptionKey } from '@/lib/types';

function readRequiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Missing required field: ${key}`);
  }
  return value.trim();
}

export async function upsertQuestionAction(formData: FormData) {
  await assertAdmin();

  const payload = {
    position: Number(readRequiredString(formData, 'position')),
    prompt: readRequiredString(formData, 'prompt'),
    option_a: readRequiredString(formData, 'option_a'),
    option_b: readRequiredString(formData, 'option_b'),
    option_c: readRequiredString(formData, 'option_c'),
    option_d: readRequiredString(formData, 'option_d'),
    correct_option: readRequiredString(formData, 'correct_option') as QuestionOptionKey,
    is_active: formData.get('is_active') === 'on'
  };

  if (Number.isNaN(payload.position)) {
    throw new Error('Question position must be a number.');
  }

  const id = formData.get('id');
  await saveQuestion({
    id: typeof id === 'string' && id.length > 0 ? id : undefined,
    position: payload.position,
    prompt: payload.prompt,
    optionA: payload.option_a,
    optionB: payload.option_b,
    optionC: payload.option_c,
    optionD: payload.option_d,
    correctOption: payload.correct_option,
    isActive: payload.is_active
  });

  revalidatePath('/admin');
  revalidatePath('/admin/questions');
  revalidatePath('/');
  revalidatePath('/quiz');
}

export async function deleteQuestionAction(formData: FormData) {
  await assertAdmin();

  const id = readRequiredString(formData, 'id');
  await removeQuestion(id);

  revalidatePath('/admin');
  revalidatePath('/admin/questions');
  revalidatePath('/');
  revalidatePath('/quiz');
}

export async function deleteParticipantAction(formData: FormData) {
  await assertAdmin();

  const id = readRequiredString(formData, 'id');
  await removeParticipant(id);

  revalidatePath('/admin');
  revalidatePath('/admin/participants');
  revalidatePath('/leaderboard');
}

export async function clearAllParticipantsAction() {
  await assertAdmin();

  await clearAllParticipants();

  revalidatePath('/admin');
  revalidatePath('/admin/participants');
  revalidatePath('/leaderboard');
}
