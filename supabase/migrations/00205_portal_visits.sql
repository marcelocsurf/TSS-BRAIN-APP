-- Seguimiento de regreso (Marcelo 2026-09-17): saber si un alumno abrió su
-- portal, cuándo fue la última vez y qué vio. Habilita "Returning" para el
-- coach y la tarjeta de regreso en la ficha.
alter table public.students
  add column if not exists portal_last_seen_at timestamptz,
  add column if not exists portal_last_screen text,
  add column if not exists portal_visit_count integer not null default 0;

create table if not exists public.portal_visits (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  seen_at timestamptz not null default now(),
  screen text,
  detail text
);
create index if not exists portal_visits_student_seen_idx on public.portal_visits (student_id, seen_at desc);
alter table public.portal_visits enable row level security;
-- Solo el servidor (service role) escribe y lee; sin políticas para anon/authenticated.
