-- M56 — YB onboarding ampliado: Belt Value (Module 4) canónico
-- + Module 7 (The Complete Ride) + Module 8 (YB Exit Test).
--
-- Source: TSS_UNIFIED_STUDENT_COURSE_v1.md
--   Part 6  — Module 4 — Yellow Belt Belt Value (Proceso / Resiliencia)
--   Part 9  — Module 7 — The Complete Ride
--   Part 10   — Module 8 — Yellow Belt Exit Test
--
-- This migration:
--   1. Replaces YB-ONB-01 (Belt Value) with the canonical long form.
--      That lesson IS the doctrinal bridge WB→YB.
--   2. Replaces YB-MOD-7 with the 11-stage Complete Ride content.
--   3. Replaces YB-MOD-8 with the 5 categories · 13 criteria of the
--      YB Exit Test.
--
-- The 6 WB onboarding lessons are NOT duplicated here. They appear
-- in YB onboarding via the new `sharedLessonSections` mechanism in
-- src/lib/constants/courses.ts + CourseTab.tsx (separate commit).

-- ─── YB-ONB-01 · Belt Value: Proceso / Resiliencia ───
UPDATE lessons SET
  title = 'Yellow Belt Belt Value — Proceso / Resiliencia',
  pillar = 'Mental · Belt Value',
  description_md = $$Before you start Sequence 6, take a moment. The shift from White Belt to Yellow Belt is not just technical — it's **mental**.

## The doctrinal shift

At White Belt you learned: *"I am beginning. I don't know everything. I am open to learn."* That was humility.

At Yellow Belt you'll learn something deeper: *"I accept this is hard. I accept I will fail. I keep showing up."* That is resilience.

## Long form (the full belt value)

Resilience (Process) is the central value of Yellow Belt because it marks the moment when the surfer begins to understand that surfing — most of the time — is effort, waiting, tumbles, and falls.

At this level, you are no longer surprised when you paddle a lot and catch little. Not surprised when the wave tumbles you, when you fall, when you end up in the wrong spot, when you watch the perfect wave pass by without being able to catch it. You begin to accept all of this as a natural part of the process. And you begin to develop the resilience that will accompany you for the rest of your life — not just in the water, but in everything you do.

Because life is like that. **Life is like surfing it**: there are parts where you must paddle, parts where you must wait, and parts where you must commit, seize the opportunity, not let it pass, and give it everything. That is the deep teaching of Yellow Belt — to understand that the rhythm of surfing is the rhythm of life.

Resilience at this level is not enduring pain. It is **accepting that the real path is long, imperfect, and demands consistency**. It is accepting that we will be wrong many times, that we will fall — but we get back up, climb back on the board, and keep surfing. And with every fall, we understand the ocean a little more, ourselves a little more, the board, the currents. Each fall gives us one more tool to enjoy.

And the real magic lies right there — in **playing with the waves**. Playing in the sea. Being there playing, learning, evolving, but enjoying nature, present in the here and now. That is the most important thing Yellow Belt teaches about resilience: that endurance and enjoyment are not opposites. They are the same thing when seen correctly.

Accept that it is hard. Then give it everything. That is what characterizes surfers. That is resilience.

## Closing phrases

*Yellow Belt grows through resilience: accept the fall, return to the wave, play with the sea.*

**ES:** *Yellow Belt crece con resiliencia: acepta la caída, vuelve a la ola, juega con el mar.*

## Marcelo's voice

> *"Life is like surfing it: there are parts to paddle, parts to wait, and parts to commit."*

> *"The real magic lies in playing with the waves, present in the here and now."*

> *"Accept that it is hard and give it everything. That is what characterizes surfers."*

---

> **Module 4 task:** Read the long form 2-3 times. Sit with it. The mental shift it asks for is real. Once you feel ready, move to Sequence 6.$$,
  estimated_minutes = 15
WHERE id = 'YB-ONB-01';

-- ─── YB-MOD-7 · The Complete Ride ───
UPDATE lessons SET
  title = 'Module 7 — The Complete Ride',
  subtitle = 'The full unified sequence from beach to clean exit',
  pillar = 'Integration · Operational Chain',
  description_md = $$**Goal:** Execute the **full unified sequence** from arriving at the beach to finishing a wave cleanly.

