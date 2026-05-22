-- M65 — Seed the Yellow Belt Coach Course.
--
-- Source: /Users/marcelocastellanos/Desktop/1111/
--         _TSS_UNIFIED_COURSE_WB_YB_v1/COACH_COURSE/
--         TSS_UNIFIED_COACH_COURSE_v1.md
--
-- This migration mirrors the WB Coach Course structure (course_section =
-- 'coach_wb' with COACH-* prefixes) and creates the YB Coach Course as
-- course_section = 'coach_yb'. 11 lessons total:
--   - COACH-YB-FOUND-01  Coach Foundations + Frameworks (PART I+II, YB scope)
--   - COACH-YB-ONB-01    Teaching the YB Belt Value Shift (Module 4, PART VII)
--   - COACH-STP-027..029, 033, 034  Sequence 6.0 teaching layer (PART VIII)
--   - COACH-STP-030..032 Sequence 7.0 teaching layer (PART IX)
--   - COACH-YB-MOD-7     Coaching The Complete Ride (PART X)
--   - COACH-YB-MOD-8     Administering YB Exit Test (PART XI)
--
-- Every description_md is lifted verbatim from PART VIII–XI of the
-- Unified Coach Course doc — How to Teach / How to Correct / How to
-- Validate. Zero invention.
--
-- Idempotent: ON CONFLICT (id) DO UPDATE on every row.

INSERT INTO lessons (
  id, course_section, step_number, title, subtitle, pillar,
  description_md, estimated_minutes, prerequisites,
  lesson_type, display_order, active
) VALUES

-- ─── COACH-YB-FOUND-01 ───
('COACH-YB-FOUND-01', 'coach_yb', 1,
 'YB Coach Foundations + Frameworks',
 'Authorization, mindset, EDPF · Triad · Five Locations · Safety Override (YB scope)',
 'Coach · Foundations',
 $$# Part I — Coach Foundations (YB scope)

## I.1 — Your authorization

Per Core Canon §D.1, **L1 Foundation Coach** authorizes you to teach:
- Pre-Course (Module 0)
- White Belt Onboarding (Module 1)
- White Belt Sequences 1–5 (Module 2)
- White Belt Exit Test (Module 3)
- Yellow Belt Belt Value (Module 4)
- Yellow Belt Sequence 6.0 (Module 5)
- Yellow Belt Sequence 7.0 (Module 6)
- The Complete Ride (Module 7)
- Yellow Belt Exit Test (Module 8)

You are NOT authorized to teach Blue Belt or above without further certification.

## I.2 — Coach-Student Ratios

| Context | L1 Foundation Coach | L2+ |
|---|---|---|
| Pre-Course (land/calm water) | ≤6 students | ≤8 |
| White Belt (whitewater + small green) | ≤6 students | ≤8 |
| Yellow Belt (green-wave lineup) | **≤4 students** | ≤6 |

YB ratio is tighter because the green-wave environment increases supervision load.

## I.3 — Mindset before any session

### 1. The student WILL fail a lot at YB
This is expected. Your job is not to prevent failure — your job is to **frame failure as information**.

> *"They still make many mistakes."* — Marcelo

### 2. Consistency, not perfection
WB threshold = knowledge of the structure. YB threshold = consistency of execution. **Inflated belts compromise the entire system.**

### 3. The 6 doctrinal principles you'll come back to constantly
1. **Cobra + Line = TIME** (STP-034) — the most important YB principle
2. **External × Internal = sustained line** (STP-031)
3. **"Exit with elegance, not with turbulence"** (STP-032)
4. **Errors are signals, not failures** (Error Taxonomy)
5. **"Endurance and enjoyment are not opposites"** (YB Belt Value)
6. **The pop-up is DISCONNECT → RECONNECT** (STP-030)

Memorize these. You'll use them every session.

---

# Part II — The Teaching Frameworks

## II.1 — The EDPF Delivery Cycle (Core Canon §C.3)

Every drill, every STP, every session runs on this cycle:

| Step | What you do |
|---|---|
| **E — Explain** | State the objective + the why. Use a metaphor when possible. |
| **D — Demonstrate** | Show correct execution from multiple angles. Narrate while you do. |
| **P — Participate** | Student attempts with your support. Stay close. Give immediate cues. |
| **F — Feedback** | Evaluate + adjust **immediately** after the wave. **Validate the decision first, then correct technique.** |

> Doctrinal rule: Never technique before decision. *"Why did you choose that line?"* before *"Move your hand here."*

## II.2 — The Triad — Your Decision Tool

Every decision you make as a coach evaluates 3 variables:
- **Surfer** — belt level + capacity + state of the day (physical, mental, emotional)
- **Ocean** — swell, tide, wind, current, crowd, hazards
- **Task** — the mission (the only variable YOU control)

**Rule:** Adjust the Task to fit what the Surfer and the Ocean allow. Don't force a mission that doesn't match.

## II.3 — The Five Locations

1. **Land** — biomechanics (Classical)
2. **Surfskate** — carving bridge, intermediate variability
3. **Calm water** — paddle, pop-up, technique without chaos
4. **Small waves** — Ecological begins, real-wave technical integration
5. **Challenging waves** — decision-making under pressure

**For YB:** Small + Challenging Waves dominate, but always have Surfskate/Land available for re-drilling.

## II.4 — Conditions & Safety Override

| Variable | White Belt | Yellow Belt |
|---|---|---|
| Wave Height | 1–2 ft | 2–3 ft |
| Period Min. | 6 sec | 8 sec |
| Depth | Waist | 2–3 ft |
| Current | Weak | Weak–Med |
| Wind | Light | Light–Med |

### Safety Override Rule (absolute)
> **Ocean conditions always override belt level. The coach makes the final operational decision.**

If today's conditions exceed the student's safety threshold, the answer is **No-Go**, regardless of how excited the student is. **No commercial, competitive, or reputational exceptions.**$$,
 25, ARRAY['COACH-WB-EXIT-TEST']::text[], 'lesson', 1, true),

