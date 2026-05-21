-- M54 — Yellow Belt STP descriptions, verbatim from the Unified Student Course.
--
-- Source: /Users/marcelocastellanos/Desktop/1111/_TSS_UNIFIED_COURSE_WB_YB_v1/STUDENT_COURSE/TSS_UNIFIED_STUDENT_COURSE_v1.md
--   PART VII — Sequence 6.0 (STP-027, STP-033, STP-028, STP-029, STP-034)
--   PART VIII — Sequence 7.0 (STP-030, STP-031, STP-032)
--
-- Replaces my paraphrased text from M51/M53 with the canonical content
-- (English, 2nd person, voice approved by Marcelo, zero invention).
-- Common errors live in errors_md and link to the transversal A/B
-- taxonomy from Appendix A.
--
-- All UPDATEs idempotent.

-- ─── STP-027 · Paddling Speeds 1–2–3–4 ───
UPDATE lessons SET description_md = $$## What you'll learn

Master 4 paddling speeds and apply them based on wave energy, distance to peak, and tactical intent. **Not paddling harder — paddling with purpose.**

## The 4 speeds

| Speed | Intensity | Use |
|---|---|---|
| V1 — Cruising | 30–40% | Active recovery · maintain position |
| V2 — Working | 50–60% | Sustained displacement |
| V3 — Catching | 70–80% | Reach peak with time to adjust |
| V4 — Sprint | 90–100% | Take-off · critical saves |

## Coach cue

> *"Match the speed to the wave, not the panic."*

## Drills

### Drill 1 — 4-Speed Ladder (calm water)
Have someone (or yourself) call out *"V1... V3... V2... V4"* and switch on command. 3 minutes.

### Drill 2 — Match-the-Wave (lineup)
After every paddle attempt, ask yourself out loud: *what speed did I use and why?*

## Mission

Choose the correct speed without external instruction in 3 of every 4 paddle-ins, across 2 consecutive sessions.$$,
errors_md = $$## Common errors (per-STP)

