-- 00021A — Pre-Course Module 0 canon (8 items)
-- Source: 02_PRE_COURSE_canon.md (Belt Value: Conciencia)
--
-- Strategy per Marcelo (D3 = "si reemplazar"):
-- - DEACTIVATE old PC-001, PC-002, PC-003, PC-011, PC-012 (subsumed into PC-PRE)
--   Note: PC-004, 005, 006, 007, 008, 009 stay active; they go to Onboarding (00021B)
-- - INSERT 8 new PC-PRE-XX items with full canon content
-- - All Pre-Course items live in course_section='pre_course_fundamentals'
--   with pc_section_id='M0' (Module 0 Pre-Course) for grouping in UI

BEGIN;

-- 1. Deactivate old PC items being replaced by PC-PRE-XX
UPDATE lessons SET active = FALSE
  WHERE id IN ('PC-001', 'PC-002', 'PC-003', 'PC-011', 'PC-012');

-- 2. Insert 8 PC-PRE-XX with full canon content
INSERT INTO lessons (
  id, course_section, step_number, title, pillar,
  description_md, estimated_minutes,
  prerequisites, lesson_type, display_order, active, status_v1,
  pc_section_id, pc_section_name, pc_section_order
) VALUES
(
  'PC-PRE-01', 'pre_course_fundamentals', 201, 'Safety Rules', 'Safety',
  'Understand and respond to the 3 safety signals.

Master the star-fall protocol: arms extended, body flat, face up; never dive head-first.

The board is always controlled and kept away from other surfers. The leash is always attached and in good condition. Communication is non-negotiable: signal early when in trouble, signal clearly when you have priority.

This is the foundation of every water session. No exceptions.

**Success criterion:** Student can: (1) recognize and respond to the 3 safety signals, (2) execute the star-fall correctly when commanded, (3) explain the leash protocol and why it is non-negotiable.

*Source: PC-001 Safety Rules Canon v1 + Core Canon v8.0 B.6*',
  10, ARRAY[]::TEXT[], 'reading', 201, TRUE, 'PRODUCTIZED',
  'M0', 'Pre-Course — Foundations', 1
),
(
  'PC-PRE-02', 'pre_course_fundamentals', 202, 'Etiquette Rules', 'Social-Ethical',
  'Priority rule: the surfer closest to the peak (the highest part of the wave, where it breaks first) has priority over the wave.

The 5 non-negotiable lineup rules:
1. No drop-in. Never take a wave already being surfed.
2. No snaking. Don''t paddle around someone to steal their priority.
3. Paddle around the lineup, never through the middle.
4. Respect the locals. Observe before paddling to the peak.
5. Communicate. A look, a word, a gesture. Silence creates confusion.

One wave, one surfer. Respect is non-negotiable.

**Success criterion:** Student can: (1) state the priority rule from memory, (2) explain the 5 non-negotiable lineup rules, (3) demonstrate proper paddle path around the lineup.

*Source: PC-011 Surf Etiquette Canon v1 + Core Canon v8.0 B.6*',
  10, ARRAY[]::TEXT[], 'reading', 202, TRUE, 'PRODUCTIZED',
  'M0', 'Pre-Course — Foundations', 1
),
(
  'PC-PRE-03', 'pre_course_fundamentals', 203, 'Wave Parts and Types (Left/Right)', 'Ocean Literacy',
  'A wave has parts. Knowing them is the foundation of every other ocean reading skill.

**Wave parts:**
- Peak — the highest point, where the wave breaks first
- Shoulder — the unbroken face extending from the peak
- Pocket — the most powerful zone next to the peak
- Lip — the top edge of the wave that throws over
- Wall — the steep face of the wave
- Whitewater (foam) — the broken portion behind the breaking line
- Trough — the bottom flat zone before the wave reforms

**Wave types by direction:**
- Left — when looking from the beach toward the ocean, the wave breaks toward your left. The surfer rides toward their left.
- Right — wave breaks toward your right. Surfer rides right.
- A-frame — wave peaks and breaks both directions simultaneously.

White Belt focuses on whitewater (Block 1-2) before progressing to wave faces.

**Success criterion:** Student can: (1) name and point to all 7 wave parts in a real wave, (2) identify a left vs a right wave correctly from the beach, (3) recognize an A-frame.

*Source: Core Canon v8.0 B.6 (item #3)*',
  10, ARRAY[]::TEXT[], 'reading', 203, TRUE, 'PRODUCTIZED',
  'M0', 'Pre-Course — Foundations', 1
),
(
  'PC-PRE-04', 'pre_course_fundamentals', 204, 'Stages of the Wave (1–4)', 'Ocean Literacy',
  'Every wave passes through 4 stages from the swell to the shore. Understanding these stages tells the surfer where they should be at each moment.

**Stage 1 — Swell:** the wave is still in deep water, traveling toward shore. Not yet breaking. The surfer reads it from the lineup.

**Stage 2 — Approach:** the wave starts feeling the bottom. It rises in height. This is when the surfer decides: is this wave for me? Is the angle right?

**Stage 3 — Break:** the wave breaks. The peak collapses, the lip throws over, whitewater forms. This is the moment of action — pop-up window opens.

**Stage 4 — Reform / Whitewater:** the broken wave continues toward shore as foam. The surfer can either ride the foam (White Belt level) or exit the wave to look for the next.

White Belt operates primarily in Stage 4 (whitewater). Yellow Belt and beyond progressively access Stages 2 and 3.

**Success criterion:** Student can: (1) name the 4 stages in order, (2) identify which stage a wave is in by visual observation, (3) explain which stage corresponds to White Belt training.

*Source: Core Canon v8.0 B.6 (item #4)*',
  10, ARRAY[]::TEXT[], 'reading', 204, TRUE, 'PRODUCTIZED',
  'M0', 'Pre-Course — Foundations', 1
),
(
  'PC-PRE-05', 'pre_course_fundamentals', 205, 'What to Do If You Lose the Board', 'Safety',
  'The leash is your first line of defense. If the board separates from you, the leash brings it back. Never surf without a functioning leash.

**Emergency board loss protocol** (leash failure or breakage):
1. Do NOT panic. Float. Use star-fall position to maximize floatation.
2. Watch the board''s location. Track it visually.
3. If the board is downstream from you (between you and the shore), swim to it.
4. If the board is upstream (between you and the wave), the wave will carry it to you — do NOT swim against the current.
5. If the board is far away or being carried by a strong current, signal for help (arm up, waving). Conserve energy.
6. Do NOT chase the board if it puts you in danger (shallow rocks, strong rip, shore break).

Never grab someone else''s board. Never let your board hit another surfer.

**Success criterion:** Student can: (1) explain the leash protocol, (2) state the board recovery sequence in order, (3) identify when chasing the board is dangerous and what to do instead.

*Source: PC-001 Safety Rules Canon v1 + Core Canon v8.0 B.6 (item #5)*',
  10, ARRAY[]::TEXT[], 'reading', 205, TRUE, 'PRODUCTIZED',
  'M0', 'Pre-Course — Foundations', 1
),
(
  'PC-PRE-06', 'pre_course_fundamentals', 206, 'If in Doubt, Don''t Go Out', 'Risk Management',
  'Every session begins with a decision: enter the water, or not.

If conditions feel beyond your level, they probably are. The ocean does not negotiate. A bad call about your own readiness costs more than missing a session.

**Risk assessment checklist before entering:**
- Wave size — within my belt-level range?
- Current — visible rip currents I cannot manage?
- Crowd — too many surfers for safe positioning?
- My body — energy, focus, hydration, recent injuries?
- The forecast — getting better or worse during my session window?
- Local knowledge — do I know this spot? Or am I new here?

If 2 or more of these answers are negative, the call is no-go. Wait. Watch. Learn.

The best surfers are the ones who survived the most no-go calls.

**Success criterion:** Student can: (1) list the 6 risk factors, (2) make a go/no-go decision honestly, (3) verbalize the doctrine "if in doubt, don''t go out" before entering.

*Source: Core Canon v8.0 B.6 (item #6)*',
  10, ARRAY[]::TEXT[], 'reading', 206, TRUE, 'PRODUCTIZED',
  'M0', 'Pre-Course — Foundations', 1
),
(
  'PC-PRE-07', 'pre_course_fundamentals', 207, 'Timing to Go Out and Come In', 'Ocean Literacy',
  'The ocean has rhythm. Sets come in groups, with calmer periods (lulls) between them. The smart surfer enters and exits in the lull, not in the set.

**Going out:**
- Watch the lineup for at least 5 minutes before paddling.
- Identify the set pattern: how many waves per set, how long is the lull.
- Time your paddle out at the start of a lull. You have 2-4 minutes typically before the next set arrives.
- If a set catches you mid-paddle, use turtle roll (Block 6) or duck dive (advanced) to pass through.

**Coming in:**
- Same logic, reversed. Wait for a lull. Paddle to the inside.
- Use the last whitewater of a set as a free ride to the beach.
- Never come in while a set is breaking on the inside — the foam can throw you against rocks or the bottom.

Reading sets is a skill that grows with hours in the water. White Belt learns to recognize the basic pattern.

**Success criterion:** Student can: (1) observe a lineup for 5 minutes and identify the set pattern, (2) time their paddle out at the start of a lull, (3) state the rule "never come in during a set."

*Source: Core Canon v8.0 B.6 (item #7)*',
  10, ARRAY[]::TEXT[], 'reading', 207, TRUE, 'PRODUCTIZED',
  'M0', 'Pre-Course — Foundations', 1
),
(
  'PC-PRE-08', 'pre_course_fundamentals', 208, 'How to Learn to Train — TSS Method', 'Method & Mindset',
  'This is the methodological foundation of TSS. Before you train, you must understand HOW TSS teaches and how YOU learn within the system.

**The TSS vocabulary you must know:**
- **Step (STP)** — a canonical individual unit of training. Example: STP-016 Pop-Up.
- **Drill (DRL)** — structured exercise to consolidate a step. Repetition with purpose.
- **Mission (MIS)** — the motivational application of part of a sequence in the water. A specific objective with reps, time, and success criteria.
- **Sequence (SEQ)** — a chain of steps that forms a complete routine. White Belt has 5.
- **Belt** — your level. White → Yellow → Blue → Purple → Brown → Black.
- **Value** — central virtue of each belt. White Belt = Humildad.
- **Block** — pedagogical subdivision within a belt. White has Blocks 0 to 6.

**The One Wave Framework — how mastery happens:**
Mastery does not come from how many waves you took. It comes from how many you extracted as learning. **Quality over quantity. Reflection is part of the ride.**

**The One Wave Protocol** (apply on every wave):
1. **Intention** — before paddling, define what you''ll practice. One thing.
2. **Execution** — execute with focus.
3. **Observation** — feel what happened. Body, board, wave.
4. **Adjustment** — define what changes for next.
5. **Five canonical post-wave questions:**
   - What did I want to do?
   - What did I actually do?
   - What worked?
   - What didn''t work?
   - What do I adjust next?

**Doctrinal Principle:** Sequences define WHAT is learned. Drills define HOW to train. Missions define HOW the learning is applied. The sequence is the architecture; the drill is the technique; the mission is the pedagogy.

**Success criterion:** Student can: (1) define Step, Drill, Mission, Sequence, Belt, Value, Block in their own words, (2) execute the One Wave Protocol live in a session (5 questions before/after a wave), (3) explain why TSS prioritizes quality over quantity.

*Source: Fusion of PC-003 Aprender a Aprender + PC-012 One Wave Framework + ONE WAVE book + Core Canon v8.0 A.7*',
  15, ARRAY[]::TEXT[], 'reading', 208, TRUE, 'PRODUCTIZED',
  'M0', 'Pre-Course — Foundations', 1
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description_md = EXCLUDED.description_md,
  pillar = EXCLUDED.pillar,
  pc_section_id = EXCLUDED.pc_section_id,
  pc_section_name = EXCLUDED.pc_section_name,
  pc_section_order = EXCLUDED.pc_section_order,
  active = TRUE,
  status_v1 = 'PRODUCTIZED';

COMMIT;

-- Verification (run separately)
SELECT id, title, pc_section_id, status_v1, active
FROM lessons
WHERE id LIKE 'PC-PRE-%'
ORDER BY display_order;