-- ─── COACH-YB-ONB-01 ───
('COACH-YB-ONB-01', 'coach_yb', 2,
 'Teaching the YB Belt Value Shift',
 'Module 4 — Proceso / Resiliencia delivery',
 'Coach · Belt Value · Mental',
 $$# Module 4: Teaching the YB Belt Value Shift

**Goal:** Help the student make the mental shift from White Belt Humildad to Yellow Belt Proceso/Resiliencia.

## The doctrinal shift you're facilitating

At White Belt, the student internalized humility — *"I am beginning. I don't know everything."*

At Yellow Belt, the student must internalize resilience — *"I accept this is hard. I accept I will fail. I keep showing up."*

This is not a technical shift. It's a **mental shift**. You can't teach it in one session — you can frame it.

## How to deliver this module

**Suggested delivery (1 session, ~45 minutes):**

1. **Read the long form** (from the Student Course PART VI) aloud to the student. Pause between paragraphs.
2. **Ask them to reflect** — verbally — on their WB experience. How many waves did they miss? How often did they fall? How did they feel about it?
3. **Reframe** — *"All those falls were not failures. They were the training. At Yellow Belt, the falls don't stop. What changes is YOUR relationship to them."*
4. **Read the closing phrase** with them: *"Yellow Belt grows through resilience: accept the fall, return to the wave, play with the sea."*
5. **Set the intention** — *"For the next 3 sessions, every time you fall, I want you to say out loud: 'OK. Information. Next wave.' That is resilience in practice."*

## Pass criterion for Module 4

Student articulates, in their own words, what the shift from humility to resilience means for them personally. There is no quiz here — it's a check-in conversation. When they can talk about it, they're ready for Sequence 6.$$,
 20, ARRAY['COACH-YB-FOUND-01']::text[], 'lesson', 2, true),

