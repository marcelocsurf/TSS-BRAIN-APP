// import-coach-wb-exit-test.mjs
//
// Imports the 50-question Coach White Belt Exit Test as:
//   - 1 lesson row (COACH-WB-EXIT-TEST, lesson_type='test', course_section='coach_wb')
//   - 50 lesson_quizzes rows linked to it
//
// All questions extracted from the TSS WB Coach Manual v4 EN — every
// answer cites the Part it comes from. No invention; this is a
// distillation of explicit canonical content from the manual.
//
// Distribution (per Part XI.2 of the manual):
//   - Canon & Methodology       — 15 questions
//   - White Belt Content        — 15 questions
//   - How to Teach (delivery)   — 15 questions
//   - Certification & Ethics    —  5 questions
//
// Pass threshold: 80% (per Part IX of the manual).
//
// Modes:
//   --dry-run   parse + print counts
//   --apply     upsert lesson + delete-and-reinsert quizzes
//
// Run from repo root:
//   node scripts/import-coach-wb-exit-test.mjs --dry-run
//   node scripts/import-coach-wb-exit-test.mjs --apply

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();
const supabase = createClient(url, key, { auth: { persistSession: false } });

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');
if (!APPLY && !args.has('--dry-run')) {
  console.error('Usage: node scripts/import-coach-wb-exit-test.mjs --dry-run | --apply');
  process.exit(1);
}

// ─── lesson row ─────────────────────────────────────────────

const LESSON_ID = 'COACH-WB-EXIT-TEST';
const lesson = {
  id: LESSON_ID,
  course_section: 'coach_wb',
  step_number: 16,
  title: '🎯 Exit Test — Coach White Belt Certification Quiz',
  subtitle: '50 questions · 80% pass · drawn from Coach Manual v4 EN canonical content',
  pillar: 'Coach Delivery',
  description_md:
    `# White Belt Coach Exit Test\n\n` +
    `This 50-question knowledge review is **Component 1** of the official Exit Test ` +
    `(per Part XI.2 of the Coach Manual). Every question is drawn from explicit ` +
    `content in the WB Coach Manual v4 EN.\n\n` +
    `**Pass threshold:** 80% (40/50 correct).\n\n` +
    `**Topics covered:**\n` +
    `- Canon & Methodology (Parts I–II, XII)\n` +
    `- White Belt Content (Parts III–V, VI–VIII, the 25 STPs)\n` +
    `- How to Teach (Parts X, XI, XII — EDPF, Triad, Flow Channel, error taxonomy)\n` +
    `- Certification & Ethics (Parts XIII, XIV)\n\n` +
    `**Doctrinal note:** This is the THEORETICAL component. ` +
    `Practical Demonstration (Component 2) and Belt Value Embodiment (Component 3) ` +
    `are evaluated in-person by your Coach Educator (L5) and final certification ` +
    `is issued by TSS Global.\n\n` +
    `When you're ready, scroll down to begin.`,
  drill_md: null,
  errors_md: null,
  video_url: null,
  cover_image_url: null,
  estimated_minutes: 60,
  prerequisites: ['COACH-WB-15'],  // After all 15 Coach Manual lessons
  lesson_type: 'test',
  display_order: 16,
  active: true,
};

// ─── 50 questions ────────────────────────────────────────────
// Each question cites the Part of the manual it derives from in `cite`.
// Distractors are also grounded in real manual content (alternative belts,
// alternative roles, etc.) — not random fakes.

