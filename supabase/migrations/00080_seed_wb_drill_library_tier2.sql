-- M80 — WB drill library, tier 2: the 11 remaining STPs (003, 004, 005,
-- 008, 009, 011, 013, 014, 020, 023, 025).
--
-- Source: TSS_BEGINNER_CAMP_WB_MANUAL v2.0 + WB Master Manual Parts 7-B
-- (Camp Drills CDR-WB-XX) + 8-B (Camp Missions CMS-WB-XX).
--
-- Brings the WB canonical library to 25/25 STPs covered. Each smaller
-- STP gets 1 drill + 1 mission (where pedagogically distinct); the
-- composite STPs (003-009) reuse the larger Sequence #1 mission rather
-- than duplicating one per micro-step.
--
-- Idempotent.

INSERT INTO drills_missions
  (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, block_name, display_order, active)
VALUES

-- ─── STP-003 · Grab Board ──────────────────────────────────────────
('DRL-WB-003-A','STP-003','Grab + Carry Technique','drill','5','3',
  ARRAY['tail + center','hip carry','no scraping'],
  E'Land drill. Show 2 carry options: hip-carry (board against hip, hand on rail) and head-carry (for long walks). Switch every 2 reps. Tail-and-center hand position when entering water.',
  ARRAY['Board never scrapes ground','Confident grip','Switches carry style smoothly'],
  'white','Land · Board Handling',1,true),

-- ─── STP-004 · Walk Out ────────────────────────────────────────────
('DRL-WB-004-A','STP-004','Sand + Rocky Walk-Out','drill','5','2',
  ARRAY['drag feet','board between you and ocean','calm pace'],
  E'Land + shallow water drill. Drag feet through sand entry — never lift (avoids buried rocks + stingrays). Board between you and the OPEN ocean, never between you and the wave. Pace = calm walking, not running.',
  ARRAY['Drags feet through entry','Board on the open-water side','No rushing'],
  'white','Land · Walk Out',1,true),

-- ─── STP-005 · Put Board in Water ──────────────────────────────────
('DRL-WB-005-A','STP-005','Board Drop + Mount','drill','5','3',
  ARRAY['waist-deep','flat','mount on first stroke'],
  E'Shallow-water drill. Walk out to waist-deep. Drop the board flat (no slap) → align with whitewater → mount it in one motion finding sweet spot.',
  ARRAY['Board lands flat','Aligned with whitewater','Mounts in one motion'],
  'white','Water · Mount',1,true),

-- ─── STP-008 · Turn Around Safely ──────────────────────────────────
('DRL-WB-008-A','STP-008','Safe Board Spin (shallow water)','drill','5','4',
  ARRAY['board never between you and wave','spin from tail','watch behind'],
  E'Shallow-water drill. Spin the board so the nose faces back to shore. The board NEVER comes between you and the incoming wave. Watch behind before spinning. Use tail-pivot (one hand on tail, other on rail).',
  ARRAY['Looks behind before spin','Tail pivot used','Board never trapped against wave'],
  'white','Water · Safe Turn',1,true),

-- ─── STP-009 · Walk Back to Sand ───────────────────────────────────
('DRL-WB-009-A','STP-009','Sand Return + Board Inspection','drill','5','1',
  ARRAY['walk it out','rinse','inspect for dings'],
  E'Land routine. After last wave: walk board out at the same calm pace, rinse if salty, inspect rails and fins for dings before storing. Daily habit.',
  ARRAY['Calm exit pace','Board rinsed','Quick ding-check done'],
  'white','Land · Return',1,true),

-- ─── STP-011 · Align with Whitewater ───────────────────────────────
('DRL-WB-011-A','STP-011','Alignment Land Sim','drill','5','4',
  ARRAY['nose perpendicular','look behind','adjust before paddling'],
  E'Land sim. Position the board so the nose points 90° to the imagined incoming whitewater. Adjust by hip-bumping the tail. Train the look-back-then-paddle rhythm.',
  ARRAY['Nose perpendicular to incoming wave','Look-back rhythm visible','Adjustment is small/calm'],
  'white','Land · Alignment',1,true),
('MIS-WB-011-A','STP-011','Aligned Catch in Whitewater','mission','20',NULL,
  ARRAY['align first','then paddle','commit when 1-4m away'],
  E'Water mission. The sequence is always: align → paddle → catch. Align nose with whitewater BEFORE starting to paddle. Commit to the paddle when whitewater is 1-4 m away.',
  ARRAY['Always aligns before paddling','Commits 1-4m away','Catches whitewater intentionally'],
  'white','Water · Alignment',1,true),

