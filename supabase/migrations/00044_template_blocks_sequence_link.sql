-- M? — Connect camp_template_blocks to the TSS sequence catalog.
--
-- Today template blocks store freeform `pilar` + `mission` + `drill_name` text
-- with no link to drills_missions / STPs. The coach plans entirely from
-- scratch in service_plan_blocks.
--
-- This migration adds optional FKs so the template builder can pick a real
-- STP + canonical drill + canonical mission per block — and the coach can
-- inherit them. Existing rows keep their freeform values; `pilar` stays
-- for back-compat but the UI stops writing it.

ALTER TABLE camp_template_blocks
  ADD COLUMN IF NOT EXISTS step_id        TEXT,    -- STP-XXX, the sequence step this block trains
  ADD COLUMN IF NOT EXISTS drill_id       TEXT,    -- drills_missions.id (type='drill')
  ADD COLUMN IF NOT EXISTS drill_custom   TEXT,    -- write-in fallback for non-canonical drill
  ADD COLUMN IF NOT EXISTS mission_id     TEXT,    -- drills_missions.id (type='mission')
  ADD COLUMN IF NOT EXISTS mission_custom TEXT;    -- write-in fallback for non-canonical mission

CREATE INDEX IF NOT EXISTS idx_camp_template_blocks_step
  ON camp_template_blocks(step_id);
