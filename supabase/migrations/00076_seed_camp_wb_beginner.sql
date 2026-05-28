-- M76 — Seed the Beginner Camp (White Belt) 6-day plan into the existing
-- SVC-CAMP-BEG template.
--
-- Source: TSS_BEGINNER_CAMP_WB_MANUAL.pdf v2.0 EN (2026-05-27),
-- Canon-Aligned to Core Canon v8.1 + WB Master Manual v1. IP: Marcelo
-- Castellanos / Enkrateia. Every block below is taken verbatim from that
-- manual — no invented content. Drills/missions/routines use the
-- canonical IDs (CDR-WB-XX · CMS-WB-XX · CRT-WB-XX). Steps reference the
-- existing lessons.id (STP-001 .. STP-025) when they exist; otherwise the
-- block is anchored by drill_custom / mission_custom text.
--
-- Day 6 final block is the bridge into the existing camp evaluation flow
-- (`/camps/[id]/evaluate`). The coach reads the manual → runs the
-- mission → ends the camp by submitting the 25-STP self-evaluation
-- (≥18/25 to graduate WB per WB Exit Test).
--
-- Idempotent: deletes prior days/blocks for this template, then re-inserts.

BEGIN;

-- 0. Refresh the template metadata + description.
UPDATE camp_templates SET
  template_name = 'Surf Camp Beginner (White Belt)',
  level_name    = 'Beginner',
  duration_days = 6,
  description   = 'TSS Beginner Camp · White Belt · 6 days · Canon-Aligned to Core Canon v8.1. Coach is Director (1:4 ratio max). Belt Value: Humility. Student rides whitewater (Stage 4) — green waves are Yellow Belt. Source: TSS_BEGINNER_CAMP_WB_MANUAL v2.0.'
WHERE id = 'SVC-CAMP-BEG';

-- 1. Wipe prior plan for this template (idempotent re-seed).
DELETE FROM camp_template_blocks
  WHERE template_day_id IN (
    SELECT id FROM camp_template_days WHERE template_id = 'SVC-CAMP-BEG'
  );
DELETE FROM camp_template_days WHERE template_id = 'SVC-CAMP-BEG';

-- 2. Days.
INSERT INTO camp_template_days
  (id, template_id, day_number, venue_default, ocean_condition_target, day_goal, day_notes, evaluation_focus)
VALUES
  ('SVC-CAMP-BEG-D1', 'SVC-CAMP-BEG', 1, 'beach',
    'Whitewater (Stage 4) · small spilling waves · safe zone confirmed',
    'First Contact — open the camp, introduce Sequences #1 (Board Control), #2 (Sweet Spot), #3 (Pop-Up) at low intensity. Establish notebook + safety + Humility anchor.',
    'Day 1 opens the Belt Value of Humility. Coach is Director — wave-by-wave instruction, IN the water, 1:4 ratio max. Effort over success.',
    'Did the student TRY? Did they understand the goal of each sequence? Where did control break (one specific point per sequence)?'),

  ('SVC-CAMP-BEG-D2', 'SVC-CAMP-BEG', 2, 'beach',
    'Whitewater (Stage 4) · workable conditions for full Cobra→Pop-Up→Impulse→Dismount chain',
    'Pop-Up consolidation + Rotation intro. Integrate the full chain: Catch → Cobra → Pop-Up → Center foot → Stance → Impulse → Dismount. Preview rotation biomechanics.',
    'Formal Bhastrika starts today. Rotation introduced as preview of Seq #4 — Pop-Up remains the priority.',
    'Feet land in FP2? Both rails level? Power stance held 2+ seconds? Impulse initiated by student without coach prompt?'),

  ('SVC-CAMP-BEG-D3', 'SVC-CAMP-BEG', 3, 'beach',
    'Whitewater (Stage 4) · conditions suitable for Cobra + Pick Line + BS/FS rotation. Pool available for Lesson 1.',
    'Rotation in water (Backside + Frontside). Introduce 8-step canonical Turtle Roll (STP-024). Refine sweet spot + paddling V1–V4 + turtle roll in Pool Lesson 1.',
    'Visualization formally introduced today (CRT-WB-02). Turtle Roll is introduced at WB, mastered at YB — expect understanding, not consistency.',
    'Cobra + line verbalized before pop-up? Eyes led the rotation? Stance held through rotation? Turtle roll attempted with calm?'),

  ('SVC-CAMP-BEG-D4', 'SVC-CAMP-BEG', 4, 'beach',
    'Whitewater (Stage 4) · safe area for full chain: align → roll → control → turn → catch',
    'Ocean application of pool work + wave theory. Full sequence: paddle in → turtle roll → turn → align with whitewater → catch. Wave anatomy + types + stages (1-4) + surf etiquette.',
    'Standing up is NOT required for CMS-WB-07. Focus is prone/paddle phases. WB remains in Stage 4 (Canon §2.2 + §3.4).',
    'Turtle roll succeeded (board flipped fully, rails held, returned to sweet spot)? Alignment intentional? Catch intentional or accidental?'),

  ('SVC-CAMP-BEG-D5', 'SVC-CAMP-BEG', 5, 'beach',
    'Whitewater (Stage 4) · conditions for individual personal-priority work. Pool available for Lesson 2.',
    'Personal focus day. Each student picks ONE element to refine (pop-up, rotation, turtle roll, impulse, etc.). Pool Lesson 2: paddling V1–V4, board recovery, swimming/floating safety. Theory: currents + lost-board protocol.',
    'Coach validates each student personal mission · stays focused on that single element · avoids corrections on others.',
    'Did the student select ONE specific element? Did they demonstrate improvement on the chosen element by end of session? Honest notebook reflection?'),

  ('SVC-CAMP-BEG-D6', 'SVC-CAMP-BEG', 6, 'beach',
    'Whitewater (Stage 4) · final application in real conditions. No green waves (Canon §2.2).',
    'Application + Evaluation + Ceremony. Run the full WB sequence (all 25 STPs) in whitewater. Coach evaluates which STPs each student demonstrates. Notebook self-evaluation. Diploma + group photo + closing Humility anchor.',
    'Closing phrase: "The ocean does not negotiate with egos." White Belt is complete in whitewater. Green waves begin Yellow Belt.',
    'WB Exit Test threshold: student must demonstrate at least 18 of 25 STPs to graduate White Belt. Submit final evaluations via /camps/[id]/evaluate.');

