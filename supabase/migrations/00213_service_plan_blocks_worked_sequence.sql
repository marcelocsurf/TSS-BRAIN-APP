-- Cierre en una línea (Marcelo 2026-09-20): "se trabajó otra cosa". La
-- secuencia planeada queda en sequence_id; si el coach entrenó otra, va acá
-- y la estrella califica ESTA. La bitácora muestra planeado · trabajado.
alter table public.service_plan_blocks add column if not exists worked_sequence_id text;
comment on column public.service_plan_blocks.worked_sequence_id is 'Secuencia que realmente se trabajó cuando difiere de la planeada (sequence_id). La estrella del coach califica esta.';
