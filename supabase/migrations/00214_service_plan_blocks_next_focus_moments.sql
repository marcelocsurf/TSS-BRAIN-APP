-- Misiones del día (Marcelo 2026-09-21): el coach elige hasta tres partes de
-- la secuencia como misiones en orden. La secuencia sigue siendo la línea
-- (una estrella); las partes son las misiones que el alumno ve y los chips
-- de "dónde se rompió". focus_moments pasa a guardar esos elementos (antes:
-- claves de momentos STP-xxx:clave); next_focus_moments son las de mañana.
alter table public.service_plan_blocks add column if not exists next_focus_moments text[];
comment on column public.service_plan_blocks.next_focus_moments is 'Misiones de mañana (hasta 3 elementos de la secuencia, en orden) elegidas en el cierre; al cerrar se copian a focus_moments del bloque de mañana.';
comment on column public.service_plan_blocks.focus_moments is 'Desde 2026-09-21: las misiones del día (hasta 3 elementos/pasos de la secuencia, en orden). Antes guardaba claves de momentos STP-xxx:clave.';
