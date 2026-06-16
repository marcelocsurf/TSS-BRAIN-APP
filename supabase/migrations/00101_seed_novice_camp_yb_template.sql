-- M101 — Seed the Novice Camp (Yellow Belt) 6-day template into SVC-CAMP-NOV.
--
-- Source (verbatim, no invention): TSS_NOVICE_CAMP_YB_MANUAL.pdf (v2.0 EN,
-- Canon v8.1) + _YB_CAMP_MODALITY_INVENTORY_v1.pdf (CDR/CMS/CRT-YB IDs).
--
-- Mirrors the proven SVC-CAMP-BEG (White Belt) seed skeleton, swapping WB
-- content for the canon-aligned YB content. Activity category is chosen per
-- block (water_mission · land_drill · warm_up · venue_analysis · mental ·
-- theory · custom · evaluation).
--
-- EVALUATION RULE (per Marcelo): step_id is set ONLY on water missions and
-- the sequence parts (STPs) actually being worked — these become officially
-- gradable (cyan STP rating in the coach planner). Out-of-water drills,
-- warm-ups, breathing, venue analysis, theory and routines carry NO step_id,
-- so the coach is not prompted to grade them as STPs. STP references for
-- drills are kept in the block title text for traceability only.
--
-- Idempotent: deletes existing SVC-CAMP-NOV blocks first, then re-inserts.

-- ── Template-level polish ───────────────────────────────────────────
UPDATE camp_templates SET
  description = 'TSS Novice Camp · Yellow Belt · 6 days. Belt Value: Process · Resilience. Coach role: Mentor (1:6). Days 1-2 whitewater fundamentals review at YB pace; Days 3-6 green waves if conditions safe and WB completed (whitewater backup). Covers the 8 YB STPs (027-034), the 4 paddling speeds (V1-V4), Chase the Pocket, Cobra + Pick Line = TIME, Go Up and Down, Out from the Shoulder, Reading Wave Stages 1-4.'
WHERE id = 'SVC-CAMP-NOV';

-- ── Day metadata ────────────────────────────────────────────────────
UPDATE camp_template_days SET
  day_goal = 'Foundations & Five Missions. Establish clear intention, solid posture, and introduce the Surf Sequence through repetition and awareness: mental + physical prep, safe-zone recognition, board control, technical fundamentals (technical pop-up · power stance · foot placement · braking/acceleration · safe dismount).',
  venue_default = 'Whitewater',
  ocean_condition_target = 'Whitewater — review fundamentals (both profiles).',
  evaluation_focus = 'Evaluate the 5 water missions only (board control · sweet spot+catch · pop-up+power stance · FP2 center · brake/accelerator). Land/skate drills are practice, not graded.'
WHERE id = 'e5288f10-06d2-4445-86ed-06b046b00ac6';

UPDATE camp_template_days SET
  day_goal = 'Rotation + Pool Fundamentals 1. Add frontside + backside rotation to the same sequence ("same sequence — more tools"). Refine paddling (V1-V4) and turtle roll in the pool.',
  venue_default = 'Whitewater + Pool',
  ocean_condition_target = 'Whitewater — refine rotation (both profiles). Pool for fundamentals.',
  evaluation_focus = 'Evaluate water missions (Backside · Frontside · Rotation+Impulse) and the pool V1-V4 (STP-027). Cobra + Pick Line = TIME named explicitly.'
WHERE id = 'f2b2d8f1-c2fb-46ef-9b51-706091a685a0';

UPDATE camp_template_days SET
  day_goal = 'Wave Theory & Reading the Ocean. Parts of a wave, types, Wave Stages 1-4 (STP-033), paddling angle (STP-029), currents + safety. Apply pool skills in water (turtle roll · align · catch).',
  venue_default = 'Whitewater OR Green waves (coach decides)',
  ocean_condition_target = 'Profile A: whitewater or green. Profile B: whitewater preferred, green if conditions safe.',
  evaluation_focus = 'Evaluate the water mission Align -> Roll -> Control -> Turn -> Catch (STP-024). Standing up NOT required. Theory blocks are knowledge, not graded.'
WHERE id = 'bae120c1-1e91-4c99-9d32-b7f5f51fd4bb';

UPDATE camp_template_days SET
  day_goal = 'Chase the Pocket + Out from the Shoulder. Follow the pocket (STP-028) at the correct paddle angle (STP-029). Introduce the canonical YB exit, Out from the Shoulder (STP-032). Energy first, maneuvers later.',
  venue_default = 'Green waves (if safe, whitewater backup)',
  ocean_condition_target = 'Green waves if coach (Mentor) judges ready and conditions safe; whitewater otherwise.',
  evaluation_focus = 'Evaluate the water missions Find the Pocket (STP-028) and Catch + Cobra + Pick Line = TIME (STP-034). Out from the Shoulder introduced (theory) — graded on Day 6.'
WHERE id = '0a1a153b-cfc7-4bd9-a2f5-a437481e98ca';