-- ─── COACH-STP-027 ───
('COACH-STP-027', 'coach_yb', 3,
 'Teaching STP-027 — Paddling Speeds 1–2–3–4',
 'EDPF delivery + corrections + validation',
 'Coach · Sequence 6.0',
 $$# STP-027 — Paddling Speeds 1–2–3–4

## How you teach it

**EXPLAIN — the car gears metaphor:** V1 = idle / parking lot. V2 = city driving. V3 = highway. V4 = emergency. Limited gas tank → choosing speed = choosing energy investment.

**DEMONSTRATE:** Show 4 cadences on land first, counting out loud. Then in water, narrate as you go: *"This is V2 — I feel I'm moving without getting tired... Now V3, I want to reach the peak with 5 seconds of margin..."*

**PARTICIPATE:**
- Phase 1 (classical): on the board in calm water. You call out V1/V2/V3/V4. Student switches on command. 3 minutes.
- Phase 2 (ecological): in lineup. After every paddle attempt, you ask *"what speed did you use and why?"*

**FEEDBACK:** Visual (4 distinct speeds observable?) + Decisional (correct speed for context?). Always validate decision first, then technique.

## How you correct it

| Error | Immediate correction |
|---|---|
| Always V4 (panic) | *"You're burning the tank. What speed does this situation actually need?"* |
| Short stroke | *"Push all the way past your hip — that's where the power is."* |
| Doesn't breathe in sprint | *"V3 and V4 use 1:1 breathing — one stroke, one breath."* |
| Speed vs cadence confusion | *"You're paddling fast but not advancing. It's reach + power, not cadence."* |

## How you validate it

**Visual:** Student paddling to peak chooses correct speed without instruction in 3 of every 4 attempts, across 2 consecutive sessions.

**Theoretical:** *"Explain when you use V2 vs V3, and why not always V4."* Expected answer covers sustainable energy vs sprint, distance reading, fatigue cost.$$,
 25, ARRAY['COACH-YB-ONB-01']::text[], 'lesson', 3, true),

-- ─── COACH-STP-033 ───
('COACH-STP-033', 'coach_yb', 4,
 'Teaching STP-033 — Reading Wave Stages 1–4',
 'Stage identification in the lineup',
 'Coach · Sequence 6.0',
 $$# STP-033 — Reading Wave Stages 1–4 in the Lineup

## How you teach it

**EXPLAIN — bicycle metaphor:** *"Waves travel as energy. When they hit a shallow bottom, they break — just like a bicycle hitting a rock will throw you forward. Same physics."*

Walk through the 4 stages with hand motions: flat horizontal → lifting → curling → flat baja.

**DEMONSTRATE:** Watch real waves from shore for 10 minutes BEFORE entering water. Point at each wave, call out the stage as it changes. Have student repeat.

**PARTICIPATE:**
- Phase 1 (classical, dry): student watches from shore, calls stages aloud.
- Phase 2 (ecological, in water): in the lineup, before each set, student announces the stage of incoming waves.

**FEEDBACK:** Identification correct? Predicted where wave would break BEFORE it arrived?

## How you correct it

| Error | Correction |
|---|---|
| No complete scan | *"Eyes go left to right. The whole wave, not just what's in front."* |
| Tunnel vision | *"What's happening on the OTHER side of the wave?"* |
| Doesn't identify type | *"Is this a left? A right? Closing? Wall? Just a peak?"* |
| Confuses Stage 1 with Stage 2 | *"Stage 1 cannot be caught. Don't waste energy. Wait for it to lift."* |

## How you validate it

**Visual:** Student in lineup, before each set, correctly identifies stages of incoming waves at least 8 of 10 times.

**Theoretical:** *"What type of waves do you see? Lefts, rights, closeouts? On specific waves, tell me the stages and where it'll break first."*$$,
 25, ARRAY['COACH-STP-027']::text[], 'lesson', 4, true),

