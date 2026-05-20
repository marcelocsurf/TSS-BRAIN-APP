-- M50 — Yellow Belt course content seed
--
-- Source documents (literal extraction, no invention):
--   - TSS_YB_MASTER_MANUAL_v1_EN.md
--   - TSS_UNIFIED_STUDENT_COURSE_v1.md
--   - 00_TSS_BRAIN_COURSE_SPEC_v1.md
--
-- Loaded:
--   - 1 yb_onboarding lesson:  Yellow Belt Value (Module 4)
--   - 8 yellow_belt STP lessons: STP-027..STP-034
--     · Sequence 6.0 "Reading & Earning the Wave" → 027, 033, 028, 029, 034
--     · Sequence 7.0 "Drawing on the Wave"        → 030, 031, 032
--   - 2 yellow_belt operational lessons:
--     · The Complete Ride (Module 7)
--     · Yellow Belt Exit Test (Module 8)
--   - 8 drills_missions (1 drill per STP) for belt='yellow'
--   - 8 drills_missions (1 mission per STP) for belt='yellow'
--
-- All INSERTs use ON CONFLICT (id) DO NOTHING so re-running the
-- migration is safe and won't clobber any manual edits.
--
-- Per-STP fields that were MISSING in the source are left at safe
-- defaults: estimated_minutes=10, subtitle=NULL, lesson_type='reading'.

-- ─── Yellow Belt Onboarding (Module 1 analogue) ───
INSERT INTO lessons (
  id, course_section, step_number, title, pillar,
  description_md, estimated_minutes,
  lesson_type, display_order, active, status_v1,
  pc_section_id, pc_section_name, pc_section_order
) VALUES (
  'YB-ONB-01', 'yb_onboarding', 401, 'Yellow Belt Value — Proceso / Resiliencia',
  'Mindset / Belt Value',
  $$Resilience (Process) is the central value of Yellow Belt because it marks the moment when the surfer begins to understand that surfing — most of the time — is effort, waiting, tumbles, and falls.

Because life is like that. Life is like surfing it: there are parts where you must paddle, parts where you must wait, and parts where you must commit, seize the opportunity, not let it pass, and give it everything. That is the deep teaching of Yellow Belt — to understand that the rhythm of surfing is the rhythm of life.

**Closing phrase (EN):** Yellow Belt grows through resilience: accept the fall, return to the wave, play with the sea.

**Closing phrase (ES):** Yellow Belt crece con resiliencia: acepta la caída, vuelve a la ola, juega con el mar.$$,
  10, 'reading', 401, TRUE, 'PRODUCTIZED',
  'M4', 'Yellow Belt Belt Value', 4
)
ON CONFLICT (id) DO NOTHING;

-- ─── Yellow Belt STPs ───
-- Sequence 6.0 — Reading & Earning the Wave