const QUESTIONS = [
  // ─── A. CANON & METHODOLOGY (15) ───
  {
    cite: 'Part I.1',
    question: 'What is the central operating principle of The Surf Sequence methodology?',
    options: [
      { text: 'Surfing is learned, taught, and progressed through sequences', correct: true },
      { text: 'It is a digital application for surf coaching', correct: false },
      { text: 'It is a brand-licensing system for surf schools', correct: false },
      { text: 'It is a competitive surf league framework', correct: false },
    ],
  },
  {
    cite: 'Part I.4',
    question: 'At what point in the sequence do the Three Circles of Power activate?',
    options: [
      { text: 'After the pop-up (Sequence M3+)', correct: true },
      { text: 'During the warm-up (Block 0)', correct: false },
      { text: 'During paddle-out', correct: false },
      { text: 'Only when competing', correct: false },
    ],
  },
  {
    cite: 'Part I.4',
    question: 'Circle 1 (BODY) of the Three Circles framework includes which four mechanics?',
    options: [
      { text: 'Posture · Rotation · Compression · Hold (P·R·C·H)', correct: true },
      { text: 'Push · Reach · Catch · Hold', correct: false },
      { text: 'Paddle · Position · Cobra · Pop-up', correct: false },
      { text: 'Power · Rhythm · Control · Heart', correct: false },
    ],
  },
  {
    cite: 'Part I.4 (Circle 2)',
    question: 'Per the canon, what is the default Neutral feet position used at White Belt for stability and speed?',
    options: [
      { text: 'FP2 (centered)', correct: true },
      { text: 'FP1 (furthest back)', correct: false },
      { text: 'FP3 (between FP1 and FP2)', correct: false },
      { text: 'FP0 (forward)', correct: false },
    ],
  },
  {
    cite: 'Part I.5',
    question: 'What is the operational synthesis of the TSS Dual Philosophy?',
    options: [
      { text: 'Classical to build the base → Ecological to transfer to the real ocean', correct: true },
      { text: 'Ecological only — TSS rejects classical biomechanics drills', correct: false },
      { text: 'Classical only — sequences are fixed and not contextual', correct: false },
      { text: 'Behavioral conditioning with reward/punishment loops', correct: false },
    ],
  },
  {
    cite: 'Part I.6',
    question: 'Per the canon, which statement correctly defines Sequence, Drill, and Mission?',
    options: [
      { text: 'Sequence = WHAT is learned · Drill = HOW the skill is trained · Mission = HOW the learning is applied', correct: true },
      { text: 'They are interchangeable terms for the same concept', correct: false },
      { text: 'Sequence = land · Drill = water · Mission = competition', correct: false },
      { text: 'Sequence = video · Drill = quiz · Mission = certification', correct: false },
    ],
  },
  {
    cite: 'Part I.6',
    question: 'According to v8.0/v8.1, the Mission is the vehicle of which learning approach?',
    options: [
      { text: 'Ecological Dynamics (Rob Gray)', correct: true },
      { text: 'Classical / isolated motor learning', correct: false },
      { text: 'Behaviorist reinforcement', correct: false },
      { text: 'Cognitive load theory', correct: false },
    ],
  },
  {
    cite: 'Part I.7',
    question: 'What is the canonical Belt Value at White Belt?',
    options: [
      { text: 'Humildad (Humility)', correct: true },
      { text: 'Conciencia (Awareness)', correct: false },
      { text: 'Proceso / Resiliencia', correct: false },
      { text: 'Compromiso Consciente', correct: false },
    ],
  },
  {
    cite: 'Part I.7',
    question: 'What is the Belt Value assigned to the Pre-Course (before White Belt)?',
    options: [
      { text: 'Conciencia (Awareness)', correct: true },
      { text: 'Humildad', correct: false },
      { text: 'Proceso / Resiliencia', correct: false },
      { text: 'Compromiso Consciente', correct: false },
    ],
  },
  {
    cite: 'Part 0 + II.4',
    question: 'What is the coach\'s role at White Belt?',
    options: [
      { text: 'Director', correct: true },
      { text: 'Mentor', correct: false },
      { text: 'Coach', correct: false },
      { text: 'Advisor', correct: false },
    ],
  },
  {
    cite: 'Part 0 (Role evolution)',
    question: 'Per the canon, what is the correct evolution of the coach role across belts?',
    options: [
      { text: 'Director (White) → Mentor (Yellow) → Coach (Blue) → Advisor (Purple) → Performance Coach (Brown) → Master (Black)', correct: true },
      { text: 'Coach → Mentor → Director → Advisor → Master → Performance Coach', correct: false },
      { text: 'All belts use the Director role with different curriculum', correct: false },
      { text: 'The coach role changes per student, not per belt', correct: false },
    ],
  },
  {
    cite: 'Part 0 (Coach role)',
    question: 'What is the maximum student ratio for an L1 Foundation Coach at White Belt?',
    options: [
      { text: '1:4 (4 students max per coach)', correct: true },
      { text: '1:8', correct: false },
      { text: '1:2', correct: false },
      { text: 'No formal limit', correct: false },
    ],
  },
  {
    cite: 'Part I.4',
    question: '"FLOW" in the Three Circles framework is defined as:',
    options: [
      { text: 'The state when the surfer successfully combines BODY, BOARD, and WAVE on a single ride', correct: true },
      { text: 'The river current of the ocean', correct: false },
      { text: 'The student\'s emotional state during pop-up', correct: false },
      { text: 'The order of the 25 STPs', correct: false },
    ],
  },
  {
    cite: 'Part II.3',
    question: 'TSS holistic growth at White Belt is structured around how many pillars + one additional layer?',
    options: [
      { text: '4 pillars + Safety LAYER', correct: true },
      { text: '3 pillars + Ethics layer', correct: false },
      { text: '5 pillars', correct: false },
      { text: '1 pillar (Technical only)', correct: false },
    ],
  },
  {
    cite: 'Part 0 (TOC) + Part V',
    question: 'At White Belt, how many cumulative sequences make up the modules?',
    options: [
      { text: '5 sequences', correct: true },
      { text: '3 sequences', correct: false },
      { text: '7 sequences', correct: false },
      { text: '10 sequences', correct: false },
    ],
  },

  // ─── B. WHITE BELT CONTENT (15) ───
  {
    cite: 'Part VI.1',
    question: 'What is STP-001, the first step of White Belt (Sequence #1, Block 0-1)?',
    options: [
      { text: 'Venue Analysis', correct: true },
      { text: 'Warm Up', correct: false },
      { text: 'Grab Board', correct: false },
      { text: 'Pop-Up', correct: false },
    ],
  },
  {
    cite: 'Part VI.1',
    question: 'The 5 key words you plant in the student\'s vocabulary for STP-001 (Venue Analysis) are:',
    options: [
      { text: 'MAP · ZONE · HAZARD · ENTRY · DECIDE', correct: true },
      { text: 'POSTURE · ROTATION · COMPRESSION · HOLD · EYES', correct: false },
      { text: 'MOBILITY · ACTIVATION · SIMULATION · BREATH · READY', correct: false },
      { text: 'COBRA · POP · STAND · STANCE · IMPULSE', correct: false },
    ],
  },
  {
    cite: 'Part VI.2',
    question: 'The 5 key words for STP-002 (Warm Up) are:',
    options: [
      { text: 'MOBILITY · ACTIVATION · SIMULATION · BREATH · READY', correct: true },
      { text: 'WAVE · WIND · TIDE · CURRENT · CROWD', correct: false },
      { text: 'HANDS · CHEST · HIPS · KNEES · EYES', correct: false },
      { text: 'ENTRY · EXIT · IMPACT · SAFE · GO', correct: false },
    ],
  },
  {
    cite: 'Part IX (sample) + VI.16',
    question: 'During the pop-up (STP-016), when should the hands release the board rails?',
    options: [
      { text: 'Only when centered and stable — never before', correct: true },
      { text: 'Immediately at the start of the pop-up', correct: false },
      { text: 'Halfway through the pop-up', correct: false },
      { text: 'Hands should stay on the rails throughout the ride', correct: false },
    ],
  },
  {
    cite: 'Part VI.20',
    question: 'What is STP-020, the safe-exit skill of Sequence #4?',
    options: [
      { text: 'Starfish Dismount', correct: true },
      { text: 'Prone Dismount', correct: false },
      { text: 'Turtle Roll', correct: false },
      { text: 'Walk Back to Sand', correct: false },
    ],
  },
  {
    cite: 'Part VI.24',
    question: 'What is STP-024, the Sequence #5 skill for getting out through whitewater?',
    options: [
      { text: 'Turtle Roll', correct: true },
      { text: 'Walk Out', correct: false },
      { text: 'Cobra', correct: false },
      { text: 'Pop-Up', correct: false },
    ],
  },
  {
    cite: 'Part X.2 / Part VI.16',
    question: 'In the pop-up diagnostic, where should the hands be placed on the board?',
    options: [
      { text: 'Between chest and ribs — NOT toward the nose', correct: true },
      { text: 'Toward the nose of the board', correct: false },
      { text: 'At the tail of the board', correct: false },
      { text: 'Wherever the student feels comfortable', correct: false },
    ],
  },
  {
    cite: 'Part XI.2',
    question: 'How many mandatory items make up the Pre-Course (Module 0)?',
    options: [
      { text: '8 items', correct: true },
      { text: '6 items', correct: false },
      { text: '4 items', correct: false },
      { text: '12 items', correct: false },
    ],
  },
  {
    cite: 'Part XI.2',
    question: 'How many items are in the White Belt Onboarding (Module 1)?',
    options: [
      { text: '6 items', correct: true },
      { text: '8 items', correct: false },
      { text: '4 items', correct: false },
      { text: '25 items', correct: false },
    ],
  },
  {
    cite: 'Part VI (overview)',
    question: 'How many active STPs are in the White Belt sequence?',
    options: [
      { text: '25 STPs', correct: true },
      { text: '39 STPs', correct: false },
      { text: '50 STPs', correct: false },
      { text: '6 STPs (one per Named System)', correct: false },
    ],
  },
  {
    cite: 'Part XI.5',
    question: 'Per the Exit Test rubric, "Ideal" power stance is held for how long?',
    options: [
      { text: '5+ seconds — low, stable, relaxed', correct: true },
      { text: '3 seconds — rigid', correct: false },
      { text: '1 second is enough', correct: false },
      { text: 'The whole ride from start to beach', correct: false },
    ],
  },
  {
    cite: 'Part XI.5',
    question: 'Per the Exit Test rubric, "Ideal" pop-up means:',
    options: [
      { text: 'Clean every attempt, into stance', correct: true },
      { text: 'Clean 3/5 attempts, eyes forward', correct: false },
      { text: 'Knee drag, looking down, >2s', correct: false },
      { text: 'Skipping cobra is acceptable if fast', correct: false },
    ],
  },
  {
    cite: 'Part XI.3',
    question: 'Sequence #1 (the entry sequence) spans which STPs?',
    options: [
      { text: 'STP-003 (Grab Board) to STP-009 (Walk Back to Sand)', correct: true },
      { text: 'STP-001 (Venue Analysis) to STP-005 (Place Board)', correct: false },
      { text: 'STP-010 (Sweet Spot) to STP-016 (Pop-Up)', correct: false },
      { text: 'STP-018 to STP-025', correct: false },
    ],
  },
  {
    cite: 'Part I.6',
    question: 'Per the canon, what is a Drill at TSS?',
    options: [
      { text: 'The training of a step\'s mechanics — typically dry or in calm conditions, repetition with purpose', correct: true },
      { text: 'The competitive performance of a step', correct: false },
      { text: 'A video lesson with no movement', correct: false },
      { text: 'A theoretical exam question', correct: false },
    ],
  },
  {
    cite: 'Part VI.1 (How you validate)',
    question: 'A student is promoted past STP-001 only when how many criteria are met, and across how many sessions?',
    options: [
      { text: 'All 3 criteria, across 3 different sessions', correct: true },
      { text: 'Any 1 criterion, in 1 session', correct: false },
      { text: 'All 3 criteria in a single perfect session', correct: false },
      { text: 'No formal criteria — coach discretion', correct: false },
    ],
  },

  // ─── C. HOW TO TEACH (15) ───
  {
    cite: 'Part XII.1',
    question: 'What does the EDPF pedagogical model stand for?',
    options: [
      { text: 'Explain · Demonstrate · Participate · Feedback', correct: true },
      { text: 'Evaluate · Drill · Practice · Final', correct: false },
      { text: 'Explore · Develop · Perform · Finish', correct: false },
      { text: 'Emphasis · Decision · Practice · Fluency', correct: false },
    ],
  },
  {
    cite: 'Part XII.1 (Coach Note)',
    question: 'Per the Coach Manual, what is the universal rule about "Demonstrate" in EDPF at White Belt?',
    options: [
      { text: 'ALWAYS demonstrate — white belt surfers cannot learn from description alone', correct: true },
      { text: 'Demonstrate only if the student asks for it', correct: false },
      { text: 'Demonstrate only on land, never in the water', correct: false },
      { text: 'Demonstration is optional at White Belt', correct: false },
    ],
  },
  {
    cite: 'Part XII.1',
    question: 'Per doctrine, the Feedback step of EDPF should be:',
    options: [
      { text: 'One clear correction OR one confirmation — not both', correct: true },
      { text: 'Multiple corrections per wave', correct: false },
      { text: 'No feedback until the end of session', correct: false },
      { text: 'A written report after each session', correct: false },
    ],
  },
  {
    cite: 'Part XII.2',
    question: 'Before assigning any drill or mission, the Triad (Surfer × Ocean × Task) requires the coach to evaluate:',
    options: [
      { text: 'The surfer\'s current capacity TODAY, today\'s actual ocean conditions, and the canonical step', correct: true },
      { text: 'The student\'s age, weight, and surf experience years', correct: false },
      { text: 'The student\'s payment status, schedule, and equipment', correct: false },
      { text: 'Wave height only', correct: false },
    ],
  },
  {
    cite: 'Part XII.2',
    question: 'The Triad doctrinal rule states:',
    options: [
      { text: 'Adapt the Task to what Surfer × Ocean allow. NEVER the reverse.', correct: true },
      { text: 'Adapt the Surfer to the Task at all costs', correct: false },
      { text: 'Match the Ocean to the Surfer\'s ego level', correct: false },
      { text: 'The Task always wins over conditions', correct: false },
    ],
  },
  {
    cite: 'Part XII.3',
    question: 'In the Flow Channel framework, "Too easy" produces:',
    options: [
      { text: 'Boredom → no growth', correct: true },
      { text: 'Anxiety → blockage', correct: false },
      { text: 'Fear → injury', correct: false },
      { text: 'Mastery → certification', correct: false },
    ],
  },
  {
    cite: 'Part XII.3',
    question: 'In the Flow Channel framework, "Too hard" produces:',
    options: [
      { text: 'Anxiety → blockage', correct: true },
      { text: 'Boredom → no growth', correct: false },
      { text: 'Faster learning', correct: false },
      { text: 'Promotion to Yellow Belt', correct: false },
    ],
  },
  {
    cite: 'Part X.1',
    question: 'What is the universal diagnostic principle when a student fails at Step N?',
    options: [
      { text: 'Work BACKWARD through the blocks — always check the previous block first', correct: true },
      { text: 'Push forward to Step N+1 to see if they can do that', correct: false },
      { text: 'Skip to land drills immediately, no questions asked', correct: false },
      { text: 'Promote them to Yellow Belt to "shock learn"', correct: false },
    ],
  },
  {
    cite: 'Part X.2',
    question: 'In the pop-up diagnostic tree, what is the FIRST check when a student cannot stand on the board?',
    options: [
      { text: 'Hand placement (between chest and ribs, NOT toward the nose)', correct: true },
      { text: 'Whether they ate breakfast', correct: false },
      { text: 'Wave size', correct: false },
      { text: 'Their feet position on the sand', correct: false },
    ],
  },
  {
    cite: 'Part X.3',
    question: 'Which of the following is a Red Flag that BLOCKS promotion from White Belt to Yellow Belt?',
    options: [
      { text: 'Star fall (starfish dismount) is not automatic', correct: true },
      { text: 'Student is over 30 years old', correct: false },
      { text: 'Student speaks a different language than the coach', correct: false },
      { text: 'Student prefers backside turns', correct: false },
    ],
  },
  {
    cite: 'Part X.4',
    question: 'The "Natural Athlete" false-positive type is tested by:',
    options: [
      { text: 'Checking whether the surfer follows the full sequence and the pop-up mechanics', correct: true },
      { text: 'Asking how many years they\'ve surfed', correct: false },
      { text: 'Measuring their wave count', correct: false },
      { text: 'Looking at their gym performance', correct: false },
    ],
  },
  {
    cite: 'Part X.4',
    question: 'The "Coach-Dependent" false-positive type is tested by:',
    options: [
      { text: 'Silent 10-minute observation with zero cues. Does quality hold?', correct: true },
      { text: 'Asking the student if they need help', correct: false },
      { text: 'Letting them surf alone for one wave', correct: false },
      { text: 'A written exam', correct: false },
    ],
  },
  {
    cite: 'Part XI.1',
    question: 'Exit Test Component 1 (theoretical) is:',
    options: [
      { text: 'A 50-question knowledge review · 80% pass · 60 min max', correct: true },
      { text: 'A 25-question quiz · 50% pass · no time limit', correct: false },
      { text: 'A multi-day written essay', correct: false },
      { text: 'An interview only', correct: false },
    ],
  },
  {
    cite: 'Part XI.1',
    question: 'Exit Test Component 2 requires the student to:',
    options: [
      { text: 'Demonstrate 7 practical components in-water — ALL must pass', correct: true },
      { text: 'Compete in a local surf contest', correct: false },
      { text: 'Coach a beginner for a day', correct: false },
      { text: 'Wait 6 months between attempts', correct: false },
    ],
  },
  {
    cite: 'Part XI.1',
    question: 'Exit Test Component 3 is:',
    options: [
      { text: 'Belt Value Embodiment (Humildad) — coach behavioral observation', correct: true },
      { text: 'A written autobiography', correct: false },
      { text: 'A timed sprint paddle test', correct: false },
      { text: 'A multiple-choice ethics exam', correct: false },
    ],
  },

  // ─── D. CERTIFICATION & ETHICS (5) ───
  {
    cite: 'Part XI.0',
    question: 'Where does final certification authority at TSS Brain reside?',
    options: [
      { text: 'TSS Global through L5 Coach Educators', correct: true },
      { text: 'Any L1 Foundation Coach', correct: false },
      { text: 'The student\'s own coach', correct: false },
      { text: 'The academy coordinator', correct: false },
    ],
  },
  {
    cite: 'Part XI.6',
    question: 'What is the minimum number of supervised sessions a White Belt student needs before attempting the Exit Test?',
    options: [
      { text: '6 supervised sessions', correct: true },
      { text: '1 session if it is a "peak day"', correct: false },
      { text: '12 sessions', correct: false },
      { text: 'No minimum — coach decides', correct: false },
    ],
  },
  {
    cite: 'Part XIII.2 / Part I.7',
    question: 'At White Belt, the canonical definition of Humildad (Humility) is:',
    options: [
      { text: 'Walk without thinking you are above anyone; always willing to learn; accept being a beginner', correct: true },
      { text: 'Hide your skill so others feel comfortable', correct: false },
      { text: 'Train more than your peers to prove yourself', correct: false },
      { text: 'Always agree with the coach without question', correct: false },
    ],
  },
  {
    cite: 'Part I.7 (doctrinal note)',
    question: 'If a White Belt student CANNOT embody Humildad at exit, what is the canonical consequence?',
    options: [
      { text: 'They cannot graduate White Belt — even if all technical criteria are met', correct: true },
      { text: 'They still graduate because technique is what counts', correct: false },
      { text: 'They are promoted but with a "soft" certification', correct: false },
      { text: 'They go back to Pre-Course', correct: false },
    ],
  },
  {
    cite: 'Part X.3 (doctrinal)',
    question: 'The Coach Manual v3.0 doctrinal rule about premature promotion says:',
    options: [
      { text: 'Promoting a surfer who is not ready puts them in Yellow Belt where they will fail and lose confidence', correct: true },
      { text: 'Always promote on schedule to maintain academy revenue', correct: false },
      { text: 'Skip steps if the student is bored', correct: false },
      { text: 'Promote within 6 weeks regardless of mastery', correct: false },
    ],
  },
];

