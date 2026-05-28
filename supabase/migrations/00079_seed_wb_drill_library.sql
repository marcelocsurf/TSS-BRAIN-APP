-- M79 — Seed canonical Land Drill + Water Mission library for WB STPs.
--
-- Source: TSS_BEGINNER_CAMP_WB_MANUAL v2.0 + WB Master Manual Parts 7-B
-- (Camp Drills CDR-WB-XX) + 8-B (Camp Missions CMS-WB-XX).
--
-- Targets the 14 most-used WB STPs (the ones referenced by SVC-CAMP-BEG's
-- 51 blocks). Each STP gets 1-3 canonical drills (out-of-water) + 1-2
-- canonical missions (in-water). The TemplateBuilderForm picker shows
-- these grouped under each STP.
--
-- Idempotent — ON CONFLICT (id) DO NOTHING — re-runs are safe and
-- existing rows untouched.

INSERT INTO drills_missions
  (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_name, display_order, active)
VALUES

-- ─── STP-001 · Venue Analysis ──────────────────────────────────────
('MIS-WB-001-A','STP-001','Group Venue Read','mission','10','1',
  ARRAY['safe zone','6 risk factors','go/no-go'],
  E'Read the spot as a group. Coach guides. 5 min of silent observation, then identify safe zone + hazards. Apply the 6 risk factors (wave size · current · crowd · my body · forecast · local knowledge). 2+ negative = no-go.',
  ARRAY['Safe zone named','Hazards listed','Go/no-go call made'],
  'white','Pre-water · Venue Analysis',1,true),

-- ─── STP-002 · Warm Up ─────────────────────────────────────────────
('DRL-WB-002-A','STP-002','Head-to-toe Dynamic Warm-Up','drill','10','1',
  ARRAY['mobility','activation','breath'],
  E'Joint-by-joint mobility (ankles → knees → hips → shoulders → neck) → muscle activation (core, posterior chain, scapular) → pattern simulation (cobra + pop-up + posture) → 3-5 deep breaths close.',
  ARRAY['All joints moved','Visible cobra simulation','Breath connection at end'],
  'white','Pre-water · Warm-Up',1,true),
('DRL-WB-002-B','STP-002','Unnatural Animal Warm-Up (Kids)','drill','10','1',
  ARRAY['playful','full body','animal walks'],
  E'Bear walks · crab walks · frog jumps · seal slides. Keep it playful. 30 sec each, 2-3 rounds. Targets the same full-body activation as Head-to-toe but engages kids.',
  ARRAY['Engaged kids','Visible full-body movement','No injuries'],
  'white','Pre-water · Warm-Up',2,true),

-- ─── STP-006 · Control Your Board (board recovery) ──────────────────
('DRL-WB-006-A','STP-006','Pool Board Control Recovery','drill','8','8',
  ARRAY['leash retrieval','remount','calm hands'],
  E'Pool drill. Dismount + push board away → pull it back via leash → remount finding sweet spot → repeat 8 times. Builds calm under board separation.',
  ARRAY['Calm during separation','Smooth leash retrieval','Clean remount'],
  'white','Pool · Board Recovery',1,true),

-- ─── STP-007 · Go Through Whitewater Standing ──────────────────────
('MIS-WB-007-A','STP-007','Board Control Through Whitewater','mission','20',NULL,
  ARRAY['TAIL + CENTER','board between you and open water','calm exit'],
  E'Enter water carrying the board safely. Pass through whitewater while maintaining control. Turn around safely. Exit calmly.',
  ARRAY['Walks out without dropping board','Passes 2+ whitewater walls standing','Turns and walks back without panic'],
  'white','Water · Sequence 1',1,true),

-- ─── STP-010 · Find Sweet Spot ─────────────────────────────────────
('DRL-WB-010-A','STP-010','Pool Sweet Spot Discovery','drill','5','5',
  ARRAY['board floats level','sweet spot','prone stability'],
  E'Pool drill. Mount the board, find the center where it floats level (nose neither sinks nor pops up). Adjust forward/back 1-2 times until found. Hold prone position.',
  ARRAY['Board floats level (no rail-sink)','Sweet spot found in 1-2 adjustments','Stable prone position'],
  'white','Pool · Sweet Spot',1,true),
('MIS-WB-010-A','STP-010','Sweet Spot + Catch','mission','20',NULL,
  ARRAY['sweet spot first','align with whitewater','commit'],
  E'Get on the board · find sweet spot · align with whitewater · paddle to catch · apply cobra · turn left/right while lying · dismount safely.',
  ARRAY['Sweet spot in 1-2 attempts','1+ whitewater wave caught','Cobra + turn lying intentional'],
  'white','Water · Sequence 2',1,true),