INSERT INTO lessons (
  id, course_section, step_number, title, subtitle, pillar,
  description_md, estimated_minutes, lesson_type, display_order, active, status_v1
) VALUES
(
  'STP-027', 'yellow_belt', 27, 'Paddling Speeds 1–2–3–4', NULL, 'Technical',
  $$Dominar los 4 niveles de velocidad de remada y aprender a aplicarlos según la energía de la ola, la distancia al pico, y la intención táctica. No es remar más fuerte — es remar con propósito.

**Coach cue:** Match the speed to the wave, not the panic.$$,
  10, 'reading', 27, TRUE, 'PRODUCTIZED'
),
(
  'STP-033', 'yellow_belt', 33, 'Reading Wave Stages 1–4 in the Lineup', NULL, 'Tactical / Mental',
  $$The Yellow Belt re-deepening of the Pre-Course concept "Stages of the Wave (1–4)". At pre-course, the 4 stages were conceptual. At YB, they are applied in real time in the lineup — the student identifies the stages on real moving waves, predicts where each wave will evolve, and uses that reading to make positional and energy decisions.

**Coach cue:** Predict where the stage you are looking at will be — anticipate to meet.$$,
  10, 'reading', 33, TRUE, 'PRODUCTIZED'
),
(
  'STP-028', 'yellow_belt', 28, 'Chase the Pocket', NULL, 'Technical / Tactical',
  $$La acción de identificar el pocket y posicionarse activamente para llegar a él. El pocket es esa área de la ola donde va a reventar primero — donde ya hay un labio o ya hay espuma. Es el punto de máxima energía. El alumno desarrolla la conciencia de ir a buscar esa parte específica en lugar de ver toda la ola como una sola masa.

**Coach cue:** Persigue el pocket / Mira el pocket / Controla tu distancia.$$,
  10, 'reading', 28, TRUE, 'PRODUCTIZED'
),
(
  'STP-029', 'yellow_belt', 29, 'Paddle with the Correct Angle', NULL, 'Technical / Tactical',
  $$The skill of choosing the paddle angle based on WHERE the surfer is on the wave and WHAT stage the wave is in. Pocket awareness is the prerequisite — without knowing where the pocket is (STP-028) and what stage the wave is in (STP-033), there is no correct angle to choose.

**Coach cue (integrated chain):** 1. Look at the pocket (STP-028) · 2. Read the stage (STP-033) · 3. Angle (STP-029 action) · 4. Scan the wave (STP-033).$$,
  10, 'reading', 29, TRUE, 'PRODUCTIZED'
),
(
  'STP-034', 'yellow_belt', 34, 'Cobra + Pick Line', NULL, 'Technical / Tactical',
  $$The cobra (technical movement of redirecting the board's nose) and line selection (tactical decision of where to go on the wave) — applied on green moving waves with full awareness of wave type, direction of break, and line selection. The student is already surfing (redirecting the board) before standing up.

**Coach cue:** Cobra and pick your line / Where do you want to go? / Don't go to the flat.$$,
  10, 'reading', 34, TRUE, 'PRODUCTIZED'
),
-- Sequence 7.0 — Drawing on the Wave
(
  'STP-030', 'yellow_belt', 30, 'Pop Up + Foot Position 1 or 2', NULL, 'Technical (biomechanical)',
  $$At Yellow Belt the student is catching real green waves and standing up — but with conscious awareness of WHERE the back foot lands. The WB introduced standing up centered; YB adds the doctrine of Foot Position 1 (FP1 / tail) vs Foot Position 2 (FP2 / neutral) vs FP3 (forward).

The default landing is FP2 because when lying on the sweet spot, the knees rest over FP2 — and the back foot generally lands where the knees were. From that default, the YB student develops the new skill: the back-foot SHUFFLE between FP1 and FP2.

**Coach cue:** Hands at the ribs / Look forward, create space / Hips down, head up / Weight on the front foot / Stay connected — don't release.$$,
  10, 'reading', 30, TRUE, 'PRODUCTIZED'
),
(
  'STP-031', 'yellow_belt', 31, 'Go Up and Down', 'The Integration Step', 'Technical / Tactical',
  $$This is the integration step of Yellow Belt. The student is no longer learning new techniques — they are now CONNECTING everything previously learned (pocket reading, angle, cobra + line, pop-up, foot position) into one continuous dynamic ride.

Go Up and Down is where the surfer starts to DRAW LINES on the wave face — using compression and extension of the body (internal force) to connect with the wave's energy (external force). This is the threshold between "I caught a wave" and "I am surfing."

**Coach cue:** Don't go to the flat / Compress down, extend up / Stay where the energy is / Keep the game alive.$$,
  10, 'reading', 31, TRUE, 'PRODUCTIZED'
),
(
  'STP-032', 'yellow_belt', 32, 'Out from the Shoulder', NULL, 'Tactical / Technical',
  $$The final new skill of Yellow Belt — exiting the wave actively through the shoulder, with control and intention. WB introduced lying-down dismount + star fall. YB adds the third option: the active, decisional exit through the shoulder before the lip forms — closing the ride with elegance, not turbulence.

**Coach cue:** Read the shoulder / Eyes on the exit / Exit clean, not turbulent / Don't ride past your decision.$$,
  10, 'reading', 32, TRUE, 'PRODUCTIZED'
)
ON CONFLICT (id) DO NOTHING;

-- ─── Operational modules ───
INSERT INTO lessons (
  id, course_section, step_number, title, subtitle, pillar,
  description_md, estimated_minutes, lesson_type, display_order, active, status_v1
) VALUES
(
  'YB-MOD-7', 'yellow_belt', 700, 'The Complete Ride',
  'Integration of the full YB sequence',
  'Integration Module',
  $$Execute the full unified sequence from arriving at the beach to finishing a wave cleanly. This module is the explicit connection of everything previously learned into one fluid operational chain.

**11 stages:**
1. Venue Analysis
2. Warm-Up + Bisagra
3. Paddle Out
4. Scan Wave Stages (STP-033)
5. Identify Pocket (STP-028)
6. Paddle Speed + Angle (STP-027 + STP-029)
7. Cobra + Pick Line (STP-034) — generate TIME
8. Pop-Up + Foot Position (STP-030)
9. Posture + Up/Down (STP-031) — the integration
10. Out from the Shoulder (STP-032)
11. Feedback + Reflection (One Wave principle)$$,
  15, 'reading', 700, TRUE, 'PRODUCTIZED'
),
(
  'YB-MOD-8', 'yellow_belt', 800, 'Yellow Belt Exit Test',
  'Live performance + behavioral + decisional indicators',
  'Certification / Exit Test',
  $$Combine live performance test (execute one complete YB sequence on a real wave) with behavioral and decisional indicators observed across multiple sessions. 5 Categories · 13 Criteria.

**Category 1 — Performance Test (water):** Execute one complete YB sequence on a real wave.

**Category 2 — Etiquette & Lineup:**
- 2.1 Etiquette rules incorporated as behavior
- 2.2 Lineup self-management

**Category 3 — Survival Skills (WB carryover):**
- 3.1 Turtle Roll · 3.2 Duck Dive · 3.3 Impact zone exit · 3.4 "Stays alive"

**Category 4 — Wave Reading & Decision Making:**
- 4.1 Understands how waves break · 4.2 Goes to the pocket · 4.3 Attacks the wave · 4.4 Venue analysis · 4.5 Entry/exit points · 4.6 Conditions Go/No-Go

**Category 5 — Sequence Execution with CONSISTENCY:**
- 5.1 Executes with consistency · 5.2 Connects with board consistently · 5.3 Frontside ↔ Backside · 5.4 Exits through shoulder · 5.5 WB parts with more consistent mastery

**Threshold:** Student passes when:
- ≥1 complete YB sequence executed on a real wave
- Categories 2–4 demonstrated consistently across ≥2 different sessions
- Category 5 (consistency) observable wave-after-wave

**Closing principle (EN):** "Yellow Belt is not awarded for perfection. It is awarded for consistent attempts with structural knowledge."

**Closing principle (ES):** "Yellow Belt no se entrega por ejecución perfecta. Se entrega por intentos consistentes con conocimiento estructural."$$,
  20, 'test', 800, TRUE, 'PRODUCTIZED'
)
ON CONFLICT (id) DO NOTHING;

-- ─── YB sequence assignment (mirrors the WB pattern stored in wb_sequence_*) ───
-- Sequence 6.0 — Reading & Earning the Wave (order 6)
UPDATE lessons SET
  wb_sequence_id    = 'YB-SEQ-6.0',
  wb_sequence_name  = 'Reading & Earning the Wave',
  wb_sequence_order = 6,
  wb_sequence_promise = 'Sequence 6.0 is where the surfer learns to read the ocean and earn the wave.',
  sequence_step_order = 1
WHERE id = 'STP-027';

UPDATE lessons SET
  wb_sequence_id    = 'YB-SEQ-6.0',
  wb_sequence_name  = 'Reading & Earning the Wave',
  wb_sequence_order = 6,
  wb_sequence_promise = 'Sequence 6.0 is where the surfer learns to read the ocean and earn the wave.',
  sequence_step_order = 2
WHERE id = 'STP-033';

UPDATE lessons SET
  wb_sequence_id    = 'YB-SEQ-6.0',
  wb_sequence_name  = 'Reading & Earning the Wave',
  wb_sequence_order = 6,
  wb_sequence_promise = 'Sequence 6.0 is where the surfer learns to read the ocean and earn the wave.',
  sequence_step_order = 3
WHERE id = 'STP-028';

UPDATE lessons SET
  wb_sequence_id    = 'YB-SEQ-6.0',
  wb_sequence_name  = 'Reading & Earning the Wave',
  wb_sequence_order = 6,
  wb_sequence_promise = 'Sequence 6.0 is where the surfer learns to read the ocean and earn the wave.',
  sequence_step_order = 4
WHERE id = 'STP-029';

UPDATE lessons SET
  wb_sequence_id    = 'YB-SEQ-6.0',
  wb_sequence_name  = 'Reading & Earning the Wave',
  wb_sequence_order = 6,
  wb_sequence_promise = 'Sequence 6.0 is where the surfer learns to read the ocean and earn the wave.',
  sequence_step_order = 5
WHERE id = 'STP-034';

-- Sequence 7.0 — Drawing on the Wave (order 7)
UPDATE lessons SET
  wb_sequence_id    = 'YB-SEQ-7.0',
  wb_sequence_name  = 'Drawing on the Wave',
  wb_sequence_order = 7,
  wb_sequence_promise = 'Sequence 7.0 is where the surfer stops catching waves and starts drawing on them.',
  sequence_step_order = 1
WHERE id = 'STP-030';

UPDATE lessons SET
  wb_sequence_id    = 'YB-SEQ-7.0',
  wb_sequence_name  = 'Drawing on the Wave',
  wb_sequence_order = 7,
  wb_sequence_promise = 'Sequence 7.0 is where the surfer stops catching waves and starts drawing on them.',
  sequence_step_order = 2
WHERE id = 'STP-031';

UPDATE lessons SET
  wb_sequence_id    = 'YB-SEQ-7.0',
  wb_sequence_name  = 'Drawing on the Wave',
  wb_sequence_order = 7,
  wb_sequence_promise = 'Sequence 7.0 is where the surfer stops catching waves and starts drawing on them.',
  sequence_step_order = 3
WHERE id = 'STP-032';

-- ─── Yellow Belt drills (1 per STP) ───
INSERT INTO drills_missions (
  id, step_id, title, type, time_estimate, reps_recommended,
  key_words, description_md, success_criteria, belt, display_order, active
) VALUES
(
  'DRL-YB-027', 'STP-027', '4-Speed Ladder', 'drill', '3 min', '3 cycles',
  ARRAY['V1','V2','V3','V4','RHYTHM']::TEXT[],
  $$Have someone (or yourself) call out "V1... V3... V2... V4" and switch on command. 3 minutes. Match paddle cadence + breath to the called speed without losing form.$$,
  ARRAY[
    'Demuestra las 4 velocidades a la orden, en plano y en tabla, sin perder forma.',
    'Ajusta velocidad al contexto (distancia + energía de ola + tiempo disponible).',
    'Regula respiración según velocidad sostenida ≥30 seg sin colapso técnico.'
  ]::TEXT[],
  'yellow', 27, TRUE
),
(
  'DRL-YB-033', 'STP-033', 'Stage ID from Shore', 'drill', '10 min', 'until 20 waves identified',
  ARRAY['SCAN','STAGE','PREDICT','POCKET','DECIDE']::TEXT[],
  $$Identify the 4 wave stages on real waves from outside the water. Then progress to Live Lineup Reading — say out loud what stage each wave is in before each set arrives.$$,
  ARRAY[
    'Identifies the 4 stages on real waves without coach assistance.',
    'Predicts WHERE the wave will break BEFORE it arrives.',
    'Understands the bottom (sandbar / reef / rock) and reads patterns of waves breaking in the same spot.'
  ]::TEXT[],
  'yellow', 33, TRUE
),
(
  'DRL-YB-028', 'STP-028', 'Visual Tracking + Pointing', 'drill', '5 min', '10 waves',
  ARRAY['POCKET','EYES','DISTANCE','SPEED','POSITION']::TEXT[],
  $$Track waves with your eyes from the shore and physically point at the pocket as it forms. Then progress to Paddle-and-Turn: ponerse deep en el pocket → remar hacia él → darse vuelta inmediato.$$,
  ARRAY[
    'Identifies the pocket when asked / can point at it on real waves (including multiple pockets when wave closes both sides).'
  ]::TEXT[],
  'yellow', 28, TRUE
),
(
  'DRL-YB-029', 'STP-029', 'Spot & Paddle', 'drill', '15 min', '5 paddle-ins',
  ARRAY['POCKET','STAGE','ANGLE','SCAN','PADDLE']::TEXT[],
  $$Ver el pocket o la primera parte donde va a reventar → remar a posicionarse ahí. Progressions: Deep Position, Paddle to Foam (ponerse deep en el pocket y remar en dirección a la espuma) · Paddle + Catch + Cobra (remar al pocket → tomar la ola → hacer cobra).$$,
  ARRAY[
    'Elige una de las 3 opciones según contexto, sin instrucción del coach.',
    'Alcanza el pocket sin ajustes de último segundo — no remadas frenéticas.',
    'NO rema en Etapa 1 — entiende que la ola aún no se puede agarrar.'
  ]::TEXT[],
  'yellow', 29, TRUE
),
(
  'DRL-YB-034', 'STP-034', 'Line Hold', 'drill', '20 min', '5 waves prone-surfed',
  ARRAY['CATCH','COBRA','LINE','TIME','POP']::TEXT[],
  $$Agarrar ola → cobra + línea → surfear acostado ≥5 seg. Sentir el TIEMPO generado antes de pensar en pararse.$$,
  ARRAY[
    'Después de agarrar la ola, ejecuta cobra + redirige la nariz hacia la línea en 1–2 segundos.',
    'Mantiene velocidad durante ≥5 segundos después de la cobra.',
    'Hace el pop-up estando todavía en trim — no apurado — porque generó TIEMPO.'
  ]::TEXT[],
  'yellow', 34, TRUE
),
(
  'DRL-YB-030', 'STP-030', 'Pop-Up Reps + Foot Shuffle', 'drill', '15 min', '20 reps dry + water',
  ARRAY['COBRA','SPACE','DRAG','LAND','SHUFFLE']::TEXT[],
  $$Mat repetitions with center line, practice pop-ups landing in the correct spot. Progressions: classical dry pop-up (3 methods) · foot shuffle FP1↔FP2 keeping front foot centered · visualization (mental) · connected pop-up in water (classical) · pop-up while surfing (water · ecological).$$,
  ARRAY[
    'Lands back foot at FP2 by default — where knees were — without conscious correction.',
    'Can shuffle back foot FP1↔FP2 mid-ride, front foot centered, demonstrating awareness.',
    'Pop-up executed with hips down + head up + looking forward + weight on front foot — board stable.'
  ]::TEXT[],
  'yellow', 30, TRUE
),
(
  'DRL-YB-031', 'STP-031', 'Up/Down Cycle', 'drill', '30 min', 'longest chain possible',
  ARRAY['DOWN','COMPRESS','UP','EXTEND','STAY']::TEXT[],
  $$Pump without going to the flat or leaving the wave. Progressions: Frontside Pump · Backside Pump · Pocket Proximity (slow wave) — stay near pocket → move away → use rotations to come back · Surfskate carving (classical bridge — feel compression/extension on land) · Two Lines / Ping-Pong (constraint-led) — imagine 2 invisible lines on the wave: lip on top, flat on bottom. Board bounces between them like a ping-pong ball — never crossing either.$$,
  ARRAY[
    'One continuous up-down cycle without going to flat on a real wave.',
    'Sustains pump ≥3 cycles in a single ride.',
    'Demonstrates Pocket Proximity drill on slow wave.'
  ]::TEXT[],
  'yellow', 31, TRUE
),
(
  'DRL-YB-032', 'STP-032', 'Visual ID from Shore + Coach-Called Exit', 'drill', '20 min', '5 exits',
  ARRAY['READ','SHOULDER','TURN','EXIT','CALM']::TEXT[],
  $$Identify the ideal shoulder on real waves from shore. Then progress to Short ride + early exit (catch + 5 sec + shoulder exit) and Coach-called exit (coach yells "EXIT" mid-wave).$$,
  ARRAY[
    'Exits the wave through the shoulder by choice (not accident) ≥2 times per session.',
    'Identifies the shoulder (Stage 1 or 2) BEFORE initiating the turn — visible decision-making.',
    'Lands calmly outside the wave — no wipe-out, no turbulence.'
  ]::TEXT[],
  'yellow', 32, TRUE
)
ON CONFLICT (id) DO NOTHING;

-- ─── Yellow Belt missions (1 per STP) ───
INSERT INTO drills_missions (
  id, step_id, title, type, time_estimate, reps_recommended,
  description_md, success_criteria, belt, display_order, active
) VALUES
(
  'MIS-YB-027', 'STP-027', 'Choose Your Speed Without Being Told', 'mission',
  '2 sessions', '3 of every 4 paddle-ins',
  $$Choose the correct paddle speed without external instruction on 3 of every 4 paddle-ins, across 2 consecutive sessions.$$,
  ARRAY['Coach observes 3-of-4 correct speed choices without verbal cue across 2 consecutive sessions.']::TEXT[],
  'yellow', 127, TRUE
),
(
  'MIS-YB-033', 'STP-033', 'Stage Hunter', 'mission',
  '1 session', 'whole session',
  $$Position yourself at Stage 2 first, then Stage 3. Identify when a wave is in Stage 1 and do NOT waste energy trying to catch it.$$,
  ARRAY['Coach validates positional decisions tied to correctly-named wave stage across the session.']::TEXT[],
  'yellow', 133, TRUE
),
(
  'MIS-YB-028', 'STP-028', 'Eyes on the Pocket', 'mission',
  '1 session', 'every paddle-in',
  $$Maintain visual contact with the pocket throughout the entire paddle-in, until you're close and know you're well positioned.$$,
  ARRAY['Coach observes sustained pocket gaze on each paddle-in attempt; no head-down paddling.']::TEXT[],
  'yellow', 128, TRUE
),
(
  'MIS-YB-029', 'STP-029', 'Call Your Angle', 'mission',
  '1 session', '5 consecutive waves',
  $$Catch waves paddling with the correct angle. Before each paddle-in (5 waves in a row), say out loud which option (1, 2 or 3) you're using.$$,
  ARRAY['Coach validates that called option matches the wave context for ≥4 of 5 attempts.']::TEXT[],
  'yellow', 129, TRUE
),
(
  'MIS-YB-034', 'STP-034', 'Surf Prone — Feel the TIME', 'mission',
  '1 session', '3 prone-surfed waves',
  $$Surf prone after cobra for ≥5 seconds. Feel the TIME generated before popping up.$$,
  ARRAY['Coach validates ≥5 seconds of prone trim post-cobra on at least 3 waves.']::TEXT[],
  'yellow', 134, TRUE
),
(
  'MIS-YB-030', 'STP-030', 'Default to FP2, Shuffle on Demand', 'mission',
  '1 session', 'every pop-up',
  $$Smooth, correct, connected pop-up landing at FP2 by default + demonstrate the shuffle FP1↔FP2 when the wave invites it. Not "land and pray."$$,
  ARRAY['Coach observes consistent FP2 default landing and at least one successful FP1↔FP2 shuffle.']::TEXT[],
  'yellow', 130, TRUE
),
(
  'MIS-YB-031', 'STP-031', 'Keep the Energy Alive', 'mission',
  '1 session', 'longest chain in a single wave',
  $$Surf one wave executing the full sequence connected — sustained up/down without going to flat. As many cycles as the wave allows. The game: maintain the energy and have fun.$$,
  ARRAY['Coach observes a single ride with ≥3 connected up/down cycles, no flat collapse.']::TEXT[],
  'yellow', 131, TRUE
),
(
  'MIS-YB-032', 'STP-032', 'Exit by Choice — Twice', 'mission',
  '1 session', '≥2 shoulder exits',
  $$Exit through the shoulder at least 2 times in a session, by choice — not by accident.$$,
  ARRAY['Coach validates ≥2 deliberate shoulder exits with calm landing.']::TEXT[],
  'yellow', 132, TRUE
)
ON CONFLICT (id) DO NOTHING;
