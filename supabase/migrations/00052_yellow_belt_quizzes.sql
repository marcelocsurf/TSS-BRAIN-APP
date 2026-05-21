-- M52 — Quizzes for the 8 Yellow Belt STPs (3 questions per STP).
--
-- Mirrors the WB pattern from 00015: 3 short multiple-choice questions
-- per reading lesson, anchored in the STP's Theory content.
--
-- Idempotent: deletes existing YB quizzes first, then re-inserts.

DELETE FROM lesson_quizzes
WHERE lesson_id IN ('STP-027','STP-028','STP-029','STP-030','STP-031','STP-032','STP-033','STP-034');

-- ─── STP-027 · Paddling Speeds ───
INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES
('STP-027', 'Which speed should you use for most of your paddling time in the lineup?',
 '[{"text":"V4 — always sprint to stay ready","correct":false},{"text":"V1–V2 — cruising and working pace","correct":true},{"text":"V3 — constant catch mode","correct":false}]'::jsonb, 1),
('STP-027', 'What breathing pattern goes with V3–V4 paddling?',
 '[{"text":"Hold your breath through the sprint","correct":false},{"text":"2 strokes per breath","correct":false},{"text":"1 stroke per breath","correct":true}]'::jsonb, 2),
('STP-027', 'Speed is mostly a function of…',
 '[{"text":"Arm strength alone","correct":false},{"text":"Purposeful application of energy: matching the wave, not panic","correct":true},{"text":"Cadence — the faster the arms move, the faster you go","correct":false}]'::jsonb, 3);

-- ─── STP-028 · Chase the Pocket ───
INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES
('STP-028', 'What is the "pocket"?',
 '[{"text":"The whole wave from peak to shoulder","correct":false},{"text":"The specific point on the wave where energy concentrates and the lip forms","correct":true},{"text":"The flat section in front of the wave","correct":false}]'::jsonb, 1),
('STP-028', 'How should the eyes behave during the paddle-in approach?',
 '[{"text":"Look down at the board for stability","correct":false},{"text":"Maintain fixed visual contact on the identified pocket","correct":true},{"text":"Close your eyes and trust the rhythm","correct":false}]'::jsonb, 2),
('STP-028', 'Why does pocket awareness matter so much at Yellow Belt?',
 '[{"text":"It''s required to pass etiquette tests","correct":false},{"text":"It turns paddling from reactive to purposeful and lets you use the 4 speeds correctly","correct":true},{"text":"It replaces the need to read wave stages","correct":false}]'::jsonb, 3);

-- ─── STP-029 · Paddle with the Correct Angle ───
INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES
('STP-029', 'How many tactical paddling-angle options does Yellow Belt teach?',
 '[{"text":"One — always perpendicular to the wave","correct":false},{"text":"Two — straight or angled","correct":false},{"text":"Three options selected by context","correct":true}]'::jsonb, 1),
('STP-029', 'Which prerequisites must be mastered before angle selection makes sense?',
 '[{"text":"Pop-up and foot position","correct":false},{"text":"Pocket identification (STP-028) and stage reading (STP-033)","correct":true},{"text":"Etiquette and lineup management","correct":false}]'::jsonb, 2),
('STP-029', 'What should you NEVER paddle into?',
 '[{"text":"Stage 3 — too late","correct":false},{"text":"Stage 1 — the wave is not yet catchable","correct":true},{"text":"Stage 4 — wave already broken","correct":false}]'::jsonb, 3);

-- ─── STP-030 · Pop Up + Foot Position ───
INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES
('STP-030', 'Which foot position is the default landing at Yellow Belt and why?',
 '[{"text":"FP1 — for tight turns","correct":false},{"text":"FP2 — because the knees rest over FP2 when lying on the sweet spot","correct":true},{"text":"FP3 — for maximum speed","correct":false}]'::jsonb, 1),
('STP-030', 'What is the new skill YB adds on top of the WB pop-up?',
 '[{"text":"The standing-up motion itself","correct":false},{"text":"The back-foot shuffle between FP1 and FP2","correct":true},{"text":"Falling with a star fall","correct":false}]'::jsonb, 2),
