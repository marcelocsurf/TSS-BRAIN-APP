-- Blue Belt Coach Course — Sequences #8–#13 (the 15 STPs).
-- Source: TSS_BLUE_BELT_COACH_COURSE_v1.docx §5–§10. Nothing invented.

INSERT INTO lessons (
  id, course_section, step_number, title, subtitle, pillar,
  description_md, estimated_minutes, lesson_type, display_order, active
) VALUES

-- ─── Sequence #8 — Pump Frontside ───
('COACH-BB-SEQ8', 'coach_bb', 5,
 'Sequence #8 — Pump Frontside',
 'STP-035 FP1 Operationalized · STP-036 Pump FS',
 'Coach · Sequence #8',
 $$# Sequence #8 — Pump Frontside

Goal: lead the student through the 2 NEW STPs that teach them to generate their own speed on a frontside wave.

## STP-035 — Foot Position 1 (FP1) Operationalized

> [!KEYWORDS]
> Back · Tail · Maneuver · Engage · Tilt

> [!TEACH]
> The rudder metaphor: "FP1 is when your back foot is over the tail — like the rudder of a boat. The further back, the sharper the turn. The catch: you go slower. So you only use FP1 when you want to turn or maneuver." Demonstrate FP2 (centered) → FP1 (over tail), weight shift visible: ==60% weight on back foot, 40% front==, knee slightly forward. Phase 1 (Classical): student switches FP1/FP2 on command, 10 reps. Phase 2 (Ecological): on skateboard, ride FP2 by default, switch FP1 only to turn.

> [!CORRECT]
> ERR-101 Back foot only halfway to tail → "All the way back. Feel the tail engage." · ERR-102 Weight on front foot during FP1 → "60% on the back foot. If your front foot has all the weight, you lost the tail." · ERR-103 Forgetting to switch back to FP2 → "After the maneuver, switch to FP2. Stuck on tail = lost speed."

> [!VALIDATE]
> Visual: student deliberately Presses the Button into FP1 and feels the maneuverability change; FP1 for maneuvers, FP2 for cruising — never confused. Theory: "When do you use FP1? When switch out? Why?" → FP1 for maneuvers · FP2 default · FP3 for pumping · switch deliberately.

> [!CUE]
> "Back foot to tail · feel the tail engage · ready to turn."

## STP-036 — Pump Frontside

> [!KEYWORDS]
> Compress · Extend · Rhythm · Hands · Forward

> [!TEACH]
> The swing metaphor: "Pumping is like pumping a swing — stand up, crouch, stand up, and it accelerates. The board accelerates the same way. Your two hands lead the rhythm — they swing forward as you extend." Demonstrate 10 pump reps in ==FP3==, hands visibly driving forward. Phase 1: student mimics 20 reps on land. Phase 2: on skateboard in a straight line — the board should visibly accelerate. If it doesn't, weight is drifting backward.

> [!CORRECT]
> ERR-104 Pumping in FP2 instead of FP3 → "FP3 for the pump. Slide your back foot forward." · ERR-105 ==Weight drifting to back foot (MOST COMMON BB ERROR)== → "Chest forward · weight on front foot. You're losing all the speed." · ERR-106 Arms passive → "Drive with your hands." · ERR-107 Out of rhythm → "The board is your dance partner." · ERR-108 Chest dropping behind front foot → "Chest stays over the front foot. Always." · ERR-109 Stopping pump too early → "Keep pumping until you have the speed for the maneuver."

> [!VALIDATE]
> Visual: 3 consecutive pump cycles on each of 5 waves; the board visibly accelerates. Theory: "What FP do you pump in? What happens if weight drifts backward?" → FP3 · weight backward = stuck · weight forward = speed maintained.

> [!CUE]
> "Two hands forward · compress and extend · rhythm with the board · weight stays forward."$$,
 14, 'reading', 50, true),

