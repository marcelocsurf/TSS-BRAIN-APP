-- M120 — Seed the Foundation Camp (Blue Belt) 6-day template into SVC-CAMP-FOUND.
--
-- Source (verbatim, no invention): BB_FOUNDATION_CAMP_MANUAL.txt (v2.0 EN,
-- Canon v8.1) + the BB drill/mission/routine inventory (CDR-BB / CMS-BB /
-- CRT-BB IDs). Mirrors the proven SVC-CAMP-BEG (White) and SVC-CAMP-NOV
-- (Yellow) seeds: global template (academy_id NULL → assignable to ANY
-- academy), 6 days, one block per camp element.
--
-- EVALUATION GATING (per canon): step_id is set ONLY on water_mission blocks
-- training a real BB STP — those become officially gradable (cyan STP rating in
-- the coach planner) and feed the BB graduation rule (4 stars on every part).
-- Warm-ups, breathing, venue analysis, theory, land/skate drills, routines and
-- the closing carry step_id = NULL, so the coach is not prompted to grade them.
-- STP references for drills are kept in the block title for traceability only.
--
-- Uses a FRESH canonical id SVC-CAMP-FOUND-BB (the legacy SVC-CAMP-FOUND row
-- holds in-use test instances and is left untouched). Idempotent.

begin;

-- ── Template metadata ───────────────────────────────────────────────
insert into camp_templates
  (id, template_name, level_name, duration_days, modality, delivery_model, capacity_max,
   is_custom, service_kind, active_status, includes_course_key, card_color, accent_color, academy_id, description)
values
  ('SVC-CAMP-FOUND-BB','Surf Camp Foundation (Blue Belt)','Foundation',6,'group','in-person',4,
   false,'surf_camp',true,'blue_belt','#1E6FBF','#15497E',null,
   'TSS Foundation Camp · Blue Belt · 6 days · 4-6 students per coach. Belt Value: Compromiso Consciente ("There are no shortcuts. You have to walk the path."). Coach stance: L2 Practitioner · Audit/Refinement. Introduces the Universal Sequence Formula (Posture -> Rotation -> Projection -> Maneuver -> Closure -> Posture) and the 15 BB STPs (035-049): Pump FS/BS, Bottom Turn, Projection, Cruz Snap + Grenade, Choke + Tapaloco + Elbow, Cruz/Tapaloco Cutback + Hold, plus the 4 BB Concepts. Requires completed Yellow Belt.')
on conflict (id) do update set
  template_name=excluded.template_name, level_name=excluded.level_name, duration_days=excluded.duration_days,
  modality=excluded.modality, capacity_max=excluded.capacity_max, is_custom=excluded.is_custom,
  service_kind=excluded.service_kind, active_status=excluded.active_status,
  includes_course_key=excluded.includes_course_key, card_color=excluded.card_color,
  accent_color=excluded.accent_color, academy_id=excluded.academy_id, description=excluded.description;

-- ── Reset stale days + blocks ───────────────────────────────────────
delete from camp_template_blocks where template_day_id in (
  select id from camp_template_days where template_id = 'SVC-CAMP-FOUND-BB'
);
delete from camp_template_days where template_id = 'SVC-CAMP-FOUND-BB';

-- ── 6 clean days ────────────────────────────────────────────────────
insert into camp_template_days
  (id, template_id, day_number, venue_default, ocean_condition_target, day_goal, evaluation_focus, has_evaluation, evaluation_type)
values
('SVC-CAMP-FOUND-BB-DAY1','SVC-CAMP-FOUND-BB',1,'Green waves (whitewater backup)',
 'Green waves waist-to-chest high; whitewater fallback for the Pocket Game.',
 'Three Circles + Foundation Audit + Pump Introduction. Confirm the 17 White+Yellow foundation elements are owned at Blue Belt level. Teach the Three Circles of Power as the master diagnostic lens. Introduce internal force (Pump/Impulso preview) and the Pocket Game.',
 'Audit the 17 foundation elements (posture, rotation, compression, FP1/FP2/FP3, Press the Button, Cobra+Pick Line, duck dive, paddling V1-V4, wave reading). The Pocket Game is awareness practice, not yet a graded BB STP.',
 false, null),
('SVC-CAMP-FOUND-BB-DAY2','SVC-CAMP-FOUND-BB',2,'Green waves + Pool',
 'Green waves for pump; pool for paddling + duck dive refinement.',
 'Pump + Impulso Mechanics. Acquire the two internal-force tools. Independent Venue Analysis begins (the Coach Stance evolution marker). STP-035 FP1, STP-036 Pump FS, STP-037 Pump BS, STP-038 BS Body Mechanics.',
 'Grade the water missions: Pump Frontside (STP-036), Pump Backside (STP-037/038), FP1 transition (STP-035). 3 of 5 attempts per side is the camp threshold. Pool + land drills are practice, not graded.',
 false, null),