UPDATE camp_template_days SET
  day_goal = 'Self-Organization & Personal Focus. Draw lines on the wave face: Go Up and Down (STP-031, External x Internal) or hold near the pocket. The student begins to lead their own training.',
  venue_default = 'Green waves (personal focus)',
  ocean_condition_target = 'Green waves for personal focus; whitewater backup.',
  evaluation_focus = 'Evaluate Top to Bottom / Go Up and Down (STP-031) or the alternative Hold Near the Pocket (STP-028). Personal-priority drill is practice, not graded.'
WHERE id = '9a5d6df5-be8f-4900-aaa1-67338938ff6b';

UPDATE camp_template_days SET
  day_goal = 'Application + Evaluation + Ceremony. Apply the full YB sequence in real conditions. Formal evaluation against the 8 YB STPs (027-034) + the 5 Canon principles. Certificate + ceremony.',
  venue_default = 'Green waves (application, if safe)',
  ocean_condition_target = 'Green waves to apply if conditions safe and student WB-completed; whitewater backup always.',
  evaluation_focus = 'YB Exit Test: the student must demonstrate >= 6 of 8 YB STPs (027-034) + >= 3 of 5 Canon principles to graduate Yellow Belt. Formal coach rating via /camps/[id]/evaluate.',
  has_evaluation = true,
  evaluation_type = 'yb_exit_test'
WHERE id = '95848d23-2132-44ea-aed2-f8635dcf42b0';

-- ── Reset blocks (idempotent) ───────────────────────────────────────
DELETE FROM camp_template_blocks WHERE template_day_id IN (
  'e5288f10-06d2-4445-86ed-06b046b00ac6',
  'f2b2d8f1-c2fb-46ef-9b51-706091a685a0',
  'bae120c1-1e91-4c99-9d32-b7f5f51fd4bb',
  '0a1a153b-cfc7-4bd9-a2f5-a437481e98ca',
  '9a5d6df5-be8f-4900-aaa1-67338938ff6b',
  '95848d23-2132-44ea-aed2-f8635dcf42b0'
);

-- ── Blocks ──────────────────────────────────────────────────────────
INSERT INTO camp_template_blocks
  (id, template_day_id, block_order, block_type, pilar, is_safety_layer,
   pilar_part, step_id, mission_custom, drill_custom, mission_time,
   evaluation_focus, activity_subtype)
VALUES
-- ===================== DAY 1 — Foundations & Five Missions =====================
('SVC-CAMP-NOV-D1-01','e5288f10-06d2-4445-86ed-06b046b00ac6',1,'custom','mental',false,
 $b$Welcome / Opening + Belt Value anchor — Process · Resilience (CRT-YB-06 opening)$b$,NULL,NULL,
 $b$Welcome, attendance, hand out notebooks. Name the Belt Value: "Real growth is long, imperfect, and requires consistency. Endurance and enjoyment are not opposites." Homework: write 5 reasons why you practice surfing.$b$,'5',NULL,NULL),
('SVC-CAMP-NOV-D1-02','e5288f10-06d2-4445-86ed-06b046b00ac6',2,'custom','technical',true,
 $b$Safety Rules + Communication Signals + Star-Fall + Leash Discipline + Board Control$b$,NULL,NULL,
 $b$3 mandatory voice signals (ARE YOU OK? / I AM OK! / OUT OF THE WATER). Star-Fall Protocol + Leash Discipline + Board Control (see WB Beginner Camp Manual §1.6).$b$,'10',
 $b$Did the student demonstrate the 3 mandatory voice signals + a calm controlled exit?$b$,NULL),
('SVC-CAMP-NOV-D1-03','e5288f10-06d2-4445-86ed-06b046b00ac6',3,'venue_analysis','tactical',false,
 $b$Group Venue Analysis (CRT-YB-05) — coach-led$b$,NULL,NULL,
 $b$Identify safe zone · risks · spot suitability for the group level. Canon doctrine: 6 risk factors, 2+ negative = no-go. "We only surf where it makes sense for today's missions."$b$,'10',NULL,NULL),
('SVC-CAMP-NOV-D1-04','e5288f10-06d2-4445-86ed-06b046b00ac6',4,'warm_up','physical',false,
 $b$Group Warm-Up (CRT-YB-04)$b$,NULL,NULL,
 $b$Guided group warm-up: mobility · body awareness · mental focus. Enter the body zone — the body is ready to perform.$b$,'10',NULL,$b$Head-to-toe$b$),
('SVC-CAMP-NOV-D1-05','e5288f10-06d2-4445-86ed-06b046b00ac6',5,'land_drill','technical',false,
 $b$Sequence Simulation on Land — Cobra · Pick Line · Pop-Up · Posture (motor memory before water)$b$,NULL,NULL,
 $b$Land simulation of the sequence. Motor memory before water. Present Missions 1-5: completed IN ORDER, never mixed.$b$,'10',NULL,NULL),
