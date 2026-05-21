-- M55 — Yellow Belt drills, verbatim from the Unified Student Course.
--
-- Source: TSS_UNIFIED_STUDENT_COURSE_v1.md (per-STP "### Drill N" sections).
--
-- Per STP we keep the existing main drill (DRL-YB-0XX) with updated
-- canonical text, and INSERT additional rows for the secondary drills
-- (DRL-YB-0XX-02, -03, etc.). STP-030 and STP-031 get 6 canonical drills
-- each; the rest get 1-3 as defined by the unified course.
--
-- Missions (MIS-YB-0XX) get their canonical text + enriched success_criteria.
-- All UPDATEs idempotent; INSERTs use ON CONFLICT DO NOTHING.

-- ════════════════════════════════════════════════════════
-- DRILLS
-- ════════════════════════════════════════════════════════

-- ─── STP-027 · Paddling Speeds ───
UPDATE drills_missions SET
  title = '4-Speed Ladder (calm water)',
  description_md = 'Have someone (or yourself) call out "V1... V3... V2... V4" and switch on command. 3 minutes. Match paddle cadence + breath to the called speed without losing form.',
  reps_recommended = '3 minutes per cycle',
  key_words = ARRAY['V1','V2','V3','V4','RHYTHM']::TEXT[],
  success_criteria = ARRAY[
    'Demonstrates all 4 speeds on command without losing form.',
    'Adjusts speed to context (distance + wave energy + time) without instruction.',
    'Sustains V3–V4 for ≥30 seconds without breathing collapse.'
  ]::TEXT[]
WHERE id = 'DRL-YB-027';

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, display_order, active) VALUES
('DRL-YB-027-02', 'STP-027', 'Match-the-Wave (lineup)', 'drill', '1 session', 'every paddle attempt',
 ARRAY['SPEED','CONTEXT','SELF-CHECK']::TEXT[],
 'After every paddle attempt, ask yourself out loud: *what speed did I use and why?* Self-audit the speed-to-context match wave by wave.',
 ARRAY[
   'Verbal self-audit on each paddle attempt across the full session.',
   'Coach observes correct speed choice without external prompts in ≥3 of every 4 paddle-ins.'
 ]::TEXT[],
 'yellow', 27, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ─── STP-033 · Wave Stages ───
UPDATE drills_missions SET
  title = 'Stage ID from Shore',
  description_md = 'Watch real waves from shore. Verbally identify the stage of each wave as it evolves. Track 20+ waves per session.',
  reps_recommended = 'until 20 waves identified',
  key_words = ARRAY['SCAN','STAGE','PREDICT','POCKET','DECIDE']::TEXT[],
  success_criteria = ARRAY[
    'Identifies all 4 stages on real waves without coach assistance.',
    'Predicts WHERE the wave will break BEFORE it arrives.',
    'Distinguishes wave types (left, right, A-frame, closeout) on the fly.'
  ]::TEXT[]
WHERE id = 'DRL-YB-033';

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, display_order, active) VALUES
('DRL-YB-033-02', 'STP-033', 'Live Lineup Reading', 'drill', '1 session', 'every set',
 ARRAY['LINEUP','PREDICT','CALL']::TEXT[],
 'In the lineup, before each set, call out what stage each incoming wave is in. Predict where it will break first.',
 ARRAY[
   'Correctly calls stages on ≥8 of 10 waves.',
   'Predicts break point before the wave arrives, validated by what actually happens.'
 ]::TEXT[],
 'yellow', 33, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ─── STP-028 · Chase the Pocket ───
UPDATE drills_missions SET
  title = 'Visual Tracking + Pointing',
  description_md = 'From shore, track each wave with your eyes from formation to break, pointing at the pocket as it forms. Identify multiple pockets when present (wave closing both sides).',
  reps_recommended = '10 waves with pointing',
  key_words = ARRAY['POCKET','EYES','DISTANCE','SPEED','POSITION']::TEXT[],
  success_criteria = ARRAY[
    'Points at the pocket instantly when asked on real waves.',
    'Recognizes multiple pockets when waves close on both sides.',
    'Pointing matches where the lip actually forms.'
  ]::TEXT[]
WHERE id = 'DRL-YB-028';

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, display_order, active) VALUES
('DRL-YB-028-02', 'STP-028', 'Paddle-and-Turn', 'drill', '15 min', '8 paddle-ins',
 ARRAY['POCKET','DISTANCE','SELF-CALIBRATE']::TEXT[],
 'Paddle toward the pocket as deep as possible, then turn around immediately without catching. Self-calibration of distance — feel how far you really were.',
 ARRAY[
   'Reaches the pocket without last-second adjustments.',
   'Verbally reports distance estimate before each turn — improves session over session.'
 ]::TEXT[],
 'yellow', 28, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ─── STP-029 · Correct Angle ───
UPDATE drills_missions SET
  title = 'Spot & Paddle',
  description_md = 'See pocket → paddle to position there. Pure exercise of converting visual ID into directional commitment.',
  reps_recommended = '5 catch attempts',
  key_words = ARRAY['POCKET','STAGE','ANGLE','SCAN','PADDLE']::TEXT[],
  success_criteria = ARRAY[
    'Selects one of the 3 angle options based on context, without coach instruction.',
    'Reaches the pocket without a last-second frantic adjustment.',
    'Does NOT paddle into Stage 1 — recognizes the wave isn''t yet catchable.'
  ]::TEXT[]
WHERE id = 'DRL-YB-029';

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, display_order, active) VALUES
('DRL-YB-029-02', 'STP-029', 'Deep Position, Paddle to Foam', 'drill', '15 min', '5 attempts',
 ARRAY['DEEP','OPTION-1','FOAM']::TEXT[],
 'Position deep at the pocket → paddle toward the foam direction. Practices Option 1 specifically.',
 ARRAY[
   'Deep positioning relative to the pocket is held before the catch.',
   'Foam direction matches the wave''s actual break direction.'
 ]::TEXT[],
 'yellow', 29, TRUE),
