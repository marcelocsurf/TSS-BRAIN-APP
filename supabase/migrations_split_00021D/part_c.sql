-- 00021D PART 3/3 — Drills student-voice canon (Marcelo, 2026-05-08)
-- Source: WB_DRILLS_STUDENT_VOICE_v1_EN.json
-- Idempotent: replaces existing drill content with student-voice canon

BEGIN;

UPDATE drills_missions SET
  title = 'Power Stance Arrows Drill',
  time_estimate = '10-15 min',
  reps_recommended = '3-5 reps + 5-8 sustained stances',
  description_md = '## What you''ll train

You learn to hold the canonical power stance — shoulders forward, weight forward, back knee compact, exhale active — for the duration of a ride. Power stance = the foundation of everything that comes next.

## What you need before

You on a foam wave for at least 5 seconds (shorter rides don''t give time to lock the stance).

## How to execute it

- Phase 1 — Dry simulation (3-5 reps). Coach draws arrows on the sand showing the body lines: shoulders forward, weight forward, back knee compact. You stand on a stationary board on sand and hold the position.

- Phase 2 — Live ride (5-8 reps). After your pop-up, immediately settle into the power stance. Hold it for at least 5 seconds without stiffening. Let the breath stay active.

- Phase 3 — Coach calls. Coach calls out "shoulders forward" or "weight forward" or "knee compact" if you drift. You correct in real time.',
  success_criteria = ARRAY['You hold the power stance for at least 5 seconds on 3 different rides.',
    'Coach validates from outside — shoulders, weight, knee all correct.',
    'You don''t stiffen up — the stance is active, not tense.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-18';

UPDATE drills_missions SET
  title = 'Impulse Forward Speed Drill',
  time_estimate = '10-15 min',
  reps_recommended = '5-10 impulses + 5 in real rides',
  description_md = '## What you''ll train

You learn to generate speed during a ride using the canonical impulse — flex knees, touch toward water, push extension forward. When the wave is dying or the foam is slowing, impulse keeps you alive.

## What you need before

You on a foam wave that is starting to lose power, or any ride where the wave is slowing.

## How to execute it

- Phase 1 — Dry simulation (5-10 reps). On a stationary board on sand, practice the motion: flex your knees, touch one hand toward the water, push extension forward. The body extends like a spring.

- Phase 2 — Live ride (5 reps). When the foam slows mid-ride, execute the impulse. Feel the board accelerate as your body extends forward.

- Phase 3 — Refine timing. Coach calls out the timing — "now" — when you should impulse. You learn to read the wave''s energy yourself.',
  success_criteria = ARRAY['You execute the impulse on 3 different rides where the foam was slowing.',
    'You feel the board accelerate after the impulse.',
    'Your ride duration is measurably extended by the impulse.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-19';

UPDATE drills_missions SET
  title = 'Starfish Dismount Drill',
  time_estimate = '8-12 min',
  reps_recommended = '5-10 dismounts',
  description_md = '## What you''ll train

You learn to exit a standing ride safely using the starfish dismount — decide early, bend your knees, open your arms wide, fall back into the foam. The foam cushions the fall. No diving, no panic.

## What you need before

You on a standing ride, near the end of the wave.

## How to execute it

- Phase 1 — Dry simulation (5-10 reps). On sand, practice the body shape: knees bent, arms wide open like a starfish. Fall back slowly onto the sand. Repeat until automatic.

- Phase 2 — Live (3-5 reps). At the end of a ride, decide to dismount BEFORE you lose balance. Bend your knees, open your arms, fall back into the foam. Trust the foam to cushion you.

- Phase 3 — Refine timing. Decide earlier each time. The earliest you decide, the safer the fall.',
  success_criteria = ARRAY['You exit 3 rides without injury, without losing the board, without diving headfirst.',
    'Your body is wide and calm during the fall — not stiff or panicked.',
    'You decide to dismount BEFORE you lose balance.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-20';

UPDATE drills_missions SET
  title = 'Backside Rail Change Drill',
  time_estimate = '10-15 min',
  reps_recommended = '5 reps per phase',
  description_md = '## What you''ll train

You learn to execute a backside turn — the canonical chain: look → oblique rotation → hip drive → heel-side rail engagement. The board responds to the rail, not to your weight alone.

## What you need before

You on a foam wave or face wave with directional opportunity.

## How to execute it

- Phase 1 — Dry simulation (5 reps). On a stationary board, practice the chain in slow motion: look in the direction you''re turning → rotate your obliques (twist torso) → drive your hip in that direction → press the heel-side rail into the water.

- Phase 2 — Live (5 reps). On a ride, execute the chain. Eyes lead. Body follows. Rail responds.

- Phase 3 — Refine. Coach validates that each step happened in order. If you skip a step (e.g., rail before look), the turn won''t respond.',
  success_criteria = ARRAY['You execute 3 backside turns where the board directionally responded.',
    'Coach validates the chain executed in order: look → oblique → hip → heel → rail.',
    'The board changes direction, not just drifts.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-21';

UPDATE drills_missions SET
  title = 'Frontside Rail Change Drill',
  time_estimate = '10-15 min',
  reps_recommended = '5 reps per phase',
  description_md = '## What you''ll train

You learn to execute a frontside turn — same canonical chain as backside, but the front-side rail engages and your posture stays connected throughout (no buckling).

## What you need before

You on a foam wave or face wave with directional opportunity.

## How to execute it

- Phase 1 — Dry simulation (5 reps). On a stationary board, practice the chain: look in the frontside direction → oblique rotation → maintain posture (don''t buckle) → engage the front-side rail.

- Phase 2 — Live (5 reps). On a ride, execute the chain. Critical: posture stays connected — chest forward, knees compact, no collapsing forward.

- Phase 3 — Refine. Coach watches for posture buckling. If you collapse forward, the turn becomes a fall.',
  success_criteria = ARRAY['You execute 3 frontside turns where the board directionally responded.',
    'Coach validates posture remained connected throughout (no buckling).',
    'You can do both backside (STP-021) and frontside cleanly.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-22';

UPDATE drills_missions SET
  title = 'Paddle Out Efficiency Drill',
  time_estimate = '15-20 min',
  reps_recommended = 'See phases',
  description_md = '## What you''ll train

You learn to paddle out efficiently — long strokes, elbow over ear, aerodynamic hand entry, body like an arrow. Bad technique exhausts you in 20 minutes. Good technique lets you surf for 2 hours.

## What you need before

Calm water OR safe foam conditions, soft-top board.

## How to execute it

- Phase 1 — Dry demo (3 reps). Watch your coach simulate strokes on a bench or chair, showing elbow over ear and aerodynamic hand entry. Mirror it.

- Phase 2 — Calm water or safe foam (10 strokes). Execute technical strokes without time pressure. Focus on form.

- Phase 3 — Continuous paddle (3-5 min). Paddle from shore toward the lineup using the technique. Coach watches your form throughout.

- Phase 4 — Gear changes (5 reps). Practice gear 1 (cruising) → gear 2 (steady) → gear 3 (sprint) on coach command. You learn to switch energy levels.',
  success_criteria = ARRAY['You reach the lineup with measurable energy reserve — you are not exhausted.',
    'Coach validates your technique throughout: elbow over ear, body straight, no head movement.',
    'You can shift gears 1→2→3 on demand.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-23';

UPDATE drills_missions SET
  title = 'Turtle Roll Safety Drill',
  time_estimate = '15-20 min',
  reps_recommended = '5 reps in Phases 3 and 4',
  description_md = '## What you''ll train

You learn the turtle roll — the mandatory safety technique to pass through foam while prone, without releasing the board. In crowded surf, releasing the board can hurt others. The turtle roll is non-negotiable.

## What you need before

Whitewater zone, waist-to-chest depth, soft-top board.

## How to execute it

- Phase 1 — Dry demo (3 reps). On sand, practice: align the board nose against the foam direction, grab the rails firmly, place elbows on top of the board to protect your face.

- Phase 2 — Calm water (3 reps). Practice the roll in calm water, no foam pressure. Roll under, hold, return to center.

- Phase 3 — Small whitewater (5 reps). Execute the complete turtle roll, timing roughly 1 meter before the foam arrives. Roll under just before impact, hold through the turbulence, recover.

- Phase 4 — Recovery (5 reps). After the roll: scissor kick + use one arm to return your chest to the center of the board. Resume paddling immediately.',
  success_criteria = ARRAY['You execute 5 rolls without losing the board — the rule "never let go" holds.',
    'You time the roll about 1 meter before the foam — not too early, not too late.',
    'You recover to paddling position after each roll.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-24';

UPDATE drills_missions SET
  title = 'Prone Direction Drill',
  time_estimate = '10-15 min',
  reps_recommended = '5 reps per mode',
  description_md = '## What you''ll train

You learn to direct the board while prone using the 3 canonical modes: one-side paddling, circular hand motion, and seated pivot. You stay ready to paddle the moment the wave comes.

## What you need before

You prone on the board in calm water or in the lineup.

## How to execute it

- Phase 1 — Dry/seated on board (3 reps each technique). Coach demonstrates the 3 modes:

-   - Mode A: One-side paddling — paddle with one arm only to redirect.

-   - Mode B: Circular hand motion — both hands move in opposite circles to spin the board.

-   - Mode C: Seated pivot — sit up, hips back toward the tail, use feet and hands to pivot the board around.

- Phase 2 — Calm water (5 reps each mode). Practice all 3 modes in waist-deep water.

- Phase 3 — Real lineup (5-10 min continuous). Use the modes to position yourself while waiting for waves. Always stay ready to paddle.',
  success_criteria = ARRAY['You execute 5 direction changes per mode (15 total), each one intentional and controlled.',
    'You can choose which mode to use based on the situation.',
    'You stay ready to paddle at the end of each direction change — never stuck out of position.']::TEXT[],
  type = 'drill',
  active = TRUE
WHERE id = 'DRL-WB-25';

COMMIT;

-- Verification — run after all 3 parts
SELECT id, title, LENGTH(description_md) AS desc_len, ARRAY_LENGTH(success_criteria, 1) AS criteria_count
FROM drills_missions WHERE type='drill' AND id LIKE 'DRL-WB-%' ORDER BY id;