('SVC-CAMP-NOV-D1-06','e5288f10-06d2-4445-86ed-06b046b00ac6',6,'water_mission','technical',false,
 $b$Water Mission 1 — CMS-YB-01 · Control My Board (STP-006/007/008)$b$,'STP-006',
 $b$CMS-YB-01 · Control My Board$b$,$b$EDPF coach loop$b$,'20',
 $b$Controls the board with the hands through whitewater? Maneuvers with intention? The board is a tool, not something that drags the student.$b$,NULL),
('SVC-CAMP-NOV-D1-07','e5288f10-06d2-4445-86ed-06b046b00ac6',7,'water_mission','technical',false,
 $b$Water Mission 2 — CMS-YB-02 · Sweet Spot + Alignment + Wave Catch (STP-010/011/012/013/014/025)$b$,'STP-012',
 $b$CMS-YB-02 · Sweet Spot + Alignment + Catch$b$,$b$EDPF coach loop$b$,'20',
 $b$Finds the sweet spot? Aligns with the whitewater before paddling? Catches + Cobra + turns + controlled dismount?$b$,NULL),
('SVC-CAMP-NOV-D1-08','e5288f10-06d2-4445-86ed-06b046b00ac6',8,'water_mission','technical',false,
 $b$Water Mission 3 — CMS-YB-03 · Technical Pop-Up + Power Stance (STP-015/016/018/020)$b$,'STP-016',
 $b$CMS-YB-03 · Technical Pop-Up + Power Stance$b$,$b$EDPF coach loop$b$,'25',
 $b$Stable technical pop-up? Clear power stance? Star-fall dismount? Stability before speed.$b$,NULL),
('SVC-CAMP-NOV-D1-09','e5288f10-06d2-4445-86ed-06b046b00ac6',9,'water_mission','technical',false,
 $b$Water Mission 4 — CMS-YB-04 · Front Foot Lands in the Center / FP2 (STP-017)$b$,'STP-017',
 $b$CMS-YB-04 · Front Foot in Center (FP2)$b$,$b$EDPF coach loop$b$,'15',
 $b$Front foot lands precisely in the center (FP2)? Balance and longitudinal control? A stable base creates control.$b$,NULL),
('SVC-CAMP-NOV-D1-10','e5288f10-06d2-4445-86ed-06b046b00ac6',10,'water_mission','technical',false,
 $b$Water Mission 5 — CMS-YB-05 · Brake & Accelerator Control (STP-019)$b$,'STP-019',
 $b$CMS-YB-05 · Brake & Accelerator Control$b$,$b$EDPF coach loop$b$,'15',
 $b$Moves forward/backward on the board? Applies braking + acceleration pressure? Adds impulse intentionally? Active speed control.$b$,NULL),
('SVC-CAMP-NOV-D1-11','e5288f10-06d2-4445-86ed-06b046b00ac6',11,'custom','tactical',false,
 $b$Video Analysis — evaluate ONLY today's 5 missions$b$,NULL,NULL,
 $b$Goals: efficient board control · understanding wave-energy direction · clear technical fundamentals. Checklist per student: Did they try? Did they understand the goal? Where did control break?$b$,'15',NULL,NULL),
('SVC-CAMP-NOV-D1-12','e5288f10-06d2-4445-86ed-06b046b00ac6',12,'land_drill','technical',false,
 $b$On-Land Drill Block — CDR-YB-01 to 08 (pop-up flat/unstable · skate mount-dismount · push&brake · straight-line stance · impulse · rotation land + skate)$b$,NULL,NULL,
 $b$CDR-YB-01 Pop-Up + Power Stance (flat) · 02 Pop-Up + Balance (unstable) · 03 Skate mount/dismount · 04 Skate push & brake · 05 Skate straight-line stance · 06 Skate impulse · 07 Rotation on land (eye lead) · 08 Skate rotation BS/FS. Not graded — clarity, control, foundations.$b$,'30',NULL,NULL),
('SVC-CAMP-NOV-D1-13','e5288f10-06d2-4445-86ed-06b046b00ac6',13,'theory','technical',false,
 $b$Theory — Rotation & Kinetic Chain + STP-034 Cobra + Pick Line = TIME (intro)$b$,NULL,NULL,
 $b$Show Cobra / choosing the line / rotation video. Introduce the YB principle: applying Cobra + picking the line BEFORE the pop-up buys TIME. Also refresh STP-019 Impulse (Compress · Reach · Push · Extend).$b$,'15',NULL,NULL),
('SVC-CAMP-NOV-D1-14','e5288f10-06d2-4445-86ed-06b046b00ac6',14,'custom','mental',false,
 $b$Day 1 Closing (CRT-YB-06) — anchor Process · Resilience + Surf Skate Class 1$b$,NULL,NULL,
 $b$"Today we installed the foundations. The same fundamentals will be repeated all week, each time at a higher standard. That repetition is mastery being built." Notebook entry. Surf Skate Class 1.$b$,'10',NULL,NULL),

