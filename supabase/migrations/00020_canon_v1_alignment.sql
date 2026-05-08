-- 00020 — Align DB to White Belt Canon v1 (STRUCTURAL)
-- Source of truth: /02_BELTS/WhiteBelt/_CONSOLIDATED_v1_EN/ (14 files)
--
-- Marcelo decisions (2026-05-08):
-- D1 borrar 30 placeholders de Migration 00018
-- D2 marcar inactive PC-010, PC-013, PC-014 (no en canon)
-- D3 reemplazar contenido productized con canon (Migration 00021)
-- D4 nuevo course_section 'wb_onboarding' (Module 1)
-- D5 agregar filas de missions a drills_missions (Migration 00021)
--
-- This migration is STRUCTURAL only:
-- - Schema renames (chapter -> sequence)
-- - Cleanup of placeholders
-- - Reactivate STP-015 + INSERT canon
-- - Re-map 25 STPs to 5 cumulative sequences
-- - Insert DRL-WB-15 (drill for STP-015)

BEGIN;

-- ============================================
-- 1. SCHEMA: rename wb_chapter_* -> wb_sequence_*
-- ============================================
-- The canon uses "Sequence" (cumulative pedagogical grouping).
-- Old wb_chapter_* fields were a misnomer from the previous spec.

ALTER TABLE lessons RENAME COLUMN wb_chapter_id   TO wb_sequence_id;
ALTER TABLE lessons RENAME COLUMN wb_chapter_name TO wb_sequence_name;
ALTER TABLE lessons RENAME COLUMN wb_chapter_order TO wb_sequence_order;
ALTER TABLE lessons RENAME COLUMN chapter_step_order TO sequence_step_order;

-- New: each sequence has a canonical "promise" text
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS wb_sequence_promise TEXT;

-- Drop old index, recreate with new name
DROP INDEX IF EXISTS idx_lessons_wb_chapter;
CREATE INDEX IF NOT EXISTS idx_lessons_wb_sequence
  ON lessons(wb_sequence_id, wb_sequence_order);

-- ============================================
-- 2. CLEANUP: delete 30 placeholders from Migration 00018 (D1)
-- ============================================

DELETE FROM lessons WHERE id IN (
  'PC-015','PC-016','PC-017','PC-018','PC-019','PC-020',
  'PC-021','PC-022','PC-023','PC-024','PC-025','PC-026',
  'PC-027','PC-028','PC-029','PC-030','PC-031',
  'PC-032','PC-033','PC-034','PC-035','PC-036','PC-037','PC-038',
  'PRWB-001','PRWB-002','PRWB-003','PRWB-004','PRWB-005','PRWB-006'
);

-- ============================================
-- 3. DEACTIVATE old PC items not in canon (D2)
-- ============================================
-- PC-010 Currents (absorbed into PC-PRE-05 What to Do If You Lose the Board)
-- PC-013 Bloque de Entrada preview (deprecated)
-- PC-014 3 Circles of Power (deprecated)

UPDATE lessons SET active = FALSE
  WHERE id IN ('PC-010', 'PC-013', 'PC-014');

-- ============================================
-- 4. REACTIVATE STP-015 (Cobra Pick Line) — canon says ACTIVE
-- ============================================
-- Migration 00018 marked it inactive based on outdated spec.
-- Canon (file 04 + 05) confirms it as Sequence #3 active step.

UPDATE lessons SET active = TRUE WHERE id = 'STP-015';

