-- 00018 PART 2/3 — Insert 24 PROPOSED Pre-Course items
-- Run this AFTER part 1. Idempotent (ON CONFLICT DO UPDATE).

BEGIN;

INSERT INTO lessons (id, course_section, title, description_md, pc_section_id, pc_section_name, pc_section_order, status_v1, display_order, is_test, active) VALUES
  ('PC-015', 'pre_course_fundamentals', 'Wave Reading 101', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.3', 'Safety Domain D1 - OCEAN', 3, 'PROPOSED', 10, FALSE, TRUE),
  ('PC-016', 'pre_course_fundamentals', 'Tide Reading & Timing', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.3', 'Safety Domain D1 - OCEAN', 3, 'PROPOSED', 11, FALSE, TRUE),
  ('PC-017', 'pre_course_fundamentals', 'Wind Reading', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.3', 'Safety Domain D1 - OCEAN', 3, 'PROPOSED', 12, FALSE, TRUE),
  ('PC-018', 'pre_course_fundamentals', 'Bottom Identification', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.3', 'Safety Domain D1 - OCEAN', 3, 'PROPOSED', 13, FALSE, TRUE),
  ('PC-019', 'pre_course_fundamentals', 'Sea Life Hazards', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.3', 'Safety Domain D1 - OCEAN', 3, 'PROPOSED', 15, FALSE, TRUE),
  ('PC-020', 'pre_course_fundamentals', 'Weather & Climate Signals', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.3', 'Safety Domain D1 - OCEAN', 3, 'PROPOSED', 16, FALSE, TRUE),
  ('PC-021', 'pre_course_fundamentals', 'Right of Way', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.4', 'Safety Domain D2 - ETIQUETTE', 4, 'PROPOSED', 18, FALSE, TRUE),
  ('PC-022', 'pre_course_fundamentals', 'No Drop-In / No Snake', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.4', 'Safety Domain D2 - ETIQUETTE', 4, 'PROPOSED', 19, FALSE, TRUE),
  ('PC-023', 'pre_course_fundamentals', 'Paddle Wide & Channel Use', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.4', 'Safety Domain D2 - ETIQUETTE', 4, 'PROPOSED', 20, FALSE, TRUE),
  ('PC-024', 'pre_course_fundamentals', 'Line-Up Positioning & Turn Taking', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.4', 'Safety Domain D2 - ETIQUETTE', 4, 'PROPOSED', 21, FALSE, TRUE),
  ('PC-025', 'pre_course_fundamentals', 'Localism & Respect', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.4', 'Safety Domain D2 - ETIQUETTE', 4, 'PROPOSED', 22, FALSE, TRUE),
  ('PC-026', 'pre_course_fundamentals', 'Communication in the Water', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.4', 'Safety Domain D2 - ETIQUETTE', 4, 'PROPOSED', 23, FALSE, TRUE),
  ('PC-027', 'pre_course_fundamentals', 'Board Fitting to Level', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.5', 'Safety Domain D3 - EQUIPMENT', 5, 'PROPOSED', 25, FALSE, TRUE),
  ('PC-028', 'pre_course_fundamentals', 'Leash - Length, Condition, Attachment', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.5', 'Safety Domain D3 - EQUIPMENT', 5, 'PROPOSED', 26, FALSE, TRUE),
  ('PC-029', 'pre_course_fundamentals', 'Wax, Fins, Traction, Rash Guard', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.5', 'Safety Domain D3 - EQUIPMENT', 5, 'PROPOSED', 27, FALSE, TRUE),
  ('PC-030', 'pre_course_fundamentals', 'Carrying & Transporting the Board', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.5', 'Safety Domain D3 - EQUIPMENT', 5, 'PROPOSED', 28, FALSE, TRUE),
  ('PC-031', 'pre_course_fundamentals', 'Board Damage Awareness', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.5', 'Safety Domain D3 - EQUIPMENT', 5, 'PROPOSED', 29, FALSE, TRUE),
  ('PC-032', 'pre_course_fundamentals', 'Swim Baseline', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.6', 'Safety Domain D4 - PHYSICAL', 6, 'PROPOSED', 31, FALSE, TRUE),
  ('PC-033', 'pre_course_fundamentals', 'Apnea Baseline', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.6', 'Safety Domain D4 - PHYSICAL', 6, 'PROPOSED', 32, FALSE, TRUE),
  ('PC-034', 'pre_course_fundamentals', 'Fitness Baseline', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.6', 'Safety Domain D4 - PHYSICAL', 6, 'PROPOSED', 33, FALSE, TRUE),
  ('PC-035', 'pre_course_fundamentals', 'Common Surf Injuries Awareness', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.6', 'Safety Domain D4 - PHYSICAL', 6, 'PROPOSED', 34, FALSE, TRUE),
  ('PC-036', 'pre_course_fundamentals', 'First Aid Essentials', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.6', 'Safety Domain D4 - PHYSICAL', 6, 'PROPOSED', 35, FALSE, TRUE),
  ('PC-037', 'pre_course_fundamentals', 'Self-Rescue & Energy Conservation', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.6', 'Safety Domain D4 - PHYSICAL', 6, 'PROPOSED', 36, FALSE, TRUE),
  ('PC-038', 'pre_course_fundamentals', 'Nutrition, Hydration, Sun Protection', 'Coming in v1.5 - Marcelo will release the full canonical content as part of the next update.', '0.6', 'Safety Domain D4 - PHYSICAL', 6, 'PROPOSED', 37, FALSE, TRUE)
ON CONFLICT (id) DO UPDATE SET
  pc_section_id    = EXCLUDED.pc_section_id,
  pc_section_name  = EXCLUDED.pc_section_name,
  pc_section_order = EXCLUDED.pc_section_order,
  status_v1        = EXCLUDED.status_v1,
  display_order    = EXCLUDED.display_order;

COMMIT;