-- ─── COACH-STP-028 ───
('COACH-STP-028', 'coach_yb', 5,
 'Teaching STP-028 — Chase the Pocket',
 'Pocket identification + paddle-in commitment',
 'Coach · Sequence 6.0',
 $$# STP-028 — Chase the Pocket

## How you teach it

**EXPLAIN:** The pocket is **the part of the wave that's about to break** — where the energy is concentrated. Most beginners see "the wave" as one thing — you're teaching them to see the **specific point** within it.

**Doctrinal connection (always say this):** *"Remember the 4 speeds from STP-027? They exist exactly for this — to calculate the distance to the pocket. They're a system."*

**DEMONSTRATE:** From shore, watch waves, point at pockets. *"There. There. That one has two — left and right. There."* Have student repeat.

**PARTICIPATE:**
- DRL-YB-028-01 Visual Tracking — student tracks each wave with eyes, points at the pocket.
- DRL-YB-028-02 Paddle-and-Turn — paddle deep, turn around immediately. Self-calibration of distance.

**FEEDBACK:** When you ask "where's the pocket?" can the student point at it instantly?

## How you correct it

| Error | Correction |
|---|---|
| Whole wave as mass | *"Show me ONE point — that's the pocket. Not the whole wave."* |
| Sits and waits | *"You can't sit and wait. Go toward where the pocket WILL be."* |
| Turns and paddles too early | *"Where is the wave going? Wait until you see it, then commit."* |

## How you validate it

**Visual:** Student maintains visual contact throughout paddle-in, ends well-positioned in 3 of every 4 attempts.

**Theoretical:** *"Where is the pocket in that wave?"* (pointing at real wave).$$,
 25, ARRAY['COACH-STP-033']::text[], 'lesson', 5, true),

-- ─── COACH-STP-029 ───
('COACH-STP-029', 'coach_yb', 6,
 'Teaching STP-029 — Paddle with the Correct Angle',
 'Choosing the entry angle into the pocket',
 'Coach · Sequence 6.0',
 $$# STP-029 — Paddle with the Correct Angle

## How you teach it

**EXPLAIN:** *"You can't choose the right angle if you don't know where the pocket is. This step DEPENDS on STP-028 and STP-033."*

Show the 3 options + the variable (lip vs whitewater).

**DEMONSTRATE — the integrated cue chain:** *"Look at the pocket → Read the stage → Angle → Scan de wave."* Show how previous 3 STPs integrate into one decision.

**PARTICIPATE:**
- DRL-01 Spot & Paddle — see pocket → paddle to position
- DRL-02 Deep Position — practices Option 1
- DRL-03 Paddle + Catch + Cobra — bridge to STP-034

**FEEDBACK:** Did they choose the right option for that wave? Could they explain why?

## How you correct it

| Error | Correction |
|---|---|
| Paddles away from pocket | *"Wrong direction. The pocket is THERE."* |
| Paddles in Stage 1 | *"That wave can't be caught yet. Save your energy."* |
| Paddles too close to pocket | *"You're going to take the lip on the rail. Adjust the angle."* |

## How you validate it

**Visual:** Student chooses one of the 3 options based on context, reaches pocket without last-second adjustments.

**Theoretical:** *"Before paddling, tell me: what stage is the wave in, where's the pocket, and what angle are you going to use?"*$$,
 25, ARRAY['COACH-STP-028']::text[], 'lesson', 6, true),