-- 3. Blocks — one per teaching unit, ordered as the manual prescribes.
--    pilar enum is restricted to (technical|physical|tactical|mental);
--    safety is a LAYER, expressed via is_safety_layer=true (Canon §2.3).

-- ─── DAY 1 — First Contact ───────────────────────────────────────
INSERT INTO camp_template_blocks
  (id, template_day_id, block_order, pilar, is_safety_layer, pilar_part,
   mission, drill_name, mission_time, repetitions_default,
   warm_up, simulation, mental_hack, evaluation_focus,
   step_id, drill_custom, mission_custom)
VALUES
  ('SVC-CAMP-BEG-D1-B01','SVC-CAMP-BEG-D1', 1,'mental',  false,
    'Welcome + Belt Value anchor: Humility',
    'Open the camp · introduce the TSS method · name Humility as the Belt Value of the camp · "Errors are signals, not failures."',
    'CRT-WB-06 · Day Opening (Humility)','5',1,
    NULL,NULL,'Humility opening',NULL,
    NULL,'CRT-WB-06 (opening variant)','Welcome / opening ritual'),

  ('SVC-CAMP-BEG-D1-B02','SVC-CAMP-BEG-D1', 2,'technical', true,
    'Safety Rules + Communication Signals + Star-Fall + Leash Discipline',
    'Master 3 voice signals · 3 hand signals · Star-Fall protocol · leash always attached · board never between you and the wave.',
    'PC-001 · Safety + Communication Signals','10',1,
    NULL,NULL,NULL,'Did the student demonstrate all 3 voice + 3 hand signals?',
    NULL,'PC-001 (Pre-Course)',NULL),

  ('SVC-CAMP-BEG-D1-B03','SVC-CAMP-BEG-D1', 3,'technical', false,
    'Goofy or Regular detection',
    'Use the gentle-push or Michael-Jackson lean method to identify each student stance. Record in notebook (permanent for the camp).',
    'Stance detection method','5',2,
    NULL,NULL,NULL,NULL,
    NULL,'Stance detection (gentle push + Michael Jackson lean)',NULL),

  ('SVC-CAMP-BEG-D1-B04','SVC-CAMP-BEG-D1', 4,'tactical', false,
    'Group Venue Analysis (CRT-WB-05)',
    '5 minutes silent observation. Identify safe zone · hazards · go/no-go via 6 risk factors. Students write observations in notebook.',
    'CRT-WB-05 · Venue Analysis (group)','10',1,
    NULL,NULL,NULL,'Coach call: go / no-go based on 6 risk factors. 2+ negative = no-go.',
    'STP-001','CRT-WB-05 (group variant)',NULL),

  ('SVC-CAMP-BEG-D1-B05','SVC-CAMP-BEG-D1', 5,'physical', false,
    'Group Warm-Up (CRT-WB-04)',
    'Surf-specific warm-up: mobility activation · muscle activation · pattern simulation (cobra + pop-up + posture) · breath connection.',
    'CRT-WB-04 · TSS Warm-Up Flow','10',1,
    'mobility · core · scapular','cobra + pop-up patterns','breath connection',NULL,
    'STP-002','DRL-WB-02 (TSS Warm-Up Flow)',NULL),

  ('SVC-CAMP-BEG-D1-B06','SVC-CAMP-BEG-D1', 6,'technical', false,
    'Water Mission 1 — Board Control (Seq #1)',
    'Enter the water carrying the board safely. Pass through whitewater while maintaining control. Turn around safely. Exit calmly. Success: walks out + 2+ whitewater walls standing + turns/walks back without panic.',
    'EDPF cycle per student','20',NULL,
    NULL,NULL,'One correction per attempt',
    'Walked out without dropping? TAIL + CENTER hand position? Turned around safely (board not between student and wave)?',
    'STP-007','EDPF coach loop','CMS-WB-01 · Board Control'),

  ('SVC-CAMP-BEG-D1-B07','SVC-CAMP-BEG-D1', 7,'technical', false,
    'Water Mission 2 — Sweet Spot + Catch (Seq #2)',
    'Get on board · find sweet spot · align with whitewater · paddle to catch · apply cobra · turn left/right while lying · dismount safely. Success: sweet spot in 1–2 attempts · catches 1+ whitewater wave · cobra+turn intentional.',
    'EDPF cycle per student','20',NULL,
    NULL,NULL,NULL,
    'Sweet spot in 1–2 attempts? Aligned before paddling? Committed to catching?',
    'STP-012','EDPF coach loop','CMS-WB-02 · Sweet Spot + Catch'),

  ('SVC-CAMP-BEG-D1-B08','SVC-CAMP-BEG-D1', 8,'technical', false,
    'Water Mission 3 — Pop-Up + Power Stance (Seq #3)',
    'After cobra, pick the line · execute pop-up · land feet in FP2 (center) · hold power stance · apply impulse if speed drops · starfish dismount. Success: attempts pop-up every catch · stance 2+ sec when achieved · starfish at end of every ride.',
    'EDPF cycle per student','30',NULL,
    NULL,NULL,'Effort over success on Day 1',
    'Attempted pop-up on every catch? Held posture (any seconds)? Exited with Starfish?',
    'STP-016','EDPF coach loop','CMS-WB-03 · Pop-Up + Power Stance'),

  ('SVC-CAMP-BEG-D1-B09','SVC-CAMP-BEG-D1', 9,'technical', false,
    'Drill Block — Pop-Up on Flat Surface + Skateboard',
    '5 drills back-to-back: (1) Pop-Up + Power Stance on mat (8 reps + 1 single-leg). (2) Skateboard Mount/Dismount CDR-WB-01 (6+6). (3) Skateboard Push/Stop CDR-WB-02 (6). (4) Skateboard Straight-Stance Ride CDR-WB-03 (6). (5) Practicing Impulse CDR-WB-04 (4 phases until mastered).',
    'CDR-WB-01..04 + DRL-WB-16/18','30',8,
    NULL,'pop-up mat + skateboard','Breath connection — exhaling stabilizes',
    'Pop-up to power stance in ~2s · stance 2+ sec without wobble · impulse 4 phases visible',
    'STP-018','CDR-WB-01..04 (drill block)',NULL),

  ('SVC-CAMP-BEG-D1-B10','SVC-CAMP-BEG-D1',10,'mental',  false,
    'Day Closing (CRT-WB-06) — anchor Humility',
    '"Today was about Safety · Control · Solid Fundamentals · Confidence. Humility in action: errors are signals, not failures. Tomorrow we deepen the pop-up and introduce rotation." Notebook entry: 1 win · 1 fail · 1 observation.',
    'CRT-WB-06 · Day Closing','10',1,
    NULL,NULL,'Humility anchor',NULL,
    NULL,'CRT-WB-06 (Humility anchor)',NULL);

