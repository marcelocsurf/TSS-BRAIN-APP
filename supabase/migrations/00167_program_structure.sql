-- 00167: ESTRUCTURA del entreno HP (pedido Marcelo 2026-08-25).
-- Diagnóstico: program_items tenía SOLO title/detail/video_url — el programa
-- HP era la única superficie del sistema sin estructura, mientras camps
-- (camp_template_blocks) y clases (lesson_plan_blocks) sí guardan paso, drill,
-- duración y pilar. Consecuencias: no se podía sumar tiempo, nada quedaba
-- atado a un paso (rompía el puente con student_step_ratings y la progresión
-- de cinta), y el % por pilar de la matriz no se podía contrastar con nada.

-- ── Ítem del programa: dosis, paso, origen y pilar ──
ALTER TABLE program_items ADD COLUMN IF NOT EXISTS duration_minutes INT;
ALTER TABLE program_items ADD COLUMN IF NOT EXISTS step_id TEXT;      -- STP-### (lessons.id)
ALTER TABLE program_items ADD COLUMN IF NOT EXISTS drill_id TEXT;     -- DRL-… / MIS-… de origen
ALTER TABLE program_items ADD COLUMN IF NOT EXISTS pillar TEXT;
ALTER TABLE program_items DROP CONSTRAINT IF EXISTS program_items_pillar_check;
ALTER TABLE program_items ADD CONSTRAINT program_items_pillar_check
  CHECK (pillar IS NULL OR pillar IN ('fisico','tecnico','tactico','mental','equipment','surf'));
ALTER TABLE program_items DROP CONSTRAINT IF EXISTS program_items_duration_check;
ALTER TABLE program_items ADD CONSTRAINT program_items_duration_check
  CHECK (duration_minutes IS NULL OR (duration_minutes >= 0 AND duration_minutes <= 600));
CREATE INDEX IF NOT EXISTS idx_program_items_step ON program_items(step_id) WHERE step_id IS NOT NULL;

-- ── Día del programa: modalidad y duración planificada ──
ALTER TABLE program_days ADD COLUMN IF NOT EXISTS modality TEXT;
ALTER TABLE program_days DROP CONSTRAINT IF EXISTS program_days_modality_check;
ALTER TABLE program_days ADD CONSTRAINT program_days_modality_check
  CHECK (modality IS NULL OR modality IN ('agua','tierra','gym','skate','mixto','descanso'));

-- ── Programa: cinta objetivo (las 199 plantillas HP ya la traen y se tiraba) ──
ALTER TABLE programs ADD COLUMN IF NOT EXISTS target_belt TEXT;

-- ── Sesión presencial: hora, duración, lugar, coach y qué se entrena ──
-- La tabla tenía 5 columnas y ninguna era hora/coach/lugar; el staff estaba
-- usando el TÍTULO como campo de lugar ("EL ZONTE").
ALTER TABLE hp_team_sessions ADD COLUMN IF NOT EXISTS session_time TEXT;      -- HH:MM
ALTER TABLE hp_team_sessions ADD COLUMN IF NOT EXISTS duration_minutes INT;
ALTER TABLE hp_team_sessions ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE hp_team_sessions ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES coaches(id);
ALTER TABLE hp_team_sessions ADD COLUMN IF NOT EXISTS focus TEXT;             -- qué se entrena
ALTER TABLE hp_team_sessions ADD COLUMN IF NOT EXISTS kind TEXT;              -- agua/tierra/gym/…
ALTER TABLE hp_team_sessions DROP CONSTRAINT IF EXISTS hp_team_sessions_kind_check;
ALTER TABLE hp_team_sessions ADD CONSTRAINT hp_team_sessions_kind_check
  CHECK (kind IS NULL OR kind IN ('agua','tierra','gym','skate','video','mixto'));
ALTER TABLE hp_team_sessions DROP CONSTRAINT IF EXISTS hp_team_sessions_duration_check;
ALTER TABLE hp_team_sessions ADD CONSTRAINT hp_team_sessions_duration_check
  CHECK (duration_minutes IS NULL OR (duration_minutes > 0 AND duration_minutes <= 600));
