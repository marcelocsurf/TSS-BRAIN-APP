-- Citas tipo EVALUACIÓN (2026-08-23): evaluaciones programadas con fecha,
-- visibles en el timeline de temporada del atleta como 📋 futuras.
ALTER TABLE program_appointments DROP CONSTRAINT IF EXISTS program_appointments_kind_check;
ALTER TABLE program_appointments ADD CONSTRAINT program_appointments_kind_check
  CHECK (kind = ANY (ARRAY['fisico'::text, 'mental'::text, 'tecnico'::text, 'nutricion'::text, 'evaluacion'::text, 'otro'::text]));