-- ─── STP-012 · Paddle to Catch ─────────────────────────────────────
('DRL-WB-012-A','STP-012','Pool Paddling V1-V4','drill','15','4',
  ARRAY['head still','legs together','elbow high'],
  E'Pool drill. Practice 4 paddling speeds: V1 cruising (30-40%) · V2 working (50-60%) · V3 catching (70-80%) · V4 sprint (90-100%). Keep head still, legs together, push water backward not down.',
  ARRAY['Head stays still','Legs together (no drag)','All 4 speeds attempted'],
  'white','Pool · Paddling',1,true),

-- ─── STP-015 · Cobra Pick Line ─────────────────────────────────────
('DRL-WB-015-A','STP-015','Cobra + Pick Line Land Sim','drill','10','6',
  ARRAY['eyes forward','verbalize line','commit before pop-up'],
  E'Land simulation. From prone → push into cobra (chest up, elbows under shoulders) → look LEFT or RIGHT → verbalize "going left/right" audibly → hold 2 seconds. Trains the visual commit before pop-up.',
  ARRAY['Eyes forward (not at board)','Audible line commit','Hold 2+ sec'],
  'white','Land · Cobra',1,true),
('MIS-WB-015-A','STP-015','Cobra + Pick Line + Rotation','mission','30',NULL,
  ARRAY['line before pop-up','eyes lead','chest over front foot'],
  E'In water. Cobra + Pick Your Line BEFORE the pop-up. Add rotation — first backside, then frontside. 1-4 crossings per side. Eyes lead the turn · chest over/ahead of the front foot.',
  ARRAY['Line verbalized in cobra','Pop-up matches chosen direction','Visible rotation via eyes + obliques + hips'],
  'white','Water · Sequence 3+',1,true),

-- ─── STP-016 · Pop-Up ──────────────────────────────────────────────
('DRL-WB-016-A','STP-016','Pop-Up on Mat (2-sec hold)','drill','10','8',
  ARRAY['hips low','center foot','2-sec hold'],
  E'Mat drill. From cobra → pop-up to power stance → hold for 2 seconds. 8 reps + 1 standing on one foot (focus on front foot weight). Breathe deeply, especially exhale.',
  ARRAY['Pop-up to power stance in ~2s','Stance 2+ sec without wobble','Front foot near board center (FP2)'],
  'white','Land · Pop-Up',1,true),
('DRL-WB-016-B','STP-016','Skateboard Mount/Dismount','drill','8','6',
  ARRAY['control before movement','stance match','clean tail landing'],
  E'Skateboard drill. Stand on side of board → front foot on front truck → shift weight → step back foot on tail → step down. Repeat 6+6. Match the stance you use on the surfboard.',
  ARRAY['Mounts in correct stance','Back foot lands clean on tail','Dismounts in control'],
  'white','Land · Skateboard',2,true),
('MIS-WB-016-A','STP-016','Pop-Up + Power Stance','mission','30',NULL,
  ARRAY['effort over success','starfish every ride','2-sec hold'],
  E'In water. After cobra, pick the line · execute pop-up · land feet in FP2 (center) · hold power stance · apply impulse if speed drops · starfish dismount.',
  ARRAY['Attempts pop-up on every catch','Stance held 2+ sec when achieved','Starfish dismount at end of every ride'],
  'white','Water · Sequence 3',1,true),

-- ─── STP-017 · Feet Position Center #2 (FP2) ───────────────────────
('DRL-WB-017-A','STP-017','FP2 Foot Position Land Drill','drill','8','8',
  ARRAY['front foot center','rails level','no rail-sink'],
  E'Land simulation. Pop-up landing both feet centered along the board axis (FP2). Check: both rails imagined level, weight 60% front / 40% back. 8 reps.',
  ARRAY['Feet land FP2 consistently','Both rails imagined level','60/40 weight distribution'],
  'white','Land · FP2',1,true),
('MIS-WB-017-A','STP-017','Center Feet + Board Connection','mission','20',NULL,
  ARRAY['FP2','both rails level','2-sec stance'],
  E'In water. Place feet in center of board (FP2). Connect with the board. Feel both rails level — neither sinking nor lifting.',
  ARRAY['Feet land FP2 consistently','Both rails level (no rail-sink visible)','Power stance held 2+ sec'],
  'white','Water · FP2',1,true),

-- ─── STP-018 · Power Stance / Posture ──────────────────────────────
('DRL-WB-018-A','STP-018','Power Stance Arrows Drill','drill','8','8',
  ARRAY['back straight','chest open','knees flexed','eyes forward'],
  E'Land drill. Hold the canonical power stance: back straight · head up · chest open + scapular activation · 60/40 weight · knees flexed · hands active · eyes forward. Coach calls "Arrow!" → student snaps into stance. 8 reps.',
  ARRAY['Back straight','Chest open','Knees flexed','Eyes forward, head still'],
  'white','Land · Power Stance',1,true),