-- ─── DAY 2 — Pop-Up Consolidation + Rotation Intro ──────────────
INSERT INTO camp_template_blocks
  (id, template_day_id, block_order, pilar, is_safety_layer, pilar_part,
   mission, drill_name, mission_time, repetitions_default,
   warm_up, simulation, mental_hack, evaluation_focus,
   step_id, drill_custom, mission_custom)
VALUES
  ('SVC-CAMP-BEG-D2-B01','SVC-CAMP-BEG-D2', 1,'mental', false,
    'Bhastrika Breathing (CRT-WB-01) — formal introduction',
    '30 reps: deep nasal inhale · sharp active exhale · presence. End with 30 seconds silent observation. Goal: focus, regulate nervous system, prepare body & mind.',
    'CRT-WB-01 · Bhastrika','5',30,
    NULL,NULL,'Bhastrika 30 reps',NULL,
    NULL,'CRT-WB-01 (Bhastrika protocol)',NULL),

  ('SVC-CAMP-BEG-D2-B02','SVC-CAMP-BEG-D2', 2,'physical', false,
    'Warm-Up (CRT-WB-04)',
    'Re-enter the body zone: mobility · coordination · mental focus. Same protocol as Day 1.',
    'CRT-WB-04 · TSS Warm-Up Flow','10',1,
    'mobility','cobra + pop-up patterns',NULL,NULL,
    'STP-002','DRL-WB-02 (TSS Warm-Up Flow)',NULL),

  ('SVC-CAMP-BEG-D2-B03','SVC-CAMP-BEG-D2', 3,'technical', false,
    'Sequence Simulation on Land (6 reps)',
    'Dry simulation of the full chain: cobra · pop-up · FP2 · power stance · impulse (compress + reach + push + extend). Motor memory before water.',
    'Land sequence simulation','10',6,
    NULL,'land sequence',NULL,NULL,
    NULL,'Land sequence (6 reps)',NULL),

  ('SVC-CAMP-BEG-D2-B04','SVC-CAMP-BEG-D2', 4,'tactical', false,
    'Group Venue Analysis (CRT-WB-05)',
    'Today go/no-go question: "Can we safely execute Cobra + Pick Line + Pop-Up + Stance + Impulse + Dismount in today conditions?"',
    'CRT-WB-05 · Venue Analysis','8',1,
    NULL,NULL,NULL,NULL,
    'STP-001','CRT-WB-05 (group variant)',NULL),

  ('SVC-CAMP-BEG-D2-B05','SVC-CAMP-BEG-D2', 5,'technical', false,
    'Water Mission — CMS-WB-04 · Center Feet + Board Connection',
    'Place feet in center of board (FP2). Connect with the board. Feel both rails level — neither sinking nor lifting. Success: feet FP2 consistently · both rails level · power stance 2+ sec.',
    'EDPF cycle per student','20',NULL,
    NULL,NULL,'One correction per ride',
    'Feet land in FP2? Rails level? Power stance 2+ seconds?',
    'STP-017','EDPF coach loop','CMS-WB-04 · Center Feet + Board Connection'),

  ('SVC-CAMP-BEG-D2-B06','SVC-CAMP-BEG-D2', 6,'technical', false,
    'Water Mission — CMS-WB-05 · Full Sequence + Impulse',
    'Catch aligned · Cobra + Pick Line · Pop-Up · FP2 · Power Stance · Impulse when speed drops · Starfish Dismount. Success: full chain attempted each catch · impulse initiated WITHOUT coach prompt · stance + impulse + dismount in sequence.',
    'EDPF cycle per student','30',NULL,
    NULL,NULL,'Decision-making layer',
    'Full chain executed? Impulse applied without prompt? Visible speed increase?',
    'STP-019','EDPF coach loop','CMS-WB-05 · Full Sequence + Impulse'),

  ('SVC-CAMP-BEG-D2-B07','SVC-CAMP-BEG-D2', 7,'technical', false,
    'Rotation Drill 1 — No Skateboard (DRL-WB-21/22)',
    'Pop-up → hold stance → follow coach hand with eyes + neck (4 per side). Then engage obliques + hips + ankles (4 per side). Add unstable surface (mat) to practice weight shifting. 8 reps total.',
    'DRL-WB-21 · Backside Rail Change + DRL-WB-22 · Frontside Rail Change','10',8,
    NULL,'pop-up mat',NULL,
    'Eyes lead the turn (not feet)? Obliques + hips + ankles engaged? Stance preserved?',
    'STP-021','DRL-WB-21/22 (rail change drills)',NULL),

  ('SVC-CAMP-BEG-D2-B08','SVC-CAMP-BEG-D2', 8,'technical', false,
    'Rotation Drill 2 — Skateboard (CDR-WB-05)',
    'Cones mark the practice area. Frontside rotation 4–8 reps per person · then backside 4–8 reps. If time: crossover (rotate + impulse + ride straight). Chest over/ahead of the front foot.',
    'CDR-WB-05 · Skateboard Rotation','15',6,
    NULL,'skateboard',NULL,
    'Eyes lead · chest over/ahead of front foot · stance preserved',
    'STP-022','CDR-WB-05 (Skateboard rotation)',NULL),

  ('SVC-CAMP-BEG-D2-B09','SVC-CAMP-BEG-D2', 9,'mental', false,
    'Day Closing (CRT-WB-06)',
    '"Today we refined the pop-up and introduced rotation. Tomorrow we take rotation into the water and learn the turtle roll. Humility today means accepting that rotation feels strange at first." Notebook entry.',
    'CRT-WB-06 · Day Closing','5',1,
    NULL,NULL,'Humility brief mention',NULL,
    NULL,'CRT-WB-06 (closing)',NULL);

