-- 00217 · La tarea del coach sabe CUÁNDO y QUIÉN la dejó (2026-09-25)
--
-- Marcelo: "en la tarea que le deje el coach le aparece [al alumno] y si la
-- trabaja una vez deja de aparecer como aviso". Para saber si la trabajó
-- DESPUÉS de que el coach la dejó hace falta la fecha. Hasta hoy
-- next_recommended_focus / next_focus_sequence_id / next_focus_step_id no
-- tenían fecha ni autor, y cuatro escritores dejaban ids viejos colgados
-- debajo de un texto nuevo.

alter table students add column if not exists next_focus_set_at timestamptz;
alter table students add column if not exists next_focus_set_by uuid references coaches(id) on delete set null;

comment on column students.next_focus_set_at is
  'Cuándo el coach dejó el foco vigente (next_recommended_focus + ids). La tarea deja de aparecer al alumno cuando registra UNA sesión sobre ese paso/secuencia después de esta fecha.';
comment on column students.next_focus_set_by is
  'Coach que dejó el foco vigente.';

-- El RPC del cierre (legado: cierre suelto del dashboard y cierre del día del
-- coach) escribía el texto y dejaba los ids del foco ANTERIOR debajo. Regla:
-- los ids solo valen para el texto con el que se guardaron. Si el texto
-- cambia, los ids se van y la fecha se renueva; si es el mismo texto (el
-- cierre del día ya guardó texto + ids un paso antes), no se toca nada.
create or replace function public.update_student_profile_on_close(
  p_student_id uuid,
  p_session_result_id uuid,
  p_session_date timestamptz,
  p_mission text,
  p_pilar pilar,
  p_status session_status,
  p_homework text,
  p_whats_next text
) returns void as $$
begin
  update students set
    last_session_id = p_session_result_id,
    last_session_date = p_session_date,
    last_session_mission = p_mission,
    last_session_pilar = p_pilar,
    last_session_status = p_status,
    last_homework = p_homework,
    next_focus_sequence_id = case when p_whats_next is distinct from next_recommended_focus then null else next_focus_sequence_id end,
    next_focus_step_id     = case when p_whats_next is distinct from next_recommended_focus then null else next_focus_step_id end,
    next_focus_set_at      = case when p_whats_next is distinct from next_recommended_focus then now() else coalesce(next_focus_set_at, now()) end,
    next_recommended_focus = p_whats_next
  where id = p_student_id;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;