-- ===================== DAY 2 — Rotation + Pool Fundamentals 1 =====================
('SVC-CAMP-NOV-D2-01','f2b2d8f1-c2fb-46ef-9b51-706091a685a0',1,'mental','mental',false,
 $b$Bhastrika Breathing (CRT-YB-01) + Day 2 Opening — "Same sequence, more tools"$b$,NULL,NULL,
 $b$30 reps: deep nasal breathing · active exhale · presence. Recap Day 1 fundamentals; today add rotation (frontside + backside).$b$,'5',NULL,$b$Bhastrika$b$),
('SVC-CAMP-NOV-D2-02','f2b2d8f1-c2fb-46ef-9b51-706091a685a0',2,'warm_up','physical',false,
 $b$Warm-Up (CRT-YB-04)$b$,NULL,NULL,$b$Enter the body zone: mobility · coordination · mental focus.$b$,'8',NULL,$b$Head-to-toe$b$),
('SVC-CAMP-NOV-D2-03','f2b2d8f1-c2fb-46ef-9b51-706091a685a0',3,'land_drill','technical',false,
 $b$Sequence Simulation on Land — 6 reps (Cobra · Pick Line · Pop-Up · Posture · Frontside + Backside rotation)$b$,NULL,NULL,
 $b$Repeat 6 reps. Motor memory before water.$b$,'10',NULL,NULL),
('SVC-CAMP-NOV-D2-04','f2b2d8f1-c2fb-46ef-9b51-706091a685a0',4,'venue_analysis','tactical',false,
 $b$Group Venue Analysis (CRT-YB-05)$b$,NULL,NULL,
 $b$Analyze conditions · safe zones · wave direction. "We only surf where it makes sense for today's missions."$b$,'8',NULL,NULL),
('SVC-CAMP-NOV-D2-05','f2b2d8f1-c2fb-46ef-9b51-706091a685a0',5,'water_mission','technical',false,
 $b$Water Mission — CMS-YB-06 · Backside (Cobra -> Pick Line -> Backside rotation) (STP-015/021/034)$b$,'STP-021',
 $b$CMS-YB-06 · Backside$b$,$b$EDPF coach loop$b$,'20',
 $b$Eyes lead the turn (not feet)? Cobra + Pick Line = TIME named? Backside rotation through obliques/hips, stance preserved?$b$,NULL),
('SVC-CAMP-NOV-D2-06','f2b2d8f1-c2fb-46ef-9b51-706091a685a0',6,'water_mission','technical',false,
 $b$Water Mission — CMS-YB-07 · Frontside (Cobra -> Pick Line -> Frontside rotation) (STP-015/022/034)$b$,'STP-022',
 $b$CMS-YB-07 · Frontside$b$,$b$EDPF coach loop$b$,'20',
 $b$Eyes lead? Chest over/ahead of front foot? Frontside rotation controlled? TIME applied before pop-up?$b$,NULL),
('SVC-CAMP-NOV-D2-07','f2b2d8f1-c2fb-46ef-9b51-706091a685a0',7,'water_mission','technical',false,
 $b$Water Mission — CMS-YB-08 · Rotation + Impulse (combined chain) (STP-019/021/022)$b$,'STP-019',
 $b$CMS-YB-08 · Rotation + Impulse$b$,$b$EDPF coach loop$b$,'20',
 $b$Cobra + Pick Line + Rotation + Momentum chained? Impulse recovers/sustains speed? "A drill you will do forever — get sharp at it."$b$,NULL),
('SVC-CAMP-NOV-D2-08','f2b2d8f1-c2fb-46ef-9b51-706091a685a0',8,'custom','tactical',false,
 $b$Video Analysis — evaluate ONLY today's 3 missions$b$,NULL,NULL,
 $b$Backside · Frontside · Rotation+Momentum. "We evaluate ONLY today's missions, not the full surf." Did they try? Understand the goal? Where did control break?$b$,'15',NULL,NULL),
('SVC-CAMP-NOV-D2-09','f2b2d8f1-c2fb-46ef-9b51-706091a685a0',9,'theory','technical',false,
 $b$Theory — Paddling Basics (preview STP-027) + Turtle Roll (STP-024)$b$,NULL,NULL,
 $b$Efficient paddle: board position (chest lifted) · clean deep strokes, elbow high, push water back · rhythm then accelerate before takeoff · core engaged, legs together · controlled breathing. Turtle roll key steps (safety · control · awareness).$b$,'15',NULL,NULL),
('SVC-CAMP-NOV-D2-10','f2b2d8f1-c2fb-46ef-9b51-706091a685a0',10,'water_mission','technical',false,
 $b$Pool Lesson 1 (Fundamentals 1) — Sweet Spot · Sitting · Seated Turns · Paddling V1-V4 · Turtle Roll · Scenario Sim (CDR-YB-09 to 14)$b$,'STP-027',
 $b$Pool Lesson 1 — 4 Paddling Speeds V1-V4 (FULL Canon)$b$,$b$CDR-YB-09 sweet spot · 10 sitting · 11 seated turns · 12 paddling V1-V4 (FULL Canon) · 13 turtle roll · 14 real-life scenario sim$b$,'60',
 $b$4 paddling speeds V1-V4 attempted (V1 cruise · V2 working · V3 catching · V4 sprint)? Turtle roll calm + fins-up? Sweet spot found? "Match the speed to the situation."$b$,NULL),
