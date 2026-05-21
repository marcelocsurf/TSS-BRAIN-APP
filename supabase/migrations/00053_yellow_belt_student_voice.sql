-- M53 — Rewrite YB STP description_md in student voice (2nd person, "you").
--
-- Original wording was 3rd-person ("the surfer does X"), which reads like
-- coach-facing notes. White Belt content speaks directly to the student
-- ("you stand · you align · you wait"). This migration brings the YB
-- copy into the same voice. Same sections, same facts, just the
-- perspective shifts.
--
-- UPDATEs are idempotent — re-running is safe.

-- ─── STP-027 · Paddling Speeds 1–2–3–4 ───
UPDATE lessons SET description_md = $$## What you'll learn
You'll master the 4 levels of paddling speed and learn to apply them according to the wave's energy, your distance to the peak, and your tactical intention. Speed isn't power — it's the purposeful application of your energy. V1 (30–40% cruising), V2 (50–60% working), V3 (70–80% catching), V4 (90–100% sprint).

## Why it matters
When you paddle with the right speed for the context, you manage your energy, catch waves consistently, and arrive at the peak fresh instead of exhausted. The 4 speeds are your system to calculate arrival at the pocket with precision.

## Key concepts
Energy management; sustainable cadence; reach-and-power mechanics; breathing timing in sustained effort; choosing speed by context.

## What your body does (biomechanics)
Keep your elbow high through entry. Your hand enters in front of your shoulder. Push extends through your hip. In V1–V2, breathe 2:1 (two strokes, one breath). In V3–V4, shift to 1:1 (one stroke, one breath). Full arm extension creates your reach; power comes from your core and shoulder rotation, not just your arms.

## 5 KEY WORDS (memorize and recite while training)
SPEED · CADENCE · REACH · POWER · RHYTHM

## Coach cue
> "Match the speed to the wave, not the panic."

## Pedagogical mode
Hybrid — classical on land or calm water (your coach calls speeds aloud and you match cadence) plus ecological in the lineup (you choose the speed and justify the choice afterward).

## Success indicators
1. You demonstrate all 4 speeds on command without losing form.
2. You adjust your speed to context (distance to pocket + wave energy + time available) without instruction.
3. You sustain V3–V4 paddling for ≥30 seconds without losing breath or form.

## Theoretical checkpoint
"Explain when you use V2 versus V3, and why not always V4." Your answer should cover energy sustainability, distance reading, and fatigue management.$$
WHERE id = 'STP-027';

-- ─── STP-033 · Reading Wave Stages 1–4 in the Lineup ───
UPDATE lessons SET description_md = $$## What you'll learn
You'll re-deepen the Pre-Course concept of wave stages. In the Pre-Course the stages were conceptual; at Yellow Belt you identify and predict the 4 stages on real moving waves, you understand when each stage can and can't be caught, and you read where each wave will break.

## Why it matters
If you misread the stages, you waste energy paddling into Stage 1 (uncatchable), you sit in the wrong place for the catch window, and you miss the optimal stages. Reading stages in real time is the foundation of every tactical decision you'll make at this belt.

## Key concepts
Wave energy progression; stage identification on real waves; predicting the breaking point; recognizing wave types (lefts, rights, closeouts, walled sections); how bottom topography shapes the break pattern.

## What your body does (biomechanics)
Track waves with your eyes from one side of the horizon to the other (a full scan). Shift your body position in the water to keep visual contact. Position your head so your gaze can stay up on incoming sets. Use small paddle adjustments to keep yourself placed to observe each wave's evolution without losing position.

## 5 KEY WORDS (memorize and recite while training)
SCAN · STAGE · PREDICT · POCKET · DECIDE

## Coach cue
> "Predict where the stage you are looking at will be — anticipate to meet."

## Pedagogical mode
Hybrid — classical from shore (you identify stages on real waves before getting in the water) plus ecological in the lineup (you call the stages out loud as each set approaches).

## Success indicators
1. You identify all 4 stages on real waves without help.
2. You predict WHERE the wave will break BEFORE it arrives.
3. You understand the bottom type (sandbar, reef, rock) and read patterns of waves breaking in the same spot across sets.

## Theoretical checkpoint
"What types of waves do you see — lefts, rights, closeouts? On specific waves, tell me the stages and where it'll break first."$$
WHERE id = 'STP-033';

