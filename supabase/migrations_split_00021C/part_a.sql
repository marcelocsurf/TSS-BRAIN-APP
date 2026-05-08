-- 00021C PART 1/3 — STP descriptions student-voice (Marcelo, 2026-05-08)
-- Source: WB_ALL_CONTENT_STUDENT_VOICE_v1_EN.md (parsed)
-- Idempotent: replaces description_md and errors_md for the 25 STPs

BEGIN;

UPDATE lessons SET
  title = 'Venue Analysis',
  description_md = '## What you''ll learn

You learn to read the spot before entering the water — to build a clear mental map of the surf zone, identify risks, and make a go/no-go decision.

## Why it matters

You cannot make good decisions about a place you haven''t observed. Venue analysis is the prerequisite to every safe, productive session.

## 5 Key Words

`MAP · ZONE · HAZARD · ENTRY · DECIDE`

## What your body does

This is observational, not physical. Your body stands still on the beach. Your eyes work — scanning, identifying, comparing.

## How you know you''ve got it

- You describe the day''s general conditions and identify the safe zone.
- You recognize the impact zone and point out hazards and currents.
- You explain entry/exit points and state whether conditions match your level, with a session plan.',
  errors_md = '- Rushing the analysis
- Vague reading of the spot
- Not waiting long enough to see big sets
- Failing to identify outside reference points
- Not matching conditions to your level',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-001';

UPDATE lessons SET
  title = 'Warm Up',
  description_md = '## What you''ll learn

You learn to prepare your body and mind before entering the water using a surf-specific warm-up flow: mobility, activation, simulation, and breath.

## Why it matters

A cold, stiff, or scattered body cannot execute technique. The warm-up is what bridges you from rest to ready.

## 5 Key Words

`MOBILITY · ACTIVATION · SIMULATION · BREATH · READY`

## What your body does

Your joints mobilize, your muscles activate, your nervous system rehearses surfing patterns, and your breath connects mind to body.

## How you know you''ve got it

- You execute all 4 segments of the warm-up flow without prompting.
- Your body feels active and warm.
- You enter mentally focused, not scattered.',
  errors_md = '- Skipping the warm-up entirely
- Doing a generic gym warm-up that has nothing to do with surfing
- Rushing through it
- Entering the water cold and stiff',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-002';

UPDATE lessons SET
  title = 'Grab Board',
  description_md = '## What you''ll learn

You learn to lift and carry the board safely using proper body mechanics — knees bent, both hands on the rails, control throughout.

## Why it matters

Bad lifts hurt your back. Bad carries injure other people. The right mechanics protect everyone.

## 5 Key Words

`CENTER · KNEES · RAILS · LIFT · CARRY`

## What your body does

Knees bend, back stays straight, both hands grip the rails (not the deck), legs do the lifting.

## How you know you''ve got it

- You lift with proper mechanics every time.
- You carry under control without swinging.
- You set the board down gently.',
  errors_md = '- Lifting with your back instead of your legs
- Holding the deck instead of the rails
- Swinging the board near other people
- Dragging the fins on the sand',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-003';

UPDATE lessons SET
  title = 'Walk Out',
  description_md = '## What you''ll learn

You learn to walk from the shoreline into waist-deep water with the board under control, reading incoming foam and managing your position.

## Why it matters

The walk out is your first ocean test. Bad entries lose the board, get you hit by foam, or trip you on rocks.

## 5 Key Words

`PATIENCE · DRAG · SIDE · FACE · PLACE`

## What your body does

Feet drag on the bottom. Body keeps the board on your side. Eyes watch the foam.

## How you know you''ve got it

- You enter the water without losing the board.
- You arrive at waist-deep with composure.
- You waited for a lull, not a set.',
  errors_md = '- Walking with the board in front (gets pushed back)
- Walking with the board behind (you can''t see it)
- Not waiting for a lull before entering
- Letting the board go sideways to a wave',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-004';