-- ─── Sequence #9 — Pump Backside ───
('COACH-BB-SEQ9', 'coach_bb', 6,
 'Sequence #9 — Pump Backside',
 'STP-037 Pump BS · STP-038 BS Body Mechanics',
 'Coach · Sequence #9',
 $$# Sequence #9 — Pump Backside

Goal: apply the pumping mechanic on a backside wave, adapting body mechanics to rail orientation.

## STP-037 — Pump Backside

> [!KEYWORDS]
> Open · Shoulder · Eyes · Rotate · Forward

> [!TEACH]
> The dance-partner metaphor: "Frontside pumping is like dancing with a partner in front of you. Backside pumping is like dancing with a partner behind you — you turn your chest open to keep contact. Same dance, different orientation." Demonstrate: chest open to imaginary wave on the back side, ==eye lead over the back shoulder==, compress + extend with leading hand driving. Phase 1: 20 reps on land (chest open? eyes over shoulder?). Phase 2: 3 consecutive pump cycles on a backside wave.

> [!CORRECT]
> ERR-111 Closed chest → "Open your chest. You can't lead the body with a closed stance." · ERR-112 Looking forward → "Eyes over the back shoulder. Eyes lead the body." · ERR-113 Stiff back (no rotation) → "Rotate your chest open · feel the oblique engage." · ERR-114 Same FS mechanics on BS → "Backside is different. Chest open · eyes over shoulder · leading hand drives."

> [!VALIDATE]
> Visual: 3 BS pump cycles on each of 5 waves with chest open + eyes over shoulder. Theory: "Why is BS pump different from FS?" → chest orientation + eye lead + leading hand; the body must actively rotate to keep contact on the back side.

> [!CUE]
> "Open chest · eyes over shoulder · same rhythm as FS · weight forward."

## STP-038 — BS Body Mechanics

> [!KEYWORDS]
> Chest · Open · Oblique · Lead · Back-Hand

> [!TEACH]
> BS body mechanics require active rotation of the chest open + eye lead over the back shoulder. Without this, the BS pump degrades into a stiff stance. Drill "BS Rotation Activation": student rotates chest open as if trying to look behind them, holds 10 seconds, feels the oblique engage, releases. 10 reps. ==This becomes part of every BS pre-paddle setup.==

> [!CORRECT]
> ERR-111 (recurring) → "Chest open. Eyes over shoulder. Activate the oblique." · Passive back hand → "Your back hand drives the rhythm. Use it."

> [!VALIDATE]
> Visual: before every BS wave, the student deliberately performs the BS Rotation Activation as part of pre-paddle setup; in water the chest opens visibly and eyes go over the shoulder consistently.

> [!CUE]
> "Chest open · shoulder lead · oblique engaged · back hand drives."$$,
 13, 'reading', 60, true),

