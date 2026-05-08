-- 00021F PART 2/2 — Missions student-voice canon (Marcelo, 2026-05-08)
-- Source: WB_ALL_CONTENT_STUDENT_VOICE_v1_EN.md (parsed)
-- Idempotent: replaces mission descriptions with student-voice canon

BEGIN;

UPDATE drills_missions SET
  title = 'Exit 5 Rides via Prone Dismount',
  time_estimate = '8-12 min',
  reps_recommended = '5-8 dismounts',
  description_md = '## What to do

When ride is ending or wave is dissipating, execute the canonical prone dismount: grab rails, knees to chest, exit with body in controlled position. Stay with the board — never let go.

## Where

end of foam rides',
  success_criteria = ARRAY['You execute 5 dismounts without board loss, without injury, without panic. Smooth body-board separation.']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-014';

UPDATE drills_missions SET
  title = 'Pick Line and Stand 3 Times Intentionally',
  time_estimate = '8-15 min',
  reps_recommended = '3 successful intentional pop-ups',
  description_md = '## What to do

On 3 consecutive foam waves: enter cobra, scan for the line, verbalize aloud "I am going there" while still prone, then execute the pop-up keeping eyes locked on the chosen direction. Pop-up direction MUST match what you verbalized.

## Where

whitewater wave riding',
  success_criteria = ARRAY['3 of 3 pop-ups land in the direction you verbalized. Coach validates the visual lock was maintained throughout.']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-015';

UPDATE drills_missions SET
  title = 'Stand Up Three Clean Foam Waves',
  time_estimate = '15-20 min',
  reps_recommended = '3 successful pop-ups',
  description_md = '## What to do

Catch three foam waves and execute clean pop-ups: solid cobra → audible exhale → centered feet → hands release at the end. Ride straight to the beach in power stance. Apply the One Wave protocol: state intention before, answer 5 questions after.

## Where

waist-to-chest whitewater',
  success_criteria = ARRAY['3 of 3 pop-ups executed with: solid cobra, audible exhale, both feet centered, hands releasing only when stable. You articulate what worked and what didn''t per wave.']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-016';

UPDATE drills_missions SET
  title = 'Land in Position #2 on 5 Pop-Ups',
  time_estimate = '10-15 min',
  reps_recommended = '5 pop-ups with FP2 verification',
  description_md = '## What to do

On 5 pop-ups, focus exclusively on landing the back foot in Position #2 (canonical center position). Coach verifies foot landing position from outside the wave. You adjust in real time if needed.

## Where

whitewater rides',
  success_criteria = ARRAY['5 of 5 pop-ups land in FP2 verified by coach. You are aware of foot position.']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-017';

UPDATE drills_missions SET
  title = 'Hold Power Stance for 5 Seconds on 3 Rides',
  time_estimate = '10-15 min',
  reps_recommended = '3 sustained stances',
  description_md = '## What to do

On 3 different rides, after popping up successfully, hold the canonical power stance for at least 5 seconds: shoulders forward, weight forward, back knee compact, exhale active. Resist the urge to stiffen or look down.

## Where

foam rides ≥5 seconds',
  success_criteria = ARRAY['3 rides with verified power stance ≥5 seconds. Coach validates posture from outside.']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-018';

UPDATE drills_missions SET
  title = 'Generate Speed via Impulse on 3 Rides',
  time_estimate = '10-15 min',
  reps_recommended = '3 impulse generations',
  description_md = '## What to do

On 3 rides where the foam is slowing or wave power is dissipating, execute the canonical impulse: flex knees, touch toward water, push extension forward. Verify board accelerates.

## Where

rides where foam slows',
  success_criteria = ARRAY['3 rides where impulse demonstrably extended the ride duration. You feel the speed change.']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-019';

UPDATE drills_missions SET
  title = 'Exit 3 Rides Safely via Starfish Dismount',
  time_estimate = '5-10 min',
  reps_recommended = '3 starfish exits',
  description_md = '## What to do

On 3 rides where ride ends or balance is lost, execute the canonical starfish dismount: decide early, bend knees, open arms wide, fall back into foam, trust the foam to cushion. No diving. No panic.

## Where

end of standing rides',
  success_criteria = ARRAY['3 starfish exits without injury, without losing board, without diving headfirst. Body wide, calm, controlled fall.']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-020';

UPDATE drills_missions SET
  title = 'Execute 3 Backside Turns',
  time_estimate = '10-15 min',
  reps_recommended = '3 successful backside rail engagements',
  description_md = '## What to do

On 3 rides, execute a backside turn using the canonical chain: look → oblique → hip → heel-side rail. Board must respond to the rail engagement, not just drift.

## Where

rides with directional opportunity',
  success_criteria = ARRAY['3 turns where board directionally responded to rail input. Coach validates chain executed in order.']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-021';

UPDATE drills_missions SET
  title = 'Execute 3 Frontside Turns',
  time_estimate = '10-15 min',
  reps_recommended = '3 successful frontside rail engagements',
  description_md = '## What to do

On 3 rides, execute a frontside turn using the canonical chain: look → oblique → posture → front-side rail. Pressure stays connected throughout the turn.

## Where

rides with directional opportunity',
  success_criteria = ARRAY['3 turns where board directionally responded. Coach validates posture remained connected (no buckling).']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-022';

UPDATE drills_missions SET
  title = 'Paddle From Shore to Lineup Efficiently',
  time_estimate = '5-15 min depending on distance',
  reps_recommended = '1 sustained paddle out',
  description_md = '## What to do

Paddle from shore to the lineup using canonical efficient technique: sweet spot, alternating long strokes, elbow over ear, aerodynamic hand entry, body like an arrow. Switch gears as needed (gear 1-3).

## Where

shore to lineup',
  success_criteria = ARRAY['You reach the lineup with measurable energy reserve (you are not exhausted). Coach validates technique observed throughout.']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-023';

UPDATE drills_missions SET
  title = 'Pass Through 5 Foam Waves via Turtle Roll',
  time_estimate = '10-15 min',
  reps_recommended = '5 turtle rolls',
  description_md = '## What to do

When approaching foam while paddling out, execute 5 turtle rolls: align nose, grab rails, elbows on top of board, roll under just before foam impact, hold during turbulence, scissor kick + return to center, resume paddling. Never let go of the board.

## Where

whitewater zone',
  success_criteria = ARRAY['5 rolls executed without board loss, without panic, with full recovery to paddling each time.']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-024';

UPDATE drills_missions SET
  title = 'Direct Prone Position 6 Times (3 each side)',
  time_estimate = '8-12 min',
  reps_recommended = '3 left + 3 right direction changes',
  description_md = '## What to do

In prone position, execute 6 directional changes: 3 left and 3 right. Use any of the 3 canonical modes (one-side paddling, circular hand motion, or seated pivot). Stay ready to paddle.

## Where

lineup or paddle area',
  success_criteria = ARRAY['6 successful direction changes. Each one is intentional, controlled, and ready-to-resume-paddling at the end.']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-025';

COMMIT;

-- Verification
SELECT id, title, LENGTH(description_md) AS desc_len
FROM drills_missions WHERE type='mission' AND id LIKE 'MIS-WB-%' ORDER BY id;