-- ─── DAY 3 — Rotation in Water + Pool Lesson 1 ──────────────────
INSERT INTO camp_template_blocks
  (id, template_day_id, block_order, pilar, is_safety_layer, pilar_part,
   mission, drill_name, mission_time, repetitions_default,
   warm_up, simulation, mental_hack, evaluation_focus,
   step_id, drill_custom, mission_custom)
VALUES
  ('SVC-CAMP-BEG-D3-B01','SVC-CAMP-BEG-D3', 1,'mental', false,
    'Bhastrika Breathing (CRT-WB-01)',
    '30 reps standard protocol. 30 seconds silent observation to close.',
    'CRT-WB-01 · Bhastrika','5',30,
    NULL,NULL,'Bhastrika 30 reps',NULL,
    NULL,'CRT-WB-01 (Bhastrika)',NULL),

  ('SVC-CAMP-BEG-D3-B02','SVC-CAMP-BEG-D3', 2,'mental', false,
    'Visualization (CRT-WB-02) — formal introduction',
    'After Bhastrika: eyes closed · visualize complete sequence from before entering water · imagine catching waves + working the challenging parts · activate all senses (color, sound, smell, sensations) · 3 minutes.',
    'CRT-WB-02 · Visualization','5',1,
    NULL,NULL,'Visualization · 3 min',NULL,
    NULL,'CRT-WB-02 (Visualization protocol)',NULL),

  ('SVC-CAMP-BEG-D3-B03','SVC-CAMP-BEG-D3', 3,'physical', false,
    'Warm-Up (CRT-WB-04)',
    'Standard warm-up.',
    'CRT-WB-04 · TSS Warm-Up Flow','10',1,
    'mobility','cobra + pop-up patterns',NULL,NULL,
    'STP-002','DRL-WB-02 (TSS Warm-Up Flow)',NULL),

  ('SVC-CAMP-BEG-D3-B04','SVC-CAMP-BEG-D3', 4,'tactical', false,
    'Venue Analysis — Student-Led Variant (CRT-WB-05)',
    'Each student observes 3 min · writes safe zone + hazards + personal plan · coach reviews each plan · coach confirms / adjusts go/no-go. Student takes the lead; coach validates (Director role with increasing student autonomy).',
    'CRT-WB-05 · Venue Analysis (student-led)','10',1,
    NULL,NULL,NULL,NULL,
    'STP-001','CRT-WB-05 (student-led variant)',NULL),

  ('SVC-CAMP-BEG-D3-B05','SVC-CAMP-BEG-D3', 5,'technical', false,
    'Water Mission — CMS-WB-06 · Cobra + Pick Line + BS/FS Rotation',
    'Cobra + Pick Your Line BEFORE the pop-up. Add rotation — first backside, then frontside. 1–4 crossings per side (adjust to skill + conditions). Eyes lead the turn · chest over/ahead of the front foot.',
    'EDPF cycle per student','30',NULL,
    NULL,NULL,'Verbalize line in cobra (audible commit)',
    'Verbalized line before pop-up? Pop-up matched chosen direction? Visible rotation via eyes+obliques+hips?',
    'STP-015','EDPF coach loop','CMS-WB-06 · Cobra + Pick Line + Rotation'),

  ('SVC-CAMP-BEG-D3-B06','SVC-CAMP-BEG-D3', 6,'tactical', false,
    'Theory · Turtle Roll (STP-024) · 8 Canon Steps',
    '8 steps: (1) read whitewater direction · (2) align nose against wave · (3) cobra before impact · (4) flip board fins up · (5) grab rails, elbows on board · (6) stay calm · (7) punch + scissor kick · (8) flip back, climb on, paddle. Introduced at WB · mastered at YB.',
    'Turtle Roll theory · 8 canonical steps','15',1,
    NULL,NULL,'"Stay calm. The whitewater will pass."',NULL,
    'STP-024','Turtle Roll · 8-step Canon procedure',NULL),

  ('SVC-CAMP-BEG-D3-B07','SVC-CAMP-BEG-D3', 7,'technical', false,
    'Pool Lesson 1 — Fundamentals (CDR-WB-06..09)',
    '5 pool drills: (1) Find Sweet Spot CDR-WB-06 (5 min). (2) Sitting + Turning CDR-WB-07 (2+5 min). (3) Paddling V1-V4 — Canon-corrected from "3 speeds" (15 min). (4) Turtle Roll CDR-WB-08 (5–8 reps). (5) Real-Life Scenario CDR-WB-09 (15–20 min).',
    'CDR-WB-06..09 (Pool 1 block)','30',8,
    NULL,'pool',NULL,
    'Board floats level · sweet spot in 1–2 adjustments · turtle roll fins up 2+ sec · V1-V4 attempted',
    'STP-010','CDR-WB-06..09 (Pool 1 block)',NULL),

  ('SVC-CAMP-BEG-D3-B08','SVC-CAMP-BEG-D3', 8,'mental', false,
    'Day Closing (CRT-WB-06)',
    '"Today we brought rotation into the ocean and learned the turtle roll. Tomorrow we deepen ocean theory and apply everything. Humility today is accepting that the turtle roll takes time to feel natural — some get it today, most by Day 5. That is the process."',
    'CRT-WB-06 · Day Closing','5',1,
    NULL,NULL,'Humility brief mention',NULL,
    NULL,'CRT-WB-06 (closing)',NULL);

