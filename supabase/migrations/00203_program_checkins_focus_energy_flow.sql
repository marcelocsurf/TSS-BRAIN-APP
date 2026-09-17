-- Check-in diario del programa (Marcelo 2026-09-17):
--  · focus pasa a la escala 0-3 de la autoevaluación del alumno
--    (0 Distracted · 1 Some · 2 Mostly · 3 Locked in)
--  · energy pasa a 1-5
--  · flow_channel nuevo, 1-5 (1 Bored · 2 Easy · 3 Flow · 4 Hard · 5 Too much)
--    — misma escala que survey_responses / self_training_sessions, suma al Flow Channel del portal.
alter table public.program_checkins drop constraint if exists program_checkins_energy_check;
alter table public.program_checkins add constraint program_checkins_energy_check check (energy is null or (energy >= 1 and energy <= 5));
alter table public.program_checkins drop constraint if exists program_checkins_focus_check;
alter table public.program_checkins add constraint program_checkins_focus_check check (focus is null or (focus >= 0 and focus <= 4));
alter table public.program_checkins add column if not exists flow_channel smallint;
alter table public.program_checkins drop constraint if exists program_checkins_flow_channel_check;
alter table public.program_checkins add constraint program_checkins_flow_channel_check check (flow_channel is null or (flow_channel >= 1 and flow_channel <= 5));
