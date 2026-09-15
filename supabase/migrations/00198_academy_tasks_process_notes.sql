-- Paso a paso escrito por quien ejecuta la tarea (pedido de Marcelo para Daren, 2026-09-15):
-- levantar data de los procesos reales de la academia desde el que los hace.
alter table academy_tasks add column if not exists process_notes text;
alter table academy_tasks add column if not exists process_notes_updated_at timestamptz;
alter table academy_tasks add column if not exists process_notes_by uuid references coaches(id);