('DRL-YB-029-03', 'STP-029', 'Paddle + Catch + Cobra', 'drill', '15 min', '5 catches',
 ARRAY['PADDLE','CATCH','COBRA']::TEXT[],
 'Paddle to pocket → catch wave → execute cobra. **Bridge to STP-034.** Tie the angle choice to the cobra execution as one continuous action.',
 ARRAY[
   'Cobra executed within 1–2 seconds of the catch.',
   'Angle choice + cobra read as one decision, not two.'
 ]::TEXT[],
 'yellow', 29, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ─── STP-034 · Cobra + Pick Line ───
UPDATE drills_missions SET
  title = 'Line Hold',
  description_md = 'After catching the wave, do the cobra + pick your line, then **surf lying down for at least 5 seconds before standing up**. Feel the TIME generated. Then pop-up.',
  reps_recommended = '5 prone-surfed waves',
  key_words = ARRAY['CATCH','COBRA','LINE','TIME','POP']::TEXT[],
  success_criteria = ARRAY[
    'Executes cobra + line redirect within 1–2 seconds of catching.',
    'Maintains speed ≥5 seconds after the cobra.',
    'Pop-up happens while still in trim (not rushed) because TIME was generated.'
  ]::TEXT[]
WHERE id = 'DRL-YB-034';

-- ─── STP-030 · Pop Up + FP1/FP2 — 6 canonical drills ───
UPDATE drills_missions SET
  title = 'Mat repetitions',
  description_md = 'Mat with center line on land. Practice pop-ups landing in the correct spot. Build the muscle pattern without water variability.',
  reps_recommended = '20 reps × 3 sets',
  key_words = ARRAY['MAT','CENTER','LAND','REP']::TEXT[],
  success_criteria = ARRAY[
    'Back foot lands consistently on the center line.',
    'Front foot lands centered without correction.',
    'Hands stay at rib height throughout the motion.'
  ]::TEXT[]
WHERE id = 'DRL-YB-030';

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, display_order, active) VALUES
('DRL-YB-030-02', 'STP-030', 'Pop-up reps — 3 methods (dry)', 'drill', '15 min', '10 reps per method',
 ARRAY['FIGURE-4','SCORPION','METHOD']::TEXT[],
 'Practice all 3 dry methods (Figure 4 · Scorpion rotated · Scorpion momentum). 10 reps each. Find which method feels best in your body.',
 ARRAY[
   'Demonstrates all 3 methods correctly.',
   'Identifies and verbalizes which method feels most natural.',
   'No method produces a balance loss in dry reps.'
 ]::TEXT[],
 'yellow', 30, TRUE),