-- ─── STP-028 · Chase the Pocket ───
UPDATE lessons SET description_md = $$## What you'll learn
You'll learn to identify the pocket and actively position for it — the area of the wave where energy concentrates most, where the lip forms or the foam begins. The pocket isn't the whole wave; it's a specific point inside the wave that holds the maximum energy. You'll learn to locate it visually and keep chasing it as you paddle in.

## Why it matters
It's easy to see "a wave" as one big mass — but once you're pocket-aware, you see the specific point inside it where the energy is. That awareness turns your paddling from reactive into purposeful. The 4 speeds you trained in STP-027 exist precisely so you can calculate your arrival at the pocket.

## Key concepts
Wave energy concentration; geometric identification of the breaking point; visual tracking without losing your position; multiple pockets (when waves close on both sides); how pocket location ties to the right pop-up moment.

## What your body does (biomechanics)
Keep your eyes locked on the point you identified. Rotate your neck subtly so the pocket stays in peripheral or direct vision while you paddle. Adjust your stroke tempo to accelerate toward the pocket without over-committing (which would force you to sprint). Align your shoulders and torso with the direction you're paddling.

## 5 KEY WORDS (memorize and recite while training)
POCKET · EYES · DISTANCE · SPEED · POSITION

## Coach cue
> "Chase the pocket. Look at the pocket. Control your distance."

## Pedagogical mode
Hybrid — visual tracking from shore first, then a paddle-and-turn drill in the lineup where you must keep visual contact with the pocket through the whole approach.

## Success indicators
1. When asked, you can point at the pocket on a real wave instantly, without hesitation.
2. You recognize multiple pockets when waves close on both sides.
3. You hold visual contact with the pocket throughout your paddle-in.

## Theoretical checkpoint
"Where is the pocket on that wave?"$$
WHERE id = 'STP-028';

-- ─── STP-029 · Paddle with the Correct Angle ───
UPDATE lessons SET description_md = $$## What you'll learn
You'll choose your paddling angle based on WHERE you are relative to the pocket and WHAT stage the wave is in. There is no single "correct angle" — it changes with context. You'll learn 3 paddling-angle options and the tactical logic for picking each one.

## Why it matters
The wrong angle puts you in the wrong place at the wrong time — a weak catch window or a wipeout. This step depends entirely on the previous two: if you haven't mastered pocket identification (STP-028) and stage reading (STP-033), your angle choice is just a guess.

## Key concepts
Where the pocket is relative to where you are; how the wave's stage shapes your approach angle; three tactical options to choose from; how angle, speed, and arrival timing tie together; why Stage 1 cannot be paddled and Stage 2+ can.

## What your body does (biomechanics)
Your paddle direction shifts subtly with the angle you choose — your upper body rotates at the torso to redirect your effort. Your head positions early so you can sight the pocket before the wave arrives. Stroke power transfers directionally rather than straight ahead. This needs constant micro-adjustments in your shoulders and torso.

## 5 KEY WORDS (memorize and recite while training)
POCKET · STAGE · ANGLE · SCAN · PADDLE

## Coach cue
> "Look at the pocket. Read the stage. Choose the angle. Scan the wave."
> (Integrated chain from STP-028 → STP-033 → STP-029.)

## Pedagogical mode
Hybrid — Spot & Paddle drill (you identify the pocket visually, then paddle to position); Deep Position drill (you practice Option 1 angle); then Paddle + Catch + Cobra (your bridge to STP-034).

## Success indicators
1. You select one of the 3 angle options based on context, without your coach telling you.
2. You reach the pocket without a last-second frantic adjustment.
3. You do NOT paddle into Stage 1 — you understand the wave isn't yet catchable.

## Theoretical checkpoint
"Before paddling, tell me: what stage is the wave in, where's the pocket, and what angle are you going to use?"$$
WHERE id = 'STP-029';

-- ─── STP-034 · Cobra + Pick Line ───
UPDATE lessons SET description_md = $$## What you'll learn
You'll execute the cobra (board redirection) on green moving waves while making a deliberate line selection. The cobra isn't just a movement — it's a tactical decision about where you want to go on the wave. The right line gives you TIME: the calm space you need for a controlled pop-up.