| Code | Error | Why it hurts |
|---|---|---|
| ERR-045 | Always V4 (panic) | Tank empty in 30 seconds |
| ERR-046 | Short stroke (doesn't reach hip) | No power transfer |
| ERR-047 | No breathing in sprint | Collapses at 15 sec |
| ERR-048 | Confuses speed with cadence | Fast arms, no advance |

## Transversal taxonomy

No direct Category A code for this STP — the speed system supports STP-028 (Chase the Pocket) and STP-029 (Correct Angle).$$
WHERE id = 'STP-027';

-- ─── STP-033 · Reading Wave Stages 1–4 in the Lineup ───
UPDATE lessons SET description_md = $$## What you'll learn

Apply the 4 wave stages (introduced at Pre-Course) in real time in the lineup — identify stages on real moving waves, predict where each wave will evolve, use that reading to decide.

## Why waves break (Marcelo's metaphor)

> *Waves break because they travel, and when they hit a bottom, that bottom makes them break. Like riding a bicycle: you pedal forward, you hit a rock, and you fly over the handlebars. Same physics.*

## The 4 stages (re-deepened)

| Stage | What's happening | Catchable? |
|---|---|---|
| 1 — Traveling | Pure energy moving | NO |
| 2 — Rising | Wave lifts up | YES (with correct angle + board) |
| 3 — Pocket | Lip forming, breaking | YES — peak energy |
| 4 — Whitewater | Already broken | YES — residual energy only |

## Coach cue

> *"Predict where the stage you are looking at will be — anticipate to meet."*

## Drills

### Drill 1 — Stage ID from Shore
Watch real waves from shore. Verbally identify the stage of each wave as it evolves.

### Drill 2 — Live Lineup Reading
In the lineup, before each set, call out what stage each incoming wave is in.

## Mission

Position yourself at Stage 2 first, then Stage 3. Identify when a wave is in Stage 1 and **don't waste energy** trying to catch it.

## 5 KW Mnemonic

**SCAN · STAGE · PREDICT · POCKET · DECIDE**$$,
errors_md = $$## Common errors (per-STP)

| Code | Error | Why it hurts |
|---|---|---|
| ERR-YB-033-01 | No complete scan (tunnel vision) | Misses the broader pattern |
| ERR-YB-033-02 | Only sees what's coming at you, not the whole wave | Loses the set behind |
| ERR-YB-033-03 | Doesn't identify type (left, right, closeout, A-frame) | Wrong catch decisions |
| ERR-YB-033-04 | Confuses Stage 1 with Stage 2 — paddles for uncatchable waves | Energy wasted |

## Transversal taxonomy

| Code | Error |
|---|---|
| ERR-YB-A5 | Not seeing the pocket (linked to STP-028 — pocket reading depends on stage reading) |$$
WHERE id = 'STP-033';

-- ─── STP-028 · Chase the Pocket ───
UPDATE lessons SET description_md = $$## What you'll learn

Identify the **pocket** of a wave (the point of maximum energy — where it's about to break) and actively position yourself to reach it.

A wave can have **multiple pockets** simultaneously when it's closing both sides.

## Doctrinal connection

> *"The paddling speeds from STP-027 exist exactly for this: to calculate the distance to the pocket and position yourself correctly."*

The 4 speeds + the pocket = one system, not two separate skills.

## Coach cues

- *"Chase the pocket"*
- *"Look at the pocket"*
- *"Control your distance"*

## Drills

### Drill 1 — Visual Tracking + Pointing
From shore, track each wave with your eyes from formation to break, pointing at the pocket as it forms. Identify multiple pockets when present.

### Drill 2 — Paddle-and-Turn
Paddle toward the pocket as deep as possible, then turn around immediately. Self-calibration of distance.

## Mission

Maintain visual contact with the pocket throughout the entire paddle-in, until you're close and know you're well positioned.

## 5 KW Mnemonic

**POCKET · EYES · DISTANCE · SPEED · POSITION**$$,
errors_md = $$## Common errors (per-STP)

| Code | Error | Why it hurts |
|---|---|---|
| ERR-YB-028-01 | Sees the whole wave as one mass | No decision can be made |
| ERR-YB-028-02 | Sits and waits for perfect alignment → catches nothing | Static positioning, no pursuit |
| ERR-YB-028-03 | Turns and paddles too early | Arrives before the pocket is ready |

## Transversal taxonomy

| Code | Error |
|---|---|
| ERR-YB-A5 | **Not seeing the pocket** — the foundational tactical error of YB |$$
WHERE id = 'STP-028';

-- ─── STP-029 · Paddle with the Correct Angle ───
UPDATE lessons SET description_md = $$## What you'll learn

Choose your paddle angle based on where the pocket is and what stage the wave is in. **Pocket awareness is the prerequisite.**

## The 3 options

| Option | Position | Strategy |
|---|---|---|
| 1 | Far from pocket | Aggressive angle TOWARD pocket — use the wave's energy |
| 2 | Near pocket | Moderate angle adjustment |
| 3 | In front of pocket | Use pocket's energy directly |

**Variable:** Does the pocket have a lip already, or is it just whitewater?

## The integrated cue chain (combines previous 3 STPs)

1. **Look at the pocket** (STP-028)
2. **Read the stage** (STP-033)
3. **Angle** (STP-029 action)
4. **Scan de wave** (STP-033)

## Drills

### Drill 1 — Spot & Paddle
See pocket → paddle to position there.

### Drill 2 — Deep Position, Paddle to Foam
Position deep at the pocket → paddle toward the foam direction (practices Option 1).

### Drill 3 — Paddle + Catch + Cobra
Paddle to pocket → catch wave → execute cobra. *Bridge to STP-034.*

## Mission

Catch waves paddling with the correct angle. Before each paddle-in, **say out loud** which option (1, 2, or 3) you're using.

## 5 KW Mnemonic

**POCKET · STAGE · ANGLE · SCAN · PADDLE**$$,
errors_md = $$## Common errors (per-STP)

| Code | Error | Why it hurts |
|---|---|---|
| ERR-YB-029-01 | Paddles in opposite direction, away from pocket | Effort goes where the wave never reaches |
| ERR-YB-029-02 | Paddles in Stage 1 (the wave can't be caught yet) | Energy wasted before the catch window |
| ERR-YB-029-03 | Paddles toward pocket when too close → lip/foam hits the rail | Collides with foam instead of catching |

## Transversal taxonomy

| Code | Error |
|---|---|
| ERR-YB-A6 | **Not aligning with the wave** — the consequence of skipping the integrated cue chain |$$
WHERE id = 'STP-029';

-- ─── STP-034 · Cobra + Pick Line ───
UPDATE lessons SET description_md = $$## What you'll learn

The cobra (technical movement of redirecting the board's nose) and line selection (tactical decision of where to go on the wave) — applied on **green moving waves**. You're already surfing (redirecting the board) **before standing up**.

## WB vs YB

- White Belt cobra (STP-015) = the **movement**, in whitewater
- Yellow Belt cobra = the **decision**, on green moving waves

## The doctrinal principle — Cobra + Line = TIME

> **Cobra + correct line → maintain speed → generate TIME.**
>
> TIME = ability to pop up calmly, pass sections, control the moment of standing.
>
> Without line selection → board to flat → loses speed → loses balance → bad pop-up or wipeout.

This is **the most important doctrinal principle of Yellow Belt**. Memorize it.

## Coach cues

- *"Cobra and pick your line"*
- *"Where do you want to go?"*
- *"Don't go to the flat"*

## Drill — Line Hold

After catching the wave, do the cobra + pick your line, then **surf lying down for at least 5 seconds before standing up**. Feel the TIME generated.

## Mission

Surf prone after cobra for ≥5 seconds. Feel the TIME generated before popping up.

## 5 KW Mnemonic

**CATCH · COBRA · LINE · TIME · POP**$$,
errors_md = $$## Common errors (per-STP)

| Code | Error | Why it hurts |
|---|---|---|
| ERR-YB-034-01 | No cobra → nose digs in | Ride ends before it starts |
| ERR-YB-034-02 | Cobra too strong → fall off | Violent redirect kills speed |
| ERR-YB-034-03 | Cobra without choosing line → just turn, no destination | No TIME generated |
| ERR-YB-034-04 | Wrong line → board still goes to flat | Speed dies anyway |

## Transversal taxonomy

| Code | Error |
|---|---|
| ERR-YB-A2 | Cobra poorly executed |
| ERR-YB-A3 | **Not choosing the line** — ⭐ one of the Big Three disqualifying errors of YB |$$
WHERE id = 'STP-034';

-- ─── STP-030 · Pop Up + Foot Position 1 or 2 ───
UPDATE lessons SET description_md = $$## What you'll learn

Pop up with conscious awareness of WHERE your back foot lands — FP1 (tail) or FP2 (neutral). The new YB skill is the **back-foot shuffle** FP1 ↔ FP2.

## The 3 foot positions (canon vocabulary)

| Position | Used for | Speed |
|---|---|---|
| FP1 (Tail) | Tight turns · 8-figures · closing turns | Less speed |
| FP2 (Neutral) | Round lines (default) | Moderate |
| FP3 (Forward) | Long lines · trim | Most speed |

You'll work with FP1 and FP2 at Yellow Belt. FP3 comes later.

## Why FP2 is the default

When you're lying on the board at the sweet spot, your knees are over **FP2**. So when you do the pop-up, your back foot naturally lands where the knees were = FP2.

## The new skill — the shuffle

From FP2, learn to **drag the back foot to FP1** consciously when you want a tighter turn. Then back to FP2. Front foot stays centered.

## Three pop-up methods

**Method 1 — Figure 4 (knee out):** Cobra → hands at rib height → drag back foot in figure-4 → push up, lift hips → look forward → bring extended foot to center.

**Method 2 — Scorpion (rotated):** Cobra → rotate hip toward front-foot side → drag back foot near knee → fully aligned forward from launch.

**Method 3 — Scorpion (momentum/pendulum):** Cobra → exhale → kick front foot UP for momentum → hips lift → foot swings through like pendulum.

Pick the method that feels best. All 3 produce the same result.

## Biomechanical principles (transversal)

- Hands at **rib height** during the cobra
- Always look **forward**
- **Hips DOWN, head UP** when releasing the board
- Weight on **FRONT foot**, not back
- Don't release until you feel **connected**
- **Exhale** during the transition

## Coach cues

- *"Hands at the ribs"*
- *"Look forward, create space"*
- *"Hips down, head up"*
- *"Weight on the front foot"*
- *"Stay connected — don't release"*

## Mission

Smooth, correct, connected pop-up landing at FP2 by default. Then demonstrate the shuffle FP1↔FP2 when the wave invites it. **Not "land and pray."**

## 5 KW Mnemonic

**COBRA · SPACE · DRAG · LAND · SHUFFLE**

## Doctrinal definition (Marcelo)

> *"The pop-up is the moment of DISCONNECT → RECONNECT with the board. It makes the board feel like an extension of you."*$$,
errors_md = $$## Common errors (per-STP)

| Code | Error | Why it hurts |
|---|---|---|
| ERR-YB-030-01 | Releases board too early | Unstable landing, no connection |
| ERR-YB-030-02 | All weight on back foot | Loses balance immediately |
| ERR-YB-030-03 | Not looking forward | Body follows the eyes — collapses |
| ERR-YB-030-04 | Hands too forward → no space for knee | Blocks the pop-up motion |
| ERR-YB-030-05 | Looking down | Same as #3, kills the pop-up |
| ERR-YB-030-06 | Goes to the flat (no time, no balance) | Doesn't preserve momentum |

## Transversal taxonomy

| Code | Error |
|---|---|
| ERR-YB-A7 | Front foot off to one side |
| ERR-YB-A8 | Not doing the back-foot shuffle |
| ERR-YB-A9 | **Pop-up not connected · not looking forward** |$$
WHERE id = 'STP-030';

-- ─── STP-031 · Go Up and Down (THE INTEGRATION STEP) ───
UPDATE lessons SET description_md = $$## What you'll learn

This is the **integration step**. You're not learning new techniques — you're CONNECTING everything you've learned (pocket reading, angle, cobra + line, pop-up, foot position) into one continuous dynamic ride.

This is the threshold between *"I caught a wave"* and *"I am surfing."*

## Doctrinal principle — External × Internal = Sustained Line

> **External force (the wave's energy) × Internal force (your body's compression-extension) = sustained line on the wave face.**
>
> The game: **maintain the energy** by staying close to the pocket and never going to the flat.

## The pump mechanics

| Phase | Body action |
|---|---|
| Going DOWN | Maintain compression · stable posture |
| Before flat | Start rotation UP · extend legs |
| Going UP | Rotation + leg extension |
| Before exit | Flex legs · enter posture · rotate DOWN |
| Repeat | ∞ |

## Frontside × Backside equivalence

Same theory. Different mechanics:
- **Frontside** = wave at the front (chest toward face)
- **Backside** = wave at the back

Both: don't go to flat + compress/extend + use rotation.

## Coach cues

- *"Don't go to the flat"*
- *"Compress down, extend up"*
- *"Stay where the energy is"*
- *"Keep the game alive"*

## Drills — 6 canonical (full detail in the Drill tab)

1. **Up/Down Cycle** — pump without going to flat or leaving wave
2. **Frontside Pump**
3. **Backside Pump**
4. **Pocket Proximity** (slow wave) — stay near pocket → move away → use rotations to come back
5. **Surfskate carving** (classical bridge — feel compression/extension on land)
6. **⭐ Two Lines / Ping-Pong** (constraint-led) — imagine 2 invisible lines on the wave: **lip on top, flat on bottom**. Board bounces between them like a ping-pong ball — never crossing either. This drill makes everything click.

## Mission

Surf one wave executing the full sequence connected — sustained up/down without going to flat. As many cycles as the wave allows. **The game: maintain the energy and have fun.**

## 5 KW Mnemonic

**DOWN · COMPRESS · UP · EXTEND · STAY**$$,
errors_md = $$## Common errors (per-STP)

| Code | Error | Why it hurts |
|---|---|---|
| ERR-YB-031-01 | Going to the flat | Loses energy, loses speed, ride collapses |
| ERR-YB-031-02 | Leaves wave too early | Abandons the wave before the game is over |
| ERR-YB-031-03 | Passive body (no compression/extension) | Just standing — no internal force, no line |
| ERR-YB-031-04 | Up/Down as separate from previous sequence | Becomes a new skill instead of the continuation |
| ERR-YB-031-05 | Only frontside or only backside | Asymmetric development — belt requires both |

## Transversal taxonomy

| Code | Error |
|---|---|
| ERR-YB-A4 | **Going straight to the flat** — ⭐ one of the Big Three disqualifying errors of YB |$$
WHERE id = 'STP-031';

-- ─── STP-032 · Out from the Shoulder ───
UPDATE lessons SET description_md = $$## What you'll learn

Exit the wave **actively through the shoulder** — with control and intention. This is the third type of exit:

- WB taught the **lying-down dismount** (slide off)
- WB taught the **star fall** (safety fall)
- YB adds the **active shoulder exit** — by choice, with elegance

## The 4 use cases

1. **Avoid the lip** when about to break
2. **Avoid going straight** (takes you far from the lineup)
3. **Avoid bad position** (rocks, hazards)
4. **Abort mission** (people in front — etiquette)

## How to execute

1. **Read** the wave's end section — identify the shoulder (Stage 1 or 2 — no lip yet)
2. **Start the turn** toward the shoulder
3. **Maintain** the turn — eyes locked on exit area
4. **Exit** the wave
5. **Dismount calmly** once outside

## Doctrinal phrase (Marcelo)

> **"Exit with elegance and calm, not with turbulence."**

## Coach cues

- *"Read the shoulder"*
- *"Eyes on the exit"*
- *"Exit clean, not turbulent"*
- *"Don't ride past your decision"*

## Drills

### Drill 1 — Visual ID from shore
Watch real waves, call out the ideal shoulder exit point for each.

### Drill 2 — Short ride + early exit
Catch + 5 sec + shoulder exit (forces practicing the decision, not the full ride).

### Drill 3 — Coach-called exit
Coach (or a friend) calls *"EXIT!"* mid-wave, you must exit through the shoulder immediately.

## Mission

Exit through the shoulder at least **2 times in a session**, by **choice** — not by accident.

## 5 KW Mnemonic

**READ · SHOULDER · TURN · EXIT · CALM**$$,
errors_md = $$## Common errors (per-STP)

| Code | Error | Why it hurts |
|---|---|---|
| ERR-YB-032-01 | Doesn't identify shoulder in time → wave breaks on student | Late read, takes the lip |
| ERR-YB-032-02 | Exits straight → ends up far from point | Long paddle back |
| ERR-YB-032-03 | Rides past decision moment → bad position | Has to recover for next set |
| ERR-YB-032-04 | Star fall when clean shoulder exit was available | Uses the safety exit when active exit was on offer |

## Transversal taxonomy

No direct Category A code — this STP introduces a new skill not present at WB. Its absence shows up as ERR-YB-A1 (skipping steps of the sequence) when the exit phase is missing.$$
WHERE id = 'STP-032';
