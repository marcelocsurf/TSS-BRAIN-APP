-- 00020 PART 1/2 — Schema rename + cleanup + STP-015 reactivation
-- Run this first.

BEGIN;

-- 1. Rename wb_chapter_* -> wb_sequence_* (canon uses "Sequence")
ALTER TABLE lessons RENAME COLUMN wb_chapter_id   TO wb_sequence_id;
ALTER TABLE lessons RENAME COLUMN wb_chapter_name TO wb_sequence_name;
ALTER TABLE lessons RENAME COLUMN wb_chapter_order TO wb_sequence_order;
ALTER TABLE lessons RENAME COLUMN chapter_step_order TO sequence_step_order;

-- New column for canonical sequence promise text
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS wb_sequence_promise TEXT;

-- Recreate index with new name
DROP INDEX IF EXISTS idx_lessons_wb_chapter;
CREATE INDEX IF NOT EXISTS idx_lessons_wb_sequence
  ON lessons(wb_sequence_id, wb_sequence_order);

-- 2. CLEANUP: delete 30 placeholders from Migration 00018 (D1)
DELETE FROM lessons WHERE id IN (
  'PC-015','PC-016','PC-017','PC-018','PC-019','PC-020',
  'PC-021','PC-022','PC-023','PC-024','PC-025','PC-026',
  'PC-027','PC-028','PC-029','PC-030','PC-031',
  'PC-032','PC-033','PC-034','PC-035','PC-036','PC-037','PC-038',
  'PRWB-001','PRWB-002','PRWB-003','PRWB-004','PRWB-005','PRWB-006'
);

-- 3. DEACTIVATE old PC items not in canon (D2)
UPDATE lessons SET active = FALSE WHERE id IN ('PC-010', 'PC-013', 'PC-014');

-- 4. REACTIVATE STP-015 + insert canon content (idempotent)
UPDATE lessons SET active = TRUE WHERE id = 'STP-015';

INSERT INTO lessons (
  id, course_section, step_number, title, pillar,
  description_md, errors_md, estimated_minutes,
  prerequisites, lesson_type, display_order, active, status_v1
) VALUES (
  'STP-015', 'white_belt', 15,
  'Cobra Pick Line',
  'Technical',
  'Cobra Pick Line is the conscious selection of the wave line from cobra position, BEFORE executing the pop-up. The surfer uses cobra power (raised chest, eyes forward) not just to prepare the body, but to LOOK at where they want to go and COMMIT to that direction visually before standing.

Coach cue: "Choose and commit before standing. Look where you want to go."
Micro-cue: "Look first. Stand second."
5 Key Words: COBRA, EYES, LINE, COMMIT, STAND

Key concepts: Cobra power, Line selection, Eyes forward, Intentional commit, Pre-stand decision, Direction before action.

Biomechanics: In cobra position, head and eyes are already raised forward. Use this physical setup to perform the line scan: identify the direction of the wave shoulder, decide the trajectory, lock the gaze on that point before initiating the pop-up. The body follows where the eyes commit.

Success indicators: (1) Student verbalizes the chosen line direction while still in cobra, before initiating the pop-up. (2) Eyes locked on the chosen direction throughout the pop-up transition (no looking down). (3) Pop-up direction matches the line that was chosen in cobra (intentional, not accidental).',
  '- Not aware of cobra power to pick line
- Undefined first line
- Eyes locked on the nose during cobra
- Standing without visual commit
- Direction set after standing (too late)',
  10, ARRAY[]::TEXT[], 'reading', 15, TRUE, 'PRODUCTIZED'
) ON CONFLICT (id) DO UPDATE SET
  active = TRUE,
  description_md = EXCLUDED.description_md,
  errors_md = EXCLUDED.errors_md,
  pillar = EXCLUDED.pillar,
  status_v1 = 'PRODUCTIZED';

-- 5. Normalize drills_missions: all DRL-WB-XX should be type='drill'
UPDATE drills_missions SET type = 'drill' WHERE id LIKE 'DRL-WB-%';

-- 6. Insert DRL-WB-15 (was missing)
INSERT INTO drills_missions (
  id, step_id, title, type, time_estimate, reps_recommended,
  key_words, description_md, success_criteria,
  belt, block_number, block_name, display_order
) VALUES (
  'DRL-WB-15', 'STP-015',
  'Cobra Pick Line Drill',
  'drill', '8-15 min', '15 reps total (5 per phase)',
  ARRAY['COBRA','EYES','LINE','COMMIT','STAND']::TEXT[],
  'OBJECTIVE: Train the student in conscious selection of the wave line from cobra position before pop-up. Student learns to use cobra power not just to prepare the body, but to look ahead, decide direction, and lock visual commit on the chosen line before standing.

SETUP: Location progression: sand (Phase 1) -> waist-deep water (Phase 2) -> small whitewater (Phase 3). Soft-top board. Coach positioned to validate the visual commit.

PROCEDURE:

Phase 1 - Dry simulation (5 reps):
Student lies on board on sand in cobra position. Coach points to a target on the horizon. Student verbalizes "I am going there" while still in cobra, then simulates the pop-up keeping eyes locked on the target.

Phase 2 - Static water (5 reps):
Same exercise in waist-deep calm water on a floating board. Student practices the visual lock and verbal commit before any pop-up movement.

Phase 3 - Live with foam (5 reps):
Student catches whitewater, enters cobra, scans for the line, verbalizes the commit, then executes the pop-up. Coach validates that direction matches commit.',
  ARRAY[
    'Student verbalizes the chosen line direction while still in cobra, before initiating the pop-up.',
    'Eyes locked on the chosen direction throughout the pop-up transition (no looking down).',
    'Pop-up direction matches the line that was chosen in cobra (intentional, not accidental).'
  ]::TEXT[],
  'white', 3, 'POP-UP', 15
) ON CONFLICT (id) DO UPDATE SET
  type = 'drill',
  description_md = EXCLUDED.description_md,
  success_criteria = EXCLUDED.success_criteria,
  key_words = EXCLUDED.key_words;

COMMIT;