// ─── dry-run preview ─────────────────────────────────────────

console.log(`\n━━━━━ TSS Coach WB — Exit Test Quiz — Import ━━━━━`);
console.log(`Mode: ${APPLY ? 'APPLY (will write DB)' : 'DRY-RUN (no DB writes)'}`);
console.log(`Lesson ID: ${LESSON_ID}`);
console.log(`Questions: ${QUESTIONS.length}`);
console.log(`Pass threshold: 80%\n`);

// Validate
let bad = 0;
for (let i = 0; i < QUESTIONS.length; i++) {
  const q = QUESTIONS[i];
  if (q.options.length !== 4) {
    console.error(`Q${i + 1} has ${q.options.length} options (expected 4): ${q.question}`);
    bad++;
  }
  const correctCount = q.options.filter((o) => o.correct).length;
  if (correctCount !== 1) {
    console.error(`Q${i + 1} has ${correctCount} correct options (expected 1): ${q.question}`);
    bad++;
  }
}
if (bad > 0) {
  console.error(`\nValidation failures: ${bad}. Aborting.`);
  process.exit(1);
}

// Topic breakdown
const a = QUESTIONS.slice(0, 15);
const b = QUESTIONS.slice(15, 30);
const c = QUESTIONS.slice(30, 45);
const d = QUESTIONS.slice(45, 50);
console.log(`  A. Canon & Methodology:       ${a.length} questions (cites: ${a.map((q) => q.cite).join(', ')})`);
console.log(`  B. White Belt Content:        ${b.length} questions (cites: ${b.map((q) => q.cite).join(', ')})`);
console.log(`  C. How to Teach (delivery):   ${c.length} questions (cites: ${c.map((q) => q.cite).join(', ')})`);
console.log(`  D. Certification & Ethics:    ${d.length} questions (cites: ${d.map((q) => q.cite).join(', ')})`);
console.log();

