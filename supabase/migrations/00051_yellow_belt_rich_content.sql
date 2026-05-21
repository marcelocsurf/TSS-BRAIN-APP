-- M51 — Rich content for Yellow Belt STPs, matching the White Belt format.
--
-- Sources (literal extraction, then reorganized into the WB Theory-tab
-- section structure — no invented facts):
--   - TSS_YB_MASTER_MANUAL_v1_EN.md
--   - TSS_UNIFIED_COACH_COURSE_v1.md
--   - TSS_UNIFIED_STUDENT_COURSE_v1.md
--
-- Sections used (same as WB):
--   What you'll learn · Why it matters · Key concepts ·
--   What your body does (biomechanics) · 5 KEY WORDS ·
--   Coach cue · Pedagogical mode · Success indicators ·
--   Theoretical checkpoint
--
-- All copy is in English. Errors live in errors_md so the portal
-- renders the dedicated "Errors" tab — same as WB.
-- UPDATEs are idempotent; re-running is safe.

-- ─── STP-027 · Paddling Speeds 1–2–3–4 ───
UPDATE lessons SET description_md = $$## What you'll learn
Master the 4 levels of paddling speed and learn to apply them according to wave energy, distance to the peak, and tactical intention. Speed is not power — it is purposeful application of energy. V1 (30–40% cruising), V2 (50–60% working), V3 (70–80% catching), V4 (90–100% sprint).

## Why it matters
Paddling with the correct speed-to-context ratio determines energy management, catch-rate consistency, and whether the surfer arrives at the peak fresh or exhausted. The 4 speeds exist as a system to calculate arrival at the pocket with precision.

## Key concepts
Energy management; Sustainable paddling cadence; Reach-and-power mechanics; Breathing timing in sustained effort; Context-driven speed selection.

## What your body does (biomechanics)
Elbow stays high throughout entry. Hand enters in front of the shoulder. Push extends through the hip. In V1–V2, maintain 2:1 breathing (two strokes, one breath). In V3–V4, shift to 1:1 breathing (one stroke, one breath). Full extension of the arm creates reach; power comes from engaging the core and shoulder rotation, not just arm strength.

## 5 KEY WORDS (memorize and recite while training)
SPEED · CADENCE · REACH · POWER · RHYTHM

## Coach cue
> "Match the speed to the wave, not the panic."

## Pedagogical mode
Hybrid — Classical on land / calm water (coach calls speeds aloud, student matches cadence) plus Ecological in the lineup (student selects speed and justifies the choice afterward).

## Success indicators
1. Demonstrates all 4 speeds on command without losing form.
2. Adjusts speed to context (distance to pocket + wave energy + time available) without instruction.
3. Sustains V3–V4 paddling ≥30 seconds without breathing collapse or form breakdown.

## Theoretical checkpoint
"Explain when you use V2 versus V3, and why not always V4." Expected answer covers energy sustainability, distance reading, and fatigue management.$$,
errors_md = $$| Code | Error | Why it hurts |
|---|---|---|
| ERR-045 | Always paddles in V4 | Panic-driven and unsustainable; collapses before the catch. |
| ERR-046 | Short stroke (ends before the hip) | No power transfer, no forward displacement. |
| ERR-047 | No breathing in sprint | Holds breath in V3/V4, collapses after 10–15 seconds. |
| ERR-048 | Confuses speed with cadence | Fast arm movement without real forward displacement. |$$
WHERE id = 'STP-027';

-- ─── STP-033 · Reading Wave Stages 1–4 in the Lineup ───
UPDATE lessons SET description_md = $$## What you'll learn
Re-deepen the Pre-Course concept of wave stages. At Pre-Course the stages were conceptual. At Yellow Belt, identify and predict the 4 stages of real moving waves in the lineup, understand when each stage can and cannot be caught, and read where each wave will break.

## Why it matters
Misidentifying wave stages leads to wasted energy paddling into Stage 1 (uncatchable), poor positioning for catch windows, and missing the optimal stages. Reading stages in real time is the foundation of tactical wave selection and energy efficiency.

## Key concepts
Wave energy progression; Stage identification on real waves; Prediction of the breaking point; Recognition of wave types (lefts, rights, closeouts, walled sections); Connection between bottom topography and break pattern.

## What your body does (biomechanics)
Eyes track waves from one side of the horizon to the other (full scan). Body position in the water shifts to maintain visual contact. Head positioning allows an upward gaze to monitor incoming sets. Subtle paddle adjustments keep the surfer placed to observe each wave's evolution without losing position.

