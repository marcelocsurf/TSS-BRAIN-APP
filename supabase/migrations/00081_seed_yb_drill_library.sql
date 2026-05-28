-- M81 — Yellow Belt Camp Drill + Mission library.
--
-- Source: YB_CAMP_MODALITY_INVENTORY_v1.pdf (Marcelo, 2026-05-27).
-- Origin: Novice TSS ingles pptx (81 slides) — extracted verbatim.
--
-- 20 Camp Drills (CDR-YB-01..20) + 14 Camp Missions (CMS-YB-01..14).
-- belt='yellow'. Linked to existing STP-006 through STP-034 (YB
-- inherits all WB STPs + adds 027-034).
--
-- Idempotent — ON CONFLICT (id) DO NOTHING.

INSERT INTO drills_missions
  (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_name, display_order, active)
VALUES

-- ─── DRILLS ────────────────────────────────────────────────────────

('CDR-YB-01','STP-016','Pop-Up + Power Stance (Flat Surface)','drill','10','8',
  ARRAY['stability before speed','hips low before release','breath: exhale stabilizes'],
  E'Land · Mat / simulated board. Clean technical pop-up immediately connected to a stable power stance. Cobra → pop-up continuity · hand placement at rib height · front-foot placement · head up / eyes forward · lower hips before releasing the board · activate stable power stance. 8 reps + 1 extra rep standing on one foot (front-foot focus). Coach Cue: "Breathe deeply, especially exhaling. Lack of oxygen affects the nervous system."',
  ARRAY['Pop-up clean and connected to power stance','Hips low before release','Power stance stable for 2+ sec'],
  'yellow','Land · Pop-Up + Power Stance · Day 1',1,true),

('CDR-YB-02','STP-016','Pop-Up + Balance (Unstable Surface)','drill','8','8',
  ARRAY['micro-adjustments','exhale to stabilize','nervous system'],
  E'Land · Board over rolled mat. Develop balance and control by simulating rail instability similar to the water. Same technical pop-up · micro-adjustments for balance · conscious breathing · nervous system regulation under instability. Coach Cue: "Lack of breathing creates instability. Breathing is part of technique."',
  ARRAY['Micro-adjustments visible','Conscious exhale','Stance held on unstable surface'],
  'yellow','Land · Pop-Up Unstable · Day 1',2,true),

('CDR-YB-03','STP-006','Skateboard Mount / Dismount (YB)','drill','8','6',
  ARRAY['control before movement','weight transfer','safe entry'],
  E'Land · Skateboard. Get on and off the board safely, calmly, with awareness. Weight-board relationship · safe board entry · weight transfer to front foot · control before movement. 6+6 reps (mount + dismount). Coach Cue: "Never rush the entry. Control first, movement second."',
  ARRAY['Mounts safely without rushing','Weight transfers cleanly','Dismounts in control'],
  'yellow','Land · Skateboard · Day 1',3,true),

('CDR-YB-04','STP-019','Skateboard Push & Brake','drill','8','6',
  ARRAY['front foot = accelerator','back foot = brake','start-stop control'],
  E'Land · Skateboard. Introduce brake + accelerator concept outside the water. Front foot pressure = accelerator · back foot pressure = brake · start-stop control · flow with safety. 6 reps. Coach Cue: "The board responds to where you place your weight, not to force."',
  ARRAY['Brake + accelerator distinct','Smooth start-stop','Weight controls speed'],
  'yellow','Land · Skateboard · Day 1',4,true),

('CDR-YB-05','STP-018','Skateboard Straight-Line Stance','drill','6','6',
  ARRAY['active stance','shoulder-hip-board alignment','exhale moving'],
  E'Land · Skateboard. Consolidate a biomechanically stable stance while moving. Shoulder-hip-board alignment · knee flexion · open chest (scapular activation) · exhale while moving forward. 6 reps. Coach Cue: "An active stance is a living stance."',
  ARRAY['Shoulders-hips-board aligned','Knees flexed','Audible exhale forward'],
  'yellow','Land · Skateboard · Day 1',5,true),

