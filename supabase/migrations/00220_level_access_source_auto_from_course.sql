-- 00220 · El acceso por nivel que nace de un curso se puede guardar (2026-09-29)
--
-- grantCourseToStudent inserta en student_level_access con
-- source = 'auto_from_course' y revokeCourseGrant cierra SOLO esas filas (para
-- no tocar un acceso dado a mano, que es 'admin_grant'). Pero la CHECK solo
-- aceptaba admin_grant / camp_enrollment / token_code / webhook: el insert
-- fallaba en silencio y ningún curso otorgado creó nunca su fila (124 grants
-- activos sin fila al 2026-09-29; 3 del camp Blue de hoy).
--
-- Solo agrega un valor: las 25 filas existentes son admin_grant.

alter table student_level_access drop constraint if exists student_level_access_source_check;
alter table student_level_access add constraint student_level_access_source_check
  check (source = any (array['admin_grant', 'camp_enrollment', 'token_code', 'webhook', 'auto_from_course']));
