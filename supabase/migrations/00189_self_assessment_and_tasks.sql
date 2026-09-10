-- 00189: autoevaluación sin ola + tareas propias (Marcelo 2026-09-10).
-- La autoevaluación ubica; la ejecución (o el coach) es lo que hace propia
-- una secuencia. Las tareas: paso + detalle, máximo tres abiertas.
alter table public.student_step_ratings
  add column if not exists self_source text not null default 'executed'
    check (self_source in ('executed','assessed')),
  -- [{criterion_index, criterion_text, result}] de la última autoevaluación
  add column if not exists assessed_criteria jsonb,
  add column if not exists assessed_at timestamptz;
comment on column public.student_step_ratings.self_source is 'executed = nota de una sesión en el agua · assessed = autoevaluación por indicadores, sin ola (vale máx. 3★ para el camino; nunca hace propia la secuencia)';

create table if not exists public.student_tasks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  sequence_id text not null,
  step_id text not null references public.lessons(id) on delete cascade,
  -- El detalle: un momento de la línea o un criterio ("Elbow strike").
  detail text,
  source text not null default 'self' check (source in ('self','system')),
  status text not null default 'open' check (status in ('open','done','dropped')),
  created_at timestamptz not null default now(),
  done_at timestamptz,
  done_reason text check (done_reason is null or done_reason in ('reached_4','marked_done','dropped'))
);
create index if not exists student_tasks_open_idx on public.student_tasks (student_id, created_at) where status = 'open';
alter table public.student_tasks enable row level security;
drop policy if exists student_tasks_select on public.student_tasks;
create policy student_tasks_select on public.student_tasks for select using (
  current_coach_is_platform_admin()
  or student_id in (select id from students where academy_id = current_coach_academy_id())
);
-- Escritura solo desde el servidor (admin client), como student_sequence_ratings.