('SVC-CAMP-FOUND-BB-DAY3','SVC-CAMP-FOUND-BB',3,'Green waves',
 'Green waves with a rideable shoulder for the bottom turn.',
 'Bottom Turn + Projection + Hold Introduction. The founding session: introduce the Universal Sequence Formula. From today, every feedback uses the formula stage names. The 3 Questions Framework is introduced. STP-039 BT Medium, STP-040 Projection, Hold preview.',
 'Grade the water mission Pump + BT + Projection: BT in the mid-face (STP-039), Projection fires immediately after the BT (STP-040). Theory + the 3 Questions Framework are not graded.',
 false, null),
('SVC-CAMP-FOUND-BB-DAY4','SVC-CAMP-FOUND-BB',4,'Green waves',
 'Green waves with a workable pocket for snaps (FS + BS).',
 'Maneuvers + Rail Transitions. The critical day: complete the Universal Formula by adding Maneuver + Closure. First FS snap (Cruz + Grenade) and first BS snap (Choke + Tapaloco + Elbow). Formalize the Separation Rule. STP-041..045.',
 'Grade the water missions: FS chain Cruz Snap (STP-041) + Grenade (STP-042); BS chain Choke (STP-043) + Tapaloco (STP-044) + Elbow (STP-045). Audit the Separation Rule (Choke=setup, Tapaloco=rail change, Elbow=throw water).',
 false, null),
('SVC-CAMP-FOUND-BB-DAY5','SVC-CAMP-FOUND-BB',5,'Green waves',
 'Green waves with space for a return arc (cutback).',
 'Complete Chain + Self-Organization. Introduce the cutback class (returns to the pocket) and the operational Hold doctrine. Formalize self-organization (Infinite Circle + Sequential Learning Blocks). STP-046 Cruz Cutback, STP-047 Hold, STP-048 Tapaloco Cutback, STP-049 Hold Rotation (introduced).',
 'Grade the Rail Transitions water mission and the cutback attempts: Cruz Cutback + Hold (STP-046/047), Tapaloco Cutback + Hold Rotation (STP-048/049). Doctrinal rule: if you do not return to the pocket, it was a Snap, not a Cutback.',
 false, null),
('SVC-CAMP-FOUND-BB-DAY6','SVC-CAMP-FOUND-BB',6,'Green waves (application)',
 'Green waves to apply the full Infinite Circle; whitewater backup.',
 'Complete a Circle + Closing. Execute one full Infinite Circle on a wave (the camp-grade exit indicator). Personal Mission Map + diploma + ceremony. Pathway to the BB Exit Test (~6 more sessions).',
 'BB camp evaluation: rate the 15 BB STPs (035-049) across the full White->Yellow->Blue sequence. Per canon the Blue Belt is earned with 4 stars on EVERY part + >= 4 of 5 principles (audited later at the formal Exit Test). Formal coach rating via /camps/[id]/evaluate.',
 true, 'bb_exit_test');

-- ── Blocks ──────────────────────────────────────────────────────────
insert into camp_template_blocks
  (id, template_day_id, block_order, block_type, pilar, is_safety_layer,
   pilar_part, step_id, mission_custom, drill_custom, mission_time,
   evaluation_focus, activity_subtype)
values

-- ============== DAY 1 — Three Circles + Foundation Audit + Pump Intro ==============
('SVC-CAMP-FOUND-BB-D1-01','SVC-CAMP-FOUND-BB-DAY1',1,'custom','mental',false,
 $b$Welcome / Opening + Belt Value anchor — Compromiso Consciente (CRT-BB-06)$b$,null,null,
 $b$Welcome, hand out Foundation Camp notebooks. Name the Belt Value: "There are no shortcuts. You have to walk the path." Introduce yourself as L2 Practitioner Coach in audit/refinement stance — you will speak less, observe more, audit their self-correction.$b$,'5',null,null),
('SVC-CAMP-FOUND-BB-D1-02','SVC-CAMP-FOUND-BB-DAY1',2,'custom','technical',true,
 $b$Safety Rules + Communication Signals review$b$,null,null,
 $b$Non-negotiable even though all students passed WB+YB. Confirm every student remembers and can execute the "Are You OK?", "I Need Help!", and "Out of the Water!" signals.$b$,'10',null,null),
