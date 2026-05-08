-- 00021G — Pre-Course 8 items in student voice
-- Source: WB_ALL_CONTENT_STUDENT_VOICE_v1_EN.md (Marcelo, 2026-05-08)
-- Idempotent: replaces description_md with student-voice canon

BEGIN;

UPDATE lessons SET
  title = 'Safety Rules',
  description_md = '## What you''ll learn

You learn the foundation of every water session: the 3 safety signals, the star-fall protocol, leash discipline, and how to keep your board from hurting other surfers.

## Why it matters

Surfing without safety knowledge is dangerous to you and dangerous to others. Before any technique, before any wave, you need this. The ocean does not negotiate with surfers who skip safety.

## What you need to know

- The 3 safety signals you must recognize and respond to (your coach demonstrates).
- The star-fall protocol: arms extended, body flat, face up. Never dive head-first.
- Your board is always under your control. Never let it hit another surfer.
- Your leash is always attached and in good condition. Check before every session.
- Communication is non-negotiable: signal early when in trouble, signal clearly when you have priority.

## How you know you''ve got it

- You can recognize and respond to the 3 safety signals correctly.
- You execute the star-fall protocol on command.
- You explain the leash protocol and why it is non-negotiable.',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'PC-PRE-01';

UPDATE lessons SET
  title = 'Etiquette Rules',
  description_md = '## What you''ll learn

You learn how to coexist in the water with respect. Without etiquette there are accidents and fights — both ruin your sessions and others''.

## Why it matters

Surfing is a community. Without etiquette, you become a hazard or an aggressor. The lineup follows rules. You learn them now or you learn them the hard way.

## What you need to know

- Priority rule: the surfer closest to the peak (where the wave breaks first) has priority over the wave.
- No drop-in: never take a wave already being surfed by someone else. This is the most serious offense.
- No snaking: don''t paddle around someone to "steal" their priority.
- Paddle around the lineup, never through the middle.
- Respect the locals. When you arrive somewhere new, observe before paddling to the peak.
- Communicate. A look, a word, a gesture. Silence creates confusion.

## How you know you''ve got it

- You state the priority rule from memory.
- You explain the 5 non-negotiable lineup rules.
- You demonstrate proper paddle path around the lineup.',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'PC-PRE-02';

UPDATE lessons SET
  title = 'Wave Parts and Types (Left/Right)',
  description_md = '## What you''ll learn

You learn to identify the parts of a wave and the difference between a left, a right, and an A-frame. This is the foundation of every other ocean reading skill.

## Why it matters

You cannot read what you cannot name. Knowing the parts of a wave lets you communicate with your coach, position yourself correctly, and choose your direction intentionally.

## What you need to know

- Peak — the highest point of the wave, where it breaks first.
- Shoulder — the unbroken face extending from the peak.
- Pocket — the most powerful zone next to the peak.
- Lip — the top edge of the wave that throws over.
- Wall — the steep face of the wave.
- Whitewater (foam) — the broken portion behind the breaking line. White Belt territory.
- Trough — the bottom flat zone before the wave reforms.
- Wave types: Left (breaks toward your left), Right (breaks toward your right), A-frame (breaks both ways from a single peak).

## How you know you''ve got it

- You name and point to all 7 wave parts in a real wave.
- You correctly identify a left vs a right from the beach.
- You recognize an A-frame.',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'PC-PRE-03';

UPDATE lessons SET
  title = 'Stages of the Wave (1-4)',
  description_md = '## What you''ll learn

You learn the 4 stages every wave passes through, from the swell to the shore. Understanding the stages tells you where you should be at each moment.

## Why it matters

You can''t catch a wave if you don''t know which stage it''s in. White Belt operates primarily in Stage 4 (whitewater). Higher belts progressively access stages 2 and 3.

## What you need to know

- Stage 1 — Swell: the wave is still in deep water, traveling toward shore. Not yet breaking. You read it from the lineup.
- Stage 2 — Approach: the wave starts feeling the bottom and rises in height. This is when you decide: is this wave for me?
- Stage 3 — Break: the wave breaks. The peak collapses, the lip throws over, foam forms. The pop-up window opens here.
- Stage 4 — Reform / Whitewater: the broken wave continues toward shore as foam. White Belt rides Stage 4.

## How you know you''ve got it

- You name the 4 stages in order without prompting.
- You identify which stage a wave is in by visual observation.
- You explain which stage corresponds to White Belt training.',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'PC-PRE-04';

UPDATE lessons SET
  title = 'What to Do If You Lose the Board',
  description_md = '## What you''ll learn

