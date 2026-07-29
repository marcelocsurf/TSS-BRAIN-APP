-- 00151 — Waiver de staff (#12b): el equipo firma desde su portal.
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS waiver_signed_at timestamptz;
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS waiver_signature text;