-- ─── DAY 4 — Ocean Application + Wave Theory ────────────────────
INSERT INTO camp_template_blocks
  (id, template_day_id, block_order, pilar, is_safety_layer, pilar_part,
   mission, drill_name, mission_time, repetitions_default,
   warm_up, simulation, mental_hack, evaluation_focus,
   step_id, drill_custom, mission_custom)
VALUES
  ('SVC-CAMP-BEG-D4-B01','SVC-CAMP-BEG-D4', 1,'physical', false,
    'Bhastrika + Warm-Up',
    'CRT-WB-01 Bhastrika (30 reps) + CRT-WB-04 group warm-up.',
    'CRT-WB-01 + CRT-WB-04','15',1,
    'mobility','cobra + pop-up patterns','Bhastrika 30 reps',NULL,
    'STP-002','CRT-WB-01 + CRT-WB-04',NULL),

  ('SVC-CAMP-BEG-D4-B02','SVC-CAMP-BEG-D4', 2,'mental', false,
    'Visualization + Physical Simulation (CRT-WB-02)',
    'Students visualize today mission specifically (align → roll → control → turn → catch) before stepping onto sand.',
    'CRT-WB-02 · Visualization','5',1,
    NULL,'land sequence','Visualization · 3 min',NULL,
    NULL,'CRT-WB-02 (Visualization)',NULL),

  ('SVC-CAMP-BEG-D4-B03','SVC-CAMP-BEG-D4', 3,'tactical', false,
    'Group Venue Analysis (CRT-WB-05)',
    'Standard procedure. Confirm safe area for full chain align→roll→control→turn→catch.',
    'CRT-WB-05 · Venue Analysis','10',1,
    NULL,NULL,NULL,NULL,
    'STP-001','CRT-WB-05 (group variant)',NULL),

  ('SVC-CAMP-BEG-D4-B04','SVC-CAMP-BEG-D4', 4,'technical', false,
    'Water Mission — CMS-WB-07 · Align → Roll → Control → Turn → Catch',
    'Each rep: (1) align with whitewater · (2) successful turtle roll · (3) maintain board control · (4) turn lying or seated · (5) re-align with wave/whitewater · (6) catch. Standing up NOT required — focus is prone/paddle phases. Consolidates Seq #5 (STP-023 + STP-024 + STP-025).',
    'EDPF cycle per student','30',NULL,
    NULL,NULL,'One correction per ride',
    '1+ successful turtle roll? Board control after the roll? Intentional turn + alignment to catch?',
    'STP-024','EDPF coach loop','CMS-WB-07 · Align → Roll → Control → Turn → Catch'),

  ('SVC-CAMP-BEG-D4-B05','SVC-CAMP-BEG-D4', 5,'tactical', false,
    'Theory Class — Wave Anatomy + Types + Stages 1-4 + Etiquette',
    '7 wave parts (peak/shoulder/pocket/lip/wall/whitewater/trough). Types (spilling/plunging/closeout) + Breaks (beach/point/reef) + Direction (L/R from beach). Wave Stages 1-4 — WB rides Stage 4 only (Canon §2.2). Etiquette: Priority Rule + 5 Non-Negotiables.',
    'Wave Theory + Etiquette block','25',1,
    NULL,NULL,'"Energy lives in the pocket."',NULL,
    NULL,'PC-PRE-03 + PC-PRE-04 + PC-PRE-02 (theory block)',NULL),

  ('SVC-CAMP-BEG-D4-B06','SVC-CAMP-BEG-D4', 6,'technical', false,
    'Drill — Pop-Up + Foot Positioning (DRL-WB-16/17 · chalk line)',
    'Part 1: 8 reps of pop-up + 2-sec hold in power stance. Part 2: chalk line on the floor — student executes Cobra + Pick Line + Pop-Up (2-sec hold) + rotation (BS then FS) + impulse (4 phases). The chalk line is the visual reference for the line drawn on the wave face.',
    'DRL-WB-16 + DRL-WB-17 · chalk line','15',8,
    NULL,'chalk line + pop-up mat','One movement — cobra → pick → pop → rotate → impulse',
    'Pop-up in 2s · hold 2+ sec · rotation traced cleanly along the chalk line',
    'STP-016','DRL-WB-16 + DRL-WB-17 (chalk-line drill)',NULL),

  ('SVC-CAMP-BEG-D4-B07','SVC-CAMP-BEG-D4', 7,'mental', false,
    'Day Closing (CRT-WB-06)',
    '"Today we connected ocean theory with what your body is learning to do. You now understand waves as a system. Tomorrow each of you chooses one personal priority. Humility today is honestly identifying what you don not do well yet."',
    'CRT-WB-06 · Day Closing','5',1,
    NULL,NULL,'Humility brief mention',NULL,
    NULL,'CRT-WB-06 (closing)',NULL);

