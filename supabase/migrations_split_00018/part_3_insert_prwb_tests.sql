-- 00018 PART 3/3 — Insert 6 PRWB Readiness Tests + sanity check
-- Run this AFTER parts 1 and 2.

BEGIN;

INSERT INTO lessons (id, course_section, step_number, title, description_md, pc_section_id, pc_section_name, pc_section_order, status_v1, display_order, is_test, active) VALUES
  ('PRWB-001', 'pre_course_fundamentals', 101, 'Written Test (25 Questions)', 'Coming in v1.5 - full test specifications will be released by Marcelo.', '0.8', 'Readiness Gate - White Belt Entry Test', 8, 'PROPOSED', 39, TRUE, TRUE),
  ('PRWB-002', 'pre_course_fundamentals', 102, 'Swim Test (200m freestyle)', 'Coming in v1.5 - full test specifications will be released by Marcelo.', '0.8', 'Readiness Gate - White Belt Entry Test', 8, 'PROPOSED', 40, TRUE, TRUE),
  ('PRWB-003', 'pre_course_fundamentals', 103, 'Apnea Test (20s hold)', 'Coming in v1.5 - full test specifications will be released by Marcelo.', '0.8', 'Readiness Gate - White Belt Entry Test', 8, 'PROPOSED', 41, TRUE, TRUE),
  ('PRWB-004', 'pre_course_fundamentals', 104, 'Leash Demo', 'Coming in v1.5 - full test specifications will be released by Marcelo.', '0.8', 'Readiness Gate - White Belt Entry Test', 8, 'PROPOSED', 42, TRUE, TRUE),
  ('PRWB-005', 'pre_course_fundamentals', 105, 'Star-Fall Demo', 'Coming in v1.5 - full test specifications will be released by Marcelo.', '0.8', 'Readiness Gate - White Belt Entry Test', 8, 'PROPOSED', 43, TRUE, TRUE),
  ('PRWB-006', 'pre_course_fundamentals', 106, 'Signal Recognition Demo', 'Coming in v1.5 - full test specifications will be released by Marcelo.', '0.8', 'Readiness Gate - White Belt Entry Test', 8, 'PROPOSED', 44, TRUE, TRUE)
ON CONFLICT (id) DO UPDATE SET
  pc_section_id    = EXCLUDED.pc_section_id,
  pc_section_name  = EXCLUDED.pc_section_name,
  pc_section_order = EXCLUDED.pc_section_order,
  status_v1        = EXCLUDED.status_v1,
  display_order    = EXCLUDED.display_order,
  is_test          = EXCLUDED.is_test;

COMMIT;

-- Verification (run this separately after to confirm)
SELECT
  pc_section_id,
  pc_section_name,
  status_v1,
  COUNT(*) AS items
FROM lessons
WHERE id LIKE 'PC-%' OR id LIKE 'PRWB-%'
GROUP BY pc_section_id, pc_section_name, status_v1
ORDER BY pc_section_id, status_v1;
