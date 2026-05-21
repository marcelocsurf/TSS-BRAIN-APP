-- M61 — Coach lessons Round 1 (SAMPLE for format validation).
--
-- Source: /1111/_TSS_WHITE_BELT_OFICIAL_v1/COACH_MANUAL_v4_EN/
--         TSS_WB_COACH_MANUAL_v4_EN.md
--   PART VI subsections for STP-001, STP-005, STP-013
--   PART IX Quiz Bank questions for the same 3 STPs
--
-- Goal of this migration: seed 3 of the 25 coach STP lessons so Marcelo
-- can validate the canonical template (What you teach / How you teach /
-- How you correct / How you validate) before we run the remaining 22.
-- All copy is verbatim from the manual — zero invention.
--
-- IDs follow the existing CoachPortalTabs convention (`COACH-STP-XXX`),
-- course_section = 'coach_wb_stp'. Prereqs are linear within the STP
-- tier so the coach unlocks them in order.
--
-- Re-runnable: ON CONFLICT DO NOTHING on lessons; the quiz block deletes
-- prior rows for these 3 lessons before re-inserting.

-- ─── Lessons ───
INSERT INTO lessons (
  id, course_section, step_number, title, subtitle, pillar,
  description_md,
  coach_what_md, coach_deliver_md, coach_errors_md, coach_validate_md,
  linked_step_id,
  estimated_minutes, lesson_type, display_order, active, status_v1
) VALUES
(
  'COACH-STP-001', 'coach_wb_stp', 1,
  'STP-001 — Venue Analysis',
  'Block 0-1 · Sequence #1 · Pillar: Safety / Tactical',
  'Safety / Tactical',
  $$**Pillar:** Safety / Tactical · **Block:** Block 0-1 · **Sequence:** #1

This is the coach-facing lesson for STP-001. Open the tabs below to study the canonical "What / How / Correct / Validate" structure from the WB Coach Manual v4.

> *Venue analysis is done EVERY session, not just the first one. By M5, the student should be able to do basic venue analysis on their own. At White Belt, you lead and the student participates.*$$,
  $$Studying the surf zone before entering the water. Build a clear mental map of the environment, identify risks, and make better decisions. Analyze reference points, safe zone, impact zone, currents, hazards, entry, exit, tide, wave size, and general conditions to decide whether the session is appropriate for your level, where to surf, how to enter and exit, and what your session plan will be.

**Key concepts to convey:** Reference points (land and depth); Safe zone; Impact zone; Currents; Hazards; Entry/exit points; Tide; Wave size; General ocean behavior; Go/no-go decision; Session plan; Expectation regulation

**5 KEY WORDS to plant in the student's vocabulary:**
`MAP · ZONE · HAZARD · ENTRY · DECIDE`$$,
  $$**EXPLAIN:** Walk the group to a vantage point. Point out zones.

**DEMONSTRATE:** Model the analysis aloud — *"I see whitewater breaking here, the current is pulling that way, the safe zone is between those two markers."*

**PARTICIPATE:** Students point, answer questions, identify hazards.

**FEEDBACK:** Confirm or correct each observation.

**COACH NOTE:** Venue analysis is done EVERY session, not just the first one. By M5, the student should be able to do basic venue analysis on their own. At White Belt, you lead and the student participates.$$,
  $$| Error | Correction | Verbal Cue |
|---|---|---|
| Student says *"it looks fine"* without analysis | Ask specific questions: where is the current? which direction? | **Show me WHERE.** |
| Sets unrealistic goals | Redirect: one goal, specific, within current level | **One goal. Specific.** |
| Ignores changing conditions mid-session | Model condition-check during session | **Conditions changed. Look again.** |$$,
  $$1. You describe the day's general conditions and identify the safe zone with precision.
2. You recognize the impact zone and point out the main hazards and currents.
3. You explain your entry/exit points and state whether conditions match your level, with a simple session plan.

> **Promotion gate:** Promote the student to the next step only when ALL 3 criteria are met consistently across **3 different sessions**.$$,
  'STP-001',
  15, 'reading', 1, TRUE, 'PRODUCTIZED'
),
(
  'COACH-STP-005', 'coach_wb_stp', 5,
  'STP-005 — Put Board in the Water',
  'Block 1 · Sequence #1 · Pillar: Technical',
  'Technical',
  $$**Pillar:** Technical · **Block:** Block 1 · **Sequence:** #1

Coach-facing detail for STP-005. The student lands here from the WB Master Manual; you read the delivery layer below to know HOW to teach the placement step.

> *Boards lost during placement are common at this stage. Set the expectation: board stays ready. Re-grip if foam comes.*$$,
  $$Place the board on the water surface so it floats parallel to incoming waves and is ready for you to mount. Quality placement preserves your energy and prevents the foam from ripping the board out of your hands.

**Key concepts to convey:** Depth; Pause; Lower; Release; Readiness

**5 KEY WORDS to plant in the student's vocabulary:**
`DEPTH · PAUSE · LOWER · RELEASE · READY`$$,
  $$**EXPLAIN:** Gentle placement, parallel to waves, ready to grab.

**DEMONSTRATE:** In waist-deep water.

**PARTICIPATE:** 5–8 placements per student.

**FEEDBACK:** Confirm board orientation each time.

**COACH NOTE:** Boards lost during placement are common at this stage. Set the expectation: board stays ready. Re-grip if foam comes.$$,
  $$Refer to **Master Manual Part VI** for canonical errors at this step.

Apply the diagnostic principle:
> *Work BACKWARD through the blocks. Failed step output usually means a previous step was bad.*

So if the student keeps losing the board during placement, audit STP-003 (Sweet Spot) and STP-004 (Paddle Out) before re-drilling STP-005.$$,
  $$1. Board enters the water gently — no slap.
2. Board stays parallel to waves.
3. 5–8 placements without losing the board.

> **Promotion gate:** Promote the student to the next step only when ALL 3 criteria are met consistently across **3 different sessions**.$$,
  'STP-005',
  10, 'reading', 5, TRUE, 'PRODUCTIZED'
),
(
  'COACH-STP-013', 'coach_wb_stp', 13,
  'STP-013 — Cobra + Turn Left and Right',
  'Block 2 · Sequence #2 · Pillar: Technical',
  'Technical',
  $$**Pillar:** Technical · **Block:** Block 2 · **Sequence:** #2

Coach-facing detail for STP-013. This is where the cobra becomes the gateway to every directional skill that follows.

> *If the student skips cobra, pop-up quality drops immediately. Drill cobra as its own skill, not just a transition.*$$,
  $$Direct the board left or right while riding prone in cobra position — using rail pressure with your hands and visual lead with your eyes.

**Key concepts to convey:** Cobra; Hand placement at rib height; Chest lift; Eyes forward; Rail pressure; Steering

**5 KEY WORDS to plant in the student's vocabulary:**
`HANDS · CHEST · EYES · RAIL · STEER`$$,
  $$**EXPLAIN:** Cobra position with eyes leading.

**DEMONSTRATE:** Directional change with eye → rail → board chain.

**PARTICIPATE:** 5 lefts, 5 rights.

**FEEDBACK:** Confirm direction matches stated intent.

**COACH NOTE:** If the student skips cobra, pop-up quality drops immediately. Drill cobra as its own skill, not just a transition.$$,
  $$| Error | Correction | Verbal Cue |
|---|---|---|
| Skips cobra, goes straight to pop-up | Cobra is not optional. Hold 2 sec, choose line. | **Cobra first. Choose your line. Then stand.** |$$,
  $$1. Board responds to direction every time.
2. Direction matches your stated intention.
3. You execute 5 left and 5 right turns intentionally.

> **Promotion gate:** Promote the student to the next step only when ALL 3 criteria are met consistently across **3 different sessions**.$$,
  'STP-013',
  10, 'reading', 13, TRUE, 'PRODUCTIZED'
)
ON CONFLICT (id) DO NOTHING;