This module is unique to the unified course. There is no new content here — what's new is the **explicit connection** of everything you've learned into one fluid operational chain. This is what a Yellow Belt graduate looks like when they execute a wave.

## The Complete Operational Chain — 11 stages

```
1. VENUE ANALYSIS
   ↓
2. WARM-UP + BISAGRA
   ↓
3. PADDLE OUT
   ↓
4. SCAN WAVE STAGES (STP-033)
   ↓
5. IDENTIFY POCKET (STP-028)
   ↓
6. PADDLE SPEED + ANGLE (STP-027 + STP-029)
   ↓
7. COBRA + PICK LINE (STP-034) ⭐ generate TIME
   ↓
8. POP-UP + FOOT POSITION (STP-030)
   ↓
9. POSTURE + UP/DOWN (STP-031) — the integration
   ↓
10. OUT FROM THE SHOULDER (STP-032)
    ↓
11. FEEDBACK + REFLECTION (One Wave principle)
```

---

### Stage 1 — Venue Analysis (Layer 1 Preparation)

**Before you change clothes, before you wax the board, before anything — you look at the ocean.**

What you're reading: swell direction and size · tide · wind · crowd · hazards · entry and exit points · the Go/No-Go decision.

This stage takes **at least 5 minutes**. Don't skip it. Doing this poorly is **ERR-YB-B3**.

> **From WB Pre-Course Item #6:** "If in doubt, don't go out."

### Stage 2 — Warm-Up + Bisagra (Activation)

The **bisagra** is the transition — from beach mode to ocean mode. Physical warm-up · breath activation (30-Second Pre-Session Ritual) · mental zone (one intention) · synchrony with the ocean.

Skipping the bisagra = entering the water cold = wasted first 15 minutes.

### Stage 3 — Paddle Out

You apply White Belt survival skills here. Sweet spot · paddle basics · duck dive / turtle roll · etiquette · sitting position.

You arrive at the lineup. You sit up. You breathe. **Now Yellow Belt begins.**

### Stage 4 — Scan Wave Stages (STP-033)

Before you paddle for anything, you READ. Scan left to right · identify each wave's stage · predict where each will break · identify type · note bottom.

**5KW:** SCAN · STAGE · PREDICT · POCKET · DECIDE

### Stage 5 — Identify the Pocket (STP-028)

You see a wave with potential. Now you find the pocket. Lock eyes · recognize multiple pockets · hold the visual lock as you start moving.

**5KW:** POCKET · EYES · DISTANCE · SPEED · POSITION

### Stage 6 — Paddle Speed + Angle (STP-027 + STP-029)

Now you commit. With precision. Choose your speed (V1, V2, V3, V4) based on distance + energy + time. Choose your angle (Option 1, 2, or 3) based on position. Say it out loud: *"V3, Option 2"*.

**Coach cue chain:** Look at pocket → Read stage → Angle → Scan de wave

### Stage 7 — Cobra + Pick Line (STP-034) ⭐ Generate TIME

The wave catches you. NOW. Hands at rib height · cobra · pick your line · stay prone first second or two (Line Hold) · feel the TIME.

**This is the doctrinal heart of Yellow Belt:** Cobra + Line = TIME.

**5KW:** CATCH · COBRA · LINE · TIME · POP

### Stage 8 — Pop-Up + Foot Position (STP-030)

You have TIME. Use it. Look forward · hands at ribs · drag back foot · hips DOWN, head UP · weight on FRONT foot · land FP2 by default.

**Don't release the board until you're stable.**

**5KW:** COBRA · SPACE · DRAG · LAND · SHUFFLE

### Stage 9 — Posture + Up/Down (STP-031) — THE INTEGRATION

You're up. Now you SURF. Enter posture · start the up/down cycle · compress on the way down · before flat → rotate up, extend · before exiting → flex, posture, rotate down · repeat for as many cycles as the wave allows.

**The Two Lines image:** lip on top, flat on bottom. Bounce between them like ping-pong. Never cross.

**5KW:** DOWN · COMPRESS · UP · EXTEND · STAY

### Stage 10 — Out from the Shoulder (STP-032)

The wave is ending. You don't wait for it to end you. Read the end section · identify the shoulder · start the turn · maintain · exit cleanly · dismount calmly.

> *"Exit with elegance and calm, not with turbulence."*