if (!APPLY) {
  console.log('(dry-run — no DB writes. Re-run with --apply to import.)\n');
  process.exit(0);
}

// ─── apply: upsert lesson + delete+reinsert quizzes ───────────

console.log(`Upserting lesson ${LESSON_ID}…`);
const { error: lessonErr } = await supabase.from('lessons').upsert([lesson], { onConflict: 'id' });
if (lessonErr) {
  console.error('LESSON UPSERT FAILED:', lessonErr.message);
  process.exit(1);
}
console.log(`✓ Lesson upserted.`);

// Delete existing quizzes for this lesson, then insert fresh batch
console.log(`Replacing quiz questions…`);
const { error: delErr } = await supabase.from('lesson_quizzes').delete().eq('lesson_id', LESSON_ID);
if (delErr) {
  console.error('DELETE FAILED:', delErr.message);
  process.exit(1);
}

const quizRows = QUESTIONS.map((q, idx) => ({
  lesson_id: LESSON_ID,
  question: q.question,
  options: q.options,
  display_order: idx + 1,
}));

const { error: insErr } = await supabase.from('lesson_quizzes').insert(quizRows);
if (insErr) {
  console.error('INSERT FAILED:', insErr.message);
  process.exit(1);
}
console.log(`✓ Inserted ${quizRows.length} quiz questions.\n`);

// Verify
const { count } = await supabase
  .from('lesson_quizzes')
  .select('*', { count: 'exact', head: true })
  .eq('lesson_id', LESSON_ID);
console.log(`Verification: ${count} rows in lesson_quizzes for ${LESSON_ID}\n`);
