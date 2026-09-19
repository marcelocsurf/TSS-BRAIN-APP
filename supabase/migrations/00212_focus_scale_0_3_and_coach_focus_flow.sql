-- Una sola escala de enfoque (Marcelo 2026-09-19): 0–3 con las mismas cuatro
-- palabras del alumno (Distracted · Some · Mostly · Locked in). El coach la
-- usaba 1–5 y el dato no llegaba a la ficha del alumno.
alter table public.service_plan_blocks drop constraint if exists service_plan_blocks_focus_level_check;
update public.service_plan_blocks set focus_level = case focus_level when 1 then 0 when 2 then 1 when 3 then 2 when 4 then 3 when 5 then 3 else focus_level end where focus_level is not null and focus_level > 3;
alter table public.service_plan_blocks add constraint service_plan_blocks_focus_level_check check (focus_level is null or (focus_level >= 0 and focus_level <= 3));
comment on column public.service_plan_blocks.focus_level is 'Enfoque visto por el coach, 0–3 (Distracted · Some · Mostly · Locked in), misma escala que la autoevaluación del alumno.';
-- Lo que el coach vio, en la sesión del alumno (antes se quedaba en el bloque del plan).
alter table public.student_session_results
  add column if not exists coach_focus integer check (coach_focus is null or (coach_focus >= 0 and coach_focus <= 3)),
  add column if not exists coach_flow integer check (coach_flow is null or (coach_flow >= 1 and coach_flow <= 5));
comment on column public.student_session_results.coach_focus is 'Enfoque del alumno visto por el coach al cerrar el día, 0–3.';
comment on column public.student_session_results.coach_flow is 'Flow channel visto por el coach al cerrar el día, 1–5 (3 = flow).';
