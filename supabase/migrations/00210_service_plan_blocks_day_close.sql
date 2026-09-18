-- Cierre del día con video análisis (Marcelo 2026-09-18): por alumno y por
-- secuencia del día, una estrella del coach y el momento donde se rompió.
-- El próximo foco queda estructurado (secuencia + paso), no solo como texto.
alter table public.service_plan_blocks
  add column if not exists coach_sequence_rating integer check (coach_sequence_rating between 1 and 5),
  add column if not exists next_focus_sequence_id text,
  add column if not exists next_focus_step_id text;
comment on column public.service_plan_blocks.coach_sequence_rating is 'Estrella del coach para la secuencia de este bloque, puesta al cerrar el día.';
comment on column public.service_plan_blocks.next_focus_sequence_id is 'Próximo foco estructurado (bloque 0): secuencia.';
comment on column public.service_plan_blocks.next_focus_step_id is 'Próximo foco estructurado (bloque 0): paso donde se rompió.';
