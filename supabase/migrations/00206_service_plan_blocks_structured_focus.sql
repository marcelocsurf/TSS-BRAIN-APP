-- Foco estructurado del plan simple, al lado del objective_text (que sigue igual).
-- Respaldo: ops_service_plan_blocks_backup_2026_09_17
alter table service_plan_blocks
  add column if not exists sequence_id text,
  add column if not exists focus_step_id text,
  add column if not exists focus_moments text[];
comment on column service_plan_blocks.sequence_id is 'Página de secuencia del curso (SEQUENCE_PAGES id, p. ej. WB-SEQ-3) que se trabaja en este bloque.';
comment on column service_plan_blocks.focus_step_id is 'Paso (STP-xxx) del primer momento de foco elegido; null = secuencia completa.';
comment on column service_plan_blocks.focus_moments is 'Momentos de foco elegidos, "STP-016:clave" por momento (moments.ts).';
