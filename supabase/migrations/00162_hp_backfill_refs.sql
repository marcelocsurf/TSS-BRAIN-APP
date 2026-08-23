-- Respaldo de esquema HP aplicado directo a prod en sesiones anteriores
-- (la revisión detectó que un entorno fresco desde /migrations no los tiene).
CREATE TABLE IF NOT EXISTS season_specialists (
  season_id UUID NOT NULL REFERENCES season_plans(id),
  coach_id UUID NOT NULL REFERENCES coaches(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (season_id, coach_id)
);
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS hp_escalon INT;