-- ─── STP-013 · Cobra + Turn Lying ──────────────────────────────────
('DRL-WB-013-A','STP-013','Cobra + Turn Lying (mat)','drill','8','6',
  ARRAY['cobra base','hips lead','no full pop-up'],
  E'Mat drill. Press into cobra (elbows under shoulders). To turn LEFT: hip + shoulder roll left while pushing right hand into mat. Mirror for right. Trains the prone direction control before standing.',
  ARRAY['Cobra base held','Hip + shoulder lead the roll','Returns to neutral cobra'],
  'white','Land · Cobra + Turn',1,true),
('MIS-WB-013-A','STP-013','Prone Directional Ride','mission','20',NULL,
  ARRAY['cobra commit','lying turn','no standing'],
  E'Water mission. Catch whitewater prone. Apply cobra → choose direction → roll hips + shoulders → ride lying down with directional control. Standing not required.',
  ARRAY['Cobra applied on each catch','Directional turn while lying','Rides with control'],
  'white','Water · Prone Ride',1,true),

-- ─── STP-014 · Prone Dismount ──────────────────────────────────────
('DRL-WB-014-A','STP-014','Prone Bail Technique','drill','5','4',
  ARRAY['slide off side','star-fall','protect head'],
  E'Land + shallow-water drill. From prone position → slide off the SIDE (not nose, not tail) → land flat on water (star-fall position) → never dive head-first. Practice both sides.',
  ARRAY['Slides off the side','Star-fall on landing','Never head-first'],
  'white','Land/Water · Bail',1,true),

-- ─── STP-020 · Starfish Dismount ───────────────────────────────────
('DRL-WB-020-A','STP-020','Starfish Position Drill','drill','5','5',
  ARRAY['arms wide','flat','face up'],
  E'Land + pool drill. From standing → step off → land in starfish position: arms extended wide (open like a star) · body flat · face up (NEVER dive head-first). Trains the safe automatic exit.',
  ARRAY['Arms wide on landing','Body flat (no folding)','Face up always'],
  'white','Land/Pool · Starfish',1,true),
('MIS-WB-020-A','STP-020','Starfish on Every Ride','mission','20',NULL,
  ARRAY['automatic','every wave','no flinch'],
  E'Water mission. Every wave ends with a starfish dismount — no exceptions. Makes the safe exit automatic. Coach calls "Starfish!" if forgotten.',
  ARRAY['Starfish on every ride','Automatic (no coach prompt)','Safe exit every time'],
  'white','Water · Starfish',1,true),

-- ─── STP-023 · Paddle Out (WB intro, YB master) ────────────────────
('DRL-WB-023-A','STP-023','Paddle-Out Path Choice','drill','10','3',
  ARRAY['channel first','timing','duck under whitewater'],
  E'Beach + land sim drill. Map the safe path out: prefer channels over impact zone, time sets, identify when to duck under whitewater. Walk the plan on sand first, then execute in shallow water.',
  ARRAY['Path mapped before entering','Chooses channel when available','Reads set timing'],
  'white','Land + Beach · Paddle Out',1,true),
('MIS-WB-023-A','STP-023','Paddle Out to Lineup','mission','30',NULL,
  ARRAY['V2 sustained','V3 for breaks','don’t stop'],
  E'Water mission. Paddle from shore to beyond the breaking line. Use V2 cruising, switch to V3 catching when a wave approaches. Don’t stop in the impact zone.',
  ARRAY['Sustained V2','Switches to V3 under pressure','Reaches lineup'],
  'white','Water · Paddle Out',1,true),

-- ─── STP-025 · Turn Left/Right Lying on Board ──────────────────────
('DRL-WB-025-A','STP-025','Lying Pivot Direction Drill','drill','5','6',
  ARRAY['weight shift','hand on rail','legs circular'],
  E'Mat or shallow-water drill. Lying prone on the board: shift weight back, one hand on rail, legs draw circular motion in the turning direction. Practice both sides. Trains the seated/lying pivot used pre-pop-up.',
  ARRAY['Pivot executes either direction','Returns to sweet spot cleanly','No loss of balance'],
  'white','Land/Pool · Lying Pivot',1,true)

ON CONFLICT (id) DO NOTHING;