('DRL-YB-030-03', 'STP-030', 'Foot shuffle FP1↔FP2', 'drill', '10 min', '20 shuffles',
 ARRAY['SHUFFLE','FP1','FP2','FRONT-CENTER']::TEXT[],
 'On the mat or surfskate, in stance: drag the back foot from FP2 to FP1 and back. Keep the front foot centered the whole time. Build the conscious shuffle.',
 ARRAY[
   'Shuffle executed deliberately, not by accident.',
   'Front foot stays centered throughout.',
   'Smooth transition without releasing balance.'
 ]::TEXT[],
 'yellow', 30, TRUE),
('DRL-YB-030-04', 'STP-030', 'Visualization with breathing', 'drill', '5 min', '5 visualizations',
 ARRAY['MENTAL','BREATH','REHEARSAL']::TEXT[],
 'Mental rehearsal of the pop-up + landing. Sync each phase with breath: inhale into compression, exhale through the lift.',
 ARRAY[
   'Visualization covers full sequence: cobra → drag → lift → land FP2.',
   'Breathing pattern matches the phases consistently.'
 ]::TEXT[],
 'yellow', 30, TRUE),
('DRL-YB-030-05', 'STP-030', 'Connected pop-up (water · classical)', 'drill', '20 min', '10 pop-ups',
 ARRAY['CONNECTED','CLASSICAL','WATER']::TEXT[],
 'In the water, isolated pop-up reps on whitewater or small green. Focus on staying connected to the board throughout the transition. Don''t release until stable.',
 ARRAY[
   'Stays connected to the board through the full transition.',
   'Lands FP2 by default.',
   'No release until stability is confirmed.'
 ]::TEXT[],
 'yellow', 30, TRUE),
('DRL-YB-030-06', 'STP-030', 'Pop-up while surfing (ecological)', 'drill', '30 min', 'every catch',
 ARRAY['ECOLOGICAL','CONTINUOUS','INTEGRATED']::TEXT[],
 'Pop-up as a continuation of the catch, not as a separate action. You''re already surfing prone (from STP-034 Line Hold) — the pop-up is the next phase of the same ride. **Not two parts. One action.**',
 ARRAY[
   'Pop-up reads as continuation of the prone surf, not a stop-and-start.',
   'TIME generated from STP-034 carries into the pop-up.',
   'Demonstrates FP1↔FP2 shuffle mid-ride when the wave invites it.'
 ]::TEXT[],
 'yellow', 30, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ─── STP-031 · Go Up and Down — 6 canonical drills ───
UPDATE drills_missions SET
  title = 'Up/Down Cycle',
  description_md = 'Pump without going to the flat or leaving the wave. One continuous up-down cycle as the fundamental skill. Build the chain.',
  reps_recommended = 'longest chain possible per wave',
  key_words = ARRAY['DOWN','COMPRESS','UP','EXTEND','STAY']::TEXT[],
  success_criteria = ARRAY[
    'Executes one complete up-down cycle without going to the flat.',
    'Sustains ≥3 pump cycles in a single ride.',
    'Maintains pocket proximity throughout the cycle.'
  ]::TEXT[]
WHERE id = 'DRL-YB-031';

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, display_order, active) VALUES
('DRL-YB-031-02', 'STP-031', 'Frontside Pump', 'drill', '20 min', 'every frontside wave',
 ARRAY['FRONTSIDE','PUMP','ROTATION']::TEXT[],
 'Apply the up/down cycle on frontside (wave at the front of your body, chest toward the face). Compress + rotate down, extend + rotate up.',
 ARRAY[
   'Compression-extension cycle visible on frontside rides.',
   'Pump generates speed, not just movement.'
 ]::TEXT[],
 'yellow', 31, TRUE),
