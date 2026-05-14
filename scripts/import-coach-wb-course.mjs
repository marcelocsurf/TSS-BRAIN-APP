// import-coach-wb-course.mjs
//
// Imports the WHITE BELT COACH MANUAL v4 EN into Supabase as 15 lessons
// under course_section = 'coach_wb'. These show up in the Courses tab
// of the coach portal automatically.
//
// Source of truth (no invention): TSS_WB_COACH_MANUAL_v4_EN.md
// Strategy: split the manual by top-level `# PART ` headers (Parts I-XV)
// and create one lesson per Part. Content is the full markdown of that
// Part, verbatim, with `\newpage` directives stripped.
//
// Modes:
//   --dry-run   parse + show titles/sizes, do NOT touch DB
//   --apply     upsert into `lessons`
//
// Run from repo root:
//   node scripts/import-coach-wb-course.mjs --dry-run
//   node scripts/import-coach-wb-course.mjs --apply

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ─── env + supabase ───────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();
const supabase = createClient(url, key, { auth: { persistSession: false } });

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');
if (!APPLY && !args.has('--dry-run')) {
  console.error('Usage: node scripts/import-coach-wb-course.mjs --dry-run | --apply');
  process.exit(1);
}

// ─── source file ─────────────────────────────────────────────

const COACH_MANUAL_PATH =
  '/Users/marcelocastellanos/Desktop/1111/_TSS_WHITE_BELT_OFICIAL_v1/COACH_MANUAL_v4_EN/TSS_WB_COACH_MANUAL_v4_EN.md';

const raw = readFileSync(COACH_MANUAL_PATH, 'utf-8');

// ─── lesson metadata (titles + estimates, derived from manual TOC) ────
// Order matches the manual TOC verbatim.

const LESSONS_META = [
  { id: 'COACH-WB-01', n: 1,  title: 'Part I — TSS Foundations',                              minutes: 20 },
  { id: 'COACH-WB-02', n: 2,  title: 'Part II — White Belt Architecture',                     minutes: 10 },
  { id: 'COACH-WB-03', n: 3,  title: 'Part III — Pre-Course Verification Protocol',           minutes: 5  },
  { id: 'COACH-WB-04', n: 4,  title: 'Part IV — Onboarding Delivery (6 items)',               minutes: 10 },
  { id: 'COACH-WB-05', n: 5,  title: 'Part V — The 5 Sequences Delivery Plan',                minutes: 10 },
  { id: 'COACH-WB-06', n: 6,  title: 'Part VI — How You Teach Each of the 25 Steps',          minutes: 60 },
  { id: 'COACH-WB-07', n: 7,  title: 'Part VII — How You Teach the 25 Drills',                minutes: 45 },
  { id: 'COACH-WB-08', n: 8,  title: 'Part VIII — How You Teach the 25 Missions',             minutes: 25 },
  { id: 'COACH-WB-09', n: 9,  title: 'Part IX — Quiz Bank (Administer + Diagnose)',           minutes: 5  },
  { id: 'COACH-WB-10', n: 10, title: 'Part X — Error Taxonomy + Coach Corrections',           minutes: 15 },
  { id: 'COACH-WB-11', n: 11, title: 'Part XI — Exit Test Evaluation Protocol',               minutes: 10 },
  { id: 'COACH-WB-12', n: 12, title: 'Part XII — Coaching Framework (EDPF, Triad, Diagnostic Tree)', minutes: 20 },
  { id: 'COACH-WB-13', n: 13, title: 'Part XIII — Belt Values Doctrine (Conciencia + Humildad)',     minutes: 10 },
  { id: 'COACH-WB-14', n: 14, title: 'Part XIV — Coach Track (5 Levels of Certification)',          minutes: 10 },
  { id: 'COACH-WB-15', n: 15, title: 'Part XV — Code of Conduct + Glossary + Source Registry',      minutes: 10 },
];

// ─── split the manual into Part blocks ───────────────────────
//
// Manual uses `# PART I — ...` through `# PART XV — ...` as Part headers.
// We split by lines that start with `# PART `. Numeral I-XV in roman.
// The Coach Manual has a duplicated Part X in the source (line 2910 and
// line 3040 — first is "ERROR TAXONOMY (FILTERED ERROR_DB)" stub, the
// real one is at line 3040 "ERROR TAXONOMY + COACH CORRECTIONS"). We
// handle by matching all PART headers and indexing the LAST occurrence
// for each Roman numeral. Same for the duplicated Part XI.

const lines = raw.split('\n');

