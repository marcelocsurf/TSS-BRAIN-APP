-- 00191: recordatorio del día antes AL ALUMNO (Marcelo 2026-09-10).
-- Idempotencia por sesión: se estampa la fecha en que se mandó.
alter table public.camp_sessions add column if not exists student_reminder_on date;
