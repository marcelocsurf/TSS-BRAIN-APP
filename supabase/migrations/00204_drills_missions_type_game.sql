-- Juegos (Marcelo 2026-09-17): tercera pieza de Do it junto al drill y la misión.
-- drills_missions.type admite 'game'. Los juegos viven en el catálogo del coach
-- (student_visible=false) hasta que el portal los muestre.
alter table public.drills_missions drop constraint if exists drills_missions_type_check;
alter table public.drills_missions add constraint drills_missions_type_check check (type = any (array['drill'::text, 'mission'::text, 'game'::text]));