-- ─── DAY 5 — Personal Focus + Pool Lesson 2 ─────────────────────
INSERT INTO camp_template_blocks
  (id, template_day_id, block_order, pilar, is_safety_layer, pilar_part,
   mission, drill_name, mission_time, repetitions_default,
   warm_up, simulation, mental_hack, evaluation_focus,
   step_id, drill_custom, mission_custom)
VALUES
  ('SVC-CAMP-BEG-D5-B01','SVC-CAMP-BEG-D5', 1,'mental', false,
    'Three-Minute Guided Meditation',
    'Eyes closed · 3 deep nasal breaths · visualize today personal mission · anchor in the body (feet on the ground, breath in chest) · open eyes when ready.',
    'Guided meditation · 3 min','5',1,
    NULL,NULL,'Personal mission visualization',NULL,
    NULL,'Guided meditation (personal mission)',NULL),

  ('SVC-CAMP-BEG-D5-B02','SVC-CAMP-BEG-D5', 2,'physical', false,
    'Warm-Up (CRT-WB-04)',
    'Standard warm-up.',
    'CRT-WB-04 · TSS Warm-Up Flow','10',1,
    'mobility','cobra + pop-up patterns',NULL,NULL,
    'STP-002','DRL-WB-02 (TSS Warm-Up Flow)',NULL),

  ('SVC-CAMP-BEG-D5-B03','SVC-CAMP-BEG-D5', 3,'technical', false,
    'Personal Simulation on Land',
    'Each student simulates their personal mission on land: pop-up focus → pop-up drill · rotation focus → rotation drill · turtle roll focus → dry simulation · impulse focus → 4 phases. Coach circulates + corrects.',
    'Personal land simulation','10',1,
    NULL,'land sequence',NULL,NULL,
    NULL,'Personal simulation (student-selected drill)',NULL),

  ('SVC-CAMP-BEG-D5-B04','SVC-CAMP-BEG-D5', 4,'tactical', false,
    'Personal Venue Analysis (CRT-WB-05 student-led)',
    'Each student goes to elevated observation point · writes safe zone + hazards + plan for THEIR specific personal mission · coach reviews each plan · coach makes go/no-go. Building toward Seq #5 (Independence) preview.',
    'CRT-WB-05 · Venue Analysis (personal)','10',1,
    NULL,NULL,'Student leads · coach validates',NULL,
    'STP-001','CRT-WB-05 (personal/student-led variant)',NULL),

  ('SVC-CAMP-BEG-D5-B05','SVC-CAMP-BEG-D5', 5,'technical', false,
    'Water Mission — CMS-WB-08 · Personal Priority Refinement',
    'Student picks ONE element to refine (e.g. "stable pop-up with hips low", "cobra + pick line every pop-up", "impulse when speed drops", "clean turtle roll without panic"). Coach confirms it is achievable in one session and stays focused on that single element.',
    'EDPF cycle per student · single-focus','30',NULL,
    NULL,NULL,'Honor the commitment to the one element',
    'Selected ONE specific element (not vague)? Demonstrates improvement by end of session? Honest notebook reflection?',
    NULL,'EDPF coach loop (single-focus)','CMS-WB-08 · Personal Priority Refinement'),

  ('SVC-CAMP-BEG-D5-B06','SVC-CAMP-BEG-D5', 6,'tactical', false,
    'Theory Class — Ocean Currents + Lost-Board Protocol',
    '4 current types (rip · longshore · tidal · upwelling/downwelling). If caught in current: stay calm · do NOT fight · swim parallel · signal. 6-step Lost-Board Protocol: don not panic → watch → swim if downstream → wait if upstream → signal if far → don not chase into danger.',
    'PC-PRE-05 + PC-010 · Currents','20',1,
    NULL,NULL,'"Stay calm and ask for help when needed."',NULL,
    NULL,'PC-PRE-05 + PC-010 (Currents Canon)',NULL),

  ('SVC-CAMP-BEG-D5-B07','SVC-CAMP-BEG-D5', 7,'technical', false,
    'Pool Lesson 2 — Paddling Refinement + Recovery (CDR-WB-10/11)',
    'V1-V4 paddling drills (15 min, Canon-corrected from "speeds 1/2/3"). Coach-guided cues (10 min). CDR-WB-10 Board Control Recovery 8 reps (dismount + leash pull + remount). CDR-WB-11 Swimming + Floating Safety (swim a length + star-float 30s, repeat 2–3x).',
    'CDR-WB-10/11 + V1-V4 drills (Pool 2)','30',8,
    NULL,'pool','"The leash is your lifeline. Calm hands."',
    'V1-V4 attempted · leash retrieval smooth · star-float calm · controlled breathing',
    'STP-006','CDR-WB-10/11 (Pool 2 block)',NULL),

  ('SVC-CAMP-BEG-D5-B08','SVC-CAMP-BEG-D5', 8,'mental', false,
    'Day Closing (CRT-WB-06)',
    '"Today you each focused on your own priority. Tomorrow we put it all together. Humility today is recognizing the gap between where you are and where you want to be — and continuing to work without quitting."',
    'CRT-WB-06 · Day Closing','5',1,
    NULL,NULL,'Humility brief mention',NULL,
    NULL,'CRT-WB-06 (closing)',NULL);

