-- Evaluación del director acorde al método (Marcelo 2026-09-17): 5 dimensiones 0–3.
-- Las columnas 1–10 viejas se conservan para el historial (instrument = 'v1').
alter table coach_evaluations
  add column if not exists instrument text not null default 'v1',
  add column if not exists eye_score smallint check (eye_score between 0 and 3),
  add column if not exists delivery_score smallint check (delivery_score between 0 and 3),
  add column if not exists cues_score smallint check (cues_score between 0 and 3),
  add column if not exists safety_score smallint check (safety_score between 0 and 3),
  add column if not exists plan_score smallint check (plan_score between 0 and 3),
  add column if not exists recommended_max_belt text;
comment on column coach_evaluations.instrument is 'v1 = 4 notas 1–10 (2026); v2 = 5 dimensiones del método 0–3 (eye/delivery/cues/safety/plan).';
comment on column coach_evaluations.recommended_max_belt is 'Cinta hasta la que el director recomienda habilitar al coach tras esta evaluación (no cambia coaches.max_belt_permission sola).';
