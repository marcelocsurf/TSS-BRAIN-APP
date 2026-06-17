-- M108 — Per-academy board inventory.
--
-- A real fleet of boards each academy owns: code (auto-suggested), type
-- (soft/hard), shape (short/fun/long), length, volume, and a live status
-- (available / in_use / in_repair / retired). The coach picks a real board
-- when planning; the close flow returns it to available; a damaged board is
-- flagged in_repair (and surfaces as an incident). Additive — does not touch
-- existing session/eval logic.

CREATE TABLE IF NOT EXISTS boards (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id     UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  code           TEXT NOT NULL,
  board_type     TEXT,                 -- 'soft' | 'hard'
  shape          TEXT,                 -- 'short' | 'fun' | 'long'
  length_feet    INTEGER,
  length_inches  INTEGER,
  volume_liters  TEXT,
  status         TEXT NOT NULL DEFAULT 'available', -- available | in_use | in_repair | retired
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (academy_id, code)
);

CREATE INDEX IF NOT EXISTS idx_boards_academy ON boards(academy_id, status);

ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS boards_all ON boards;
CREATE POLICY boards_all ON boards FOR ALL USING (true) WITH CHECK (true);

-- Link a planned block to a real inventory board (nullable — the free
-- type/feet/inches selectors stay as a fallback).
ALTER TABLE service_plan_blocks
  ADD COLUMN IF NOT EXISTS board_id UUID REFERENCES boards(id) ON DELETE SET NULL;
