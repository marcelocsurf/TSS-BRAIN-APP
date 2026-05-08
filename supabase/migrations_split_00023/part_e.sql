-- 00023 PART 5/5 — STP-018..025 (Sequence #3 end + #4 + #5)
-- Source: WB_QUIZZES_STUDENT_v1_EN.json (Marcelo, 2026-05-08)
-- Replaces existing lesson_quizzes for these items with content-focused quizzes.

BEGIN;

DELETE FROM lesson_quizzes WHERE lesson_id IN ('STP-018', 'STP-019', 'STP-020', 'STP-021', 'STP-022', 'STP-023', 'STP-024', 'STP-025');

INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-018',
  'In the canonical power stance, where do your shoulders point?',
  '[{"text": "Forward — never back", "correct": true}, {"text": "Back", "correct": false}, {"text": "Sideways", "correct": false}, {"text": "Up at the sky", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-018',
  'Where is your weight in the power stance?',
  '[{"text": "Slightly forward, on the front foot", "correct": true}, {"text": "All the way back on the tail", "correct": false}, {"text": "Centered exactly", "correct": false}, {"text": "Off the board", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-018',
  'What does "back knee compact" mean?',
  '[{"text": "Bent inward, not splayed out — keeps the body connected", "correct": true}, {"text": "Locked straight", "correct": false}, {"text": "Spread out wide", "correct": false}, {"text": "Touching the board", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-018',
  'Why is "exhale active" part of the power stance?',
  '[{"text": "Active breath keeps the body connected and prevents stiffening", "correct": true}, {"text": "It''s not part of the stance", "correct": false}, {"text": "You should hold your breath", "correct": false}, {"text": "Only competitive surfers exhale", "correct": false}]'::jsonb,
  4
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-019',
  'When should you generate impulse on a ride?',
  '[{"text": "When the foam is slowing or wave power is dissipating", "correct": true}, {"text": "At the very start of the wave", "correct": false}, {"text": "When you''re falling", "correct": false}, {"text": "Before you stand up", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-019',
  'What does the impulse motion look like?',
  '[{"text": "Flex knees, touch toward water, push extension forward", "correct": true}, {"text": "Jump straight up", "correct": false}, {"text": "Lean back hard", "correct": false}, {"text": "Squat and stay", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-019',
  'What does a successful impulse produce?',
  '[{"text": "The board accelerates — ride is extended", "correct": true}, {"text": "You fall off", "correct": false}, {"text": "Nothing changes", "correct": false}, {"text": "The wave stops", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-020',
  'When should you decide to do a starfish dismount?',
  '[{"text": "EARLY — before you lose balance, not after", "correct": true}, {"text": "Only after you fall", "correct": false}, {"text": "Halfway through the wave", "correct": false}, {"text": "Never until you crash", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-020',
  'What body shape is the "starfish"?',
  '[{"text": "Knees bent, arms wide open like a star", "correct": true}, {"text": "Curled tight in a ball", "correct": false}, {"text": "Standing upright", "correct": false}, {"text": "Diving headfirst", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-020',
  'In which direction should you fall?',
  '[{"text": "Backward, into the foam — never forward, never headfirst", "correct": true}, {"text": "Forward into the wave", "correct": false}, {"text": "Headfirst diving", "correct": false}, {"text": "Sideways", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-020',
  'Why do you fall back instead of forward?',
  '[{"text": "Forward dives can land headfirst into shallow water — extreme injury risk", "correct": true}, {"text": "It looks cooler", "correct": false}, {"text": "It''s faster", "correct": false}, {"text": "It doesn''t matter", "correct": false}]'::jsonb,
  4
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-021',
  'What is the canonical chain for a backside turn?',
  '[{"text": "Look → Oblique → Hip → Heel-side rail", "correct": true}, {"text": "Lean → Push → Pull → Stop", "correct": false}, {"text": "Step → Skip → Jump", "correct": false}, {"text": "Random combination", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-021',
  'Which foot side''s rail engages on a backside turn?',
  '[{"text": "The heel-side rail", "correct": true}, {"text": "The toe-side rail", "correct": false}, {"text": "Both rails equally", "correct": false}, {"text": "No rail", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-021',
  'What does "eyes lead" mean in turning?',
  '[{"text": "Look in the turn direction first — body follows", "correct": true}, {"text": "Close your eyes", "correct": false}, {"text": "Look at your feet", "correct": false}, {"text": "Look behind you", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-022',
  'What''s the critical difference between frontside and backside turns?',
  '[{"text": "On frontside, posture must stay connected — no buckling forward", "correct": true}, {"text": "They''re identical", "correct": false}, {"text": "Frontside uses no rail", "correct": false}, {"text": "Backside doesn''t use eyes", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-022',
  'Which rail engages on a frontside turn?',
  '[{"text": "The toe-side (front-side) rail", "correct": true}, {"text": "The heel-side rail", "correct": false}, {"text": "No rail", "correct": false}, {"text": "Both rails", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-022',
  'What''s the most common error on frontside turns?',
  '[{"text": "Buckling forward — collapsing posture mid-turn", "correct": true}, {"text": "Looking away too much", "correct": false}, {"text": "Not bending the knees enough", "correct": false}, {"text": "Using too much rail", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-023',
  'In efficient paddle-out technique, where does your elbow pass?',
  '[{"text": "Over your ear", "correct": true}, {"text": "Below your shoulder", "correct": false}, {"text": "Behind your back", "correct": false}, {"text": "Across your chest", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-023',
  'How should your body be positioned during paddle out?',
  '[{"text": "Like an arrow — head still, no side-to-side movement", "correct": true}, {"text": "Twisting side to side", "correct": false}, {"text": "Looking around constantly", "correct": false}, {"text": "Hunched up", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-023',
  'How many "gears" does TSS paddle technique have?',
  '[{"text": "Multiple gears (1-3+) — switch based on goal: cruising, target, sprint", "correct": true}, {"text": "Only one speed", "correct": false}, {"text": "Two speeds: slow and fast", "correct": false}, {"text": "No defined gears", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-023',
  'How should the hand enter the water?',
  '[{"text": "Aerodynamically, fingertips first", "correct": true}, {"text": "Slapping flat", "correct": false}, {"text": "Fist closed", "correct": false}, {"text": "Backside of hand first", "correct": false}]'::jsonb,
  4
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-024',
  'When should you initiate the turtle roll?',
  '[{"text": "About 1 meter before the foam reaches you", "correct": true}, {"text": "After the foam already hit you", "correct": false}, {"text": "Whenever you feel like it", "correct": false}, {"text": "Only for big waves", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-024',
  'During the roll, where should your elbows be?',
  '[{"text": "On top of the board, protecting your face from the bottom", "correct": true}, {"text": "Off to the sides", "correct": false}, {"text": "Underneath the board", "correct": false}, {"text": "Wrapped behind your head", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-024',
  'What is the cardinal rule of turtle roll?',
  '[{"text": "Never let go of the board — keep gripping the rails through the turbulence", "correct": true}, {"text": "Always let go to escape", "correct": false}, {"text": "Use it only when alone", "correct": false}, {"text": "It only works on waves under 1 foot", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-024',
  'How do you recover after the roll?',
  '[{"text": "Scissor kick + use one arm to return chest to center, resume paddling", "correct": true}, {"text": "Stand up", "correct": false}, {"text": "Float on your back", "correct": false}, {"text": "Dive deeper", "correct": false}]'::jsonb,
  4
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-025',
  'How many canonical modes are there for prone direction?',
  '[{"text": "3 — one-side paddling, circular hand motion, seated pivot", "correct": true}, {"text": "1 — only paddling", "correct": false}, {"text": "5 different methods", "correct": false}, {"text": "No defined modes", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-025',
  'In the seated pivot mode, where should your hips go?',
  '[{"text": "Back toward the tail — so the board pivots more easily", "correct": true}, {"text": "Forward to the nose", "correct": false}, {"text": "Off to one side", "correct": false}, {"text": "Doesn''t matter", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-025',
  'After a direction change, what state should you be in?',
  '[{"text": "Ready to paddle immediately — never stuck out of position", "correct": true}, {"text": "Sitting and resting", "correct": false}, {"text": "Floating with eyes closed", "correct": false}, {"text": "Standing up", "correct": false}]'::jsonb,
  3
);

COMMIT;

-- Verification: total quizzes should be 133 across 39 lessons
SELECT lesson_id, COUNT(*) AS qcount
FROM lesson_quizzes
WHERE lesson_id LIKE 'PC-PRE-%' OR lesson_id LIKE 'ONB-%' OR lesson_id LIKE 'STP-%'
GROUP BY lesson_id
ORDER BY lesson_id;