('DRL-YB-031-03', 'STP-031', 'Backside Pump', 'drill', '20 min', 'every backside wave',
 ARRAY['BACKSIDE','PUMP','ROTATION']::TEXT[],
 'Same theory as frontside, opposite rotational direction. Wave behind you. Often weaker initially — drill until symmetric.',
 ARRAY[
   'Compression-extension cycle visible on backside rides.',
   'No drop in quality vs frontside after focused practice.'
 ]::TEXT[],
 'yellow', 31, TRUE),
('DRL-YB-031-04', 'STP-031', 'Pocket Proximity (slow wave)', 'drill', '20 min', 'slow waves only',
 ARRAY['POCKET','PROXIMITY','RETURN']::TEXT[],
 'On a slow wave: stay near the pocket → deliberately move away → use rotations and pumps to come back to it. Builds active pocket tracking while surfing.',
 ARRAY[
   'Returns to the pocket within 2-3 cycles after moving away.',
   'Doesn''t go to the flat during the return.'
 ]::TEXT[],
 'yellow', 31, TRUE),
('DRL-YB-031-05', 'STP-031', 'Surfskate carving (classical bridge)', 'drill', '15 min', '3 sets',
 ARRAY['SURFSKATE','LAND','COMPRESS','EXTEND']::TEXT[],
 'On a surfskate (driveway or ramp), feel the compression-extension cycle on land. Bridge the body memory before applying on water.',
 ARRAY[
   'Compression-extension produces visible acceleration on the surfskate.',
   'Rhythm is sustained — not just one cycle.'
 ]::TEXT[],
 'yellow', 31, TRUE),
