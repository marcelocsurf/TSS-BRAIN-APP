-- M45 — Flow / focus tracking (Csíkszentmihályi flow channel).
--
-- Coach rates per-block per-student:
--   focus_level  : how present + engaged the student was (1-5).
--   flow_channel : where the student sat on the bored↔frustrated
--                  spectrum (1 = too easy / bored, 3 = optimal flow
--                  in the channel, 5 = overwhelmed / frustrated).
-- The student then self-reports flow_channel in the post-class
-- survey so the academy can spot mismatches: if the coach saw "3
-- optimal" but the student reports "5 frustrated", the next class
-- needs to dial back exigency.

ALTER TABLE service_plan_blocks
  ADD COLUMN IF NOT EXISTS focus_level  INTEGER CHECK (focus_level  IS NULL OR (focus_level  BETWEEN 1 AND 5)),
  ADD COLUMN IF NOT EXISTS flow_channel INTEGER CHECK (flow_channel IS NULL OR (flow_channel BETWEEN 1 AND 5));

ALTER TABLE survey_responses
  ADD COLUMN IF NOT EXISTS flow_channel INTEGER CHECK (flow_channel IS NULL OR (flow_channel BETWEEN 1 AND 5));
