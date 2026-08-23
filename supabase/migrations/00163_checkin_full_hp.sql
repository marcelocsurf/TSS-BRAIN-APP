-- Check-in COMPLETO (paridad con el app HP viejo, 2026-08-23).
ALTER TABLE program_checkins ADD COLUMN IF NOT EXISTS surf_hours NUMERIC(4,1) CHECK (surf_hours IS NULL OR (surf_hours >= 0 AND surf_hours <= 14));
ALTER TABLE program_checkins ADD COLUMN IF NOT EXISTS focus INT CHECK (focus IS NULL OR (focus BETWEEN 1 AND 4));
ALTER TABLE program_checkins ADD COLUMN IF NOT EXISTS goal_achieved TEXT CHECK (goal_achieved IS NULL OR goal_achieved IN ('si','parcial','no'));
ALTER TABLE programs ALTER COLUMN checkin_nutrition SET DEFAULT true;
UPDATE programs SET checkin_nutrition = true WHERE checkin_nutrition IS DISTINCT FROM true;