-- ─── COACH-STP-034 ───
('COACH-STP-034', 'coach_yb', 7,
 'Teaching STP-034 — Cobra + Pick Line',
 'The doctrinal heart of YB: line = TIME',
 'Coach · Sequence 6.0',
 $$# STP-034 — Cobra + Pick Line

## How you teach it

**EXPLAIN — the doctrinal heart of YB:**
> *"Cobra + correct line = TIME. TIME = a calm pop-up, the ability to pass sections, the control to stand up when YOU choose. Without line selection → board to flat → loses speed → loses balance → wipeout or rushed pop-up. The LINE is what gives you TIME."*

**WB vs YB framing:** *"You did the cobra at White Belt — but in whitewater. Here it's on a green wave. There it was a movement. Here it's a decision."*

**DEMONSTRATE:** In the water, narrate as you catch a wave: *"OK — caught the wave. Nose pointing toward foam. Cobra now — redirect. I'm choosing this line. Look how I have time. Now I can pop up calmly..."*

**PARTICIPATE — DRL-YB-034-01 — Line Hold:** Student catches wave → cobra + line → **surfs lying down for at least 5 seconds**. Feels the TIME. Then pops up.

**FEEDBACK:** Did they choose a line, or just turn the board randomly? Did they generate TIME? Was the pop-up calm or rushed?

## How you correct it

| Error | Correction |
|---|---|
| No cobra → nose digs | *"Hands at the ribs. Push up + redirect. The nose can't dig in."* |
| Cobra too strong | *"It's a redirect, not a wrestling move. Smooth."* |
| Cobra without line | *"Where do you want to GO? Not just turn — turn TOWARD something."* |
| Wrong line → flat | *"That line goes to the flat. Try this one."* (point at correct line) |

## How you validate it

**Visual:**
- Cobra + redirect within 1–2 seconds of catching
- Speed maintained ≥5 seconds after cobra
- Pop-up while still in trim (not rushed)

**Theoretical (post-action):** *"After that wave: what line did you choose, and why? How much time did it give you before the pop-up?"*

## WB Repeats in Sequence 6.0 (positions 6, 7, 8)

Pop Up centered (WB STP-013), Turn L/R (WB STP-014), Dismount (WB STP-015) are now repeated in green-wave context. You don't re-teach them — you **observe execution** and correct based on what now needs to be more consistent than at WB.$$,
 30, ARRAY['COACH-STP-029']::text[], 'lesson', 7, true),

-- ─── COACH-STP-030 ───
('COACH-STP-030', 'coach_yb', 8,
 'Teaching STP-030 — Pop Up + Foot Position 1 or 2',
 'Refined pop-up + FP1/FP2/FP3 vocabulary + shuffle',
 'Coach · Sequence 7.0',
 $$# STP-030 — Pop Up + Foot Position 1 or 2

## How you teach it

**EXPLAIN — three layers:**
1. The pop-up itself (refined from WB)
2. FP1/FP2/FP3 vocabulary (the new canon)
3. The shuffle FP1↔FP2 (the new skill)

**Doctrinal definition:** *"The pop-up is the moment of DISCONNECT → RECONNECT. Done right, the board feels like an extension of you."*

**The 3 methods — let the student pick what feels best.** Don't force one over another.

**DEMONSTRATE:** Use a mat on land first. Show all 3 methods. Show foot landing FP2. Show shuffle to FP1 and back.

**PARTICIPATE — heavy classical:**
1. Mat repetitions with center line
2. Pop-up reps (all 3 methods)
3. Foot shuffle FP1↔FP2 keeping front foot centered
4. Visualization with breathing
5. Then in water: connected pop-up
6. Final: pop-up while ALREADY surfing (ecological — not 2 separate actions)

**FEEDBACK:** Hips down + head up + looking forward + weight on front foot?

## How you correct it

| Error | Correction |
|---|---|
| Releases board too early | *"Don't let go until you feel STABLE. Hips down first."* |
| Weight on back foot | *"Weight on the FRONT foot — your back foot is taking you backwards."* |
| Not looking forward | *"Eyes forward. Where you look is where you go."* |
| Hands too forward | *"Hands at your ribs. You're blocking the space for your knee."* |
| Looking down | *"Look at the horizon, not your feet."* |
| Goes to flat | *"You didn't generate TIME. Go back to STP-034."* |

## How you validate it

**Visual:**
- Lands FP2 by default without correction
- Demonstrates FP1↔FP2 shuffle when wave invites
- Pop-up connected (hips down, head up, eyes forward, weight front)

**Theoretical:** *"After your pop-up: where did your back foot land? When would you shuffle to FP1, when to FP2? Why does the front foot stay centered?"*$$,
 30, ARRAY['COACH-STP-034']::text[], 'lesson', 8, true),

