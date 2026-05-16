-- 00039 — Auto-seed camp_template_days for the SVC-* service templates

BEGIN;

INSERT INTO camp_template_days (id, template_id, day_number, day_goal, evaluation_focus)
SELECT gen_random_uuid(), 'SVC-SL1', 1, 'Surf Lesson 1 — Session Day', 'Fundamentals & ocean reading'
WHERE NOT EXISTS (SELECT 1 FROM camp_template_days WHERE template_id = 'SVC-SL1');

INSERT INTO camp_template_days (id, template_id, day_number, day_goal, evaluation_focus)
SELECT gen_random_uuid(), 'SVC-SL2', 1, 'Surf Lesson 2 — Session Day', 'Progression from Lesson 1'
WHERE NOT EXISTS (SELECT 1 FROM camp_template_days WHERE template_id = 'SVC-SL2');

INSERT INTO camp_template_days (id, template_id, day_number, day_goal)
SELECT gen_random_uuid(), 'SVC-CAMP-BEG', gs.day, 'Beginner Camp — Day ' || gs.day
FROM generate_series(1, 6) AS gs(day)
WHERE NOT EXISTS (SELECT 1 FROM camp_template_days WHERE template_id = 'SVC-CAMP-BEG');

INSERT INTO camp_template_days (id, template_id, day_number, day_goal)
SELECT gen_random_uuid(), 'SVC-CAMP-NOV', gs.day, 'Novice Camp — Day ' || gs.day
FROM generate_series(1, 6) AS gs(day)
WHERE NOT EXISTS (SELECT 1 FROM camp_template_days WHERE template_id = 'SVC-CAMP-NOV');

INSERT INTO camp_template_days (id, template_id, day_number, day_goal)
SELECT gen_random_uuid(), 'SVC-CAMP-FOUND', gs.day, 'Foundation Camp — Day ' || gs.day
FROM generate_series(1, 6) AS gs(day)
WHERE NOT EXISTS (SELECT 1 FROM camp_template_days WHERE template_id = 'SVC-CAMP-FOUND');

INSERT INTO camp_template_days (id, template_id, day_number, day_goal)
SELECT gen_random_uuid(), 'SVC-CUSTOM', 1, 'Custom Service — Day 1'
WHERE NOT EXISTS (SELECT 1 FROM camp_template_days WHERE template_id = 'SVC-CUSTOM');

COMMIT;
