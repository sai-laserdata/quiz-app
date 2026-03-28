create extension if not exists pgcrypto;

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  position integer not null unique,
  prompt text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option text not null check (correct_option in ('A', 'B', 'C', 'D')),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  linkedin_url text not null,
  company text not null,
  started_at timestamptz not null default timezone('utc', now()),
  submitted_at timestamptz,
  time_taken_ms integer,
  correct_answers integer not null default 0,
  total_questions integer not null default 0,
  score_percentage numeric(5, 2) not null default 0,
  golden_ticket_code text unique
);

create table if not exists public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  selected_option text check (selected_option in ('A', 'B', 'C', 'D')),
  is_correct boolean not null default false,
  answer_order integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (attempt_id, question_id)
);

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists questions_touch_updated_at on public.questions;
create trigger questions_touch_updated_at
before update on public.questions
for each row execute procedure public.touch_updated_at();

create or replace function public.is_admin(current_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = current_user_id
      and role = 'admin'
  );
$$;

alter table public.questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.admin_profiles enable row level security;

drop policy if exists "Public can read active questions" on public.questions;
create policy "Public can read active questions"
on public.questions
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Admins can manage questions" on public.questions;
create policy "Admins can manage questions"
on public.questions
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "Admins can read attempts" on public.quiz_attempts;
create policy "Admins can read attempts"
on public.quiz_attempts
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "Admins can manage attempts" on public.quiz_attempts;
create policy "Admins can manage attempts"
on public.quiz_attempts
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "Admins can read answers" on public.quiz_answers;
create policy "Admins can read answers"
on public.quiz_answers
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "Admins can manage answers" on public.quiz_answers;
create policy "Admins can manage answers"
on public.quiz_answers
for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

drop policy if exists "Admins can read admin profiles" on public.admin_profiles;
create policy "Admins can read admin profiles"
on public.admin_profiles
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "Users can read own admin profile" on public.admin_profiles;
create policy "Users can read own admin profile"
on public.admin_profiles
for select
to authenticated
using (user_id = auth.uid());

create or replace function public.quiz_admin_summary()
returns table (
  total_participants bigint,
  average_score numeric,
  average_time_ms numeric
)
language sql
security definer
set search_path = public
as $$
  select
    count(*) filter (where submitted_at is not null) as total_participants,
    coalesce(avg(score_percentage) filter (where submitted_at is not null), 0) as average_score,
    coalesce(avg(time_taken_ms) filter (where submitted_at is not null), 0) as average_time_ms
  from public.quiz_attempts;
$$;

insert into public.questions (position, prompt, option_a, option_b, option_c, option_d, correct_option)
values
  (
    1,
    'Which mechanism moves data from disk cache to network buffer without copying to user space?',
    'malloc()',
    'sendfile()',
    'memcpy()',
    'JSON.stringify()',
    'B'
  )
on conflict (position) do update
set
  prompt = excluded.prompt,
  option_a = excluded.option_a,
  option_b = excluded.option_b,
  option_c = excluded.option_c,
  option_d = excluded.option_d,
  correct_option = excluded.correct_option;
