-- Attempt integrity + answer-key exposure fix.
--
-- Safe to run against a live database: additive only. No existing row is
-- modified or deleted. Existing attempts get served_question_ids = null, which
-- the app treats as "legacy attempt" (it can no longer be submitted, only read).
--
-- Run this once against your project, then keep supabase/schema.sql for fresh
-- installs. Do NOT re-run schema.sql against a live database -- its trailing
-- seed block overwrites the question at position 1.

-- 1. Record which questions were actually served for an attempt, so submission
--    scores against the server's list instead of whatever the client sends.
alter table public.quiz_attempts
  add column if not exists served_question_ids uuid[];

-- 2. The anon key ships to the browser, so this policy published correct_option
--    for every active question to anyone who opened the site. The app reads
--    questions through the service-role client and never uses the anon key for
--    them, so the policy is unnecessary.
drop policy if exists "Public can read active questions" on public.questions;

-- 3. quiz_admin_summary is security definer; keep it off the public roles.
revoke execute on function public.quiz_admin_summary() from anon, authenticated;
