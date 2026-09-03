-- 00180: coach_criterion_evals se lee por academia, como todo lo del alumno
-- (misma regla que self_training_sessions en 00094). La policy de 00179
-- dejaba leer a cualquier usuario autenticado.
drop policy if exists coach_criterion_evals_read on public.coach_criterion_evals;
create policy coach_criterion_evals_select on public.coach_criterion_evals
  for select to authenticated
  using (
    current_coach_is_platform_admin()
    or student_id in (select id from students where academy_id = current_coach_academy_id())
  );