-- ─── Quizzes — verbatim from WB Coach Manual Part IX ───
DELETE FROM lesson_quizzes
WHERE lesson_id IN ('COACH-STP-001','COACH-STP-005','COACH-STP-013');

-- COACH-STP-001 (4 questions)
INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES
('COACH-STP-001', 'When you arrive at the beach, what is the FIRST thing you should identify?',
 '[{"text":"A fixed land reference and an outside reference","correct":true},{"text":"The biggest wave","correct":false},{"text":"Other surfers","correct":false},{"text":"Where you parked","correct":false}]'::jsonb, 1),
('COACH-STP-001', 'How long should you watch the lineup before deciding to enter?',
 '[{"text":"At least 5 minutes to see set patterns","correct":true},{"text":"30 seconds","correct":false},{"text":"Just look once","correct":false},{"text":"Until you see one big wave","correct":false}]'::jsonb, 2),
('COACH-STP-001', 'What does the "go/no-go decision" answer?',
 '[{"text":"Whether today''s conditions are appropriate for your level","correct":true},{"text":"How many waves you''ll catch","correct":false},{"text":"Where to park","correct":false},{"text":"What time to leave","correct":false}]'::jsonb, 3),
('COACH-STP-001', 'What is the "safe zone"?',
 '[{"text":"The area where you can practice without big waves breaking on top of you","correct":true},{"text":"The parking lot","correct":false},{"text":"Where the lifeguard sits","correct":false},{"text":"Far from any waves","correct":false}]'::jsonb, 4);