## Why it matters
Cobra + the right line = TIME. TIME = the ability to pop up calmly, pass wave sections, keep your balance. Without a chosen line, your board drifts to the flat, you lose speed, you lose balance, and your pop-up becomes rushed or turns into a wipeout. The line is what gives you TIME.

## Key concepts
How to redirect the board on moving water; conscious line selection vs reactive turning; keeping speed through line choice; generating time for your pop-up; reading wave type (type of break, direction, wall shape).

## What your body does (biomechanics)
Keep your hands at rib height — not extended forward. To do the cobra: push upward through your shoulders and arms while you rotate your torso toward the line you want. The nose of the board lifts and redirects smoothly — not wrestled, just redirected with control. Shift your weight subtly toward your line. This keeps your speed and stops the nose from diving.

## 5 KEY WORDS (memorize and recite while training)
CATCH · COBRA · LINE · TIME · POP

## Coach cue
> "Cobra and pick your line. Where do you want to go? Don't just turn — turn TOWARD something."

## Pedagogical mode
Ecological-dominant — you only learn this in the water, post-catch, on green moving waves. Line Hold drill: catch the wave → cobra + line → surf prone for ≥5 seconds (so you FEEL the TIME you generated) → then pop-up.

## Success indicators
1. You execute the cobra + line redirect within 1–2 seconds of catching.
2. You hold your speed for ≥5 seconds after the cobra.
3. Your pop-up happens while you're still in trim (not rushed) because you generated TIME.

## Theoretical checkpoint
"After that wave: what line did you choose, and why? How much time did it give you before the pop-up?"$$
WHERE id = 'STP-034';

-- ─── STP-030 · Pop Up + Foot Position 1 or 2 ───
UPDATE lessons SET description_md = $$## What you'll learn
You'll pop up on green waves while staying aware of where your back foot lands. Yellow Belt introduces the doctrine of Foot Position 1 (FP1 / tail, for tight turns) vs Foot Position 2 (FP2 / neutral, your default landing) vs Foot Position 3 (FP3 / forward, for long lines). You'll learn the back-foot shuffle between FP1 and FP2.

## Why it matters
The pop-up is your moment of DISCONNECT (from the board) → RECONNECT (to the board). When you do it right, the board becomes an extension of you. FP2 is your default because when you're lying on the sweet spot, your knees rest over FP2, and your back foot naturally lands where your knees were. The new skill is the intentional shuffle between FP1 and FP2 based on what the wave invites you to do.

## Key concepts
Three pop-up methods (Figure-4, Scorpion rotated, Scorpion momentum); foot-position canon by turn type; weight distribution (front-foot dominant); your hips and head through the transition; creating space with your hand placement.

## What your body does (biomechanics)
**Method 1 — Figure 4:** Cobra → hands at rib height → drag your back foot in a figure-4 motion (knee out) → push up, lift your hips, look forward → bring your extended foot to center between your hands → stay connected until you're stable.

**Method 2 — Scorpion rotated:** Cobra → rotate your hip toward your front-foot side → drag your back foot near your knee → your knee points forward from launch → align your whole body.

**Method 3 — Scorpion momentum:** Cobra → exhale → kick your front foot UP for momentum → your hips lift → your foot swings through like a pendulum between your hands.

All methods share: hands at rib height (so your knee has space) · always look forward · hips DOWN, head UP when you release · weight on your FRONT foot, not your back · don't release until your connection is confirmed · exhale during the transition.

## 5 KEY WORDS (memorize and recite while training)
COBRA · SPACE · DRAG · LAND · SHUFFLE

## Coach cue
> "Hands at the ribs. Look forward, create space. Hips down, head up. Weight on the front foot. Stay connected — don't release."

## Pedagogical mode
Hybrid — heavy classical out of the water (mat reps, method practice, visualization) plus ecological in the water (you pop up while already surfing, as one continuous action — not two separate parts).

## Success indicators
1. Your back foot lands at FP2 by default (where your knees were) without you consciously correcting it.
2. You demonstrate the FP1↔FP2 shuffle mid-ride, with your front foot centered — showing intentional foot placement.
3. Your pop-up has hips down + head up + looking forward + weight on the front foot — board stable.

