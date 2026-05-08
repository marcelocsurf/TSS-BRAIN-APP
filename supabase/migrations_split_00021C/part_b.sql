-- 00021C PART 2/3 — STP descriptions student-voice (Marcelo, 2026-05-08)
-- Source: WB_ALL_CONTENT_STUDENT_VOICE_v1_EN.md (parsed)
-- Idempotent: replaces description_md and errors_md for the 25 STPs

BEGIN;

UPDATE lessons SET
  title = 'Get on Your Board / Find Sweet Spot',
  description_md = '## What you''ll learn

You learn to mount the board prone in the exact "sweet spot" — the position where the nose barely floats and the tail is just submerged. This is the position from which you can paddle.

## Why it matters

Wrong sweet spot = board fights you, paddling is inefficient, you can''t catch waves. Right sweet spot = board responds to you.

## 5 Key Words

`MOUNT · CHEST · CENTER · LEVEL · READY`

## What your body does

Chest slightly forward of board center. Feet together near the tail. Body level — board floats level.

## How you know you''ve got it

- Board floats level on each mount.
- You feel the board "ready" not "fighting".
- Coach validates sweet spot consistently.',
  errors_md = '- Too far forward (nose dives)
- Too far back (board tail-heavy)
- Lying off-center
- Feet apart',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-010';

UPDATE lessons SET
  title = 'Get Aligned with the White Water',
  description_md = '## What you''ll learn

You learn to align the nose of your board with incoming foam BEFORE you start paddling. The shoulder check is non-negotiable.

## Why it matters

A misaligned board can''t catch a wave, no matter how hard you paddle. Alignment first, paddle second.

## 5 Key Words

`SWEET · READ · SHOULDER · ALIGN · READY`

## What your body does

Eyes look over shoulder. Hands and small kicks rotate the board. Body stays in sweet spot.

## How you know you''ve got it

- Shoulder check before paddle every time.
- Nose aligned with foam direction.
- You don''t paddle until alignment confirmed.',
  errors_md = '- Paddling without checking alignment
- No shoulder check
- Aligned but pointing wrong direction
- Trying to align mid-paddle',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-011';

UPDATE lessons SET
  title = 'Paddle to Catch White Water',
  description_md = '## What you''ll learn

You learn to paddle aggressively to catch a foam wave — long strokes, one-two cadence, start early, commit until the board accelerates.

## Why it matters

Half-paddling never catches a wave. Full commitment with proper technique catches even small foam.

## 5 Key Words

`DISTANCE · START · ONE-TWO · FORWARD · COMMIT`

## What your body does

Long strokes from in front of you to your hip. Pull water back, push body forward (not down). Cadence is rhythmic.

## How you know you''ve got it

- You start early on every attempt.
- You don''t stop until the board accelerates.
- You catch 5 of 10 foam waves cleanly.',
  errors_md = '- Late start
- Stopping before the board accelerates
- Pushing down instead of forward
- Choppy short strokes',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-012';

UPDATE lessons SET
  title = 'Cobra + Turn Left and Right',
  description_md = '## What you''ll learn

You learn to direct the board left or right while riding prone in cobra position — using rail pressure with your hands and visual lead with your eyes.

## Why it matters

Without directional control, you drift wherever the wave pushes. With directional control, you choose your line and ride longer.

## 5 Key Words

`HANDS · CHEST · EYES · RAIL · STEER`

## What your body does

Cobra position (chest up, hands at ribs). Eyes lead. One hand presses one rail. Body follows.

## How you know you''ve got it

- Board responds to direction every time.
- Direction matches your stated intention.
- 5 lefts and 5 rights intentionally.',
  errors_md = '- Trying to direct without raising chest
- Not using eyes to lead
- Pressing the wrong rail
- Hands too far forward',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-013';

UPDATE lessons SET
  title = 'Prone Dismount',
  description_md = '## What you''ll learn

You learn to exit a prone ride safely — without losing the board, hurting yourself, or panicking.

## Why it matters

Panic exits cause injuries. Trained exits are smooth body-board separations.

## 5 Key Words

`DECIDE · RAILS · SHIFT · ROTATE · LAND`

## What your body does

Both hands grab rails firmly. Knees come to chest. Body shifts back. You roll off to the side, never face-first.

## How you know you''ve got it

- 5 dismounts without board loss or injury.
- Smooth separation, not panic.
- You stay with the board.',
  errors_md = '- Diving off head-first
- Losing the board
- Letting go too early
- Panicking when ride ends',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-014';

UPDATE lessons SET
  title = 'Cobra Pick Line',
  description_md = '## What you''ll learn

You learn to pick your line from cobra position — to look ahead, decide where you''re going, and commit visually BEFORE you stand up.

## Why it matters

A pop-up without a chosen line is a blind pop-up. The board goes wherever the wave pushes. Pick the line first, then stand.

## 5 Key Words

`COBRA · EYES · LINE · COMMIT · STAND`

## What your body does

In cobra, head and eyes scan forward. Eyes lock on the chosen direction. Body commits. Then the pop-up sequence begins.

## How you know you''ve got it

- You verbalize the line in cobra before pop-up.
- Eyes locked on direction throughout.
- Pop-up direction matches what you said.',
  errors_md = '- Not aware of cobra power to pick line
- Undefined first line
- Eyes locked on the nose
- Standing without visual commit
- Direction chosen after standing (too late)',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-015';

UPDATE lessons SET
  title = 'Pop-Up',
  description_md = '## What you''ll learn

You learn to execute the pop-up — the movement that takes you from prone to standing on the board in approximately 2 seconds.

## Why it matters

This is the step that turns you from a swimmer-on-a-board to a surfer. Without a clean pop-up, no surfing.

## 5 Key Words

`COBRA · HANDS · EXHALE · FEET · CONNECT`

## What your body does

Solid cobra → audible exhale → both feet land centered → hands release only when stable.

## How you know you''ve got it

- Solid cobra first.
- Feet placed correctly with smooth movement.
- Hands release only when centered and stable.',
  errors_md = '- Skipping cobra
- No exhale
- Back foot lands first (slows the board)
- Hands release too early
- Feet not centered',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-016';

UPDATE lessons SET
  title = 'Feet Position Center #2',
  description_md = '## What you''ll learn

You learn to land your back foot in Position #2 (FP2) — the canonical center back-foot position — on every pop-up.

## Why it matters

Wrong foot position = no power, no control. Right FP2 = board responds to your pressure.

## 5 Key Words

`CENTER · RAILS · FP2 · BACK-FOOT · CONNECT`

## What your body does

Back foot lands centered (not on rail), in the back third of the board, perpendicular to the stringer.

## How you know you''ve got it

- Back foot in FP2 on 5 of 5 pop-ups.
- Coach validates from outside.
- You feel the board respond to pressure.',
  errors_md = '- Foot too far back (tail-heavy)
- Foot on the rail (not centered)
- Foot too far forward (no power)
- Foot at wrong angle',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'STP-017';

COMMIT;