-- ─── COACH-STP-031 ───
('COACH-STP-031', 'coach_yb', 9,
 'Teaching STP-031 — Go Up and Down',
 'The integration step: external × internal = sustained line',
 'Coach · Sequence 7.0',
 $$# STP-031 — Go Up and Down (THE INTEGRATION STEP)

## How you teach it

**EXPLAIN — the integration:**
> *"You're NOT learning new techniques here. You're connecting EVERYTHING you've learned. Pocket reading + angle + cobra+line + pop-up + foot position — they all come together NOW into one continuous ride."*

**The doctrinal principle:**
> *"External force (the wave) × Internal force (your body's compression-extension) = sustained line. Don't go to the flat. Don't leave the wave."*

This is **the threshold step** — between *"I caught a wave"* and *"I am surfing."*

**DEMONSTRATE:** Show the full sequence from start to finish on a real wave. Narrate the up/down cycle.

**PARTICIPATE — 6 drills:**
1. Up/Down Cycle
2. Frontside Pump
3. Backside Pump
4. Pocket Proximity (slow wave)
5. Surfskate (classical bridge)
6. **Two Lines / Ping-Pong** ⭐ — the killer drill

The Two Lines drill is **constraint-led pure**. The technique EMERGES from the visual constraint, not from your instruction.

**FEEDBACK:** How many cycles? Did they go to flat? Both sides?

## How you correct it

| Error | Correction |
|---|---|
| Goes to flat | *"Two Lines drill. You crossed the bottom line. Stay in the energy."* |
| Leaves wave too early | *"You had more energy. Stay on it longer."* |
| Passive body | *"Compress on the way down. Extend on the way up. You're just standing."* |
| Up/Down separated from sequence | *"This isn't a new skill. Everything from STP-027 onward stays. Up/Down is the FLOW."* |
| Only one side | *"Frontside AND backside. Same theory, different mechanics. Practice both."* |

## How you validate it

**Visual:** Sustains ≥3 pump cycles in a single ride without going to flat. Can do both frontside and backside.

**Theoretical:** *"After that wave: when did you extend, when did you compress? How many cycles? Did you go to the flat or stay in the energy?"*$$,
 30, ARRAY['COACH-STP-030']::text[], 'lesson', 9, true),

-- ─── COACH-STP-032 ───
('COACH-STP-032', 'coach_yb', 10,
 'Teaching STP-032 — Out from the Shoulder',
 'The third exit: active, elegant, decided',
 'Coach · Sequence 7.0',
 $$# STP-032 — Out from the Shoulder

## How you teach it

**EXPLAIN — the 3rd exit:**
*"WB taught you the lying dismount and the star fall. YB adds the third option — the **active exit through the shoulder**. Different from dismount because it's a DECISION, not just leaving."*

**The doctrinal phrase:**
> *"Exit with elegance and calm, not with turbulence."*

**The 4 use cases:** Avoid lip · Avoid going straight · Avoid bad position · Abort mission (etiquette).

**DEMONSTRATE:** From shore, watch waves, call out ideal shoulder exit point for each. *"That shoulder there. That one too. This one closes — no clean exit available."*

**PARTICIPATE:**
1. Visual ID from shore
2. Short ride + early exit (catch + 5 sec + shoulder exit)
3. Coach-called exit (you yell "EXIT!" mid-wave, student must execute immediately)

**FEEDBACK:** Did they identify the shoulder before turning? Did they exit calmly or with turbulence?

## How you correct it

| Error | Correction |
|---|---|
| Doesn't identify shoulder in time | *"Look ahead, not at your feet. Read the end section earlier."* |
| Exits straight | *"You're going to the flat far from lineup. Turn toward the shoulder."* |
| Rides past decision | *"You had the moment. Exit when you see the shoulder, not after."* |
| Star fall when shoulder available | *"Star fall is for safety. This was a moment for an active exit."* |

## How you validate it

**Visual:** Student exits through the shoulder by choice ≥2 times in a single session, with calm landings (no wipeout, no turbulence).

**Theoretical:** *"Did you exit through the shoulder, or did the wave take you? What stage was the shoulder in when you turned? Why did you choose that moment?"*$$,
 25, ARRAY['COACH-STP-031']::text[], 'lesson', 10, true),