('DRL-YB-031-06', 'STP-031', '⭐ Two Lines / Ping-Pong (constraint-led)', 'drill', '30 min', 'every wave',
 ARRAY['TWO-LINES','LIP','FLAT','PING-PONG']::TEXT[],
 'Imagine 2 invisible lines on the wave: **lip on top, flat on bottom**. Your board bounces between them like a ping-pong ball — never crossing either. This is the signature drill of STP-031: it makes the up/down click without verbal instruction.',
 ARRAY[
   'Board never crosses the imaginary lip line.',
   'Board never crosses the imaginary flat line.',
   'Cycles sustained for full ride duration.'
 ]::TEXT[],
 'yellow', 31, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ─── STP-032 · Out from the Shoulder ───
UPDATE drills_missions SET
  title = 'Visual ID from shore',
  description_md = 'From shore, watch real waves and call out the ideal shoulder exit point for each. Build the read-before-decide habit.',
  reps_recommended = '20 waves identified',
  key_words = ARRAY['READ','SHOULDER','TURN','EXIT','CALM']::TEXT[],
  success_criteria = ARRAY[
    'Identifies the shoulder (Stage 1 or 2) on real waves before the lip forms.',
    'Calls out when a wave has no clean shoulder exit available.',
    'Verbal ID matches what actually happens in the wave.'
  ]::TEXT[]
WHERE id = 'DRL-YB-032';

INSERT INTO drills_missions (id, step_id, title, type, time_estimate, reps_recommended, key_words, description_md, success_criteria, belt, display_order, active) VALUES
('DRL-YB-032-02', 'STP-032', 'Short ride + early exit', 'drill', '20 min', '5 exits',
 ARRAY['SHORT-RIDE','EARLY-EXIT','DECISION']::TEXT[],
 'Catch wave + surf 5 seconds + shoulder exit. Forces practicing the decision, not the full ride. Builds the exit muscle without the temptation to milk the wave.',
 ARRAY[
   'Exits at the 5-second mark consistently.',
   'Exit is through the shoulder, not by accident.',
   'Lands calmly outside the wave.'
 ]::TEXT[],
 'yellow', 32, TRUE),
('DRL-YB-032-03', 'STP-032', 'Coach-called exit', 'drill', '20 min', '5 calls',
 ARRAY['COACH-CALL','RESPONSIVE','MID-WAVE']::TEXT[],
 'Coach (or a friend) calls *"EXIT!"* mid-wave. You must exit through the shoulder immediately, no negotiation. Trains responsiveness + decision under signal.',
 ARRAY[
   'Exits within 1 second of the call.',
   'Exit is clean — no wipeout, no turbulence.',
   'No hesitation visible in the turn initiation.'
 ]::TEXT[],
 'yellow', 32, TRUE)
ON CONFLICT (id) DO NOTHING;

-- ════════════════════════════════════════════════════════
-- MISSIONS — canonical text + enriched success_criteria
-- ════════════════════════════════════════════════════════

UPDATE drills_missions SET
  title = 'Choose your speed without instruction',
  description_md = 'Choose the correct speed without external instruction in 3 of every 4 paddle-ins, across 2 consecutive sessions.',
  success_criteria = ARRAY[
    'Coach observes 3-of-4 correct speed choices without verbal cue.',
    'Repeated across 2 consecutive sessions.',
    'Student can explain the speed choice when asked post-attempt.'
  ]::TEXT[]
WHERE id = 'MIS-YB-027';

UPDATE drills_missions SET
  title = 'Stage Hunter',
  description_md = 'Position yourself at Stage 2 first, then Stage 3. Identify when a wave is in Stage 1 and **don''t waste energy** trying to catch it.',
  success_criteria = ARRAY[
    'Positional decisions tied to correctly-named wave stage.',
    'No Stage 1 paddle attempts across the session.',
    'Coach can validate stage call before each paddle-in.'
  ]::TEXT[]
WHERE id = 'MIS-YB-033';

UPDATE drills_missions SET
  title = 'Eyes on the Pocket',
  description_md = 'Maintain visual contact with the pocket throughout the entire paddle-in, until you''re close and know you''re well positioned.',
  success_criteria = ARRAY[
    'No head-down paddling — eyes stay locked on the pocket.',
    'Position at end of paddle-in matches the pocket location.',
    'Verbal "I''m in position" before the catch confirms the visual lock.'
  ]::TEXT[]
WHERE id = 'MIS-YB-028';

UPDATE drills_missions SET
  title = 'Call Your Angle',
  description_md = 'Catch waves paddling with the correct angle. Before each paddle-in, **say out loud** which option (1, 2, or 3) you''re using.',
  success_criteria = ARRAY[
    'Verbal option call before every paddle-in.',
    'Called option matches the wave context for ≥4 of 5 attempts.',
    'Reaches the pocket without last-second adjustment.'
  ]::TEXT[]
WHERE id = 'MIS-YB-029';

UPDATE drills_missions SET
  title = 'Surf Prone — Feel the TIME',
  description_md = 'Surf prone after cobra for ≥5 seconds. Feel the TIME generated before popping up.',
  success_criteria = ARRAY[
    '≥5 seconds of prone trim post-cobra on at least 3 waves.',
    'Pop-up happens calmly, not rushed.',
    'Student can describe the TIME sensation post-wave.'
  ]::TEXT[]
WHERE id = 'MIS-YB-034';

UPDATE drills_missions SET
  title = 'Default to FP2, Shuffle on Demand',
  description_md = 'Smooth, correct, connected pop-up landing at FP2 by default. Then demonstrate the shuffle FP1↔FP2 when the wave invites it. **Not "land and pray."**',
  success_criteria = ARRAY[
    'Consistent FP2 default landing.',
    'At least one successful FP1↔FP2 shuffle observed mid-ride.',
    'Front foot stays centered during the shuffle.'
  ]::TEXT[]
WHERE id = 'MIS-YB-030';

UPDATE drills_missions SET
  title = 'Keep the Energy Alive',
  description_md = 'Surf one wave executing the full sequence connected — sustained up/down without going to flat. As many cycles as the wave allows. **The game: maintain the energy and have fun.**',
  success_criteria = ARRAY[
    'Single ride with ≥3 connected up/down cycles.',
    'No flat collapse during the ride.',
    'Demonstrates frontside AND backside within the session.'
  ]::TEXT[]
WHERE id = 'MIS-YB-031';

UPDATE drills_missions SET
  title = 'Exit by Choice — Twice',
  description_md = 'Exit through the shoulder at least **2 times in a session**, by **choice** — not by accident.',
  success_criteria = ARRAY[
    '≥2 deliberate shoulder exits in the session.',
    'Each exit lands calmly — no wipeout, no turbulence.',
    'Student can explain why that moment was the right exit moment.'
  ]::TEXT[]
WHERE id = 'MIS-YB-032';
