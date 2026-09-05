-- 00185 — Alumnos internos de prueba (limpieza de producción 2026-09-05)
-- Los alumnos de E2E no se pueden borrar (tienen camps, sesiones y ratings
-- colgando por FK) y no conviene: son el banco de pruebas. Se marcan para
-- excluirlos de reportes y comunicaciones.
alter table public.students add column if not exists is_test boolean not null default false;
comment on column public.students.is_test is 'Alumno interno de prueba (E2E). No es una persona real; excluir de reportes y de comunicaciones.';
update public.students set is_test = true where id in (
  'abb7e472-ab27-47a6-bac2-c6f68480dc4e', -- Test Experimentado
  '07db026d-726d-4a19-b5c5-c49a768a57bf', -- Test Principiante
  '4aee1a4f-982c-495b-b68c-b80baf010f43', -- QR Test Fable E2E
  'f09005e7-8013-4275-8c5e-9fbcdd7e3363', -- TEST FullFlow Junio6
  '4ceb743a-1bad-49db-8134-ad3932f1e352'  -- ZZTest SinWaiver
);
