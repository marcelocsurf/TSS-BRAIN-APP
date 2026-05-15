-- 00038 — Coach STP structured lessons (pillar tabs)
--
-- Restructures the coach White Belt course to mirror the student
-- portal's pedagogy: instead of 15 monolithic Part-lessons, each of the
-- 25 STPs becomes its own lesson with separable "pillar" sections the
-- coach can tab between — exactly how the student portal sections
-- Theory / Drill / Mission / Errors.
--
-- Per the TSS doctrine (Coach Manual Part VI), each STP teaches the
-- coach 4 things: What to teach · How to deliver (EDPF) · How to
-- correct (errors + cues) · How to validate (mastery criteria). Plus
-- the Drill (Part VII) and Mission (Part VIII) which are pulled live
-- from drills_missions via linked_step_id.
--
-- New columns are nullable — existing lessons (student STPs, master
-- manual, foundation lessons) are unaffected. The coach reader detects
-- a structured lesson by `coach_what_md IS NOT NULL`.

BEGIN;

ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS coach_what_md     TEXT,  -- "What you teach"
  ADD COLUMN IF NOT EXISTS coach_deliver_md  TEXT,  -- "How you teach it (EDPF)"
  ADD COLUMN IF NOT EXISTS coach_errors_md   TEXT,  -- "How you correct it (errors + cues)"
  ADD COLUMN IF NOT EXISTS coach_validate_md TEXT,  -- "How you validate it (mastery criteria)"
  ADD COLUMN IF NOT EXISTS linked_step_id    TEXT;  -- e.g. 'STP-016' → drill/mission lookup

CREATE INDEX IF NOT EXISTS idx_lessons_linked_step ON lessons(linked_step_id)
  WHERE linked_step_id IS NOT NULL;

COMMIT;