## 5 KEY WORDS (memorize and recite while training)
SCAN · STAGE · PREDICT · POCKET · DECIDE

## Coach cue
> "Predict where the stage you are looking at will be — anticipate to meet."

## Pedagogical mode
Hybrid — Classical from shore (identifying stages on real waves before entering the water) plus Ecological in the lineup (student calls stages aloud before each set approaches).

## Success indicators
1. Identifies all 4 stages on real waves without coach assistance.
2. Predicts WHERE the wave will break BEFORE it arrives.
3. Understands the bottom type (sandbar, reef, rock) and reads wave breaking patterns in the same location across sets.

## Theoretical checkpoint
"What types of waves do you see — lefts, rights, closeouts? On specific waves, tell me the stages and where it'll break first."$$,
errors_md = $$| Code | Error | Why it hurts |
|---|---|---|
| ERR-YB-033-01 | Doesn't scan the full wave before deciding | Tunnel vision — only sees the nearest section, misses the broader pattern. |
| ERR-YB-033-02 | Tunnel vision | Focused on the wave approaching self, misses the set behind. |
| ERR-YB-033-03 | Doesn't identify wave type | Fails to distinguish lefts, rights, closeouts, walls. |
| ERR-YB-033-04 | Confuses Stage 1 with Stage 2 | Paddles into a wave that cannot yet be caught, wasting energy. |$$
WHERE id = 'STP-033';

-- ─── STP-028 · Chase the Pocket ───
UPDATE lessons SET description_md = $$## What you'll learn
Identify and actively position for "the pocket" — the area of the wave where energy concentrates most intensely, where the lip forms or foam begins. The pocket is not the whole wave; it is a specific point within the wave that contains maximum energy. Learn to locate it visually and maintain pursuit during paddle positioning.

## Why it matters
Most beginners see "a wave" as a monolithic object. The pocket-aware surfer sees the specific point within that wave where energy is concentrated. Pocket awareness transforms paddling from reactive to purposeful. The 4 speeds from STP-027 exist precisely so the surfer can calculate arrival at the pocket.

## Key concepts
Wave energy concentration; Geometric identification of the breaking point; Visual tracking without losing position; Multiple pockets (when waves close on both sides); Relationship between pocket location and optimal pop-up moment.

## What your body does (biomechanics)
Eyes maintain fixed visual contact on the identified point. The neck rotates subtly to keep the pocket in peripheral or direct vision while paddling. Stroke tempo adjusts to accelerate toward the pocket without over-commitment (which would force sprinting). Shoulders and torso align with the direction of paddle adjustment.

## 5 KEY WORDS (memorize and recite while training)
POCKET · EYES · DISTANCE · SPEED · POSITION

## Coach cue
> "Chase the pocket. Look at the pocket. Control your distance."

## Pedagogical mode
Hybrid — Visual tracking from shore, then a paddle-and-turn drill in the lineup where the student must maintain visual contact with the pocket throughout the approach.

## Success indicators
1. Identifies the pocket instantly when asked on real waves; can point at it without hesitation.
2. Recognizes multiple pockets when waves close on both sides.
3. Maintains visual contact with the pocket throughout the paddle-in approach.

## Theoretical checkpoint
"Where is the pocket on that wave?"$$,
errors_md = $$| Code | Error | Why it hurts |
|---|---|---|
| ERR-YB-028-01 | Sees the whole wave as one mass | Undifferentiated perception — no decision can be made. |
| ERR-YB-028-02 | Sits and waits for the pocket | Static positioning, no active pursuit. |
| ERR-YB-028-03 | Turns and paddles too early | Premature commitment — arrives before the pocket is ready. |$$
WHERE id = 'STP-028';

-- ─── STP-029 · Paddle with the Correct Angle ───
UPDATE lessons SET description_md = $$## What you'll learn
Choose the paddling angle based on WHERE the surfer is positioned relative to the pocket and WHAT stage the wave is in. There is no single "correct angle" — it changes with context. Learn the 3 paddling-angle options and the tactical logic for selecting each one.

## Why it matters
Incorrect paddling angle leads to arrival at the wrong time or wrong position, resulting in a weak catch window or a wipeout. This step depends entirely on mastery of STP-028 (pocket identification) and STP-033 (stage reading). Without those prerequisites, angle selection is guesswork.