('CDR-YB-06','STP-019','Skateboard Impulse Generation (YB)','drill','8','6',
  ARRAY['flex → reach → push','intentional speed','recover with control'],
  E'Land · Skateboard or flat. Generate speed intentionally when the board slows. Flex knees, reach both hands to the water, push backward to regain speed and stability. 4 phases: compress · reach · push · extend. Coach Cue: "Impulse every time you are losing speed."',
  ARRAY['4 phases visible','Intentional speed recovery','Initiates without prompt'],
  'yellow','Land · Skateboard · Day 1',6,true),

('CDR-YB-07','STP-021','Rotation on Land (eye lead + obliques)','drill','10','8',
  ARRAY['rotation from eyes','obliques + hips + ankles','centered foot'],
  E'Land · Stable + optional unstable. Rotation as a result of vision + kinetic chain activation. Rotation initiated from the eyes · activation of neck, torso, obliques, hips, ankles · relationship between centered front foot and board response. 8 reps (4 per side). Optional unstable surface for rail transitions. Coach Cue: "If the foot is not centered, the board does not rotate."',
  ARRAY['Eyes initiate rotation','Obliques + hips engaged','Front foot stays centered'],
  'yellow','Land · Rotation · Day 1',7,true),

('CDR-YB-08','STP-022','Skateboard Rotation BS/FS Crossing (YB)','drill','12','6',
  ARRAY['turn starts at the top','chest over front foot','controlled directional changes'],
  E'Land · Skateboard. Apply rotational concepts in real movement. Frontside + backside rotation · chest control over the front foot · smooth, controlled directional changes. Setup with cones to define practice area. 4-8 reps per side. Coach Cue: "The turn starts at the top and travels down."',
  ARRAY['Frontside + backside rotated','Chest over front foot','Smooth direction changes'],
  'yellow','Land · Skateboard Rotation · Day 1',8,true),

('CDR-YB-09','STP-010','Pool Sweet Spot Discovery (YB)','drill','5','4',
  ARRAY['sweet spot first','prone balance','calm water sim'],
  E'Pool · Day 2 Pool Lesson 1. Pool-based version of Sweet Spot — correct prone balance in calm water. Explain board center + correct on/off · demo · students practice finding sweet spot · coach observes and feedback. Coach Cue: "Sweet spot before anything else. Without it, nothing else works."',
  ARRAY['Sweet spot found in 1-2 tries','Prone balance steady','Mount/dismount clean'],
  'yellow','Pool · Day 2',9,true),

('CDR-YB-10','STP-010','Pool Sitting Position','drill','2','3',
  ARRAY['center first','hands on rails','seated balance'],
  E'Pool · Day 2. Teach how to sit on the board, find center, hold the rails. Explain seated posture (center + hands on rails) · instructor demo · students sit and return to sweet spot · feedback. Coach Cue: "Center first. Hold the rails. Find the seated balance point."',
  ARRAY['Seated balance held','Hands on rails','Returns to sweet spot'],
  'yellow','Pool · Day 2',10,true),

('CDR-YB-11','STP-013','Pool Seated Turns + Pivot','drill','5','4',
  ARRAY['weight back','hand on rail','legs draw circles'],
  E'Pool · Day 2. Turn while seated using pivot technique. Explain pivot turn (weight back + pivot) · one hand on rail + legs draw circles · practice continuously · feedback. Coach Cue: "Weight back, hand on rail, legs draw circles."',
  ARRAY['Pivot executes either side','Weight stays back','Returns to neutral'],
  'yellow','Pool · Day 2',11,true),

('CDR-YB-12','STP-027','Pool Paddling V1-V4 (FULL Canon)','drill','15','4',
  ARRAY['head still','legs together','match speed to situation'],
  E'Pool · Day 2. Master the 4 canonical paddling speeds. THIS IS FULL CANON YB CONTENT (STP-027), not preview. V1 Cruising 30-40% · V2 Working 50-60% · V3 Catching 70-80% · V4 Sprint 90-100%. Keep head still · legs together (no drag) · push water backward. Coach Cue: "Match the speed to the situation. V4 is for emergencies — don\'t paddle V4 all the time." Note: original pptx had 3 speeds. Corrected per Canon STP-027.',
  ARRAY['All 4 speeds attempted','Head stays still','Legs together (no drag)'],
  'yellow','Pool · Paddling · Day 2',12,true),