-- ─── Sequence #10 — FS Foundation Chain ───
('COACH-BB-SEQ10', 'coach_bb', 7,
 'Sequence #10 — FS Foundation Chain',
 'The founding session · STP-039 BT · STP-040 Projection · STP-041 Cruz Snap · STP-042 Grenade',
 'Coach · Sequence #10',
 $$# Sequence #10 — FS Foundation Chain

Goal: lead the student through their first complete Universal Sequence Formula on a frontside wave.

> [!CRITICAL]
> This is the founding session of Blue Belt. Make it deliberate. Make it slow. Make it structural. After Seq #10, the Universal Formula becomes the foundation of every subsequent BB sequence.

> [!MANTRA]
> "Posture → Rotation → Projection → Maneuver → Closure → Posture." Have the student say it five times before the session. From now on, this is the language.

## STP-039 — Bottom Turn Medium

> [!KEYWORDS]
> Mid-face · U · Oblique · Lean · Flex

> [!TEACH]
> The architect metaphor: "The BT is your setup. Every maneuver depends on it. The BT is the ==U you draw on the wave face==. Mid-face: not down to the flat, not up at the top — the sweet spot in the middle." Demonstrate: flexed knees, lean to one side, oblique engaged, hold 5 sec, U-shape visible. Phase 1: 10 reps each side on land. Phase 2: chalk U on floor + skateboard. Phase 3: 5 waves, BT only, no maneuver.

> [!CORRECT]
> ERR-115 BT too low → "Stay mid-face. The flat has no energy." · ERR-116 BT too high → "Come down to mid-face. The top has no projection room." · ERR-117 No oblique → "Engage the oblique. The BT is the body bending, not just leaning." · ERR-118 Stopping BT before Projection → "The BT ends WHEN the Projection begins. No gap."

> [!VALIDATE]
> Visual: visible U on the wave face in the mid-face region; BT flows directly into Projection with no pause. Theory: "Where does your BT end?" → When the Projection begins. There is no gap.

> [!CUE]
> "Draw the U · lean to touch water · oblique engaged · ready to project."

## STP-040 — Projection

> [!KEYWORDS]
> Extend · Align · Forward · Launch · Snap

> [!TEACH]
> The spring metaphor: "The BT compresses you like a spring. The Projection is the release — legs extend, chest aligns toward where you're going, arms rise. You launch into the maneuver." Demonstrate from BT position: EXPLODE upward, hold the top 2 sec. Student: 10 reps each side (is the explosion visible? legs fully extending?).

> [!CORRECT]
> ERR-119 Projection too late → "Projection fires immediately after BT. Don't wait." · ERR-120 Not extending legs → "Full extension. The spring must release fully." · ERR-121 Arms passive → "Raise your arms. They lead the body upward."

> [!VALIDATE]
> Visual: BT + Projection on 5 waves with full leg extension and visible upward arm drive.

> [!CUE]
> "Extend · point with the shoulders · chest forward · ready to snap."

## STP-041 — Cruz Snap

> [!KEYWORDS]
> Cruz · Cross · Chest · Eyes · Rail

> [!TEACH]
> The cross geometry: "The Cruz is a body geometry — palms forward, chest open, eyes over the shoulder, oblique engaged, rail changed. Called Cruz because your arms cross your body — one leads, one follows." Demonstrate: cross hand over body (goofy = left over · regular = right over), open chest, look over shoulder, engage oblique, hold 5 sec — ==it's a position, not a flash==. Phase 1: 10 reps each side (all 5 details present?). Phase 2: 5 waves — BT + Projection + Cruz Snap, no Grenade yet.

> [!CORRECT]
> ERR-122 Cruz without rail change → "The rail must change. Without rail, it's a fake Cruz." · ERR-123 Closed chest → "Open chest. The Cruz requires open chest." · ERR-124 Eyes forward → "Eyes over the shoulder, toward the back of the wave." · ERR-125 Hand crosses too late → "Hand crosses BEFORE the rail changes. It leads the rail." · ERR-126 Forgetting to release → "The Cruz is the position before the Grenade. Don't stay there."

> [!VALIDATE]
> Visual: Cruz with all 5 geometric details (palms, chest, eyes, oblique, rail) on 5 consecutive waves. Theory: "List the 5 details of the Cruz." → Palms forward · Chest open · Eyes over shoulder · Oblique engaged · Rail changed.

> [!CUE]
> "Cross the hand · open the chest · eyes over the shoulder · rail change · snap."

## STP-042 — Grenade

> [!KEYWORDS]
> Explode · Throw · Extend · Return · Low

> [!TEACH]
> The throw metaphor: "Explode out of the Cruz with maximum commitment. Throw your leading arm forward as if launching a grenade. Then return to posture with hips down — that's the ==Low Finish==." Demonstrate: enter Cruz, explode + throw leading arm, extend legs, land flexed with hips down. Student: 10 reps each side (explosion present? Low Finish?).

> [!CORRECT]
> ERR-127 No commitment → "Throw the grenade. Commit fully. Half-hearted = no closure." · ERR-128 No Low Finish → "Hips down. Chest over front knee. That's how you reset for the next cycle." · ERR-129 Grenade without rail engaged → "Keep the rail engaged through the Grenade. Don't release early."

> [!VALIDATE]
> Visual: full chain Posture → BT → Projection → Cruz → Grenade → Posture on 5 consecutive waves, no stage skipped. Theory: "What is the closure of the Cruz Snap?" → The Grenade.

> [!CUE]
> "Throw the grenade · extend · return to posture · low finish."

## Sequence #10 Integration — the founding moment

Mission: student completes the Universal Formula on 5 consecutive frontside waves. Your job: DO NOT prescribe technique. DO ask after each attempt "Which stage felt strongest? Which weakest?" Let them self-identify; confirm or correct.

> [!CRITICAL]
> Audit checkpoint: by session end the student should verbalize WITHOUT prompting — the Universal Formula in order, which stage(s) need work, and a drill plan for next session. If they can do all three, they've entered Blue-Belt practice. If not, return temporarily to Yellow co-decision stance and slowly shift back.$$,
 20, 'reading', 70, true),

