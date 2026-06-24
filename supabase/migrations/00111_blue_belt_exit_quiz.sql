-- Blue Belt Exit Test — friendly multiple-choice quiz.
--
-- BB-EXIT-01 was a self-evaluation reading lesson (lesson_type='test') with NO
-- quiz questions, so the student never saw the friendly multiple-choice quiz the
-- White/Yellow exit tests use (rendered by CourseQuiz from `lesson_quizzes`).
-- This adds the comprehension quiz in the SAME format as Yellow's YB-MOD-8.
-- Once rows exist for BB-EXIT-01, LessonViewer shows the "Quiz" section
-- automatically; pass mark is 80% (CourseQuiz), unlimited retakes.
--
-- Every question + answer is drawn verbatim from the Blue Belt course content
-- already in 00109_blue_belt_course.sql (exit-test rubric, Universal Sequence
-- Formula, the 4 BB Concepts, the Big Three errors, Compromiso Consciente).
-- Nothing here is invented.

-- Idempotent: clear any prior BB-EXIT-01 quiz rows, then re-seed.
delete from lesson_quizzes where lesson_id = 'BB-EXIT-01';

insert into lesson_quizzes (lesson_id, question, options, display_order) values
('BB-EXIT-01',
 'What is the global threshold for passing the Blue Belt Exit Test?',
 '[{"text":"Perfection on every wave","correct":false},{"text":"Execution with awareness, not perfection","correct":true},{"text":"Catching the most waves in the session","correct":false}]'::jsonb,
 1),

('BB-EXIT-01',
 'On the Foundation Chain sequences (Seq #10, #11, #12, #13), how many of 5 attempts must you land to meet the self-threshold?',
 '[{"text":"2 of 5","correct":false},{"text":"3 of 5","correct":false},{"text":"4 of 5","correct":true}]'::jsonb,
 2),

('BB-EXIT-01',
 'On the Pump sequences (Seq #8 FS and Seq #9 BS), what is the self-threshold per side?',
 '[{"text":"3 of 5 attempts","correct":true},{"text":"4 of 5 attempts","correct":false},{"text":"5 of 5 attempts","correct":false}]'::jsonb,
 3),

('BB-EXIT-01',
 'What is the correct order of the Universal Sequence Formula on the frontside Foundation Chain?',
 '[{"text":"Posture → BT → Projection → Cruz → Grenade → Posture","correct":true},{"text":"Projection → Posture → Cruz → BT → Grenade","correct":false},{"text":"BT → Grenade → Cruz → Projection → Posture","correct":false}]'::jsonb,
 4),

('BB-EXIT-01',
 'During the Exit Test, what makes an attempt count as a "success"?',
 '[{"text":"The ride simply felt good","correct":false},{"text":"All Universal Formula stages were present, the maneuver class was correct, the closure was present, and you returned to posture cleanly","correct":true},{"text":"You caught the wave and stood up","correct":false}]'::jsonb,
 5),

('BB-EXIT-01',
 'Doctrinally, what separates a Cutback from a Snap?',
 '[{"text":"A Cutback is faster than a Snap","correct":false},{"text":"A Cutback returns to the pocket; a Snap does not","correct":true},{"text":"A Cutback is frontside only","correct":false}]'::jsonb,
 6),

('BB-EXIT-01',
 'Which of these is one of the "Big Three" errors that say you are NOT ready for the Exit Test?',
 '[{"text":"Weight drifts backward consistently → loses speed, gets stuck on the wave","correct":true},{"text":"Paddling too early for the wave","correct":false},{"text":"Wearing the wrong wax for the water temperature","correct":false}]'::jsonb,
 7),

('BB-EXIT-01',
 'Which set correctly names the 4 Blue Belt Concepts you must demonstrate in context?',
 '[{"text":"Floater, Impulso, Low Finish, BT Concept","correct":true},{"text":"Cobra, Line, Time, Exit","correct":false},{"text":"Paddle, Pop-up, Trim, Kick-out","correct":false}]'::jsonb,
 8),

('BB-EXIT-01',
 'On the Tapaloco Cutback (Seq #13 BS Linking), what is the goal that defines a success?',
 '[{"text":"Throwing the biggest possible spray","correct":false},{"text":"Returning to the foam, surviving the foam encounter, and coming back out to the wave face as one continuous line","correct":true},{"text":"Finishing the ride as fast as possible","correct":false}]'::jsonb,
 9),

('BB-EXIT-01',
 'At Blue Belt, who administers your Exit Test, and what is being tested most of all?',
 '[{"text":"Your coach grades you, as in earlier belts","correct":false},{"text":"You self-administer it honestly — your honesty IS the test","correct":true},{"text":"Another student grades you anonymously","correct":false}]'::jsonb,
 10);
