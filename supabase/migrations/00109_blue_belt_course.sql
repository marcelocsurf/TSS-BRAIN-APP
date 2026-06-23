-- Blue Belt course access + content (content rows were applied via PostgREST upsert;
-- this file is the canonical record). Schema applied via MCP migration blue_belt_course_access.
alter table students add column if not exists course_access_blue boolean not null default false, add column if not exists blue_belt_completed_at timestamptz;
alter table students drop constraint if exists active_course_key_check;
alter table students add constraint active_course_key_check check (active_course_key in ('white_belt','yellow_belt','blue_belt'));

-- Blue Belt student course content (verbatim from BB_STUDENT_COURSE.txt).
insert into lessons (id, course_section, step_number, title, subtitle, pillar, description_md, estimated_minutes, lesson_type, display_order, active, status_v1) values ('BB-ONB-01', 'bb_onboarding', 501, $TSSBB$Blue Belt Value — Compromiso Consciente$TSSBB$, $TSSBB$Conscious Commitment$TSSBB$, $TSSBB$Mindset / Belt Value$TSSBB$, $TSSBB$2. THE BLUE BELT BELT VALUE — COMPROMISO CONSCIENTE
==============================================================================


Belt status: Blue Belt — entry
Belt Value: Compromiso Consciente (Conscious Commitment)
Mantra: "There are no shortcuts. You have to walk the path."

Before you start the Foundation Sequence, take a moment. The shift from Yellow Belt to Blue Belt is not technical first — it is structural first.


2.1 — The doctrinal shift
─────────────────────────

At Yellow Belt you learned: "I accept this is hard. I accept I will fail. I keep showing up." That was resilience.

At Blue Belt you learn something deeper: "There is a structure. The structure cannot be skipped. I commit to walking the structure even when I want to skip it." That is conscious commitment.


2.2 — The full belt value
─────────────────────────

Compromiso Consciente is the central value of Blue Belt because it marks the moment when the surfer recognizes that the architecture of surfing at this level cannot be jumped over.

You will be tempted to skip the bottom turn to get to the snap faster. You will be tempted to throw the grenade before the cutback has drawn its arc. You will be tempted to attempt a cutback in two disconnected movements because the wave is small and you cannot wait. You will be tempted to surf without honoring the Universal Formula because "the wave was not big enough to require it."

All of those temptations are the absence of Compromiso Consciente.

At Blue Belt, you commit to the structure. Every wave. Every attempt. Not because the wave demands it — but because you have decided that you walk the path. You will get worse before you get better. You will execute slower while you internalize the formula. You will see other surfers do flashier things without the structure and you will resist the urge to imitate. You will trust that the surfer who walks the path owns the surfing — and the surfer who skips the path is always borrowing it.

That is Compromiso Consciente. It is not enthusiasm. It is not motivation. It is a structural commitment to honor the architecture even when no one is watching.


2.3 — Closing phrase
────────────────────

   | Blue Belt grows through conscious commitment: there are no shortcuts. You have to walk the path.


2.4 — How to internalize the shift
──────────────────────────────────

Suggested practice (one session):

1. Read the full belt value aloud, twice.
2. Reflect on your Yellow Belt sessions — were there moments where you wanted to skip a stage and you didn't? Were there moments where you did skip and you regretted it?
3. Identify one specific temptation you have right now to skip a stage. Write it down. (Example: "I want to throw the snap without doing the projection first.")
4. Set the intention for the next 3 sessions: every time I am tempted to skip a stage, I will say out loud: "There are no shortcuts. Walk the path."
5. After each session, ask yourself: did I walk the path today?

That is Compromiso Consciente in practice.


==============================================================================$TSSBB$, 15, 'reading', 1, true, 'PRODUCTIZED') on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle, pillar=excluded.pillar, description_md=excluded.description_md, course_section=excluded.course_section, step_number=excluded.step_number, display_order=excluded.display_order;
insert into lessons (id, course_section, step_number, title, subtitle, pillar, description_md, estimated_minutes, lesson_type, display_order, active, status_v1) values ('BB-FOUND-01', 'blue_belt', 500, $TSSBB$Blue Belt Foundation Sequence (17 elements)$TSSBB$, $TSSBB$Own these before the maneuvers$TSSBB$, $TSSBB$Foundation$TSSBB$, $TSSBB$3. THE BLUE BELT FOUNDATION SEQUENCE (17 ELEMENTS)
==============================================================================


Goal: Confirm that the 17 foundation elements from White + Yellow Belt are owned at Blue Belt level before you begin the new sequences.

Before you can start Sequence #10 (the first sequence that introduces the Universal Formula), you must demonstrate to yourself that all 17 elements below are reliable. If any one of them is uncertain, go back and drill it.


3.1 — The 17 elements (checklist)
─────────────────────────────────

| # | Element | Where from | BB-level depth |
| 1 | Posture | WB | Active scapula + chest forward + hips down |
| 2 | Rotation | WB | Eye lead + oblique engagement |
| 3 | Compression | WB | Flexed legs as energy storage |
| 4 | Hold (concept) | WB | Now becomes operational in Seq #12/#13 |
| 5 | Foot Position FP1 | WB/YB | Tail-back default for maneuvers |
| 6 | Foot Position FP2 | WB/YB | Centered default for posture |
| 7 | Foot Position FP3 | YB | Forward for pumping / speed |
| 8 | Press the Button | YB | Dynamic transition between FPs |
| 9 | Cobra + Pick Line | YB | Line selection during paddle entry |
| 10 | Pop-Up + Foot Position | YB | Land in FP1 or FP2 with intention |
| 11 | Center of the Board (2D) | NEW BB | Lateral + longitudinal center awareness |
| 12 | Duck Dive (10-step) | YB | At BB this is automatic |
| 13 | Paddling Speeds 1-2-3-4 | YB | Tactical use at BB |
| 14 | Chase the Pocket | YB | Always in the pocket at BB |
| 15 | Paddle with Correct Angle | YB | Automatic at BB |
| 16 | Reading Wave Stages 1-4 | YB | Operational independence |
| 17 | Out from the Shoulder | YB | Safe exit at any moment |


3.2 — Two NEW Foundation principles at BB
─────────────────────────────────────────


  » 3.2.1 — Center of the Board (2-dimensional)

At WB and YB you became aware of the center of the board laterally (left/right). At Blue Belt you become aware of the center in two dimensions: lateral AND longitudinal (nose-tail).

Why this matters: all BB maneuvers require you to move your back foot between FP1 / FP2 / FP3 in real time. Without 2D awareness, you cannot reliably know where your back foot is on the board. You will lose maneuverability, speed, or both.

Practice: every time you stand up on a wave, mentally locate your back foot's position on the longitudinal axis. "Am I in FP1, FP2, or FP3 right now?" That mental check is the start of BB foot awareness.


  » 3.2.2 — Press the Button

Press the Button is the dynamic action of transitioning your back foot between Foot Positions during a single ride. The "button" is the moment of transition; the action is the deliberate weight shift that triggers the FP change.

Why this matters: at BB you will need to be in FP3 during pumping (for speed) and in FP1 during the maneuver (for maneuverability). Press the Button is how you switch.

Practice: on land, simulate pop-up → land in FP2 → switch to FP1 → switch back to FP2 → switch to FP3. Repeat 10 times. Feel the deliberate weight shift each time.


3.3 — Duck Dive at BB level (10-step automatic chain)
─────────────────────────────────────────────────────

At BB the duck dive is no longer a sequence of conscious steps — it is automatic. The 10 steps below are still the canonical chain; you just no longer think them through:

1. Read incoming wave (pre-stage decision)
2. Paddle into the wave with controlled speed
3. Grab rails at correct point ahead of the impact
4. Compress hands + chest down onto board
5. Submerge nose with body weight
6. Drive the tail down with the foot (knee or foot push)
7. Allow the wave's energy to pass over
8. Lift the nose to surface as wave passes
9. Repaddle immediately to maintain position
10. Re-orient to the lineup

Self-check: if you have to think about any of these 10 steps mid-wave, you are not yet at BB Duck Dive level. Drill it more in calm conditions until it disappears from your conscious attention.


3.4 — Foundation Self-Check
───────────────────────────

Before moving on to Sequence #8, complete this self-check out loud:

- [ ] My posture is reliable across all 17 elements
- [ ] My duck dive is automatic in head-high waves
- [ ] I can verbalize where my back foot is at any moment of a ride
- [ ] I can deliberately Press the Button (switch FPs) on demand
- [ ] I am NOT just remembering these elements — I am executing them without thinking
- [ ] If any one element is uncertain, I have a plan to drill it

If you cannot tick all six boxes, return to that element for at least 3 sessions before continuing.


==============================================================================$TSSBB$, 15, 'reading', 2, true, 'PRODUCTIZED') on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle, pillar=excluded.pillar, description_md=excluded.description_md, course_section=excluded.course_section, step_number=excluded.step_number, display_order=excluded.display_order;
insert into lessons (id, course_section, step_number, title, subtitle, pillar, description_md, estimated_minutes, lesson_type, display_order, active, status_v1) values ('STP-035', 'blue_belt', 35, $TSSBB$Foot Position 1 (FP1) Operationalized at BB$TSSBB$, $TSSBB$Sequence #8 · Step 1$TSSBB$, $TSSBB$Technical$TSSBB$, $TSSBB$4.1 — STP-035 · Foot Position 1 (FP1) Operationalized at BB

Pillar: Technical
Block: 4 (Power Posture)
Position: Sequence #8 · Step 1
5 Key Words: Back · Tail · Maneuver · Engage · Tilt

What you'll learn:

FP1 is the back foot all the way back to the tail of the board. It is the operational position for any maneuver that requires maximum maneuverability — including the closure of every pump (when you transition from pump to maneuver setup).

Biomechanics:

Back foot positioned at the tail of the board (or as close as your stance allows). Front foot at standard pop-up position. Weight distribution: 60% back foot during the maneuver setup, 40% front foot. The knee of the back leg slightly forward and bent for stability. You should feel the tail engage — the board responds immediately when you tilt.

Coach cue:

   | "Back foot to tail · feel the tail engage · ready to turn."

Drill 1 — FP1 Discovery (land):

Stand on a balance board or imagined board on the ground. Find your standard stance. Now move your back foot one foot-length toward the tail. Feel the difference. Hold for 30 seconds. Switch back. Repeat 10 times. Notice the moment when "your weight engages the tail."

Drill 2 — FP1 ↔ FP2 Skateboard Switch:

On a skateboard, ride in FP2 for 5 seconds. Press the Button → switch to FP1. Ride 5 seconds. Switch back. Repeat 10 reps each side.

Mission:

On 3 consecutive waves, deliberately Press the Button into FP1 before the wave ends and feel the maneuverability change. Do not attempt a maneuver yet — just feel the difference.

Common errors:

- ERR-101 — Back foot only halfway to tail (not actually FP1)
- ERR-102 — Weight on front foot during FP1 (loses tail engagement)
- ERR-103 — Forgetting to switch back to FP2 after the maneuver (stuck on tail = lost speed)

Self-check:

- [ ] I can feel the difference between FP1 and FP2 with my eyes closed
- [ ] I can Press the Button into FP1 without looking down
- [ ] I know when to switch into FP1 (before a maneuver) and when to switch out (after)$TSSBB$, 15, 'reading', 3, true, 'PRODUCTIZED') on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle, pillar=excluded.pillar, description_md=excluded.description_md, course_section=excluded.course_section, step_number=excluded.step_number, display_order=excluded.display_order;
insert into lessons (id, course_section, step_number, title, subtitle, pillar, description_md, estimated_minutes, lesson_type, display_order, active, status_v1) values ('STP-036', 'blue_belt', 36, $TSSBB$Pump Frontside$TSSBB$, $TSSBB$Sequence #8 · Step 2$TSSBB$, $TSSBB$Technical$TSSBB$, $TSSBB$4.2 — STP-036 · Pump Frontside

Pillar: Technical
Block: 5 (Rotation / Rail Change / Bottom Turn) + 6 (Projection)
Position: Sequence #8 · Step 2
5 Key Words: Compress · Extend · Rhythm · Hands · Forward

What you'll learn:

Pumping is the cyclical compression-extension of your body that generates speed on a frontside wave. The pump is done with FP3 (back foot forward) to maximize speed generation, and your body rises and falls in rhythm with the board's vertical motion.

Biomechanics:

- Stance: FP3 (back foot forward) throughout the pump
- Body action: compress (knees bend) on the down-cycle · extend (knees straighten) on the up-cycle
- Arms: both hands actively driving the body forward — your hands lead the rhythm
- Chest: stays forward · over the front foot
- Critical: weight stays forward. Do not let your weight shift to the back foot during the pump — you will lose all the speed you are trying to generate.

Coach cue:

   | "Two hands forward · compress and extend · rhythm with the board · weight stays forward."

Drill 1 — Land Pump Simulation:

Stand in FP3 stance. Compress your knees deeply, extend fully, compress again. Use your hands actively — they should swing forward as you extend. Repeat 20 reps. Focus on rhythm.

Drill 2 — Skateboard Pump FS:

On a skateboard going in a straight line, perform the pump cycle. The skateboard should visibly accelerate from your body's compression-extension. Repeat 20 reps. If the skateboard does not accelerate, your weight is drifting backward — fix that first.

Mission:

On 5 waves: perform 3 consecutive pump cycles on each wave. Audit yourself: is your weight forward? Did the board accelerate?

Common errors:

- ERR-104 — Pumping in FP2 instead of FP3 (loses 50% of speed generation)
- ERR-105 — Weight drifting to back foot (most common BB error — loses speed)
- ERR-106 — Arms passive (body must be driven by hands, not just legs)
- ERR-107 — Pumping out of rhythm with board (disconnects body from board)
- ERR-108 — Chest dropping behind front foot (loses forward momentum)
- ERR-109 — Stopping pump too early before maneuver (doesn't build the speed)
- ERR-110 — Passing weight to back foot during pump (same as #2 · most common)

Self-check:

- [ ] When I pump, I can see the board visibly accelerate
- [ ] My weight stays forward the entire pump cycle
- [ ] My hands lead the rhythm
- [ ] I am in FP3 throughout the pump


==============================================================================$TSSBB$, 15, 'reading', 4, true, 'PRODUCTIZED') on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle, pillar=excluded.pillar, description_md=excluded.description_md, course_section=excluded.course_section, step_number=excluded.step_number, display_order=excluded.display_order;
insert into lessons (id, course_section, step_number, title, subtitle, pillar, description_md, estimated_minutes, lesson_type, display_order, active, status_v1) values ('STP-037', 'blue_belt', 37, $TSSBB$Pump Backside$TSSBB$, $TSSBB$Sequence #9 · Step 1$TSSBB$, $TSSBB$Technical$TSSBB$, $TSSBB$5.1 — STP-037 · Pump Backside

Pillar: Technical
Block: 5 + 6
Position: Sequence #9 · Step 1
5 Key Words: Open · Shoulder · Eyes · Rotate · Forward

What you'll learn:

Backside pumping uses the same compression-extension cycle as frontside, but your body is oriented with the chest toward the wave and the eye lead is over the back shoulder.

Biomechanics:

- Stance: FP3 throughout the pump (same as FS)
- Body orientation: chest opens toward the wave face (NOT toward the shore)
- Eye lead: over the back shoulder toward the direction of travel
- Arms: the leading hand (the one toward the wave) drives the rhythm
- Compression-extension cycle: identical to FS
- Weight: stays forward (same critical rule as FS)

Coach cue:

   | "Open chest · eyes over shoulder · same rhythm as FS · weight forward."

Drill — Land BS Pump Simulation:

Same as FS pump but rotate your stance so your chest faces an imaginary wave on your back side. Eye lead over the back shoulder. Compress + extend with the leading hand driving the rhythm. 20 reps.

Mission:

3 backside waves with 3 consecutive pump cycles each. Audit: is your chest open or closed? Are your eyes over your back shoulder?

Common errors:

- ERR-111 — Closed chest (chest faces the nose of the board) — cannot lead the body backside
- ERR-112 — Looking forward instead of over shoulder — eyes don't lead, body cannot follow
- ERR-113 — Stiff back (no rotation) — loses oblique engagement
- ERR-114 — Same FS body mechanics on BS — does not translate$TSSBB$, 15, 'reading', 5, true, 'PRODUCTIZED') on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle, pillar=excluded.pillar, description_md=excluded.description_md, course_section=excluded.course_section, step_number=excluded.step_number, display_order=excluded.display_order;
insert into lessons (id, course_section, step_number, title, subtitle, pillar, description_md, estimated_minutes, lesson_type, display_order, active, status_v1) values ('STP-038', 'blue_belt', 38, $TSSBB$BS Body Mechanics$TSSBB$, $TSSBB$Sequence #9 · Step 2$TSSBB$, $TSSBB$Technical$TSSBB$, $TSSBB$5.2 — STP-038 · BS Body Mechanics

Pillar: Technical
Block: 5
Position: Sequence #9 · Step 2
5 Key Words: Chest · Open · Oblique · Lead · Back-Hand

What you'll learn:

Backside body mechanics require you to actively rotate your chest open toward the wave and lead with your eyes over the back shoulder. Without this active rotation, your backside pump degrades into a stiff stance with no internal force generation.

Biomechanics:

- Active chest rotation (open chest, NOT closed)
- Eye lead over the back shoulder (NOT looking forward toward the nose)
- Oblique engagement on the back side of the body
- Leading hand (the one closer to the wave) drives momentum

Coach cue:

   | "Chest open · shoulder lead · oblique engaged · back hand drives."

Drill — BS Rotation Activation:

Standing in your goofy/regular stance, rotate your chest open as if you wanted to look behind you over your back shoulder. Hold the rotation for 10 seconds. Feel your oblique engage. Release. Repeat 10 times. This is the activation you need EVERY backside ride.

Mission:

Before every backside wave at YB+ level, perform this rotation activation as part of your pre-paddle setup.

Self-check:

- [ ] My chest opens deliberately on every backside ride
- [ ] My eyes lead the body over my back shoulder
- [ ] I feel my oblique engage during BS rotation


==============================================================================$TSSBB$, 15, 'reading', 6, true, 'PRODUCTIZED') on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle, pillar=excluded.pillar, description_md=excluded.description_md, course_section=excluded.course_section, step_number=excluded.step_number, display_order=excluded.display_order;
insert into lessons (id, course_section, step_number, title, subtitle, pillar, description_md, estimated_minutes, lesson_type, display_order, active, status_v1) values ('STP-039', 'blue_belt', 39, $TSSBB$Bottom Turn Medium$TSSBB$, $TSSBB$Sequence #10 · Step 1$TSSBB$, $TSSBB$Technical$TSSBB$, $TSSBB$6.1 — STP-039 · Bottom Turn Medium

Pillar: Technical
Block: 5 (Rotation / Rail Change / Bottom Turn)
Position: Sequence #10 · Step 1
5 Key Words: Mid-face · U · Oblique · Lean · Flex

What you'll learn:

The Bottom Turn Medium is the BT that is executed in the mid-face of the wave — NOT down to the flat, NOT too high. It is the default BT for snap-class maneuvers.

Biomechanics:

- Strong posture · simple rotation · oblique engagement
- Lean as if trying to touch the water with your inside hand
- Maintain posture · flex your legs deeply
- Draw a U shape on the wave face (mental visualization)
- The BT ends when the Projection begins — there is no gap between BT and Projection

Coach cue:

   | "Draw the U · lean to touch water · oblique engaged · ready to project."

Drill 1 — Land BT Simulation:

Stand in your stance. Lean to one side as if performing a BT. Engage your oblique. Hold for 5 seconds. Switch sides. 10 reps each side.

Drill 2 — Chalk U on Floor + Skateboard:

Draw a U shape on the ground in chalk. On a skateboard, ride following the U pattern. Feel where the BT begins, where it deepens, where it ends.

Mission:

On 5 frontside waves: execute a BT Medium. Do not worry about the snap that follows — just focus on the BT itself. Was it in the mid-face? Did you draw the U?

Common errors:

- ERR-115 — BT too low (going to the flat) → loses mid-face position
- ERR-116 — BT too high (not coming down enough) → no energy to project
- ERR-117 — No oblique engagement → BT becomes a passive lean
- ERR-118 — Stopping the BT before Projection begins (gap between stages)

Self-check:

- [ ] My BT is in the mid-face (not flat, not too high)
- [ ] My oblique engages during the BT
- [ ] I draw a visible U shape on the wave face
- [ ] My BT flows directly into Projection without a pause$TSSBB$, 15, 'reading', 7, true, 'PRODUCTIZED') on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle, pillar=excluded.pillar, description_md=excluded.description_md, course_section=excluded.course_section, step_number=excluded.step_number, display_order=excluded.display_order;
insert into lessons (id, course_section, step_number, title, subtitle, pillar, description_md, estimated_minutes, lesson_type, display_order, active, status_v1) values ('STP-040', 'blue_belt', 40, $TSSBB$Projection$TSSBB$, $TSSBB$Sequence #10 · Step 2$TSSBB$, $TSSBB$Technical$TSSBB$, $TSSBB$6.2 — STP-040 · Projection

Pillar: Technical
Block: 6 (Projection)
Position: Sequence #10 · Step 2
5 Key Words: Extend · Align · Forward · Launch · Snap

What you'll learn:

Projection is the moment of converting the BT's stored energy into forward + upward energy directed toward the maneuver point. Your legs extend, your body aligns with the maneuver direction, and you launch into the snap.

Biomechanics:

- Legs extend (chain reaction from BT compression)
- Chest aligns toward the maneuver direction
- Front leg extends fully
- Arms rise to lead the body upward
- Hand position: arms extended forward and slightly up

Coach cue:

   | "Extend · point with the shoulders · chest forward · ready to snap."

Drill — Land Projection from BT Position:

Get into the BT position (flexed knees, lean to one side, oblique engaged). Now explode upward: extend your legs, align your chest toward the snap direction, raise your arms. Hold the top position for 2 seconds. Repeat 10 reps each side.

Mission:

On 5 frontside waves: execute BT + Projection. Do not attempt the snap yet. Focus on the explosion from BT into Projection.

Common errors:

- ERR-119 — Projection too late (you are already in Cruz when Projection should have fired)
- ERR-120 — Not extending legs (no actual launch)
- ERR-121 — Arms passive during projection (loses the upward energy)

Self-check:

- [ ] My Projection fires immediately after the BT
- [ ] My legs extend fully
- [ ] My arms rise to lead the body upward$TSSBB$, 15, 'reading', 8, true, 'PRODUCTIZED') on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle, pillar=excluded.pillar, description_md=excluded.description_md, course_section=excluded.course_section, step_number=excluded.step_number, display_order=excluded.display_order;
insert into lessons (id, course_section, step_number, title, subtitle, pillar, description_md, estimated_minutes, lesson_type, display_order, active, status_v1) values ('STP-041', 'blue_belt', 41, $TSSBB$Cruz Snap$TSSBB$, $TSSBB$Sequence #10 · Step 3$TSSBB$, $TSSBB$Technical$TSSBB$, $TSSBB$6.3 — STP-041 · Cruz Snap

Pillar: Technical
Block: 7 (Maneuver)
Position: Sequence #10 · Step 3
5 Key Words: Cruz · Cross · Chest · Eyes · Rail

What you'll learn:

The Cruz Snap is the frontside snap maneuver executed from Projection. Your body enters a Cruz position (palms forward · chest open · eyes over shoulder · oblique engaged · rail change) and the snap fires.

Biomechanics:

- Enter the Cruz position:
  - Palms forward
  - Chest opens
  - Eyes look over the shoulder toward the back of the wave
  - Oblique engages on your body's outside
  - Rail changes from the FS rail to the inside rail
- Goofy: left hand crosses · right hand leads
- Regular: right hand crosses · left hand leads
- Front foot stays grounded · rail tilts
- The snap fires for a brief moment then releases — that release is the Grenade (Step 4)

Coach cue:

   | "Cross the hand · open the chest · eyes over the shoulder · rail change · snap."

Drill — Cruz Position on Land:

Stand in your stance. Cross your hand over your body (goofy = left over · regular = right over). Open your chest. Look over your shoulder. Engage your oblique. Hold for 5 seconds. Release. Repeat 10 reps. Feel the geometry of the Cruz — this is the position you will enter on every Cruz Snap and every Cruz Cutback.

Mission:

On 5 frontside waves: attempt the full chain Posture → BT → Projection → Cruz Snap. Do not worry about the Grenade closure yet — just enter the Cruz.

Common errors:

- ERR-122 — Cruz without rail change (looks like a Cruz but no actual maneuver)
- ERR-123 — Closed chest in Cruz (defeats the position)
- ERR-124 — Eyes forward instead of over shoulder
- ERR-125 — Hand crosses too late (rail hasn't changed yet)
- ERR-126 — Forgetting to release the Cruz (stuck in the position)

Self-check:

- [ ] My Cruz includes the rail change
- [ ] My chest opens fully in the Cruz
- [ ] My eyes go over the shoulder
- [ ] My hand crosses early enough to lead the rail change$TSSBB$, 15, 'reading', 9, true, 'PRODUCTIZED') on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle, pillar=excluded.pillar, description_md=excluded.description_md, course_section=excluded.course_section, step_number=excluded.step_number, display_order=excluded.display_order;
insert into lessons (id, course_section, step_number, title, subtitle, pillar, description_md, estimated_minutes, lesson_type, display_order, active, status_v1) values ('STP-042', 'blue_belt', 42, $TSSBB$Grenade$TSSBB$, $TSSBB$Sequence #10 · Step 4$TSSBB$, $TSSBB$Technical$TSSBB$, $TSSBB$6.4 — STP-042 · Grenade

Pillar: Technical
Block: 7 (Maneuver / Expression — closure)
Position: Sequence #10 · Step 4
5 Key Words: Explode · Throw · Extend · Return · Low

What you'll learn:

The Grenade is the explosive energy release that closes the Cruz Snap. You extend out of the Cruz position with maximum commitment — like throwing a grenade — and return to posture.

Biomechanics:

- From the Cruz position: explode upward and forward
- Throw the leading arm forward (the grenade gesture)
- Extend the legs fully
- Return to posture with hips down + chest over front knee (this is the Low Finish — see Concept in Section 10)
- The Grenade is the FS closure that converts the Cruz Snap back into posture

Coach cue:

   | "Throw the grenade · extend · return to posture · low finish."

Drill — Grenade from Cruz Position:

Enter the Cruz position on land. From the Cruz: explode upward, throw your leading arm forward as if launching a grenade, extend your legs, and land back in flexed posture with hips down. Repeat 10 reps each side.

Mission:

On 5 frontside waves: complete the full chain Posture → BT → Projection → Cruz → Grenade → Posture. No stage skipped. Audit: did you return to posture cleanly?

Common errors:

- ERR-127 — Grenade with no commitment (closure is weak · you can't return to posture)
- ERR-128 — No Low Finish (you end up extended · not ready for next cycle)
- ERR-129 — Grenade thrown without rail still engaged (closure doesn't convert)

Self-check:

- [ ] My Grenade fires explosively (not softly)
- [ ] I return to flexed posture (Low Finish) after the Grenade
- [ ] I am ready for the next cycle immediately$TSSBB$, 15, 'reading', 10, true, 'PRODUCTIZED') on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle, pillar=excluded.pillar, description_md=excluded.description_md, course_section=excluded.course_section, step_number=excluded.step_number, display_order=excluded.display_order;
insert into lessons (id, course_section, step_number, title, subtitle, pillar, description_md, estimated_minutes, lesson_type, display_order, active, status_v1) values ('STP-043', 'blue_belt', 43, $TSSBB$Choke (BS Projection)$TSSBB$, $TSSBB$Sequence #11 · Step 1$TSSBB$, $TSSBB$Technical$TSSBB$, $TSSBB$7.1 — STP-043 · Choke (BS Projection)

Pillar: Technical
Block: 6 (Projection · backside variant)
Position: Sequence #11 · Step 1
5 Key Words: Cross · Extend · Chest · Shoulders · Point

What you'll learn:

Choke is the projection of backside. It generates speed through body extension + the choke movement, while rotating the chest toward the intended maneuver direction. The Choke is the backside equivalent of the FS Projection (STP-040).

Biomechanics:

From strong posture maintaining BT rotation:
- Extend legs (chain reaction)
- Cross your arm over the waist (goofy = LEFT, regular = RIGHT) as if grabbing a sword from the other side, or doing a jiu-jitsu choke
- Hand crosses over body
- Effect: speed via extension + speed via choke movement + chest rotates toward maneuver direction (better vision) + nose of board points where your shoulders point
- The Choke ends when the Tapaloco begins

Coach cue:

   | "Choke · point with the shoulders · cross the arm · extend the legs."

Drill — Choke on Land:

Get into BT position (flexed knees, leaning). Now extend your legs and simultaneously cross your arm over your waist as if grabbing a sword from the other side. Your chest should rotate toward the direction you intend to go. Hold the position for 3 seconds. Repeat 10 reps.

Mission:

On 5 backside waves: execute BT + Choke. Do not attempt the Tapaloco yet — just feel the Choke as a complete projection. Did your chest rotate? Did your legs extend?

Common errors:

- ERR-130 — Skipping the Choke entirely (going BT → Tapaloco)
- ERR-131 — Weight drifts to back foot during Choke
- ERR-132 — Not extending legs (Choke loses speed-generation)
- ERR-133 — Inactive scapula during Choke

Self-check:

- [ ] My Choke includes the arm crossing
- [ ] My legs extend during the Choke
- [ ] My chest rotates toward the maneuver direction
- [ ] My weight stays forward (does not drift backward)$TSSBB$, 15, 'reading', 11, true, 'PRODUCTIZED') on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle, pillar=excluded.pillar, description_md=excluded.description_md, course_section=excluded.course_section, step_number=excluded.step_number, display_order=excluded.display_order;
insert into lessons (id, course_section, step_number, title, subtitle, pillar, description_md, estimated_minutes, lesson_type, display_order, active, status_v1) values ('STP-044', 'blue_belt', 44, $TSSBB$Tapaloco Snap$TSSBB$, $TSSBB$Sequence #11 · Step 2$TSSBB$, $TSSBB$Technical$TSSBB$, $TSSBB$7.2 — STP-044 · Tapaloco Snap

Pillar: Technical
Block: 7 (Maneuver)
Position: Sequence #11 · Step 2
5 Key Words: Hand · Palm · Over · Ear · Forward

What you'll learn:

Tapaloco Snap is the action that changes the rail on backside. It can be done with arm, elbow, shoulder, OR ideally with the HAND. The hand-version is the canonical ideal.

The 4 variants of Tapaloco:

1. With ARM (least exaggerated)
2. With ELBOW (intermediate)
3. With SHOULDER (more exaggerated)
4. With HAND, palm UP, over head, covering ear (CANONICAL IDEAL)

Biomechanics (HAND ideal variant):

- Goofy = right hand · Regular = left hand
- Rotate your palm UP as much as possible
- When the Tapaloco executes, your hand points upward (more mobility + better movement)
- Sequence:
  - Look over your shoulder
  - Engage your oblique
  - Execute the Choke (prep — already done from Step 1)
  - Throw your hand OVER your head, covering the opposite ear
  - Look over your shoulder toward the bottom of the wave / your intended direction
  - Your oblique changes → rail engages
  - Once the rail is engaged → the Elbow follows (Step 3)
- CRITICAL: weight always FORWARD — never behind your hip (otherwise you get stuck on the wave and lose speed)

Coach cue:

   | "Oblique · elbow · hips down · posture."

Drill — Tapaloco Isolated on Land:

Get into Choke position. Now throw your hand (palm UP) over your head as if covering your opposite ear. Look over your shoulder. Feel your rail change. Hold for 3 seconds. Repeat 10 reps. Practice the HAND ideal variant — don't settle for the arm or elbow version yet.

Mission:

On 5 backside waves: execute BT + Choke + Tapaloco Snap. Try the HAND ideal variant. Did your palm rotate UP? Did your hand cover the opposite ear?

Common errors:

- ERR-134 — Not rotating the palm upward (reduces quality of movement)
- ERR-135 — Weight drifts backward (CRITICAL — gets stuck on wave)
- ERR-136 — Not looking over the shoulder (eyes don't lead movement)
- ERR-137 — Front leg not extending (snap loses power)
- ERR-138 — Compensating with arms instead of body (disconnected from body chain)

Self-check:

- [ ] I executed the HAND variant (not just arm or elbow)
- [ ] My palm rotated UP during the Tapaloco
- [ ] My hand covered the opposite ear
- [ ] My weight stayed forward throughout$TSSBB$, 15, 'reading', 12, true, 'PRODUCTIZED') on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle, pillar=excluded.pillar, description_md=excluded.description_md, course_section=excluded.course_section, step_number=excluded.step_number, display_order=excluded.display_order;
insert into lessons (id, course_section, step_number, title, subtitle, pillar, description_md, estimated_minutes, lesson_type, display_order, active, status_v1) values ('STP-045', 'blue_belt', 45, $TSSBB$Elbow (BS Closure)$TSSBB$, $TSSBB$Sequence #11 · Step 3$TSSBB$, $TSSBB$Technical$TSSBB$, $TSSBB$7.3 — STP-045 · Elbow (BS Closure)

Pillar: Technical
Block: 7 (Maneuver / Expression — closure)
Position: Sequence #11 · Step 3
5 Key Words: Up · Scapula · Energy · Foot · Throw

What you'll learn:

Elbow is the action that adds rotational energy that travels down to the rail. Used AFTER the rail has changed (post-Tapaloco) to add energy to the closing motion. The Elbow is the backside equivalent of the Grenade (STP-042 FS).

Biomechanics:

- Throw the elbow: goofy = LEFT elbow (the arm that did the Tapaloco), regular = RIGHT elbow
- Elbow elevated UPWARD (NOT downward)
- Maintain opposite scapula active — as if you are trying to UNITE THE TWO SCAPULAS together
- This gives stability + ensures energy travels down your body to the foot/rail
- Drill detail: when practicing outside the water, do it AS IF your BACK FOOT (the one on the tail) FOLLOWS the elbow

Coach cue:

   | "Elbow up · scapulas united · back foot follows the elbow · energy down to the rail."

Drill — Elbow Isolated on Land:

Get into Tapaloco position (hand over head). Now throw your elbow (the one that did the Tapaloco) UPWARD. Activate your opposite scapula — feel as if your two scapulas are trying to unite. Let your back foot follow the elbow's direction. Hold for 3 seconds. Repeat 10 reps.

Mission:

On 5 backside waves: complete the full chain BT + Choke + Tapaloco + Elbow. No stage skipped. Did your elbow go UP (not down)? Did you feel your scapulas unite?

Common errors:

- ERR-139 — Elbow done too softly (no rotational energy)
- ERR-140 — Elbow thrown downward instead of upward (breaks energy chain)
- ERR-141 — Skipping Elbow entirely (no throw water)

Self-check:

- [ ] My Elbow goes UP (not down)
- [ ] My scapulas unite during the Elbow
- [ ] My back foot follows the elbow
- [ ] I see water thrown at the end of the maneuver$TSSBB$, 15, 'reading', 13, true, 'PRODUCTIZED') on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle, pillar=excluded.pillar, description_md=excluded.description_md, course_section=excluded.course_section, step_number=excluded.step_number, display_order=excluded.display_order;
insert into lessons (id, course_section, step_number, title, subtitle, pillar, description_md, estimated_minutes, lesson_type, display_order, active, status_v1) values ('STP-046', 'blue_belt', 46, $TSSBB$Cruz Cutback$TSSBB$, $TSSBB$Sequence #12 · Step 1$TSSBB$, $TSSBB$Technical$TSSBB$, $TSSBB$8.1 — STP-046 · Cruz Cutback

Pillar: Technical
Block: 7 (Maneuver)
Position: Sequence #12 · Step 1
5 Key Words: Maintain · Arc · Pocket · Return · Hold

What you'll learn:

The Cruz Cutback is the action of returning to the pocket of the wave by drawing the full arc on the face. It is an extension of the Cruz Snap (Seq #10) — same body position, but sustained until you have returned to the pocket.

Biomechanics:

   | "Basically everything is the same as the Cruz Snap: same BT, same Projection. Only this time, when entering the Cruz — with your eyes, the oblique, and all the details — you simply MAINTAIN that position until you draw the arc and you can see the white water coming from behind you — that is, the pocket."

When you see the pocket → close with the Grenade and return to posture.

Body during the Cruz Cutback:
- Sustain the Cruz position
- Your leg can extend, but it can also bend back a little
- Stay flexed and bent until the Grenade is thrown
- When the Grenade fires → extend your leg fully → return to posture

Goofy / Regular: same as Cruz Snap (STP-041) — one side or the other depending on your stance.

Timing differentiator (CANON-GRADE):

   | The Cruz Cutback is performed FARTHER from the white water than the Cruz Snap.

| Maneuver | Distance from foam | BT length |
| Cruz Snap (Seq #10) | Closer to the foam | Standard BT Medium |
| Cruz Cutback (Seq #12) | Farther from the foam | Longer BT to create space for the return arc |

You move away from the foam with a longer BT to create the space necessary to return to the foam.

   | Doctrinal rule: "If you don't return — it was a Snap, not a Cutback."

Coach cue:

   | "Maintain the cutback position · wait to see the white water · wait to see the pocket."

Drill — Cruz Cutback Isolated:

On land: enter the Cruz position. Now MAINTAIN it for 5 full seconds. Resist the urge to release. Imagine you are drawing an arc on the wave face. Only release when you "see the pocket" (visualize it). Repeat 10 reps each side.

On skateboard: ride in a long arc following a chalk U on the ground. Enter the Cruz at the bottom of the arc. Maintain through the curve. Release at the top.

Mission:

On 5 frontside waves: attempt the Cruz Cutback. Do not worry about perfection. Focus on the question: did I return to the pocket? If yes → Cutback. If no → Snap. The doctrinal rule is non-negotiable.

Common errors:

- ERR-142 — Releasing too early (you closed the Grenade before finishing the cutback)
- ERR-143 — Cutting the line in two movements (cutback in 2 disconnected motions instead of one)
- ERR-144 — Treating it like a Snap (you did not return to the pocket)
- ERR-145 — Bottom Turn too short (you did not create enough space)
- ERR-146 — Eyes not following the pocket

Self-check:

- [ ] My cutback drew a single continuous arc (not two disconnected movements)
- [ ] I returned to the pocket
- [ ] My BT was visibly longer than my BT for a Snap
- [ ] My Cruz position stayed engaged until I saw the pocket$TSSBB$, 15, 'reading', 14, true, 'PRODUCTIZED') on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle, pillar=excluded.pillar, description_md=excluded.description_md, course_section=excluded.course_section, step_number=excluded.step_number, display_order=excluded.display_order;
insert into lessons (id, course_section, step_number, title, subtitle, pillar, description_md, estimated_minutes, lesson_type, display_order, active, status_v1) values ('STP-047', 'blue_belt', 47, $TSSBB$Hold$TSSBB$, $TSSBB$Sequence #12 · Step 2$TSSBB$, $TSSBB$Technical$TSSBB$, $TSSBB$8.2 — STP-047 · Hold

Pillar: Technical
Block: 7 (Maneuver · integrated within)
Position: Sequence #12 · Step 2
5 Key Words: Hold · Save · Don't release · Cruz · Flexed

What you'll learn:

Hold is simply maintaining the position to save the energy.

Canon connection:

   | "This is the H of P·R·C·H from the Canon of the Three Circles of Power."

You learned P·R·C·H at White Belt as a conceptual framework. At Blue Belt, the H (Hold) becomes an actual operational STP — for the first time. Until now, Hold was an idea. At Seq #12 it becomes a thing you do.

Purpose:

Hold is what allows you to:
- Save the energy of throwing the Grenade prematurely
- Manage energies + save positions to complete the lines
- Create connected lines — NOT a cutback made in two disconnected lines
- Sustain the Cruz position throughout the cutback arc

Biomechanics:

The body during the Hold position:
- Maintains the Cruz position (same as STP-041 + STP-046)
- Stays FLEXED in the Cruz · your leg stays bent
- Does NOT extend the leg until the Grenade is about to be thrown
- Your weight stays on your FRONT leg
- All the details of the Cruz (palms forward · chest open · eyes over shoulder · oblique · rail change) are PRESERVED during the Hold

When the Grenade fires → leg extends fully → return to posture.

Coach cue:

   | "Hold · don't release · stay in the Cruz · save the energy."

Drill 1 — Hold Isolated on Land:

Enter the Cruz position. Now hold it for 10 full seconds without extending your leg. Stay flexed. Feel the energy storing in your legs. Release with a sharp Grenade extension. Repeat 10 reps each side.

Drill 2 — Hold Voice Command:

Have someone (or your phone with a timer) call out "Hold" and you start the Cruz position. They call "Release" after a variable time (3-10 seconds). Train your patience. This is the ecological mission that BB asks you to internalize — your timing must come from the wave, not from your own anxiety.

Mission 1 — Hold Forever:

On 5 frontside waves: sustain the Cruz position as long as possible before releasing the Grenade. The goal is patience. Was your Hold too short? Too long?

Mission 2 — Hold Voice Command Timing (Ecological):

In your next session, ask a coach or friend to call out "Hold" and "Release" verbally from the shore. Practice the timing first OUT of water (land drill), then INSIDE the water. This trains your time-perception.

Common errors:

- ERR-147 — Cutback in two movements (you broke the Hold = cutback aborted in middle)
- ERR-148 — Releasing the Hold too early
- ERR-149 — Extending the leg before the Grenade (premature extension breaks energy storage)
- ERR-150 — Losing weight forward during Hold
- ERR-151 — Losing the Cruz details during Hold (the position degrades)
- ERR-152 — Not understanding Hold = the H of PRCH (treating it as arbitrary delay)

Self-check:

- [ ] I held the Cruz for the full arc (no break)
- [ ] My leg stayed flexed throughout the Hold
- [ ] My weight stayed forward
- [ ] All my Cruz details (palms, chest, eyes, oblique) stayed engaged during the Hold$TSSBB$, 15, 'reading', 15, true, 'PRODUCTIZED') on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle, pillar=excluded.pillar, description_md=excluded.description_md, course_section=excluded.course_section, step_number=excluded.step_number, display_order=excluded.display_order;
insert into lessons (id, course_section, step_number, title, subtitle, pillar, description_md, estimated_minutes, lesson_type, display_order, active, status_v1) values ('STP-048', 'blue_belt', 48, $TSSBB$Tapaloco Cutback$TSSBB$, $TSSBB$Sequence #13 · Step 1$TSSBB$, $TSSBB$Technical$TSSBB$, $TSSBB$9.1 — STP-048 · Tapaloco Cutback

Pillar: Technical
Block: 7 (Maneuver)
Position: Sequence #13 · Step 1
5 Key Words: Maintain · Survive · Pocket · Return · Codazo

What you'll learn:

The Tapaloco Cutback is the action of returning to the pocket on the backside. Same body mechanics as Tapaloco Snap, but sustained until you reach the foam.

Biomechanics:

   | "Everything happens the same as Tapaloco Snap. Only when you perform the Tapaloco and enter the other rail, you are going to stay in that position — that is, you are going to remain in a position of posture with simple rotation, with the oblique, and you are going to maintain, maintain — Hold, Hold, Hold — until you can see the white water and decide if you want to finish the cutback."

When you decide to finish → you throw the Codazo (which is the Elbow STP-045 functioning as the closure).

Body during the Tapaloco Cutback:
- Same BT BS + same Choke as Seq #11
- Same entry to the Tapaloco (HAND ideal variant with palm UP)
- Once the rail has changed → stay in the new-rail position with posture + simple rotation + oblique engaged
- Hold-Hold-Hold until you see the foam · then decide to finish with Codazo
- Legs stay flexed throughout · when the Codazo fires → legs extend → return to posture

Timing differentiator (mirror of Seq #12 rule):

| Maneuver | Distance from foam | BT length |
| Tapaloco Snap (Seq #11) | Closer to foam | Standard BT Medium |
| Tapaloco Cutback (Seq #13) | Farther from foam | Longer BT to create space |

   | Doctrinal rule (mirror of Seq #12): "If you don't return — it was a Snap, not a Cutback."

Coach cue:

   | "Hold the position · simple rotation · Hold Hold Hold · Codazo to close and return to posture."

Drill — Tapaloco Cutback Isolated:

On land: enter Tapaloco position (hand over head, palm UP). Now hold it for 5 seconds in the new-rail position. Maintain simple rotation. Maintain the Tapaloco position. When you "see the foam" (visualize it), throw your Codazo and return to posture. Repeat 10 reps.

On skateboard: same flow on a long arc following chalk.

Mission:

On 5 backside waves: attempt the Tapaloco Cutback. The goal: survive the foam return. Did you return to the foam? Did you come back out to the wave face?

Common errors:

- ERR-153 — Not holding the position
- ERR-154 — Throwing the Codazo too quickly (releases Hold early)
- ERR-155 — Not looking where you need to go (eyes don't lead)
- ERR-156 — Not using a good simple rotation
- ERR-157 — Treating it like a Snap (does not return)

Self-check:

- [ ] I returned to the foam (not just stayed on the wave face)
- [ ] I survived the foam encounter
- [ ] I came back out to the wave face
- [ ] My cutback drew a single continuous line (not two disconnected movements)$TSSBB$, 15, 'reading', 16, true, 'PRODUCTIZED') on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle, pillar=excluded.pillar, description_md=excluded.description_md, course_section=excluded.course_section, step_number=excluded.step_number, display_order=excluded.display_order;
insert into lessons (id, course_section, step_number, title, subtitle, pillar, description_md, estimated_minutes, lesson_type, display_order, active, status_v1) values ('STP-049', 'blue_belt', 49, $TSSBB$Hold Rotation$TSSBB$, $TSSBB$Sequence #13 · Step 2$TSSBB$, $TSSBB$Technical$TSSBB$, $TSSBB$9.2 — STP-049 · Hold Rotation

Pillar: Technical
Block: 7 (Maneuver · integrated within)
Position: Sequence #13 · Step 2
5 Key Words: Hold · Rotation · Save · Flexed · Codazo

What you'll learn:

Hold Rotation is the same Hold doctrine from Seq #12, applied to backside. Same principle: maintain the position to save the energy. Different rail orientation.

Canon connection:

   | "The Hold enters the Three Circles of Power in the Hold part."

Hold Rotation = the BS application of the H of P·R·C·H. Same doctrinal root as Hold FS (STP-047) · different rail orientation.

Biomechanics:

   | "When the Tapaloco is performed, the rail changes, and you enter into basic posture and you do a basic rotation, and that is where the position is maintained."

The body during Hold Rotation:
- The Tapaloco has already changed the rail → you are now on the new rail
- Enter basic posture with simple rotation (oblique engaged · look over shoulder toward pocket)
- Your back foot must be all the way back in FP1
- Maintain posture and composure of all previous steps (posture · oblique · rail · etc.)
- Legs stay FLEXED · do NOT extend until the Codazo fires
- The Tapaloco position stays maintained (can be exaggerated · used as a concept)
- The most important thing is to change the rail — the Tapaloco can be done with shoulder/elbow/HAND (HAND with palm UP is the ideal)
- When the Codazo fires → legs extend fully → return to posture

Coach cue:

   | "Hold · don't release · stay in the rotation · save the energy · Codazo to close."

Drill 1 — Hold Rotation Isolated:

On land: enter Tapaloco position. Now sustain the new-rail position with simple rotation + oblique + Tapaloco maintained · WITHOUT extending your legs. Hold for 10 seconds. Release with sharp Codazo. Repeat 10 reps.

Drill 2 — Hold Voice Command BS (Ecological):

Same as Hold Voice Command on FS (Seq #12) but applied to backside. Practice the timing OUT of water first, then INSIDE the water.

Mission — Hold Forever (BS):

On 5 backside waves: sustain the Hold Rotation as long as possible before releasing the Codazo.

Common errors:

- ERR-158 — Tapaloco Cutback broken into 2 movements
- ERR-159 — Releasing the Hold Rotation too early
- ERR-160 — Extending the legs before the Codazo
- ERR-161 — Losing weight forward during Hold
- ERR-162 — Losing the Tapaloco position during the Hold

Self-check:

- [ ] My Hold Rotation lasted the full cutback arc
- [ ] My legs stayed flexed throughout
- [ ] My Tapaloco position stayed engaged during the Hold
- [ ] My weight stayed forward$TSSBB$, 15, 'reading', 17, true, 'PRODUCTIZED') on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle, pillar=excluded.pillar, description_md=excluded.description_md, course_section=excluded.course_section, step_number=excluded.step_number, display_order=excluded.display_order;
insert into lessons (id, course_section, step_number, title, subtitle, pillar, description_md, estimated_minutes, lesson_type, display_order, active, status_v1) values ('BB-CONCEPTS-01', 'blue_belt', 590, $TSSBB$The Four Blue Belt Concepts$TSSBB$, $TSSBB$Floater · Impulso · Low Finish · BT Concept$TSSBB$, $TSSBB$Technical / Concepts$TSSBB$, $TSSBB$10. THE FOUR BLUE BELT CONCEPTS
==============================================================================


These are CONCEPTS (not Sequences) — transversal techniques you carry across multiple sequences at BB level and beyond. They are not bound to a single STP — they apply everywhere.


10.1 — Floater
──────────────

Canon phrase: "The Floater is a maneuver done for transition · to pass through sections."

Biomechanics:

   | "To where the wave is breaking and there is a lip or a foam, you climb up with the belly of the board over the foam and cross that section, and then come down and make the transition there."

When to use: when a section of the wave is breaking ahead and would otherwise force you off the wave. To pass sections that cannot be cleared with speed alone.

Coach cue:

   | "Belly of the board over the foam · cross the section · come down and transition."

Mission: identify 1 wave per session where you use a Floater to pass a section. Watch other surfers do it. Then attempt it yourself.


10.2 — Impulso
──────────────

Canon phrase: "The Impulso is something you use to generate speed every time it is necessary."

Biomechanics:

   | "Generally it is done with the two hands flexing and propelling yourself forward."

Doctrinal principle:

   | "The buoyancy of the board is much more stable when you go with speed. You want to maintain your momentum, and the Impulso is a key technique for that."

When to use:
- After a cutback when you get stuck on the foam → use Impulso to come out forward and generate momentum
- Any moment where speed drops and balance is at risk

Coach cue:

   | "Two hands · flex · propel forward · generate speed · maintain momentum."

Cross-reference note: the foundational Impulso technique was introduced at WB. At BB you deepen its application — specifically for post-cutback recovery. Re-read the WB Master Manual section on Impulso if you need a refresher on the foundational mechanics.

Mission: in every session that includes a cutback attempt, use Impulso to recover momentum after the cutback closes. Make it automatic.


10.3 — Low Finish
─────────────────

Canon phrase: "Low Finish: every time you finish a maneuver, you finish again in flexed posture and maintain yourself on your board with hips down."

Biomechanics:
- Hips down
- Chest over the knee
- Flexed posture
- Maintain stability on the board

Doctrinal note from Marcelo: "These are very simple things."

Low Finish is the default closing posture for every maneuver at BB level and beyond. It is not a separate maneuver — it is what you always return to.

Coach cue:

   | "Hips down · chest over the knee · low finish."

Mission: every closure of every maneuver returns to Low Finish. Audit yourself: are you ending in flexed posture or in extended posture? Extended = wrong. Flexed = correct.


10.4 — Bottom Turn (BT) Concept
───────────────────────────────

Canon phrase: "The Bottom Turn is the U that you draw on the face of the wave."

Doctrinal purpose:

   | "The Bottom Turn is a tool you use to perform all the different maneuvers — it is the way you set yourself up to be able to perform the maneuvers."

The 4 Types of Bottom Turn (canonized BB-level):

| Type | When to Use | Function |
| Deep BT (profundo) | Wave allows full descent | Maximum projection · radical maneuvers (post-BB) |
| Mid-Face BT (media cara) | Standard BT for snaps | Canonized as STP-039 BT Medium · default at BB |
| Long BT (largo) | Extra space needed for return arc | Enables Cruz Cutback (Seq #12) + Tapaloco Cutback (Seq #13) |
| Extended BT (extendido) | Sustained BT through long section | Advanced linking + long-section flow |

   | Doctrinal principle: The BT is not a maneuver itself — it is the setup. Your choice of BT type determines what maneuver is possible.

Coach cue:

   | "Draw the U on the face of the wave · set yourself up for the maneuver · choose the BT type based on what you want to do."

Mission: before every wave, decide which BT type you will use. Verbalize it: "This wave I will use a Long BT because I want to do a Cutback." Train the decision-making.


10.5 — Cross-Concept Integration
────────────────────────────────

| Concept | Where It Activates |
| Floater | Between sections · when a wave breaks ahead |
| Impulso | After cutback · whenever speed drops |
| Low Finish | At closure of EVERY maneuver |
| BT Concept | At setup of EVERY maneuver |

Doctrinal pairings:
- BT Concept (setup) ↔ Low Finish (closure) — every BB maneuver is bracketed by these
- Floater (transition) ↔ Impulso (speed maintenance) — every BB ride with multiple sections uses both

Internalize these four concepts. They are your operational toolkit beyond the Universal Formula.


==============================================================================$TSSBB$, 15, 'reading', 18, true, 'PRODUCTIZED') on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle, pillar=excluded.pillar, description_md=excluded.description_md, course_section=excluded.course_section, step_number=excluded.step_number, display_order=excluded.display_order;
insert into lessons (id, course_section, step_number, title, subtitle, pillar, description_md, estimated_minutes, lesson_type, display_order, active, status_v1) values ('BB-MOD-INT', 'blue_belt', 600, $TSSBB$The Complete Blue Belt Ride (Integration Module)$TSSBB$, $TSSBB$The unified Infinite Circle$TSSBB$, $TSSBB$Integration Module$TSSBB$, $TSSBB$11. THE COMPLETE BLUE BELT RIDE (INTEGRATION MODULE)
==============================================================================


You now have everything you need. This section integrates all your BB STPs + Concepts into the Infinite Circle — the continuous execution loop within the wave.


11.1 — What the Infinite Circle is
──────────────────────────────────

The Infinite Circle is the applied synthesis of the method within the wave. It defines the continuous execution loop once you are on the wave face.

Entry Sequence (before the loop):

Find sweet spot → Chase wave → Set paddling angle → Cobra + Pick Line → Pop-Up + Foot Position

Continuous Loop:

   | POSTURE → ROTATION / BOTTOM TURN → PROJECTION → MANEUVER / EXPRESSION → RECOVERY → Return to POSTURE → Repeat ∞

At Blue Belt, you become capable of executing the full Infinite Circle reliably. At Seq #12/#13 the loop extends to include the Hold within the Maneuver stage. By end of BB you can execute 1-2 Infinite Circle iterations per wave.

   | Looking ahead: at Brown Belt you will execute the Infinite Circle automatically + multiple times per wave. That is the path.


11.2 — The Complete BB Operational Chain (15 stages)
────────────────────────────────────────────────────

Every wave at Blue Belt level follows this 15-stage chain:

| Stage | Action | Source belt |
| 1 | Venue Analysis | WB · upgraded to Independent at BB |
| 2 | Warm-Up (Bhastrika + body) | YB |
| 3 | Goal Setting (in notebook) | NEW at BB |
| 4 | Paddle Out | WB |
| 5 | Scan Wave Stages (STP-033) | YB |
| 6 | Identify the Pocket (STP-028) | YB |
| 7 | Paddle Speed + Angle (STP-027 + STP-029) | YB |
| 8 | Cobra + Pick Line (STP-034) | YB |
| 9 | Pop-Up + Foot Position (STP-030) | YB |
| 10 | Press the Button to FP3 (if pumping needed) | NEW BB |
| 11 | Pump (STP-036 or STP-037) for speed | NEW BB |
| 12 | Press the Button to FP1 (before maneuver) | NEW BB |
| 13 | Universal Sequence Formula (Posture → Rotation → Projection → Maneuver → Closure → Posture) | NEW BB · core of the belt |
| 14 | Low Finish + Impulso (recovery) | NEW BB Concepts |
| 15 | Feedback + Reflection + 3 Questions in notebook | NEW at BB |


11.3 — How to use this chain
────────────────────────────

In every BB session:
1. Read the chain before getting in the water
2. Execute each stage with awareness
3. After the session, audit which stage was strongest / weakest
4. Pick ONE stage to drill in the next session

This is your One Wave Framework at BB level. Same principle you learned at YB · now with more stages.


11.4 — Self-Correction practice
───────────────────────────────

After every session, in your notebook, write:

3 Questions for Self-Correction:

1. What do I want to do but can't?
2. Is it an execution or decision problem?
3. What is causing it? (Physical / Mental / Technical / Tactical)

Then write:
- 1 win (specific moment)
- 1 error (specific stage of Universal Formula that failed)
- 1 mission for next session

That is the practice. Do it every session. It is what separates the BB student from the YB student.


==============================================================================$TSSBB$, 15, 'reading', 19, true, 'PRODUCTIZED') on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle, pillar=excluded.pillar, description_md=excluded.description_md, course_section=excluded.course_section, step_number=excluded.step_number, display_order=excluded.display_order;
insert into lessons (id, course_section, step_number, title, subtitle, pillar, description_md, estimated_minutes, lesson_type, display_order, active, status_v1) values ('BB-EXIT-01', 'blue_belt', 800, $TSSBB$Blue Belt Exit Test (Self-Evaluation)$TSSBB$, $TSSBB$Self-evaluation$TSSBB$, $TSSBB$Evaluation$TSSBB$, $TSSBB$12. BLUE BELT EXIT TEST (SELF-EVALUATION)
==============================================================================


The Blue Belt Exit Test certifies that you have owned the Universal Sequence Formula across the 6 BB sequences and have internalized Compromiso Consciente.

   | You are your own evaluator at Blue Belt. Until now you had a coach who could tell you if you passed. At BB, you self-administer this test honestly. Your honesty IS the test.


12.1 — The doctrinal threshold
──────────────────────────────

   | GLOBAL THRESHOLD: "Execution with awareness, not perfection."

You PASS Blue Belt when you can:
1. Execute the Universal Sequence Formula on at least 4 of 5 attempts per sequence (Seq #10, #11, #12, #13)
2. Pump effectively on FS and BS (Seq #8, #9) at least 3 of 5 attempts per side
3. Self-identify which stage failed when execution is below threshold
4. Demonstrate the 4 BB Concepts (Floater, Impulso, Low Finish, BT Concept) in context
5. Verbalize Compromiso Consciente in your own words


12.2 — The 6 Sequences · 5 Criteria · Self-Evaluation Rubric
────────────────────────────────────────────────────────────

| Sequence | What you evaluate | Self-threshold |
| Seq #8 Pump FS | Speed generation through pumping · weight forward · FP3 throughout | 3/5 attempts |
| Seq #9 Pump BS | Same as #8 · BS body mechanics active | 3/5 attempts |
| Seq #10 FS Foundation Chain | Universal Formula complete: Posture → BT → Projection → Cruz → Grenade → Posture | 4/5 attempts |
| Seq #11 BS Foundation Chain | Same as #10 BS · Separation Rule honored | 4/5 attempts |
| Seq #12 FS Linking | Cruz Cutback + Hold + return to pocket · single continuous line | 4/5 attempts |
| Seq #13 BS Linking | Tapaloco Cutback + Hold Rotation + survive foam return | 4/5 attempts |

How to administer the test:

Across 3 sessions in varied conditions, attempt each sequence 5 times. Count your successes. Be brutally honest with yourself. A "success" means:
- All stages of the Universal Formula were present (no skip)
- The maneuver class was correct (a Snap was a Snap, a Cutback returned to the pocket)
- The closure was present (Grenade or Codazo)
- You returned to posture cleanly (Low Finish)

If you cannot honestly say "I did all 4 of those things," it does NOT count as a success — even if the ride felt good.


12.3 — Belt Value Self-Evaluation (Compromiso Consciente)
─────────────────────────────────────────────────────────

Write in your notebook your answer to:

   | "What does Compromiso Consciente mean to me?"

Your answer must include:
- Your recognition that the structure cannot be skipped
- A specific personal example of when you wanted to skip a stage and you didn't
- Your commitment to maintain the Universal Formula even in poor conditions

This is NOT a memorization test. It is your confirmation to yourself that you have internalized the value as personal practice.


12.4 — The Big Three errors that say "not ready yet"
────────────────────────────────────────────────────

If your sessions are showing these patterns, you are NOT at BB Exit Test level — you are still in mid-BB:

1. Weight drifts backward consistently → loses speed, gets stuck on wave
2. Cutback in 2 movements → Hold failure · breaks the connected line
3. Skipping a Universal Formula stage → breaks the structural commitment

Drill the corresponding sequence in isolation until these stop.


12.5 — Acceptable / Ideal / Unacceptable Rubric
───────────────────────────────────────────────

| Level | Definition |
| Acceptable | Meets threshold per sequence · self-corrects within 2 attempts |
| Ideal | Exceeds threshold (5/5 on most sequences) · self-corrects within 1 attempt · can teach another student something |
| Unacceptable | Below threshold on any sequence · cannot self-identify failed stage · cannot verbalize Belt Value |


12.6 — Minimum sessions before Exit Test
────────────────────────────────────────

Before you take your Exit Test, you should have:
- At least 12 sessions at Blue Belt level
- At least 3 sessions per sequence (Seq #10, #11, #12, #13)
- Ideally 1 full Foundation BB Camp (if available in your academy)


12.7 — After you pass
─────────────────────

When you pass the Exit Test, you graduate to Purple Belt (Emerging). At PB the maneuvers you have just learned begin to take on variation and refinement — you start adding the rebound off the foam, the radical re-entries, the personal style.

But none of that is possible without owning the structure first. That is why Blue Belt is the structural anchor of your surfing.

   | There are no shortcuts. You have walked the path.


==============================================================================$TSSBB$, 15, 'reading', 20, true, 'PRODUCTIZED') on conflict (id) do update set title=excluded.title, subtitle=excluded.subtitle, pillar=excluded.pillar, description_md=excluded.description_md, course_section=excluded.course_section, step_number=excluded.step_number, display_order=excluded.display_order;

-- Blue Belt drills & missions (verbatim from BB_STUDENT_COURSE.txt; upserted via PostgREST).
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$DRL-BB-035$TSSBB$, $TSSBB$STP-035$TSSBB$, $TSSBB$FP1 Discovery (land)$TSSBB$, $TSSBB$drill$TSSBB$, ARRAY[$TSSBB$Back$TSSBB$,$TSSBB$Tail$TSSBB$,$TSSBB$Maneuver$TSSBB$,$TSSBB$Engage$TSSBB$,$TSSBB$Tilt$TSSBB$]::text[], $TSSBB$Stand on a balance board or imagined board on the ground. Find your standard stance. Now move your back foot one foot-length toward the tail. Feel the difference. Hold for 30 seconds. Switch back. Repeat 10 times. Notice the moment when "your weight engages the tail."$TSSBB$, ARRAY[]::text[], $TSSBB$blue$TSSBB$, 4, $TSSBB$Power Posture$TSSBB$, 351) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$DRL-BB-035-02$TSSBB$, $TSSBB$STP-035$TSSBB$, $TSSBB$FP1 ↔ FP2 Skateboard Switch$TSSBB$, $TSSBB$drill$TSSBB$, ARRAY[$TSSBB$Back$TSSBB$,$TSSBB$Tail$TSSBB$,$TSSBB$Maneuver$TSSBB$,$TSSBB$Engage$TSSBB$,$TSSBB$Tilt$TSSBB$]::text[], $TSSBB$On a skateboard, ride in FP2 for 5 seconds. Press the Button → switch to FP1. Ride 5 seconds. Switch back. Repeat 10 reps each side.$TSSBB$, ARRAY[]::text[], $TSSBB$blue$TSSBB$, 4, $TSSBB$Power Posture$TSSBB$, 352) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$MIS-BB-035$TSSBB$, $TSSBB$STP-035$TSSBB$, $TSSBB$Foot Position 1 (FP1) Operationalized at BB — Mission$TSSBB$, $TSSBB$mission$TSSBB$, ARRAY[$TSSBB$Back$TSSBB$,$TSSBB$Tail$TSSBB$,$TSSBB$Maneuver$TSSBB$,$TSSBB$Engage$TSSBB$,$TSSBB$Tilt$TSSBB$]::text[], $TSSBB$On 3 consecutive waves, deliberately Press the Button into FP1 before the wave ends and feel the maneuverability change. Do not attempt a maneuver yet — just feel the difference.$TSSBB$, ARRAY[$TSSBB$I can feel the difference between FP1 and FP2 with my eyes closed$TSSBB$,$TSSBB$I can Press the Button into FP1 without looking down$TSSBB$,$TSSBB$I know when to switch into FP1 (before a maneuver) and when to switch out (after)$TSSBB$]::text[], $TSSBB$blue$TSSBB$, 4, $TSSBB$Power Posture$TSSBB$, 359) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$DRL-BB-036$TSSBB$, $TSSBB$STP-036$TSSBB$, $TSSBB$Land Pump Simulation$TSSBB$, $TSSBB$drill$TSSBB$, ARRAY[$TSSBB$Compress$TSSBB$,$TSSBB$Extend$TSSBB$,$TSSBB$Rhythm$TSSBB$,$TSSBB$Hands$TSSBB$,$TSSBB$Forward$TSSBB$]::text[], $TSSBB$Stand in FP3 stance. Compress your knees deeply, extend fully, compress again. Use your hands actively — they should swing forward as you extend. Repeat 20 reps. Focus on rhythm.$TSSBB$, ARRAY[]::text[], $TSSBB$blue$TSSBB$, 5, $TSSBB$Rotation / Rail Change / Bottom Turn$TSSBB$, 361) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$DRL-BB-036-02$TSSBB$, $TSSBB$STP-036$TSSBB$, $TSSBB$Skateboard Pump FS$TSSBB$, $TSSBB$drill$TSSBB$, ARRAY[$TSSBB$Compress$TSSBB$,$TSSBB$Extend$TSSBB$,$TSSBB$Rhythm$TSSBB$,$TSSBB$Hands$TSSBB$,$TSSBB$Forward$TSSBB$]::text[], $TSSBB$On a skateboard going in a straight line, perform the pump cycle. The skateboard should visibly accelerate from your body's compression-extension. Repeat 20 reps. If the skateboard does not accelerate, your weight is drifting backward — fix that first.$TSSBB$, ARRAY[]::text[], $TSSBB$blue$TSSBB$, 5, $TSSBB$Rotation / Rail Change / Bottom Turn$TSSBB$, 362) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$MIS-BB-036$TSSBB$, $TSSBB$STP-036$TSSBB$, $TSSBB$Pump Frontside — Mission$TSSBB$, $TSSBB$mission$TSSBB$, ARRAY[$TSSBB$Compress$TSSBB$,$TSSBB$Extend$TSSBB$,$TSSBB$Rhythm$TSSBB$,$TSSBB$Hands$TSSBB$,$TSSBB$Forward$TSSBB$]::text[], $TSSBB$On 5 waves: perform 3 consecutive pump cycles on each wave. Audit yourself: is your weight forward? Did the board accelerate?$TSSBB$, ARRAY[$TSSBB$When I pump, I can see the board visibly accelerate$TSSBB$,$TSSBB$My weight stays forward the entire pump cycle$TSSBB$,$TSSBB$My hands lead the rhythm$TSSBB$,$TSSBB$I am in FP3 throughout the pump$TSSBB$,$TSSBB$==============================================================================$TSSBB$]::text[], $TSSBB$blue$TSSBB$, 5, $TSSBB$Rotation / Rail Change / Bottom Turn$TSSBB$, 369) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$DRL-BB-037$TSSBB$, $TSSBB$STP-037$TSSBB$, $TSSBB$Land BS Pump Simulation$TSSBB$, $TSSBB$drill$TSSBB$, ARRAY[$TSSBB$Open$TSSBB$,$TSSBB$Shoulder$TSSBB$,$TSSBB$Eyes$TSSBB$,$TSSBB$Rotate$TSSBB$,$TSSBB$Forward$TSSBB$]::text[], $TSSBB$Same as FS pump but rotate your stance so your chest faces an imaginary wave on your back side. Eye lead over the back shoulder. Compress + extend with the leading hand driving the rhythm. 20 reps.$TSSBB$, ARRAY[]::text[], $TSSBB$blue$TSSBB$, 5, null, 371) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$MIS-BB-037$TSSBB$, $TSSBB$STP-037$TSSBB$, $TSSBB$Pump Backside — Mission$TSSBB$, $TSSBB$mission$TSSBB$, ARRAY[$TSSBB$Open$TSSBB$,$TSSBB$Shoulder$TSSBB$,$TSSBB$Eyes$TSSBB$,$TSSBB$Rotate$TSSBB$,$TSSBB$Forward$TSSBB$]::text[], $TSSBB$3 backside waves with 3 consecutive pump cycles each. Audit: is your chest open or closed? Are your eyes over your back shoulder?$TSSBB$, ARRAY[]::text[], $TSSBB$blue$TSSBB$, 5, null, 379) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$DRL-BB-038$TSSBB$, $TSSBB$STP-038$TSSBB$, $TSSBB$BS Rotation Activation$TSSBB$, $TSSBB$drill$TSSBB$, ARRAY[$TSSBB$Chest$TSSBB$,$TSSBB$Open$TSSBB$,$TSSBB$Oblique$TSSBB$,$TSSBB$Lead$TSSBB$,$TSSBB$Back-Hand$TSSBB$]::text[], $TSSBB$Standing in your goofy/regular stance, rotate your chest open as if you wanted to look behind you over your back shoulder. Hold the rotation for 10 seconds. Feel your oblique engage. Release. Repeat 10 times. This is the activation you need EVERY backside ride.$TSSBB$, ARRAY[]::text[], $TSSBB$blue$TSSBB$, 5, null, 381) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$MIS-BB-038$TSSBB$, $TSSBB$STP-038$TSSBB$, $TSSBB$BS Body Mechanics — Mission$TSSBB$, $TSSBB$mission$TSSBB$, ARRAY[$TSSBB$Chest$TSSBB$,$TSSBB$Open$TSSBB$,$TSSBB$Oblique$TSSBB$,$TSSBB$Lead$TSSBB$,$TSSBB$Back-Hand$TSSBB$]::text[], $TSSBB$Before every backside wave at YB+ level, perform this rotation activation as part of your pre-paddle setup.$TSSBB$, ARRAY[$TSSBB$My chest opens deliberately on every backside ride$TSSBB$,$TSSBB$My eyes lead the body over my back shoulder$TSSBB$,$TSSBB$I feel my oblique engage during BS rotation$TSSBB$,$TSSBB$==============================================================================$TSSBB$]::text[], $TSSBB$blue$TSSBB$, 5, null, 389) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$DRL-BB-039$TSSBB$, $TSSBB$STP-039$TSSBB$, $TSSBB$Land BT Simulation$TSSBB$, $TSSBB$drill$TSSBB$, ARRAY[$TSSBB$Mid-face$TSSBB$,$TSSBB$U$TSSBB$,$TSSBB$Oblique$TSSBB$,$TSSBB$Lean$TSSBB$,$TSSBB$Flex$TSSBB$]::text[], $TSSBB$Stand in your stance. Lean to one side as if performing a BT. Engage your oblique. Hold for 5 seconds. Switch sides. 10 reps each side.$TSSBB$, ARRAY[]::text[], $TSSBB$blue$TSSBB$, 5, $TSSBB$Rotation / Rail Change / Bottom Turn$TSSBB$, 391) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$DRL-BB-039-02$TSSBB$, $TSSBB$STP-039$TSSBB$, $TSSBB$Chalk U on Floor + Skateboard$TSSBB$, $TSSBB$drill$TSSBB$, ARRAY[$TSSBB$Mid-face$TSSBB$,$TSSBB$U$TSSBB$,$TSSBB$Oblique$TSSBB$,$TSSBB$Lean$TSSBB$,$TSSBB$Flex$TSSBB$]::text[], $TSSBB$Draw a U shape on the ground in chalk. On a skateboard, ride following the U pattern. Feel where the BT begins, where it deepens, where it ends.$TSSBB$, ARRAY[]::text[], $TSSBB$blue$TSSBB$, 5, $TSSBB$Rotation / Rail Change / Bottom Turn$TSSBB$, 392) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$MIS-BB-039$TSSBB$, $TSSBB$STP-039$TSSBB$, $TSSBB$Bottom Turn Medium — Mission$TSSBB$, $TSSBB$mission$TSSBB$, ARRAY[$TSSBB$Mid-face$TSSBB$,$TSSBB$U$TSSBB$,$TSSBB$Oblique$TSSBB$,$TSSBB$Lean$TSSBB$,$TSSBB$Flex$TSSBB$]::text[], $TSSBB$On 5 frontside waves: execute a BT Medium. Do not worry about the snap that follows — just focus on the BT itself. Was it in the mid-face? Did you draw the U?$TSSBB$, ARRAY[$TSSBB$My BT is in the mid-face (not flat, not too high)$TSSBB$,$TSSBB$My oblique engages during the BT$TSSBB$,$TSSBB$I draw a visible U shape on the wave face$TSSBB$,$TSSBB$My BT flows directly into Projection without a pause$TSSBB$]::text[], $TSSBB$blue$TSSBB$, 5, $TSSBB$Rotation / Rail Change / Bottom Turn$TSSBB$, 399) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$DRL-BB-040$TSSBB$, $TSSBB$STP-040$TSSBB$, $TSSBB$Land Projection from BT Position$TSSBB$, $TSSBB$drill$TSSBB$, ARRAY[$TSSBB$Extend$TSSBB$,$TSSBB$Align$TSSBB$,$TSSBB$Forward$TSSBB$,$TSSBB$Launch$TSSBB$,$TSSBB$Snap$TSSBB$]::text[], $TSSBB$Get into the BT position (flexed knees, lean to one side, oblique engaged). Now explode upward: extend your legs, align your chest toward the snap direction, raise your arms. Hold the top position for 2 seconds. Repeat 10 reps each side.$TSSBB$, ARRAY[]::text[], $TSSBB$blue$TSSBB$, 6, $TSSBB$Projection$TSSBB$, 401) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$MIS-BB-040$TSSBB$, $TSSBB$STP-040$TSSBB$, $TSSBB$Projection — Mission$TSSBB$, $TSSBB$mission$TSSBB$, ARRAY[$TSSBB$Extend$TSSBB$,$TSSBB$Align$TSSBB$,$TSSBB$Forward$TSSBB$,$TSSBB$Launch$TSSBB$,$TSSBB$Snap$TSSBB$]::text[], $TSSBB$On 5 frontside waves: execute BT + Projection. Do not attempt the snap yet. Focus on the explosion from BT into Projection.$TSSBB$, ARRAY[$TSSBB$My Projection fires immediately after the BT$TSSBB$,$TSSBB$My legs extend fully$TSSBB$,$TSSBB$My arms rise to lead the body upward$TSSBB$]::text[], $TSSBB$blue$TSSBB$, 6, $TSSBB$Projection$TSSBB$, 409) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$DRL-BB-041$TSSBB$, $TSSBB$STP-041$TSSBB$, $TSSBB$Cruz Position on Land$TSSBB$, $TSSBB$drill$TSSBB$, ARRAY[$TSSBB$Cruz$TSSBB$,$TSSBB$Cross$TSSBB$,$TSSBB$Chest$TSSBB$,$TSSBB$Eyes$TSSBB$,$TSSBB$Rail$TSSBB$]::text[], $TSSBB$Stand in your stance. Cross your hand over your body (goofy = left over · regular = right over). Open your chest. Look over your shoulder. Engage your oblique. Hold for 5 seconds. Release. Repeat 10 reps. Feel the geometry of the Cruz — this is the position you will enter on every Cruz Snap and every Cruz Cutback.$TSSBB$, ARRAY[]::text[], $TSSBB$blue$TSSBB$, 7, $TSSBB$Maneuver$TSSBB$, 411) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$MIS-BB-041$TSSBB$, $TSSBB$STP-041$TSSBB$, $TSSBB$Cruz Snap — Mission$TSSBB$, $TSSBB$mission$TSSBB$, ARRAY[$TSSBB$Cruz$TSSBB$,$TSSBB$Cross$TSSBB$,$TSSBB$Chest$TSSBB$,$TSSBB$Eyes$TSSBB$,$TSSBB$Rail$TSSBB$]::text[], $TSSBB$On 5 frontside waves: attempt the full chain Posture → BT → Projection → Cruz Snap. Do not worry about the Grenade closure yet — just enter the Cruz.$TSSBB$, ARRAY[$TSSBB$My Cruz includes the rail change$TSSBB$,$TSSBB$My chest opens fully in the Cruz$TSSBB$,$TSSBB$My eyes go over the shoulder$TSSBB$,$TSSBB$My hand crosses early enough to lead the rail change$TSSBB$]::text[], $TSSBB$blue$TSSBB$, 7, $TSSBB$Maneuver$TSSBB$, 419) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$DRL-BB-042$TSSBB$, $TSSBB$STP-042$TSSBB$, $TSSBB$Grenade from Cruz Position$TSSBB$, $TSSBB$drill$TSSBB$, ARRAY[$TSSBB$Explode$TSSBB$,$TSSBB$Throw$TSSBB$,$TSSBB$Extend$TSSBB$,$TSSBB$Return$TSSBB$,$TSSBB$Low$TSSBB$]::text[], $TSSBB$Enter the Cruz position on land. From the Cruz: explode upward, throw your leading arm forward as if launching a grenade, extend your legs, and land back in flexed posture with hips down. Repeat 10 reps each side.$TSSBB$, ARRAY[]::text[], $TSSBB$blue$TSSBB$, 7, $TSSBB$Maneuver / Expression — closure$TSSBB$, 421) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$MIS-BB-042$TSSBB$, $TSSBB$STP-042$TSSBB$, $TSSBB$Grenade — Mission$TSSBB$, $TSSBB$mission$TSSBB$, ARRAY[$TSSBB$Explode$TSSBB$,$TSSBB$Throw$TSSBB$,$TSSBB$Extend$TSSBB$,$TSSBB$Return$TSSBB$,$TSSBB$Low$TSSBB$]::text[], $TSSBB$On 5 frontside waves: complete the full chain Posture → BT → Projection → Cruz → Grenade → Posture. No stage skipped. Audit: did you return to posture cleanly?$TSSBB$, ARRAY[$TSSBB$My Grenade fires explosively (not softly)$TSSBB$,$TSSBB$I return to flexed posture (Low Finish) after the Grenade$TSSBB$,$TSSBB$I am ready for the next cycle immediately$TSSBB$]::text[], $TSSBB$blue$TSSBB$, 7, $TSSBB$Maneuver / Expression — closure$TSSBB$, 429) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$DRL-BB-043$TSSBB$, $TSSBB$STP-043$TSSBB$, $TSSBB$Choke on Land$TSSBB$, $TSSBB$drill$TSSBB$, ARRAY[$TSSBB$Cross$TSSBB$,$TSSBB$Extend$TSSBB$,$TSSBB$Chest$TSSBB$,$TSSBB$Shoulders$TSSBB$,$TSSBB$Point$TSSBB$]::text[], $TSSBB$Get into BT position (flexed knees, leaning). Now extend your legs and simultaneously cross your arm over your waist as if grabbing a sword from the other side. Your chest should rotate toward the direction you intend to go. Hold the position for 3 seconds. Repeat 10 reps.$TSSBB$, ARRAY[]::text[], $TSSBB$blue$TSSBB$, 6, $TSSBB$Projection · backside variant$TSSBB$, 431) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$MIS-BB-043$TSSBB$, $TSSBB$STP-043$TSSBB$, $TSSBB$Choke (BS Projection) — Mission$TSSBB$, $TSSBB$mission$TSSBB$, ARRAY[$TSSBB$Cross$TSSBB$,$TSSBB$Extend$TSSBB$,$TSSBB$Chest$TSSBB$,$TSSBB$Shoulders$TSSBB$,$TSSBB$Point$TSSBB$]::text[], $TSSBB$On 5 backside waves: execute BT + Choke. Do not attempt the Tapaloco yet — just feel the Choke as a complete projection. Did your chest rotate? Did your legs extend?$TSSBB$, ARRAY[$TSSBB$My Choke includes the arm crossing$TSSBB$,$TSSBB$My legs extend during the Choke$TSSBB$,$TSSBB$My chest rotates toward the maneuver direction$TSSBB$,$TSSBB$My weight stays forward (does not drift backward)$TSSBB$]::text[], $TSSBB$blue$TSSBB$, 6, $TSSBB$Projection · backside variant$TSSBB$, 439) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$DRL-BB-044$TSSBB$, $TSSBB$STP-044$TSSBB$, $TSSBB$Tapaloco Isolated on Land$TSSBB$, $TSSBB$drill$TSSBB$, ARRAY[$TSSBB$Hand$TSSBB$,$TSSBB$Palm$TSSBB$,$TSSBB$Over$TSSBB$,$TSSBB$Ear$TSSBB$,$TSSBB$Forward$TSSBB$]::text[], $TSSBB$Get into Choke position. Now throw your hand (palm UP) over your head as if covering your opposite ear. Look over your shoulder. Feel your rail change. Hold for 3 seconds. Repeat 10 reps. Practice the HAND ideal variant — don't settle for the arm or elbow version yet.$TSSBB$, ARRAY[]::text[], $TSSBB$blue$TSSBB$, 7, $TSSBB$Maneuver$TSSBB$, 441) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$MIS-BB-044$TSSBB$, $TSSBB$STP-044$TSSBB$, $TSSBB$Tapaloco Snap — Mission$TSSBB$, $TSSBB$mission$TSSBB$, ARRAY[$TSSBB$Hand$TSSBB$,$TSSBB$Palm$TSSBB$,$TSSBB$Over$TSSBB$,$TSSBB$Ear$TSSBB$,$TSSBB$Forward$TSSBB$]::text[], $TSSBB$On 5 backside waves: execute BT + Choke + Tapaloco Snap. Try the HAND ideal variant. Did your palm rotate UP? Did your hand cover the opposite ear?$TSSBB$, ARRAY[$TSSBB$I executed the HAND variant (not just arm or elbow)$TSSBB$,$TSSBB$My palm rotated UP during the Tapaloco$TSSBB$,$TSSBB$My hand covered the opposite ear$TSSBB$,$TSSBB$My weight stayed forward throughout$TSSBB$]::text[], $TSSBB$blue$TSSBB$, 7, $TSSBB$Maneuver$TSSBB$, 449) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$DRL-BB-045$TSSBB$, $TSSBB$STP-045$TSSBB$, $TSSBB$Elbow Isolated on Land$TSSBB$, $TSSBB$drill$TSSBB$, ARRAY[$TSSBB$Up$TSSBB$,$TSSBB$Scapula$TSSBB$,$TSSBB$Energy$TSSBB$,$TSSBB$Foot$TSSBB$,$TSSBB$Throw$TSSBB$]::text[], $TSSBB$Get into Tapaloco position (hand over head). Now throw your elbow (the one that did the Tapaloco) UPWARD. Activate your opposite scapula — feel as if your two scapulas are trying to unite. Let your back foot follow the elbow's direction. Hold for 3 seconds. Repeat 10 reps.$TSSBB$, ARRAY[]::text[], $TSSBB$blue$TSSBB$, 7, $TSSBB$Maneuver / Expression — closure$TSSBB$, 451) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$MIS-BB-045$TSSBB$, $TSSBB$STP-045$TSSBB$, $TSSBB$Elbow (BS Closure) — Mission$TSSBB$, $TSSBB$mission$TSSBB$, ARRAY[$TSSBB$Up$TSSBB$,$TSSBB$Scapula$TSSBB$,$TSSBB$Energy$TSSBB$,$TSSBB$Foot$TSSBB$,$TSSBB$Throw$TSSBB$]::text[], $TSSBB$On 5 backside waves: complete the full chain BT + Choke + Tapaloco + Elbow. No stage skipped. Did your elbow go UP (not down)? Did you feel your scapulas unite?$TSSBB$, ARRAY[$TSSBB$My Elbow goes UP (not down)$TSSBB$,$TSSBB$My scapulas unite during the Elbow$TSSBB$,$TSSBB$My back foot follows the elbow$TSSBB$,$TSSBB$I see water thrown at the end of the maneuver$TSSBB$]::text[], $TSSBB$blue$TSSBB$, 7, $TSSBB$Maneuver / Expression — closure$TSSBB$, 459) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$DRL-BB-046$TSSBB$, $TSSBB$STP-046$TSSBB$, $TSSBB$Cruz Cutback Isolated$TSSBB$, $TSSBB$drill$TSSBB$, ARRAY[$TSSBB$Maintain$TSSBB$,$TSSBB$Arc$TSSBB$,$TSSBB$Pocket$TSSBB$,$TSSBB$Return$TSSBB$,$TSSBB$Hold$TSSBB$]::text[], $TSSBB$On land: enter the Cruz position. Now MAINTAIN it for 5 full seconds. Resist the urge to release. Imagine you are drawing an arc on the wave face. Only release when you "see the pocket" (visualize it). Repeat 10 reps each side.

On skateboard: ride in a long arc following a chalk U on the ground. Enter the Cruz at the bottom of the arc. Maintain through the curve. Release at the top.$TSSBB$, ARRAY[]::text[], $TSSBB$blue$TSSBB$, 7, $TSSBB$Maneuver$TSSBB$, 461) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$MIS-BB-046$TSSBB$, $TSSBB$STP-046$TSSBB$, $TSSBB$Cruz Cutback — Mission$TSSBB$, $TSSBB$mission$TSSBB$, ARRAY[$TSSBB$Maintain$TSSBB$,$TSSBB$Arc$TSSBB$,$TSSBB$Pocket$TSSBB$,$TSSBB$Return$TSSBB$,$TSSBB$Hold$TSSBB$]::text[], $TSSBB$On 5 frontside waves: attempt the Cruz Cutback. Do not worry about perfection. Focus on the question: did I return to the pocket? If yes → Cutback. If no → Snap. The doctrinal rule is non-negotiable.$TSSBB$, ARRAY[$TSSBB$My cutback drew a single continuous arc (not two disconnected movements)$TSSBB$,$TSSBB$I returned to the pocket$TSSBB$,$TSSBB$My BT was visibly longer than my BT for a Snap$TSSBB$,$TSSBB$My Cruz position stayed engaged until I saw the pocket$TSSBB$]::text[], $TSSBB$blue$TSSBB$, 7, $TSSBB$Maneuver$TSSBB$, 469) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$DRL-BB-047$TSSBB$, $TSSBB$STP-047$TSSBB$, $TSSBB$Hold Isolated on Land$TSSBB$, $TSSBB$drill$TSSBB$, ARRAY[$TSSBB$Hold$TSSBB$,$TSSBB$Save$TSSBB$,$TSSBB$Don't release$TSSBB$,$TSSBB$Cruz$TSSBB$,$TSSBB$Flexed$TSSBB$]::text[], $TSSBB$Enter the Cruz position. Now hold it for 10 full seconds without extending your leg. Stay flexed. Feel the energy storing in your legs. Release with a sharp Grenade extension. Repeat 10 reps each side.$TSSBB$, ARRAY[]::text[], $TSSBB$blue$TSSBB$, 7, $TSSBB$Maneuver · integrated within$TSSBB$, 471) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$DRL-BB-047-02$TSSBB$, $TSSBB$STP-047$TSSBB$, $TSSBB$Hold Voice Command$TSSBB$, $TSSBB$drill$TSSBB$, ARRAY[$TSSBB$Hold$TSSBB$,$TSSBB$Save$TSSBB$,$TSSBB$Don't release$TSSBB$,$TSSBB$Cruz$TSSBB$,$TSSBB$Flexed$TSSBB$]::text[], $TSSBB$Have someone (or your phone with a timer) call out "Hold" and you start the Cruz position. They call "Release" after a variable time (3-10 seconds). Train your patience. This is the ecological mission that BB asks you to internalize — your timing must come from the wave, not from your own anxiety.

Mission 1 — Hold Forever:

On 5 frontside waves: sustain the Cruz position as long as possible before releasing the Grenade. The goal is patience. Was your Hold too short? Too long?

Mission 2 — Hold Voice Command Timing (Ecological):

In your next session, ask a coach or friend to call out "Hold" and "Release" verbally from the shore. Practice the timing first OUT of water (land drill), then INSIDE the water. This trains your time-perception.$TSSBB$, ARRAY[]::text[], $TSSBB$blue$TSSBB$, 7, $TSSBB$Maneuver · integrated within$TSSBB$, 472) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$DRL-BB-048$TSSBB$, $TSSBB$STP-048$TSSBB$, $TSSBB$Tapaloco Cutback Isolated$TSSBB$, $TSSBB$drill$TSSBB$, ARRAY[$TSSBB$Maintain$TSSBB$,$TSSBB$Survive$TSSBB$,$TSSBB$Pocket$TSSBB$,$TSSBB$Return$TSSBB$,$TSSBB$Codazo$TSSBB$]::text[], $TSSBB$On land: enter Tapaloco position (hand over head, palm UP). Now hold it for 5 seconds in the new-rail position. Maintain simple rotation. Maintain the Tapaloco position. When you "see the foam" (visualize it), throw your Codazo and return to posture. Repeat 10 reps.

On skateboard: same flow on a long arc following chalk.$TSSBB$, ARRAY[]::text[], $TSSBB$blue$TSSBB$, 7, $TSSBB$Maneuver$TSSBB$, 481) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$MIS-BB-048$TSSBB$, $TSSBB$STP-048$TSSBB$, $TSSBB$Tapaloco Cutback — Mission$TSSBB$, $TSSBB$mission$TSSBB$, ARRAY[$TSSBB$Maintain$TSSBB$,$TSSBB$Survive$TSSBB$,$TSSBB$Pocket$TSSBB$,$TSSBB$Return$TSSBB$,$TSSBB$Codazo$TSSBB$]::text[], $TSSBB$On 5 backside waves: attempt the Tapaloco Cutback. The goal: survive the foam return. Did you return to the foam? Did you come back out to the wave face?$TSSBB$, ARRAY[$TSSBB$I returned to the foam (not just stayed on the wave face)$TSSBB$,$TSSBB$I survived the foam encounter$TSSBB$,$TSSBB$I came back out to the wave face$TSSBB$,$TSSBB$My cutback drew a single continuous line (not two disconnected movements)$TSSBB$]::text[], $TSSBB$blue$TSSBB$, 7, $TSSBB$Maneuver$TSSBB$, 489) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$DRL-BB-049$TSSBB$, $TSSBB$STP-049$TSSBB$, $TSSBB$Hold Rotation Isolated$TSSBB$, $TSSBB$drill$TSSBB$, ARRAY[$TSSBB$Hold$TSSBB$,$TSSBB$Rotation$TSSBB$,$TSSBB$Save$TSSBB$,$TSSBB$Flexed$TSSBB$,$TSSBB$Codazo$TSSBB$]::text[], $TSSBB$On land: enter Tapaloco position. Now sustain the new-rail position with simple rotation + oblique + Tapaloco maintained · WITHOUT extending your legs. Hold for 10 seconds. Release with sharp Codazo. Repeat 10 reps.$TSSBB$, ARRAY[]::text[], $TSSBB$blue$TSSBB$, 7, $TSSBB$Maneuver · integrated within$TSSBB$, 491) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
insert into drills_missions (id, step_id, title, type, key_words, description_md, success_criteria, belt, block_number, block_name, display_order) values ($TSSBB$DRL-BB-049-02$TSSBB$, $TSSBB$STP-049$TSSBB$, $TSSBB$Hold Voice Command BS (Ecological)$TSSBB$, $TSSBB$drill$TSSBB$, ARRAY[$TSSBB$Hold$TSSBB$,$TSSBB$Rotation$TSSBB$,$TSSBB$Save$TSSBB$,$TSSBB$Flexed$TSSBB$,$TSSBB$Codazo$TSSBB$]::text[], $TSSBB$Same as Hold Voice Command on FS (Seq #12) but applied to backside. Practice the timing OUT of water first, then INSIDE the water.

Mission — Hold Forever (BS):

On 5 backside waves: sustain the Hold Rotation as long as possible before releasing the Codazo.$TSSBB$, ARRAY[]::text[], $TSSBB$blue$TSSBB$, 7, $TSSBB$Maneuver · integrated within$TSSBB$, 492) on conflict (id) do update set title=excluded.title, description_md=excluded.description_md, key_words=excluded.key_words, success_criteria=excluded.success_criteria, block_number=excluded.block_number, block_name=excluded.block_name, display_order=excluded.display_order;
