-- 00018 PART 1/3 — Schema extension + section/chapter assignments
-- Run this first. Safe to re-run (idempotent).

BEGIN;

-- 1. Add new columns to lessons
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

-- 2. Assign 14 existing PRODUCTIZED Pre-Course items to canonical sections

-- 0.1 TSS Doctrine
UPDATE lessons SET pc_section_id='0.1', pc_section_name='TSS Doctrine', pc_section_order=1, status_v1='PRODUCTIZED', display_order=1 WHERE id='PC-005';
UPDATE lessons SET pc_section_id='0.1', pc_section_name='TSS Doctrine', pc_section_order=1, status_v1='PRODUCTIZED', display_order=2 WHERE id='PC-006';
UPDATE lessons SET pc_section_id='0.1', pc_section_name='TSS Doctrine', pc_section_order=1, status_v1='PRODUCTIZED', display_order=3 WHERE id='PC-007';
UPDATE lessons SET pc_section_id='0.1', pc_section_name='TSS Doctrine', pc_section_order=1, status_v1='PRODUCTIZED', display_order=4 WHERE id='PC-014';
UPDATE lessons SET pc_section_id='0.1', pc_section_name='TSS Doctrine', pc_section_order=1, status_v1='PRODUCTIZED', display_order=5 WHERE id='PC-003';

-- 0.2 Mindset and Learning
UPDATE lessons SET pc_section_id='0.2', pc_section_name='Mindset and Learning', pc_section_order=2, status_v1='PRODUCTIZED', display_order=6 WHERE id='PC-012';
UPDATE lessons SET pc_section_id='0.2', pc_section_name='Mindset and Learning', pc_section_order=2, status_v1='PRODUCTIZED', display_order=7 WHERE id='PC-002';
UPDATE lessons SET pc_section_id='0.2', pc_section_name='Mindset and Learning', pc_section_order=2, status_v1='PRODUCTIZED', display_order=8 WHERE id='PC-004';

-- 0.3 D1 OCEAN (only PRODUCTIZED here)
UPDATE lessons SET pc_section_id='0.3', pc_section_name='Safety Domain D1 - OCEAN', pc_section_order=3, status_v1='PRODUCTIZED', display_order=9 WHERE id='PC-009';
UPDATE lessons SET pc_section_id='0.3', pc_section_name='Safety Domain D1 - OCEAN', pc_section_order=3, status_v1='PRODUCTIZED', display_order=14 WHERE id='PC-010';

-- 0.4 D2 ETIQUETTE
UPDATE lessons SET pc_section_id='0.4', pc_section_name='Safety Domain D2 - ETIQUETTE', pc_section_order=4, status_v1='PRODUCTIZED', display_order=17 WHERE id='PC-011';

-- 0.5 D3 EQUIPMENT
UPDATE lessons SET pc_section_id='0.5', pc_section_name='Safety Domain D3 - EQUIPMENT', pc_section_order=5, status_v1='PRODUCTIZED', display_order=24 WHERE id='PC-008';

-- 0.6 D4 PHYSICAL
UPDATE lessons SET pc_section_id='0.6', pc_section_name='Safety Domain D4 - PHYSICAL', pc_section_order=6, status_v1='PRODUCTIZED', display_order=30 WHERE id='PC-001';

-- 0.7 Entry Block
UPDATE lessons SET pc_section_id='0.7', pc_section_name='Entry Block (Sequence Preview)', pc_section_order=7, status_v1='PRODUCTIZED', display_order=38 WHERE id='PC-013';

-- 3. Assign 24 White Belt STPs to chapters

UPDATE lessons SET wb_chapter_id='WB-CH-1', wb_chapter_name='Preparation & Orientation', wb_chapter_order=1, chapter_step_order=1 WHERE id='STP-001';
UPDATE lessons SET wb_chapter_id='WB-CH-1', wb_chapter_name='Preparation & Orientation', wb_chapter_order=1, chapter_step_order=2 WHERE id='STP-002';

