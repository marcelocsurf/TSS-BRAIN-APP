-- 00021E PART 2/2 — Insert 12 missions (MIS-WB-014 to MIS-WB-025)
-- Source: 07_WB_MISSIONS_canon.md
-- Run AFTER part 1.

BEGIN;

INSERT INTO drills_missions (
  id, step_id, title, type, time_estimate, reps_recommended,
  description_md, success_criteria, belt, display_order, active
) VALUES
(
  'MIS-WB-014', 'STP-014', 'Exit 5 Rides via Prone Dismount', 'mission',
  '8-12 min', '5-8 dismounts',
  'When ride is ending or wave is dissipating, execute the canonical prone dismount: grab rails, knees to chest, exit with body in controlled position. Stay with the board — never let go.',
  ARRAY['5 dismounts executed without board loss, without injury, without panic. Smooth body-board separation.']::TEXT[],
  'white', 114, TRUE
),
(
  'MIS-WB-015', 'STP-015', 'Pick Line and Stand 3 Times Intentionally', 'mission',
  '8-15 min', '3 successful intentional pop-ups',
  'On 3 consecutive foam waves: enter cobra, scan for the line, verbalize aloud "I am going there" while still prone, then execute the pop-up keeping eyes locked on the chosen direction. Pop-up direction MUST match what was verbalized.',
  ARRAY['3 of 3 pop-ups land in the direction student verbalized. Coach validates the visual lock was maintained throughout.']::TEXT[],
  'white', 115, TRUE
),
(
  'MIS-WB-016', 'STP-016', 'Stand Up Three Clean Foam Waves', 'mission',
  '15-20 min', '3 successful pop-ups',
  'Catch three foam waves and execute clean pop-ups: solid cobra → audible exhale → centered feet → hands release at the end. Ride straight to the beach in power stance. Apply One Wave protocol: state intention before, answer 5 questions after.',
  ARRAY['3 of 3 pop-ups executed with: solid cobra, audible exhale, both feet centered, hands releasing only when stable. Student articulates what worked and what didn''t per wave.']::TEXT[],
  'white', 116, TRUE
),
(
  'MIS-WB-017', 'STP-017', 'Land in Position #2 on 5 Pop-Ups', 'mission',
  '10-15 min', '5 pop-ups with FP2 verification',
  'On 5 pop-ups, focus exclusively on landing the back foot in Position #2 (canonical center position). Coach verifies foot landing position from outside the wave. Student adjusts in real time if needed.',
  ARRAY['5 of 5 pop-ups landing in FP2 verified by coach. Student aware of foot position.']::TEXT[],
  'white', 117, TRUE
),
(
  'MIS-WB-018', 'STP-018', 'Hold Power Stance for 5 Seconds on 3 Rides', 'mission',
  '10-15 min', '3 sustained stances',
  'On 3 different rides, after popping up successfully, hold the canonical power stance for at least 5 seconds: shoulders forward, weight forward, back knee compact, exhale active. Resist the urge to stiffen or look down.',
  ARRAY['3 rides with verified power stance ≥5 seconds. Coach validates posture from outside.']::TEXT[],
  'white', 118, TRUE
),
(
  'MIS-WB-019', 'STP-019', 'Generate Speed via Impulse on 3 Rides', 'mission',
  '10-15 min', '3 impulse generations',
  'On 3 rides where the foam is slowing or wave power is dissipating, execute the canonical impulse: flex knees, touch toward water, push extension forward. Verify board accelerates.',
  ARRAY['3 rides where impulse demonstrably extended the ride duration. Student feels the speed change.']::TEXT[],
  'white', 119, TRUE
),
(
  'MIS-WB-020', 'STP-020', 'Exit 3 Rides Safely via Starfish Dismount', 'mission',
  '5-10 min', '3 starfish exits',
  'On 3 rides where ride ends or balance is lost, execute the canonical starfish dismount: decide early, bend knees, open arms wide, fall back into foam, trust the foam to cushion. No diving. No panic.',
  ARRAY['3 starfish exits without injury, without losing board, without diving headfirst. Body wide, calm, controlled fall.']::TEXT[],
  'white', 120, TRUE
),
(
  'MIS-WB-021', 'STP-021', 'Execute 3 Backside Turns', 'mission',
  '10-15 min', '3 successful backside rail engagements',
  'On 3 rides, execute a backside turn using the canonical chain: look → oblique → hip → heel-side rail. Board must respond to the rail engagement, not just drift.',
  ARRAY['3 turns where board directionally responded to rail input. Coach validates chain executed in order.']::TEXT[],
  'white', 121, TRUE
),
(
  'MIS-WB-022', 'STP-022', 'Execute 3 Frontside Turns', 'mission',
  '10-15 min', '3 successful frontside rail engagements',
  'On 3 rides, execute a frontside turn using the canonical chain: look → oblique → posture → front-side rail. Pressure stays connected throughout the turn.',
  ARRAY['3 turns where board directionally responded. Coach validates posture remained connected (no buckling).']::TEXT[],
  'white', 122, TRUE
),
(
  'MIS-WB-023', 'STP-023', 'Paddle From Shore to Lineup Efficiently', 'mission',
  '5-15 min depending on distance', '1 sustained paddle out',
  'Paddle from shore to the lineup using canonical efficient technique: sweet spot, alternating long strokes, elbow over ear, aerodynamic hand entry, body like an arrow. Switch gears as needed (gear 1-3).',
  ARRAY['Lineup reached with measurable energy reserve (student is not exhausted). Coach validates technique observed throughout.']::TEXT[],
  'white', 123, TRUE
),
(
  'MIS-WB-024', 'STP-024', 'Pass Through 5 Foam Waves via Turtle Roll', 'mission',
  '10-15 min', '5 turtle rolls',
  'When approaching foam while paddling out, execute 5 turtle rolls: align nose, grab rails, elbows on top of board, roll under just before foam impact, hold during turbulence, scissor kick + return to center, resume paddling. Never let go of the board.',
  ARRAY['5 rolls executed without board loss, without panic, with full recovery to paddling each time.']::TEXT[],
  'white', 124, TRUE
),
(
  'MIS-WB-025', 'STP-025', 'Direct Prone Position 6 Times (3 each side)', 'mission',
  '8-12 min', '3 left + 3 right direction changes',
  'In prone position, execute 6 directional changes: 3 left and 3 right. Use any of the 3 canonical modes (one-side paddling, circular hand motion, or seated pivot). Stay ready to paddle.',
  ARRAY['6 successful direction changes. Each one is intentional, controlled, and ready-to-resume-paddling at the end.']::TEXT[],
  'white', 125, TRUE
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description_md = EXCLUDED.description_md,
  success_criteria = EXCLUDED.success_criteria,
  type = 'mission',
  active = TRUE;

COMMIT;

-- Verification (run separately)
SELECT
  type,
  COUNT(*) AS count
FROM drills_missions
WHERE active = TRUE
GROUP BY type
ORDER BY type;
-- Expected: drill = 25, mission = 25