// Identify all `# PART X — ...` line numbers with their roman numeral.
const partLineMap = new Map(); // roman → { startLine, headerText }
const PART_HDR = /^# PART ([IVX]+) —\s*(.+)$/;
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(PART_HDR);
  if (m) {
    const roman = m[1];
    // Later occurrence overwrites earlier — matches the duplicate handling.
    partLineMap.set(roman, { startLine: i, headerText: lines[i] });
  }
}

const ROMAN_ORDER = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV'];

// Build ordered array of { roman, startLine, headerText, endLine }
const partRanges = [];
for (let idx = 0; idx < ROMAN_ORDER.length; idx++) {
  const roman = ROMAN_ORDER[idx];
  const entry = partLineMap.get(roman);
  if (!entry) {
    console.error(`Missing PART ${roman} in manual!`);
    process.exit(1);
  }
  partRanges.push({ roman, startLine: entry.startLine, headerText: entry.headerText });
}
// Compute endLine: next Part's startLine OR end-of-file.
for (let idx = 0; idx < partRanges.length; idx++) {
  // For roman === 'X' we need the LATER duplicated X to be the start, and
  // the next item (XI) to be its end. Already handled by overwrite logic.
  const next = partRanges[idx + 1];
  partRanges[idx].endLine = next ? next.startLine : lines.length;
}

// ─── extract content for each Part ───────────────────────────

function cleanContent(text) {
  return text
    .replace(/^\s*\\newpage\s*$/gm, '')      // strip LaTeX page breaks
    .replace(/^\s*---\s*$/gm, '---')         // normalize horizontal rules
    .replace(/\n{3,}/g, '\n\n')              // collapse 3+ blank lines to 2
    .trim();
}

const lessons = partRanges.map((part, idx) => {
  const meta = LESSONS_META[idx];
  const body = lines.slice(part.startLine, part.endLine).join('\n');
  const cleaned = cleanContent(body);

  return {
    id: meta.id,
    course_section: 'coach_wb',
    step_number: meta.n,
    title: meta.title,
    subtitle: 'Source: TSS_WB_COACH_MANUAL_v4_EN (internal · derived from Master Manual v1)',
    pillar: 'Coach Delivery',
    description_md: cleaned,
    drill_md: null,
    errors_md: null,
    video_url: null,
    cover_image_url: null,
    estimated_minutes: meta.minutes,
    prerequisites: idx === 0 ? [] : [LESSONS_META[idx - 1].id],
    lesson_type: 'reading',
    display_order: meta.n,
    active: true,
  };
});

// ─── dry-run preview ─────────────────────────────────────────

console.log(`\n━━━━━ TSS Coach Course (WHITE BELT) — Import ━━━━━`);
console.log(`Mode: ${APPLY ? 'APPLY (will write DB)' : 'DRY-RUN (no DB writes)'}`);
console.log(`Source: ${COACH_MANUAL_PATH}`);
console.log(`Source size: ${raw.length} chars, ${lines.length} lines`);
console.log(`Parts detected: ${partRanges.length}/15\n`);

for (const l of lessons) {
  const size = l.description_md.length;
  const wordCount = l.description_md.split(/\s+/).length;
  console.log(
    `  [${l.id}] order=${l.display_order} · ${l.title}`
  );
  console.log(
    `             → ${size.toLocaleString()} chars · ~${wordCount.toLocaleString()} words · ~${l.estimated_minutes} min read · prereqs=[${l.prerequisites.join(',')}]`
  );
}

const totalChars = lessons.reduce((a, l) => a + l.description_md.length, 0);
const totalMinutes = lessons.reduce((a, l) => a + l.estimated_minutes, 0);
console.log(`\nTotal: ${totalChars.toLocaleString()} chars across 15 lessons · ${totalMinutes} min (${(totalMinutes/60).toFixed(1)} h)\n`);

// ─── apply ───────────────────────────────────────────────────

if (!APPLY) {
  console.log('(dry-run — no DB writes. Re-run with --apply to import.)\n');
  process.exit(0);
}

console.log('Applying upsert to `lessons`…');

const { error: upsertErr } = await supabase
  .from('lessons')
  .upsert(lessons, { onConflict: 'id' });

if (upsertErr) {
  console.error('\nUPSERT FAILED:', upsertErr.message);
  process.exit(1);
}

console.log(`✓ Imported ${lessons.length} coach lessons.\n`);

// Verify
const { data: confirm } = await supabase
  .from('lessons')
  .select('id, title, course_section, display_order')
  .eq('course_section', 'coach_wb')
  .order('display_order');

console.log('Verification — rows in DB with course_section = coach_wb:');
for (const r of confirm ?? []) {
  console.log(`  [${r.id}] order=${r.display_order} · ${r.title}`);
}
console.log(`\nTotal in DB: ${confirm?.length ?? 0}\n`);