## Key concepts
Pocket positioning relative to the surfer's current location; Wave-stage impact on approach angle; Three tactical options for angle selection; Relationship between angle, speed, and arrival timing; Distinction between Stage 1 (cannot be paddled) and Stage 2+ (catchable).

## What your body does (biomechanics)
Paddle direction shifts subtly based on the chosen angle — the upper body rotates at the torso to redirect paddling effort. The head positions early to sight the pocket before the wave arrives. Stroke power transfers directionally rather than straight ahead. This requires constant micro-adjustments in shoulder and torso alignment.

## 5 KEY WORDS (memorize and recite while training)
POCKET · STAGE · ANGLE · SCAN · PADDLE

## Coach cue
> "Look at the pocket. Read the stage. Choose the angle. Scan the wave."
> (Integrated chain from STP-028 → STP-033 → STP-029.)

## Pedagogical mode
Hybrid — Spot & Paddle drill (visual ID of pocket, then paddle to position); Deep Position drill (practices Option 1 angle); then Paddle + Catch + Cobra (bridges to STP-034).

## Success indicators
1. Selects one of the 3 angle options based on context, without coach instruction.
2. Reaches the pocket without a last-second frantic adjustment.
3. Does NOT paddle into Stage 1 — understands the wave is not yet catchable.

## Theoretical checkpoint
"Before paddling, tell me: what stage is the wave in, where's the pocket, and what angle are you going to use?"$$,
errors_md = $$| Code | Error | Why it hurts |
|---|---|---|
| ERR-YB-029-01 | Paddles in the opposite direction, away from the pocket | Effort goes to a place the wave will never reach. |
| ERR-YB-029-02 | Paddles in Stage 1 | Wave is not yet catchable — energy wasted before the real window opens. |
| ERR-YB-029-03 | Paddles toward the pocket when it is already too close | Takes the lip on the rail; collides with foam instead of catching. |$$
WHERE id = 'STP-029';

-- ─── STP-034 · Cobra + Pick Line ───
UPDATE lessons SET description_md = $$## What you'll learn
Execute the cobra (board redirection) on green moving waves while making a deliberate line selection. The cobra is not just a movement — it is a tactical decision of where to go on the wave. The correct line selection generates TIME: the calm space needed for a controlled pop-up.

## Why it matters
Cobra + correct line = TIME. TIME = the ability to pop up calmly, pass wave sections, and maintain balance. Without line selection, the board drifts to the flat, speed is lost, balance is lost, and the pop-up becomes rushed or ends in a wipeout. The line is what gives the surfer TIME.

## Key concepts
Board-redirection mechanics on moving water; Conscious line selection versus reactive turning; Speed maintenance through line choice; Time generation for pop-up execution; Wave-type awareness (type of break, direction, wall shape).

## What your body does (biomechanics)
Hands position at rib height (not extended forward). With the cobra: push upward through shoulders and arms while rotating the torso in the direction of the desired line. The board nose lifts and redirects smoothly — not a wrestling movement, but a controlled redirect. Body weight shifts subtly toward the desired line. This maintains speed and prevents the nose from diving.

## 5 KEY WORDS (memorize and recite while training)
CATCH · COBRA · LINE · TIME · POP

## Coach cue
> "Cobra and pick your line. Where do you want to go? Don't just turn — turn TOWARD something."

## Pedagogical mode
Ecological-dominant — only learned in the water, post-catch, on green moving waves. Line Hold drill: catch wave → cobra + line → surf prone ≥5 seconds (to FEEL the TIME generated) → then pop-up.

## Success indicators
1. Executes cobra + line redirect within 1–2 seconds of catching.
2. Maintains speed ≥5 seconds after the cobra.
3. Pop-up occurs while still in trim (not rushed) because the surfer generated TIME.

## Theoretical checkpoint
"After that wave: what line did you choose, and why? How much time did it give you before the pop-up?"$$,
errors_md = $$| Code | Error | Why it hurts |
|---|---|---|
| ERR-YB-034-01 | No cobra → the nose digs in | Nose doesn't lift, digs into water, ride ends. |
| ERR-YB-034-02 | Cobra too strong | Violent redirect; board loses speed or surfer loses balance. |
| ERR-YB-034-03 | Cobra without picking a line | Turning without a destination — random direction, no TIME generated. |
| ERR-YB-034-04 | Wrong line chosen → goes to the flat anyway | Correct cobra but destination leads to the flat; speed dies anyway. |$$
WHERE id = 'STP-034';