-- ─── DAY 6 — Application + Evaluation + Ceremony ────────────────
INSERT INTO camp_template_blocks
  (id, template_day_id, block_order, pilar, is_safety_layer, pilar_part,
   mission, drill_name, mission_time, repetitions_default,
   warm_up, simulation, mental_hack, evaluation_focus,
   step_id, drill_custom, mission_custom)
VALUES
  ('SVC-CAMP-BEG-D6-B01','SVC-CAMP-BEG-D6', 1,'tactical', false,
    'Group Venue Analysis (CRT-WB-05)',
    'Final venue analysis of the camp. "Read the spot one more time. Is there a safe zone where you can apply your full WB sequence in whitewater?" Students write final observations.',
    'CRT-WB-05 · Venue Analysis (final)','10',1,
    NULL,NULL,NULL,NULL,
    'STP-001','CRT-WB-05 (final group variant)',NULL),

  ('SVC-CAMP-BEG-D6-B02','SVC-CAMP-BEG-D6', 2,'physical', false,
    'Bhastrika + Warm-Up',
    'CRT-WB-01 Bhastrika (30 reps) + CRT-WB-04 group warm-up.',
    'CRT-WB-01 + CRT-WB-04','15',1,
    'mobility','cobra + pop-up patterns','Bhastrika 30 reps',NULL,
    'STP-002','CRT-WB-01 + CRT-WB-04',NULL),

  ('SVC-CAMP-BEG-D6-B03','SVC-CAMP-BEG-D6', 3,'mental', false,
    'Personal Plan + Objectives',
    'Each student writes the 1–2 STPs they want to focus on today + specific success criteria for themselves + how they will measure improvement. Coach reviews each plan and gives feedback.',
    'Notebook · personal plan','10',1,
    NULL,NULL,'Self-direction · coach validates',NULL,
    NULL,'Personal plan (notebook · coach reviewed)',NULL),

  ('SVC-CAMP-BEG-D6-B04','SVC-CAMP-BEG-D6', 4,'tactical', false,
    'Theory Recap — Etiquette + Survival Skills',
    'Etiquette: Priority Rule + 5 Non-Negotiables. Survival: 6 Risk Factors before entering · 6-step Lost-Board Protocol · rip-current response (swim parallel + signal).',
    'Etiquette + Survival recap','10',1,
    NULL,NULL,NULL,NULL,
    NULL,'PC-PRE-02 + PC-PRE-05 (recap)',NULL),

  ('SVC-CAMP-BEG-D6-B05','SVC-CAMP-BEG-D6', 5,'technical', false,
    'Water Mission — CMS-WB-09 · Full WB Sequence in Whitewater (all 25 STPs)',
    'Apply everything: Venue Analysis → Warm-Up → Grab/Walk/Put board → Control + Standing Whitewater + Safe Turn + Walk Back → Mount + Sweet Spot + Align → Paddle Catch + Cobra+Turn Lying + Prone Dismount → Cobra Pick Line + Pop-Up + FP2 + Power Stance + Impulso + Starfish → BS/FS Turns → Paddle Out + Turtle Roll + Turn Lying. WB remains in whitewater (Stage 4) — no green waves. Coach evaluates which STPs are achieved / in-progress / need work.',
    'EDPF cycle per student · full sequence','45',NULL,
    NULL,NULL,'Director role until the last wave',
    'WB Exit Test: student must demonstrate ≥18 of 25 STPs to graduate White Belt. Remaining 7 may be "in progress".',
    'STP-018','EDPF coach loop (full WB sequence)','CMS-WB-09 · Full WB Sequence in Whitewater'),

  ('SVC-CAMP-BEG-D6-B06','SVC-CAMP-BEG-D6', 6,'tactical', false,
    'Video Analysis + General Performance Evaluation',
    'Evaluate execution of the full sequence per student · comprehensive feedback identifying areas to improve + strengths. Notebook task: what needs improvement · what to continue working on.',
    'Video analysis · general eval','20',1,
    NULL,NULL,NULL,
    'Per-student strengths + improvement areas captured in notebook',
    NULL,'Video analysis (general performance)',NULL),

  ('SVC-CAMP-BEG-D6-B07','SVC-CAMP-BEG-D6', 7,'mental', false,
    'Notebook Self-Evaluation · 25-STP Tracker',
    'Each student fills the 25 WB STPs evaluation table in their notebook. For each STP mark: Achieved (consistent) · In progress (sometimes) · Needs more work. WB Exit Test threshold: ≥18 / 25.',
    '25-STP self-eval (notebook)','15',1,
    NULL,NULL,'Honest self-assessment · Humility in action',
    'Self-eval honestly completed across all 25 STPs',
    NULL,'25-STP self-evaluation (notebook table)',NULL),

  ('SVC-CAMP-BEG-D6-B08','SVC-CAMP-BEG-D6', 8,'mental', false,
    'Final Coach Evaluation — submit via /camps/[id]/evaluate',
    'Coach completes the formal final evaluation for each enrolled student through the app evaluation flow. This is the camp closure step: the camp can only be marked Completed once every student has a final evaluation submitted.',
    'Final Evaluations (app flow)','20',1,
    NULL,NULL,NULL,
    'All N students evaluated · camp marked Completed',
    NULL,'Final evaluation (in-app · /camps/[id]/evaluate)',NULL),

  ('SVC-CAMP-BEG-D6-B09','SVC-CAMP-BEG-D6', 9,'mental', false,
    'Diploma Ceremony + Group Photo + Final Closing (CRT-WB-06)',
    'Coach distributes camp completion certificate to each student. Each student briefly shares (optional): one learning · one thing to keep working on. Coach gives one specific recognition per student. Group photo with diplomas. Final words: "The ocean does not negotiate with egos. Your White Belt is complete in whitewater. Green waves are where Yellow Belt begins — that is the next chapter. Welcome to the start."',
    'CRT-WB-06 · Closing Ceremony','15',1,
    NULL,NULL,'Humility closing anchor',NULL,
    NULL,'CRT-WB-06 (Closing Ceremony)',NULL);

COMMIT;
