// import-coach-wb-master-manual.mjs
//
// Imports the WHITE BELT MASTER MANUAL v1 EN into Supabase as 15 lessons
// under course_section = 'coach_wb_master'. This is the CANONICAL
// reference complementing the Coach Manual (delivery layer). Coaches
// see both in their Courses tab: Coach Manual = "how to teach",
// Master Manual = "what it is (the canon)".
//
// Source of truth (no invention): TSS_WB_MASTER_MANUAL_v1_EN.md
// Strategy: split by `# PART [I-XV] —` and create one lesson per Part.
//
// Modes:
//   --dry-run   parse + show titles/sizes, do NOT touch DB
//   --apply     upsert into `lessons`
//
// Run from repo root:
//   node scripts/import-coach-wb-master-manual.mjs --dry-run
//   node scripts/import-coach-wb-master-manual.mjs --apply

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
  console.error('Usage: node scripts/import-coach-wb-master-manual.mjs --dry-run | --apply');
  process.exit(1);
}

// ─── source file ─────────────────────────────────────────────

const MASTER_MANUAL_PATH =
  '/Users/marcelocastellanos/Desktop/1111/_TSS_WHITE_BELT_OFICIAL_v1/MASTER_MANUAL_v1_EN/TSS_WB_MASTER_MANUAL_v1_EN.md';

const raw = readFileSync(MASTER_MANUAL_PATH, 'utf-8');

// ─── lesson metadata (titles + estimates, manual TOC) ────
// Master Manual has the same 15-part structure as Coach Manual but
// canonical/systematic content. We give it READ times that reflect
// its higher density.

const LESSONS_META = [
  { id: 'MASTER-WB-01', n: 1,  title: 'Part I — TSS Foundations (Canon)',                            minutes: 25 },
  { id: 'MASTER-WB-02', n: 2,  title: 'Part II — White Belt Architecture (Canon)',                   minutes: 15 },
  { id: 'MASTER-WB-03', n: 3,  title: 'Part III — Pre-Course Module 0 (8 Mandatory Items)',          minutes: 35 },
  { id: 'MASTER-WB-04', n: 4,  title: 'Part IV — White Belt Onboarding Module 1 (6 Items)',          minutes: 25 },
  { id: 'MASTER-WB-05', n: 5,  title: 'Part V — The 5 White Belt Sequences (Module 2 Overview)',     minutes: 15 },
  { id: 'MASTER-WB-06', n: 6,  title: 'Part VI — The 25 Active Steps (Complete Detail)',             minutes: 120 },
  { id: 'MASTER-WB-07', n: 7,  title: 'Part VII — The 25 Drills (Training Mechanics)',               minutes: 80 },
  { id: 'MASTER-WB-08', n: 8,  title: 'Part VIII — The 25 Missions (Water Applications)',            minutes: 45 },
  { id: 'MASTER-WB-09', n: 9,  title: 'Part IX — Quiz Bank (39 Quizzes / 133 Questions)',            minutes: 10 },
  { id: 'MASTER-WB-10', n: 10, title: 'Part X — Error Taxonomy (Filtered ERROR_DB)',                 minutes: 15 },
  { id: 'MASTER-WB-11', n: 11, title: 'Part XI — Exit Test + Certification',                         minutes: 15 },
  { id: 'MASTER-WB-12', n: 12, title: 'Part XII — Coaching Framework',                               minutes: 20 },
  { id: 'MASTER-WB-13', n: 13, title: 'Part XIII — Belt Values Doctrine',                            minutes: 10 },
  { id: 'MASTER-WB-14', n: 14, title: 'Part XIV — Coach Track (5 Levels of Certification)',          minutes: 10 },
  { id: 'MASTER-WB-15', n: 15, title: 'Part XV — Glossary + Source Registry',                        minutes: 15 },
];

// ─── split manual by Part headers ────────────────────────────

const lines = raw.split('\n');
const PART_HDR = /^# PART ([IVX]+) —\s*(.+)$/;
const partLineMap = new Map();
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(PART_HDR);
  if (m) partLineMap.set(m[1], { startLine: i });
}

const ROMAN_ORDER = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV'];
const partRanges = ROMAN_ORDER.map((roman) => {
  const entry = partLineMap.get(roman);
  if (!entry) {
    console.error(`Missing PART ${roman} in Master Manual!`);
    process.exit(1);
  }
  return { roman, startLine: entry.startLine };
});
for (let i = 0; i < partRanges.length; i++) {
  partRanges[i].endLine = partRanges[i + 1] ? partRanges[i + 1].startLine : lines.length;
}

function cleanContent(text) {
  return text
    .replace(/^\s*\\newpage\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const lessons = partRanges.map((part, idx) => {
  const meta = LESSONS_META[idx];
  const body = lines.slice(part.startLine, part.endLine).join('\n');
  return {
    id: meta.id,
    course_section: 'coach_wb_master',
    step_number: meta.n,
    title: meta.title,
    subtitle: 'Source: TSS_WB_MASTER_MANUAL_v1_EN (canonical · single source of truth)',
    pillar: 'Canon Reference',
    description_md: cleanContent(body),
    drill_md: null,
    errors_md: null,
    video_url: null,
    cover_image_url: null,
    estimated_minutes: meta.minutes,
    prerequisites: [],  // Master Manual is REFERENCE — no gating
    lesson_type: 'reading',
    display_order: 100 + meta.n,  // After the Coach Manual delivery lessons (1-15)
    active: true,
  };
});

// ─── dry-run preview ─────────────────────────────────────────

console.log(`\n━━━━━ TSS Master Manual (WB CANON) — Import ━━━━━`);
console.log(`Mode: ${APPLY ? 'APPLY (will write DB)' : 'DRY-RUN (no DB writes)'}`);
console.log(`Source: ${MASTER_MANUAL_PATH}`);
console.log(`Source size: ${raw.length} chars, ${lines.length} lines`);
console.log(`Parts detected: ${partRanges.length}/15\n`);

for (const l of lessons) {
  const size = l.description_md.length;
  const wc = l.description_md.split(/\s+/).length;
  console.log(`  [${l.id}] order=${l.display_order} · ${l.title}`);
  console.log(`             → ${size.toLocaleString()} chars · ~${wc.toLocaleString()} words · ~${l.estimated_minutes} min read`);
}

const total = lessons.reduce((a, l) => a + l.description_md.length, 0);
const totalMin = lessons.reduce((a, l) => a + l.estimated_minutes, 0);
console.log(`\nTotal: ${total.toLocaleString()} chars across 15 lessons · ${totalMin} min (${(totalMin/60).toFixed(1)} h)\n`);

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
console.log(`✓ Imported ${lessons.length} master-manual lessons.\n`);

const { data: confirm } = await supabase
  .from('lessons')
  .select('id, title, course_section, display_order')
  .eq('course_section', 'coach_wb_master')
  .order('display_order');

console.log('Verification — rows in DB with course_section = coach_wb_master:');
for (const r of confirm ?? []) {
  console.log(`  [${r.id}] order=${r.display_order} · ${r.title}`);
}
console.log(`\nTotal in DB: ${confirm?.length ?? 0}\n`);
