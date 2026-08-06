-- Alcance del curso del coach: 'full' (todo lo que su cinta permite) o
-- 'safety_method' (solo Safety Canon + Foundations/método — instructores
-- nuevos en formación inicial, pedido de Marcelo 2026-08-06).
alter table coaches add column if not exists course_access_scope text not null default 'full';
