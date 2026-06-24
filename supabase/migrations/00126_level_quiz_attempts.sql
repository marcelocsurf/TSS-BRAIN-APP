-- History of public surf-level quiz submissions (incl. retakes).
--
-- createLeadFromQuiz updates the student's latest quiz result in place, which
-- overwrites prior scores on a retake. This table keeps EVERY submission so the
-- full retake history (how many, and each result) stays tied to the profile.
-- Written only by the service-role server action; no public access.

create table if not exists public.level_quiz_attempts (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid references public.students(id) on delete set null,
  email          text,
  phone          text,
  belt           text,
  score          integer,
  skillmap       jsonb,
  academy_id     uuid,
  source         text,
  attempt_number integer,
  created_at     timestamptz default now()
);

create index if not exists level_quiz_attempts_student_idx on public.level_quiz_attempts (student_id, created_at);
create index if not exists level_quiz_attempts_email_idx on public.level_quiz_attempts (lower(email));

alter table public.level_quiz_attempts enable row level security;
-- No anon/public policy: only the service-role server action reads/writes.
