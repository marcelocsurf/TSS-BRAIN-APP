-- 00021F PART 1/2 — Missions student-voice canon (Marcelo, 2026-05-08)
-- Source: WB_ALL_CONTENT_STUDENT_VOICE_v1_EN.md (parsed)
-- Idempotent: replaces mission descriptions with student-voice canon

BEGIN;

UPDATE drills_missions SET
  title = 'Read Today''s Spot',
  time_estimate = '5-10 min',
  reps_recommended = '1 complete venue analysis',
  description_md = '## What to do

Standing on the beach with full view of the surf zone, perform a complete VCA-6 venue analysis aloud. Identify break type, wave direction, entry and exit zones, hazards, tide and wind state, and level fit. End with a verbal go/no-go decision and session plan.

## Where

beach observation point',
  success_criteria = ARRAY['Your coach validates that all 6 VCA elements are addressed AND your go/no-go decision is justified.']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-001';

UPDATE drills_missions SET
  title = 'Execute Full Surfing Warm Up Before Session',
  time_estimate = '8-12 min',
  reps_recommended = '1 complete flow',
  description_md = '## What to do

Before any water session, execute the complete TSS Warm Up flow: 4 segments — mobility, activation, simulation, breath. No interruptions. Body and mind transitioned from rest to ready.

## Where

sand',
  success_criteria = ARRAY['You demonstrate all 4 segments fluidly and report being in "active calm" state at the end.']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-002';

UPDATE drills_missions SET
  title = 'Carry Board From Rack to Water Edge',
  time_estimate = '2-3 min',
  reps_recommended = '1 complete carry',
  description_md = '## What to do

Pick up the board safely with proper rail grip and body mechanics. Carry it to the water edge maintaining control. No dragging the fins. No swinging the board near others.

## Where

sand path from rack to water',
  success_criteria = ARRAY['Your coach validates: clean lift, both hands on rails, controlled carry, safe distance from others, board placed gently at water edge.']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-003';

UPDATE drills_missions SET
  title = 'Walk Out to Waist-Deep Without Losing Control',
  time_estimate = '3-5 min',
  reps_recommended = '1 controlled entry',
  description_md = '## What to do

Enter the water with the board on your side. Drag your feet on the sand bottom (avoid stingrays / rocks). Maintain board angle to oncoming foam. Reach waist-deep position ready to mount.

## Where

shoreline to waist-deep',
  success_criteria = ARRAY['You arrive at waist-deep without losing the board, getting hit by foam, slipping on rocks, or panicking. Composure intact.']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-004';

UPDATE drills_missions SET
  title = 'Place Board for Sweet Spot Mounting',
  time_estimate = '1-2 min',
  reps_recommended = '5-8 placements',
  description_md = '## What to do

In waist-deep water, place the board in front of you parallel to incoming waves. Lower it gently (no slap). Release with fingers ready to grab if foam pushes it. Board is ready for mounting.

## Where

waist-deep water',
  success_criteria = ARRAY['You place the board correctly with 5-8 successful releases — no loss of board to whitewater.']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-005';

UPDATE drills_missions SET
  title = 'Manage Board Through Three Foam Lines',
  time_estimate = '5-10 min',
  reps_recommended = '5-8 foam encounters',
  description_md = '## What to do

Stand in waist-deep water with the board. As foam comes, control the tail and rails to keep the board pointing into the wave. Allow 3 foam lines to pass while maintaining board control. No board loss.

## Where

waist-deep whitewater',
  success_criteria = ARRAY['You navigate 3 foam lines without losing board control. Board never sideways to wave.']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-006';

UPDATE drills_missions SET
  title = 'Pass Through Five Foam Waves Standing',
  time_estimate = '8-12 min',
  reps_recommended = '5-8 passages',
  description_md = '## What to do

Standing in waist-deep water with board pointed straight at incoming foam, execute the canonical passage technique. Press, lift, pass — without losing board or balance.

## Where

whitewater',
  success_criteria = ARRAY['You complete 5 successful clean passages. Board stays connected. You remain balanced and progressing forward.']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-007';

UPDATE drills_missions SET
  title = 'Turn Around Safely 5 Times',
  time_estimate = '5-8 min',
  reps_recommended = '5 controlled turns',
  description_md = '## What to do

Execute the 180-degree pivot turn in the water keeping the board between you and the open water (never between you and the wave). Practice intentional rotation with no loose board.

## Where

waist-deep water',
  success_criteria = ARRAY['You complete 5 turns cleanly with board controlled and never positioned dangerously. Body always between board and shore.']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-008';

UPDATE drills_missions SET
  title = 'Safe Return From Waist-Deep to Sand',
  time_estimate = '3-5 min',
  reps_recommended = '1 full return',
  description_md = '## What to do

After your session, return to the sand with full awareness. Walk backwards facing the waves, board to the side, monitoring incoming foam. Adjust position if foam approaches. Land safely on sand.

## Where

water to sand',
  success_criteria = ARRAY['You execute the return without losing the board, getting hit from behind, falling, or panicking. Composed all the way.']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-009';

UPDATE drills_missions SET
  title = 'Mount Board on Sweet Spot 5 Times',
  time_estimate = '5-8 min',
  reps_recommended = '5-8 mounts',
  description_md = '## What to do

In foam zone, mount the board prone in your sweet spot — nose barely floating, tail just submerged. Body centered. Ready to paddle. Repeat 5-8 times until automatic.

## Where

whitewater area, prone',
  success_criteria = ARRAY['Board floats level on each mount. Coach validates sweet spot position. You feel the board "ready" not "fighting back."']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-010';

UPDATE drills_missions SET
  title = 'Align With Five Incoming Foam Waves',
  time_estimate = '5-8 min',
  reps_recommended = '5-8 alignments',
  description_md = '## What to do

In sweet spot, when foam approaches, align nose toward the direction the foam is going. Look over shoulder to verify alignment before paddling.

## Where

foam zone',
  success_criteria = ARRAY['You execute 5 alignments correctly BEFORE paddling. Shoulder check performed each time.']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-011';

UPDATE drills_missions SET
  title = 'Catch Five Foam Waves By Paddling',
  time_estimate = '10-15 min',
  reps_recommended = '5-10 wave attempts',
  description_md = '## What to do

When foam approaches, paddle aggressively (long strokes, one-two cadence) to match foam speed. Start early, commit, never stop until you feel the board accelerate with the wave.

## Where

foam zone',
  success_criteria = ARRAY['You catch 5 waves with proper paddle technique (no late starts, no early stops). Coach validates body angle and forward push.']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-012';

UPDATE drills_missions SET
  title = 'Direct Board Left and Right From Cobra',
  time_estimate = '8-12 min',
  reps_recommended = '5 lefts + 5 rights',
  description_md = '## What to do

Once on a foam wave in cobra, intentionally direct the board left or right by pressing the rail with your hands and looking in that direction. Execute 5 left turns and 5 right turns across multiple waves.

## Where

foam ride',
  success_criteria = ARRAY['Board responds intentionally. Direction matches your pre-stated intention each time. No accidental drift.']::TEXT[],
  type = 'mission',
  active = TRUE
WHERE id = 'MIS-WB-013';

COMMIT;