('STP-030', 'Where should your weight go in the standing posture?',
 '[{"text":"On the back foot for control","correct":false},{"text":"On the front foot — hips down, head up, look forward","correct":true},{"text":"Evenly split with eyes on the feet","correct":false}]'::jsonb, 3);

-- ─── STP-031 · Go Up and Down ───
INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES
('STP-031', 'What is the central rule of Go Up and Down?',
 '[{"text":"Go to the flat to reset speed","correct":false},{"text":"Don''t go to the flat — stay where the energy is","correct":true},{"text":"Use only your arms for balance","correct":false}]'::jsonb, 1),
('STP-031', 'How does the body generate the up-down cycle?',
 '[{"text":"By jumping with both feet","correct":false},{"text":"By compressing (down) and extending (up) the legs","correct":true},{"text":"By rotating only the shoulders","correct":false}]'::jsonb, 2),
('STP-031', 'Why is this STP called the "integration step" of Yellow Belt?',
 '[{"text":"Because it''s the easiest step","correct":false},{"text":"Because it connects everything previously learned into one continuous ride — drawing lines on the wave","correct":true},{"text":"Because it replaces the cobra","correct":false}]'::jsonb, 3);

-- ─── STP-032 · Out from the Shoulder ───
INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES
('STP-032', 'What makes a shoulder exit "active"?',
 '[{"text":"Falling off when the wave closes","correct":false},{"text":"A conscious decision to leave the wave through the shoulder before the lip forms","correct":true},{"text":"Letting the wave take you to the beach","correct":false}]'::jsonb, 1),
('STP-032', 'In which wave stage should the shoulder be when you initiate the exit?',
 '[{"text":"Stage 4 — already broken","correct":false},{"text":"Stage 1 or 2 — before lip formation","correct":true},{"text":"Stage 3 — full break","correct":false}]'::jsonb, 2),
('STP-032', 'Why does the active shoulder exit matter doctrinally?',
 '[{"text":"It avoids paying for a new wave","correct":false},{"text":"It shows the surfer is reading, deciding, and executing with purpose — not just reacting","correct":true},{"text":"It is the only legal exit","correct":false}]'::jsonb, 3);

-- ─── STP-033 · Reading Wave Stages ───
INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES
('STP-033', 'How many stages does a wave have in the YB framework?',
 '[{"text":"2","correct":false},{"text":"4","correct":true},{"text":"6","correct":false}]'::jsonb, 1),
('STP-033', 'What does YB add to the Pre-Course concept of wave stages?',
 '[{"text":"Replaces the 4 stages with 5","correct":false},{"text":"Applies the stages in real time on real moving waves to make positional decisions","correct":true},{"text":"Removes the concept entirely","correct":false}]'::jsonb, 2),
('STP-033', 'Why should you NOT paddle into Stage 1?',
 '[{"text":"It''s against TSS etiquette","correct":false},{"text":"The wave is not yet catchable — energy is wasted","correct":true},{"text":"Stage 1 waves are reserved for advanced surfers","correct":false}]'::jsonb, 3);

-- ─── STP-034 · Cobra + Pick Line ───
INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES
('STP-034', 'What does Cobra + correct line generate?',
 '[{"text":"More speed than V4 paddling","correct":false},{"text":"TIME — the calm space needed for a controlled pop-up","correct":true},{"text":"A bigger barrel","correct":false}]'::jsonb, 1),
('STP-034', 'What happens if you do the cobra without picking a line?',
 '[{"text":"You generate even more TIME","correct":false},{"text":"You turn without a destination — random direction, no TIME generated","correct":true},{"text":"You always end up in the pocket","correct":false}]'::jsonb, 2),
('STP-034', 'Where should the hands be when you execute the cobra?',
 '[{"text":"Extended fully forward","correct":false},{"text":"At rib height","correct":true},{"text":"On the rails near the tail","correct":false}]'::jsonb, 3);