('SVC-CAMP-FOUND-BB-D1-03','SVC-CAMP-FOUND-BB-DAY1',3,'theory','technical',false,
 $b$Theory — The Game of Surfing + Two Forces (Internal + External)$b$,null,null,
 $b$Draw lines with intention; the game ends when speed is lost. External force = energy from the wave (pocket, lip, foam). Internal force = energy the surfer generates (Pump + Impulso). The BB surfer learns to combine and read when to use each.$b$,'15',null,null),
('SVC-CAMP-FOUND-BB-D1-04','SVC-CAMP-FOUND-BB-DAY1',4,'theory','technical',false,
 $b$Theory — The Three Circles of Power at BB$b$,null,null,
 $b$Circle 1 BODY = P.R.C.H (Posture, Rotation, Compression, Hold). Circle 2 BOARD = Foot Position (FP1 tail / FP2 center / FP3 forward) + Press the Button. Circle 3 WAVE = wave dynamics + internal vs external force. Doctrinal thread: the H of P.R.C.H is conceptual at White, operational at Blue (Seq #12/#13).$b$,'15',null,null),
('SVC-CAMP-FOUND-BB-D1-05','SVC-CAMP-FOUND-BB-DAY1',5,'warm_up','physical',false,
 $b$Group Warm-Up (CRT-BB-04)$b$,null,null,
 $b$Joint mobility, shoulder rotations, hip openers, ankle articulation. Activates the body for paddling + rotation.$b$,'10',null,$b$Head-to-toe$b$),
('SVC-CAMP-FOUND-BB-D1-06','SVC-CAMP-FOUND-BB-DAY1',6,'venue_analysis','tactical',false,
 $b$Group Venue Analysis (CRT-BB-05 · Day 1 only)$b$,null,null,
 $b$Coach-led on Day 1 (Independent from Day 2). What do you see? Identify wave direction, period, sets, pocket location, crowd. Connect to Circle 3 (WAVE). Group decides entry + positioning.$b$,'15',null,null),
('SVC-CAMP-FOUND-BB-D1-07','SVC-CAMP-FOUND-BB-DAY1',7,'land_drill','technical',false,
 $b$Land/Skate Drills — Stance + Power Posture (CDR-BB-01) · Three Circles on Land (CDR-BB-05) · Pop-Up + FP Switch (CDR-BB-03) · Rotation on Skateboard (CDR-BB-02)$b$,null,null,
 $b$Confirm goofy/regular + the 6 Power Posture details (shoulders/hips forward, weight on front foot, back knee forward, active scapula, elbow to ribs, active hands). Internalize the Three Circles. Press the Button FP2<->FP1. FS/BS rotation on skateboard.$b$,'45',null,null),
('SVC-CAMP-FOUND-BB-D1-08','SVC-CAMP-FOUND-BB-DAY1',8,'water_mission','tactical',false,
 $b$Water Mission — CMS-BB-01 · Pocket Game (Foundation Audit in water)$b$,null,
 $b$Play with the wave's pocket: stay close, move away, return without getting caught by the whitewater. Connect with the board via deliberate foot position. Diagnose every wave with the Three Circles (BODY/BOARD/WAVE).$b$,null,'60',
 $b$Audit the 17 foundation elements in green water: posture stable? rotation clean? FP deliberate? pocket awareness? duck dive automatic? Speak less than at YB — let students discover. (Foundation audit — not a new BB STP grade.)$b$,null),
('SVC-CAMP-FOUND-BB-D1-09','SVC-CAMP-FOUND-BB-DAY1',9,'custom','technical',false,
 $b$Video Analysis (Three Circles diagnostic)$b$,null,null,
 $b$Review footage with each student using the Three Circles: "What was your Circle 1 BODY? Circle 2 BOARD? Circle 3 WAVE?" Train the diagnostic discipline from Day 1.$b$,'15',null,null),
('SVC-CAMP-FOUND-BB-D1-10','SVC-CAMP-FOUND-BB-DAY1',10,'theory','tactical',false,
 $b$Theory cluster — Paddling Angle (3 options) · Cobra + Pick Line (BB depth) · Etiquette/Currents/Lost Board · Impulso preview$b$,null,null,
 $b$3 paddle angles (far / near / in front of the pocket). Pick the line by the maneuver intended (long BT = cutback line, mid-face BT = snap line). Refresh etiquette, currents, lost-board protocol. Preview Impulso: the instinctive flex-and-push that generates speed.$b$,'25',null,null),
('SVC-CAMP-FOUND-BB-D1-11','SVC-CAMP-FOUND-BB-DAY1',11,'custom','mental',false,
 $b$Day 1 Closing — Belt Value anchor (CRT-BB-06) + Notebook$b$,null,null,
 $b$Circle format: each student names one moment they honored Compromiso Consciente. Coach closes: "There are no shortcuts. You have to walk the path." Notebook: 1 win, 1 error, 1 mission for Day 2.$b$,'10',null,null),

-- ============== DAY 2 — Pump + Impulso Mechanics ==============
('SVC-CAMP-FOUND-BB-D2-01','SVC-CAMP-FOUND-BB-DAY2',1,'mental','mental',false,
 $b$Bhastrika Breathing (CRT-BB-01) + Opening$b$,null,null,
 $b$Formal breathing protocol from Day 2: 5 min controlled forceful nasal exhalation. Activates the parasympathetic system and focuses attention. "Today we acquire your first two internal-force tools — Pump and Impulso."$b$,'5',null,$b$Bhastrika$b$),
('SVC-CAMP-FOUND-BB-D2-02','SVC-CAMP-FOUND-BB-DAY2',2,'warm_up','physical',false,
 $b$Warm-Up (CRT-BB-04)$b$,null,null,$b$Standard TSS warm-up.$b$,'8',null,null),
('SVC-CAMP-FOUND-BB-D2-03','SVC-CAMP-FOUND-BB-DAY2',3,'venue_analysis','tactical',false,
 $b$Independent Venue Analysis (CRT-BB-05 · NEW at BB)$b$,null,null,
 $b$Doctrinal shift: the student leads, the coach confirms. Each student spends 5 min alone reading the venue (pocket, current, positioning, expected wave count), then verbalizes their read for confirmation. This is the operational marker of the YB->BB stance evolution.$b$,'8',null,null),
('SVC-CAMP-FOUND-BB-D2-04','SVC-CAMP-FOUND-BB-DAY2',4,'theory','technical',false,
 $b$Theory — How to Catch More Waves + Pump/Impulso Mechanics$b$,null,null,
 $b$Read sets early, position ahead of the pocket. Pump (cyclical, FP3, hands lead, weight forward) vs Impulso (single-shot, two hands flex + propel). Shared principle: weight stays forward — drifting back loses all generated speed.$b$,'20',null,null),
('SVC-CAMP-FOUND-BB-D2-05','SVC-CAMP-FOUND-BB-DAY2',5,'land_drill','technical',false,
 $b$Pump Mechanics Drill (CDR-BB-04) — land + skateboard$b$,null,null,
 $b$EDPF. Land: 20 pump reps in FP3, weight forward, hands driving. Skateboard: pump going straight — the board must visibly accelerate; if not, weight is drifting back. Demonstrate Impulso (two-hand flex) 5 reps.$b$,'40',null,null),
('SVC-CAMP-FOUND-BB-D2-06','SVC-CAMP-FOUND-BB-DAY2',6,'water_mission','technical',false,
 $b$Water Mission — CMS-BB-03 · Connect + Foot to FP1 + Return (STP-035)$b$,'STP-035',
 $b$Go into the water, connect with the board, deliberately move the foot to FP1, and return to the whitewater. Audit: is FP1 deliberate or accidental?$b$,null,'30',
 $b$Grade STP-035 (FP1 Operationalized): back foot all the way to the tail, weight 60/40 back, switch deliberate. FP1 for maneuvers, FP2 for cruising — never confused.$b$,null),
('SVC-CAMP-FOUND-BB-D2-07','SVC-CAMP-FOUND-BB-DAY2',7,'water_mission','technical',false,
 $b$Water Mission — Pump Frontside (STP-036)$b$,'STP-036',
 $b$Generate speed on a frontside wave with 3 consecutive pump cycles. The board should visibly accelerate.$b$,null,'30',
 $b$Grade STP-036 (Pump FS): FP3 stance, weight forward, hands lead the rhythm, board accelerates. Camp threshold 3/5 attempts.$b$,null),
('SVC-CAMP-FOUND-BB-D2-08','SVC-CAMP-FOUND-BB-DAY2',8,'water_mission','technical',false,
 $b$Water Mission — Pump Backside + BS Body Mechanics (STP-037)$b$,'STP-037',
 $b$Apply the pump on a backside wave: chest open, eyes over the back shoulder, leading hand drives. Includes the BS Rotation Activation (STP-038) in the pre-paddle setup.$b$,null,'30',
 $b$Grade STP-037 (Pump BS) with STP-038 mechanics active: chest open, eye lead over shoulder, oblique engaged, weight forward. Camp threshold 3/5 per side.$b$,null),
('SVC-CAMP-FOUND-BB-D2-09','SVC-CAMP-FOUND-BB-DAY2',9,'water_mission','tactical',false,
 $b$Water Mission — CMS-BB-04 · Add Impulso When Speed is Needed$b$,null,
 $b$Add Impulso (momentum) whenever extra speed is needed — when stuck on foam or after losing momentum.$b$,null,'20',
 $b$Audit: does the student use Impulso when stuck, or let momentum die? (Impulso is a BB Concept tool — practiced here, not a discrete STP grade.)$b$,null),
('SVC-CAMP-FOUND-BB-D2-10','SVC-CAMP-FOUND-BB-DAY2',10,'custom','technical',false,
 $b$Video Analysis + Pool (CDR-BB-11 · paddling V1-V4 + duck dive)$b$,null,null,
 $b$Video: was FP1 deliberate? Was Impulso used when needed? Pool: refine paddling mechanics + confirm the 10-step duck dive is automatic.$b$,'40',null,null),
('SVC-CAMP-FOUND-BB-D2-11','SVC-CAMP-FOUND-BB-DAY2',11,'custom','mental',false,
 $b$Day 2 Closing (CRT-BB-06) + Notebook$b$,null,null,
 $b$"Where did I use Compromiso Consciente today?" Coach closes with the mantra. Notebook entries.$b$,'10',null,null),

-- ============== DAY 3 — Bottom Turn + Projection + Hold Introduction ==============
('SVC-CAMP-FOUND-BB-D3-01','SVC-CAMP-FOUND-BB-DAY3',1,'mental','mental',false,
 $b$Bhastrika (CRT-BB-01) + Opening$b$,null,null,
 $b$"Today we introduce the Universal Sequence Formula — the architecture of every BB maneuver."$b$,'5',null,$b$Bhastrika$b$),
('SVC-CAMP-FOUND-BB-D3-02','SVC-CAMP-FOUND-BB-DAY3',2,'warm_up','physical',false,
 $b$Warm-Up + Independent Venue Analysis$b$,null,null,$b$Students lead the venue read; coach confirms.$b$,'15',null,null),
('SVC-CAMP-FOUND-BB-D3-03','SVC-CAMP-FOUND-BB-DAY3',3,'theory','technical',false,
 $b$Theory — The Universal Sequence Formula (the founding moment)$b$,null,null,
 $b$Posture -> Rotation -> Projection -> Maneuver -> Closure -> Posture. Walk each stage. Threshold: "Execution with awareness, not perfection. We do not skip stages." Have students verbalize the formula 5 times — from now on it is the language.$b$,'15',null,null),
('SVC-CAMP-FOUND-BB-D3-04','SVC-CAMP-FOUND-BB-DAY3',4,'theory','technical',false,
 $b$Theory — Bottom Turn + Projection + 4 Types of BT + Hold preview$b$,null,null,
 $b$The BT is the U you draw on the wave face; it ends when the Projection begins. 4 BT types: Deep, Mid-Face (STP-039 default), Long (cutbacks), Extended. Projection = stored energy converts to forward+upward (legs extend, chest aligns, arms rise). Hold preview = maintaining a position is itself an action.$b$,'20',null,null),
('SVC-CAMP-FOUND-BB-D3-05','SVC-CAMP-FOUND-BB-DAY3',5,'land_drill','technical',false,
 $b$BT + Projection 3-Level Drill (CDR-BB-07) — land + chalk-U + skateboard$b$,null,null,
 $b$Level 1 land: Posture -> Rotation (flex + hold briefly) -> Projection (extend + arm), 5 reps/side. Level 2: follow a chalk U, execute Rotation+Projection at the mark. Level 3 skateboard: Posture -> Rotation -> Hold -> Projection. First taste of the Hold doctrine.$b$,'45',null,null),
('SVC-CAMP-FOUND-BB-D3-06','SVC-CAMP-FOUND-BB-DAY3',6,'water_mission','technical',false,
 $b$Water Mission — CMS-BB-05 · Pump + Bottom Turn (STP-039)$b$,'STP-039',
 $b$Pump to set up, then execute a Bottom Turn in the mid-face. If the wave is fast, keep pumping to maintain speed.$b$,null,'30',
 $b$Grade STP-039 (BT Medium): visible U in the mid-face (not the flat, not too high), oblique engaged, flows directly into Projection with no gap.$b$,null),
('SVC-CAMP-FOUND-BB-D3-07','SVC-CAMP-FOUND-BB-DAY3',7,'water_mission','technical',false,
 $b$Water Mission — Projection after BT (STP-040)$b$,'STP-040',
 $b$On each BT, fire the Projection immediately: legs extend, chest aligns, arms rise. No maneuver required yet.$b$,null,'30',
 $b$Grade STP-040 (Projection): fires immediately after the BT, full leg extension, visible upward arm drive.$b$,null),
('SVC-CAMP-FOUND-BB-D3-08','SVC-CAMP-FOUND-BB-DAY3',8,'custom','mental',false,
 $b$Video Analysis (Universal Formula language) + Self-Correction Drill (CDR-BB-10 · 3 Questions — introduced today)$b$,null,null,
 $b$Video: from today every comment names a stage (no generic feedback). 3 Questions Framework: (1) What do I want but can't? (2) Execution or decision problem? (3) What causes it (physical/mental/technical/tactical)? Student picks ONE to work next session.$b$,'30',null,null),
('SVC-CAMP-FOUND-BB-D3-09','SVC-CAMP-FOUND-BB-DAY3',9,'custom','mental',false,
 $b$Day 3 Closing (CRT-BB-06) + Notebook + 3 Questions$b$,null,null,
 $b$"What stage of the Universal Formula did I honor today? Which did I skip?" Mantra. Notebook + 3 Questions answer + tomorrow's mission.$b$,'10',null,null),

-- ============== DAY 4 — Maneuvers + Rail Transitions ==============
('SVC-CAMP-FOUND-BB-D4-01','SVC-CAMP-FOUND-BB-DAY4',1,'mental','mental',false,
 $b$Bhastrika + Visualization + Opening$b$,null,null,
 $b$"Today is the critical day. You complete the Universal Formula by adding the Maneuver and the Closure." Visualize 3 mental reps of the full FS chain: Posture -> BT -> Projection -> Cruz -> Grenade -> Posture.$b$,'10',null,$b$Bhastrika + Visualization$b$),
('SVC-CAMP-FOUND-BB-D4-02','SVC-CAMP-FOUND-BB-DAY4',2,'venue_analysis','tactical',false,
 $b$Independent Venue Analysis + Goal Setting$b$,null,null,
 $b$Student-led read + written target: "Execute X consecutive Universal Formula chains FS, Y on BS."$b$,'15',null,null),
('SVC-CAMP-FOUND-BB-D4-03','SVC-CAMP-FOUND-BB-DAY4',3,'theory','technical',false,
 $b$Theory — Maneuvers (Rail Change) + Fundamental Maneuvers + The Separation Rule$b$,null,null,
 $b$A maneuver is a change of direction via the rails. FS chain: Cruz -> Grenade. BS chain: Choke -> Tapaloco -> Elbow. The 4 fundamental maneuvers: Cutback (BB), Floater (BB), Carve + Reentry (post-BB). Separation Rule: Choke = SETUP, Tapaloco = RAIL CHANGE, Elbow = THROW WATER — felt as separate phases.$b$,'25',null,null),
('SVC-CAMP-FOUND-BB-D4-04','SVC-CAMP-FOUND-BB-DAY4',4,'land_drill','technical',false,
 $b$Rail Transition Full Chain (CDR-BB-08) — land + chalk + skateboard$b$,null,null,
 $b$THE drill of the camp. Practice both chains step by step: BT + Hold -> Projection -> Cruz + Grenade (FS) OR Tapaloco + Codazo/Elbow (BS) -> return to posture. Isolate Choke / Tapaloco / Elbow, then recombine. Skateboard following a chalk line, 4-8 reps.$b$,'60',null,null),
('SVC-CAMP-FOUND-BB-D4-05','SVC-CAMP-FOUND-BB-DAY4',5,'water_mission','technical',false,
 $b$Water Mission — CMS-BB-06 · FS Snap: Cruz Snap (STP-041)$b$,'STP-041',
 $b$BT + Projection + Cruz Snap on a frontside wave. Cruz = palms forward, chest open, eyes over shoulder, oblique engaged, rail changed.$b$,null,'25',
 $b$Grade STP-041 (Cruz Snap): all 5 Cruz details present including the rail change; hand crosses before the rail changes.$b$,null),
('SVC-CAMP-FOUND-BB-D4-06','SVC-CAMP-FOUND-BB-DAY4',6,'water_mission','technical',false,
 $b$Water Mission — FS Closure: Grenade (STP-042)$b$,'STP-042',
 $b$Close the Cruz Snap with the Grenade: explode, throw the leading arm, return to a Low Finish (hips down, chest over front knee).$b$,null,'20',
 $b$Grade STP-042 (Grenade): explosive commitment, returns to Low Finish, ready for the next cycle. Full FS chain with no stage skipped.$b$,null),
('SVC-CAMP-FOUND-BB-D4-07','SVC-CAMP-FOUND-BB-DAY4',7,'water_mission','technical',false,
 $b$Water Mission — BS Snap: Choke + Tapaloco (STP-043 / STP-044)$b$,'STP-043',
 $b$Backside chain: Choke (cross-arm + leg extension, chest rotates) sets up the Tapaloco (HAND variant, palm up, over head, covering the opposite ear). Weight forward throughout.$b$,null,'25',
 $b$Grade STP-043 (Choke) into STP-044 (Tapaloco): chest rotates, legs extend, palm up, hand covers opposite ear, weight forward (the most critical BS error is weight drifting back).$b$,null),
('SVC-CAMP-FOUND-BB-D4-08','SVC-CAMP-FOUND-BB-DAY4',8,'water_mission','technical',false,
 $b$Water Mission — BS Closure: Elbow / Codazo (STP-045)$b$,'STP-045',
 $b$Close the BS chain with the Elbow: elbow UP, opposite scapula activates as if uniting both, back foot follows the elbow. Water is visibly thrown.$b$,null,'20',
 $b$Grade STP-045 (Elbow): elbow up (not down), scapulas unite, back foot follows, water thrown. Full BS chain with no stage skipped.$b$,null),
('SVC-CAMP-FOUND-BB-D4-09','SVC-CAMP-FOUND-BB-DAY4',9,'custom','mental',false,
 $b$Video Analysis (Snap vs Cutback) + 3 Questions + Closing$b$,null,null,
 $b$Identify which stages were present/skipped and the maneuver class. Doctrinal rule: "If you didn't return to the pocket, it was a Snap, not a Cutback." 3 Questions in notebook. Mantra close.$b$,'30',null,null),

-- ============== DAY 5 — Complete Chain + Self-Organization ==============
('SVC-CAMP-FOUND-BB-D5-01','SVC-CAMP-FOUND-BB-DAY5',1,'mental','mental',false,
 $b$Bhastrika + Opening$b$,null,null,
 $b$"Yesterday we completed the Universal Formula. Today we add the cutback — the maneuver that returns to the pocket — and formalize self-organization."$b$,'5',null,$b$Bhastrika$b$),
('SVC-CAMP-FOUND-BB-D5-02','SVC-CAMP-FOUND-BB-DAY5',2,'venue_analysis','tactical',false,
 $b$Independent Venue Analysis + Goal Setting + Land Simulation$b$,null,null,
 $b$Student-led venue read. Then 5 reps of the complete Universal Formula on land: Posture -> BT -> Projection -> Cruz/Tapaloco -> Grenade/Codazo -> Posture. Coach observes silently, audits at the end.$b$,'25',null,null),
('SVC-CAMP-FOUND-BB-D5-03','SVC-CAMP-FOUND-BB-DAY5',3,'theory','technical',false,
 $b$Theory — Cruz Cutback + Hold (Seq #12) and Tapaloco Cutback + Hold Rotation (Seq #13)$b$,null,null,
 $b$The Cutback is the Snap extended: MAINTAIN the Cruz/Tapaloco position longer (the Hold = the H of P.R.C.H) until you see the foam returning, then close. "If you don't return, it was a Snap." Cutbacks use a LONGER bottom turn to create space for the return arc. Codazo = BS equivalent of the Grenade.$b$,'35',null,null),
('SVC-CAMP-FOUND-BB-D5-04','SVC-CAMP-FOUND-BB-DAY5',4,'water_mission','technical',false,
 $b$Water Mission — CMS-BB-07 · Rail Transitions Game: FS Cruz Cutback + Hold (STP-046 / STP-047)$b$,'STP-046',
 $b$Frontside: Projection + Cruz, MAINTAIN the Hold until you see the foam, then Grenade. 5 transitions. The "game" framing keeps energy playful.$b$,null,'30',
 $b$Grade STP-046 (Cruz Cutback) + STP-047 (Hold): single continuous line, returns to the pocket, leg stays flexed through the Hold until the Grenade fires.$b$,null),
('SVC-CAMP-FOUND-BB-D5-05','SVC-CAMP-FOUND-BB-DAY5',5,'water_mission','technical',false,
 $b$Water Mission — BS Tapaloco Cutback + Hold Rotation (STP-048 / STP-049)$b$,'STP-048',
 $b$Backside: after the Tapaloco, enter the new-rail position with simple rotation, HOLD until you see the foam, then throw the Codazo. Survive the foam return and come back out to the wave face.$b$,null,'30',
 $b$Grade STP-048 (Tapaloco Cutback) + STP-049 (Hold Rotation): Tapaloco position maintained through the Hold, single continuous arc, survives the foam return. (Introduced at camp; mastery comes post-camp.)$b$,null),
('SVC-CAMP-FOUND-BB-D5-06','SVC-CAMP-FOUND-BB-DAY5',6,'theory','mental',false,
 $b$Class — Self-Organization: Infinite Circle + Sequential Learning Blocks + 3 Questions deepening$b$,null,null,
 $b$Infinite Circle: Posture -> Rotation/BT -> Projection -> Maneuver -> Recovery -> Posture (repeat). Sequential Learning Blocks 0-7 (Blocks 1-3 sequential once per wave; 4-7 cyclical). Re-anchor the 3 Questions Framework as the lifelong self-correction tool.$b$,'30',null,null),
('SVC-CAMP-FOUND-BB-D5-07','SVC-CAMP-FOUND-BB-DAY5',7,'custom','mental',false,
 $b$Visualization (CDR-BB-09) + Pool Session 2 (CDR-BB-11) + Closing$b$,null,null,
 $b$Guided visualization + write tomorrow's goal. Pool: refine paddling V1-V4 + duck dive (now fully automatic). Closing: "What did the 3 Questions reveal to me today?" Mantra + notebook.$b$,'45',null,null),

-- ============== DAY 6 — Complete a Circle + Closing ==============
('SVC-CAMP-FOUND-BB-D6-01','SVC-CAMP-FOUND-BB-DAY6',1,'mental','mental',false,
 $b$Bhastrika + Opening$b$,null,null,
 $b$"Final day. Today you complete a full Infinite Circle on a wave — the camp-grade exit indicator. If you can complete a Circle today, you are at BB-graduation threshold."$b$,'5',null,$b$Bhastrika$b$),
('SVC-CAMP-FOUND-BB-D6-02','SVC-CAMP-FOUND-BB-DAY6',2,'venue_analysis','tactical',false,
 $b$Independent Venue Analysis + Goal Setting + Land Simulation (full Infinite Circle)$b$,null,null,
 $b$Students lead fully. 3 land reps of the complete Infinite Circle: Posture -> BT -> Projection -> Maneuver -> Closure -> Recovery -> Posture. Audit: is the Recovery (Low Finish + Impulso) present and is the cycle ready to repeat?$b$,'30',null,null),
('SVC-CAMP-FOUND-BB-D6-03','SVC-CAMP-FOUND-BB-DAY6',3,'water_mission','technical',false,
 $b$Water Mission — CMS-BB-08 · Complete a Circle (full Infinite Circle on a wave)$b$,null,
 $b$Execute one complete Infinite Circle iteration: Posture -> Rotation (BT) -> Projection -> Maneuver (Snap or Cutback) -> Closure (Grenade or Codazo) -> Recovery (Low Finish, Impulso if needed) -> Posture, ready for the next iteration.$b$,null,'90',
 $b$Camp-grade success = at least one full Infinite Circle in clean form: all 6 stages present, no stage skipped, closure returns to Low Finish, student can self-verbalize what happened. (Formal STP grading of the 15 BB STPs happens in the evaluation block below.)$b$,null),
('SVC-CAMP-FOUND-BB-D6-04','SVC-CAMP-FOUND-BB-DAY6',4,'custom','technical',false,
 $b$Video Analysis (best/worst wave + breakdown pattern) + Personal Mission Map$b$,null,null,
 $b$Identify each student's best Infinite Circle, worst wave, and the repeatedly-failing stage. Write the Personal Mission Map: strongest/weakest stage, one mission per sequence for the next 6 sessions, recommended drills, Exit Test target date (>= 6 weeks out).$b$,'60',null,null),
('SVC-CAMP-FOUND-BB-D6-05','SVC-CAMP-FOUND-BB-DAY6',5,'evaluation','technical',false,
 $b$BB Camp Evaluation — rate the 15 BB STPs (035-049) + audit the 5 principles$b$,null,null,
 $b$Open /camps/[id]/evaluate. Rate each STP across the White->Yellow->Blue sequence. Canon rule: Blue Belt is earned with 4 stars on EVERY part + >= 4 of 5 principles. The camp is ~6 of the ~12 sessions needed; the formal Exit Test (1:1, audited self-evaluation) happens >= 6 weeks post-camp per the BB Coach Course.$b$,'30',
 $b$Formal coach rating of the 15 BB STPs. The graduation gate (4 stars on every part) is enforced by the evaluation screen.$b$,null),
('SVC-CAMP-FOUND-BB-D6-06','SVC-CAMP-FOUND-BB-DAY6',6,'custom','mental',false,
 $b$Final Doctrinal Frame + Diploma + Photo + Closing Circle (CRT-BB-06)$b$,null,null,
 $b$"You have been introduced to all 15 Blue Belt STPs and used the Universal Sequence Formula on real waves. Blue Belt is owned through ~12 sessions of intentional practice. This camp is the kickstart. The walk is yours." Diploma + group photo. Closing circle: What did I learn? What is my commitment? What does Compromiso Consciente mean to me now? Mantra: "There are no shortcuts. You have to walk the path."$b$,'20',null,null);

commit;