-- ─── STP-030 · Pop Up + Foot Position 1 or 2 ───
UPDATE lessons SET description_md = $$## What you'll learn
Pop up on green waves with conscious awareness of back-foot landing position. Yellow Belt introduces the doctrine of Foot Position 1 (FP1 / tail, used for tight turns) versus Foot Position 2 (FP2 / neutral, default landing) versus Foot Position 3 (FP3 / forward, used for long lines). Learn the back-foot shuffle between FP1 and FP2.

## Why it matters
The pop-up is the moment of DISCONNECT (from board) → RECONNECT (to board). Done correctly, the board becomes an extension of the surfer. FP2 is the default because when lying on the sweet spot the knees rest over FP2, and the back foot naturally lands where the knees were. The new skill is the intentional shuffle between FP1 and FP2 based on what the wave invites.

## Key concepts
Three pop-up methods (Figure-4, Scorpion rotated, Scorpion momentum); Foot-position canon relative to turn type; Weight distribution (front-foot dominant); Hip and head positioning during transition; Space creation through hand placement.

## What your body does (biomechanics)
**Method 1 — Figure 4:** Cobra → hands at rib height → drag back foot in a figure-4 motion (knee out) → push up, lift hips, look forward → bring extended foot to center between hands → maintain connection until stable.

**Method 2 — Scorpion rotated:** Cobra → rotate hip toward the front-foot side → drag back foot near the knee → knee points forward from launch → full body alignment.

**Method 3 — Scorpion momentum:** Cobra → exhale → kick front foot UP for momentum → hips lift → foot swings through like a pendulum between the hands.

All methods share: Hands at rib height (creates knee space) · Always look forward · Hips DOWN, head UP when releasing · Weight on the FRONT foot, not the back · Don't release until connection is confirmed · Exhale during the transition.

## 5 KEY WORDS (memorize and recite while training)
COBRA · SPACE · DRAG · LAND · SHUFFLE

## Coach cue
> "Hands at the ribs. Look forward, create space. Hips down, head up. Weight on the front foot. Stay connected — don't release."

## Pedagogical mode
Hybrid — Heavy classical out of the water (mat reps, method practice, visualization) plus Ecological in the water (pop-up while already surfing, as one continuous action — not two separate parts).

## Success indicators
1. Lands back foot at FP2 by default (where the knees were) without conscious correction.
2. Demonstrates the FP1↔FP2 shuffle mid-ride, front foot centered, showing intentional foot positioning.
3. Pop-up executed with hips down + head up + looking forward + weight on front foot — board stable.

## Theoretical checkpoint
"After your pop-up: where did your back foot land — FP1 or FP2? When would you shuffle to FP1, when to FP2? Why does the front foot stay centered?"$$,
errors_md = $$| Code | Error | Why it hurts |
|---|---|---|
| ERR-YB-030-01 | Releases the board too early | Unstable landing, no connection. |
| ERR-YB-030-02 | All weight on back foot | Loses balance immediately, nose lifts uncontrolled. |
| ERR-YB-030-03 | Not looking forward (eyes drop to feet) | Body follows the eyes — collapses downward. |
| ERR-YB-030-04 | Hands too forward | Blocks the space the knee needs to travel through. |
| ERR-YB-030-05 | Looking down | Same as #3 — kills the pop-up. |
| ERR-YB-030-06 | Going to the flat without speed | Pop-up doesn't preserve the wave's momentum. |$$
WHERE id = 'STP-030';

-- ─── STP-031 · Go Up and Down ───
UPDATE lessons SET description_md = $$## What you'll learn
Connect everything previously learned (pocket reading, angle, cobra + line, pop-up, foot position) into one continuous dynamic ride. The surfer is no longer learning new techniques — they are combining all prior steps into fluent execution. Go Up and Down is where the surfer learns to DRAW LINES on the wave face using compression and extension of the body.

## Why it matters
This is the threshold between "I caught a wave" and "I am surfing." External force (wave energy) multiplied by internal force (body compression-extension) equals a sustained line on the wave face. Go to the flat = lose speed, lose balance, lose the wave. Stay in the energy = maintain connected riding.

## Key concepts
Compression-extension cycle mechanics; Energy preservation through strategic body positioning; Wave-face staying in relation to body; Prevention of drift to the flat; Integration of all sequence steps; Frontside and backside equivalence (same theory, different mechanics).

