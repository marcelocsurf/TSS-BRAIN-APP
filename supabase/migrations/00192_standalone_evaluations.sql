-- 00192: la MISMA evaluación final, desde la ficha (Marcelo 2026-09-10).
-- Un acta por evaluación, sin camp: nivel, autonomía en el agua, foco y cinta.
create table if not exists public.standalone_evaluations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  coach_id uuid not null references public.coaches(id) on delete set null,
  approved boolean not null default false,
  readiness_summary text,
  ocean_level_recommendation text,
  student_visible_note text,
  coach_private_note text,
  areas_to_improve text,
  target_belt text,
  promoted boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists standalone_evaluations_student_idx on public.standalone_evaluations (student_id, created_at desc);
alter table public.standalone_evaluations enable row level security;
drop policy if exists standalone_evaluations_select on public.standalone_evaluations;
create policy standalone_evaluations_select on public.standalone_evaluations for select using (
  current_coach_is_platform_admin()
  or student_id in (select id from students where academy_id = current_coach_academy_id())
);