-- ─── COACH-YB-MOD-7 ───
('COACH-YB-MOD-7', 'coach_yb', 11,
 'Coaching The Complete Ride',
 'Module 7 — coach the integration, not new content',
 'Coach · Integration',
 $$# Module 7 — Coaching The Complete Ride ⭐

**This module is unique to the unified course. Coach approach is different from individual STPs — your job here is to coach the INTEGRATION.**

## Your role

Module 7 has no new content. Your job is to:
1. **Observe** the student executing the full 11-stage chain
2. **Diagnose** where the chain breaks for each individual student
3. **Re-drill** the specific STP that's causing the chain to break
4. **Re-test** the chain
5. **Repeat** until the chain flows with consistency

## The 11-stage chain (recap)

1. Venue Analysis
2. Warm-Up + Bisagra
3. Paddle Out
4. Scan Wave Stages (STP-033)
5. Identify Pocket (STP-028)
6. Paddle Speed + Angle (STP-027 + STP-029)
7. Cobra + Pick Line (STP-034) ⭐
8. Pop-Up + Foot Position (STP-030)
9. Posture + Up/Down (STP-031) — integration
10. Out from the Shoulder (STP-032)
11. Feedback + Reflection (One Wave)

## How to coach this module

### Method 1 — Single-wave audit (recommended primary method)

Pick ONE wave per session. After it ends, walk through all 11 stages with the student verbally:

*"Stage 1 — did you do venue analysis? What did you read?"*
*"Stage 4 — what stage was that wave when you started paddling?"*
*"Stage 7 — did you cobra? Did you pick a line? Did it give you time?"*

Identify the **first stage that broke**. Drill that STP next session. Don't try to fix the whole chain at once.

### Method 2 — Sequential walkthrough

For students who struggle with the integration concept, do a **dry run on the beach**:
- Stand them on the sand
- Walk through all 11 stages verbally + with body motion
- Ask them to verbalize each transition

When the chain is clear in their head, take it to water.

### Method 3 — Progressive consistency (the graduation method)

For students approaching Yellow Belt graduation:
- Coach 3 waves per session
- Audit each one through the chain
- Count: how many stages flowed cleanly per wave?
- Target: ≥9 of 11 stages on at least 3 waves per session

When this is consistent across 2 different sessions, the student is ready for Module 8.

## Common breakdowns by stage (diagnostic table)

| Stage | Common breakdown | Fix |
|---|---|---|
| 1 — Venue Analysis | Student doesn't do it (ERR-YB-B3) | Make it a non-negotiable ritual before every session |
| 2 — Bisagra | Cold entry, low activation | Add a 30-Second Pre-Session Ritual |
| 3 — Paddle Out | Inefficient, exhausted on arrival | Re-drill WB Survival skills (duck dive, sweet spot) |
| 4 — Scan Stages | Tunnel vision (ERR-YB-033-02) | Re-drill STP-033 from shore |
| 5 — Identify Pocket | Sees wave as mass (ERR-YB-028-01) | Re-drill STP-028 Visual Tracking |
| 6 — Speed + Angle | Wrong choices (ERR-YB-029-01/02/03) | Re-drill STP-027 + STP-029 individually |
| 7 — Cobra + Line | The biggest source of failure (ERR-YB-A3) | Line Hold drill until TIME is felt |
| 8 — Pop-Up | Disconnected (ERR-YB-A9) | Mat reps + Method clarification |
| 9 — Up/Down | Goes to flat (ERR-YB-A4) | Two Lines / Ping-Pong drill |
| 10 — Shoulder Exit | Star falls instead (ERR-YB-032-04) | Coach-called exit drill |
| 11 — Reflection | Skipped | Make the 5 questions mandatory after every wave |$$,
 35, ARRAY['COACH-STP-032']::text[], 'lesson', 11, true),

