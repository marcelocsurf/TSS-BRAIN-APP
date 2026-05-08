-- 00021C PART 3/3 — STP descriptions student-voice (Marcelo, 2026-05-08)
-- Source: WB_ALL_CONTENT_STUDENT_VOICE_v1_EN.md (parsed)
-- Idempotent: replaces description_md and errors_md for the 25 STPs

BEGIN;

UPDATE lessons SET
  title = 'Power Stance / Posture',
  description_md = '## What you''ll learn

You learn to hold the canonical power stance — shoulders forward, weight forward, back knee compact, exhale active — for the duration of a ride.

## Why it matters

The power stance is the foundation of every maneuver that comes next. Without it, you can''t turn, can''t generate speed, can''t hold position.

## 5 Key Words

`SHOULDERS · WEIGHT · KNEE · COMPACT · EXHALE`

## What your body does

Shoulders point forward (not back). Weight is on front foot, slightly. Back knee bends inward (compact). Breath stays active, not held.

## How you know you''ve got it

- You hold the stance ≥5 seconds on 3 different rides.
- Coach validates from outside.
- Stance stays active, not tense.',
  errors_md = '- Stiffening up (lock-out)
- Looking down
- Weight too far back
- Back knee splaying out',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-018';

UPDATE lessons SET
  title = 'Impulse',
  description_md = '## What you''ll learn

You learn to generate speed during a ride using the canonical impulse — flex knees, touch toward water, push extension forward.

## Why it matters

When the wave dies or the foam slows, your ride dies — unless you generate impulse. This is what extends rides.

## 5 Key Words

`FLEX · TOUCH · PUSH · EXTEND · SPEED`

## What your body does

Knees flex, body lowers, one hand can touch water, then full body extension forward.

## How you know you''ve got it

- You execute impulse on 3 different rides.
- Board accelerates after each impulse.
- Ride duration measurably extended.',
  errors_md = '- Not extending fully
- Wrong timing (too early or too late)
- Touching water too soon
- No upward extension',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-019';

UPDATE lessons SET
  title = 'Starfish Dismount',
  description_md = '## What you''ll learn

You learn to exit a standing ride safely using the starfish dismount — decide early, bend knees, open arms wide, fall back into foam.

## Why it matters

Bad exits cause injuries. Diving headfirst into shallow water is one of the most common surfing injuries. The starfish prevents that.

## 5 Key Words

`DECIDE · BEND · OPEN · FALL · FOAM`

## What your body does

Knees bend deeply. Arms open wide like a star. Body falls back, never forward. Foam cushions the fall.

## How you know you''ve got it

- 3 starfish exits without injury.
- Body wide and calm during the fall.
- You decide BEFORE losing balance.',
  errors_md = '- Diving head-first
- Falling stiff
- Deciding too late
- Falling forward instead of back',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-020';

UPDATE lessons SET
  title = 'Turn Backside',
  description_md = '## What you''ll learn

You learn to execute a backside turn using the canonical chain: look → oblique rotation → hip drive → heel-side rail engagement.

## Why it matters

A turn without the chain is just drift. The chain creates intentional, controllable direction change.

## 5 Key Words

`LOOK · OBLIQUE · HIP · HEEL · RAIL`

## What your body does

Eyes lead first. Torso rotates (oblique twist). Hips drive in the turn direction. Heel-side rail engages.

## How you know you''ve got it

- 3 turns where board responded to rail input.
- Coach validates chain in order.
- Board changes direction, not just drifts.',
  errors_md = '- Skipping the look (no visual lead)
- Body twists without eye lead
- Rail engagement without rotation
- Falling weight back',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-021';

UPDATE lessons SET
  title = 'Turn Frontside',
  description_md = '## What you''ll learn

You learn to execute a frontside turn using the canonical chain: look → oblique → posture → front-side rail engagement. Posture stays connected.

## Why it matters

Frontside turns are easier visually but trickier mechanically — you can buckle forward and lose the turn entirely.

## 5 Key Words

`LOOK · OBLIQUE · POSTURE · FRONT · RAIL`

## What your body does

Eyes lead first. Oblique rotation. Posture stays connected (chest forward, knees compact, no buckling). Front-side rail engages.

## How you know you''ve got it

- 3 turns where board responded.
- Posture remained connected — no buckling.
- You can do both backside and frontside.',
  errors_md = '- Buckling forward (collapsing posture)
- Losing the rail mid-turn
- Eyes following body instead of leading
- Weight shifts back',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-022';

UPDATE lessons SET
  title = 'Paddle Out',
  description_md = '## What you''ll learn

You learn to paddle out efficiently using canonical technique — sweet spot, alternating long strokes, elbow over ear, aerodynamic hand entry, body like an arrow.

## Why it matters

Bad paddling exhausts you in 20 minutes. Good paddling lets you surf for 2 hours. The difference is technique, not strength.

## 5 Key Words

`SWEET · ENTER · ELBOW · FORWARD · ARROW`

## What your body does

Body like an arrow (no head movement, no swing). One arm at a time. Elbow passes over the ear. Fingertips enter aerodynamically. Stroke pushes forward, not down.

## How you know you''ve got it

- You reach lineup with energy reserve.
- Coach validates technique throughout.
- You can shift gears 1→2→3 on demand.',
  errors_md = '- Wrong sweet spot
- Stiff hands
- Hyperextended arms
- Pushing up instead of forward
- Head moving side to side',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-023';

UPDATE lessons SET
  title = 'Turtle Roll',
  description_md = '## What you''ll learn

You learn the turtle roll — the mandatory safety technique to pass through foam while prone, without releasing the board.

## Why it matters

In crowded surf, releasing the board is dangerous to other surfers. The turtle roll is how you pass foam without becoming a hazard.

## 5 Key Words

`ALIGN · RAILS · ELBOWS · HOLD · RECOVER`

## What your body does

Align the board nose into the foam. Grab rails firmly. Roll under just before foam impact. Elbows on top of board to protect face. Hold during turbulence. Recover with scissor kick + return to center.

## How you know you''ve got it

- 5 rolls without losing board.
- Timing is correct — about 1 meter before foam.
- You recover to paddling each time.',
  errors_md = '- Poor alignment
- Wrong timing (too early or late)
- Releasing the board mid-roll
- No elbow protection
- Bad recovery (no return to center)',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-024';

UPDATE lessons SET
  title = 'Turn Left and Right Lying on Board',
  description_md = '## What you''ll learn

You learn to direct the board while prone using 3 canonical modes: one-side paddling, circular hand motion, and seated pivot.

## Why it matters

In the lineup, you constantly need to redirect prone — to follow shifting peaks, avoid other surfers, position for sets. Without these modes, you''re stuck.

## 5 Key Words

`TURN · ONE · BACK · PIVOT · READY`

## What your body does

Mode A: paddle with one arm. Mode B: both hands move in opposite circles. Mode C: sit up, hips back, use feet and hands to pivot.

## How you know you''ve got it

- You execute 5 direction changes per mode (15 total).
- You choose the right mode for the situation.
- You stay ready to paddle after each turn.',
  errors_md = '- Trying to turn from too far forward
- Weak directional paddling
- Poor seated pivot (no hip shift back)
- Not staying ready to paddle after the turn',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-025';

COMMIT;

-- Verification
SELECT id, title, LENGTH(description_md) AS desc_len, LENGTH(errors_md) AS errors_len
FROM lessons WHERE id LIKE 'STP-%' AND active=TRUE ORDER BY id;