('SVC-CAMP-NOV-D2-11','f2b2d8f1-c2fb-46ef-9b51-706091a685a0',11,'custom','mental',false,
 $b$Day 2 Closing (CRT-YB-06)$b$,NULL,NULL,
 $b$"Trust that the technique you practiced 50 times will be there when you need it." Notebook entry.$b$,'5',NULL,NULL),

-- ===================== DAY 3 — Wave Theory & Reading the Ocean =====================
('SVC-CAMP-NOV-D3-01','bae120c1-1e91-4c99-9d32-b7f5f51fd4bb',1,'mental','mental',false,
 $b$Bhastrika (CRT-YB-01) + Visualization (CRT-YB-02)$b$,NULL,NULL,
 $b$30 Bhastrika reps + 3 min visualization (complete sequence, including the hard parts). Increase focus · regulate nervous system · prepare body & mind.$b$,'8',NULL,$b$Bhastrika$b$),
('SVC-CAMP-NOV-D3-02','bae120c1-1e91-4c99-9d32-b7f5f51fd4bb',2,'warm_up','physical',false,
 $b$Warm-Up (CRT-YB-04)$b$,NULL,NULL,$b$Same as Day 2. Enter the body zone.$b$,'8',NULL,$b$Head-to-toe$b$),
('SVC-CAMP-NOV-D3-03','bae120c1-1e91-4c99-9d32-b7f5f51fd4bb',3,'land_drill','technical',false,
 $b$Skateboard + Pop-Up Drills — BS/FS crossing, momentum, Pop-Up FP1/FP2 transitions, Top-to-Bottom flow (CDR-YB-15/16/17)$b$,NULL,NULL,
 $b$CDR-YB-15 Pop-Up + FP1/FP2 transitions + rotations ("FP1 for maneuver, FP2 for stability — choose consciously") · 16 Skate BS/FS crossing · 17 Wave simulation top-to-bottom flow (prepares STP-031). Not graded.$b$,'15',NULL,NULL),
('SVC-CAMP-NOV-D3-04','bae120c1-1e91-4c99-9d32-b7f5f51fd4bb',4,'venue_analysis','tactical',false,
 $b$Venue Analysis (CRT-YB-05) — student-led begins (coach review)$b$,NULL,NULL,
 $b$Days 3-6 the student leads the analysis (autonomy per Mentor role); coach validates. 6 risk factors, 2+ negative = no-go.$b$,'10',NULL,NULL),
('SVC-CAMP-NOV-D3-05','bae120c1-1e91-4c99-9d32-b7f5f51fd4bb',5,'water_mission','technical',false,
 $b$Water Mission — CMS-YB-09 · Align -> Roll -> Control -> Turn -> Catch (STP-011/024/006/013/025/012)$b$,'STP-024',
 $b$CMS-YB-09 · Align -> Roll -> Control -> Turn -> Catch$b$,$b$EDPF coach loop$b$,'40',
 $b$Successful turtle roll? Turn while lying or seated? Align with wave/whitewater and catch intentionally? Doctrinal: standing up is NOT required to complete this mission.$b$,NULL),
('SVC-CAMP-NOV-D3-06','bae120c1-1e91-4c99-9d32-b7f5f51fd4bb',6,'custom','tactical',false,
 $b$Video Analysis — Day 3 (mission only)$b$,NULL,NULL,
 $b$Evaluate strictly the mission Align -> Roll -> Control -> Turn -> Catch. Use the EDPF feedback frame.$b$,'15',NULL,NULL),
('SVC-CAMP-NOV-D3-07','bae120c1-1e91-4c99-9d32-b7f5f51fd4bb',7,'theory','technical',false,
 $b$Theory — Wave Basics (Parts · Types · Breaks · Lefts/Rights)$b$,NULL,NULL,
 $b$Parts: face · pocket (power zone) · lip · whitewater · shoulder (exit). Types: spilling · plunging · closeout. Breaks: beach · point · reef. Lefts/Rights. "Energy lives in the pocket." Avoid closeouts/heavy plunging sections.$b$,'15',NULL,NULL),
('SVC-CAMP-NOV-D3-08','bae120c1-1e91-4c99-9d32-b7f5f51fd4bb',8,'theory','technical',false,
 $b$Theory — Wave Stages 1-4 (STP-033 NEW CANON)$b$,NULL,NULL,
 $b$The 4 stages: 1 Traveling (read from lineup) · 2 Rising (decision moment — is this wave for me?) · 3 Pocket (pop-up window opens — YB target) · 4 Whitewater (WB rides · YB backup). "A YB surfer reads all 4 wave stages." Practiced in water Days 4-6; graded Day 6.$b$,'15',NULL,NULL),
