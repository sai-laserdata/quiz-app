-- Follow-up hardening. Additive and non-destructive: no existing row is
-- modified or deleted. Run after 0001.

-- 1. Case-insensitive identity for the one-attempt-per-person rule.
--    A generated column keeps the address exactly as the lead typed it (which
--    is what sales follow-up and the CSV export want) while giving the rule a
--    stable key. Postgres backfills it for existing rows automatically.
alter table public.quiz_attempts
  add column if not exists email_normalized text
  generated always as (lower(email)) stored;

create index if not exists idx_quiz_attempts_email_normalized
  on public.quiz_attempts (email_normalized);

-- 2. Supports the per-email attempt quota that bounds row growth from someone
--    hammering "Start Quiz".
create index if not exists idx_quiz_attempts_email_normalized_submitted
  on public.quiz_attempts (email_normalized) where submitted_at is not null;