('CDR-YB-13','STP-024','Pool Turtle Roll (YB depth)','drill','8','6',
  ARRAY['fins up 2s','hold rails','stay calm'],
  E'Pool · Day 2 · Safety LAYER. Master turtle roll at YB depth. Align board nose with whitewater direction · practice keeping fins facing up 2 seconds then return to sweet spot · 5-8 reps + feedback. Coach Cue: "Stay calm. The whitewater will pass. Hold the board. Climb back on."',
  ARRAY['Fins up 2+ sec','Hands stay on rails','Returns to sweet spot ready to paddle'],
  'yellow','Pool · Turtle Roll · Day 2',13,true),

('CDR-YB-14','STP-024','Pool Real-Life Scenario Simulation (YB)','drill','20','1',
  ARRAY['listen','react','execute'],
  E'Pool · Integration · Day 2. Integrate multiple skills under real-time coach instruction. Coach gives varied rapid cues (V2! V3! Turtle roll! Sweet spot! Pivot!) · students respond fluidly · continuous 15-20 min. Coach Cue: "Listen, react, execute. The ocean doesn\'t pause."',
  ARRAY['Responds to cues without hesitation','Switches between skills fluidly','Integration visible'],
  'yellow','Pool · Integration · Day 2',14,true),

('CDR-YB-15','STP-030','Pop-Up + FP1/FP2 Transitions + Rotations','drill','10','5',
  ARRAY['FP1 for maneuver','FP2 for stability','choose consciously'],
  E'Land · Day 3 · NEW YB. Master stance transitions and practice rotations in both directions with FP1/FP2 conscious choice. Pop-up + hold 2 sec · Transition 1: foot to FP1 (tail) → frontside then backside rotation · Transition 2: shift to FP2 (center) → generate momentum → return to FP1 · 5 reps fluid + controlled. Coach Cue: "FP1 for maneuver. FP2 for stability. Choose consciously."',
  ARRAY['FP1 ↔ FP2 transitions smooth','Both rotations executed','Conscious choice visible'],
  'yellow','Land · FP Transitions · Day 3',15,true),

('CDR-YB-16','STP-022','Skateboard Crossing BS/FS (YB depth)','drill','10','4',
  ARRAY['torso + obliques','active stance','direction change'],
  E'Land · Skateboard · Day 3. Practice crossing BS and FS with stable, active stance. Each student performs 2 reps to backside, then 2 reps to frontside. Focus on turning using torso and obliques.',
  ARRAY['2 reps backside','2 reps frontside','Torso + obliques drive turn'],
  'yellow','Land · Skateboard · Day 3',16,true),

('CDR-YB-17','STP-031','Wave Simulation Top-to-Bottom Flow','drill','10','5',
  ARRAY['up the face, down the face','wave breathes','match its rhythm'],
  E'Land · Skateboard · Day 3 · NEW YB. Simulate riding a wave face from top to bottom with rail-to-rail transitions. Students simulate being on a wave · fluid transitions between backside and frontside · shift from one rail to the other as if going down and up the wave · repeat. Coach Cue: "Up the face, down the face. The wave breathes — match its rhythm." Note: prepares student for STP-031 Go Up and Down (Day 5 mission).',
  ARRAY['Rail-to-rail transitions visible','Up-and-down rhythm','Fluid changes'],
  'yellow','Land · Skateboard Flow · Day 3',17,true),

('CDR-YB-18','STP-028','Guided Visualization + Return to Pocket','drill','7','1',
  ARRAY['return to source','identify the pocket','no speed → return'],
  E'Mental · Land · Day 4 · NEW YB tactical. Visualize specific movements + reinforce habit of returning to the pocket. Guide students through visualization · imagine themselves on a wave · mentally identify the pocket · visualize how to return to it after a maneuver · quiet environment to enhance focus. Coach Cue: "Every time you feel no speed, return to the source."',
  ARRAY['Quiet focused environment','Pocket identified mentally','Return path visualized'],
  'yellow','Mental · Visualization · Day 4',18,true),

