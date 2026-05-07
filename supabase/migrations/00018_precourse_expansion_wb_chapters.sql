-- 00018 — Pre-Course Expansion + White Belt Chapters
-- Source: WB_PORTAL_SPEC_FOR_CODE.md (Marcelo, 2026-05-07)
-- Sections C (Pre-Course 8 sub-sections, 44 items) + D (WB 5 chapters)
-- Constraint: NO invention of pedagogical content. PROPOSED items show
--             only canonical title + 'Coming in v1.5' placeholder.
-- Constraint: STP-015 is canonically retired. Mark inactive.
-- Idempotent: safe to re-run (uses ON CONFLICT + IF NOT EXISTS).

BEGIN;

-- ============================================
-- 1. EXTEND lessons table with structural columns
-- ============================================

ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS pc_section_id     TEXT,
  ADD COLUMN IF NOT EXISTS pc_section_name   TEXT,
  ADD COLUMN IF NOT EXISTS pc_section_order  INTEGER,
  ADD COLUMN IF NOT EXISTS status_v1         TEXT
    CHECK (status_v1 IS NULL OR status_v1 IN ('PRODUCTIZED','PROPOSED')),
  ADD COLUMN IF NOT EXISTS is_test           BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS wb_chapter_id     TEXT,
  ADD COLUMN IF NOT EXISTS wb_chapter_name   TEXT,
  ADD COLUMN IF NOT EXISTS wb_chapter_order  INTEGER,
  ADD COLUMN IF NOT EXISTS chapter_step_order INTEGER;

CREATE INDEX IF NOT EXISTS idx_lessons_pc_section ON lessons(pc_section_id, pc_section_order);
CREATE INDEX IF NOT EXISTS idx_lessons_wb_chapter ON lessons(wb_chapter_id, wb_chapter_order);

-- ============================================
-- 2. ASSIGN existing 14 PRODUCTIZED Pre-Course items to canonical sections
-- ============================================

-- Section 0.1 — TSS Doctrine (5 items, all PRODUCTIZED)
UPDATE lessons SET pc_section_id='0.1', pc_section_name='TSS Doctrine',
  pc_section_order=1, status_v1='PRODUCTIZED', display_order=1 WHERE id='PC-005';
UPDATE lessons SET pc_section_id='0.1', pc_section_name='TSS Doctrine',
  pc_section_order=1, status_v1='PRODUCTIZED', display_order=2 WHERE id='PC-006';
UPDATE lessons SET pc_section_id='0.1', pc_section_name='TSS Doctrine',
  pc_section_order=1, status_v1='PRODUCTIZED', display_order=3 WHERE id='PC-007';
UPDATE lessons SET pc_section_id='0.1', pc_section_name='TSS Doctrine',
  pc_section_order=1, status_v1='PRODUCTIZED', display_order=4 WHERE id='PC-014';
UPDATE lessons SET pc_section_id='0.1', pc_section_name='TSS Doctrine',
  pc_section_order=1, status_v1='PRODUCTIZED', display_order=5 WHERE id='PC-003';

-- Section 0.2 — Mindset and Learning (3 items, all PRODUCTIZED)
UPDATE lessons SET pc_section_id='0.2', pc_section_name='Mindset and Learning',
  pc_section_order=2, status_v1='PRODUCTIZED', display_order=6 WHERE id='PC-012';
UPDATE lessons SET pc_section_id='0.2', pc_section_name='Mindset and Learning',
  pc_section_order=2, status_v1='PRODUCTIZED', display_order=7 WHERE id='PC-002';
UPDATE lessons SET pc_section_id='0.2', pc_section_name='Mindset and Learning',
  pc_section_order=2, status_v1='PRODUCTIZED', display_order=8 WHERE id='PC-004';

-- Section 0.3 — Safety Domain D1 OCEAN (8 items, 2 PRODUCTIZED + 6 PROPOSED)
UPDATE lessons SET pc_section_id='0.3', pc_section_name='Safety Domain D1 — OCEAN',
  pc_section_order=3, status_v1='PRODUCTIZED', display_order=9 WHERE id='PC-009';
UPDATE lessons SET pc_section_id='0.3', pc_section_name='Safety Domain D1 — OCEAN',
  pc_section_order=3, status_v1='PRODUCTIZED', display_order=14 WHERE id='PC-010';

