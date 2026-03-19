// Student Portal Materials — organized by belt level
// Real structured content from TSS belt manuals (Canon Oficial v5.0)

import type { BeltLevel } from '@/lib/constants/belts';

export type MaterialCategory = 'sequence' | 'drill' | 'mission' | 'theory' | 'safety' | 'mental';

export interface BeltMaterial {
  id: string;
  beltLevel: BeltLevel;
  category: MaterialCategory;
  title: string;
  subtitle: string;
  content: string;
  order: number;
}

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  sequence: 'Sequence',
  drill: 'Drill',
  mission: 'Mission',
  theory: 'Theory',
  safety: 'Safety',
  mental: 'Mental',
};

export const MATERIAL_CATEGORY_ICONS: Record<MaterialCategory, string> = {
  sequence: '🎯',
  drill: '🏋️',
  mission: '🌊',
  theory: '📖',
  safety: '⚠️',
  mental: '🧠',
};

// ═══════════════════════════════════════════════════════════
// WHITE BELT — Sequences #1–#5
// ═══════════════════════════════════════════════════════════

const WHITE_BELT_MATERIALS: BeltMaterial[] = [
  // ── Theory / Sequence Content ──
  {
    id: 'wb-t01',
    beltLevel: 'white_belt',
    category: 'theory',
    title: 'Board Control Fundamentals',
    subtitle: 'Stance, venue analysis, safety, board handling',
    content: `BOARD CONTROL FUNDAMENTALS

1. STANCE ANALYSIS
Before entering the water, determine your natural stance:
- Goofy foot (right foot forward) or Regular foot (left foot forward)
- Test: have someone gently push you from behind. The foot you step forward with is your front foot.
- Your stance determines your frontside (facing the wave) and backside (back to the wave) orientation.

2. VENUE ANALYSIS
Every session begins with reading the environment:
- Identify entry and exit points.
- Look for rip currents (channels of water flowing seaward).
- Note wave size, frequency, and break type (beach break, reef, point).
- Identify hazards: rocks, other surfers, marine life.
- Check wind direction — offshore (good) vs. onshore (choppy).

3. BOARD HANDLING ON LAND
- Always carry the board under your arm with the fins facing away from your body.
- When setting the board down, place it fins-up on soft sand (never on rocks or pavement).
- Wax application: apply base coat in circular motions, then top coat for grip.
- Leash attachment: always connect the leash to your back ankle before entering water.

4. SAFETY CHECKPOINT
Before every session:
✓ Leash checked and secure
✓ Fins tight and undamaged
✓ Wax applied
✓ Venue analyzed
✓ Buddy system or coach supervision confirmed

STANDARD: Student can carry board safely, identify stance, and complete a full venue analysis independently.`,
    order: 1,
  },
  {
    id: 'wb-t02',
    beltLevel: 'white_belt',
    category: 'theory',
    title: 'Prone Foundation',
    subtitle: 'Sweet spot, alignment, catch, cobra, directional choice',
    content: `PRONE FOUNDATION

1. SWEET SPOT
The "sweet spot" is the optimal position on the board where:
- The nose is 2-3 inches above the water (not pearling, not dragging).
- Your chest is centered on the stringer (center line of the board).
- Your body weight is evenly distributed.

How to find it:
- Lie flat on the board. If the nose dips underwater, slide back slightly.
- If the nose is too high and the tail drags, slide forward.
- Mark the position mentally — this is YOUR sweet spot.

2. PRONE ALIGNMENT
- Head up, chin off the board.
- Shoulders back and open.
- Feet together, toes touching the tail pad or near the tail.
- Hands at chest level, fingertips at the rails.
- Core engaged — do not collapse onto the board.

3. PRONE PADDLE (THE CATCH)
- Arms enter the water near the nose of the board.
- Fingers together, slightly cupped.
- Pull through the water with full arm extension — hand exits at your hip.
- Alternate arms in a smooth, rhythmic motion.
- Keep head still and eyes forward.

Common errors:
- Paddling too shallow (slapping the water) — dig deeper.
- Head bobbing — keep your gaze fixed.
- Feet splayed apart — keep legs together for streamlining.

4. COBRA POSITION
The Cobra is a transitional position used before the pop-up:
- Push your chest up with hands on the board (like a yoga cobra pose).
- Elbows stay close to the body.
- Eyes look forward toward the beach or intended direction.
- This position prepares the upper body for the pop-up while maintaining board awareness.

5. DIRECTIONAL CHOICE
Before catching the wave, decide:
- Am I going LEFT or RIGHT?
- This decision is made BEFORE the wave arrives.
- Look toward your intended direction during the cobra.
- Commit to the direction — do not change mid-wave at this level.

STANDARD: Student paddles with proper catch technique, finds sweet spot within 3 attempts, executes cobra with eyes forward, and declares direction before catching the wave.`,
    order: 2,
  },
  {
    id: 'wb-t03',
    beltLevel: 'white_belt',
    category: 'theory',
    title: 'Pop-Up & Stance',
    subtitle: 'Controlled pop-up, power stance, impulse, starfish dismount',
    content: `POP-UP & STANCE

1. THE CONTROLLED POP-UP
The pop-up is a single explosive movement from prone to standing:

Step-by-step:
a) From cobra position, hands flat on the board at chest level.
b) Push up explosively while simultaneously bringing your back foot under your body.
c) Front foot lands between your hands (where your chest was).
d) Back foot lands on the tail pad area, perpendicular to the stringer.
e) Hands release the board — arms come up for balance.

Key coaching cues:
- "Hands, hips, feet" — the sequence of weight transfer.
- "Look where you want to go" — eyes lead the body.
- "Low and wide" — bend your knees, not your waist.

Common errors:
- Knee-dragging: bringing the knee to the board first (breaks the single-motion rule).
- Standing too tall: keep knees bent, center of gravity LOW.
- Feet too close together: stance should be shoulder-width plus.
- Looking down at the board: eyes must be UP and forward.

2. POWER STANCE
Once standing:
- Front foot angled ~45° across the stringer.
- Back foot perpendicular on the tail, over the fins.
- Knees bent, weight distributed 50/50 (or slight back-foot bias).
- Arms up and open for balance — like holding a beach ball.
- Head up, eyes scanning the wave and intended direction.
- Hips low, back straight — athletic position.

3. IMPULSE
Impulse is the initial acceleration after the pop-up:
- As you stand, compress your knees and push the board forward.
- The impulse generates speed immediately post-pop-up.
- Without impulse, you stall and lose the wave.
- Think of it as a small "pump" the moment your feet land.

4. STARFISH DISMOUNT
The safe way to fall:
- Kick the board away with your feet.
- Spread your body flat (starfish position) to stay near the surface.
- Cover your head with your arms as you surface.
- NEVER dive headfirst off the board.
- NEVER jump feet-first in shallow water.
- After surfacing: locate your board, grab the leash, recover.

STANDARD: Student executes 3 consecutive controlled pop-ups on flat water without knee-dragging. Power stance held for 3+ seconds. Starfish demonstrated safely.`,
    order: 3,
  },
  {
    id: 'wb-t04',
    beltLevel: 'white_belt',
    category: 'theory',
    title: 'Directional Control',
    subtitle: 'Goal setting, basic frontside and backside turns',
    content: `DIRECTIONAL CONTROL

1. GOAL SETTING BEFORE EACH WAVE
Before every wave, the student must declare:
- Direction (left or right)
- One technical goal (e.g., "hold power stance for 5 seconds")

This trains intentionality. Random surfing builds random habits.

2. BASIC FRONTSIDE TURN
Frontside = you are facing the wave.
- From power stance, look toward your intended turn direction.
- Shift weight to your toes (frontside rail).
- Lead with your front shoulder, rotating toward the wave face.
- The board follows your upper body — where you look, you go.
- Knees stay bent throughout the turn.

Coaching cue: "Eyes, shoulders, hips, board" — this is the rotation chain.

3. BASIC BACKSIDE TURN
Backside = your back faces the wave.
- From power stance, look over your back shoulder toward the wave.
- Shift weight to your heels (backside rail).
- Lead with the head and back shoulder rotation.
- Compress knees to maintain balance during the turn.

Backside is harder because you cannot see the wave as easily. Extra head rotation is required.

Common errors for both:
- Counter-rotation: twisting the upper body opposite to the turn. Fix by committing the shoulders.
- Stiff legs: always maintain knee bend for absorption and control.
- Rushed turns: initiate the turn with your eyes FIRST, then let the body follow.

4. STRAIGHT-LINE RIDING
Before attempting turns, master riding straight:
- Pop up, hold power stance, ride the whitewater to the beach.
- Only after consistent straight rides should directional control be introduced.
- Straight-line riding builds the balance foundation for all turning.

STANDARD: Student rides whitewater with declared direction, executes one controlled frontside or backside adjustment, and arrives at the beach with intentional direction.`,
    order: 4,
  },
  {
    id: 'wb-t05',
    beltLevel: 'white_belt',
    category: 'theory',
    title: 'Paddle-Out Readiness',
    subtitle: 'Paddle out, turtle roll, intentional turn choice',
    content: `PADDLE-OUT READINESS

1. THE PADDLE OUT
Transitioning from whitewater to the lineup:
- Time your paddle-out between sets (watch for lulls).
- Paddle with purpose — strong, steady strokes.
- Angle slightly toward the channel (deeper water with less breaking waves).
- Maintain awareness of incoming waves and other surfers.

2. TURTLE ROLL
When a broken wave (whitewater) approaches:
a) Stop paddling and grip both rails firmly.
b) Take a breath and roll the board upside-down, pulling it toward your body.
c) Your body goes under the board, which absorbs the wave's energy.
d) After the wave passes, roll back over and resume paddling.

Key points:
- Hold the board TIGHT — losing grip means the board becomes a hazard.
- Keep your body close to the board — do not extend arms.
- Practice in calm water before using in waves.

Common errors:
- Letting go of the board (dangerous for others).
- Rolling too late (wave hits before you're inverted).
- Not pulling the board close enough (wave rips it away).

3. SITTING ON THE BOARD
In the lineup, surfers sit on their boards:
- Straddle the board near the sweet spot.
- Keep feet in the water for balance.
- Hands rest on the rails or in your lap.
- Practice balance by sitting still for 30+ seconds.

4. INTENTIONAL TURN CHOICE
In the lineup, before catching a wave:
- Read the wave direction (which way it's breaking).
- Choose left or right based on the wave, NOT based on comfort.
- Commit to the choice by looking and angling the board before paddling.
- Call your direction out loud (in training) — "Going right!"

5. PRIORITY AWARENESS
Basic lineup rules:
- The surfer closest to the peak (breaking point) has priority.
- Do not "drop in" (take off on a wave someone else is already riding).
- If in doubt, pull back and let the other surfer go.
- Communicate: make eye contact, call out, or paddle clearly out of the way.

STANDARD: Student paddles out through 3-foot whitewater using turtle rolls, sits on board in lineup for 60 seconds, catches a wave with declared direction, and demonstrates awareness of priority.`,
    order: 5,
  },

  // ── Drills ──
  {
    id: 'wb-d01',
    beltLevel: 'white_belt',
    category: 'drill',
    title: 'Pop-Up + Power Stance Drill',
    subtitle: 'On-land repetition for muscle memory',
    content: `POP-UP + POWER STANCE DRILL

PURPOSE: Build muscle memory for the pop-up sequence so it becomes automatic in the water.

SETUP: Board on flat sand or grass. Student lies prone.

EXECUTION:
1. Coach calls "PADDLE!" — student performs 5 paddle strokes.
2. Coach calls "POP!" — student executes controlled pop-up.
3. Hold power stance for 5 seconds (coach counts out loud).
4. Coach checks: feet placement, knee bend, head position, arm balance.
5. Coach calls "DOWN!" — student returns to prone position.
6. Repeat 10 times per set. 3 sets minimum.

PROGRESSION:
- Level 1: Slow and controlled, coach guides each step.
- Level 2: Full speed, smooth single motion.
- Level 3: With eyes closed (proprioception test).
- Level 4: With coach calling random direction ("Go left!" / "Go right!") during pop-up.

COMMON CORRECTIONS:
- If knee touches board: "Keep the knee UP — one motion."
- If standing too tall: "Lower! Bend those knees, surfer stance."
- If feet too close: "WIDER — shoulder width plus."
- If looking down: "EYES UP — look where you're going."

STANDARD: 10 consecutive pop-ups without knee drag, stance held 5 seconds each, direction change on command.`,
    order: 10,
  },
  {
    id: 'wb-d02',
    beltLevel: 'white_belt',
    category: 'drill',
    title: 'Sweet Spot Discovery Drill',
    subtitle: 'Find and memorize your board position',
    content: `SWEET SPOT DISCOVERY DRILL

PURPOSE: Each student must learn their unique sweet spot on the board for optimal paddling and wave catching.

SETUP: Flat water (pool, lake, or calm ocean). Board and student.

EXECUTION:
1. Student lies on the board in estimated center position.
2. Coach observes nose height:
   - Nose underwater? "Slide back 2 inches."
   - Nose way up, tail dragging? "Slide forward 2 inches."
   - Nose 2-3 inches above water? "THAT'S your sweet spot. Feel it."
3. Student mentally marks the position (chest relative to logo, stringer marks, etc.).
4. Student slides off, then remounts and finds the sweet spot again.
5. Repeat 5 times until student finds it within the first attempt.

COACHING CUES:
- "Where does your chin sit relative to the board?"
- "Feel the balance point — the board should feel flat and fast."
- "Remember this feeling in your body, not just your eyes."

VARIATIONS:
- With paddling: find sweet spot while paddle-stroking (does it shift?).
- With waves: in small whitewater, does the sweet spot change? (It shouldn't much.)

STANDARD: Student finds sweet spot on first attempt 4 out of 5 tries.`,
    order: 11,
  },
  {
    id: 'wb-d03',
    beltLevel: 'white_belt',
    category: 'drill',
    title: 'Board Handling Circuit',
    subtitle: 'Carry, enter, exit, recover',
    content: `BOARD HANDLING CIRCUIT

PURPOSE: Build comfort and confidence with the surfboard in all phases outside of riding.

SETUP: Beach with shallow water access. Board with leash.

CIRCUIT (complete all stations):

Station 1 — CARRY (2 minutes)
- Pick up board from the ground (fins up).
- Carry under arm, walk 30 meters down the beach.
- Set board down gently fins-up.
- Repeat in opposite direction.
- Correction: "Keep the nose forward, fins AWAY from your body and others."

Station 2 — LEASH ATTACH (1 minute)
- Attach leash to back ankle (Velcro tight, string secured).
- Check: pull the board away — leash should hold without slipping.
- Detach and re-attach 3 times.

Station 3 — WATER ENTRY (3 minutes)
- Walk into knee-deep water carrying the board.
- Place the board flat on the water.
- Mount the board from the side (not from behind — fins can cut).
- Lie prone and paddle 10 strokes.
- Correction: "Enter from the side, hands on the rails."

Station 4 — WATER EXIT (2 minutes)
- In knee-deep water, dismount to the side.
- Grab the board by the rail, stand up.
- Carry the board out of the water using proper technique.
- Correction: "Never drag the board by the leash."

Station 5 — BOARD RECOVERY (2 minutes)
- In waist-deep water, push the board away.
- Pull it back using the leash hand-over-hand.
- Remount and return to prone position.
- Correction: "Control the leash — never let the board fly free."

STANDARD: Complete full circuit without corrections. All 5 stations clean.`,
    order: 12,
  },
  {
    id: 'wb-d04',
    beltLevel: 'white_belt',
    category: 'drill',
    title: 'Cobra + Direction Choice Drill',
    subtitle: 'Transition practice with intentional direction',
    content: `COBRA + DIRECTION CHOICE DRILL

PURPOSE: Practice the transition from paddling to cobra position with directional commitment.

SETUP: Board on sand or flat water. Coach stands at the side.

EXECUTION:
1. Student lies prone and paddles 5 strokes.
2. Coach calls "COBRA!"
3. Student pushes to cobra position — chest up, elbows in, eyes forward.
4. Coach calls a direction: "LEFT!" or "RIGHT!"
5. Student turns head and eyes to declared direction.
6. Coach checks: is the student looking at the intended direction? Are shoulders beginning to angle?
7. Coach calls "DOWN!" — student returns to prone.
8. Repeat 10 times, alternating directions randomly.

ADVANCED VARIATION:
- Instead of coach calling direction, student declares their OWN direction before cobra.
- This builds self-directed decision-making.

COACHING CUES:
- "Eyes lead everything — where you look, your body follows."
- "Commit! Don't hesitate between left and right."
- "Cobra is not just pushing up — it's LOOKING where you're going."

COMMON ERRORS:
- Looking down at the board during cobra (must look FORWARD/DIRECTION).
- Hesitating when direction is called (decision must be instant).
- Collapsing from cobra too quickly (hold for 2-3 seconds).

STANDARD: 10 cobras with instant direction choice, correct head/eye position every time.`,
    order: 13,
  },
  {
    id: 'wb-d05',
    beltLevel: 'white_belt',
    category: 'drill',
    title: 'Starfish Practice',
    subtitle: 'Safe dismount drill in controlled setting',
    content: `STARFISH PRACTICE

PURPOSE: Train the safe dismount reflex so it becomes automatic when falling.

SETUP: Waist-deep water. Board with leash attached.

EXECUTION:
1. Student stands on board in shallow water (assisted if needed).
2. Coach calls "FALL!"
3. Student kicks the board away, spreads arms and legs (starfish), falls flat on the water.
4. Student covers head with arms while surfacing.
5. Student locates the board, grabs the leash, recovers to standing.
6. Repeat 10 times.

PROGRESSION:
- Level 1: Standing still, fall on command (stationary board).
- Level 2: Walking on the board, fall on command (moving scenario).
- Level 3: After a simulated pop-up, fall on command.
- Level 4: With eyes closed (trust the muscle memory).

KEY SAFETY POINTS:
- NEVER dive headfirst. Always go flat (starfish).
- NEVER jump feet-first in water shallower than chest-deep.
- Always cover your head when surfacing — your board is attached to your ankle.
- After surfacing: "Where's my board?" is always the first thought.

COACHING CUES:
- "Kick the board, spread wide, go flat."
- "Protect your head — arms up when you come back up."
- "Find your board IMMEDIATELY."

STANDARD: 10 clean starfish dismounts. Board kicked away safely, head protected on every surfacing.`,
    order: 14,
  },
  {
    id: 'wb-d06',
    beltLevel: 'white_belt',
    category: 'drill',
    title: 'Kinetic Chain Rotation Drill',
    subtitle: 'Eyes-shoulders-hips-board connection',
    content: `KINETIC CHAIN ROTATION DRILL

PURPOSE: Train the full body rotation chain that controls all surfing movements.

SETUP: On land, standing in power stance on the board (or a line on the ground).

THE KINETIC CHAIN:
Eyes → Shoulders → Hips → Board
Everything in surfing follows this chain. Where your eyes go, your shoulders follow. Where your shoulders go, your hips follow. Where your hips go, the board follows.

EXECUTION:
1. Student stands in power stance, arms up in balance position.
2. Coach points LEFT — student rotates EYES only to the left. Hold 2 seconds.
3. Coach says "SHOULDERS" — student rotates shoulders to match eyes. Hold 2 seconds.
4. Coach says "HIPS" — student rotates hips to match shoulders. Hold 2 seconds.
5. Coach says "BOARD" — student allows the board (or feet) to follow the rotation.
6. Full rotation sequence should take about 6-8 seconds.
7. Reset to center. Repeat to the RIGHT.
8. 10 repetitions each direction.

SPEED PROGRESSION:
- Slow: Full chain, 2 seconds per link (beginner).
- Medium: Full chain, 1 second per link.
- Fast: Full chain as single fluid motion (the goal for surfing).

COACHING CUES:
- "Your eyes are the steering wheel of the surfboard."
- "If your shoulders don't follow your eyes, you'll counter-rotate."
- "Hips are the engine — they transfer power to the board."

COMMON ERRORS:
- Rotating hips before shoulders (skipping a link in the chain).
- Looking one way but leaning the other (disconnect).
- Stiff upper body (relax the arms, let them flow with the rotation).

STANDARD: Student demonstrates full kinetic chain at medium speed, 5 consecutive left + 5 right, smooth and connected.`,
    order: 15,
  },

  // ── Water Missions ──
  {
    id: 'wb-m01',
    beltLevel: 'white_belt',
    category: 'mission',
    title: 'Mission 1: Prone Ride',
    subtitle: 'Catch whitewater and ride prone to the beach',
    content: `MISSION 1: PRONE RIDE

OBJECTIVE: Catch a whitewater wave in prone position and ride it to the beach.

SETUP: Waist to chest-deep water. Student is prone on the board facing the beach.

EXECUTION:
1. Watch for a whitewater wave approaching from behind.
2. Begin paddling toward the beach as the wave arrives (3-4 strong strokes).
3. Feel the wave catch the board — it will accelerate you forward.
4. STOP paddling. Hold the rails. Stay flat and balanced.
5. Ride the wave to the beach in prone position.
6. As the water gets shallow, roll off the side of the board.

SUCCESS CRITERIA:
- Caught the wave (board accelerated with the whitewater).
- Maintained sweet spot (nose not pearling or dragging).
- Rode to the beach or until the wave dissipated.
- Exited safely to the side.

REPETITIONS: 5 successful prone rides to pass this mission.`,
    order: 20,
  },
  {
    id: 'wb-m02',
    beltLevel: 'white_belt',
    category: 'mission',
    title: 'Mission 2: Cobra to Direction',
    subtitle: 'Catch wave, cobra position, declare and look toward direction',
    content: `MISSION 2: COBRA TO DIRECTION

OBJECTIVE: Catch a whitewater wave, push to cobra, declare direction, and hold while riding.

EXECUTION:
1. Paddle into whitewater wave.
2. Once the wave catches you, push up to cobra position.
3. Declare direction out loud: "LEFT!" or "RIGHT!"
4. Turn head and eyes to your declared direction.
5. Hold cobra with directional gaze for 3+ seconds.
6. Lower back to prone or controlled dismount.

SUCCESS CRITERIA:
- Smooth transition from paddle to cobra.
- Direction declared BEFORE looking.
- Eyes and head turned to correct side.
- Held for at least 3 seconds.

REPETITIONS: 5 successful cobras with direction — minimum 2 left AND 2 right.`,
    order: 21,
  },
  {
    id: 'wb-m03',
    beltLevel: 'white_belt',
    category: 'mission',
    title: 'Mission 3: Stand & Ride Straight',
    subtitle: 'Full pop-up on whitewater, ride straight to beach',
    content: `MISSION 3: STAND & RIDE STRAIGHT

OBJECTIVE: Complete a full pop-up on a whitewater wave and ride standing to the beach.

EXECUTION:
1. Paddle into whitewater wave.
2. Wave catches you — push to cobra, then FULL POP-UP.
3. Land in power stance (knees bent, arms up, eyes forward).
4. Ride the whitewater straight toward the beach.
5. Maintain power stance throughout the ride.
6. Starfish dismount when the wave ends.

SUCCESS CRITERIA:
- Clean pop-up (no knee drag).
- Power stance achieved (knees bent, balanced).
- Rode standing for minimum 3 seconds.
- Safe dismount (starfish or controlled step-off).

REPETITIONS: 5 successful stand-up rides to pass.`,
    order: 22,
  },
  {
    id: 'wb-m04',
    beltLevel: 'white_belt',
    category: 'mission',
    title: 'Mission 4: Stand with Direction',
    subtitle: 'Pop-up with declared direction, angle the board',
    content: `MISSION 4: STAND WITH DIRECTION

OBJECTIVE: Pop up on whitewater with a pre-declared direction and ride at an angle.

EXECUTION:
1. Before paddling, declare direction: "Going right!" or "Going left!"
2. Paddle into whitewater wave.
3. Pop up and immediately look toward your declared direction.
4. Use kinetic chain (eyes → shoulders → hips) to angle the board.
5. Ride at a slight angle instead of straight to the beach.
6. Controlled dismount.

SUCCESS CRITERIA:
- Direction declared before catching the wave.
- Pop-up executed with eyes toward declared direction.
- Board angled at least slightly in the declared direction.
- Maintained balance throughout.

REPETITIONS: 6 successful rides — 3 left, 3 right.`,
    order: 23,
  },
  {
    id: 'wb-m05',
    beltLevel: 'white_belt',
    category: 'mission',
    title: 'Mission 5: Turtle Roll & Paddle Out',
    subtitle: 'Navigate through whitewater using turtle roll',
    content: `MISSION 5: TURTLE ROLL & PADDLE OUT

OBJECTIVE: Paddle from the beach through whitewater to the lineup using turtle rolls.

EXECUTION:
1. Enter water with board, mount prone, and begin paddling out.
2. When a whitewater wave approaches:
   a) Grip both rails firmly.
   b) Take a breath.
   c) Roll the board and your body upside down (turtle roll).
   d) Hold tight as the wave passes over.
   e) Roll back over and resume paddling immediately.
3. Reach the lineup (past the breaking waves).
4. Sit on the board and hold position for 30 seconds.

SUCCESS CRITERIA:
- Minimum 3 turtle rolls executed during paddle-out.
- Board was not lost during any turtle roll.
- Reached the lineup without assistance.
- Sat on the board in the lineup for 30+ seconds.

REPETITIONS: 3 successful paddle-outs.`,
    order: 24,
  },
  {
    id: 'wb-m06',
    beltLevel: 'white_belt',
    category: 'mission',
    title: 'Mission 6: Full White Belt Wave',
    subtitle: 'Paddle out, catch wave, pop-up, ride with direction, safe exit',
    content: `MISSION 6: FULL WHITE BELT WAVE

OBJECTIVE: Execute the complete White Belt wave cycle from paddle-out to safe exit.

EXECUTION:
1. Paddle out through whitewater (turtle roll as needed).
2. Sit in lineup and wait for a wave.
3. Choose a wave and declare direction.
4. Paddle for the wave with purpose.
5. Feel the catch — push to cobra — full pop-up.
6. Ride with direction (frontside or backside adjustment).
7. Hold power stance for the full ride.
8. Starfish dismount or controlled exit.
9. Recover board, paddle back out.

SUCCESS CRITERIA:
- Complete cycle executed without assistance.
- Direction declared and followed.
- Clean pop-up, power stance maintained.
- Safe dismount.
- Priority awareness demonstrated (did not drop in on anyone).

REPETITIONS: 3 complete cycles to pass this mission.`,
    order: 25,
  },
  {
    id: 'wb-m07',
    beltLevel: 'white_belt',
    category: 'mission',
    title: 'Mission 7: Session Independence',
    subtitle: 'Complete a full 20-minute solo session with coach observation only',
    content: `MISSION 7: SESSION INDEPENDENCE

OBJECTIVE: Demonstrate readiness to surf with minimal coaching intervention. Coach observes but does not direct.

EXECUTION:
1. Student completes full venue analysis independently.
2. Student enters water, paddles out, and positions in lineup — all self-directed.
3. For 20 minutes, student catches waves with:
   - Self-declared direction on each wave.
   - Clean pop-ups.
   - Power stance riding.
   - Safe dismounts.
   - Board recovery and paddle-back.
4. Coach observes and takes notes but does NOT intervene unless safety requires it.
5. Post-session debrief: coach shares observations, student shares self-assessment.

SUCCESS CRITERIA:
- Minimum 5 waves caught in the 20-minute session.
- No safety violations.
- Self-directed wave selection and direction choice.
- Awareness of other surfers in the lineup.
- Clean entries and exits from the water.

This mission marks WHITE BELT COMPLETION READINESS.`,
    order: 26,
  },

  // ── Safety ──
  {
    id: 'wb-s01',
    beltLevel: 'white_belt',
    category: 'safety',
    title: 'Safety Essentials',
    subtitle: 'Leash rules, starfish, max wave height, signals',
    content: `SAFETY ESSENTIALS — WHITE BELT

1. LEASH RULES
- The leash is ALWAYS attached before entering the water.
- Check the leash for wear before every session (fraying, loose Velcro).
- The leash goes on the BACK ankle (the foot closest to the tail).
- Never wrap the leash around your hand or arm.
- Never surf without a leash at the White Belt level — no exceptions.

2. STARFISH PROTOCOL
The starfish is your DEFAULT fall response:
- Kick the board away.
- Spread arms and legs flat (increase surface area, stay shallow).
- Cover your head with arms when surfacing.
- First thought after surfacing: "Where is my board?"
- Practice until it is REFLEX, not thought.

3. MAXIMUM WAVE HEIGHT — WHITE BELT
- White Belt students train in waves no larger than waist-high (2-3 feet).
- If conditions exceed this, the session is cancelled or moved to a protected area.
- Coach has final authority on conditions assessment.
- Students must NEVER paddle out in conditions beyond their level.

4. COMMUNICATION SIGNALS
Signals between coach and student in the water:
- Arm raised straight up: "I need help" / "Come here"
- Both arms crossed overhead (X): "Come in immediately — session over"
- Thumbs up: "I'm OK" / "Good wave"
- Pointing left/right: Coach suggesting direction

5. BUDDY SYSTEM
- White Belt students always surf with a coach or training partner.
- Never surf alone at this level.
- Always know where your buddy is in the water.
- If your buddy signals for help, paddle to them immediately.

6. RIP CURRENT RESPONSE
If caught in a rip current:
- DO NOT panic. DO NOT fight it by paddling straight to shore.
- Paddle SIDEWAYS (parallel to the beach) to exit the rip.
- If too tired to paddle, signal for help (arm straight up).
- Stay on your board — it is your flotation device.

STANDARD: Student can recite all 6 safety protocols and demonstrate starfish + rip current response on demand.`,
    order: 30,
  },

  // ── Mental Tools ──
  {
    id: 'wb-mt01',
    beltLevel: 'white_belt',
    category: 'mental',
    title: 'Mental Tools — White Belt',
    subtitle: 'Courage through structure, patience, trust, frustration tolerance, focus',
    content: `MENTAL TOOLS — WHITE BELT

1. COURAGE THROUGH STRUCTURE
Fear is normal. The antidote to fear is NOT fearlessness — it is STRUCTURE.
- When you know the exact steps (paddle, cobra, pop-up, stance), fear decreases.
- Each drill, each repetition, each mission builds your structure.
- Structure = predictability. Predictability = confidence. Confidence = courage.
- You don't need to be brave. You need to be prepared.

2. PATIENCE
Surfing rewards patience, not urgency.
- Wait for the right wave instead of paddling for every bump.
- Trust the process: you will not master the pop-up in one session. That is normal.
- Each session is a brick. You are building a wall, one brick at a time.
- Compare yourself to your last session, not to other surfers.

3. TRUST IN THE SYSTEM
The Surf Sequence is designed so that each skill builds on the previous one.
- You don't need to understand why each drill matters right now — trust the order.
- Sequences 1-5 are the foundation for everything that comes later.
- Skipping steps creates gaps that show up as bad habits later.
- Trust the belt path. It exists for a reason.

4. FRUSTRATION TOLERANCE
You will wipe out. You will miss waves. You will feel frustrated.
- Frustration means you care. That is good.
- After a wipeout, take 3 deep breaths before the next attempt.
- Name the frustration: "I'm frustrated because I keep knee-dragging."
- Then return to the drill: "So I will do 5 more pop-ups on land before going back in."
- Frustration + action = progress. Frustration + quitting = stagnation.

5. FOCUS ANCHORING
In the water, your mind will wander. Use a focus anchor:
- Before each wave, say ONE technical cue to yourself: "Eyes up." or "Low stance." or "Commit left."
- This single cue keeps your mind locked on a task instead of drifting into anxiety or distraction.
- One wave, one cue. Not three things. ONE.
- After the wave, assess: "Did I do the thing I said I would?" Yes or no. That is your data.

STANDARD: Student can describe all 5 mental tools and applies focus anchoring on every wave during missions.`,
    order: 35,
  },
];

