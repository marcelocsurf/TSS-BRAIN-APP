-- 00164: PLAN ANUAL — delta sobre season_phases/season_events existentes
-- Pedido de Marcelo (2026-08-23): ver el AÑO completo del atleta con fases,
-- picos, viajes y citas. Las tablas ya existían; este delta las alinea con su
-- programa anual en papel (Macro_Phase: General Prep → Specific Prep →
-- Pre-Comp → Competition → Transition + Recovery) y con eventos de RANGO.

-- Fases: dos tipos más (precompetitiva y recuperación/lesión).
ALTER TABLE season_phases DROP CONSTRAINT IF EXISTS season_phases_color_key_check;
ALTER TABLE season_phases ADD CONSTRAINT season_phases_color_key_check
  CHECK (color_key IN ('general','especifica','precompetitiva','competitiva','transicion','recuperacion'));

-- Eventos: rango de fechas (viajes/camps duran días) + notas + kinds nuevos.
ALTER TABLE season_events ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE season_events ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE season_events DROP CONSTRAINT IF EXISTS season_events_kind_check;
ALTER TABLE season_events ADD CONSTRAINT season_events_kind_check
  CHECK (kind IN ('camp','nacional','internacional','viaje','medico','otro'));
ALTER TABLE season_events DROP CONSTRAINT IF EXISTS season_events_range_check;
ALTER TABLE season_events ADD CONSTRAINT season_events_range_check
  CHECK (end_date IS NULL OR end_date >= event_date);