UPDATE lessons SET wb_chapter_id='WB-CH-2', wb_chapter_name='Preparation & Positioning', wb_chapter_order=2, chapter_step_order=1 WHERE id='STP-003';
UPDATE lessons SET wb_chapter_id='WB-CH-2', wb_chapter_name='Preparation & Positioning', wb_chapter_order=2, chapter_step_order=2 WHERE id='STP-004';
UPDATE lessons SET wb_chapter_id='WB-CH-2', wb_chapter_name='Preparation & Positioning', wb_chapter_order=2, chapter_step_order=3 WHERE id='STP-005';
UPDATE lessons SET wb_chapter_id='WB-CH-2', wb_chapter_name='Preparation & Positioning', wb_chapter_order=2, chapter_step_order=4 WHERE id='STP-006';
UPDATE lessons SET wb_chapter_id='WB-CH-2', wb_chapter_name='Preparation & Positioning', wb_chapter_order=2, chapter_step_order=5 WHERE id='STP-007';
UPDATE lessons SET wb_chapter_id='WB-CH-2', wb_chapter_name='Preparation & Positioning', wb_chapter_order=2, chapter_step_order=6 WHERE id='STP-008';
UPDATE lessons SET wb_chapter_id='WB-CH-2', wb_chapter_name='Preparation & Positioning', wb_chapter_order=2, chapter_step_order=7 WHERE id='STP-009';

UPDATE lessons SET wb_chapter_id='WB-CH-3', wb_chapter_name='Wave Entry', wb_chapter_order=3, chapter_step_order=1 WHERE id='STP-010';
UPDATE lessons SET wb_chapter_id='WB-CH-3', wb_chapter_name='Wave Entry', wb_chapter_order=3, chapter_step_order=2 WHERE id='STP-011';
UPDATE lessons SET wb_chapter_id='WB-CH-3', wb_chapter_name='Wave Entry', wb_chapter_order=3, chapter_step_order=3 WHERE id='STP-012';
UPDATE lessons SET wb_chapter_id='WB-CH-3', wb_chapter_name='Wave Entry', wb_chapter_order=3, chapter_step_order=4 WHERE id='STP-013';
UPDATE lessons SET wb_chapter_id='WB-CH-3', wb_chapter_name='Wave Entry', wb_chapter_order=3, chapter_step_order=5 WHERE id='STP-014';
UPDATE lessons SET wb_chapter_id='WB-CH-3', wb_chapter_name='Wave Entry', wb_chapter_order=3, chapter_step_order=6 WHERE id='STP-023';
UPDATE lessons SET wb_chapter_id='WB-CH-3', wb_chapter_name='Wave Entry', wb_chapter_order=3, chapter_step_order=7 WHERE id='STP-024';
UPDATE lessons SET wb_chapter_id='WB-CH-3', wb_chapter_name='Wave Entry', wb_chapter_order=3, chapter_step_order=8 WHERE id='STP-025';

UPDATE lessons SET wb_chapter_id='WB-CH-4', wb_chapter_name='Pop-Up & Connection', wb_chapter_order=4, chapter_step_order=1 WHERE id='STP-016';
UPDATE lessons SET wb_chapter_id='WB-CH-4', wb_chapter_name='Pop-Up & Connection', wb_chapter_order=4, chapter_step_order=2 WHERE id='STP-017';

UPDATE lessons SET wb_chapter_id='WB-CH-5', wb_chapter_name='Posture & First Maneuvers', wb_chapter_order=5, chapter_step_order=1 WHERE id='STP-018';
UPDATE lessons SET wb_chapter_id='WB-CH-5', wb_chapter_name='Posture & First Maneuvers', wb_chapter_order=5, chapter_step_order=2 WHERE id='STP-019';
UPDATE lessons SET wb_chapter_id='WB-CH-5', wb_chapter_name='Posture & First Maneuvers', wb_chapter_order=5, chapter_step_order=3 WHERE id='STP-020';
UPDATE lessons SET wb_chapter_id='WB-CH-5', wb_chapter_name='Posture & First Maneuvers', wb_chapter_order=5, chapter_step_order=4 WHERE id='STP-021';
UPDATE lessons SET wb_chapter_id='WB-CH-5', wb_chapter_name='Posture & First Maneuvers', wb_chapter_order=5, chapter_step_order=5 WHERE id='STP-022';

UPDATE lessons SET status_v1='PRODUCTIZED'
  WHERE course_section='white_belt' AND status_v1 IS NULL AND active=TRUE
    AND id IN ('STP-001','STP-002','STP-003','STP-004','STP-005','STP-006',
               'STP-007','STP-008','STP-009','STP-010','STP-011','STP-012',
               'STP-013','STP-014','STP-016','STP-017','STP-018','STP-019',
               'STP-020','STP-021','STP-022','STP-023','STP-024','STP-025');

-- 4. Retire STP-015
UPDATE lessons SET active=FALSE WHERE id='STP-015';

COMMIT;