UPDATE lessons SET
  title = 'Put Board in the Water',
  description_md = '## What you''ll learn

You learn to place the board on the water surface so it''s ready for you to mount — parallel to incoming waves, no slap, no loss to foam.

## Why it matters

A bad placement loses the board to the next foam wave. A good placement sets you up to paddle immediately.

## 5 Key Words

`DEPTH · PAUSE · LOWER · RELEASE · READY`

## What your body does

Both hands on rails, slow lower, gentle release with fingers ready to grab again.

## How you know you''ve got it

- Board enters water gently — no slap.
- Board stays parallel to waves.
- 5-8 placements without losing board.',
  errors_md = '- Slapping the board on the water
- Releasing too early
- Placing perpendicular to waves
- Not staying ready to grab if foam comes',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-005';

UPDATE lessons SET
  title = 'Control Your Board',
  description_md = '## What you''ll learn

You learn to control the board while standing in waist-deep water as foam waves come at you. Tail pressure + body position = board stays pointed into the wave.

## Why it matters

Without tail control, the board becomes a projectile that hits you or others.

## 5 Key Words

`TAIL · CENTER · SIDE · PRESS · PIVOT`

## What your body does

Body stands behind the board. Hands grip the rails near the tail. Tail presses down as foam hits the nose.

## How you know you''ve got it

- Board nose always pointed into foam.
- 5-8 foam waves passed without losing board.
- Body always between board and shore.',
  errors_md = '- Letting the board go sideways
- Standing in front of the board (foam pushes board into you)
- Not maintaining hand grip
- Losing the board to foam',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-006';

UPDATE lessons SET
  title = 'Go Through Whitewater Standing',
  description_md = '## What you''ll learn

You learn to pass through whitewater while standing — using compact posture, hand pressure, and forward stability.

## Why it matters

In waist-deep water with foam, you can''t paddle — you stand. The passage technique gets you through without losing the board or being thrown back.

## 5 Key Words

`ALIGN · WAIT · PRESS · LIFT · PASS`

## What your body does

Compact posture, knees slightly bent, hands press the tail down, board lifts the nose, foam passes underneath.

## How you know you''ve got it

- You pass 5 foam waves without losing balance.
- Board stays connected.
- You progress forward, not backward.',
  errors_md = '- Stiff body — gets thrown back
- Standing tall — bad balance
- Releasing tail pressure too early
- Not progressing forward',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-007';

UPDATE lessons SET
  title = 'Turn Around Safely',
  description_md = '## What you''ll learn

You learn the safe pivot turn — rotating the board 180° while keeping your body between the board and the wave so the board never hits you or others.

## Why it matters

Bad turns put the board between you and the wave — that''s how surfers get hit by their own board.

## 5 Key Words

`CHECK · PIVOT · BACK · CONTROL · READY`

## What your body does

Body rotates with the board. Pivot point is in your hands. Body stays on the wave-side of the board.

## How you know you''ve got it

- 5 turns with board controlled.
- Body always between board and shore.
- You finish each turn ready to paddle.',
  errors_md = '- Body ends up between wave and board (dangerous)
- Letting board go loose
- Slow recovery — not ready to paddle after turn',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-008';

UPDATE lessons SET
  title = 'Walk Back to the Sand',
  description_md = '## What you''ll learn

You learn to return from the water to the sand safely — facing the waves, monitoring foam, adjusting your position.

## Why it matters

Most beach injuries happen on the way out, not on the way in. Walking back without awareness is when surfers get hit from behind.

## 5 Key Words

`LOOK · READ · WALK · ADJUST · LAND`

## What your body does

Eyes look back periodically. Body angles to face partly toward waves. Feet drag on the bottom.

## How you know you''ve got it

- You return without getting hit from behind.
- You stayed alert throughout.
- You arrive composed.',
  errors_md = '- Turning your back fully to the waves
- Walking too fast
- Ignoring approaching foam
- Falling on slippery rocks',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-009';

COMMIT;
