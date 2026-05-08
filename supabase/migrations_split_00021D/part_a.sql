-- 00021D PART 1/3 — Drills student-voice canon (Marcelo, 2026-05-08)
-- Source: WB_DRILLS_STUDENT_VOICE_v1_EN.json
-- Idempotent: replaces existing drill content with student-voice canon

BEGIN;

UPDATE drills_missions SET
  title = 'Venue Analysis Map Drill',
  time_estimate = '8-12 min',
  reps_recommended = '1 complete analysis',
  description_md = '## What you''ll train

You learn to read the spot before entering the water and build a clear mental map of the zone. By the end, you can make a basic safety + planning decision based on what you actually see (not what you assume).

## What you need before

A beach with full view of the surf zone. Ideally an elevated observation point (dune, path, or standing on sand). Optional: something to draw on (sand, whiteboard, notebook), or just point with your fingers.

## How to execute it

- Step 1 — Find your reference. Look around: identify a fixed land reference (palm tree, building, rock) AND one outside reference (a boat, marker, headland) so you can track if the current is dragging you later.

- Step 2 — Read the conditions. Ask yourself out loud: What size are the waves? How does the tide look? How is the ocean behaving today?

- Step 3 — Map the surf zone. Identify: the safe zone, the impact zone, the entry point, the exit point, the area where you intend to surf.

- Step 4 — Identify hazards. Name them and point to them: currents, crowd, obstacles, bottom changes, anything that increases risk.

- Step 5 — Add outside reference points. Pick at least one outside reference so you can notice if the current pushes you off your spot.

- Step 6 — Make the go/no-go decision. Ask: Are these conditions appropriate for my level today? Yes or no? Why?

