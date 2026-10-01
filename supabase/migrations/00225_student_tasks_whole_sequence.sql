-- Tu lista · una secuencia entera como próximo trabajo.
--
-- Marcelo 2026-10-01: al cerrar un entreno, "What do you work on next?" solo
-- dejaba elegir un detalle de la misma secuencia — "¿qué pasa si quiero
-- trabajar en otra secuencia next?". Una tarea con step_id NULL es la
-- secuencia entera: Train it la corre completa y se cierra sola cuando una
-- corrida de esa secuencia llega a 4★. Las tareas por paso no cambian.
-- 8 filas hoy (1 abierta); ninguna se toca.

alter table public.student_tasks alter column step_id drop not null;

comment on column public.student_tasks.step_id is
  'Paso del curso (lessons.id). NULL = la secuencia entera (sequence_id) como próximo trabajo.';
