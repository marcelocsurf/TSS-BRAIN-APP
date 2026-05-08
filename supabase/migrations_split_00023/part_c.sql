-- 00023 PART 3/5 — STP-001..009 (Sequence #1)
-- Source: WB_QUIZZES_STUDENT_v1_EN.json (Marcelo, 2026-05-08)
-- Replaces existing lesson_quizzes for these items with content-focused quizzes.

BEGIN;

DELETE FROM lesson_quizzes WHERE lesson_id IN ('STP-001', 'STP-002', 'STP-003', 'STP-004', 'STP-005', 'STP-006', 'STP-007', 'STP-008', 'STP-009');

INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-001',
  'When you arrive at the beach, what is the FIRST thing you should identify?',
  '[{"text": "A fixed land reference and an outside reference", "correct": true}, {"text": "The biggest wave", "correct": false}, {"text": "Other surfers", "correct": false}, {"text": "Where you parked", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-001',
  'How long should you watch the lineup before deciding to enter?',
  '[{"text": "At least 5 minutes to see set patterns", "correct": true}, {"text": "30 seconds", "correct": false}, {"text": "Just look once", "correct": false}, {"text": "Until you see one big wave", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-001',
  'What does the "go/no-go decision" answer?',
  '[{"text": "Whether today''s conditions are appropriate for your level", "correct": true}, {"text": "How many waves you''ll catch", "correct": false}, {"text": "Where to park", "correct": false}, {"text": "What time to leave", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-001',
  'What is the "safe zone"?',
  '[{"text": "The area where you can practice without big waves breaking on top of you", "correct": true}, {"text": "The parking lot", "correct": false}, {"text": "Where the lifeguard sits", "correct": false}, {"text": "Far from any waves", "correct": false}]'::jsonb,
  4
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-002',
  'How many segments does the canonical TSS Warm Up have?',
  '[{"text": "4 — Mobility, Activation, Simulation, Breath", "correct": true}, {"text": "2 — Stretch and Run", "correct": false}, {"text": "6 — too many to remember", "correct": false}, {"text": "No fixed structure", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-002',
  'What is the purpose of the "Simulation" segment?',
  '[{"text": "Rehearse surfing movements on land before water (pop-up, posture, rotation)", "correct": true}, {"text": "Stretch your hamstrings", "correct": false}, {"text": "Cool down after a session", "correct": false}, {"text": "Talk to other surfers", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-002',
  'What is the goal mental state at the end of the warm-up?',
  '[{"text": "Active calm — present, connected, focused, ready", "correct": true}, {"text": "Overexcited and pumped up", "correct": false}, {"text": "Sleepy and relaxed", "correct": false}, {"text": "Tense and serious", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-003',
  'When lifting the board, where should your hands be?',
  '[{"text": "Both hands on the rails (side edges)", "correct": true}, {"text": "On the deck (top)", "correct": false}, {"text": "On the fins", "correct": false}, {"text": "On the leash", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-003',
  'What part of your body does the lifting?',
  '[{"text": "Your legs (knees bent, back straight)", "correct": true}, {"text": "Your back", "correct": false}, {"text": "Your arms only", "correct": false}, {"text": "Your core only", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-003',
  'How should you carry the board to the water?',
  '[{"text": "On your side, under control, away from other people", "correct": true}, {"text": "Above your head", "correct": false}, {"text": "Dragging the fins on the sand", "correct": false}, {"text": "Behind your back", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-004',
  'Why should you drag your feet on the sand bottom as you walk in?',
  '[{"text": "To detect obstacles like rocks and avoid stingrays", "correct": true}, {"text": "To go faster", "correct": false}, {"text": "To leave footprints", "correct": false}, {"text": "It looks cool", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-004',
  'Where should the board be while walking out?',
  '[{"text": "On your side, with the nose pointed at incoming foam", "correct": true}, {"text": "In front of you", "correct": false}, {"text": "Behind you", "correct": false}, {"text": "Above your head", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-004',
  'When should you start walking out?',
  '[{"text": "During a lull, after watching for the set pattern", "correct": true}, {"text": "In the middle of a set", "correct": false}, {"text": "Whenever you arrive", "correct": false}, {"text": "When everyone else does", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-005',
  'How should you place the board on the water?',
  '[{"text": "Gently, parallel to incoming waves, no slap", "correct": true}, {"text": "Drop it from waist height", "correct": false}, {"text": "Throw it forward", "correct": false}, {"text": "Stand on it first", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-005',
  'Why does board orientation matter when placing?',
  '[{"text": "If perpendicular to waves, the foam will rip it from your hands", "correct": true}, {"text": "Doesn''t matter — board floats either way", "correct": false}, {"text": "Only matters for speed", "correct": false}, {"text": "Only matters in the lineup", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-005',
  'After releasing the board, what should you do?',
  '[{"text": "Stay ready to grab the rails again instantly if foam comes", "correct": true}, {"text": "Walk away", "correct": false}, {"text": "Climb on immediately without checking", "correct": false}, {"text": "Dive under the water", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-006',
  'When foam is coming, what should you do with the tail of the board?',
  '[{"text": "Press it down so the nose lifts and foam passes underneath", "correct": true}, {"text": "Lift it up", "correct": false}, {"text": "Let it go loose", "correct": false}, {"text": "Stand on it", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-006',
  'Where should your body be relative to the board?',
  '[{"text": "Between the board and the shore — never let the board be between you and the wave", "correct": true}, {"text": "In front of the board", "correct": false}, {"text": "On top of the board", "correct": false}, {"text": "Far away from the board", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-006',
  'What direction should the nose always face as foam approaches?',
  '[{"text": "Pointed straight at the incoming foam", "correct": true}, {"text": "Sideways to the foam", "correct": false}, {"text": "Toward the beach", "correct": false}, {"text": "Doesn''t matter", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-007',
  'What body posture do you maintain when passing through whitewater standing?',
  '[{"text": "Compact — knees slightly bent, body low and stable", "correct": true}, {"text": "Tall and stiff", "correct": false}, {"text": "Crouched in a ball", "correct": false}, {"text": "Leaning back", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-007',
  'What happens if you press the tail down as the foam reaches the nose?',
  '[{"text": "The nose lifts and the foam passes under the board", "correct": true}, {"text": "The board flips over", "correct": false}, {"text": "The board sinks", "correct": false}, {"text": "The foam pushes you backward", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-007',
  'In which direction should you progress after the foam passes?',
  '[{"text": "Forward — toward the lineup", "correct": true}, {"text": "Backward to the shore", "correct": false}, {"text": "Sideways", "correct": false}, {"text": "Stay in place", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-008',
  'During the pivot turn, where should your body be relative to the board?',
  '[{"text": "Between the board and the open ocean — never let the board be between you and the wave", "correct": true}, {"text": "On top of the board", "correct": false}, {"text": "Far from the board", "correct": false}, {"text": "Behind the board only", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-008',
  'What should you do BEFORE rotating the board?',
  '[{"text": "Look behind you (over your shoulder) to check what''s coming", "correct": true}, {"text": "Close your eyes", "correct": false}, {"text": "Yell to others", "correct": false}, {"text": "Stand up straight", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-008',
  'What''s the goal at the end of a safe pivot turn?',
  '[{"text": "Be facing toward the lineup, ready to paddle out", "correct": true}, {"text": "Face the beach", "correct": false}, {"text": "Lay flat on the water", "correct": false}, {"text": "Climb on the board", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-009',
  'How should you walk back to the sand?',
  '[{"text": "Facing partly toward the waves, monitoring incoming foam", "correct": true}, {"text": "Turn your back fully to the waves and walk fast", "correct": false}, {"text": "Run as fast as you can", "correct": false}, {"text": "Walk with eyes closed", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-009',
  'What should you do if foam approaches mid-walk?',
  '[{"text": "Stop, brace, let it pass, then continue", "correct": true}, {"text": "Run away", "correct": false}, {"text": "Dive under", "correct": false}, {"text": "Throw the board ahead", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-009',
  'Why is walk-back awareness important?',
  '[{"text": "Many beach injuries happen on the way out — being hit from behind by foam", "correct": true}, {"text": "There are sea creatures", "correct": false}, {"text": "Other surfers might collide with you", "correct": false}, {"text": "You might forget your towel", "correct": false}]'::jsonb,
  3
);

COMMIT;