('CDR-YB-19','STP-015','Chalk-Line Full-Chain Land Simulation (YB)','drill','15','5',
  ARRAY['cobra → pick → pop → rotate → impulse','one movement','each piece flows'],
  E'Land · Chalk line on floor · Day 4. Land simulation of the full YB chain on a marked line. Pop-up drill (2-sec hold) · Simulation following chalk line: Cobra + Pick Your Line (verbal commit) · Pop-up (2-sec hold) · Rotation with FP1/FP2 transition · Impulse. Coach Cue: "Each piece flows into the next. Cobra — pick — pop — rotate — impulse. One movement."',
  ARRAY['Audible line commit','Pop-up + rotation chained','Impulse closes the chain'],
  'yellow','Land · Chalk Line · Day 4',19,true),

('CDR-YB-20','STP-016','Personal Priority Out-of-Water Drill','drill','10','1',
  ARRAY['one objective','one focus','one drill'],
  E'Land · Individual · Day 5. Support the personal objective from the self-organization process. Address main limitation identified · reinforce the specific part of the sequence · prepare body and mind before water · 5-10 min per student. Key idea: train what matters most today. One objective. One focus. One drill.',
  ARRAY['Personal limitation addressed','5-10 min focused work','Body + mind prepared'],
  'yellow','Land · Individual · Day 5',20,true),

-- ─── MISSIONS ──────────────────────────────────────────────────────

('CMS-YB-01','STP-006','Control My Board','mission','20',NULL,
  ARRAY['board is a tool','intention','pass whitewater controlled'],
  E'"Control the board using the hands. Maneuver the board with intention. Pass through whitewater while maintaining control." Key concept: the board is a tool, not something that drags me. Integrates STP-006, 007, 008.',
  ARRAY['Hands control the board','Passes whitewater with control','Board never trapped'],
  'yellow','Water · Day 1',1,true),

('CMS-YB-02','STP-010','Sweet Spot + Alignment + Wave Catch','mission','25',NULL,
  ARRAY['sweet spot first','align before paddling','body-board-wave'],
  E'"Find the sweet spot. Align with the whitewater. Catch the wave. Cobra position. Turn right / left. Controlled dismount." Key concept: body-board-wave relationship. Integrates STP-010, 011, 012, 013, 014, 025.',
  ARRAY['Sweet spot found in 1-2 tries','Aligned before paddling','Cobra + directional turn'],
  'yellow','Water · Day 1',2,true),

('CMS-YB-03','STP-016','Technical Pop-Up + Power Stance','mission','30',NULL,
  ARRAY['stability before speed','clean pop-up','star-fall'],
  E'"Stable technical pop-up. Clear power stance. Star-fall dismount." Key concept: stability before speed. Integrates STP-015, 016, 018, 020.',
  ARRAY['Clean pop-up','Power stance clear','Star-fall every ride'],
  'yellow','Water · Day 1',3,true),

('CMS-YB-04','STP-017','Front Foot Lands in the Center (FP2)','mission','20',NULL,
  ARRAY['FP2','stable base','longitudinal control'],
  E'"Precise foot placement in the center. Balance and longitudinal control." Key concept: a stable base creates control. Integrates STP-017.',
  ARRAY['Front foot lands FP2','Both rails level','Longitudinal balance held'],
  'yellow','Water · Day 1',4,true),

('CMS-YB-05','STP-019','Brake & Accelerator Control','mission','20',NULL,
  ARRAY['active speed control','intentional impulse','brake + accelerator'],
  E'"Move forward and backward on the board. Apply braking pressure. Apply acceleration pressure. Add impulse intentionally." Key concept: active speed control. Integrates STP-019.',
  ARRAY['Forward/back weight shift','Intentional impulse','Speed control visible'],
  'yellow','Water · Day 1',5,true),

('CMS-YB-06','STP-021','Backside Cobra+PickLine+BS Rotation','mission','30',NULL,
  ARRAY['cobra first','pick line','TIME principle'],
  E'"Cobra → Pick Line → Backside rotation." TIME principle (STP-034) named explicitly. Integrates STP-015, 021, 034.',
  ARRAY['Cobra applied','Audible line commit','Backside rotation initiated'],
  'yellow','Water · Day 2',6,true),