('SVC-CAMP-NOV-D3-09','bae120c1-1e91-4c99-9d32-b7f5f51fd4bb',9,'theory','tactical',false,
 $b$Theory — Paddling Angle (STP-029) + Currents + Lost Board + Etiquette$b$,NULL,NULL,
 $b$Paddle angle 3 options: far from pocket (easier) · near the pocket (most common YB choice) · in front of the pocket (fast waves). "Paddle toward where the wave is going, not where it is now." Currents + lost-board protocol (stay calm, ask for help). Etiquette recap: priority rule + 5 non-negotiables.$b$,'15',NULL,NULL),
('SVC-CAMP-NOV-D3-10','bae120c1-1e91-4c99-9d32-b7f5f51fd4bb',10,'water_mission','technical',false,
 $b$Pool Session 2 — Paddling refinement + Turtle Roll consistency (STP-027/024)$b$,'STP-027',
 $b$Pool Session 2 — Paddling + Turtle Roll refinement$b$,$b$Pool circuit (paddling V1-V4 + turtle roll under varied cues)$b$,'30',
 $b$V1-V4 refined and matched to cue? Turtle roll consistent and calm? Sweet spot held under different conditions?$b$,NULL),
('SVC-CAMP-NOV-D3-11','bae120c1-1e91-4c99-9d32-b7f5f51fd4bb',11,'custom','mental',false,
 $b$Day 3 Closing (CRT-YB-06)$b$,NULL,NULL,
 $b$"Slow down enough to observe before reacting. Wave reading takes years — but you have a method to accelerate it." Notebook entry.$b$,'5',NULL,NULL),

-- ===================== DAY 4 — Chase the Pocket + Out from the Shoulder =====================
('SVC-CAMP-NOV-D4-01','0a1a153b-cfc7-4bd9-a2f5-a437481e98ca',1,'mental','mental',false,
 $b$Bhastrika (CRT-YB-01) + Goal: "Catch waves with awareness"$b$,NULL,NULL,
 $b$30 reps: deep nasal breathing · active exhale · presence. Today: enter safely, chase the pocket, exit with elegance.$b$,'5',NULL,$b$Bhastrika$b$),
('SVC-CAMP-NOV-D4-02','0a1a153b-cfc7-4bd9-a2f5-a437481e98ca',2,'warm_up','physical',false,
 $b$Warm-Up (CRT-YB-04)$b$,NULL,NULL,$b$Standard. Enter the body zone.$b$,'8',NULL,$b$Head-to-toe$b$),
('SVC-CAMP-NOV-D4-03','0a1a153b-cfc7-4bd9-a2f5-a437481e98ca',3,'venue_analysis','tactical',false,
 $b$Group Venue Analysis (spot assessment) + lineup strategy (entry · exit · positioning)$b$,NULL,NULL,
 $b$Assess the spot; review strategy for entry, exit, and positioning in the lineup.$b$,'10',NULL,NULL),
('SVC-CAMP-NOV-D4-04','0a1a153b-cfc7-4bd9-a2f5-a437481e98ca',4,'water_mission','technical',false,
 $b$Water Mission — CMS-YB-10 · Find the Pocket (Chase + Paddle Angle) (STP-028/029)$b$,'STP-028',
 $b$CMS-YB-10 · Find the Pocket$b$,$b$EDPF coach loop$b$,'25',
 $b$Seeks the pocket of the wave? Chooses the best paddling angle? Positions to catch? "If the pocket moves, you move."$b$,NULL),
('SVC-CAMP-NOV-D4-05','0a1a153b-cfc7-4bd9-a2f5-a437481e98ca',5,'water_mission','technical',false,
 $b$Water Mission — CMS-YB-11 · Catch + Cobra + Pick Line = TIME (STP-012/015/034)$b$,'STP-034',
 $b$CMS-YB-11 · Catch + Cobra + Pick Line (TIME)$b$,$b$EDPF coach loop$b$,'25',
 $b$Catches the wave + Cobra + picks the line immediately? Buys TIME (confident commitment, not hesitation)? Scan the wave, use the pocket as reference, stay calm.$b$,NULL),
('SVC-CAMP-NOV-D4-06','0a1a153b-cfc7-4bd9-a2f5-a437481e98ca',6,'custom','tactical',false,
 $b$Video Analysis — Day 4 (missions only)$b$,NULL,NULL,
 $b$Mission 1: seeks pocket + chooses paddle angle. Mission 2: catch + Cobra + Pick Line. Plus guided visualization of key improvements.$b$,'15',NULL,NULL),
('SVC-CAMP-NOV-D4-07','0a1a153b-cfc7-4bd9-a2f5-a437481e98ca',7,'theory','technical',false,
 $b$Theory — The Pocket Is the Source of Energy (STP-028/031)$b$,NULL,NULL,
 $b$"Every time you feel there is no speed, go back to the source." The pocket is the source of energy; moving too far loses power; to regain speed, return to the pocket. Rule: "Energy first, maneuvers later."$b$,'10',NULL,NULL),