## What your body does (biomechanics)
**Going DOWN:** Maintain a compressed posture, knees bent, stable stance, staying where the energy is. Before reaching the flat, begin rotation UP.

**Going UP:** Rotation + leg extension together, generating acceleration. Before exiting the section, flex legs again, return to compressed posture, rotate DOWN.

This cycle repeats indefinitely. Frontside (wave at front of body) and backside (wave at back of body) use the same theory but opposite rotational directions.

## 5 KEY WORDS (memorize and recite while training)
DOWN · COMPRESS · UP · EXTEND · STAY

## Coach cue
> "Don't go to the flat. Compress down, extend up. Stay where the energy is. Keep the game alive."

## Pedagogical mode
Ecological-dominant — surfskate can bridge classical, but real dynamic only emerges with live green waves.

## Success indicators
1. Executes one complete up-down cycle on a real wave without going to the flat.
2. Sustains ≥3 pump cycles in a single ride.
3. Demonstrates the cycle on both frontside and backside.

## Theoretical checkpoint
"After that wave: when did you extend, when did you compress? How many cycles? Did you go to the flat or stay in the energy?"$$,
errors_md = $$| Code | Error | Why it hurts |
|---|---|---|
| ERR-YB-031-01 | Going to the flat | Loses energy, loses speed, ride collapses. |
| ERR-YB-031-02 | Leaving wave too early | Abandons the wave before the game is over. |
| ERR-YB-031-03 | Passive body (no compression/extension) | Just standing — no internal force, no line. |
| ERR-YB-031-04 | Treating up/down as separate from previous sequence | Pump becomes a new skill instead of a continuation of the ride. |
| ERR-YB-031-05 | Only frontside or only backside | Asymmetric development; the belt requires both. |$$
WHERE id = 'STP-031';

-- ─── STP-032 · Out from the Shoulder ───
UPDATE lessons SET description_md = $$## What you'll learn
Exit the wave actively through the shoulder — the final new skill of Yellow Belt. YB adds the third exit option (alongside WB's lying dismount and star fall). An active shoulder exit is a conscious decision to leave the wave through its shoulder (the non-breaking section) before the lip forms, with elegance and intention.

## Why it matters
Shoulder exits prevent being thrown over the lip, avoid going far from the lineup, avoid hazards or bad positioning, and maintain etiquette when people are in front. More importantly, a conscious shoulder exit demonstrates that the surfer is reading the wave, making decisions, and executing with purpose rather than reacting.

## Key concepts
Reading the shoulder (Stage 1 or 2, before lip formation); Decisional exit (conscious choice versus accidental dismount); Identifying ideal exit timing; Turn execution toward the shoulder; Landing calmly outside the wave.

## What your body does (biomechanics)
The surfer identifies the shoulder (the unbroken section at the wave's edge). Initiates a turn toward the shoulder. Eyes stay fixed on the exit point throughout the turn. Body weight shifts into the turn's direction. The board carves toward the shoulder. Upon reaching the shoulder, the surfer either steps off calmly or paddles away smoothly, dismounting outside the wave's energy.

## 5 KEY WORDS (memorize and recite while training)
READ · SHOULDER · TURN · EXIT · CALM

## Coach cue
> "Read the shoulder. Eyes on the exit. Exit clean, not turbulent. Don't ride past your decision."

## Pedagogical mode
Ecological-dominant — only learned through real wave experience, where shoulder identification and turn execution must adapt to each wave's specific shape.

## Success indicators
1. Exits the wave through the shoulder by conscious choice ≥2 times per session (not accidental).
2. Identifies the shoulder (Stage 1 or 2) BEFORE initiating the turn — visible decision-making.
3. Lands calmly outside the wave — no wipeout, no turbulence.

## Theoretical checkpoint
"Did you exit through the shoulder, or did the wave take you? What stage was the shoulder in when you turned? Why did you choose that moment?"$$,
errors_md = $$| Code | Error | Why it hurts |
|---|---|---|
| ERR-YB-032-01 | Doesn't identify the shoulder in time | Wave breaks before the shoulder exit is executed. |
| ERR-YB-032-02 | Exits straight → far from the point | Drifts far from the lineup, long paddle back. |
| ERR-YB-032-03 | Rides past the ideal moment → bad position | Ends in bad position, has to recover for the next set. |
| ERR-YB-032-04 | Star fall when a shoulder exit was available | Uses the safety exit when the active exit was available — missed decision-making. |$$
WHERE id = 'STP-032';