-- ─── Sequence #11 — BS Foundation Chain ───
('COACH-BB-SEQ11', 'coach_bb', 8,
 'Sequence #11 — BS Foundation Chain',
 'Separation Rule · STP-043 Choke · STP-044 Tapaloco Snap · STP-045 Elbow',
 'Coach · Sequence #11',
 $$# Sequence #11 — BS Foundation Chain

Goal: lead the student through the Universal Formula on a backside wave. Introduce the Separation Rule.

> [!CRITICAL]
> Doctrinal rule (Seq #11): ==Weight stays forward throughout.== Letting weight drift backward = losing speed and getting stuck on the wave.

## STP-043 — Choke (BS Projection)

> [!KEYWORDS]
> Cross · Extend · Chest · Shoulders · Point

> [!TEACH]
> The sword metaphor: "The Choke is like grabbing a sword from the other side of your body. Your arm crosses your waist · your hand reaches across. As you do, your legs extend and your chest rotates toward where you're going." (Alt: jiu-jitsu choke motion.) Demonstrate from BT: extend legs + cross arm over waist (goofy = LEFT, regular = RIGHT), chest rotates toward maneuver direction. Student: 10 reps (chest rotates? legs extend?).

> [!CORRECT]
> ERR-130 Skipping the Choke → "You went straight to the Tapaloco. Reset. The Choke is the setup." · ERR-131 Weight drifts to back foot → "Weight forward. Always forward at BB." · ERR-132 Not extending legs → "The Choke needs leg extension. Without it, no speed." · ERR-133 Inactive scapula → "Activate your scapula. Chest opens with the scapula."

> [!VALIDATE]
> Visual: BT + Choke on 5 consecutive BS waves with full arm cross + leg extension + chest rotation.

> [!CUE]
> "Choke · point with the shoulders · cross the arm · extend the legs."

## STP-044 — Tapaloco Snap

> [!KEYWORDS]
> Hand · Palm · Over · Ear · Forward

> [!TEACH]
> The 4 variants: 1) ARM (least exaggerated) · 2) ELBOW (intermediate) · 3) SHOULDER (more) · 4) ==HAND, palm UP, over head, covering ear (CANONICAL IDEAL)==. Always teach the HAND variant; the others are fallbacks. Demonstrate (HAND): after Choke, throw hand palm UP over head as if covering the opposite ear, look over shoulder, rail engages, hold 3 sec. Student: 10 reps (palm UP? hand covers opposite ear? look over shoulder?).

> [!CORRECT]
> ERR-134 Not rotating palm upward → "Palm UP. Rotate as much as possible. The palm leads." · ERR-135 ==Weight drifts backward (CRITICAL)== → "Weight forward. Backward = stuck on wave." · ERR-136 Not looking over shoulder → "Eyes over the back shoulder, toward the bottom of the wave." · ERR-137 Front leg not extending → "Front leg extends through the Tapaloco." · ERR-138 Compensating with arms only → "The body initiates. Arms follow. Reset from the body."

> [!VALIDATE]
> Visual: HAND variant on 5 consecutive BS waves with palm UP + hand over opposite ear + look over shoulder + weight forward. Theory: "What is the canonical ideal Tapaloco?" → HAND variant, palm UP over head covering opposite ear.

> [!CUE]
> "Oblique · elbow · hips down · posture."

## STP-045 — Elbow (BS Closure)

> [!KEYWORDS]
> Up · Scapula · Energy · Foot · Throw

> [!TEACH]
> The energy-chain metaphor: "The Elbow sends rotational energy down your body to the rail. ==Elbow UP (not down)== · opposite scapula activates as if trying to unite both scapulas · your back foot follows the elbow's direction." Demonstrate from Tapaloco: throw elbow UP, activate opposite scapula, back foot follows, hold 3 sec. Student: 10 reps (elbow UP? scapula activated? back foot follows?).

> [!CORRECT]
> ERR-139 Done too softly → "Throw the elbow with power. Soft = no rotational energy." · ERR-140 Elbow thrown downward → "UP. Elbow goes UP. Down breaks the energy chain." · ERR-141 Skipping the Elbow → "Without the Elbow, no water is thrown. Don't skip the closure."

> [!VALIDATE]
> Visual: full chain Posture → BT → Choke → Tapaloco → Elbow → Posture on 5 consecutive BS waves, no stage skipped; water visibly thrown.

> [!CUE]
> "Elbow up · scapulas united · back foot follows the elbow · energy down to the rail."

## Teaching the Separation Rule

> [!DOCTRINE]
> SEPARATION RULE: Choke = SETUP · Tapaloco = RAIL CHANGE · Elbow = THROW WATER.