-- COACH-STP-005 (3 questions)
INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES
('COACH-STP-005', 'How should you place the board on the water?',
 '[{"text":"Gently, parallel to incoming waves, no slap","correct":true},{"text":"Drop it from waist height","correct":false},{"text":"Throw it forward","correct":false},{"text":"Stand on it first","correct":false}]'::jsonb, 1),
('COACH-STP-005', 'Why does board orientation matter when placing?',
 '[{"text":"If perpendicular to waves, the foam will rip it from your hands","correct":true},{"text":"Doesn''t matter — board floats either way","correct":false},{"text":"Only matters for speed","correct":false},{"text":"Only matters in the lineup","correct":false}]'::jsonb, 2),
('COACH-STP-005', 'After releasing the board, what should you do?',
 '[{"text":"Stay ready to grab the rails again instantly if foam comes","correct":true},{"text":"Walk away","correct":false},{"text":"Climb on immediately without checking","correct":false},{"text":"Dive under the water","correct":false}]'::jsonb, 3);

-- COACH-STP-013 (3 questions)
INSERT INTO lesson_quizzes (lesson_id, question, options, display_order) VALUES
('COACH-STP-013', 'In cobra position, where are your hands placed?',
 '[{"text":"At rib height on the rails","correct":true},{"text":"At the nose of the board","correct":false},{"text":"On the tail","correct":false},{"text":"On your face","correct":false}]'::jsonb, 1),
('COACH-STP-013', 'To turn the board while in cobra, what do you do?',
 '[{"text":"Look in the direction you want to go and press that side''s rail","correct":true},{"text":"Lean back","correct":false},{"text":"Close your eyes","correct":false},{"text":"Stop the board first","correct":false}]'::jsonb, 2),
('COACH-STP-013', 'What does "eyes lead" mean in cobra steering?',
 '[{"text":"Where your eyes look, your body follows — direction starts with the gaze","correct":true},{"text":"Keep eyes closed","correct":false},{"text":"Look at your feet","correct":false},{"text":"Look up at the sky","correct":false}]'::jsonb, 3);
