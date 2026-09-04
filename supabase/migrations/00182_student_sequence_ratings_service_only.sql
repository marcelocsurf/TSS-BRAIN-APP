-- 00182: student_sequence_ratings se escribe SOLO desde el servidor (admin
-- client + token del portal). Las policies abiertas de 00181 dejaban a la
-- anon key insertar/pisar la nota de secuencia de cualquier alumno.
drop policy if exists student_sequence_ratings_insert on public.student_sequence_ratings;
drop policy if exists student_sequence_ratings_update on public.student_sequence_ratings;
create policy student_sequence_ratings_service_all on public.student_sequence_ratings
  for all to service_role using (true) with check (true);

-- Tope de sanidad para las horas de agua (la acción ya recorta a 600 min;
-- esto es el respaldo para cualquier camino de inserción). NOT VALID: no
-- toca filas viejas.
alter table public.self_training_sessions
  add constraint self_training_sessions_duration_check
  check (duration_minutes is null or (duration_minutes >= 0 and duration_minutes <= 1440)) not valid;
alter table public.self_training_sessions
  add constraint self_training_sessions_reps_check
  check (reps_completed is null or (reps_completed >= 0 and reps_completed <= 500)) not valid;