Have the student execute the full BS chain on 3 waves. After each, ask: "Which of the three did you do best? Which worst?" The student MUST differentiate the three. If "I don't know, it all happened at once," the Separation Rule is not internalized — drill in isolation (Choke alone · Tapaloco alone · Elbow alone), then recombine.

> [!CRITICAL]
> Pass criterion: the student can verbalize "My Choke was clean, my Tapaloco was rushed, my Elbow was weak" — diagnosing each phase separately.$$,
 18, 'reading', 80, true),

-- ─── Sequence #12 — FS Linking ───
('COACH-BB-SEQ12', 'coach_bb', 9,
 'Sequence #12 — FS Linking (Hold Doctrine)',
 'STP-046 Cruz Cutback · STP-047 Hold',
 'Coach · Sequence #12',
 $$# Sequence #12 — FS Linking (Hold Doctrine)

Goal: introduce the Hold doctrine + the Cruz Cutback. The FS Snap becomes a Cutback by adding the Hold.

> [!MANTRA]
> "If you don't return — it was a Snap, not a Cutback." Repeat this constantly during Seq #12.

## STP-046 — Cruz Cutback

> [!KEYWORDS]
> Maintain · Arc · Pocket · Return · Hold

> [!TEACH]
> The painter metaphor: "The Cruz Cutback is like painting an arc on the wave face. Same BT, Projection, and Cruz as the Snap — but this time you ==HOLD the Cruz longer==. Paint the full arc until you see the foam coming back, then close." Timing differentiator: "The Cutback is performed FARTHER from the foam than the Snap. To create that distance, use a LONGER bottom turn." Demonstrate: maintain Cruz 5 sec, release only when "you see the foam." Skateboard: long chalk U, maintain Cruz through the curve.

| Maneuver | Distance from foam | BT length |
|---|---|---|
| Cruz Snap | Closer | Standard BT Medium |
| Cruz Cutback | Farther | Longer to create space for return arc |

> [!CORRECT]
> ERR-142 Releasing too early → "You released before the pocket. Hold longer." · ERR-143 Cutback in 2 movements → "One continuous line, not two. If you broke it, the Hold failed." · ERR-144 Treating it like a Snap → "You didn't return to the pocket. That was a Snap." · ERR-145 BT too short → "Longer BT. You need space for the return arc." · ERR-146 Eyes not following the pocket → "Eyes find the pocket. The body follows the eyes."

> [!VALIDATE]
> Visual: returns to the pocket on ≥4 of 5 attempts; single continuous arc visible. Theory: "Cutback or Snap?" → A Cutback returns to the pocket. If it didn't return, it was a Snap.

> [!CUE]
> "Maintain the cutback position · wait to see the white water · wait to see the pocket."

## STP-047 — Hold

> [!KEYWORDS]
> Hold · Save · Don't release · Cruz · Flexed

> [!TEACH]
> The H of P·R·C·H: "You learned P·R·C·H at White Belt as a concept. The H stood for Hold — conceptual. At Blue Belt the Hold becomes ==operational== — an actual STP you do. You hold the Cruz to save the energy." Make the student verbalize: "This is the H of P·R·C·H from the Three Circles of Power." Demonstrate: enter Cruz, hold 10 sec without extending the leg, stay flexed, feel energy storing, release sharply with Grenade. Phase 2 (the canonical BB ecological mission): you call "Hold" → student starts Cruz; you call "Release" after a variable 3–10 sec. Trains time-perception. Then in water, verbal cue from shore.

> [!CORRECT]
> ERR-147 Cutback in 2 movements (Hold-failure) → "You broke the Hold. One continuous line." · ERR-148 Releasing Hold too early → "Hold longer. The Grenade fires when you see the pocket." · ERR-149 Extending leg before Grenade → "Stay flexed. Leg extends WITH the Grenade." · ERR-150 Losing weight forward during Hold → "Weight forward through the entire Hold." · ERR-151 Losing Cruz details → "Cruz stays Cruz. All 5 details preserved." · ERR-152 Not understanding H = PRCH → "This is the H of P·R·C·H. Re-read your WB Master Manual §I.4."

> [!VALIDATE]
> Visual: Cruz Cutback + Hold on 5 consecutive FS waves, single continuous line, successful return to pocket. Theory: "Where does the Hold come from in the canon?" → The H of P·R·C·H from the Three Circles of Power; conceptual at White, operational at Seq #12.

> [!CUE]
> "Hold · don't release · stay in the Cruz · save the energy."$$,
 16, 'reading', 90, true),