-- ─── STP-019 · Impulso ─────────────────────────────────────────────
('DRL-WB-019-A','STP-019','Impulse 4 Phases on Flat','drill','8','6',
  ARRAY['compress','reach','push','extend'],
  E'Flat surface or skateboard. Practice the 4 phases of impulse: 1) Compress — flex knees deeply, lower center · 2) Reach — both hands to water · 3) Push — push water backward · 4) Extend — drive body forward.',
  ARRAY['4 phases visible','Initiates without prompt when speed drops','Speed visibly increases after cycle'],
  'white','Land · Impulse',1,true),
('MIS-WB-019-A','STP-019','Full Sequence + Impulse','mission','30',NULL,
  ARRAY['decision layer','impulse without prompt','full chain'],
  E'In water. Catch aligned · Cobra + Pick Line · Pop-Up · FP2 · Power Stance · Impulse when speed drops · Starfish Dismount.',
  ARRAY['Full chain attempted each catch','Impulse initiated WITHOUT coach prompt','Stance + impulse + dismount in sequence'],
  'white','Water · Sequence 3 full',1,true),

-- ─── STP-021 · Turn Backside ───────────────────────────────────────
('DRL-WB-021-A','STP-021','Backside Rotation No Skate','drill','10','4',
  ARRAY['eyes lead','obliques + hips + ankles','stance preserved'],
  E'Flat surface. Pop-up → hold stance → follow coach hand with eyes + neck (4 reps). Then engage obliques + hips + ankles (4 reps). Add unstable surface (mat) for weight shifting. 8 reps total.',
  ARRAY['Eyes lead the turn (not feet)','Obliques + hips + ankles engaged','Stance preserved through rotation'],
  'white','Land · Rotation',1,true),
('MIS-WB-021-A','STP-021','Backside Turn in Water','mission','30',NULL,
  ARRAY['cobra first','eyes lead','chest over front foot'],
  E'In water. After cobra + pick line + pop-up → initiate backside rotation. Eyes lead → chest follows → hips → board responds. Hold stance through rotation.',
  ARRAY['Eyes initiated rotation','Chest over/ahead of front foot','Stance preserved'],
  'white','Water · Backside Turn',1,true),

-- ─── STP-022 · Turn Frontside ──────────────────────────────────────
('DRL-WB-022-A','STP-022','Skateboard Rotation Crossover','drill','15','6',
  ARRAY['eyes lead','chest over front foot','cones'],
  E'Skateboard drill with cones. Frontside rotation 4-8 reps per person → backside same. If time: crossover (rotate + impulse + ride straight).',
  ARRAY['Eyes lead','Chest over/ahead of front foot','Stance preserved'],
  'white','Land · Skate Rotation',1,true),
('MIS-WB-022-A','STP-022','Frontside Turn in Water','mission','30',NULL,
  ARRAY['cobra first','eyes lead','chest over front foot'],
  E'In water. After cobra + pick line + pop-up → initiate frontside rotation. Same kinetic chain: eyes → chest → hips → board.',
  ARRAY['Eyes initiated rotation','Chest over/ahead of front foot','Stance preserved'],
  'white','Water · Frontside Turn',1,true),

-- ─── STP-024 · Turtle Roll ─────────────────────────────────────────
('DRL-WB-024-A','STP-024','Pool Turtle Roll (8 steps)','drill','8','6',
  ARRAY['fins up 2s','grab rails','stay calm'],
  E'Pool drill. The 8 canonical steps: 1) Read whitewater direction · 2) Align nose against wave · 3) Cobra before impact · 4) Flip board fins up · 5) Grab rails, elbows on board · 6) Stay calm · 7) Punch + scissor kick · 8) Flip back, climb on, paddle.',
  ARRAY['Board flips fully (fins up 2+ sec)','Does not lose grip on rails','Returns to sweet spot ready to paddle'],
  'white','Pool · Turtle Roll',1,true),
('MIS-WB-024-A','STP-024','Align → Roll → Control → Turn → Catch','mission','30',NULL,
  ARRAY['successful roll','board control','intentional catch'],
  E'In water. Align with whitewater · execute successful turtle roll · maintain board control · turn lying or seated · re-align with wave · catch.',
  ARRAY['1+ successful turtle roll','Board control after the roll','Intentional turn + alignment to catch'],
  'white','Water · Sequence 5 prep',1,true)

ON CONFLICT (id) DO NOTHING;
