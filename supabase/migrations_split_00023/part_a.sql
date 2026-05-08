-- 00023 PART 1/5 — Pre-Course (PC-PRE-01..08)
-- Source: WB_QUIZZES_STUDENT_v1_EN.json (Marcelo, 2026-05-08)
-- Replaces existing lesson_quizzes for these items with content-focused quizzes.

BEGIN;

DELETE FROM lesson_quizzes WHERE lesson_id IN ('PC-PRE-01', 'PC-PRE-02', 'PC-PRE-03', 'PC-PRE-04', 'PC-PRE-05', 'PC-PRE-06', 'PC-PRE-07', 'PC-PRE-08');

INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-01',
  'In the star-fall protocol, what position should your body be in?',
  '[{"text": "Arms extended, body flat, face up", "correct": true}, {"text": "Curled into a ball", "correct": false}, {"text": "Diving head-first", "correct": false}, {"text": "Standing upright", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-01',
  'When should you check your leash?',
  '[{"text": "Before every session", "correct": true}, {"text": "Only after a wipeout", "correct": false}, {"text": "Once a month", "correct": false}, {"text": "Only if it looks broken", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-01',
  'When you need to signal for help in the water, what do you do?',
  '[{"text": "Raise your arm and wave it clearly", "correct": true}, {"text": "Yell as loud as you can", "correct": false}, {"text": "Wave your board around", "correct": false}, {"text": "Splash the water repeatedly", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-01',
  'Why is it critical to keep your board away from other surfers?',
  '[{"text": "A loose board is a projectile that can seriously injure others", "correct": true}, {"text": "It looks bad", "correct": false}, {"text": "Other surfers will steal it", "correct": false}, {"text": "The board gets dirty", "correct": false}]'::jsonb,
  4
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-02',
  'Who has priority on a wave?',
  '[{"text": "The surfer closest to the peak", "correct": true}, {"text": "The first one to paddle", "correct": false}, {"text": "The most experienced surfer", "correct": false}, {"text": "The local", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-02',
  'What is "drop-in"?',
  '[{"text": "Taking a wave already being surfed by someone else", "correct": true}, {"text": "Falling off your board", "correct": false}, {"text": "Paddling fast", "correct": false}, {"text": "Riding all the way to the beach", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-02',
  'When paddling out, where should you go to avoid being in the way?',
  '[{"text": "Around the lineup, never through the middle", "correct": true}, {"text": "Straight through the lineup", "correct": false}, {"text": "Wherever is shortest", "correct": false}, {"text": "Behind every surfer", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-02',
  'When you arrive at a new spot you don''t know, what should you do first?',
  '[{"text": "Observe the lineup before paddling to the peak", "correct": true}, {"text": "Paddle immediately to the best wave", "correct": false}, {"text": "Tell others you''re new", "correct": false}, {"text": "Take the first wave you see", "correct": false}]'::jsonb,
  4
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-03',
  'What is the "peak" of a wave?',
  '[{"text": "The highest point where the wave breaks first", "correct": true}, {"text": "The bottom of the wave", "correct": false}, {"text": "The flat part after the wave", "correct": false}, {"text": "The shore", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-03',
  'What is "whitewater"?',
  '[{"text": "The white foam after the wave breaks", "correct": true}, {"text": "The unbroken face of the wave", "correct": false}, {"text": "Deep ocean water", "correct": false}, {"text": "A rare type of wave", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-03',
  'What is a "left" wave?',
  '[{"text": "A wave that breaks toward your left as you face the beach", "correct": true}, {"text": "A wave breaking on the left side of the beach", "correct": false}, {"text": "A wave only goofy footers can ride", "correct": false}, {"text": "The biggest wave of a set", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-03',
  'What is an A-frame?',
  '[{"text": "A wave that peaks and breaks both directions from a single point", "correct": true}, {"text": "A perfect right wave only", "correct": false}, {"text": "A wave with very white foam", "correct": false}, {"text": "A wave that doesn''t break at all", "correct": false}]'::jsonb,
  4
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-04',
  'What are the 4 stages of a wave in order?',
  '[{"text": "Swell, Approach, Break, Reform/Whitewater", "correct": true}, {"text": "Break, Foam, Lull, Set", "correct": false}, {"text": "Wind, Swell, Tide, Crash", "correct": false}, {"text": "Build, Curl, Drop, End", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-04',
  'In which stage does the lip throw over and foam form?',
  '[{"text": "Stage 3 — Break", "correct": true}, {"text": "Stage 1 — Swell", "correct": false}, {"text": "Stage 4 — Reform", "correct": false}, {"text": "Stage 2 — Approach", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-04',
  'In which stage does the White Belt primarily train?',
  '[{"text": "Stage 4 — Reform / Whitewater", "correct": true}, {"text": "Stage 1 — Swell", "correct": false}, {"text": "Stage 2 — Approach", "correct": false}, {"text": "Stage 3 — Break", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-05',
  'If you lose your board, what should you do FIRST?',
  '[{"text": "Float in star-fall position and don''t panic", "correct": true}, {"text": "Swim against the current toward shore", "correct": false}, {"text": "Yell for help immediately", "correct": false}, {"text": "Try to grab someone else''s board", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-05',
  'If your board is upstream from you (between you and the wave), what should you do?',
  '[{"text": "Wait — the wave will bring it back to you", "correct": true}, {"text": "Swim hard against the current to reach it", "correct": false}, {"text": "Dive under the wave", "correct": false}, {"text": "Try to stand up and walk to it", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-05',
  'When is it dangerous to chase your board?',
  '[{"text": "When chasing puts you in shallow rocks, strong rip, or shore break", "correct": true}, {"text": "Always — never chase a board", "correct": false}, {"text": "Only when it''s far away", "correct": false}, {"text": "When other surfers are nearby", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-06',
  'How many of the 6 risk factors must be negative for a no-go decision?',
  '[{"text": "2 or more", "correct": true}, {"text": "Only 1", "correct": false}, {"text": "All 6", "correct": false}, {"text": "Doesn''t matter, you decide intuitively", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-06',
  'Which of these is NOT one of the 6 risk factors?',
  '[{"text": "How many likes your last surf photo got", "correct": true}, {"text": "Wave size", "correct": false}, {"text": "Crowd", "correct": false}, {"text": "Your local knowledge of the spot", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-06',
  'What does the doctrine "if in doubt, don''t go out" mean?',
  '[{"text": "When you''re unsure conditions match your level, the call is no-go — wait and learn", "correct": true}, {"text": "Never surf when nervous", "correct": false}, {"text": "Always go out — fear is just in your head", "correct": false}, {"text": "Only surf with a coach present", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-07',
  'What should you do BEFORE paddling out for the first time at a spot?',
  '[{"text": "Watch the lineup for at least 5 minutes to identify the set pattern", "correct": true}, {"text": "Paddle immediately to save time", "correct": false}, {"text": "Talk to other surfers", "correct": false}, {"text": "Test the water temperature", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-07',
  'What is a "lull"?',
  '[{"text": "The calmer period between sets of waves", "correct": true}, {"text": "A type of wave that doesn''t break", "correct": false}, {"text": "The time of day waves are smallest", "correct": false}, {"text": "A current that pulls outward", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-07',
  'When should you NEVER come in to the beach?',
  '[{"text": "While a set is breaking on the inside", "correct": true}, {"text": "When the water is cold", "correct": false}, {"text": "When other surfers are around", "correct": false}, {"text": "When the sun is going down", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-08',
  'What is a "Step" in TSS vocabulary?',
  '[{"text": "A canonical individual movement unit, like Pop-Up (STP-016)", "correct": true}, {"text": "A way to walk on sand", "correct": false}, {"text": "A measurement of distance", "correct": false}, {"text": "A safety signal", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-08',
  'According to the One Wave Framework, mastery comes from:',
  '[{"text": "Quality of each wave + reflection, not from volume", "correct": true}, {"text": "Catching as many waves as possible", "correct": false}, {"text": "Going to the beach every day", "correct": false}, {"text": "Riding the biggest waves", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-08',
  'Which is one of the 5 canonical post-wave questions?',
  '[{"text": "What did I want to do?", "correct": true}, {"text": "How many surfers were watching?", "correct": false}, {"text": "What time is it?", "correct": false}, {"text": "Was the water cold?", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'PC-PRE-08',
  'What is a "Drill" vs a "Mission"?',
  '[{"text": "Drill trains the technique; Mission applies the learning in water with a specific objective", "correct": true}, {"text": "They are the same thing", "correct": false}, {"text": "Drill is in water; Mission is on land", "correct": false}, {"text": "Drill is for advanced surfers; Mission is for beginners", "correct": false}]'::jsonb,
  4
);

COMMIT;