-- Section 0.4 — Safety Domain D2 ETIQUETTE (7 items, 1 PRODUCTIZED + 6 PROPOSED)
UPDATE lessons SET pc_section_id='0.4', pc_section_name='Safety Domain D2 — ETIQUETTE',
  pc_section_order=4, status_v1='PRODUCTIZED', display_order=17 WHERE id='PC-011';

-- Section 0.5 — Safety Domain D3 EQUIPMENT (6 items, 1 PRODUCTIZED + 5 PROPOSED)
UPDATE lessons SET pc_section_id='0.5', pc_section_name='Safety Domain D3 — EQUIPMENT',
  pc_section_order=5, status_v1='PRODUCTIZED', display_order=24 WHERE id='PC-008';

-- Section 0.6 — Safety Domain D4 PHYSICAL (8 items, 1 PRODUCTIZED + 7 PROPOSED)
UPDATE lessons SET pc_section_id='0.6', pc_section_name='Safety Domain D4 — PHYSICAL',
  pc_section_order=6, status_v1='PRODUCTIZED', display_order=30 WHERE id='PC-001';

-- Section 0.7 — Entry Block (1 item, PRODUCTIZED)
UPDATE lessons SET pc_section_id='0.7', pc_section_name='Entry Block (Sequence Preview)',
  pc_section_order=7, status_v1='PRODUCTIZED', display_order=38 WHERE id='PC-013';

-- ============================================
-- 3. INSERT 24 PROPOSED Pre-Course items + 6 PRWB Readiness tests
--    All show 'Coming in v1.5' placeholder description per spec rule
-- ============================================

-- Reusable placeholder string
-- '*Coming in v1.5 — Marcelo will release the full canonical content
--  (description, key concepts, coach cue, common errors, drill, success indicators)
--  as part of the next update.*'

INSERT INTO lessons (id, course_section, title, description_md,
  pc_section_id, pc_section_name, pc_section_order, status_v1,
  display_order, is_test, active)