// ═══════════════════════════════════════════════════════════
// YELLOW BELT — Sequences #6–#10
// ═══════════════════════════════════════════════════════════

const YELLOW_BELT_MATERIALS: BeltMaterial[] = [
  // ── Theory / Sequence Content ──
  {
    id: 'yb-t01',
    beltLevel: 'yellow_belt',
    category: 'theory',
    title: 'Board & Paddle Through Conditions',
    subtitle: 'Entry, paddle control, turtle roll mastery',
    content: `BOARD & PADDLE THROUGH CONDITIONS

1. ENTRY STRATEGIES
Different conditions require different entries:
- Small surf (ankle to waist): Walk in carrying the board, mount when waist-deep.
- Medium surf (waist to chest): Time your entry between sets. Wade quickly, mount, and paddle hard during the lull.
- Shore break: Wait for the wave to recede, run in, jump on the board, and paddle before the next wave.

Key principle: NEVER turn your back on the ocean during entry.

2. PADDLE POWER & ENDURANCE
Yellow Belt paddling upgrades:
- Increase paddle stroke depth (full arm extension, hand exits at hip).
- Rhythm: steady, sustainable pace for long paddle-outs. Save sprinting for wave catching.
- Body position: slight arch in lower back, core engaged, head steady.
- Breathing: exhale on the stroke, inhale on the recovery. Rhythmic breathing prevents fatigue.

3. TURTLE ROLL MASTERY
Upgrade from basic turtle roll:
- Initiate earlier (when the wave is 3-4 board lengths away, not 1).
- Wrap your legs around the board for extra grip.
- Angle the board slightly into the wave (nose pointing toward the wave, not parallel).
- After rolling back, immediately take 3 POWER strokes to regain momentum.

Advanced scenario: Multiple waves in a set
- If a second wave follows immediately, stay inverted or re-roll quickly.
- Don't waste energy remounting between waves in a set — stay tight and roll.

4. PADDLE EFFICIENCY IN CURRENT
- If paddling against a lateral current, angle your paddle-out upstream.
- Use the channel (deeper water between breaking waves) whenever possible.
- In a rip current: sometimes you can USE it to paddle out (it pulls you seaward). But only if you know how to exit it.

STANDARD: Student paddles out in chest-high conditions using 3+ turtle rolls, arrives in lineup with energy to catch waves, demonstrates breath-rhythm paddling.`,
    order: 40,
  },
  {
    id: 'yb-t02',
    beltLevel: 'yellow_belt',
    category: 'theory',
    title: 'Wave Interaction',
    subtitle: 'Paddling speeds 1-2-3-4, chase pocket, angle approach',
    content: `WAVE INTERACTION

1. THE FOUR PADDLING SPEEDS
Speed 1 — CRUISE: Relaxed, sustainable pace for moving around the lineup. Used between waves.
Speed 2 — POSITION: Slightly faster, used to adjust your position when you see a wave forming. You are not yet committed.
Speed 3 — COMMIT: Fast, strong strokes. The wave is approaching and you have decided to catch it. Full power, full extension.
Speed 4 — SPRINT: Maximum effort, 3-5 explosive strokes just as the wave reaches you. This is the "catch speed" — the wave must feel your momentum.

Coaching cue: "Speed 1... Speed 2... SPEED 3... SPRINT!"

Common error: Starting at Speed 4 too early and burning out before the wave arrives. Build from 1 to 4 progressively.

2. THE CHASE POCKET
The "pocket" is the steepest, most powerful part of the wave (just ahead of where it breaks).
- As a wave approaches, position yourself so the pocket will reach YOU.
- Do not paddle straight at the beach — angle toward the pocket.
- The pocket gives you the most energy for your take-off.
- Think of it as "meeting the wave at its power source."

3. ANGLE APPROACH
Instead of catching the wave straight toward the beach:
- Angle your board 15-30 degrees toward your intended direction BEFORE the wave catches you.
- This gives you immediate lateral speed after the pop-up.
- You skip the "bottom turn" at this level — the angle does the work.
- Frontside angle: nose points toward the wave face direction you want to go.
- Backside angle: nose angles away from the breaking direction but toward your travel line.

4. WAVE SELECTION
Not all waves are worth catching:
- Look for waves that are steepening (about to break) with a clean face.
- Avoid close-outs (waves that break all at once across the entire face).
- Prefer waves that peel (break progressively from one side to the other).
- At Yellow Belt, choose waves that give you TIME to execute your pop-up.

STANDARD: Student demonstrates 4 paddle speeds on command, catches 3 waves using angle approach (not straight), identifies and avoids close-outs.`,
    order: 41,
  },
  {
    id: 'yb-t03',
    beltLevel: 'yellow_belt',
    category: 'theory',
    title: 'Connect with Board',
    subtitle: 'Pop-up on green waves, power stance, impulse mastery',
    content: `CONNECT WITH BOARD

1. POP-UP ON GREEN (UNBROKEN) WAVES
Yellow Belt transitions from whitewater to green waves:
- Green waves are unbroken — they are steeper and faster than whitewater.
- The pop-up must happen EARLIER (before the wave breaks under you).
- Timing: pop up when you feel the board accelerate and angle downward (the "drop").
- If you pop up too late, the wave breaks on you (wipeout). Too early, and the wave passes under you.

Drill: Have the coach push you into small green waves to feel the timing before self-catching.

2. POWER STANCE UPGRADE
At Yellow Belt, stance becomes more dynamic:
- Front foot: toes angled slightly more toward the nose (for speed).
- Back foot: centered on the tail pad, heel can shift for rail engagement.
- Knee bend: lower than White Belt. The lower you are, the more stable.
- Arms: not just up for balance — they begin to GUIDE direction (reaching toward your line).

3. IMPULSE MASTERY
The impulse (first compression after pop-up) becomes critical on green waves:
- As your feet land, immediately compress (bend knees more) and then extend.
- This "pump" drives the board forward and generates initial speed.
- Without impulse on a green wave, you will stall at the top and lose the wave.
- Think of it as "loading a spring" — compress, then release.

Timing: The impulse happens DURING the pop-up landing, not after.

4. FEET-BOARD CONNECTION
Your feet are your primary connection to the board:
- Feel the board through the soles of your feet.
- Toes grip slightly (but don't claw — that creates tension).
- Weight shifts are communicated through foot pressure, not body lean.
- Front foot pressure = speed/nose drop. Back foot pressure = control/tail engagement.

STANDARD: Student catches 3 green waves with proper pop-up timing, executes impulse on each, and maintains upgraded power stance for the full ride.`,
    order: 42,
  },
  {
    id: 'yb-t04',
    beltLevel: 'yellow_belt',
    category: 'theory',
    title: 'Flow & Exit',
    subtitle: 'Turns, vertical movement, dismount',
    content: `FLOW & EXIT

1. BASIC TURNS ON GREEN WAVES
Upgrade from White Belt directional adjustments to actual turns:
- Frontside turn: Look toward the wave face, weight to toes, lead with front shoulder. The board carves a smooth arc.
- Backside turn: Look over back shoulder, weight to heels, lead with back hand reaching toward the wave. Board arcs on the heel rail.
- Turns should be SMOOTH, not jerky. Let the kinetic chain flow.

2. VERTICAL MOVEMENT
Yellow Belt introduces the concept of moving UP and DOWN on the wave face:
- "Going high" = riding up toward the lip (top of the wave).
- "Going low" = riding down toward the trough (bottom of the wave).
- This up-and-down motion is the foundation of surfing flow.
- At this level, practice going low (bottom of the wave) and then coming back up toward the pocket.

3. TRIMMING
Trimming is riding in the pocket without turning:
- Adjust speed by shifting weight (front foot for speed, back foot to slow down).
- The goal is to stay IN the pocket — not too far ahead (losing power) or too far behind (getting hit by the breaking section).
- Trimming is the purest form of wave-reading at this level.

4. EXIT STRATEGY
How and when to end the ride:
- Controlled exit: Kick out over the back of the wave (step on the tail, wave passes under you).
- Straighten out: If the wave dies, ride straight to the beach and step off in shallow water.
- Starfish: Still valid as an emergency dismount.
- NEW: "Flopping" exit — in small waves, simply lie down on the board from standing (controlled return to prone).

STANDARD: Student demonstrates a frontside and backside turn on green waves, shows up-and-down movement on the wave face, and uses a kick-out or controlled exit.`,
    order: 43,
  },
  {
    id: 'yb-t05',
    beltLevel: 'yellow_belt',
    category: 'theory',
    title: 'Three Circles of Power',
    subtitle: 'Body (PRCH), Board (Foot Positions 1-2-3), Wave (Pocket)',
    content: `THREE CIRCLES OF POWER

The Yellow Belt introduces the TSS framework for understanding where surfing power comes from.

CIRCLE 1: BODY — PRCH
Your body generates power through four connected elements:
P = POSTURE: Upright but low. Chest open, shoulders back, knees bent. Never hunched.
R = ROTATION: The kinetic chain (eyes → shoulders → hips → board). All power comes from rotation.
C = COMPRESSION: Bending your knees loads energy. Straightening releases it. This is "pumping."
H = HANDS: Your arms and hands guide direction and add balance. They reach toward your target.

Coaching cue: "Check your PRCH" — Posture, Rotation, Compression, Hands.

CIRCLE 2: BOARD — FOOT POSITIONS 1-2-3
Your feet control the board through three positions:
Position 1 — NEUTRAL: Both feet centered, standard power stance. Used for straight riding and cruising.
Position 2 — FRONT-WEIGHTED: Weight shifted to front foot (60/40 or 70/30). Used for generating speed, dropping into the wave, and nose-forward momentum.
Position 3 — BACK-WEIGHTED: Weight shifted to back foot (40/60 or 30/70). Used for turns, tail pivots, slowing down, and engaging the fins.

Every maneuver in surfing is a combination of these three positions in sequence.

CIRCLE 3: WAVE — THE POCKET
The wave provides power through the pocket:
- The pocket is where the wave is steepest and most powerful (near the breaking point).
- Riding in the pocket gives you maximum speed and energy.
- Riding too far ahead of the pocket: you lose power and stall.
- Riding too far behind the pocket: the wave breaks on you.
- Your job is to STAY in the pocket by adjusting speed (Foot Positions 1-2-3).

THE INTERSECTION:
The best surfing happens when all three circles align:
- Your BODY is in proper PRCH position.
- Your FEET are in the right position for what you need (speed, turn, control).
- You are in the POCKET of the wave.

When all three circles overlap, you are "in the zone" — maximum flow, maximum power.

STANDARD: Student can explain all three circles, demonstrate PRCH on land, show Foot Positions 1-2-3, and identify the pocket on 5 consecutive waves.`,
    order: 44,
  },

  // ── Drills ──
  {
    id: 'yb-d01',
    beltLevel: 'yellow_belt',
    category: 'drill',
    title: 'Four-Speed Paddle Drill',
    subtitle: 'Practice transitioning between paddling speeds 1-2-3-4',
    content: `FOUR-SPEED PADDLE DRILL

PURPOSE: Build the ability to shift between paddling speeds fluidly.

SETUP: Open water, flat or small surf. Student is prone on board.

EXECUTION:
1. Coach calls "Speed 1!" — student paddles at cruise pace for 15 seconds.
2. Coach calls "Speed 2!" — student increases to position pace for 10 seconds.
3. Coach calls "Speed 3!" — student powers up to commit pace for 8 seconds.
4. Coach calls "Speed 4! SPRINT!" — student gives maximum effort for 5 seconds.
5. Coach calls "Rest" — student stops and recovers for 30 seconds.
6. Repeat 5 sets.

COACHING CUES:
- "Speed 1 is a conversation pace — you could talk."
- "Speed 2 — you're interested, you're watching."
- "Speed 3 — you've decided. Full strokes, deep pull."
- "Speed 4 — this is life or death for 5 seconds. EVERYTHING you have."

VARIATION — WAVE SIMULATION:
Coach simulates a wave approach by counting down:
"Wave forming... (Speed 1)... Getting closer... (Speed 2)... It's coming! (Speed 3)... NOW! (Speed 4 SPRINT)... CATCH!"

STANDARD: Student demonstrates clear differentiation between all 4 speeds. Speed 4 shows noticeable acceleration.`,
    order: 50,
  },
  {
    id: 'yb-d02',
    beltLevel: 'yellow_belt',
    category: 'drill',
    title: 'PRCH Body Check Drill',
    subtitle: 'Posture-Rotation-Compression-Hands self-assessment',
    content: `PRCH BODY CHECK DRILL

PURPOSE: Train the student to self-assess body position using the PRCH framework.

SETUP: On land in power stance. Board or line on the ground.

EXECUTION:
1. Student stands in power stance.
2. Coach calls each element — student must adjust and hold:
   - "P — Posture!" → Student corrects: chest open, back straight, knees bent, head up.
   - "R — Rotation!" → Student initiates a turn: eyes, shoulders, hips chain.
   - "C — Compression!" → Student drops low (compresses), then extends up.
   - "H — Hands!" → Student positions arms: front hand points toward direction, back hand at hip height.
3. Coach calls "Full PRCH!" — student holds the complete correct position for 5 seconds.
4. 10 repetitions.

SELF-CHECK VERSION:
Student does this ALONE before each wave in the water:
- Quick mental scan: "P... R... C... H... GO."
- Takes less than 3 seconds once internalized.

COMMON ERRORS:
- Hunched posture (P fails) — "Chest open!"
- Counter-rotation (R fails) — "Lead with your eyes!"
- Standing too tall (C fails) — "Get LOW!"
- Arms stiff at sides (H fails) — "Use your hands for direction!"

STANDARD: Student completes 10 full PRCH checks in 2 minutes on land. Applies PRCH self-check before 3 consecutive waves in the water.`,
    order: 51,
  },
  {
    id: 'yb-d03',
    beltLevel: 'yellow_belt',
    category: 'drill',
    title: 'Foot Position 1-2-3 Drill',
    subtitle: 'Weight shift practice on board',
    content: `FOOT POSITION 1-2-3 DRILL

PURPOSE: Train controlled weight shifting between the three board control positions.

SETUP: Board on sand or in flat water. Student in power stance.

EXECUTION:
1. Student starts in Position 1 (NEUTRAL — 50/50 weight, centered stance).
   Coach says: "Position 1 — balanced, ready for anything."
   Hold 3 seconds.

2. Coach calls "Position 2!" — Student shifts weight to FRONT foot (60/40 or 70/30).
   - Front knee bends more, back leg extends slightly.
   - Body leans forward slightly, head moves over front foot.
   - This is the "speed" position.
   Hold 3 seconds.

3. Coach calls "Position 3!" — Student shifts weight to BACK foot (30/70 or 40/60).
   - Back knee bends deeply, front leg lightens.
   - Tail of board engages, fins activate.
   - This is the "turn/control" position.
   Hold 3 seconds.

4. Coach calls random sequences: "2! 1! 3! 2! 3! 1!" — student transitions fluidly.
5. 3 sets of 20 position changes.

IN-WATER VARIATION:
While riding a wave, coach signals foot positions:
- Hold up 1 finger: Position 1 (cruise).
- Hold up 2 fingers: Position 2 (speed up).
- Hold up 3 fingers: Position 3 (slow down / prepare to turn).

STANDARD: Student transitions between positions without losing balance, 20 transitions in 60 seconds on land.`,
    order: 52,
  },
  {
    id: 'yb-d04',
    beltLevel: 'yellow_belt',
    category: 'drill',
    title: 'Pocket Tracking Drill',
    subtitle: 'Stay in the power zone of the wave',
    content: `POCKET TRACKING DRILL

PURPOSE: Develop the ability to identify and stay in the pocket while riding.

SETUP: In the water, catching green waves. Coach on the beach or in the water observing.

EXECUTION:
1. Student catches a green wave and pops up.
2. Instead of just riding straight, the student's ONE goal is: STAY IN THE POCKET.
3. If getting too far ahead of the pocket → shift to Position 3 (back foot, slow down).
4. If falling too far behind the pocket → shift to Position 2 (front foot, speed up).
5. Ride continues as long as the student is in or near the pocket.
6. Coach provides feedback after each wave: "Too far ahead," "Too far behind," or "In the pocket!"

VISUAL CUE:
The pocket is the steepest part of the wave face, just ahead of where whitewater forms.
- If you see flat water ahead of you → you're too far ahead.
- If you feel spray on your back → you're too far behind.
- If the wave face is steep and curling next to you → you're in the pocket.

COACHING CUES:
- "Speed up — you're losing the wave!"
- "Slow down — let the wave catch up to you."
- "Right there — HOLD that position. Feel the power."

STANDARD: Student stays in the pocket for 3+ seconds on 5 waves.`,
    order: 53,
  },
  {
    id: 'yb-d05',
    beltLevel: 'yellow_belt',
    category: 'drill',
    title: 'Green Wave Pop-Up Timing Drill',
    subtitle: 'Catch unbroken waves with proper timing',
    content: `GREEN WAVE POP-UP TIMING DRILL

PURPOSE: Develop the timing for popping up on green (unbroken) waves.

SETUP: In the water past the break. Coach pushes or guides early attempts.

EXECUTION — PHASE 1 (COACHED):
1. Coach positions student for an incoming green wave.
2. Coach calls "PADDLE!" at the right moment.
3. Student sprints (Speed 4) for 3-5 strokes.
4. Coach calls "NOW!" at the moment the wave lifts the tail and the board tilts forward.
5. Student pops up immediately on the "NOW" cue.
6. 10 attempts with coach timing.

EXECUTION — PHASE 2 (SELF-TIMED):
1. Student positions themselves for waves.
2. Student must FEEL the "tilt" — the moment the wave lifts the tail and the board drops forward.
3. That is the pop-up moment. No coach cue.
4. 10 self-timed attempts.

TIMING CUES:
- "Feel the lift in your hips — that's the wave grabbing you."
- "If the nose dives, you're too far forward or too late."
- "If the wave passes under you, you paddled too slowly or popped too early."

COMMON ERRORS:
- Popping up before the wave catches you (too early — wave passes under).
- Popping up after the wave breaks (too late — wipeout).
- Insufficient paddle speed (wave passes — not enough Speed 4).

STANDARD: Student catches and pops up on 5 green waves with self-timing (no coach cues).`,
    order: 54,
  },
  {
    id: 'yb-d06',
    beltLevel: 'yellow_belt',
    category: 'drill',
    title: 'Compression-Extension Pump Drill',
    subtitle: 'Generate speed through body pumping on land',
    content: `COMPRESSION-EXTENSION PUMP DRILL

PURPOSE: Train the basic "pump" motion that generates speed on the wave.

SETUP: Board on sand. Student in power stance.

EXECUTION:
1. Student stands in power stance.
2. "COMPRESS" — bend knees deeply, arms drop slightly, center of gravity lowers.
3. "EXTEND" — straighten legs (not fully — keep slight bend), arms rise, body lifts.
4. Repeat in rhythm: "Compress-extend, compress-extend" — like a spring.
5. Start slow (1 cycle per 2 seconds), progress to fast (1 cycle per second).
6. 3 sets of 20 pumps.

WAVE CONNECTION:
- Compression (down) happens as you go DOWN the wave face.
- Extension (up) happens as you go UP the wave face.
- This synchronized body motion with the wave is what creates speed without paddling.
- Think of a skateboard half-pipe: you pump to gain speed by compressing in the trough and extending at the top.

COACHING CUES:
- "You're a spring. Load it, release it."
- "Low, high, low, high — with the wave."
- "Your knees do the work, not your back."

COMMON ERRORS:
- Pumping with the upper body (bobbing head) instead of the knees.
- Not getting low enough on compression (ineffective pump).
- Extending too much (standing fully upright — loses connection with the board).

STANDARD: Student demonstrates 20 smooth, rhythmic pumps on land with proper knee-driven motion.`,
    order: 55,
  },

  // ── Water Missions ──
  {
    id: 'yb-m01',
    beltLevel: 'yellow_belt',
    category: 'mission',
    title: 'Mission 1: Green Wave Catch',
    subtitle: 'Catch 3 unbroken waves with proper paddle speed progression',
    content: `MISSION 1: GREEN WAVE CATCH

OBJECTIVE: Catch 3 green (unbroken) waves using the 4-speed paddle progression.

EXECUTION:
1. Position in the lineup past the breaking waves.
2. Identify an approaching wave that is building but not yet breaking.
3. Begin at Speed 1, progress through 2-3-4 as the wave approaches.
4. Feel the catch — the board accelerates and tilts forward.
5. Pop up using proper timing (at the "tilt" moment).
6. Ride the wave in any direction.

SUCCESS CRITERIA:
- Wave was GREEN (unbroken) at the moment of catch.
- Clear speed progression was used (not paddling at Speed 4 the entire time).
- Pop-up happened at the correct timing moment.
- Student rode standing for 3+ seconds.

REPETITIONS: 3 successful green wave catches.`,
    order: 60,
  },
  {
    id: 'yb-m02',
    beltLevel: 'yellow_belt',
    category: 'mission',
    title: 'Mission 2: Angle Take-Off',
    subtitle: 'Catch waves already angled toward your intended direction',
    content: `MISSION 2: ANGLE TAKE-OFF

OBJECTIVE: Catch green waves with the board pre-angled toward your intended direction.

EXECUTION:
1. Before paddling, angle the board 15-30 degrees toward your intended direction.
2. Declare direction: "Going right!" or "Going left!"
3. Paddle at the angle (not straight toward the beach).
4. Pop up — you should already be moving laterally along the wave.
5. Ride along the wave face in your declared direction.

SUCCESS CRITERIA:
- Board was angled BEFORE the wave arrived.
- Direction was declared in advance.
- After pop-up, student was traveling along the wave (not straight to beach).
- Rode for 3+ seconds in the declared direction.

REPETITIONS: 6 successful angle take-offs — 3 left, 3 right.`,
    order: 61,
  },
  {
    id: 'yb-m03',
    beltLevel: 'yellow_belt',
    category: 'mission',
    title: 'Mission 3: PRCH Wave',
    subtitle: 'Catch and ride with conscious PRCH body check',
    content: `MISSION 3: PRCH WAVE

OBJECTIVE: Catch a wave and consciously execute the PRCH body framework during the ride.

EXECUTION:
1. Catch a green wave and pop up.
2. Immediately run PRCH check:
   P — Am I upright with open chest? Correct if not.
   R — Am I rotating toward my direction? Initiate if not.
   C — Am I compressed (knees bent)? Drop if not.
   H — Are my hands guiding? Position them if not.
3. Ride the wave maintaining PRCH for the full duration.
4. After the wave, self-assess: "Which element was weakest?"

SUCCESS CRITERIA:
- Student visibly adjusts posture, rotation, compression, or hand position during the ride.
- Coach confirms all 4 elements were addressed.
- Student provides self-assessment after the wave.

REPETITIONS: 5 waves with complete PRCH execution and self-assessment.`,
    order: 62,
  },
  {
    id: 'yb-m04',
    beltLevel: 'yellow_belt',
    category: 'mission',
    title: 'Mission 4: Pocket Ride',
    subtitle: 'Stay in the pocket for maximum duration',
    content: `MISSION 4: POCKET RIDE

OBJECTIVE: Ride in the pocket of a green wave for as long as possible.

EXECUTION:
1. Catch a green wave and pop up.
2. Your ONE goal: stay in the pocket.
3. Use Foot Position 2 (front-weighted) if you're falling behind.
4. Use Foot Position 3 (back-weighted) if you're getting ahead.
5. Adjust continuously — trimming to stay in the power zone.
6. Ride until the wave closes out or you lose the pocket.

SUCCESS CRITERIA:
- Student adjusted speed at least once during the ride (not just riding straight).
- Stayed in or near the pocket for 3+ seconds.
- Used foot position changes (not just leaning).

REPETITIONS: 5 pocket rides with at least 3 seconds each.`,
    order: 63,
  },
  {
    id: 'yb-m05',
    beltLevel: 'yellow_belt',
    category: 'mission',
    title: 'Mission 5: Foot Position Sequence',
    subtitle: 'Use all 3 foot positions in a single wave ride',
    content: `MISSION 5: FOOT POSITION SEQUENCE

OBJECTIVE: Execute Foot Positions 1, 2, and 3 during a single wave ride.

EXECUTION:
1. Catch a green wave, pop up into Position 1 (neutral).
2. Shift to Position 2 (front-weighted) — generate speed down the wave.
3. Shift to Position 3 (back-weighted) — slow down or prepare to turn.
4. Return to Position 1 — finish the ride balanced.
5. Exit cleanly.

The sequence should feel like: Cruise → Accelerate → Control → Cruise.

SUCCESS CRITERIA:
- All three positions were visibly executed during the ride.
- Transitions were smooth (not jerky or panic-driven).
- Student can describe what they did after the wave.

REPETITIONS: 3 waves with the full 1-2-3-1 sequence.`,
    order: 64,
  },
  {
    id: 'yb-m06',
    beltLevel: 'yellow_belt',
    category: 'mission',
    title: 'Mission 6: Frontside Pocket Turn',
    subtitle: 'Execute a frontside turn in the pocket of a green wave',
    content: `MISSION 6: FRONTSIDE POCKET TURN

OBJECTIVE: Ride a green wave frontside and execute a controlled turn in the pocket.

EXECUTION:
1. Catch a wave that allows you to ride frontside (facing the wave).
2. Pop up with angle, ride along the wave face.
3. When in the pocket, initiate a frontside turn:
   - Eyes look toward the wave face.
   - Shoulders rotate frontside.
   - Shift to Foot Position 3 (back-weighted).
   - Board carves a smooth arc on the toe rail.
4. After the turn, shift back to Position 2 and continue riding.

SUCCESS CRITERIA:
- Turn was executed in the pocket (not on flat water).
- Kinetic chain was used (eyes → shoulders → hips → board).
- Board carved a visible arc (not just a lean).
- Student continued riding after the turn.

REPETITIONS: 3 frontside pocket turns.`,
    order: 65,
  },
  {
    id: 'yb-m07',
    beltLevel: 'yellow_belt',
    category: 'mission',
    title: 'Mission 7: Backside Pocket Turn',
    subtitle: 'Execute a backside turn in the pocket',
    content: `MISSION 7: BACKSIDE POCKET TURN

OBJECTIVE: Ride a green wave backside and execute a controlled turn in the pocket.

EXECUTION:
1. Catch a wave that requires you to ride backside (back to the wave).
2. Pop up with angle, ride along the wave face.
3. When in the pocket, initiate a backside turn:
   - Look over your back shoulder toward the wave.
   - Rotate shoulders and reach back hand toward the wave face.
   - Shift to Foot Position 3 (back-weighted).
   - Board carves on the heel rail.
4. After the turn, reposition and continue riding.

SUCCESS CRITERIA:
- Turn was in the pocket.
- Head rotation was visible (looking over the back shoulder).
- Board carved on the heel rail.
- Student continued riding after the turn.

REPETITIONS: 3 backside pocket turns.`,
    order: 66,
  },
  {
    id: 'yb-m08',
    beltLevel: 'yellow_belt',
    category: 'mission',
    title: 'Mission 8: Compression Speed Generation',
    subtitle: 'Use pumping to generate speed on a wave',
    content: `MISSION 8: COMPRESSION SPEED GENERATION

OBJECTIVE: Generate speed on a wave using the compression-extension pump.

EXECUTION:
1. Catch a green wave and pop up.
2. As you ride, pump: compress (knees bend) going down the wave face, extend going up.
3. Feel the board accelerate with each pump cycle.
4. Execute at least 3 pump cycles during the ride.
5. Compare the speed of a pumped wave vs. a non-pumped wave.

SUCCESS CRITERIA:
- At least 3 visible pump cycles during the ride.
- Board noticeably accelerated (coach observes from beach/water).
- Pumps were knee-driven, not upper-body bobbing.
- Student felt the speed difference.

REPETITIONS: 3 waves with 3+ pumps each.`,
    order: 67,
  },
  {
    id: 'yb-m09',
    beltLevel: 'yellow_belt',
    category: 'mission',
    title: 'Mission 9: Kick-Out Exit',
    subtitle: 'End the ride with a controlled kick-out over the back of the wave',
    content: `MISSION 9: KICK-OUT EXIT

OBJECTIVE: End a ride with an intentional kick-out over the back of the wave.

EXECUTION:
1. Catch a wave, ride it (any direction).
2. When you decide to end the ride, shift to Foot Position 3 (back-weighted).
3. Apply back-foot pressure to lift the nose.
4. Direct the board up and over the back of the wave (toward the open ocean).
5. As the board clears the wave, shift to prone or sit on the board.
6. You are now in the lineup, ready to paddle for the next wave.

SUCCESS CRITERIA:
- Exit was intentional (not a wipeout or an unplanned straighten-out).
- Board went over the back of the wave.
- Student ended up in the lineup, not on the beach.
- Smooth transition from riding to sitting.

REPETITIONS: 5 controlled kick-outs.`,
    order: 68,
  },
  {
    id: 'yb-m10',
    beltLevel: 'yellow_belt',
    category: 'mission',
    title: 'Mission 10: Three Circles Wave',
    subtitle: 'Demonstrate Body, Board, and Wave awareness in one ride',
    content: `MISSION 10: THREE CIRCLES WAVE

OBJECTIVE: Ride a wave demonstrating all Three Circles of Power.

EXECUTION:
1. Catch a green wave with an angle take-off.
2. During the ride, demonstrate:
   - BODY: PRCH visible (posture, rotation, compression, hands).
   - BOARD: Use at least 2 different foot positions during the ride.
   - WAVE: Stay in or near the pocket for the majority of the ride.
3. Exit with a kick-out or controlled straighten-out.
4. Post-wave self-assessment: "How were my three circles?"

SUCCESS CRITERIA:
- Coach confirms PRCH was maintained (Body circle).
- At least 2 foot positions used (Board circle).
- Student stayed in the pocket for 3+ seconds (Wave circle).
- Self-assessment demonstrates understanding.

REPETITIONS: 3 complete Three Circles waves.`,
    order: 69,
  },
  {
    id: 'yb-m11',
    beltLevel: 'yellow_belt',
    category: 'mission',
    title: 'Mission 11: Yellow Belt Session',
    subtitle: '30-minute independent session with all Yellow Belt skills',
    content: `MISSION 11: YELLOW BELT SESSION

OBJECTIVE: Demonstrate complete Yellow Belt mastery in a 30-minute independent session.

EXECUTION:
1. Student completes venue analysis and enters the water independently.
2. For 30 minutes, student surfs with:
   - Green wave catching with angle take-offs.
   - PRCH body framework on every wave.
   - Pocket riding with foot position adjustments.
   - Both frontside and backside turns attempted.
   - Kick-out exits when appropriate.
   - Speed generation through pumping.
3. Coach observes from the beach — no intervention except for safety.
4. Post-session debrief with self-assessment.

SUCCESS CRITERIA:
- Minimum 8 waves caught in 30 minutes.
- At least 3 frontside and 3 backside waves.
- PRCH evident on the majority of rides.
- Pocket riding demonstrated on at least 5 waves.
- At least 3 kick-out exits.
- No safety violations.
- Self-assessment identifies strengths and areas for improvement.

This mission marks YELLOW BELT COMPLETION READINESS.`,
    order: 70,
  },

  // ── Mental Tools ──
  {
    id: 'yb-mt01',
    beltLevel: 'yellow_belt',
    category: 'mental',
    title: 'Mental Tools — Yellow Belt',
    subtitle: 'Flow channel, breath navigation, one wave one intention, frustration as information',
    content: `MENTAL TOOLS — YELLOW BELT

1. FLOW CHANNEL
Flow is the state where action and awareness merge. You are fully immersed.
- Flow happens when challenge and skill are balanced.
- Too easy (skill > challenge) = boredom. You surf on autopilot with no growth.
- Too hard (challenge > skill) = anxiety. You feel overwhelmed and make mistakes.
- The "flow channel" is the narrow zone between boredom and anxiety.
- Your job: CHOOSE waves and goals that keep you in the flow channel.
- If every wave feels easy → try harder waves or add a technical challenge.
- If every wave feels terrifying → go back to easier conditions and reinforce skills.

2. BREATH NAVIGATION
Breath is your real-time stress indicator and your best calming tool:
- Before paddling for a wave: ONE deep breath in through the nose, slow exhale through the mouth.
- During the ride: breathe rhythmically. Most beginners HOLD their breath — this creates tension.
- After a wipeout: 3 recovery breaths before the next attempt (in-2-3-4, out-2-3-4).
- When you notice you're breathing fast and shallow → you are in anxiety mode. Slow your breath to slow your mind.

Breathing drill: Before EVERY wave, one conscious breath. This becomes a trigger for focus.

3. ONE WAVE, ONE INTENTION
Yellow Belt expands the White Belt "focus anchor" concept:
- Before each wave, set ONE clear intention:
  "On this wave, I will stay in the pocket."
  "On this wave, I will use all three foot positions."
  "On this wave, I will execute a backside turn."
- After the wave, assess: "Did I achieve my intention? Yes or no."
- This turns every wave into a mini-experiment with clear feedback.
- Over a session: 10 waves = 10 experiments = 10 data points about your surfing.

4. FRUSTRATION AS INFORMATION
Upgrade from White Belt frustration tolerance:
- Frustration is no longer just something to tolerate — it is DATA.
- When frustrated, ask: "What exactly is frustrating me?"
  "I can't catch green waves" → Data: pop-up timing needs work.
  "I keep losing the pocket" → Data: foot position transitions too slow.
  "My turns feel weak" → Data: kinetic chain not fully engaged.
- Convert the frustration into a specific, actionable drill or mission.
- Frustration → Question → Specific Problem → Specific Drill → Improvement.

This is the beginning of the self-coaching mindset.

STANDARD: Student sets one intention before every wave for an entire session (minimum 8 waves). Post-session self-assessment identifies 2 specific areas for improvement using frustration-as-data.`,
    order: 75,
  },
];

