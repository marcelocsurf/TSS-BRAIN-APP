-- M57 — Quizzes for YB Belt Value (Module 4), Complete Ride (Module 7),
-- and Exit Test (Module 8).
--
-- Source: TSS_UNIFIED_STUDENT_COURSE_v1.md PARTS VI, IX, X.
--
-- The 8 STP quizzes from M52 stay as-is — they already test the same
-- canonical content (V1-V4 system, pocket awareness, FP1/FP2 doctrine,
-- Cobra+Line=TIME, External×Internal, shoulder exit decision).
--
-- Idempotent: deletes existing quizzes for these 3 lessons first.

DELETE FROM lesson_quizzes WHERE lesson_id IN ('YB-ONB-01','YB-MOD-7','YB-MOD-8');

-- ─── YB-ONB-01 · Belt Value (Proceso / Resiliencia) ───
INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES
('YB-ONB-01', 'How does the YB belt value reframe failure?',
 '[{"text":"Failure means you''re not cut out for surfing","correct":false},{"text":"Failure is a natural part of the process — accept it, return to the wave, keep showing up","correct":true},{"text":"Failure should be avoided through perfect technique","correct":false}]'::jsonb, 1),
('YB-ONB-01', 'What does the YB belt value say about endurance and enjoyment?',
 '[{"text":"They are opposites — choose one","correct":false},{"text":"Enjoyment comes after years of pure endurance","correct":false},{"text":"They are the same thing when seen correctly — play with the waves","correct":true}]'::jsonb, 2),
('YB-ONB-01', 'What''s the doctrinal shift from WB to YB?',
 '[{"text":"From humility (open to learn) to resilience (accept the fall, keep showing up)","correct":true},{"text":"From safety to performance","correct":false},{"text":"From land to water","correct":false}]'::jsonb, 3);

-- ─── YB-MOD-7 · The Complete Ride ───
INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES
('YB-MOD-7', 'How many stages does The Complete Ride chain have?',
 '[{"text":"7","correct":false},{"text":"11","correct":true},{"text":"15","correct":false}]'::jsonb, 1),
('YB-MOD-7', 'Which stage is the doctrinal heart of Yellow Belt?',
 '[{"text":"Stage 1 — Venue Analysis","correct":false},{"text":"Stage 7 — Cobra + Pick Line (generate TIME)","correct":true},{"text":"Stage 11 — Feedback","correct":false}]'::jsonb, 2),
('YB-MOD-7', 'What''s the graduation criterion for Module 7?',
 '[{"text":"Execute the chain perfectly on every wave","correct":false},{"text":"Execute the chain consistently across ≥3 waves in ≥2 sessions — structure intact, errors expected","correct":true},{"text":"Memorize all 11 stages by name","correct":false}]'::jsonb, 3);

-- ─── YB-MOD-8 · YB Exit Test ───
INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES
('YB-MOD-8', 'What is Yellow Belt awarded for?',
 '[{"text":"Perfection","correct":false},{"text":"Consistent attempts with structural knowledge","correct":true},{"text":"Number of waves caught","correct":false}]'::jsonb, 1),
('YB-MOD-8', 'How many categories and criteria does the YB Exit Test contain?',
 '[{"text":"3 categories · 9 criteria","correct":false},{"text":"5 categories · 13 criteria","correct":true},{"text":"7 categories · 20 criteria","correct":false}]'::jsonb, 2),
('YB-MOD-8', 'Which 3 errors disqualify you from YB graduation when consistently present?',
 '[{"text":"Wrong board · wrong wax · wrong stance","correct":false},{"text":"ERR-YB-A3 (not choosing the line) · ERR-YB-A4 (going straight to the flat) · ERR-YB-A1 (skipping steps)","correct":true},{"text":"Missing the warm-up · skipping the bisagra · forgetting etiquette","correct":false}]'::jsonb, 3);
