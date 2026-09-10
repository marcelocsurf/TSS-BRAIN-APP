-- 00188: el plan se guarda ANTES del agua y la sesión se cierra DESPUÉS
-- (Marcelo 2026-09-10). Una sesión de Let's Play nace 'planned' al guardar
-- el plan y pasa a 'done' al evaluar; 'discarded' si nunca se cerró.
alter table public.self_training_sessions
  add column if not exists status text not null default 'done'
    check (status in ('planned','done','discarded')),
  -- Cómo se mide el alumno: tiempo, runs/olas, o las dos.
  add column if not exists measure text
    check (measure is null or measure in ('time','reps','waves','time_reps')),
  -- El momento de la línea elegido como foco ("Back hand, palm up…").
  add column if not exists focus_moment text,
  add column if not exists planned_at timestamptz;
create index if not exists self_training_sessions_open_idx
  on public.self_training_sessions (student_id, created_at desc)
  where status = 'planned';
comment on column public.self_training_sessions.status is 'planned = plan guardado, todavía en el agua · done = evaluada · discarded = descartada sin evaluar';