// ═══════════════════════════════════════════════════════════
// BLUE BELT — Sequences #11–#15
// ═══════════════════════════════════════════════════════════

const BLUE_BELT_MATERIALS: BeltMaterial[] = [
  // ── Theory / Sequence Content ──
  {
    id: 'bb-t01',
    beltLevel: 'blue_belt',
    category: 'theory',
    title: 'Posture & Pumping',
    subtitle: 'Speed generation, compression/extension mechanics',
    content: `POSTURE & PUMPING — BLUE BELT

1. ADVANCED POSTURE
Blue Belt posture is an upgrade from Yellow Belt PRCH:
- Lower center of gravity — knees bent at 90 degrees minimum during turns.
- Shoulders parallel to the stringer when riding straight (not open or twisted).
- Front arm reaches toward intended direction at all times.
- Back arm stays close to the body, elbow bent, ready for rotation.
- HEAD IS STILL — the head does not bob. It rotates for direction but stays at a consistent height.

2. PUMPING MASTERY
Speed generation through pumping becomes central at Blue Belt:
- TIMING: Compress as the board moves into the trough (bottom of the wave). Extend as the board moves up the face.
- AMPLITUDE: The deeper the compression and the higher the extension, the more speed generated.
- FREQUENCY: Find the rhythm that matches the wave. Every wave has a natural frequency.
- RAIL-TO-RAIL: Pumping is not just up-and-down. It includes rail engagement:
  - On the down-pump (compression), the board is relatively flat.
  - On the up-pump (extension), engage the toe or heel rail slightly for direction.

3. PUMP-TO-TURN CONNECTION
Pumping is not separate from turning — it feeds into turns:
- Generate speed with 2-3 pumps in the pocket.
- Use the last extension (up-pump) as the entry into a turn.
- The speed from pumping gives you the energy needed for powerful turns.
- Without pumping speed, turns are weak and surfing looks "flat."

4. SPEED LINE vs. POWER LINE
- Speed line: the fastest path along the wave (usually higher on the face, in the pocket).
- Power line: the path that generates the most turning power (involves going up and down the face).
- Blue Belt learns to switch between these lines based on what the wave offers.

STANDARD: Student generates visible speed through pumping on 5 consecutive waves. Pumps are knee-driven, timed with the wave, and lead into turns.`,
    order: 80,
  },
  {
    id: 'bb-t02',
    beltLevel: 'blue_belt',
    category: 'theory',
    title: 'Bottom Turn & HOLD',
    subtitle: 'Frontside/backside mechanics, HOLD technique',
    content: `BOTTOM TURN & HOLD

The bottom turn is the most important turn in surfing. It sets up every maneuver.

1. FRONTSIDE BOTTOM TURN
Riding frontside (facing the wave), the bottom turn drives you from the bottom of the wave back up toward the lip:
a) Drop down the wave face with speed (Position 2, front-weighted).
b) At the bottom of the wave, shift to Position 3 (back-weighted).
c) Compress deeply (knees bent, low center of gravity).
d) Engage the TOE rail (lean toward the wave face).
e) Look UP at the lip or pocket where you want to go.
f) Drive the turn with the kinetic chain: eyes → shoulders → hips → board.
g) As you rise up the wave face, EXTEND (straighten legs) for power.

2. BACKSIDE BOTTOM TURN
Riding backside (back to the wave):
a) Drop down the wave face with speed.
b) At the bottom, shift to Position 3.
c) Compress deeply.
d) Engage the HEEL rail (lean back toward the wave face).
e) Look OVER YOUR BACK SHOULDER up at the lip.
f) Reach your back arm toward the lip — this opens the rotation.
g) Drive up the wave face with extension.

Backside bottom turns require MORE head rotation because you cannot see the wave naturally.

3. THE HOLD TECHNIQUE
HOLD is the Blue Belt concept for maximizing the bottom turn:
H = Head: Look at your target (lip, pocket, shoulder) throughout the turn.
O = Open: Open your shoulders and chest toward the wave face.
L = Low: Stay LOW through the entire turn. Do not stand up mid-turn.
D = Drive: Drive through the turn with your back foot and fins.

"HOLD the bottom turn" means: keep your body low, keep your eyes on the target, keep the rail engaged, and drive all the way through the arc — do not exit the turn early.

Common errors:
- "Straightening up" mid-turn (losing compression = losing power).
- Looking at the bottom of the wave instead of the lip (the board goes where you look).
- Flattening the board mid-turn (releasing rail engagement).

STANDARD: Student executes 3 frontside and 3 backside bottom turns with visible HOLD technique. Coach confirms low compression, continuous rail engagement, and eyes on target.`,
    order: 81,
  },
  {
    id: 'bb-t03',
    beltLevel: 'blue_belt',
    category: 'theory',
    title: 'Projection & Direction',
    subtitle: 'Project to lip, pocket, shoulder',
    content: `PROJECTION & DIRECTION

1. WHAT IS PROJECTION?
Projection is where you AIM your bottom turn. The bottom turn is meaningless without a target.

Three primary targets:
a) THE LIP: The top of the breaking wave. Projecting to the lip sets up top turns, snaps, and re-entries.
b) THE POCKET: The steepest part of the wave face. Projecting back to the pocket maintains speed and flow.
c) THE SHOULDER: The unbroken section ahead of the breaking wave. Projecting to the shoulder creates distance and speed.

2. PROJECTING TO THE LIP
- After a bottom turn, drive UP the wave face toward the lip.
- Your eyes must be locked on the lip from the start of the bottom turn.
- The steeper the bottom turn, the more vertical the projection.
- You are building toward top turns and snaps (next skill set).

3. PROJECTING TO THE POCKET
- After a bottom turn, arc BACK toward the pocket instead of going straight up.
- This keeps you in the power zone and maintains flow.
- Used when the wave is long and you need to stay connected.
- Less vertical, more horizontal — a smooth arc back to the power source.

4. PROJECTING TO THE SHOULDER
- After a bottom turn, drive at an angle toward the shoulder (ahead of the break).
- This generates maximum speed and covers the most ground.
- Used when the wave is fast and you need to outrun the breaking section.
- More horizontal than vertical.

5. CHOOSING YOUR PROJECTION
Wave reading determines projection:
- Wave is steep and hollow? → Project to the LIP for a vertical maneuver.
- Wave is long and walling? → Project to the POCKET for flow.
- Wave is fast and running? → Project to the SHOULDER for speed.

Reading the wave and choosing the right projection is the beginning of advanced surfing.

STANDARD: Student executes bottom turns with 3 different projections (lip, pocket, shoulder) across a session. Demonstrates wave-reading to choose appropriate projection.`,
    order: 82,
  },
  {
    id: 'bb-t04',
    beltLevel: 'blue_belt',
    category: 'theory',
    title: 'Named Expressions',
    subtitle: 'Cruz Snap, Grenade, Cruz Cutback (FS); Choke, Tapaloco Snap, Elbow, Tapaloco Cutback (BS)',
    content: `NAMED EXPRESSIONS

Blue Belt introduces specific named maneuvers from the TSS vocabulary.

FRONTSIDE EXPRESSIONS:

1. CRUZ SNAP
A sharp, quick top turn on the frontside:
- Bottom turn with projection to the lip.
- At the lip, compress deeply and rotate shoulders HARD back toward the pocket.
- Back foot drives the tail through the lip — the board pivots.
- Spray flies off the lip from the snap.
- Re-enter the wave face heading back toward the pocket.
Coaching cue: "Quick rotation at the top — snap it like a whip."

2. GRENADE
A powerful, explosive turn on the frontside with maximum spray:
- Bigger bottom turn with more speed.
- At the lip, engage the full kinetic chain with FORCE.
- The rotation is harder and more committed than the Cruz Snap.
- Maximum back-foot pressure to gouge the tail through the turn.
- The goal is power and spray — not finesse.
Coaching cue: "This is your power move. Full commitment, maximum rotation."

3. CRUZ CUTBACK
A smooth, flowing turn that redirects you from the shoulder back to the pocket:
- From the shoulder (too far ahead of the pocket), initiate a frontside turn.
- The turn arcs smoothly 180 degrees back toward the breaking part of the wave.
- Speed is maintained through the arc (no stalling).
- Re-engage the pocket and continue riding.
Coaching cue: "Big, smooth arc. You're drawing a half-circle back to the power."

BACKSIDE EXPRESSIONS:

4. CHOKE
A controlled backside snap at the lip:
- Backside bottom turn with projection to the lip.
- At the lip, look over the back shoulder and rotate.
- Back foot drives the tail through — the board pivots on the heel rail.
- Re-enter heading back toward the pocket.
Coaching cue: "Head rotation is everything on the backside. LOOK at where you want to go."

5. TAPALOCO SNAP
An aggressive backside top turn:
- More speed and power than the Choke.
- Deeper bottom turn, more vertical projection.
- At the lip, the rotation is explosive — back arm reaches behind and down.
- The tail releases more, creating a sharper turn angle.
Coaching cue: "Commit to the rotation. Reach behind you like you're grabbing something."

6. ELBOW
A deep, driving backside turn at the bottom of the wave:
- Instead of projecting up to the lip, this turn stays in the lower third of the wave.
- Deep compression, heel rail engaged, the board arcs at the base of the wave.
- Used to redirect and rebuild speed without going vertical.
- Named for the angular shape of the turn.
Coaching cue: "Stay low, stay in the base. Drive through it like you're leaning on an elbow."

7. TAPALOCO CUTBACK
A backside cutback — arcing from the shoulder back to the pocket:
- Same concept as Cruz Cutback but on the backside.
- Look over the back shoulder, reach the back arm toward the pocket.
- Smooth 180-degree arc on the heel rail.
- Re-engage the pocket and continue.
Coaching cue: "Same as frontside cutback but you have to LOOK harder. Head turns first."

STANDARD: Student can execute at least 4 of the 7 named expressions (minimum 2 frontside, 2 backside) during a session. Each expression is identified by name in the post-session debrief.`,
    order: 83,
  },
  {
    id: 'bb-t05',
    beltLevel: 'blue_belt',
    category: 'theory',
    title: 'Linking & Complete Circles',
    subtitle: 'Full Infinite Circle execution',
    content: `LINKING & COMPLETE CIRCLES

1. THE INFINITE CIRCLE
At Blue Belt, individual turns are linked together to form the "Infinite Circle" — a continuous flow of connected maneuvers from catch to exit.

A complete Infinite Circle on a single wave:
Take-off → Bottom Turn → Top Turn (Snap/Grenade) → Re-entry → Bottom Turn → Cutback → Re-entry → Bottom Turn → Final maneuver → Exit.

The key is that EACH TURN flows directly into the NEXT. There are no flat sections, no dead spots, no disconnected moments.

2. LINKING RULES
- Every bottom turn must have a purpose (projection to lip, pocket, or shoulder).
- Every top turn must redirect you back toward the pocket.
- Speed must be maintained or regenerated between turns (pumping).
- The ride should look like a continuous S-curve down the wave, not a series of separate turns.

3. READING THE WAVE FOR LINKING
Different wave sections require different links:
- Steep section: Bottom turn → Snap/Grenade (vertical).
- Walling section: Bottom turn → Cutback (return to pocket).
- Fast section: Bottom turn → Project to shoulder → Pump for speed.
- Closing section: Final maneuver → Kick-out or close-out re-entry.

4. FLOW vs. POWER
Blue Belt students must understand the balance:
- Flow: smooth, connected, continuous. Looks effortless.
- Power: explosive, committed, forceful. Looks intense.
- The best surfing combines both — flow between turns, power during turns.
- Practice: alternate between a "flow wave" (smooth linking, minimal spray) and a "power wave" (aggressive turns, maximum spray).

5. THE FULL WAVE
The ultimate Blue Belt goal: ride a wave from catch to exit using the full Infinite Circle.
- At least 3 turns linked together.
- Mix of top turns and bottom turns.
- Speed maintained throughout.
- No dead spots or flat sections.
- Exit with a controlled kick-out or final maneuver.

STANDARD: Student links 3+ turns on a single wave with no dead spots. Demonstrates the Infinite Circle concept across 3 waves in a session.`,
    order: 84,
  },

  // ── Drills ──
  {
    id: 'bb-d01',
    beltLevel: 'blue_belt',
    category: 'drill',
    title: 'Bottom Turn Mechanics Drill',
    subtitle: 'Frontside and backside bottom turn practice on land',
    content: `BOTTOM TURN MECHANICS DRILL

PURPOSE: Develop the muscle memory for deep, committed bottom turns.

SETUP: Board on sand, angled slightly downhill if possible. Student in power stance.

EXECUTION — FRONTSIDE:
1. Student drops into a low squat (simulating the drop down the wave face).
2. Coach calls "BOTTOM TURN!"
3. Student shifts to Position 3, engages toes (simulating toe rail).
4. Eyes look UP and to the left/right (where the lip would be).
5. Shoulders open toward the imagined wave face.
6. Hold the compressed, rail-engaged position for 3 seconds.
7. Coach calls "DRIVE!" — student extends upward (simulating projection).
8. 10 repetitions frontside.

EXECUTION — BACKSIDE:
1. Same drop to low squat.
2. On "BOTTOM TURN!" — engage heels (simulating heel rail).
3. Look OVER the back shoulder up toward the imagined lip.
4. Back arm reaches toward the lip.
5. Hold for 3 seconds.
6. On "DRIVE!" — extend upward.
7. 10 repetitions backside.

COACHING CUES:
- "LOWER. You're not low enough. I want your back thigh almost touching your calf."
- "HOLD the rail. Don't flatten the board mid-turn."
- "Eyes UP. You're looking at the sand — that's the flat water. Look UP."

STANDARD: 10 frontside + 10 backside with full compression, rail engagement, and correct eye position.`,
    order: 90,
  },
  {
    id: 'bb-d02',
    beltLevel: 'blue_belt',
    category: 'drill',
    title: 'HOLD Technique Drill',
    subtitle: 'Head-Open-Low-Drive through turns',
    content: `HOLD TECHNIQUE DRILL

PURPOSE: Reinforce the HOLD framework for maintaining power through turns.

SETUP: On land, power stance. Board or line on ground.

EXECUTION:
1. Student simulates a bottom turn approach (drop to low stance).
2. Coach calls each HOLD element:
   - "H — HEAD!" → Student locks eyes on an imagined target above them (lip).
   - "O — OPEN!" → Student opens chest and shoulders toward the imagined wave face.
   - "L — LOW!" → Student drops LOWER — confirming knees are deeply bent.
   - "D — DRIVE!" → Student pushes off the back foot and extends upward toward the target.
3. The full HOLD sequence should take 4-5 seconds.
4. Repeat 10 times frontside, 10 times backside.

COMMON FAILURES:
- Standing up during "L" (losing compression).
- Looking down instead of up during "H" (losing target).
- Closing shoulders during "O" (losing rotation range).
- Weak drive during "D" (no extension, no power delivery).

IN-WATER APPLICATION:
Before each wave, student mentally cues "HOLD" as a pre-turn trigger.
During the bottom turn, run the sequence instinctively: Head-Open-Low-Drive.

STANDARD: Student demonstrates HOLD on land with full range of motion. Applies it on 3 waves with coach confirmation.`,
    order: 91,
  },
  {
    id: 'bb-d03',
    beltLevel: 'blue_belt',
    category: 'drill',
    title: 'Projection Targeting Drill',
    subtitle: 'Practice aiming bottom turns at lip, pocket, and shoulder',
    content: `PROJECTION TARGETING DRILL

PURPOSE: Develop the ability to project bottom turns to three different targets.

SETUP: In the water. Coach on the beach with visual signals.

EXECUTION:
1. Before each wave, coach holds up a card or hand signal:
   - Fist = LIP (project vertically to the top of the wave).
   - Open palm = POCKET (project back to the power zone).
   - Pointing ahead = SHOULDER (project forward, cover distance).
2. Student catches the wave, executes a bottom turn projected to the assigned target.
3. After the wave, coach and student assess: "Did you hit the target?"

SELF-DIRECTED VERSION:
Student reads the wave and CHOOSES the projection based on wave shape:
- Steep section? → Lip.
- Long wall? → Pocket.
- Fast runner? → Shoulder.

COACHING CUES:
- "You're projecting to the pocket on every wave. Try the lip — go VERTICAL."
- "Good speed, but you projected past the shoulder. Read the wave — it was steep enough for the lip."
- "Perfect pocket projection. You stayed connected."

STANDARD: Student hits all 3 projection targets across a session (minimum 2 of each). Can explain why they chose each projection.`,
    order: 92,
  },
  {
    id: 'bb-d04',
    beltLevel: 'blue_belt',
    category: 'drill',
    title: 'Cruz Snap Repetition Drill',
    subtitle: 'Frontside snap at the lip — repetition for consistency',
    content: `CRUZ SNAP REPETITION DRILL

PURPOSE: Build consistency in the frontside snap (Cruz Snap) through high repetition.

SETUP: In the water. Conditions: chest-high or larger waves with a defined lip.

EXECUTION:
1. Catch a wave frontside.
2. Generate speed with 2-3 pumps.
3. Execute a bottom turn projected to the lip.
4. At the lip, execute the Cruz Snap:
   - Compress, rotate shoulders HARD back toward the pocket.
   - Back foot drives the tail through.
   - The board pivots at the lip.
5. Re-enter the wave face and ride out.
6. Repeat — goal is 5 Cruz Snaps in a session.

FOCUS POINTS:
- Speed INTO the snap (no speed = weak snap).
- Rotation TIMING (snap at the lip, not below it, not above it).
- Commitment (half-rotations look bad — commit to the full snap).
- Re-entry (don't lose the wave after the snap — reconnect).

SELF-ASSESSMENT AFTER EACH SNAP:
Rate 1-5:
1 = Didn't make it to the lip
2 = Made it but no rotation
3 = Rotation but lost speed
4 = Good snap but lost the wave after
5 = Full snap, spray, re-entry, continued riding

STANDARD: 5 Cruz Snaps rated 3+ in a session. At least 2 rated 4+.`,
    order: 93,
  },
  {
    id: 'bb-d05',
    beltLevel: 'blue_belt',
    category: 'drill',
    title: 'Cutback Arc Drill',
    subtitle: 'Practice smooth 180-degree cutbacks frontside and backside',
    content: `CUTBACK ARC DRILL

PURPOSE: Develop the smooth, flowing 180-degree arc of the cutback.

SETUP: In the water on longer, walling waves.

EXECUTION:
1. Catch a wave and ride toward the shoulder (away from the pocket).
2. When you've outrun the pocket, initiate the cutback:
   FRONTSIDE (Cruz Cutback):
   - Look back toward the pocket.
   - Shoulders rotate toward the pocket.
   - Engage toe rail, Foot Position 3.
   - Draw a smooth arc — half-circle — back toward the pocket.
   - Re-engage the pocket and continue riding.

   BACKSIDE (Tapaloco Cutback):
   - Look over back shoulder toward the pocket.
   - Back arm reaches toward the pocket.
   - Engage heel rail, Foot Position 3.
   - Draw the same smooth half-circle arc.
   - Re-engage the pocket.

3. The arc should be ROUND, not angular. Think of drawing the letter "C" on the wave.

COACHING CUES:
- "Smooth arc — don't jerk into it."
- "Let the rail do the work. You set the direction, the rail carves the line."
- "Don't straighten up mid-cutback — stay low through the arc."

SELF-ASSESSMENT:
- Was the arc smooth or angular?
- Did you maintain speed through the turn?
- Did you reconnect with the pocket?

STANDARD: 3 frontside + 3 backside cutbacks with smooth arcs and pocket re-engagement.`,
    order: 94,
  },
  {
    id: 'bb-d06',
    beltLevel: 'blue_belt',
    category: 'drill',
    title: 'Link Chain Drill',
    subtitle: 'Connect 3+ turns on a single wave without dead spots',
    content: `LINK CHAIN DRILL

PURPOSE: Practice linking multiple turns together in a continuous flow.

SETUP: In the water on waves that offer enough length for 3+ turns.

EXECUTION:
1. Catch a wave with speed.
2. Turn 1: Bottom turn projected to the lip → Snap or top turn.
3. Turn 2: Drop back down → Bottom turn → Project to pocket or shoulder.
4. Turn 3: Another maneuver (cutback, snap, or speed run).
5. The key: NO DEAD SPOTS between turns. Each turn flows into the next.

COUNTING GAME:
Coach counts turns out loud: "ONE!... TWO!... THREE!..." — each number on a completed turn.
Goal: Hear "THREE" or higher on every wave.

DEAD SPOT TEST:
If the coach sees the student riding flat (no turning, no pumping) for more than 2 seconds between turns, that is a "dead spot." Dead spots break the chain.

COACHING CUES:
- "Don't coast! The moment one turn ends, the next one begins."
- "Think of it as a roller coaster — constant ups and downs."
- "If you're running out of speed, pump between turns to reload."

STANDARD: Student links 3+ turns on 5 waves in a session with no dead spots exceeding 2 seconds.`,
    order: 95,
  },
  {
    id: 'bb-d07',
    beltLevel: 'blue_belt',
    category: 'drill',
    title: 'Backside Power Drill',
    subtitle: 'Choke and Tapaloco Snap focused repetition',
    content: `BACKSIDE POWER DRILL

PURPOSE: Develop power and commitment on backside maneuvers.

SETUP: In the water on waves that allow backside riding. Coach observes from beach or water.

EXECUTION:
Phase 1 — CHOKE (controlled):
1. Catch 5 waves backside.
2. On each wave, execute a backside bottom turn → Choke at the lip.
3. Focus on: head rotation, heel rail engagement, controlled snap.
4. Re-enter and ride out.

Phase 2 — TAPALOCO SNAP (aggressive):
1. Catch 5 more waves backside.
2. On each wave, more speed, deeper bottom turn → Tapaloco Snap.
3. Focus on: commitment, back arm reach, explosive rotation.
4. The difference from Choke: more speed, more aggression, more spray.

PROGRESSION:
- If Chokes are clean: move to Tapaloco.
- If Tapaloco is landing: try linking Tapaloco → Elbow → Tapaloco on a single wave.

COMMON ERRORS:
- Not looking over the shoulder (blind turn = weak turn).
- Straightening up during the turn (losing compression).
- Lifting the front foot (losing board contact — dangerous).

STANDARD: 5 Chokes + 5 Tapaloco Snaps in a session. At least 3 of each rated as "clean" by coach.`,
    order: 96,
  },
  {
    id: 'bb-d08',
    beltLevel: 'blue_belt',
    category: 'drill',
    title: 'Named Expression Quiz Drill',
    subtitle: 'Coach calls maneuver name, student executes it on the next wave',
    content: `NAMED EXPRESSION QUIZ DRILL

PURPOSE: Build the ability to execute named expressions on demand.

SETUP: In the water. Coach on the beach with a whiteboard or verbal call.

EXECUTION:
1. Before each wave, coach calls out a named expression:
   "CRUZ SNAP!" / "GRENADE!" / "CRUZ CUTBACK!" / "CHOKE!" / "TAPALOCO SNAP!" / "ELBOW!" / "TAPALOCO CUTBACK!"
2. Student catches the next wave and attempts the called expression.
3. After the wave, coach provides feedback: Was it the correct expression? Execution quality?
4. Continue for 10-15 waves, randomizing calls.

SCORING:
For each attempt:
- 0 points: Wrong expression or not attempted.
- 1 point: Correct expression but poor execution.
- 2 points: Correct expression with good execution.
- 3 points: Correct expression with excellent execution (would impress in a competition).

GOAL: Score 20+ points in 10 waves.

COACHING CUES:
- "That was a Choke, but I called Cruz Snap — you need to be on the frontside for that."
- "Good Grenade! Full power, full spray."
- "That Elbow was too high on the wave face — remember, Elbow stays in the lower third."

STANDARD: Student correctly identifies and executes 5 of 7 named expressions when called randomly.`,
    order: 97,
  },

  // ── Water Missions ──
  {
    id: 'bb-m01',
    beltLevel: 'blue_belt',
    category: 'mission',
    title: 'Mission 1: Frontside Bottom Turn Series',
    subtitle: '5 deep frontside bottom turns with HOLD technique',
    content: `MISSION 1: FRONTSIDE BOTTOM TURN SERIES

OBJECTIVE: Execute 5 frontside bottom turns with full HOLD technique.

EXECUTION:
1. Catch waves frontside.
2. On each wave, focus on the bottom turn only.
3. Apply HOLD: Head on target, Open shoulders, Low compression, Drive through.
4. Project to the lip after the bottom turn.

SUCCESS CRITERIA (each turn):
- Bottom turn initiated at the bottom of the wave (not mid-face).
- Toe rail clearly engaged.
- Eyes on the lip throughout the turn.
- Compression held through the full arc.
- Extension/drive at the exit of the turn.

REPETITIONS: 5 frontside bottom turns meeting all criteria.`,
    order: 100,
  },
  {
    id: 'bb-m02',
    beltLevel: 'blue_belt',
    category: 'mission',
    title: 'Mission 2: Backside Bottom Turn Series',
    subtitle: '5 deep backside bottom turns with HOLD',
    content: `MISSION 2: BACKSIDE BOTTOM TURN SERIES

OBJECTIVE: Execute 5 backside bottom turns with full HOLD technique.

Same criteria as Mission 1 but backside:
- Heel rail engaged.
- Head looking over back shoulder to the lip.
- Back arm reaching toward the target.
- Full compression through the arc.
- Drive at the exit.

REPETITIONS: 5 backside bottom turns meeting all criteria.`,
    order: 101,
  },
  {
    id: 'bb-m03',
    beltLevel: 'blue_belt',
    category: 'mission',
    title: 'Mission 3: Cruz Snap Certification',
    subtitle: 'Land 5 clean frontside snaps at the lip',
    content: `MISSION 3: CRUZ SNAP CERTIFICATION

OBJECTIVE: Execute 5 clean Cruz Snaps in a single session.

EXECUTION:
1. Catch waves frontside with speed.
2. Bottom turn projected to the lip.
3. At the lip: compress, rotate hard, back foot drives the tail.
4. Re-enter the wave face and continue riding.

SUCCESS CRITERIA:
- Snap occurred AT the lip (not below it).
- Visible spray from the snap.
- Board completed the rotation (not a half-turn).
- Student re-entered the wave and continued riding.
- Self-rated 3+ on the 1-5 scale.

REPETITIONS: 5 clean Cruz Snaps.`,
    order: 102,
  },
  {
    id: 'bb-m04',
    beltLevel: 'blue_belt',
    category: 'mission',
    title: 'Mission 4: Grenade Power Turn',
    subtitle: 'Land 3 explosive power turns with maximum spray',
    content: `MISSION 4: GRENADE POWER TURN

OBJECTIVE: Execute 3 Grenades (explosive frontside power turns).

EXECUTION:
1. Generate maximum speed with pumping.
2. Deep bottom turn with full HOLD.
3. At the lip: FULL commitment, MAXIMUM rotation, POWER through the tail.
4. Spray should be significant.
5. Re-entry not required for this mission — the focus is POWER.

SUCCESS CRITERIA:
- Maximum speed into the turn (visible pumping before bottom turn).
- Deepest bottom turn of the session.
- Explosive rotation at the lip.
- Spray generated.
- Even if you fall after, the Grenade itself was executed.

REPETITIONS: 3 Grenades where the turn itself was fully committed.`,
    order: 103,
  },
  {
    id: 'bb-m05',
    beltLevel: 'blue_belt',
    category: 'mission',
    title: 'Mission 5: Cruz Cutback Flow',
    subtitle: 'Execute 5 smooth cutbacks returning to the pocket',
    content: `MISSION 5: CRUZ CUTBACK FLOW

OBJECTIVE: Execute 5 Cruz Cutbacks with smooth arcs and pocket re-engagement.

EXECUTION:
1. Ride toward the shoulder (outrun the pocket intentionally).
2. Initiate Cruz Cutback — smooth 180-degree arc back to the pocket.
3. Re-engage the pocket and continue riding.

SUCCESS CRITERIA:
- Cutback was initiated when ahead of the pocket (not random).
- Arc was smooth (not angular or jerky).
- Speed maintained through the cutback.
- Successfully re-engaged the pocket after the cutback.
- Continued riding after the re-engagement.

REPETITIONS: 5 Cruz Cutbacks.`,
    order: 104,
  },
  {
    id: 'bb-m06',
    beltLevel: 'blue_belt',
    category: 'mission',
    title: 'Mission 6: Choke Certification',
    subtitle: 'Land 5 backside snaps at the lip',
    content: `MISSION 6: CHOKE CERTIFICATION

OBJECTIVE: Execute 5 clean Chokes (backside snaps) in a session.

Same concept as Cruz Snap but backside:
- Head looks over back shoulder, heel rail engaged, tail driven through at the lip.
- Visible snap and re-entry.

SUCCESS CRITERIA:
- Snap at the lip, backside.
- Head rotation visible.
- Spray generated.
- Re-entered the wave.

REPETITIONS: 5 clean Chokes.`,
    order: 105,
  },
  {
    id: 'bb-m07',
    beltLevel: 'blue_belt',
    category: 'mission',
    title: 'Mission 7: Tapaloco Snap Power',
    subtitle: '3 aggressive backside top turns',
    content: `MISSION 7: TAPALOCO SNAP POWER

OBJECTIVE: Execute 3 Tapaloco Snaps — the aggressive version of the Choke.

More speed, deeper bottom turn, more explosive rotation, more commitment than Choke.

SUCCESS CRITERIA:
- Significantly more speed and power than a Choke.
- Deeper bottom turn with more vertical projection.
- Explosive rotation with back arm reaching behind and down.
- Even if you fall after, the turn itself was fully committed.

REPETITIONS: 3 Tapaloco Snaps.`,
    order: 106,
  },
  {
    id: 'bb-m08',
    beltLevel: 'blue_belt',
    category: 'mission',
    title: 'Mission 8: Tapaloco Cutback',
    subtitle: '3 smooth backside cutbacks',
    content: `MISSION 8: TAPALOCO CUTBACK

OBJECTIVE: Execute 3 Tapaloco Cutbacks (backside cutbacks to the pocket).

EXECUTION:
1. Ride backside, outrun the pocket.
2. Look over back shoulder, reach back arm toward the pocket.
3. Smooth 180-degree arc on the heel rail.
4. Re-engage the pocket.

SUCCESS CRITERIA:
- Smooth arc (not angular).
- Head rotation driving the turn.
- Speed maintained.
- Pocket re-engagement successful.

REPETITIONS: 3 Tapaloco Cutbacks.`,
    order: 107,
  },
  {
    id: 'bb-m09',
    beltLevel: 'blue_belt',
    category: 'mission',
    title: 'Mission 9: Elbow Drive',
    subtitle: '3 deep backside base turns',
    content: `MISSION 9: ELBOW DRIVE

OBJECTIVE: Execute 3 Elbows (deep backside turns in the lower third of the wave).

EXECUTION:
1. Ride backside, drop into the trough.
2. Instead of projecting up, stay LOW.
3. Deep compression, heel rail, angular turn at the base.
4. Redirect and rebuild speed.

SUCCESS CRITERIA:
- Turn stayed in the lower third of the wave (not projected to lip).
- Deep compression maintained.
- Speed rebuilt after the turn.
- Angular, driving shape (not a round cutback — more angular).

REPETITIONS: 3 Elbows.`,
    order: 108,
  },
  {
    id: 'bb-m10',
    beltLevel: 'blue_belt',
    category: 'mission',
    title: 'Mission 10: Three-Turn Link',
    subtitle: 'Link 3 turns on a single wave with no dead spots',
    content: `MISSION 10: THREE-TURN LINK

OBJECTIVE: Link 3 turns on a single wave with continuous flow.

EXECUTION:
1. Catch a wave with speed.
2. Execute 3 turns in sequence with no dead spots (no flat riding > 2 seconds between turns).
3. Turns can be any combination of named expressions.
4. The ride should look like a connected, flowing S-curve.

SUCCESS CRITERIA:
- 3 identifiable turns executed.
- No flat sections exceeding 2 seconds between turns.
- Speed maintained throughout (pumping between turns if needed).
- Controlled exit after the third turn.

REPETITIONS: 5 waves with 3+ linked turns.`,
    order: 109,
  },
  {
    id: 'bb-m11',
    beltLevel: 'blue_belt',
    category: 'mission',
    title: 'Mission 11: Mixed Expression Wave',
    subtitle: 'Combine frontside and backside expressions on the same wave',
    content: `MISSION 11: MIXED EXPRESSION WAVE

OBJECTIVE: Execute both frontside and backside named expressions during a session, demonstrating versatility.

EXECUTION:
1. In a session, catch waves going both left and right.
2. On frontside waves: execute at least 2 different frontside expressions (e.g., Cruz Snap + Cruz Cutback).
3. On backside waves: execute at least 2 different backside expressions (e.g., Choke + Tapaloco Cutback).
4. Post-session, name every expression you executed.

SUCCESS CRITERIA:
- Minimum 2 different frontside expressions executed.
- Minimum 2 different backside expressions executed.
- Student can correctly name each expression after the session.
- Overall session demonstrates versatility (not just one move repeated).

REPETITIONS: Session complete when criteria are met (typically 10-15 waves).`,
    order: 110,
  },
  {
    id: 'bb-m12',
    beltLevel: 'blue_belt',
    category: 'mission',
    title: 'Mission 12: Pump-to-Power Sequence',
    subtitle: 'Generate speed through pumping, then deliver a powerful turn',
    content: `MISSION 12: PUMP-TO-POWER SEQUENCE

OBJECTIVE: Demonstrate the pump-to-turn connection on 5 waves.

EXECUTION:
1. Catch a wave.
2. Pump 3 times to generate maximum speed.
3. Use the speed to execute a powerful turn (any named expression).
4. The power of the turn should clearly reflect the speed generated.

SUCCESS CRITERIA:
- 3 visible pumps before the turn.
- The turn was noticeably more powerful than a non-pumped turn.
- Speed was maintained into and through the turn.

REPETITIONS: 5 pump-to-power sequences.`,
    order: 111,
  },
  {
    id: 'bb-m13',
    beltLevel: 'blue_belt',
    category: 'mission',
    title: 'Mission 13: Infinite Circle Attempt',
    subtitle: 'Execute the full Infinite Circle on a wave',
    content: `MISSION 13: INFINITE CIRCLE ATTEMPT

OBJECTIVE: Execute the fullest possible Infinite Circle on 3 waves.

EXECUTION:
1. Catch a wave with maximum speed.
2. Execute the Infinite Circle: continuous linked turns from catch to exit.
3. Goal: maximum number of turns, continuous flow, no dead spots.
4. Exit with a controlled kick-out or final maneuver.

SUCCESS CRITERIA:
- 4+ turns linked on a single wave.
- No dead spots exceeding 2 seconds.
- Mix of top turns, bottom turns, and cutbacks.
- Speed maintained throughout.
- Controlled exit.

REPETITIONS: 3 Infinite Circle waves with 4+ turns each.`,
    order: 112,
  },
  {
    id: 'bb-m14',
    beltLevel: 'blue_belt',
    category: 'mission',
    title: 'Mission 14: Blue Belt Session',
    subtitle: '45-minute independent session demonstrating all Blue Belt skills',
    content: `MISSION 14: BLUE BELT SESSION

OBJECTIVE: 45-minute independent session demonstrating complete Blue Belt mastery.

EXECUTION:
1. Student completes venue analysis, enters water, surfs for 45 minutes independently.
2. During the session:
   - Pumping for speed on every wave.
   - Bottom turns with HOLD technique (frontside and backside).
   - Named expressions executed (minimum 4 different ones).
   - Linking 3+ turns on at least 5 waves.
   - Cutbacks used when outrunning the pocket.
   - Varied projection targets (lip, pocket, shoulder).
3. Coach observes — no intervention except safety.
4. Post-session debrief with:
   - Student names every expression they executed.
   - Self-assessment: strongest expression, weakest expression.
   - Goal for next session.

SUCCESS CRITERIA:
- Minimum 12 waves caught in 45 minutes.
- Minimum 4 named expressions demonstrated.
- 5+ waves with 3+ linked turns.
- Both frontside and backside riding.
- Speed generation through pumping on every wave.
- Self-assessment demonstrates advanced self-coaching awareness.

This mission marks BLUE BELT COMPLETION READINESS.`,
    order: 113,
  },

  // ── Diagnostic Framework ──
  {
    id: 'bb-diag01',
    beltLevel: 'blue_belt',
    category: 'theory',
    title: 'Diagnostic Framework',
    subtitle: 'Block-based troubleshooting for self-correction',
    content: `DIAGNOSTIC FRAMEWORK — BLUE BELT

When something goes wrong in your surfing, use this block-based diagnostic approach to identify and fix the problem.

BLOCK 1: SPEED
Problem: "My turns feel weak and powerless."
Diagnosis: Not enough speed entering the turn.
Fix: Pump 2-3 more times before initiating the bottom turn. Speed is the fuel for everything.

BLOCK 2: BOTTOM TURN
Problem: "I can't reach the lip" or "My top turns happen mid-face."
Diagnosis: Shallow bottom turn. Not enough arc, not enough compression.
Fix: Apply HOLD — go lower, look higher, hold the rail longer. The bottom turn determines the top turn.

BLOCK 3: COMMITMENT
Problem: "I pull back at the last second" or "My turns look half-finished."
Diagnosis: Commitment failure. Fear or hesitation is overriding technique.
Fix: Set an intention BEFORE the wave: "I will complete this snap no matter what." Accept that you might fall. Falling while fully committed is better than pulling back.

BLOCK 4: ROTATION
Problem: "My board doesn't turn enough" or "I'm stuck going in one direction."
Diagnosis: Kinetic chain failure. One of the links (eyes → shoulders → hips → board) is breaking.
Fix: Which link is failing?
- Eyes not rotating? → "Look harder."
- Shoulders not following? → "Open your chest, lead with the front arm."
- Hips locked? → "Let your hips follow your shoulders."
- Board not responding? → "More back-foot pressure, engage the fins."

BLOCK 5: WAVE READING
Problem: "I keep choosing the wrong section" or "The wave closes out on me."
Diagnosis: Poor wave reading. You are reacting instead of anticipating.
Fix: Before each wave, scan the entire wave face. Ask: "Where will this wave be in 3 seconds?" Surf to WHERE the wave is going, not where it IS.

BLOCK 6: LINKING
Problem: "I do one good turn and then the wave dies" or "I can't connect turns."
Diagnosis: Dead spots. You are pausing between turns instead of flowing.
Fix: The moment one turn ends, the next begins. There is no "rest" on the wave. If you need to reload speed, PUMP — don't cruise flat.

HOW TO USE:
After a session, identify your biggest problem. Find the block. Apply the fix in the next session. This is how you self-coach.

STANDARD: Student can diagnose their own surfing using the block framework and prescribe the correct fix for at least 3 different issues.`,
    order: 115,
  },

  // ── Mental Tools ──
  {
    id: 'bb-mt01',
    beltLevel: 'blue_belt',
    category: 'mental',
    title: 'Mental Tools — Blue Belt',
    subtitle: 'Self-improvement 3 questions, composure, self-correction',
    content: `MENTAL TOOLS — BLUE BELT

1. THE THREE QUESTIONS
After every session, ask yourself three questions:
Q1: "What did I do well?" — Identify at least 2 specific things.
Q2: "What needs improvement?" — Identify at least 1 specific thing.
Q3: "What will I focus on next session?" — Set ONE specific goal.

This creates a continuous improvement loop:
Surf → Assess → Identify → Plan → Surf again with intention.

Do NOT skip this. The three questions are as important as the surfing itself. Without reflection, you practice habits — not improvement.

2. COMPOSURE UNDER PRESSURE
Blue Belt introduces higher-pressure situations: bigger waves, faster sections, crowded lineups.

Composure means:
- Maintaining technique even when conditions are challenging.
- Not rushing turns when the wave is fast (trust your speed).
- Not freezing when the wave is big (trust your structure).
- Breathing through high-intensity moments (return to breath navigation).

How to build composure:
- Deliberately surf one level above your comfort zone for short periods.
- Example: If you're comfortable in waist-high waves, surf a session in chest-high.
- The discomfort builds composure. Retreat to comfort, then push again.
- Over time, what was "challenging" becomes "comfortable."

3. SELF-CORRECTION IN REAL TIME
Blue Belt introduces the ability to correct mistakes MID-RIDE (not just post-wave).

The self-correction loop:
a) Notice: "That bottom turn was shallow."
b) Adjust: "I'll go lower on the next one."
c) Execute: Deeper compression on the next bottom turn within the same wave.

This requires AWARENESS while surfing (not just going through the motions). The diagnostic framework (6 blocks) becomes an internal checklist that runs in the background while you ride.

Advanced mental skill: "Surfing in two layers"
- Layer 1: The body surfs (physical execution, muscle memory).
- Layer 2: The mind observes (real-time assessment, correction signals).

Most surfers only operate on Layer 1. Blue Belt begins training Layer 2.

4. ACCEPTANCE AND ADAPTATION
Not every wave goes as planned. Blue Belt teaches:
- Accept the wave you got, not the wave you wanted.
- If the wave is worse than expected, adapt your plan (go for flow instead of power).
- If the wave is better than expected, seize the opportunity (go for your best expression).
- Rigidity kills surfing. Adaptability elevates it.

STANDARD: Student completes the Three Questions after every session (logged in journal or with coach). Demonstrates at least 1 self-correction mid-ride during a session. Shows composure in conditions one level above comfort zone.`,
    order: 120,
  },
];

// ═══════════════════════════════════════════════════════════
// COMBINED MATERIALS ARRAY
// ═══════════════════════════════════════════════════════════

export const STUDENT_MATERIALS: BeltMaterial[] = [
  ...WHITE_BELT_MATERIALS,
  ...YELLOW_BELT_MATERIALS,
  ...BLUE_BELT_MATERIALS,
];

// Helper: get materials accessible by a student given their belt training level
// and their admin-granted access levels
export function getMaterialsForStudent(
  beltLevel: BeltLevel,
  unlockedLevels: BeltLevel[]
): { unlocked: BeltMaterial[]; locked: BeltMaterial[] } {
  const accessLevels = new Set([beltLevel, ...unlockedLevels]);

  const unlocked: BeltMaterial[] = [];
  const locked: BeltMaterial[] = [];

  for (const mat of STUDENT_MATERIALS) {
    if (accessLevels.has(mat.beltLevel)) {
      unlocked.push(mat);
    } else {
      locked.push(mat);
    }
  }

  // Sort by order within each group
  unlocked.sort((a, b) => a.order - b.order);
  locked.sort((a, b) => a.order - b.order);

  return { unlocked, locked };
}