-- ─── COACH-YB-MOD-8 ───
('COACH-YB-MOD-8', 'coach_yb', 12,
 'Administering the YB Exit Test',
 'Module 8 — your authority and the 5 categories · 13 criteria',
 'Coach · Evaluation',
 $$# Module 8 — Administering the Yellow Belt Exit Test

## Your authority and responsibility

As an L1+ coach, you administer the YB Exit Test. **Your sign-off determines whether the student earns Yellow Belt.**

> **NEVER sign off a student before they demonstrate consistency** — even if commercial or schedule pressure pushes you. Inflated belts compromise the entire system. This is the single most important rule of your authorization.

## The 5 Categories · 13 Criteria (checklist)

### Category 1 — Performance Test (water)
- [ ] 1.1 Execute one complete YB sequence on a real wave (Module 7 chain)

### Category 2 — Etiquette & Lineup
- [ ] 2.1 Etiquette rules incorporated as behavior
- [ ] 2.2 Lineup self-management

### Category 3 — Survival Skills (WB carryover)
- [ ] 3.1 Turtle Roll
- [ ] 3.2 Duck Dive (efficient)
- [ ] 3.3 Exits impact zone
- [ ] 3.4 "Stays alive" (conscious safety)

### Category 4 — Wave Reading & Decision Making
- [ ] 4.1 Understands how waves break
- [ ] 4.2 Goes to the pocket
- [ ] 4.3 Attacks the wave
- [ ] 4.4 Venue analysis
- [ ] 4.5 Entry/exit points
- [ ] 4.6 Conditions Go/No-Go

### Category 5 — Sequence Execution with CONSISTENCY ⭐
- [ ] 5.1 Executes YB parts with consistency
- [ ] 5.2 Connects with board consistently
- [ ] 5.3 Frontside ↔ Backside
- [ ] 5.4 Exits through shoulder
- [ ] 5.5 WB parts with more consistent mastery than at WB level

## The Threshold (when to sign off)

Student passes when:
- ✅ ≥1 complete YB sequence executed on a real wave
- ✅ Categories 2-4 demonstrated across **≥2 different sessions**
- ✅ Category 5 (consistency) observable wave-after-wave

**Not perfection. Consistency.**

## The 3 disqualifying errors (Big Three)

If the student exhibits these 3 errors consistently → **DO NOT SIGN OFF**:

1. **ERR-YB-A3** — Not choosing the line
2. **ERR-YB-A4** — Going straight to the flat
3. **ERR-YB-A1** — Skipping steps of the sequence

These three together mean the chain is broken. Send the student back to STP-034 + STP-031 drills. Re-test in 2 weeks.

## Closing principle

> *Yellow Belt is not awarded for perfection. It is awarded for consistent attempts with structural knowledge.*

When you sign off a Yellow Belt, you are certifying that this student is ready for Blue Belt — for named maneuvers built on this foundation. If you signed off too early, you'll see them crash at Blue Belt and the system will (rightly) trace it back to you.

**Sign off with integrity. Always.**$$,
 30, ARRAY['COACH-YB-MOD-7']::text[], 'lesson', 12, true)

ON CONFLICT (id) DO UPDATE SET
  course_section = EXCLUDED.course_section,
  step_number    = EXCLUDED.step_number,
  title          = EXCLUDED.title,
  subtitle       = EXCLUDED.subtitle,
  pillar         = EXCLUDED.pillar,
  description_md = EXCLUDED.description_md,
  estimated_minutes = EXCLUDED.estimated_minutes,
  prerequisites  = EXCLUDED.prerequisites,
  lesson_type    = EXCLUDED.lesson_type,
  display_order  = EXCLUDED.display_order,
  active         = EXCLUDED.active;
