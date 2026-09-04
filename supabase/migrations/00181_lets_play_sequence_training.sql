-- 00181: Let's Play por SECUENCIA (Marcelo 2026-09-04).
-- La unidad de entreno pasa a ser la secuencia: correrla completa
-- (sequence_run) o trabajar un paso como foco dentro de ella (step_focus).
-- Tres niveles al cerrar: estrella de la secuencia (obligatoria) → qué paso
-- la detuvo (opcional) → qué criterio (opcional).
alter table public.self_training_sessions
  add column if not exists training_mode text
    check (training_mode is null or training_mode in ('sequence_run','step_focus')),
  add column if not exists linked_sequence_id text,
  add column if not exists sequence_rating integer
    check (sequence_rating is null or (sequence_rating >= 1 and sequence_rating <= 5)),
  -- [{step_id, held_back, rating?, criteria_evaluation?}] — el detalle
  -- opcional de un run completo, por paso.
  add column if not exists step_marks jsonb;

create index if not exists self_training_sessions_sequence_idx
  on public.self_training_sessions (student_id, linked_sequence_id, created_at desc)
  where linked_sequence_id is not null;

-- La nota del alumno por secuencia, APARTE de las estrellas de los pasos:
-- "corrí la secuencia y salió 4" no pisa "el pop-up sigue en 2".
create table if not exists public.student_sequence_ratings (
  student_id uuid not null references public.students(id) on delete cascade,
  sequence_id text not null,
  current_rating integer check (current_rating >= 1 and current_rating <= 5),
  rating_count integer not null default 0,
  -- El último paso que "la detuvo": preselecciona el foco la próxima vez.
  held_back_step_id text,
  last_updated timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (student_id, sequence_id)
);

alter table public.student_sequence_ratings enable row level security;
drop policy if exists student_sequence_ratings_select on public.student_sequence_ratings;
create policy student_sequence_ratings_select on public.student_sequence_ratings
  for select using (
    current_coach_is_platform_admin()
    or student_id in (select id from students where academy_id = current_coach_academy_id())
  );
drop policy if exists student_sequence_ratings_insert on public.student_sequence_ratings;
create policy student_sequence_ratings_insert on public.student_sequence_ratings for insert with check (true);
drop policy if exists student_sequence_ratings_update on public.student_sequence_ratings;
create policy student_sequence_ratings_update on public.student_sequence_ratings for update using (true) with check (true);
