-- El drill NO es examen: al cerrar responde UNA pregunta — ¿lo corriste sin
-- pensar? (compuerta de la lección: "quedate en el drill hasta correrlo sin
-- pensar"). La misión sí lleva la evaluación por criterio.
alter table public.self_training_sessions
  add column if not exists automaticity text
  check (automaticity is null or automaticity in ('yes','almost','not_yet'));

-- Evaluación OPCIONAL por criterio del coach. Historial que no se pisa (mismo
-- criterio que water_tests): el coach marca solo los detalles que quiera, y
-- el más flojo se vuelve el next focus del alumno.
create table if not exists public.coach_criterion_evals (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  step_id text not null,
  drill_mission_id text,
  criterion_index integer not null,
  criterion_text text not null,
  result text not null check (result in ('met','partial','not_met')),
  coach_id uuid references public.coaches(id) on delete set null,
  camp_instance_id uuid references public.camp_instances(id) on delete set null,
  evaluated_at timestamptz not null default now()
);
create index if not exists idx_coach_criterion_evals_student_step
  on public.coach_criterion_evals (student_id, step_id, evaluated_at desc);
alter table public.coach_criterion_evals enable row level security;
create policy coach_criterion_evals_read on public.coach_criterion_evals
  for select to authenticated using (true);
