-- M105 — Bring SVC-CAMP-BEG (White Belt) to the same standard as the Novice
-- (Yellow Belt) template:
--   1. Choose the right ACTIVITY CATEGORY per block (was all 'mission').
--   2. EVALUATION GATING: step_id (official STP rating) stays ONLY on water
--      missions + pool (the sequence parts actually worked in the water).
--      Removed from venue analysis, warm-ups, breathing, land/skate drills,
--      theory and routines — those are not graded as STPs (same rule as YB).
--
-- Content (titles, drills, missions, eval focus) is preserved; only block_type
-- and step_id change. Idempotent: re-running re-applies the same mapping.

WITH m(day_number, block_order, new_type) AS (VALUES
  -- Day 1
  (1,1,'custom'),(1,2,'custom'),(1,3,'custom'),(1,4,'venue_analysis'),(1,5,'warm_up'),
  (1,6,'water_mission'),(1,7,'water_mission'),(1,8,'water_mission'),(1,9,'land_drill'),(1,10,'custom'),
  -- Day 2
  (2,1,'mental'),(2,2,'warm_up'),(2,3,'land_drill'),(2,4,'venue_analysis'),
  (2,5,'water_mission'),(2,6,'water_mission'),(2,7,'land_drill'),(2,8,'land_drill'),(2,9,'custom'),
  -- Day 3
  (3,1,'mental'),(3,2,'mental'),(3,3,'warm_up'),(3,4,'venue_analysis'),
  (3,5,'water_mission'),(3,6,'theory'),(3,7,'water_mission'),(3,8,'custom'),
  -- Day 4
  (4,1,'warm_up'),(4,2,'mental'),(4,3,'venue_analysis'),(4,4,'water_mission'),
  (4,5,'theory'),(4,6,'land_drill'),(4,7,'custom'),
  -- Day 5
  (5,1,'mental'),(5,2,'warm_up'),(5,3,'land_drill'),(5,4,'venue_analysis'),
  (5,5,'water_mission'),(5,6,'theory'),(5,7,'water_mission'),(5,8,'custom'),
  -- Day 6
  (6,1,'venue_analysis'),(6,2,'warm_up'),(6,3,'custom'),(6,4,'theory'),
  (6,5,'water_mission'),(6,6,'custom'),(6,7,'custom'),(6,8,'evaluation'),(6,9,'custom')
)
UPDATE camp_template_blocks b
SET block_type = m.new_type,
    -- Keep the official STP rating only on water work; clear it everywhere else.
    step_id = CASE WHEN m.new_type = 'water_mission' THEN b.step_id ELSE NULL END
FROM m, camp_template_days d
WHERE b.template_day_id = d.id
  AND d.template_id = 'SVC-CAMP-BEG'
  AND d.day_number = m.day_number
  AND b.block_order = m.block_order;

-- Day 6 carries the WB Exit Test, like the YB camp's Day 6.
UPDATE camp_template_days
SET has_evaluation = true, evaluation_type = 'wb_exit_test'
WHERE template_id = 'SVC-CAMP-BEG' AND day_number = 6;