-- ─── Sequence #13 — BS Linking ───
('COACH-BB-SEQ13', 'coach_bb', 10,
 'Sequence #13 — BS Linking (Closes BB)',
 'STP-048 Tapaloco Cutback · STP-049 Hold Rotation',
 'Coach · Sequence #13',
 $$# Sequence #13 — BS Linking (Closes BB)

Goal: apply the Hold doctrine on backside. Teach Hold Rotation. Close the BB sequence cycle.

> [!DOCTRINE]
> The Codazo is the BS equivalent of the Grenade · fires when the student decides to finish. Hold Rotation is the BS application of the same H from P·R·C·H. The ==survive the foam return== milestone is unique to BS — this is the test.

## STP-048 — Tapaloco Cutback

> [!KEYWORDS]
> Maintain · Survive · Pocket · Return · Codazo

> [!TEACH]
> The mirror metaphor: "Tapaloco Cutback is the mirror of Cruz Cutback. Same Universal Formula, applied backside. Same Hold doctrine. Same 'if you don't return, it was a Snap.' Different rail. Different closure (Codazo instead of Grenade)." Demonstrate: after Choke + Tapaloco (HAND, palm UP), enter new-rail position with simple rotation + oblique, ==HOLD-HOLD-HOLD 5 sec==, when you see the foam throw Codazo, return to posture. Skateboard: long chalk arc, then water.

> [!CORRECT]
> ERR-153 Not holding the position → "Hold. Hold. Hold. Don't release." · ERR-154 Codazo too quickly → "You threw too early. Wait for the foam." · ERR-155 Not looking → "Eyes find the pocket. Body follows." · ERR-156 Bad simple rotation → "Simple rotation through the entire Hold. Oblique engaged." · ERR-157 Treating like a Snap → "You didn't return to the foam. That was a Snap."

> [!VALIDATE]
> Visual: returns to the foam · survives the foam encounter · comes back out to the wave face, on ≥3 of 5 attempts. Theory: "BS-specific milestone of Seq #13?" → Survive the foam return.

> [!CUE]
> "Hold the position · simple rotation · Hold Hold Hold · Codazo to close and return to posture."

## STP-049 — Hold Rotation

> [!KEYWORDS]
> Hold · Rotation · Save · Flexed · Codazo

> [!TEACH]
> The doctrinal symmetry: "Hold Rotation is the BS application of the same H from P·R·C·H. Same doctrine as Hold FS — sustain the position to save energy. Different rail orientation. ==Tapaloco position stays maintained throughout.==" Demonstrate: after Tapaloco, sustain new-rail position with basic posture + simple rotation + oblique, Tapaloco hand position preserved, legs flexed, hold 10 sec, release with sharp Codazo.

> [!CORRECT]
> ERR-158 Cutback in 2 movements → "One continuous line. The Hold failed if you broke it." · ERR-159 Releasing Hold Rotation too early → "Hold longer. The Codazo fires when you see the foam." · ERR-160 Extending legs before Codazo → "Legs stay flexed. Extension happens WITH the Codazo." · ERR-161 Losing weight forward → "Weight forward. Critical." · ERR-162 Losing Tapaloco position → "Tapaloco stays. The arm position is preserved through the Hold."

> [!VALIDATE]
> Visual: Hold Rotation maintaining the Tapaloco position throughout; single continuous arc; returns to foam.

> [!CUE]
> "Hold · don't release · stay in the rotation · save the energy · Codazo to close."

## Closing the BB sequence cycle

With Seq #13 complete, the student has executed all 15 BB STPs (STP-035 → STP-049). Confirm they can perform all 6 sequences on demand, have internalized the Universal Formula language, and can self-diagnose using the Three Circles + Universal Formula stages. Then schedule the Exit Test.$$,
 16, 'reading', 100, true)
ON CONFLICT (id) DO UPDATE SET
  course_section=excluded.course_section, step_number=excluded.step_number,
  title=excluded.title, subtitle=excluded.subtitle, pillar=excluded.pillar,
  description_md=excluded.description_md, estimated_minutes=excluded.estimated_minutes,
  lesson_type=excluded.lesson_type, display_order=excluded.display_order, active=excluded.active;