**5KW:** READ · SHOULDER · TURN · EXIT · CALM

### Stage 11 — Feedback + Reflection (One Wave Principle)

One wave. One reflection. Every time. Answer the 5 canonical questions:
1. What did I want to do?
2. What did I actually do?
3. What worked?
4. What failed?
5. What do I adjust for the next one?

---

## How to use Module 7 in your practice

**Method 1 — Mental rehearsal (between sessions):** Walk through all 11 stages in your head. Visualize each transition. Identify which stages feel weakest — that's where to focus next session.

**Method 2 — Single-wave audit (in the water):** Pick ONE wave per session. After it ends, mentally walk through all 11 stages of that specific wave. Where did the chain break? Note it.

**Method 3 — Coach validation (when ready for graduation):** Execute the full chain in front of a certified L1+ coach. If they can observe all 11 stages flowing with consistency, you're ready for Module 8.

---

> **Module 7 graduation criterion:** You can execute the full chain consistently across at least 3 different waves in 2 different sessions — not perfectly, but **with the structure intact**. Errors are expected. Skipping stages is not.$$,
  estimated_minutes = 25
WHERE id = 'YB-MOD-7';

-- ─── YB-MOD-8 · Yellow Belt Exit Test ───
UPDATE lessons SET
  title = 'Module 8 — Yellow Belt Exit Test',
  subtitle = '5 categories · 13 criteria · path to Blue Belt',
  pillar = 'Certification · Exit Test',
  description_md = $$**Belt status:** YB → Blue Belt transition
**Goal:** Certify you earned Yellow Belt and are ready for Blue.

## The doctrinal threshold

> *Yellow Belt is not awarded for perfection. It is awarded for consistent attempts with structural knowledge.*

The student who passes Module 8 has earned the right to say:

> *"I read the ocean. I earn my waves. I draw on them. And when the wave is too big, I know it and I respect it."*

## The 5 Categories · 13 Criteria

### Category 1 — Performance Test (water)
- [ ] 1.1 Execute one complete YB sequence on a real wave (Module 7 chain)

### Category 2 — Etiquette & Lineup
- [ ] 2.1 Etiquette rules incorporated as behavior (not just memorized)
- [ ] 2.2 Lineup self-management — know where to sit, when to paddle, when to yield

### Category 3 — Survival Skills (WB carryover)
- [ ] 3.1 Turtle Roll — executes correctly
- [ ] 3.2 Duck Dive — efficient, doesn't lose position
- [ ] 3.3 Exits the impact zone — under pressure
- [ ] 3.4 "Stays alive" — conscious safety behavior

### Category 4 — Wave Reading & Decision Making
- [ ] 4.1 Understands how waves break — can explain + demonstrate
- [ ] 4.2 Goes to the pocket — active positioning
- [ ] 4.3 Attacks the wave — decisive paddle-in
- [ ] 4.4 Performs good venue analysis
- [ ] 4.5 Knows entry/exit points
- [ ] 4.6 Identifies if conditions match level — Go/No-Go

### Category 5 — Sequence Execution with CONSISTENCY (the big one)
- [ ] 5.1 Executes YB sequence parts with consistency — wave after wave
- [ ] 5.2 Connects with the board consistently
- [ ] 5.3 Frontside ↔ Backside
- [ ] 5.4 Exits through the shoulder
- [ ] 5.5 WB sequence parts executed with **more consistent mastery than at WB level**

## The Threshold

You pass when:
- ✅ ≥1 complete YB sequence (Module 7) executed on a real wave
- ✅ Categories 2–4 demonstrated consistently across **≥2 different sessions**
- ✅ Category 5 (consistency) observable wave-after-wave

**Not perfection. Consistency.**

## The Big Three errors that say "not ready yet"

If any of these 3 are consistently present, you are NOT ready for Blue Belt yet:

1. **ERR-YB-A3** — Not choosing the line
2. **ERR-YB-A4** — Going straight to the flat
3. **ERR-YB-A1** — Skipping steps of the sequence

If these are gone (or rare): you're ready.

---

> **YB graduation:** when a certified L1+ coach validates your Module 7 + Module 8 performance, you earn Yellow Belt. Blue Belt unlocks.$$,
  estimated_minutes = 30
WHERE id = 'YB-MOD-8';