## Theoretical checkpoint
"After your pop-up: where did your back foot land — FP1 or FP2? When would you shuffle to FP1, when to FP2? Why does your front foot stay centered?"$$
WHERE id = 'STP-030';

-- ─── STP-031 · Go Up and Down ───
UPDATE lessons SET description_md = $$## What you'll learn
You'll connect everything you've already learned (pocket reading, angle, cobra + line, pop-up, foot position) into one continuous dynamic ride. You're not learning a new technique here — you're combining all the prior steps into fluent execution. Go Up and Down is where you start to DRAW LINES on the wave face by compressing and extending your body.

## Why it matters
This is your threshold between "I caught a wave" and "I am surfing." External force (the wave's energy) multiplied by internal force (your compression-extension) gives you a sustained line on the face. Go to the flat = you lose speed, you lose balance, you lose the wave. Stay in the energy = you stay connected to the ride.

## Key concepts
The compression-extension cycle; preserving energy through body position; keeping the wave face in relation to your body; preventing drift to the flat; integrating every previous step; frontside-backside equivalence (same theory, opposite rotation).

## What your body does (biomechanics)
**Going DOWN:** Stay compressed, knees bent, stance stable, planted where the energy is. Before you reach the flat, begin your rotation UP.

**Going UP:** Rotation + leg extension together — that's where your acceleration comes from. Before exiting the section, flex your legs again, return to compressed posture, rotate DOWN.

The cycle repeats. Frontside (wave in front of you) and backside (wave behind you) use the same theory with opposite rotational directions.

## 5 KEY WORDS (memorize and recite while training)
DOWN · COMPRESS · UP · EXTEND · STAY

## Coach cue
> "Don't go to the flat. Compress down, extend up. Stay where the energy is. Keep the game alive."

## Pedagogical mode
Ecological-dominant — surfskate can bridge the classical side, but the real dynamic only shows up on live green waves.

## Success indicators
1. You execute one complete up-down cycle on a real wave without going to the flat.
2. You sustain ≥3 pump cycles in a single ride.
3. You demonstrate the cycle on both frontside and backside.

## Theoretical checkpoint
"After that wave: when did you extend, when did you compress? How many cycles? Did you go to the flat or stay in the energy?"$$
WHERE id = 'STP-031';

-- ─── STP-032 · Out from the Shoulder ───
UPDATE lessons SET description_md = $$## What you'll learn
You'll exit the wave actively through the shoulder — the final new skill of Yellow Belt. YB adds the third exit option, alongside the lying dismount and the star fall you learned at WB. An active shoulder exit is your conscious decision to leave the wave through its shoulder (the non-breaking section) before the lip forms, with elegance and intention.

## Why it matters
A shoulder exit stops you from being thrown over the lip, keeps you close to the lineup, helps you avoid hazards and bad positioning, and lets you respect etiquette when people are in front of you. More importantly, choosing a shoulder exit on purpose shows you're reading the wave, deciding, and executing — not just reacting.

## Key concepts
Reading the shoulder (Stage 1 or 2, before lip formation); the decisional exit (your choice vs an accidental dismount); identifying the right exit moment; turning toward the shoulder; landing calmly outside the wave.

## What your body does (biomechanics)
Identify the shoulder — the unbroken section at the edge of the wave. Start your turn toward it. Keep your eyes fixed on the exit point through the whole turn. Shift your weight in the direction of the turn. Carve the board toward the shoulder. When you reach it, step off calmly or paddle away smoothly — dismount outside the wave's energy.

## 5 KEY WORDS (memorize and recite while training)
READ · SHOULDER · TURN · EXIT · CALM

## Coach cue
> "Read the shoulder. Eyes on the exit. Exit clean, not turbulent. Don't ride past your decision."

## Pedagogical mode
Ecological-dominant — you can only learn this through real wave experience, because shoulder identification and turn execution have to adapt to each wave's specific shape.

## Success indicators
1. You exit the wave through the shoulder by conscious choice ≥2 times per session (not by accident).
2. You identify the shoulder (Stage 1 or 2) BEFORE you initiate the turn — visible decision-making.
3. You land calmly outside the wave — no wipeout, no turbulence.

## Theoretical checkpoint
"Did you exit through the shoulder, or did the wave take you? What stage was the shoulder in when you turned? Why did you choose that moment?"$$
WHERE id = 'STP-032';