You learn the emergency board loss protocol. The leash is your first line of defense, but you need a backup plan for when things go wrong.

## Why it matters

In a real emergency, you do not have time to think. You execute the protocol you trained. This is what trained surfers do automatically.

## What you need to know

- The leash is your first defense — never surf without one.
- If the board separates from you: do NOT panic. Float in star-fall position.
- Track the board visually. If it''s downstream from you, swim to it. If upstream, the wave will bring it back — do NOT swim against the current.
- If the board is far away or the current is strong, signal for help (arm up, waving). Conserve energy.
- Do NOT chase the board if it puts you in danger (rocks, strong rip, shore break).
- Never grab someone else''s board. Never let your board hit another surfer.

## How you know you''ve got it

- You explain the leash protocol clearly.
- You state the board recovery sequence in order.
- You identify when chasing the board is dangerous and what to do instead.',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'PC-PRE-05';

UPDATE lessons SET
  title = 'If in Doubt, Don''t Go Out',
  description_md = '## What you''ll learn

You learn how to make an honest go/no-go decision before entering the water. This is the most important decision of every session.

## Why it matters

Every session begins with a choice. If conditions feel beyond your level, they probably are. The ocean does not negotiate. A bad call about your readiness costs more than missing one session.

## What you need to know

- Before every session, check 6 risk factors: wave size, current, crowd, your body, the forecast, your local knowledge.
- If 2 or more answers come back negative, the call is no-go.
- Wait. Watch. Learn. The next session will be better.
- The best surfers are the ones who survived the most no-go calls.

## How you know you''ve got it

- You list the 6 risk factors from memory.
- You make a go/no-go decision honestly, not based on ego.
- You verbalize the doctrine "if in doubt, don''t go out" before entering.',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'PC-PRE-06';

UPDATE lessons SET
  title = 'Timing to Go Out and Come In',
  description_md = '## What you''ll learn

You learn that the ocean has rhythm — sets and lulls — and how to time your entry and exit for safety and efficiency.

## Why it matters

Bad timing exhausts you, ruins your session, and can put you in danger. Good timing makes you efficient and safe.

## What you need to know

- Watch the lineup for at least 5 minutes before paddling out. Identify the set pattern: how many waves per set, how long the lulls last.
- Time your paddle out at the start of a lull. You typically have 2-4 minutes before the next set arrives.
- If a set catches you mid-paddle, use turtle roll (Block 6) or duck dive (advanced) to pass through.
- Same logic for coming in: wait for a lull, paddle to the inside, use the last whitewater of a set as a free ride to the beach.
- Never come in while a set is breaking on the inside — the foam can throw you against rocks or the bottom.

## How you know you''ve got it

- You observe a lineup for 5 minutes and identify the set pattern.
- You time your paddle out at the start of a lull.
- You state the rule "never come in during a set" and follow it.',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'PC-PRE-07';

UPDATE lessons SET
  title = 'How to Learn to Train — TSS Method',
  description_md = '## What you''ll learn

You learn the methodological foundation of TSS. Before you train, you understand HOW TSS teaches and how YOU learn within the system.

## Why it matters

The TSS vocabulary is the bridge between you and your coach. Without the shared language, instructions don''t land. The One Wave principle is what makes you progress fast — quality over quantity.

## What you need to know

- TSS vocabulary: Step (STP) is a canonical movement. Drill (DRL) is how you train it. Mission (MIS) is how you apply it. Sequence (SEQ) is a chain of steps. Belt is your level. Value is the central virtue of your belt. Block is a pedagogical group of steps.
- The One Wave Framework: mastery does not come from how many waves you took — it comes from how many you extracted as learning.
- Quality over quantity. Reflection is part of the ride.
- The protocol per wave: (1) Intention before paddling, (2) Execution with focus, (3) Observation of what happened, (4) Adjustment for the next wave, (5) Five canonical post-wave questions.
- The 5 questions: What did I want to do? What did I actually do? What worked? What didn''t work? What do I adjust for the next?
- Doctrinal Principle: Sequences define WHAT is learned. Drills define HOW to train it. Missions define HOW the learning is applied.

## How you know you''ve got it

- You define Step, Drill, Mission, Sequence, Belt, Value, Block in your own words.
- You execute the One Wave Protocol live in a session — saying the 5 questions before and after waves.
- You explain why TSS prioritizes quality over quantity.',
  active = TRUE,
  status_v1 = 'PRODUCTIZED'
WHERE id = 'PC-PRE-08';

COMMIT;
