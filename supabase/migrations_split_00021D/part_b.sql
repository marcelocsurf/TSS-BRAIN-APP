-- 00021D PART 2/3 — Drills student-voice canon (Marcelo, 2026-05-08)
-- Source: WB_DRILLS_STUDENT_VOICE_v1_EN.json
-- Idempotent: replaces existing drill content with student-voice canon

BEGIN;

UPDATE drills_missions SET
  title = 'Sweet Spot Discovery Drill',
  time_estimate = '8-12 min',
  reps_recommended = '5-8 mounts',
  description_md = '## What you''ll train

You learn to mount your board prone in the exact "sweet spot" — the position where the nose barely floats and the tail is just submerged. This is where the board becomes ready to paddle, not fighting you.

## What you need before

Calm whitewater area, you on the board prone, soft-top.

## How to execute it

- Step 1 — Mount the board. Lie down prone on the board with your chest centered.

- Step 2 — Slide forward or backward. Find the position where the nose of the board is just barely above the water — no submerging, no popping up too high.

- Step 3 — Confirm chest position. Your chest should be slightly forward of center. Your feet should be together near the tail.

- Step 4 — Test the level. The board should float level. The tail should be just slightly submerged (you should not see it above water).

- Step 5 — Be ready. From this position, you are ready to paddle. Repeat 5-8 mounts until you find the sweet spot automatically.',
  success_criteria = ARRAY['The board floats level with you on it — not nose-up, not nose-down.',
    'Your coach confirms the sweet spot is correct each time.',
    'The board feels "ready" not "fighting back" against you.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-10';

UPDATE drills_missions SET
  title = 'Whitewater Alignment Drill',
  time_estimate = '5-10 min',
  reps_recommended = '5-8 alignments',
  description_md = '## What you''ll train

You learn to align the nose of your board with incoming foam BEFORE you start paddling. Misalignment = wasted paddle and missed wave.

## What you need before

You prone on your board in the foam zone, in your sweet spot.

## How to execute it

- Step 1 — Stay in your sweet spot. Confirm chest position is correct (from STP-010).

- Step 2 — See the foam approach. Watch the incoming foam. Notice the direction it is going.

- Step 3 — Look over your shoulder. Quick shoulder check to verify your alignment with the foam.

- Step 4 — Align the nose. Use your hands and small kicks to point the nose in the direction the foam is moving (toward shore, slightly angled if needed).

- Step 5 — Be ready to paddle. Once aligned, you are ready to start the paddle. Repeat 5-8 times.',
  success_criteria = ARRAY['You complete a shoulder check BEFORE starting to paddle, every time.',
    'Your nose is aligned with the foam direction in 5 of 5 attempts.',
    'You do not start paddling until alignment is confirmed.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-11';

UPDATE drills_missions SET
  title = 'Whitewater Catch Paddle Drill',
  time_estimate = '10-15 min',
  reps_recommended = '5-10 wave attempts',
  description_md = '## What you''ll train

You learn to paddle aggressively to catch foam waves. Long strokes, one-two cadence, start early, commit until the board accelerates with the wave.

## What you need before

You prone in your sweet spot in the foam zone, aligned with incoming foam.

## How to execute it

- Step 1 — Distance. Start your paddle when the foam is at the right distance — early enough that you have time to match its speed, not so early that you tire out.

- Step 2 — Start. The first stroke is committed. No half-strokes.

- Step 3 — One-two cadence. Long, clean strokes — left-right-left-right. Pull water back, push body forward.

- Step 4 — Forward push. Each stroke pushes the board forward, not down. Hands enter the water in front, exit at the hip.

- Step 5 — Commit. Don''t stop paddling until you feel the board accelerate with the wave. That is the moment you have caught it.

- Repeat 5-10 times. Goal: 5 successful catches.',
  success_criteria = ARRAY['You start your paddle early enough — no late starts.',
    'You don''t stop paddling before the board accelerates.',
    'You catch 5 of 10 foam waves cleanly with proper paddle technique.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-12';

UPDATE drills_missions SET
  title = 'Cobra Rail Control Drill',
  time_estimate = '8-12 min',
  reps_recommended = '5 lefts + 5 rights',
  description_md = '## What you''ll train

You learn to direct the board left or right while riding prone in cobra position — using rail pressure with your hands and visual lead with your eyes.

## What you need before

You riding a foam wave in cobra position (chest up, hands at ribs).

## How to execute it

- Step 1 — Hands at ribs. Confirm cobra position: hands placed at rib height on the board, chest lifted, eyes forward.

- Step 2 — Chest up. Keep your chest elevated — this is what makes the board responsive to direction.

- Step 3 — Eyes lead. Look in the direction you want to go (left or right). Your body follows your eyes.

- Step 4 — Press the rail. Press down with one hand on the rail of the side you want to turn toward. The rail engages and the board changes direction.

- Step 5 — Steer with intention. The combination of eyes + chest + rail pressure makes the board respond. Practice 5 lefts and 5 rights across multiple waves.',
  success_criteria = ARRAY['The board responds to your direction every time — no accidental drift.',
    'Direction matches your pre-stated intention (you said "left" before you did it).',
    'You can do 5 left and 5 right turns intentionally.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-13';

UPDATE drills_missions SET
  title = 'Prone Dismount Safety Drill',
  time_estimate = '10-15 min',
  reps_recommended = '5-8 dismounts',
  description_md = '## What you''ll train

You learn to exit a prone ride safely — without losing the board, hurting yourself, or panicking. The leash holds the board, but you should never trust the leash alone.

## What you need before

You riding prone on a foam wave that is ending, or near the shore.

## How to execute it

- Phase 1 — Dry demo (3 reps). Watch your coach simulate the dismount on a board on sand. Note the hand position on the rails and the body movement.

- Phase 2 — Calm water (5 reps). Practice the dismount from a floating board without a wave. Slow motion.

- Phase 3 — After ride (5-8 reps). At the end of a real foam ride: decide moment, grab both rails firmly, shift your weight back, rotate your body, land on your side or back in the water — never face-first.',
  success_criteria = ARRAY['You exit 5 rides without losing the board.',
    'You never let go of the rails until you are stable in the water.',
    'You don''t dive headfirst — you land controlled.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-14';

UPDATE drills_missions SET
  title = 'Cobra Pick Line Drill',
  time_estimate = '10-15 min',
  reps_recommended = '5 reps per phase',
  description_md = '## What you''ll train

You learn to pick your line — the direction you want to go on the wave — BEFORE you stand up. You use the cobra position not just to prepare your body but to LOOK ahead, decide, and lock your eyes on the line you have chosen.

## What you need before

You on the board, first on sand for simulation, then in water for live execution.

## How to execute it

- Phase 1 — Dry simulation (5 reps). Lie on your board on sand in cobra position. Your coach points to a target on the horizon. You verbalize "I am going there" while still in cobra. Then simulate the pop-up keeping your eyes locked on the target.

- Phase 2 — Static water (5 reps). Same exercise in waist-deep calm water on a floating board. Practice the visual lock and verbal commit before any pop-up movement.

- Phase 3 — Live with foam (5 reps). Catch a whitewater wave, enter cobra, scan for your line, verbalize the commit ("I am going right" or "I am going left"), then execute the pop-up. Your direction must match what you said.',
  success_criteria = ARRAY['You verbalize the chosen direction while still in cobra, before initiating the pop-up.',
    'Your eyes stay locked on the chosen direction throughout the pop-up — you don''t look down.',
    'Your pop-up direction matches what you said. The line is intentional, not accidental.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-15';

UPDATE drills_missions SET
  title = '2-Second Pop-Up Connection Drill',
  time_estimate = '15-20 min',
  reps_recommended = '5 reps per phase',
  description_md = '## What you''ll train

You learn to execute the pop-up in approximately 2 seconds, from cobra to standing, with: solid cobra, audible exhale, centered feet landing, and hands releasing only when stable. This is the moment you become a surfer.

## What you need before

You on the board, first on sand, then on calm water, then in foam. You should be solid on STPs 010-014 first.

## How to execute it

- Phase 1 — Dry demo (5 reps). Lie prone on the board on sand. Walk through the sequence slowly with your coach: "Solid cobra. Audible exhale. Feet land centered. Hands release when stable." Repeat 5 times slow.

- Phase 2 — Sand at full speed (5 reps). Same exercise but at real speed — about 2 seconds total. The body learns the pattern.

- Phase 3 — Live with foam (5 reps). On a foam wave: enter cobra, exhale on the lift, both feet land centered (not back foot first), keep your hands on the rails until you are centered and stable, then release. One correction per rep.',
  success_criteria = ARRAY['You build a correct cobra first, with hands at rib height and eyes looking forward.',
    'You place your feet in the correct position and the movement looks smooth, not forced.',
    'You maintain connection with the board and release your hands only when centered and in control.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-16';

UPDATE drills_missions SET
  title = 'Feet Position FP2 Drill',
  time_estimate = '8-12 min',
  reps_recommended = '5-8 pop-ups',
  description_md = '## What you''ll train

You learn to land your back foot in Position #2 (FP2) — the canonical center back-foot position — on every pop-up. Wrong foot position = no power, no control.

## What you need before

You catching foam waves and executing pop-ups (you should be solid on STP-016 first).

## How to execute it

- Step 1 — Pop up cleanly. Use the canonical pop-up sequence (cobra → exhale → feet → connect).

- Step 2 — Focus on the back foot. As you stand, focus exclusively on where your back foot lands.

- Step 3 — FP2 reference. Back foot lands centered on the rails (not on rail, not off-center), in the back third of the board, perpendicular to the stringer.

- Step 4 — Feel the connection. When FP2 is correct, the board feels "connected" — you can apply pressure and the board responds.

- Step 5 — Coach verifies. From outside the wave, coach confirms FP2 placement on each rep.

- Repeat 5-8 pop-ups, focused only on FP2.',
  success_criteria = ARRAY['Your back foot lands in FP2 (centered, back third, perpendicular) on 5 of 5 pop-ups.',
    'Coach validates from outside that the position is correct.',
    'You feel the board respond to your pressure when FP2 is right.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-17';

COMMIT;