VALUES
  -- 0.3 D1 OCEAN PROPOSED (6)
  ('PC-015', 'pre_course_fundamentals', 'Wave Reading 101',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.3', 'Safety Domain D1 — OCEAN', 3, 'PROPOSED', 10, FALSE, TRUE),
  ('PC-016', 'pre_course_fundamentals', 'Tide Reading & Timing',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.3', 'Safety Domain D1 — OCEAN', 3, 'PROPOSED', 11, FALSE, TRUE),
  ('PC-017', 'pre_course_fundamentals', 'Wind Reading',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.3', 'Safety Domain D1 — OCEAN', 3, 'PROPOSED', 12, FALSE, TRUE),
  ('PC-018', 'pre_course_fundamentals', 'Bottom Identification',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.3', 'Safety Domain D1 — OCEAN', 3, 'PROPOSED', 13, FALSE, TRUE),
  ('PC-019', 'pre_course_fundamentals', 'Sea Life Hazards',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.3', 'Safety Domain D1 — OCEAN', 3, 'PROPOSED', 15, FALSE, TRUE),
  ('PC-020', 'pre_course_fundamentals', 'Weather & Climate Signals',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.3', 'Safety Domain D1 — OCEAN', 3, 'PROPOSED', 16, FALSE, TRUE),

  -- 0.4 D2 ETIQUETTE PROPOSED (6)
  ('PC-021', 'pre_course_fundamentals', 'Right of Way',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.4', 'Safety Domain D2 — ETIQUETTE', 4, 'PROPOSED', 18, FALSE, TRUE),
  ('PC-022', 'pre_course_fundamentals', 'No Drop-In / No Snake',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.4', 'Safety Domain D2 — ETIQUETTE', 4, 'PROPOSED', 19, FALSE, TRUE),
  ('PC-023', 'pre_course_fundamentals', 'Paddle Wide & Channel Use',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.4', 'Safety Domain D2 — ETIQUETTE', 4, 'PROPOSED', 20, FALSE, TRUE),
  ('PC-024', 'pre_course_fundamentals', 'Line-Up Positioning & Turn Taking',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.4', 'Safety Domain D2 — ETIQUETTE', 4, 'PROPOSED', 21, FALSE, TRUE),
  ('PC-025', 'pre_course_fundamentals', 'Localism & Respect',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.4', 'Safety Domain D2 — ETIQUETTE', 4, 'PROPOSED', 22, FALSE, TRUE),
  ('PC-026', 'pre_course_fundamentals', 'Communication in the Water',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.4', 'Safety Domain D2 — ETIQUETTE', 4, 'PROPOSED', 23, FALSE, TRUE),

  -- 0.5 D3 EQUIPMENT PROPOSED (5)
  ('PC-027', 'pre_course_fundamentals', 'Board Fitting to Level',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.5', 'Safety Domain D3 — EQUIPMENT', 5, 'PROPOSED', 25, FALSE, TRUE),
  ('PC-028', 'pre_course_fundamentals', 'Leash — Length, Condition, Attachment',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.5', 'Safety Domain D3 — EQUIPMENT', 5, 'PROPOSED', 26, FALSE, TRUE),
  ('PC-029', 'pre_course_fundamentals', 'Wax, Fins, Traction, Rash Guard',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.5', 'Safety Domain D3 — EQUIPMENT', 5, 'PROPOSED', 27, FALSE, TRUE),
  ('PC-030', 'pre_course_fundamentals', 'Carrying & Transporting the Board',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.5', 'Safety Domain D3 — EQUIPMENT', 5, 'PROPOSED', 28, FALSE, TRUE),
  ('PC-031', 'pre_course_fundamentals', 'Board Damage Awareness',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.5', 'Safety Domain D3 — EQUIPMENT', 5, 'PROPOSED', 29, FALSE, TRUE),

  -- 0.6 D4 PHYSICAL PROPOSED (7)
  ('PC-032', 'pre_course_fundamentals', 'Swim Baseline',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.6', 'Safety Domain D4 — PHYSICAL', 6, 'PROPOSED', 31, FALSE, TRUE),
  ('PC-033', 'pre_course_fundamentals', 'Apnea Baseline',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.6', 'Safety Domain D4 — PHYSICAL', 6, 'PROPOSED', 32, FALSE, TRUE),
  ('PC-034', 'pre_course_fundamentals', 'Fitness Baseline',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.6', 'Safety Domain D4 — PHYSICAL', 6, 'PROPOSED', 33, FALSE, TRUE),
  ('PC-035', 'pre_course_fundamentals', 'Common Surf Injuries Awareness',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.6', 'Safety Domain D4 — PHYSICAL', 6, 'PROPOSED', 34, FALSE, TRUE),
  ('PC-036', 'pre_course_fundamentals', 'First Aid Essentials',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.6', 'Safety Domain D4 — PHYSICAL', 6, 'PROPOSED', 35, FALSE, TRUE),
  ('PC-037', 'pre_course_fundamentals', 'Self-Rescue & Energy Conservation',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.6', 'Safety Domain D4 — PHYSICAL', 6, 'PROPOSED', 36, FALSE, TRUE),
  ('PC-038', 'pre_course_fundamentals', 'Nutrition, Hydration, Sun Protection',
   '*Coming in v1.5 — Marcelo will release the full canonical content (description, key concepts, coach cue, common errors, drill, success indicators) as part of the next update.*',
   '0.6', 'Safety Domain D4 — PHYSICAL', 6, 'PROPOSED', 37, FALSE, TRUE),

  -- 0.8 READINESS GATE TESTS (6, all PROPOSED, is_test=TRUE)
  ('PRWB-001', 'pre_course_fundamentals', 'Written Test (25 Questions)',
   '*Coming in v1.5 — full test specifications (criteria, evaluation rubric, accepted formats, retake policy) will be released by Marcelo.*',
   '0.8', 'Readiness Gate — White Belt Entry Test', 8, 'PROPOSED', 39, TRUE, TRUE),
  ('PRWB-002', 'pre_course_fundamentals', 'Swim Test (200m freestyle)',
   '*Coming in v1.5 — full test specifications (criteria, evaluation rubric, accepted formats, retake policy) will be released by Marcelo.*',
   '0.8', 'Readiness Gate — White Belt Entry Test', 8, 'PROPOSED', 40, TRUE, TRUE),
  ('PRWB-003', 'pre_course_fundamentals', 'Apnea Test (20s hold)',
   '*Coming in v1.5 — full test specifications (criteria, evaluation rubric, accepted formats, retake policy) will be released by Marcelo.*',
   '0.8', 'Readiness Gate — White Belt Entry Test', 8, 'PROPOSED', 41, TRUE, TRUE),
  ('PRWB-004', 'pre_course_fundamentals', 'Leash Demo',
   '*Coming in v1.5 — full test specifications (criteria, evaluation rubric, accepted formats, retake policy) will be released by Marcelo.*',
   '0.8', 'Readiness Gate — White Belt Entry Test', 8, 'PROPOSED', 42, TRUE, TRUE),
  ('PRWB-005', 'pre_course_fundamentals', 'Star-Fall Demo',
   '*Coming in v1.5 — full test specifications (criteria, evaluation rubric, accepted formats, retake policy) will be released by Marcelo.*',
   '0.8', 'Readiness Gate — White Belt Entry Test', 8, 'PROPOSED', 43, TRUE, TRUE),
  ('PRWB-006', 'pre_course_fundamentals', 'Signal Recognition Demo',
   '*Coming in v1.5 — full test specifications (criteria, evaluation rubric, accepted formats, retake policy) will be released by Marcelo.*',
   '0.8', 'Readiness Gate — White Belt Entry Test', 8, 'PROPOSED', 44, TRUE, TRUE)
ON CONFLICT (id) DO UPDATE SET
  pc_section_id    = EXCLUDED.pc_section_id,
  pc_section_name  = EXCLUDED.pc_section_name,
  pc_section_order = EXCLUDED.pc_section_order,
  status_v1        = EXCLUDED.status_v1,
  display_order    = EXCLUDED.display_order,
  is_test          = EXCLUDED.is_test;

-- ============================================
-- 4. ASSIGN 24 White Belt STPs to canonical chapters
-- ============================================

-- Chapter 1: Preparation & Orientation (Block 0-1) — 2 steps
UPDATE lessons SET wb_chapter_id='WB-CH-1',
  wb_chapter_name='Preparation & Orientation', wb_chapter_order=1,
  chapter_step_order=1 WHERE id='STP-001';
UPDATE lessons SET wb_chapter_id='WB-CH-1',
  wb_chapter_name='Preparation & Orientation', wb_chapter_order=1,
  chapter_step_order=2 WHERE id='STP-002';

-- Chapter 2: Preparation & Positioning (Block 1) — 7 steps
UPDATE lessons SET wb_chapter_id='WB-CH-2',
  wb_chapter_name='Preparation & Positioning', wb_chapter_order=2,
  chapter_step_order=1 WHERE id='STP-003';
UPDATE lessons SET wb_chapter_id='WB-CH-2',
  wb_chapter_name='Preparation & Positioning', wb_chapter_order=2,
  chapter_step_order=2 WHERE id='STP-004';
UPDATE lessons SET wb_chapter_id='WB-CH-2',
  wb_chapter_name='Preparation & Positioning', wb_chapter_order=2,
  chapter_step_order=3 WHERE id='STP-005';
UPDATE lessons SET wb_chapter_id='WB-CH-2',
  wb_chapter_name='Preparation & Positioning', wb_chapter_order=2,
  chapter_step_order=4 WHERE id='STP-006';
UPDATE lessons SET wb_chapter_id='WB-CH-2',
  wb_chapter_name='Preparation & Positioning', wb_chapter_order=2,
  chapter_step_order=5 WHERE id='STP-007';
UPDATE lessons SET wb_chapter_id='WB-CH-2',
  wb_chapter_name='Preparation & Positioning', wb_chapter_order=2,
  chapter_step_order=6 WHERE id='STP-008';
UPDATE lessons SET wb_chapter_id='WB-CH-2',
  wb_chapter_name='Preparation & Positioning', wb_chapter_order=2,
  chapter_step_order=7 WHERE id='STP-009';

-- Chapter 3: Wave Entry (Block 2) — 8 steps
UPDATE lessons SET wb_chapter_id='WB-CH-3',
  wb_chapter_name='Wave Entry', wb_chapter_order=3,
  chapter_step_order=1 WHERE id='STP-010';
UPDATE lessons SET wb_chapter_id='WB-CH-3',
  wb_chapter_name='Wave Entry', wb_chapter_order=3,
  chapter_step_order=2 WHERE id='STP-011';
UPDATE lessons SET wb_chapter_id='WB-CH-3',
  wb_chapter_name='Wave Entry', wb_chapter_order=3,
  chapter_step_order=3 WHERE id='STP-012';
UPDATE lessons SET wb_chapter_id='WB-CH-3',
  wb_chapter_name='Wave Entry', wb_chapter_order=3,
  chapter_step_order=4 WHERE id='STP-013';
UPDATE lessons SET wb_chapter_id='WB-CH-3',
  wb_chapter_name='Wave Entry', wb_chapter_order=3,
  chapter_step_order=5 WHERE id='STP-014';
UPDATE lessons SET wb_chapter_id='WB-CH-3',
  wb_chapter_name='Wave Entry', wb_chapter_order=3,
  chapter_step_order=6 WHERE id='STP-023';
UPDATE lessons SET wb_chapter_id='WB-CH-3',
  wb_chapter_name='Wave Entry', wb_chapter_order=3,
  chapter_step_order=7 WHERE id='STP-024';
UPDATE lessons SET wb_chapter_id='WB-CH-3',
  wb_chapter_name='Wave Entry', wb_chapter_order=3,
  chapter_step_order=8 WHERE id='STP-025';

-- Chapter 4: Pop-Up & Connection (Block 3) — 2 steps
UPDATE lessons SET wb_chapter_id='WB-CH-4',
  wb_chapter_name='Pop-Up & Connection', wb_chapter_order=4,
  chapter_step_order=1 WHERE id='STP-016';
UPDATE lessons SET wb_chapter_id='WB-CH-4',
  wb_chapter_name='Pop-Up & Connection', wb_chapter_order=4,
  chapter_step_order=2 WHERE id='STP-017';

-- Chapter 5: Posture & First Maneuvers (Block 4-5) — 5 steps
UPDATE lessons SET wb_chapter_id='WB-CH-5',
  wb_chapter_name='Posture & First Maneuvers', wb_chapter_order=5,
  chapter_step_order=1 WHERE id='STP-018';
UPDATE lessons SET wb_chapter_id='WB-CH-5',
  wb_chapter_name='Posture & First Maneuvers', wb_chapter_order=5,
  chapter_step_order=2 WHERE id='STP-019';
UPDATE lessons SET wb_chapter_id='WB-CH-5',
  wb_chapter_name='Posture & First Maneuvers', wb_chapter_order=5,
  chapter_step_order=3 WHERE id='STP-020';
UPDATE lessons SET wb_chapter_id='WB-CH-5',
  wb_chapter_name='Posture & First Maneuvers', wb_chapter_order=5,
  chapter_step_order=4 WHERE id='STP-021';
UPDATE lessons SET wb_chapter_id='WB-CH-5',
  wb_chapter_name='Posture & First Maneuvers', wb_chapter_order=5,
  chapter_step_order=5 WHERE id='STP-022';

-- All productized white belt STPs are PRODUCTIZED status
UPDATE lessons SET status_v1='PRODUCTIZED'
  WHERE course_section='white_belt' AND status_v1 IS NULL AND active=TRUE
    AND id IN ('STP-001','STP-002','STP-003','STP-004','STP-005','STP-006',
               'STP-007','STP-008','STP-009','STP-010','STP-011','STP-012',
               'STP-013','STP-014','STP-016','STP-017','STP-018','STP-019',
               'STP-020','STP-021','STP-022','STP-023','STP-024','STP-025');

-- ============================================
-- 5. RETIRE STP-015 — canonically absorbed into STP-013 + STP-016
-- ============================================

UPDATE lessons SET active=FALSE WHERE id='STP-015';

-- ============================================
-- 6. SANITY CHECKS (informational; will warn in logs but not fail)
-- ============================================

DO $$
DECLARE
  pc_count INTEGER;
  prwb_count INTEGER;
  wb_count INTEGER;
  pc_unsectioned INTEGER;
BEGIN
  SELECT COUNT(*) INTO pc_count FROM lessons
    WHERE id LIKE 'PC-%' AND active=TRUE;
  SELECT COUNT(*) INTO prwb_count FROM lessons
    WHERE id LIKE 'PRWB-%' AND active=TRUE;
  SELECT COUNT(*) INTO wb_count FROM lessons
    WHERE course_section='white_belt' AND active=TRUE
      AND wb_chapter_id IS NOT NULL;
  SELECT COUNT(*) INTO pc_unsectioned FROM lessons
    WHERE id LIKE 'PC-%' AND active=TRUE AND pc_section_id IS NULL;

  RAISE NOTICE '00018 sanity: PC=% (expect 38), PRWB=% (expect 6), WB-with-chapter=% (expect 24), unsectioned PC=% (expect 0)',
    pc_count, prwb_count, wb_count, pc_unsectioned;
END $$;

COMMIT;
