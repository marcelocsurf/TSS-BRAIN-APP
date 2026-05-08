-- 00022 — Belt values cleanup
--
-- The pre_course_values seed (Migration 00015) included all 7 TSS belt
-- values (Conciencia, Humildad, Proceso, Compromiso, Responsabilidad,
-- Gratitud, Impacto). Per canon v1, only 2 belong to the White Belt
-- journey:
--   - VAL-001 Conciencia (Pre-Course Module 0 value)
--   - VAL-002 Humildad   (White Belt Module 2 value)
-- The other 5 are values of higher belts (Yellow → Black) and must
-- only become visible when those belts are unlocked.

BEGIN;

UPDATE lessons SET active = FALSE
  WHERE id IN ('VAL-003','VAL-004','VAL-005','VAL-006','VAL-007');

-- Conciencia: Pre-Course belt value, give it proper section labels
UPDATE lessons SET
  pc_section_id = 'M0-VAL',
  pc_section_name = 'Pre-Course Belt Value',
  pc_section_order = 9,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'VAL-001';

-- Humildad: belongs to White Belt journey. Move out of pre_course_values
-- (which is a legacy section). Place in wb_onboarding so it renders
-- alongside the WB Onboarding module for visibility, with its own
-- section label.
UPDATE lessons SET
  course_section = 'wb_onboarding',
  pc_section_id = 'M1-VAL',
  pc_section_name = 'White Belt Value',
  pc_section_order = 2,
  status_v1 = 'PRODUCTIZED',
  display_order = 399
WHERE id = 'VAL-002';

COMMIT;