- Step 7 — State your session plan. Out loud, finish with something specific: "Today I will practice ______ in the safe zone."',
  success_criteria = ARRAY['You can describe the day''s general conditions and clearly identify the safe zone.',
    'You recognize the impact zone and point out the main hazards and currents.',
    'You explain your entry/exit points and state whether conditions match your level, with a simple session plan.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-01';

UPDATE drills_missions SET
  title = 'TSS Warm Up Flow',
  time_estimate = '8-12 min',
  reps_recommended = '1 complete flow',
  description_md = '## What you''ll train

You learn to transition your body and mind from rest to ready before every session. The warm-up is not generic — it is surf-specific. Joints get mobilized, key muscles activate, you rehearse surfing patterns on land, and your breath connects mind to body.

## What you need before

A space on sand or ground with room to move. Your board nearby (for the simulation phase). Comfortable clothes. About 8-12 minutes.

## How to execute it

- Phase 1 — Mobility (2-3 min). Move all major joints through their range: ankles, hips, spine, shoulders, neck. Slow, controlled, with awareness.

- Phase 2 — Activation (2-3 min). Wake up the key surfing muscles: glutes, core, obliques, scapulae. Light dynamic exercises (10 reps each).

- Phase 3 — Simulation (2-3 min). Rehearse surfing movements on land: pop-up simulations, posture holds, rotation. Get your body into the patterns it will need in the water.

- Phase 4 — Breath + Focus (1-2 min). Slow nasal breathing, eyes closed. Connect your awareness to your body. State your session goal mentally before opening your eyes.',
  success_criteria = ARRAY['Your body feels active, available, and warm — not stiff or asleep.',
    'You feel mentally focused and present, not scattered.',
    'You can repeat the flow without instruction next session.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-02';

UPDATE drills_missions SET
  title = 'Grab Board Reset Drill',
  time_estimate = '5-8 min',
  reps_recommended = '8 reps × 3 phases',
  description_md = '## What you''ll train

You learn to pick up the board safely and carry it under control. Proper lifting mechanics protect your back, your fingers, and prevent the board from hitting other people on the beach.

## What you need before

Your soft-top board on the sand. Open beach space with no other surfers within board-swing radius.

## How to execute it

- Phase 1 — Slow demonstration (3 reps). Watch your coach demonstrate the lift on sand. Then mirror it slowly: stand centered, knees bent, hands on the rails (not deck), lift with legs not back, carry with the board on your side.

- Phase 2 — Full speed (8 reps). Repeat the lift at normal pace. Coach watches your hand placement, posture, and carry position.

- Phase 3 — Carry test (6 reps). Walk 10 meters with the board carrying it correctly. Set it down gently. Pick it up again. Repeat without dropping or swinging.',
  success_criteria = ARRAY['You lift the board with both hands on the rails, knees bent, back straight.',
    'You carry the board by your side with control — not over your head, not dragging.',
    'You set the board down gently without slap or impact.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-03';

UPDATE drills_missions SET
  title = 'Walk Out Sand Entry Drill',
  time_estimate = '10-15 min',
  reps_recommended = '5 entries',
  description_md = '## What you''ll train

You learn to enter the water with the board under control, manage incoming foam without losing the board, and reach the right depth to mount.

## What you need before

Soft-top board, leash attached, beach with manageable whitewater. Water at least waist-deep at your destination point.

## How to execute it

- Step 1 — Patience at the shoreline. Watch the foam pattern for 15-30 seconds before entering. Identify the lulls.

- Step 2 — Drag your feet. As you walk in, drag your feet on the sand bottom. This protects against stingrays and helps you feel obstacles.

- Step 3 — Board to the side. Carry the board on your side (not in front, not behind). One hand on the rail near the nose, one hand near the tail.

- Step 4 — Face the foam. Always keep the nose of the board pointed at the incoming foam. Never let the board go sideways to a wave.

- Step 5 — Place at depth. When you reach waist-to-chest depth, you are ready to put the board in the water (next step, STP-005).

- Repeat 5 times — entry, walk out, return to shore, repeat.',
  success_criteria = ARRAY['You enter without losing the board, getting hit by foam, or slipping on rocks.',
    'You arrive at waist-deep with the board still in your hand and your composure intact.',
    'You waited for a lull before entering, not a set.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-04';

UPDATE drills_missions SET
  title = 'Waist Deep Placement Drill',
  time_estimate = '8-12 min',
  reps_recommended = '5-8 placements',
  description_md = '## What you''ll train

You learn to place the board on the water surface so it floats parallel to incoming waves and is ready for you to mount. A bad placement loses the board to the next foam.

## What you need before

Soft-top board, you in waist-deep water, calm enough to practice without urgency.

## How to execute it

- Step 1 — Reach the right depth. Make sure water is at your waist or just above.

- Step 2 — Pause and read. Look toward the incoming waves. Wait for a calm moment between sets.

- Step 3 — Lower the board gently. Place the board on the water with both hands on the rails, parallel to incoming waves. No slap, no drop.

- Step 4 — Release with intention. Let go of the board with your fingers ready to grab the rail again instantly if needed.

- Step 5 — Stay ready. The board now floats. You are next to it, ready to mount. If foam comes, your hands grab the rails immediately.

- Repeat 5-8 times. Your goal: never lose the board to whitewater during placement.',
  success_criteria = ARRAY['The board enters the water gently — no slap.',
    'You release the board only when it is stable and parallel to the waves.',
    'You complete 5-8 placements without losing the board to foam.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-05';

UPDATE drills_missions SET
  title = 'Tail Center Control Drill',
  time_estimate = '5-10 min',
  reps_recommended = '5-8 foam encounters',
  description_md = '## What you''ll train

You learn to control the board while standing in waist-deep water with foam coming at you. Tail control + body position keep the board pointing into the wave so it doesn''t become a projectile.

## What you need before

You standing in waist-deep water. Soft-top board in front of you, parallel to incoming foam.

## How to execute it

- Step 1 — Position. Stand behind your board, body between the board and the shore. Both hands on the rails near the tail.

- Step 2 — Watch the foam. Foam is approaching. Keep the nose pointed at the foam.

- Step 3 — Press down on the tail. As the foam reaches the nose, push the tail down. The nose lifts slightly, the foam passes underneath.

- Step 4 — Pivot if needed. If the board starts to go sideways, use your body and tail pressure to bring the nose back to face the foam.

- Step 5 — Maintain composure. The board should never come loose from your hands. Repeat for 5-8 foam encounters.',
  success_criteria = ARRAY['The nose of your board is always pointed into the foam, never sideways.',
    'You pass 5-8 foam waves without losing board control.',
    'Your body stays between the board and the shore at all times.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-06';

UPDATE drills_missions SET
  title = 'Whitewater Passage Drill',
  time_estimate = '15-20 min',
  reps_recommended = '5-8 passages',
  description_md = '## What you''ll train

You learn to pass through whitewater while standing — maintaining compact posture, hand pressure on the board, and forward stability through the impact.

## What you need before

Whitewater zone, waist-deep water, consistent foam. Your soft-top board.

## How to execute it

- Phase 1 — Dry demo (3 reps). Watch your coach demonstrate compact posture and pressure mechanics on the board on sand. Mirror the body position.

- Phase 2 — Calm water (3 reps). In waist-deep water without a wave, push the board forward while standing. Practice your arm and hand position.

- Phase 3 — Whitewater (5-8 reps). Face the incoming foam with your board nose pointed at it. As the foam arrives: align, wait, press the tail down, lift the nose, let the foam pass under, push forward through. One correction per rep from the coach.',
  success_criteria = ARRAY['You pass through 5 foam waves without losing the board or your balance.',
    'The board stays connected to you through every passage.',
    'You progress forward (not backward) after each foam wave.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-07';

UPDATE drills_missions SET
  title = 'Safe Pivot Turn Drill',
  time_estimate = '10-15 min',
  reps_recommended = '5 reps each phase',
  description_md = '## What you''ll train

You learn to turn the board safely — keeping your body between the wave and the board so the board never hits you or others.

## What you need before

Waist-deep water, calm or small whitewater. Soft-top board.

## How to execute it

- Phase 1 — Dry demo (3 reps). Watch your coach demonstrate the board rotation with pivot point and body position on sand. Mirror it slowly.

- Phase 2 — Calm water (5 reps). In waist-deep water without a wave, practice the pivot turn: rotate the board 180° while keeping your body between the board and the open water side.

- Phase 3 — With small whitewater (5 reps). After passing a foam wave, execute the complete pivot turn so you are now facing back toward the lineup, ready to paddle out again.',
  success_criteria = ARRAY['You execute 5 turns with the board controlled and never positioned dangerously.',
    'Your body stays between the board and the shore at all times.',
    'You finish each turn ready to paddle, not scrambling.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-08';

UPDATE drills_missions SET
  title = 'Safe Return Drill',
  time_estimate = '5-10 min',
  reps_recommended = '1 full return',
  description_md = '## What you''ll train

You learn to return from waist-deep water to the sand safely — facing the waves, monitoring foam, and adjusting your position if a wave approaches.

## What you need before

You in waist-deep water with your board, ready to exit the water back to the sand.

## How to execute it

- Step 1 — Look back. Before walking toward the sand, look behind you (over your shoulder) to see what is approaching.

- Step 2 — Read the foam. Identify if you can walk in calmly or if you need to wait for a foam to pass.

- Step 3 — Walk steady. Keep the board to your side, body angled to face partly toward the waves. Drag your feet on the sand bottom.

- Step 4 — Adjust if needed. If foam approaches mid-walk, stop, brace, let it pass — then continue.

- Step 5 — Land safely. Reach the dry sand without stumbling, falling, or getting hit from behind.',
  success_criteria = ARRAY['You return to the sand without losing the board or getting hit by a wave from behind.',
    'You stayed alert — looking back, reading the foam — for the entire return.',
    'You arrive composed and in control, not panicking.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-09';

COMMIT;
