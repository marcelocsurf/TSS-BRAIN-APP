-- 00023 PART 4/5 — STP-010..017 (Sequence #2 + #3 start)
-- Source: WB_QUIZZES_STUDENT_v1_EN.json (Marcelo, 2026-05-08)
-- Replaces existing lesson_quizzes for these items with content-focused quizzes.

BEGIN;

DELETE FROM lesson_quizzes WHERE lesson_id IN ('STP-010', 'STP-011', 'STP-012', 'STP-013', 'STP-014', 'STP-015', 'STP-016', 'STP-017');

INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-010',
  'Where should the NOSE of your board be when you''re in the sweet spot?',
  '[{"text": "Just barely floating above the water", "correct": true}, {"text": "Submerged below the water", "correct": false}, {"text": "Lifted high above the water", "correct": false}, {"text": "Pointing straight up", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-010',
  'Where should your CHEST be on the board?',
  '[{"text": "Slightly forward of center", "correct": true}, {"text": "Far back near the tail", "correct": false}, {"text": "All the way on the nose", "correct": false}, {"text": "Hanging off the side", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-010',
  'How do you know you''ve found the sweet spot?',
  '[{"text": "The board floats level and you don''t feel like you''re fighting it", "correct": true}, {"text": "The board tilts heavily forward", "correct": false}, {"text": "You can stand up immediately", "correct": false}, {"text": "The tail comes out of the water", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-010',
  'What''s the consequence of being too far forward (nose dive position)?',
  '[{"text": "The nose pushes down into the water and you can''t paddle", "correct": true}, {"text": "The board moves faster", "correct": false}, {"text": "The wave pushes you forward", "correct": false}, {"text": "It doesn''t matter", "correct": false}]'::jsonb,
  4
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-011',
  'Before you start paddling for a wave, what must you check?',
  '[{"text": "Look over your shoulder to verify your alignment with the foam", "correct": true}, {"text": "Close your eyes and focus", "correct": false}, {"text": "Yell to other surfers", "correct": false}, {"text": "Stand up first", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-011',
  'In which direction should the nose of your board point?',
  '[{"text": "In the direction the foam is moving", "correct": true}, {"text": "Sideways to the foam", "correct": false}, {"text": "Toward the lineup", "correct": false}, {"text": "Toward the beach only", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-011',
  'What''s the consequence of paddling without alignment?',
  '[{"text": "Wasted paddle effort and missed wave", "correct": true}, {"text": "You''ll catch the wave faster", "correct": false}, {"text": "Nothing — paddle hard enough and it works", "correct": false}, {"text": "You''ll go backward", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-012',
  'What is the canonical paddle cadence?',
  '[{"text": "Long strokes, alternating one-two", "correct": true}, {"text": "Short choppy strokes", "correct": false}, {"text": "Both arms together", "correct": false}, {"text": "No fixed cadence", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-012',
  'Each paddle stroke should push the board:',
  '[{"text": "Forward — pull water back to push body forward", "correct": true}, {"text": "Down — push down on the water", "correct": false}, {"text": "Up — lift the board", "correct": false}, {"text": "Sideways", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-012',
  'When can you stop paddling once you''re committed?',
  '[{"text": "When you feel the board accelerate with the wave", "correct": true}, {"text": "After 3 strokes", "correct": false}, {"text": "When you get tired", "correct": false}, {"text": "Never until you reach the beach", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-012',
  'What''s the most common paddling mistake?',
  '[{"text": "Starting too late and stopping before the wave catches you", "correct": true}, {"text": "Paddling too hard", "correct": false}, {"text": "Paddling with both arms together", "correct": false}, {"text": "Paddling underwater", "correct": false}]'::jsonb,
  4
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-013',
  'In cobra position, where are your hands placed?',
  '[{"text": "At rib height on the rails", "correct": true}, {"text": "At the nose of the board", "correct": false}, {"text": "On the tail", "correct": false}, {"text": "On your face", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-013',
  'To turn the board while in cobra, what do you do?',
  '[{"text": "Look in the direction you want to go and press that side''s rail", "correct": true}, {"text": "Lean back", "correct": false}, {"text": "Close your eyes", "correct": false}, {"text": "Stop the board first", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-013',
  'What is "eyes lead" mean in cobra steering?',
  '[{"text": "Where your eyes look, your body follows — direction starts with the gaze", "correct": true}, {"text": "Keep eyes closed", "correct": false}, {"text": "Look at your feet", "correct": false}, {"text": "Look up at the sky", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-014',
  'When dismounting from a prone ride, where should your hands be?',
  '[{"text": "Both hands gripping the rails firmly", "correct": true}, {"text": "Released from the board", "correct": false}, {"text": "Above your head", "correct": false}, {"text": "Behind your back", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-014',
  'How should your body land in the water?',
  '[{"text": "On your side or back, never face-first", "correct": true}, {"text": "Face-first like a dive", "correct": false}, {"text": "Standing upright", "correct": false}, {"text": "Curled in a ball", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-014',
  'What is the cardinal rule of prone dismount?',
  '[{"text": "Stay with the board — never let go of the rails until stable in the water", "correct": true}, {"text": "Let go immediately", "correct": false}, {"text": "Throw the board away from you", "correct": false}, {"text": "Stop the board first", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-015',
  'When should you pick your line on the wave?',
  '[{"text": "While still in cobra, BEFORE initiating the pop-up", "correct": true}, {"text": "After standing up", "correct": false}, {"text": "During the pop-up itself", "correct": false}, {"text": "After the wave ends", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-015',
  'What does "verbalizing your line" mean?',
  '[{"text": "Saying out loud (or mentally) \"I am going there\" while still in cobra", "correct": true}, {"text": "Yelling at the wave", "correct": false}, {"text": "Counting waves out loud", "correct": false}, {"text": "Singing", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-015',
  'During the pop-up, where should your eyes go?',
  '[{"text": "Locked on the chosen direction — never look down at the board", "correct": true}, {"text": "Down at the nose", "correct": false}, {"text": "At the wave behind you", "correct": false}, {"text": "Closed", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-015',
  'What''s the result of a pop-up without picking a line first?',
  '[{"text": "Direction is accidental — board drifts wherever the wave pushes", "correct": true}, {"text": "You go faster", "correct": false}, {"text": "You stand up better", "correct": false}, {"text": "The wave breaks earlier", "correct": false}]'::jsonb,
  4
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-016',
  'What is the FIRST step of the pop-up?',
  '[{"text": "Solid cobra position with chest lifted", "correct": true}, {"text": "Stand up immediately", "correct": false}, {"text": "Grab the leash", "correct": false}, {"text": "Look at the beach", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-016',
  'How should both feet land?',
  '[{"text": "Both centered, both at the same time (or front foot first — never back foot first)", "correct": true}, {"text": "Back foot first", "correct": false}, {"text": "One on each rail", "correct": false}, {"text": "On the nose", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-016',
  'When should your hands release the rails?',
  '[{"text": "Only when you are centered and stable, never before", "correct": true}, {"text": "Immediately at the start", "correct": false}, {"text": "Halfway through", "correct": false}, {"text": "Never — keep them on", "correct": false}]'::jsonb,
  3
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-016',
  'What does "audible exhale" mean during the pop-up?',
  '[{"text": "Active breath out at the moment of the lift — releases tension and adds power", "correct": true}, {"text": "Holding your breath", "correct": false}, {"text": "Yelling", "correct": false}, {"text": "Speaking the cue word", "correct": false}]'::jsonb,
  4
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-017',
  'Where on the board does Foot Position #2 (FP2) place the back foot?',
  '[{"text": "Centered on the rails, in the back third of the board, perpendicular to the stringer", "correct": true}, {"text": "On one rail", "correct": false}, {"text": "On the nose", "correct": false}, {"text": "Off the side of the board", "correct": false}]'::jsonb,
  1
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-017',
  'What''s the consequence of the back foot landing on a rail?',
  '[{"text": "No power, no control — board doesn''t respond", "correct": true}, {"text": "Faster speed", "correct": false}, {"text": "Better turning", "correct": false}, {"text": "Easier balance", "correct": false}]'::jsonb,
  2
);
INSERT INTO lesson_quizzes (id, lesson_id, question, options, display_order) VALUES (
  gen_random_uuid(),
  'STP-017',
  'How does correct FP2 feel?',
  '[{"text": "The board responds to your pressure — connected", "correct": true}, {"text": "Heavy and stuck", "correct": false}, {"text": "Nothing changes", "correct": false}, {"text": "Painful", "correct": false}]'::jsonb,
  3
);

COMMIT;