('SVC-CAMP-NOV-D4-08','0a1a153b-cfc7-4bd9-a2f5-a437481e98ca',8,'theory','technical',false,
 $b$Theory — Out from the Shoulder (STP-032 NEW CANON · intro)$b$,NULL,NULL,
 $b$The canonical YB exit: when the ride ends or the wave closes, exit by the shoulder (the soft zone) with control — not by falling or being washed out. "Exit with elegance, not with turbulence." Read the end · redirect to the shoulder · decelerate · step off controlled · leash discipline. Practiced Days 5-6; graded Day 6.$b$,'12',NULL,NULL),
('SVC-CAMP-NOV-D4-09','0a1a153b-cfc7-4bd9-a2f5-a437481e98ca',9,'land_drill','mental',false,
 $b$Drills — Guided Visualization & Return to Pocket (CDR-YB-18) + Chalk-Line Full-Chain Land Sim (CDR-YB-19)$b$,NULL,NULL,
 $b$CDR-YB-18 visualize being on a wave, identify the pocket, return to it after a maneuver. CDR-YB-19 chalk-line full chain: Cobra + Pick Line -> Pop-Up (2-sec hold) -> Rotation (FP1/FP2) -> Impulse. "One movement." Not graded. (Original pptx Bottom Turn/Cutback drills REMOVED — Blue Belt content.)$b$,'15',NULL,NULL),
('SVC-CAMP-NOV-D4-10','0a1a153b-cfc7-4bd9-a2f5-a437481e98ca',10,'custom','mental',false,
 $b$Day 4 Closing (CRT-YB-06)$b$,NULL,NULL,
 $b$"The pocket is the source of energy. The shoulder is the exit. The ocean rewards the patient surfer who reads before reacting." Notebook entry.$b$,'5',NULL,NULL),

-- ===================== DAY 5 — Self-Organization & Personal Focus =====================
('SVC-CAMP-NOV-D5-01','9a5d6df5-be8f-4900-aaa1-67338938ff6b',1,'mental','mental',false,
 $b$Bhastrika (CRT-YB-01) + Visualization (CRT-YB-02)$b$,NULL,NULL,
 $b$30 Bhastrika reps + visualization. Today is yours: look at your own surfing and decide what to work on.$b$,'8',NULL,$b$Bhastrika$b$),
('SVC-CAMP-NOV-D5-02','9a5d6df5-be8f-4900-aaa1-67338938ff6b',2,'warm_up','physical',false,
 $b$Warm-Up (CRT-YB-04)$b$,NULL,NULL,$b$Standard. Enter the body zone.$b$,'8',NULL,$b$Head-to-toe$b$),
('SVC-CAMP-NOV-D5-03','9a5d6df5-be8f-4900-aaa1-67338938ff6b',3,'land_drill','technical',false,
 $b$Land Drill (with/without skateboard) — right-to-left transitions, top-to-bottom flow$b$,NULL,NULL,
 $b$Practice rail-to-rail transitions and top-to-bottom flow to prepare Go Up and Down. Not graded.$b$,'12',NULL,NULL),
('SVC-CAMP-NOV-D5-04','9a5d6df5-be8f-4900-aaa1-67338938ff6b',4,'venue_analysis','tactical',false,
 $b$Personal Venue Analysis (student-led, coach reviews each plan)$b$,NULL,NULL,
 $b$Each student conducts their own venue analysis and defines the approach; coach (Mentor) reviews each plan.$b$,'10',NULL,NULL),
('SVC-CAMP-NOV-D5-05','9a5d6df5-be8f-4900-aaa1-67338938ff6b',5,'water_mission','technical',false,
 $b$Water Mission — CMS-YB-12 · Top to Bottom / Go Up and Down (STP-031/028)$b$,'STP-031',
 $b$CMS-YB-12 · Top to Bottom (Go Up and Down)$b$,$b$EDPF coach loop$b$,'30',
 $b$Surfs the face top-to-bottom staying close to the pocket? "External x Internal = sustained line" — the wave gives external energy, the body provides internal (impulse, posture, rotation).$b$,NULL),
('SVC-CAMP-NOV-D5-06','9a5d6df5-be8f-4900-aaa1-67338938ff6b',6,'water_mission','technical',false,
 $b$Water Mission (Alternative) — CMS-YB-13 · Hold Near the Pocket (STP-028/019)$b$,'STP-028',
 $b$CMS-YB-13 · Hold Near the Pocket$b$,$b$EDPF coach loop (use if student not yet ready for Go Up and Down)$b$,'20',
 $b$Holds position near the pocket, staying in the power zone as many seconds as possible? Uses impulse to recover if drifting out?$b$,NULL),
('SVC-CAMP-NOV-D5-07','9a5d6df5-be8f-4900-aaa1-67338938ff6b',7,'custom','tactical',false,
 $b$Video Analysis — Self-Organization$b$,NULL,NULL,
 $b$"Play with the pocket and find what is most slowing the sequence. Self-organize and choose a personal objective." Identify key improvements; plan corrections for the next session.$b$,'15',NULL,NULL),
('SVC-CAMP-NOV-D5-08','9a5d6df5-be8f-4900-aaa1-67338938ff6b',8,'custom','mental',false,
 $b$Discover What to Improve — 3 Questions (Mentor-led self-organization)$b$,NULL,NULL,
 $b$1) What do I want to do but can't? 2) Is it execution or decision-making? 3) What is causing it — physical, mental, technical, or tactical?$b$,'10',NULL,NULL),
