-- The quiz no longer has an entry form. A name is the only thing it asks for,
-- and even that is optional; one-attempt-per-person is now anchored on the
-- `ld_quiz_attempt` cookie rather than on an email address.
--
-- `email`, `linkedin_url` and `company` stay: the attempts collected while the
-- form existed still carry real values, and admin still exports them.

alter table public.quiz_attempts alter column email drop not null;
alter table public.quiz_attempts alter column email set default null;
alter table public.quiz_attempts alter column name set default '';

-- Redundant with the email_normalized pair added in 0002, and nothing reads
-- the raw-email index now that the one-attempt rule has moved off email.
drop index if exists idx_quiz_attempts_email_submitted;
