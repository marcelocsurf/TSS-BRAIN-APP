-- Plantillas de camp en el idioma del método (Marcelo 2026-09-18): cada bloque
-- puede apuntar a su SECUENCIA del curso (SEQUENCE_PAGES id), a un foco
-- (paso + momentos) y a temas de teoría (topics.ts). Cada día puede declarar
-- su secuencia principal y sus temas. Todo nullable: las plantillas viejas no cambian.
alter table camp_template_blocks
  add column if not exists sequence_id text,
  add column if not exists focus_step_id text,
  add column if not exists focus_moments text[],
  add column if not exists topic_ids text[];
alter table camp_template_days
  add column if not exists sequence_id text,
  add column if not exists topic_ids text[];
comment on column camp_template_blocks.sequence_id is 'Página de secuencia del curso (SEQUENCE_PAGES id: WB-SEQ-3, BB-NAV, THREE-CIRCLES…) que trabaja este bloque. Se copia a service_plan_blocks.sequence_id.';
comment on column camp_template_blocks.focus_step_id is 'Paso (STP-xxx) sugerido como foco del bloque; null = secuencia completa.';
comment on column camp_template_blocks.focus_moments is 'Momentos sugeridos "STP-016:clave" (moments.ts).';
comment on column camp_template_blocks.topic_ids is 'Temas de teoría del bloque (PLAN_TOPICS ids: circles, loop, lesson:<id>).';
comment on column camp_template_days.sequence_id is 'Secuencia principal del día (SEQUENCE_PAGES id).';
comment on column camp_template_days.topic_ids is 'Temas de teoría del día; se copian a service_plans.topics al crear el camp.';