('SVC-CAMP-NOV-D5-09','9a5d6df5-be8f-4900-aaa1-67338938ff6b',9,'land_drill','technical',false,
 $b$Personal Priority Out-of-Water Drill (CDR-YB-20, student-selected)$b$,NULL,NULL,
 $b$Support the personal objective: address the main limitation, reinforce the specific part of the sequence, prepare body and mind. "One objective. One focus. One drill." Not graded.$b$,'10',NULL,NULL),
('SVC-CAMP-NOV-D5-10','9a5d6df5-be8f-4900-aaa1-67338938ff6b',10,'custom','mental',false,
 $b$Day 5 Closing (CRT-YB-06)$b$,NULL,NULL,
 $b$"Today you took the framework and made it yours. The patient student becomes the surfer." Notebook entry.$b$,'5',NULL,NULL),

-- ===================== DAY 6 — Application + Evaluation + Ceremony =====================
('SVC-CAMP-NOV-D6-01','95848d23-2132-44ea-aed2-f8635dcf42b0',1,'mental','mental',false,
 $b$General Warm-Up + Bhastrika (CRT-YB-01/04)$b$,NULL,NULL,
 $b$General warm-up + 30 Bhastrika reps. Put everything together: V1-V4 · chase the pocket · paddle angle · Cobra + Pick Line · rotation · Go Up and Down · Out from the Shoulder.$b$,'15',NULL,$b$Bhastrika$b$),
('SVC-CAMP-NOV-D6-02','95848d23-2132-44ea-aed2-f8635dcf42b0',2,'custom','mental',false,
 $b$Personal Plan + Objectives (notebook · coach Mentor reviews)$b$,NULL,NULL,
 $b$Each student writes their personal mission for the day, specific success criteria, and how they will measure improvement. Coach reviews each plan.$b$,'10',NULL,NULL),
('SVC-CAMP-NOV-D6-03','95848d23-2132-44ea-aed2-f8635dcf42b0',3,'water_mission','technical',false,
 $b$Water Mission — CMS-YB-14 · Full YB Sequence Application (all 8 YB STPs 027-034)$b$,'STP-027',
 $b$CMS-YB-14 · Full YB Sequence Application$b$,$b$EDPF coach loop (self-selected objectives). Green waves if conditions safe + WB-completed; whitewater backup.$b$,'60',
 $b$Applies the full YB sequence in real conditions. Self-selected objective with greatest impact. (Alternative for those who mastered the day: clean Out from the Shoulder or deepen Cobra + Pick Line = TIME. Pump REMOVED — Blue Belt.) Official per-STP rating happens in the Final Evaluation block.$b$,NULL),
('SVC-CAMP-NOV-D6-04','95848d23-2132-44ea-aed2-f8635dcf42b0',4,'custom','tactical',false,
 $b$Video Analysis — General Performance$b$,NULL,NULL,
 $b$Evaluate the execution of the full sequence; comprehensive feedback (strengths + areas to improve). Notebook: what to improve, what to keep working on.$b$,'20',NULL,NULL),
('SVC-CAMP-NOV-D6-05','95848d23-2132-44ea-aed2-f8635dcf42b0',5,'custom','mental',false,
 $b$Notebook Self-Evaluation — YB STP Tracker (8 STPs 027-034) + Canon Principles Tracker (5)$b$,NULL,NULL,
 $b$Student self-evaluates the 8 YB STPs + the 5 Canon principles (Endurance and enjoyment are not opposites · Cobra + Line = TIME · External x Internal = sustained line · Exit with elegance · Errors are signals).$b$,'15',
 $b$Self-eval honestly completed across the 8 YB STPs + 5 Canon principles.$b$,NULL),
('SVC-CAMP-NOV-D6-06','95848d23-2132-44ea-aed2-f8635dcf42b0',6,'evaluation','mental',false,
 $b$Final Coach Evaluation — submit via /camps/[id]/evaluate$b$,NULL,NULL,
 $b$Officially rate each of the 8 YB STPs (027-034). Graduation threshold (YB Exit Test): >= 6 of 8 STPs + >= 3 of 5 Canon principles. Mark the camp Completed.$b$,'20',
 $b$All students evaluated against the 8 YB STPs + 5 Canon principles; >= 6/8 + >= 3/5 to graduate Yellow Belt. Camp marked Completed.$b$,NULL),
('SVC-CAMP-NOV-D6-07','95848d23-2132-44ea-aed2-f8635dcf42b0',7,'custom','mental',false,
 $b$Diploma Ceremony + Group Photo + Final Closing (CRT-YB-06)$b$,NULL,NULL,
 $b$Hand out certificates. Each student shares one thing learned + one to keep working on; coach gives one specific recognition per student. "Endurance and enjoyment are not opposites. You catch waves now — but more importantly, you have a process. Next chapter: Blue Belt — Foundations Camp."$b$,'15',NULL,NULL);
