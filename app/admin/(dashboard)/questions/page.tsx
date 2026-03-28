import { deleteQuestionAction, upsertQuestionAction } from '@/lib/admin/actions';
import { getAllQuestions } from '@/lib/quiz/data';

export default async function AdminQuestionsPage() {
  const questions = await getAllQuestions();

  return (
    <div className="space-y-8">
      <section className="tech-panel rounded-[2rem] p-6">
        <p className="mono-heading text-xs text-slate-400">Create Question</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-50">Add another systems challenge</h2>
        <QuestionForm action={upsertQuestionAction} />
      </section>

      <section className="space-y-4">
        <div>
          <p className="mono-heading text-xs text-slate-400">Question Inventory</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-50">Edit, reorder, or retire existing prompts</h2>
        </div>

        {questions.map((question) => (
          <div key={question.id} className="tech-panel rounded-[2rem] p-6">
            <QuestionForm action={upsertQuestionAction} question={question} />

            <form action={deleteQuestionAction} className="mt-4">
              <input type="hidden" name="id" value={question.id} />
              <button
                type="submit"
                className="rounded-2xl border border-rose-400/35 bg-rose-500/10 px-4 py-2 text-sm text-rose-100 transition hover:border-rose-300 hover:bg-rose-500/15"
              >
                Delete Question
              </button>
            </form>
          </div>
        ))}
      </section>
    </div>
  );
}

function QuestionForm(props: {
  action: (formData: FormData) => Promise<void>;
    question?: {
      id: string;
      position: number;
      prompt: string;
      options: Record<'A' | 'B' | 'C' | 'D', string>;
      correctOption: 'A' | 'B' | 'C' | 'D';
      isActive: boolean;
    };
  }) {
  return (
    <form action={props.action} className="mt-6 grid gap-4">
      {props.question ? <input type="hidden" name="id" value={props.question.id} /> : null}

      <div className="grid gap-4 md:grid-cols-[160px_1fr]">
        <Field label="Display Order" name="position" defaultValue={String(props.question?.position ?? '')} />
        <Field label="Prompt" name="prompt" defaultValue={props.question?.prompt ?? ''} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Option A" name="option_a" defaultValue={props.question?.options.A ?? ''} />
        <Field label="Option B" name="option_b" defaultValue={props.question?.options.B ?? ''} />
        <Field label="Option C" name="option_c" defaultValue={props.question?.options.C ?? ''} />
        <Field label="Option D" name="option_d" defaultValue={props.question?.options.D ?? ''} />
      </div>

      <div className="grid gap-4 md:grid-cols-[180px_1fr] md:items-end">
        <label className="grid gap-2">
          <span className="mono-heading text-[11px] text-slate-400">Correct Option</span>
          <select
            name="correct_option"
            defaultValue={props.question?.correctOption ?? 'A'}
            className="rounded-2xl border border-slate-800 bg-slate-950/55 px-4 py-3 text-sm text-slate-200 outline-none"
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/45 px-4 py-3 text-sm text-slate-300">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={props.question?.isActive ?? true}
            className="h-4 w-4 rounded border-slate-700 bg-slate-950"
          />
          Keep this question active for the live quiz
        </label>
      </div>

      <div>
        <button
          type="submit"
          className="rounded-2xl border border-sky-400/40 bg-sky-500/20 px-5 py-3 text-sm font-medium text-sky-100 transition hover:border-sky-300 hover:bg-sky-400/25"
        >
          {props.question ? 'Save Changes' : 'Create Question'}
        </button>
      </div>
    </form>
  );
}

function Field(props: { label: string; name: string; defaultValue: string }) {
  return (
    <label className="grid gap-2">
      <span className="mono-heading text-[11px] text-slate-400">{props.label}</span>
      <input
        required
        name={props.name}
        defaultValue={props.defaultValue}
        className="rounded-2xl border border-slate-800 bg-slate-950/55 px-4 py-3 text-sm text-slate-200 outline-none placeholder:text-slate-600"
      />
    </label>
  );
}
