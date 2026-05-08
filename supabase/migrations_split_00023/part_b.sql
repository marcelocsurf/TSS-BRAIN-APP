-- 00023 PART 2/5 — Onboarding (ONB-01..06)
-- Source: WB_QUIZZES_STUDENT_v1_EN.json (Marcelo, 2026-05-08)
-- Replaces existing lesson_quizzes for these items with content-focused quizzes.

BEGIN;

DELETE FROM lesson_quizzes WHERE lesson_id IN ('ONB-01', 'ONB-02', 'ONB-03', 'ONB-04', 'ONB-05', 'ONB-06');

INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'ONB-01',
  'In a Regular stance, which foot is forward?',
  '[{"text": "Left foot forward, right foot back", "correct": true}, {"text": "Right foot forward, left foot back", "correct": false}, {"text": "Both feet equal", "correct": false}, {"text": "Depends on the wave", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'ONB-01',
  'In the "push test" to identify your stance, which foot do you step forward to catch yourself?',
  '[{"text": "That is your back foot for surfing", "correct": true}, {"text": "That is your front foot for surfing", "correct": false}, {"text": "It doesn''t matter", "correct": false}, {"text": "Always your right foot", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'ONB-01',
  'Once you identify your stance, can you change it later?',
  '[{"text": "No — your stance is determined by your body and is fixed for life", "correct": true}, {"text": "Yes — every session you can switch", "correct": false}, {"text": "Only for advanced surfers", "correct": false}, {"text": "It changes with each new board", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'ONB-02',
  'What is the fundamental triangle in surfing?',
  '[{"text": "Wave + Surfer + Ocean", "correct": true}, {"text": "Board + Surfer + Beach", "correct": false}, {"text": "Wax + Wave + Wind", "correct": false}, {"text": "Coach + Student + Board", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'ONB-02',
  'According to TSS, what is the surfer''s relationship to the wave?',
  '[{"text": "Reads it, respects it, responds to it — dialogue, not domination", "correct": true}, {"text": "Conquers it", "correct": false}, {"text": "Avoids it", "correct": false}, {"text": "Ignores it", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'ONB-02',
  'Surfing is described as:',
  '[{"text": "Both a sport and a relationship with the ocean", "correct": true}, {"text": "Only a sport", "correct": false}, {"text": "Only a hobby", "correct": false}, {"text": "Only a competition", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'ONB-03',
  'Where did surfing originate?',
  '[{"text": "Polynesia, with deep cultural roots", "correct": true}, {"text": "California", "correct": false}, {"text": "Australia", "correct": false}, {"text": "Brazil", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'ONB-03',
  'What is "He''e nalu"?',
  '[{"text": "The original Hawaiian name for surfing — \"wave sliding\"", "correct": true}, {"text": "A type of wave", "correct": false}, {"text": "A famous surfer", "correct": false}, {"text": "A surfboard brand", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'ONB-03',
  'Who is considered the godfather of modern surfing?',
  '[{"text": "Duke Kahanamoku", "correct": true}, {"text": "Tom Blake", "correct": false}, {"text": "Kelly Slater", "correct": false}, {"text": "Marcelo Castellanos", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'ONB-03',
  'When did surfing officially debut as an Olympic sport?',
  '[{"text": "Tokyo 2020", "correct": true}, {"text": "Athens 2004", "correct": false}, {"text": "Sydney 2000", "correct": false}, {"text": "Paris 2024", "correct": false}]'::jsonb,
  4
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'ONB-04',
  'What are the 4 pillars of TSS development?',
  '[{"text": "Physical, Mental, Technical, Social-Ethical", "correct": true}, {"text": "Speed, Strength, Stamina, Skill", "correct": false}, {"text": "Wave, Wind, Water, Wax", "correct": false}, {"text": "Beach, Board, Body, Brain", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'ONB-04',
  'Which pillar covers "lineup etiquette, respect for locals, communication"?',
  '[{"text": "Social-Ethical", "correct": true}, {"text": "Physical", "correct": false}, {"text": "Mental", "correct": false}, {"text": "Technical", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'ONB-04',
  'What does "interdependence of pillars" mean?',
  '[{"text": "You can''t have elite technique with paralyzing fear — all 4 must work together", "correct": true}, {"text": "Each pillar is independent and separate", "correct": false}, {"text": "You only need to develop one pillar", "correct": false}, {"text": "They are ranked from most to least important", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'ONB-05',
  'What are the rails of a surfboard?',
  '[{"text": "The side edges of the board — what enters water in turns", "correct": true}, {"text": "The top of the board where you stand", "correct": false}, {"text": "The fins underneath", "correct": false}, {"text": "The cord to your foot", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'ONB-05',
  'What is the "rocker" of a surfboard?',
  '[{"text": "The curve from nose to tail — more rocker = more maneuverable, less = more speed", "correct": true}, {"text": "The texture of the deck", "correct": false}, {"text": "The fin setup", "correct": false}, {"text": "The leash attachment point", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'ONB-05',
  'What type of board does the White Belt always use?',
  '[{"text": "Softboard — foam, soft, safe, high flotation", "correct": true}, {"text": "Shortboard", "correct": false}, {"text": "Fish", "correct": false}, {"text": "Longboard", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'ONB-05',
  'Why is the leash never optional?',
  '[{"text": "It keeps the board attached to you so it doesn''t hit other surfers", "correct": true}, {"text": "It looks cool", "correct": false}, {"text": "It makes you faster", "correct": false}, {"text": "Only required by lifeguards", "correct": false}]'::jsonb,
  4
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'ONB-06',
  'What is the VCA-6 framework?',
  '[{"text": "The 6 elements you evaluate before paddling out", "correct": true}, {"text": "A type of wave", "correct": false}, {"text": "A board brand", "correct": false}, {"text": "A surfing competition", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'ONB-06',
  'Which is NOT one of the VCA-6 elements?',
  '[{"text": "Your favorite color", "correct": true}, {"text": "Wave direction", "correct": false}, {"text": "Hazards", "correct": false}, {"text": "Tide and wind", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'ONB-06',
  'Which is a VALID TSS session goal?',
  '[{"text": "Catch 3 clean foam waves and execute the pop-up sequence on each", "correct": true}, {"text": "Have fun", "correct": false}, {"text": "Get better at surfing", "correct": false}, {"text": "Ride as many waves as possible", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'ONB-06',
  'Why is "have fun" not a valid TSS goal?',
  '[{"text": "It is too vague — produces zero measurable progress", "correct": true}, {"text": "Fun is forbidden", "correct": false}, {"text": "Only competitions matter", "correct": false}, {"text": "You can''t measure happiness", "correct": false}]'::jsonb,
  4
);

COMMIT;