-- Insert STP-015 if missing (idempotent)
INSERT INTO lessons (
  id, course_section, step_number, title, pillar,
  description_md, errors_md, estimated_minutes,
  prerequisites, lesson_type, display_order, active, status_v1
) VALUES (
  'STP-015', 'white_belt', 15,
  'Cobra Pick Line',
  'Technical',
  'Cobra Pick Line is the conscious selection of the wave line from cobra position, BEFORE executing the pop-up. The surfer uses cobra power (raised chest, eyes forward) not just to prepare the body, but to LOOK at where they want to go and COMMIT to that direction visually before standing. Without intentional line selection from cobra, the pop-up happens "blind" and the surfer drifts wherever the wave pushes.

**Coach cue:** "Choose and commit before standing. Look where you want to go."

**Micro-cue:** "Look first. Stand second."

**5 Key Words:** COBRA · EYES · LINE · COMMIT · STAND

**Key concepts:** Cobra power · Line selection · Eyes forward · Intentional commit · Pre-stand decision · Direction before action.

**Biomechanics:** In cobra position, head and eyes are already raised forward. Use this physical setup to perform the line scan: identify the direction of the wave shoulder, decide the trajectory, lock the gaze on that point before initiating the pop-up. The body follows where the eyes commit.

**Success indicators:** (1) Student verbalizes the chosen line direction while still in cobra, before initiating the pop-up. (2) Eyes locked on the chosen direction throughout the pop-up transition (no looking down). (3) Pop-up direction matches the line that was chosen in cobra (intentional, not accidental).',
  '- Not aware of cobra power to pick line
- Undefined first line
- Eyes locked on the nose during cobra
- Standing without visual commit
- Direction set after standing (too late)',
  10,
  ARRAY[]::TEXT[],
  'reading',
  15,
  TRUE,
  'PRODUCTIZED'
) ON CONFLICT (id) DO UPDATE SET
  active = TRUE,
  description_md = EXCLUDED.description_md,
  errors_md = EXCLUDED.errors_md,
  pillar = EXCLUDED.pillar,
  status_v1 = 'PRODUCTIZED';

-- ============================================
-- 5. NORMALIZE drills_missions: all DRL-WB-XX are type='drill' per canon
-- ============================================
-- Canon defines: drill = training mechanic (typically dry/calm).
-- Some old rows had type='mission' which is incorrect.
-- (Missions get separate MIS-WB-XXX rows in Migration 00021.)

UPDATE drills_missions SET type = 'drill' WHERE id LIKE 'DRL-WB-%';

-- ============================================
-- 6. INSERT DRL-WB-15 (was missing per Migration 00018 STP-015 deactivation)
-- ============================================