('CMS-YB-07','STP-022','Frontside Cobra+PickLine+FS Rotation','mission','30',NULL,
  ARRAY['cobra first','pick line','TIME principle'],
  E'"Cobra → Pick Line → Frontside rotation." TIME principle named. Integrates STP-015, 022, 034.',
  ARRAY['Cobra applied','Audible line commit','Frontside rotation initiated'],
  'yellow','Water · Day 2',7,true),

('CMS-YB-08','STP-019','Rotation + Impulse Combined','mission','30',NULL,
  ARRAY['chain','momentum','no breaks'],
  E'"Cobra + Pick Line + Rotation + Momentum." Integrates STP-019, 021, 022.',
  ARRAY['Full chain executed','Momentum sustained','No breaks in flow'],
  'yellow','Water · Day 2',8,true),

('CMS-YB-09','STP-024','Align → Roll → Control → Turn → Catch','mission','30',NULL,
  ARRAY['standing NOT required','prone focus','5-step chain'],
  E'"Board alignment with whitewater. Turtle roll. Maintain board control. Turn while lying or sitting. Align with wave or whitewater. Catch." Standing up NOT required. Focus on prone phases. Integrates STP-011, 024, 006, 013, 025, 012.',
  ARRAY['1+ successful turtle roll','Board control after roll','Intentional catch'],
  'yellow','Water · Day 3',9,true),

('CMS-YB-10','STP-028','Find the Pocket (Chase + Paddle Angle)','mission','30',NULL,
  ARRAY['seek the pocket','paddle angle','position to catch'],
  E'"Seek the pocket of the wave. Choose the best paddling angle. Position yourself to catch the wave." Integrates STP-028, 029.',
  ARRAY['Pocket identified before paddling','Angle adjusted','Position is competitive'],
  'yellow','Water · Day 4',10,true),

('CMS-YB-11','STP-034','Catch + Cobra + Pick Line = TIME','mission','30',NULL,
  ARRAY['scan entire wave','pocket as reference','breathe + stay calm'],
  E'"Catch the wave. Perform cobra. Choose your line immediately." Coach Tips: Scan entire wave · identify where it breaks first · use the pocket as reference · if the pocket moves, you move · breathe, stay calm, keep composure. Integrates STP-012, 015, 034.',
  ARRAY['Wave scanned before catching','Line picked immediately','Composure under pressure'],
  'yellow','Water · Day 4',11,true),

('CMS-YB-12','STP-031','Top to Bottom (Go Up and Down)','mission','30',NULL,
  ARRAY['surf the face','stay close to pocket','external × internal = line'],
  E'"Surf the face of the wave from top to bottom while staying close to the pocket." Canon-grade principle: External × Internal = sustained line. Integrates STP-031, 028.',
  ARRAY['Up-and-down line visible','Stays close to pocket','Sustained ride'],
  'yellow','Water · Day 5',12,true),

('CMS-YB-13','STP-028','Hold Near the Pocket (alt Day 5)','mission','30',NULL,
  ARRAY['hold position','stay in power zone','impulse to recover'],
  E'"Hold your position near the pocket. Stay in the power zone for as many seconds as possible. Use impulse to recover if you drift out." Integrates STP-028, 019.',
  ARRAY['Holds position 5+ sec','Recovers via impulse','Stays in power zone'],
  'yellow','Water · Day 5 (alt)',13,true),

('CMS-YB-14','STP-027','Full YB Sequence Application','mission','45',NULL,
  ARRAY['self-selected objective','greatest session impact','full YB chain'],
  E'"The mission is to execute their objectives. These objectives are self-selected, allowing each surfer to choose the goal that will have the greatest impact on their session." Green wave deployment if conditions safe and student WB-completed. Integrates all 8 YB STPs (027-034).',
  ARRAY['Self-selected objective stated','Full chain attempted','Honest self-evaluation after'],
  'yellow','Water · Day 6',14,true)

ON CONFLICT (id) DO NOTHING;