INSERT INTO drills_missions (
  id, step_id, title, type, time_estimate, reps_recommended,
  key_words, description_md, success_criteria,
  belt, block_number, block_name, display_order
) VALUES (
  'DRL-WB-15', 'STP-015',
  'Cobra Pick Line Drill',
  'drill',
  '8-15 min',
  '15 reps total (5 per phase)',
  ARRAY['COBRA','EYES','LINE','COMMIT','STAND']::TEXT[],
  'OBJECTIVE: Train the student in conscious selection of the wave line from cobra position before pop-up. Student learns to use cobra power not just to prepare the body, but to look ahead, decide direction, and lock visual commit on the chosen line before standing.

SETUP: Location progression: sand (Phase 1) -> waist-deep water (Phase 2) -> small whitewater (Phase 3). Soft-top board. Coach positioned to validate the visual commit.

PROCEDURE:

### Phase 1 - Dry simulation (5 reps)
Student lies on board on sand in cobra position. Coach points to a target on the horizon. Student verbalizes "I am going there" while still in cobra, then simulates the pop-up keeping eyes locked on the target.

### Phase 2 - Static water (5 reps)
Same exercise in waist-deep calm water on a floating board. Student practices the visual lock and verbal commit before any pop-up movement.

### Phase 3 - Live with foam (5 reps)
Student catches whitewater, enters cobra, scans for the line, verbalizes the commit, then executes the pop-up. Coach validates that direction matches commit.',
  ARRAY[
    'Student verbalizes the chosen line direction while still in cobra, before initiating the pop-up.',
    'Eyes locked on the chosen direction throughout the pop-up transition (no looking down).',
    'Pop-up direction matches the line that was chosen in cobra (intentional, not accidental).'
  ]::TEXT[],
  'white', 3, 'POP-UP', 15
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  type = 'drill',
  description_md = EXCLUDED.description_md,
  success_criteria = EXCLUDED.success_criteria,
  key_words = EXCLUDED.key_words,
  display_order = EXCLUDED.display_order;

-- ============================================
-- 7. RE-MAP 25 STPs to 5 cumulative sequences (canonical)
-- ============================================
-- Source: file 04_WB_SEQUENCES_canon.md

-- Sequence #1 — Board Control (9 steps): STP-001 to STP-009
UPDATE lessons SET wb_sequence_id='WB-SEQ-1', wb_sequence_name='Board Control', wb_sequence_order=1, sequence_step_order=1, wb_sequence_promise='You learn to read the spot, prepare your body, control the board on land and through whitewater while standing.' WHERE id='STP-001';
UPDATE lessons SET wb_sequence_id='WB-SEQ-1', wb_sequence_name='Board Control', wb_sequence_order=1, sequence_step_order=2, wb_sequence_promise='You learn to read the spot, prepare your body, control the board on land and through whitewater while standing.' WHERE id='STP-002';
UPDATE lessons SET wb_sequence_id='WB-SEQ-1', wb_sequence_name='Board Control', wb_sequence_order=1, sequence_step_order=3, wb_sequence_promise='You learn to read the spot, prepare your body, control the board on land and through whitewater while standing.' WHERE id='STP-003';
UPDATE lessons SET wb_sequence_id='WB-SEQ-1', wb_sequence_name='Board Control', wb_sequence_order=1, sequence_step_order=4, wb_sequence_promise='You learn to read the spot, prepare your body, control the board on land and through whitewater while standing.' WHERE id='STP-004';
UPDATE lessons SET wb_sequence_id='WB-SEQ-1', wb_sequence_name='Board Control', wb_sequence_order=1, sequence_step_order=5, wb_sequence_promise='You learn to read the spot, prepare your body, control the board on land and through whitewater while standing.' WHERE id='STP-005';
UPDATE lessons SET wb_sequence_id='WB-SEQ-1', wb_sequence_name='Board Control', wb_sequence_order=1, sequence_step_order=6, wb_sequence_promise='You learn to read the spot, prepare your body, control the board on land and through whitewater while standing.' WHERE id='STP-006';
UPDATE lessons SET wb_sequence_id='WB-SEQ-1', wb_sequence_name='Board Control', wb_sequence_order=1, sequence_step_order=7, wb_sequence_promise='You learn to read the spot, prepare your body, control the board on land and through whitewater while standing.' WHERE id='STP-007';
UPDATE lessons SET wb_sequence_id='WB-SEQ-1', wb_sequence_name='Board Control', wb_sequence_order=1, sequence_step_order=8, wb_sequence_promise='You learn to read the spot, prepare your body, control the board on land and through whitewater while standing.' WHERE id='STP-008';
UPDATE lessons SET wb_sequence_id='WB-SEQ-1', wb_sequence_name='Board Control', wb_sequence_order=1, sequence_step_order=9, wb_sequence_promise='You learn to read the spot, prepare your body, control the board on land and through whitewater while standing.' WHERE id='STP-009';

-- Sequence #2 — Sweet Spot (5 steps): STP-010 to STP-014
UPDATE lessons SET wb_sequence_id='WB-SEQ-2', wb_sequence_name='Sweet Spot', wb_sequence_order=2, sequence_step_order=1, wb_sequence_promise='You find your sweet spot on the board, align with the wave, paddle to catch whitewater, ride prone with directional control, and dismount cleanly.' WHERE id='STP-010';
UPDATE lessons SET wb_sequence_id='WB-SEQ-2', wb_sequence_name='Sweet Spot', wb_sequence_order=2, sequence_step_order=2, wb_sequence_promise='You find your sweet spot on the board, align with the wave, paddle to catch whitewater, ride prone with directional control, and dismount cleanly.' WHERE id='STP-011';
UPDATE lessons SET wb_sequence_id='WB-SEQ-2', wb_sequence_name='Sweet Spot', wb_sequence_order=2, sequence_step_order=3, wb_sequence_promise='You find your sweet spot on the board, align with the wave, paddle to catch whitewater, ride prone with directional control, and dismount cleanly.' WHERE id='STP-012';
UPDATE lessons SET wb_sequence_id='WB-SEQ-2', wb_sequence_name='Sweet Spot', wb_sequence_order=2, sequence_step_order=4, wb_sequence_promise='You find your sweet spot on the board, align with the wave, paddle to catch whitewater, ride prone with directional control, and dismount cleanly.' WHERE id='STP-013';
UPDATE lessons SET wb_sequence_id='WB-SEQ-2', wb_sequence_name='Sweet Spot', wb_sequence_order=2, sequence_step_order=5, wb_sequence_promise='You find your sweet spot on the board, align with the wave, paddle to catch whitewater, ride prone with directional control, and dismount cleanly.' WHERE id='STP-014';

-- Sequence #3 — Pop-Up (6 steps): STP-015 to STP-020
UPDATE lessons SET wb_sequence_id='WB-SEQ-3', wb_sequence_name='Pop-Up', wb_sequence_order=3, sequence_step_order=1, wb_sequence_promise='You select your line from cobra, execute the pop-up, land in correct foot position, hold the power stance, generate impulse, and exit safely with a starfish dismount when needed.' WHERE id='STP-015';
UPDATE lessons SET wb_sequence_id='WB-SEQ-3', wb_sequence_name='Pop-Up', wb_sequence_order=3, sequence_step_order=2, wb_sequence_promise='You select your line from cobra, execute the pop-up, land in correct foot position, hold the power stance, generate impulse, and exit safely with a starfish dismount when needed.' WHERE id='STP-016';
UPDATE lessons SET wb_sequence_id='WB-SEQ-3', wb_sequence_name='Pop-Up', wb_sequence_order=3, sequence_step_order=3, wb_sequence_promise='You select your line from cobra, execute the pop-up, land in correct foot position, hold the power stance, generate impulse, and exit safely with a starfish dismount when needed.' WHERE id='STP-017';
UPDATE lessons SET wb_sequence_id='WB-SEQ-3', wb_sequence_name='Pop-Up', wb_sequence_order=3, sequence_step_order=4, wb_sequence_promise='You select your line from cobra, execute the pop-up, land in correct foot position, hold the power stance, generate impulse, and exit safely with a starfish dismount when needed.' WHERE id='STP-018';
UPDATE lessons SET wb_sequence_id='WB-SEQ-3', wb_sequence_name='Pop-Up', wb_sequence_order=3, sequence_step_order=5, wb_sequence_promise='You select your line from cobra, execute the pop-up, land in correct foot position, hold the power stance, generate impulse, and exit safely with a starfish dismount when needed.' WHERE id='STP-019';
UPDATE lessons SET wb_sequence_id='WB-SEQ-3', wb_sequence_name='Pop-Up', wb_sequence_order=3, sequence_step_order=6, wb_sequence_promise='You select your line from cobra, execute the pop-up, land in correct foot position, hold the power stance, generate impulse, and exit safely with a starfish dismount when needed.' WHERE id='STP-020';

-- Sequence #4 — Directional Turns (2 steps): STP-021, STP-022
UPDATE lessons SET wb_sequence_id='WB-SEQ-4', wb_sequence_name='Directional Turns', wb_sequence_order=4, sequence_step_order=1, wb_sequence_promise='You execute your first turns - backside and frontside - using rail engagement and visual lead.' WHERE id='STP-021';
UPDATE lessons SET wb_sequence_id='WB-SEQ-4', wb_sequence_name='Directional Turns', wb_sequence_order=4, sequence_step_order=2, wb_sequence_promise='You execute your first turns - backside and frontside - using rail engagement and visual lead.' WHERE id='STP-022';

-- Sequence #5 — Independence (3 steps): STP-023, STP-024, STP-025
UPDATE lessons SET wb_sequence_id='WB-SEQ-5', wb_sequence_name='Independence', wb_sequence_order=5, sequence_step_order=1, wb_sequence_promise='You set your own session goal, paddle out unassisted, manage waves on your way out (turtle roll), redirect prone, and turn left or right on a wave. Belt Value formalized: Humildad.' WHERE id='STP-023';
UPDATE lessons SET wb_sequence_id='WB-SEQ-5', wb_sequence_name='Independence', wb_sequence_order=5, sequence_step_order=2, wb_sequence_promise='You set your own session goal, paddle out unassisted, manage waves on your way out (turtle roll), redirect prone, and turn left or right on a wave. Belt Value formalized: Humildad.' WHERE id='STP-024';
UPDATE lessons SET wb_sequence_id='WB-SEQ-5', wb_sequence_name='Independence', wb_sequence_order=5, sequence_step_order=3, wb_sequence_promise='You set your own session goal, paddle out unassisted, manage waves on your way out (turtle roll), redirect prone, and turn left or right on a wave. Belt Value formalized: Humildad.' WHERE id='STP-025';

-- ============================================
-- 8. SANITY CHECK
-- ============================================

DO $$
DECLARE
  pc_count INTEGER;
  stp_count INTEGER;
  seq_count INTEGER;
  drill_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO pc_count FROM lessons WHERE id LIKE 'PC-%' AND active=TRUE;
  SELECT COUNT(*) INTO stp_count FROM lessons WHERE id LIKE 'STP-%' AND active=TRUE;
  SELECT COUNT(*) INTO seq_count FROM lessons WHERE wb_sequence_id IS NOT NULL AND active=TRUE;
  SELECT COUNT(*) INTO drill_count FROM drills_missions WHERE id LIKE 'DRL-WB-%';

  RAISE NOTICE '00020 sanity: active PC=% (will become 8 after Mig21), active STP=% (expect 25), STPs with sequence=% (expect 25), drills=% (expect 25)',
    pc_count, stp_count, seq_count, drill_count;
END $$;

COMMIT;
