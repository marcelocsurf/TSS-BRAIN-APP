// import-coach-wb-restructured.mjs
//
// RESTRUCTURE of the coach White Belt course. Replaces the 15 monolithic
// COACH-WB-01..15 Part-lessons with a granular, pedagogically-sectioned
// tree that mirrors the student portal:
//
//   TIER 1 — Foundations         5 lessons   (Parts I, II, V, XII, XIII)
//   TIER 2 — Pre-Course/Onboard  2 lessons   (Parts III, IV)
//   TIER 3 — The 25 STPs        25 lessons   (Part VI, one per STP, with
//                                            pillar columns: What /
//                                            Deliver / Errors / Validate)
//   TIER 4 — Diagnostics/Exit    2 lessons   (Parts X, XI)
//   TIER 5 — Career              2 lessons   (Parts XIV, XV)
//
// Part VII (Drills) + Part VIII (Missions) are NOT separate lessons —
// they surface inside each STP lesson's Drill/Mission tabs, pulled live
// from drills_missions via linked_step_id. Part IX (quiz bank ref) is
// folded into the Exit Test.
//
// The old COACH-WB-01..15 rows are DELETED. COACH-WB-EXIT-TEST is kept.
// course_section stays 'coach_wb'. coach_wb_master untouched.
//
// Modes:  --dry-run | --apply
// Run:    node scripts/import-coach-wb-restructured.mjs --dry-run

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
  console.error('Usage: node scripts/import-coach-wb-restructured.mjs --dry-run | --apply');
  process.exit(1);
}

const MANUAL =
  '/Users/marcelocastellanos/Desktop/1111/_TSS_WHITE_BELT_OFICIAL_v1/COACH_MANUAL_v4_EN/TSS_WB_COACH_MANUAL_v4_EN.md';
const raw = readFileSync(MANUAL, 'utf-8');
const lines = raw.split('\n');

function clean(text) {
  return text
    .replace(/^\s*\\newpage\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── Split manual into Part blocks ───────────────────────────────

const PART_HDR = /^# PART ([IVX]+) —\s*(.+)$/;
const partLineMap = new Map();
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(PART_HDR);
  if (m) partLineMap.set(m[1], i); // later occurrence wins (handles dup Part X/XI)
}
const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV'];
const partRange = {};
const sortedStarts = ROMAN.map((r) => ({ r, start: partLineMap.get(r) })).filter((x) => x.start != null);
// endLine = the next Part header AFTER this one in line order
const allStarts = [...sortedStarts].sort((a, b) => a.start - b.start);
for (let i = 0; i < allStarts.length; i++) {
  const cur = allStarts[i];
  const next = allStarts[i + 1];
  partRange[cur.r] = { start: cur.start, end: next ? next.start : lines.length };
}

function partText(roman) {
  const r = partRange[roman];
  if (!r) throw new Error(`Part ${roman} not found`);
  return lines.slice(r.start, r.end).join('\n');
}

// ─── Parse Part VI into 25 STP blocks ────────────────────────────

const part6 = partText('VI').split('\n');
const STP_HDR = /^## VI\.\d+ — (STP-\d+) — (.+)$/;
const stpStarts = [];
for (let i = 0; i < part6.length; i++) {
  const m = part6[i].match(STP_HDR);
  if (m) stpStarts.push({ line: i, stepId: m[1], title: m[2].trim() });
}

// Header text varies slightly across STPs (some have the "(errors + cues)"
// suffix, some don't). Match by prefix.
const SUBSECTIONS = [
  { key: 'what',     prefix: '### What you teach' },
  { key: 'deliver',  prefix: '### How you teach it' },
  { key: 'errors',   prefix: '### How you correct it' },
  { key: 'validate', prefix: '### How you validate it' },
];

function parseStpBlock(blockLines) {
  // blockLines[0] = the ## header. Find metadata line + 4 subsections.
  const meta = blockLines.find((l) => l.includes('**Pillar:**')) || '';
  const result = { meta: meta.trim(), what: '', deliver: '', errors: '', validate: '' };

  // Index of each subsection header (prefix match)
  const idx = {};
  for (const s of SUBSECTIONS) {
    idx[s.key] = blockLines.findIndex((l) => l.trim().startsWith(s.prefix));
  }
  for (let i = 0; i < SUBSECTIONS.length; i++) {
    const s = SUBSECTIONS[i];
    const startLine = idx[s.key];
    if (startLine < 0) continue;
    // end = next subsection's start, or end of block
    let endLine = blockLines.length;
    for (let j = i + 1; j < SUBSECTIONS.length; j++) {
      if (idx[SUBSECTIONS[j].key] >= 0) { endLine = idx[SUBSECTIONS[j].key]; break; }
    }
    // content excludes the header line itself
    result[s.key] = clean(blockLines.slice(startLine + 1, endLine).join('\n'));
  }
  return result;
}

const stpLessons = stpStarts.map((stp, i) => {
  const startLine = stp.line;
  const endLine = i + 1 < stpStarts.length ? stpStarts[i + 1].line : part6.length;
  const block = part6.slice(startLine, endLine);
  const parsed = parseStpBlock(block);
  const num = stp.stepId.replace('STP-', ''); // '001'
  return {
    id: `COACH-STP-${num}`,
    course_section: 'coach_wb',
    step_number: 10 + i,         // sits in tier 3
    title: `${stp.stepId} — ${stp.title}`,
    subtitle: parsed.meta.replace(/\*\*/g, ''),  // "Pillar: Technical | Block: 3 | Sequence: #3"
    pillar: 'Coach Delivery',
    description_md: null,         // structured lesson — body lives in coach_* columns
    coach_what_md: parsed.what || null,
    coach_deliver_md: parsed.deliver || null,
    coach_errors_md: parsed.errors || null,
    coach_validate_md: parsed.validate || null,
    linked_step_id: stp.stepId,
    drill_md: null,
    errors_md: null,
    video_url: null,
    cover_image_url: null,
    estimated_minutes: 12,
    prerequisites: [],  // No gating — coaches navigate reference material freely
    lesson_type: 'reading',
    display_order: 10 + i,
    active: true,
  };
});

// ─── Non-STP lessons (single-body markdown) ──────────────────────

function bodyLesson({ id, part, step_number, display_order, title, minutes }) {
  return {
    id,
    course_section: 'coach_wb',
    step_number,
    title,
    subtitle: 'Source: TSS_WB_COACH_MANUAL_v4_EN (internal · derived from Master Manual v1)',
    pillar: 'Coach Delivery',
    description_md: clean(partText(part)),
    coach_what_md: null,
    coach_deliver_md: null,
    coach_errors_md: null,
    coach_validate_md: null,
    linked_step_id: null,
    drill_md: null,
    errors_md: null,
    video_url: null,
    cover_image_url: null,
    estimated_minutes: minutes,
    prerequisites: [],  // No gating — coaches navigate reference material freely
    lesson_type: 'reading',
    display_order,
    active: true,
  };
}

const tier1 = [
  bodyLesson({ id: 'COACH-FOUND-01', part: 'I',    step_number: 1, display_order: 1, title: 'Foundations 1 — TSS Method & Philosophy', prereq: [], minutes: 20 }),
  bodyLesson({ id: 'COACH-FOUND-02', part: 'II',   step_number: 2, display_order: 2, title: 'Foundations 2 — White Belt Architecture', prereq: ['COACH-FOUND-01'], minutes: 12 }),
  bodyLesson({ id: 'COACH-FOUND-03', part: 'V',    step_number: 3, display_order: 3, title: 'Foundations 3 — The 5 Sequences Delivery Plan', prereq: ['COACH-FOUND-02'], minutes: 10 }),
  bodyLesson({ id: 'COACH-FOUND-04', part: 'XII',  step_number: 4, display_order: 4, title: 'Foundations 4 — Coaching Framework (EDPF · Triad · Flow)', prereq: ['COACH-FOUND-03'], minutes: 20 }),
  bodyLesson({ id: 'COACH-FOUND-05', part: 'XIII', step_number: 5, display_order: 5, title: 'Foundations 5 — Belt Values Doctrine (Conciencia + Humildad)', prereq: ['COACH-FOUND-04'], minutes: 10 }),
];

const tier2 = [
  bodyLesson({ id: 'COACH-PC-VERIFY',   part: 'III', step_number: 6, display_order: 6, title: 'Pre-Course Verification Protocol', prereq: ['COACH-FOUND-05'], minutes: 8 }),
  bodyLesson({ id: 'COACH-OB-DELIVERY', part: 'IV',  step_number: 7, display_order: 7, title: 'Onboarding Delivery — 6 Items', prereq: ['COACH-PC-VERIFY'], minutes: 12 }),
];

const tier4 = [
  bodyLesson({ id: 'COACH-DIAG-ERRORS', part: 'X',  step_number: 40, display_order: 40, title: 'Error Taxonomy + Diagnostic Trees', prereq: ['COACH-STP-025'], minutes: 15 }),
  bodyLesson({ id: 'COACH-DIAG-EXIT',   part: 'XI', step_number: 41, display_order: 41, title: 'Exit Test Evaluation Protocol', prereq: ['COACH-DIAG-ERRORS'], minutes: 12 }),
];

const tier5 = [
  bodyLesson({ id: 'COACH-CAREER-TRACK', part: 'XIV', step_number: 50, display_order: 50, title: 'Coach Track — 5 Levels of Certification', prereq: [], minutes: 10 }),
  bodyLesson({ id: 'COACH-CAREER-CODE',  part: 'XV',  step_number: 51, display_order: 51, title: 'Code of Conduct + Glossary + Sources', prereq: [], minutes: 12 }),
];

const allLessons = [...tier1, ...tier2, ...stpLessons, ...tier4, ...tier5];

// ─── preview ─────────────────────────────────────────────────────

console.log(`\n━━━━━ Coach WB — RESTRUCTURE — Import ━━━━━`);
console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
console.log(`Total new lessons: ${allLessons.length}`);
console.log(`  Tier 1 Foundations: ${tier1.length}`);
console.log(`  Tier 2 Pre/Onboard: ${tier2.length}`);
console.log(`  Tier 3 STPs:        ${stpLessons.length}`);
console.log(`  Tier 4 Diagnostics: ${tier4.length}`);
console.log(`  Tier 5 Career:      ${tier5.length}\n`);

// Validate STP parsing
let stpBad = 0;
for (const l of stpLessons) {
  const missing = [];
  if (!l.coach_what_md) missing.push('what');
  if (!l.coach_deliver_md) missing.push('deliver');
  if (!l.coach_errors_md) missing.push('errors');
  if (!l.coach_validate_md) missing.push('validate');
  if (missing.length) {
    console.error(`  ⚠ ${l.id} missing: ${missing.join(', ')}`);
    stpBad++;
  }
}
if (stpBad === 0) console.log('✓ All 25 STPs parsed with all 4 pillar sections.\n');
else { console.error(`\n${stpBad} STP(s) with missing sections. Aborting.`); process.exit(1); }

// Sample
const sample = stpLessons.find((l) => l.linked_step_id === 'STP-016');
if (sample) {
  console.log(`Sample — ${sample.id} (${sample.title}):`);
  console.log(`  subtitle: ${sample.subtitle}`);
  console.log(`  what:     ${sample.coach_what_md.length} chars`);
  console.log(`  deliver:  ${sample.coach_deliver_md.length} chars`);
  console.log(`  errors:   ${sample.coach_errors_md.length} chars`);
  console.log(`  validate: ${sample.coach_validate_md.length} chars\n`);
}

if (!APPLY) {
  console.log('(dry-run — no DB writes. Re-run with --apply.)\n');
  process.exit(0);
}

// ─── apply ───────────────────────────────────────────────────────

// 1. Delete the old monolithic COACH-WB-01..15
const oldIds = Array.from({ length: 15 }, (_, i) => `COACH-WB-${String(i + 1).padStart(2, '0')}`);
console.log(`Deleting ${oldIds.length} old monolithic lessons…`);
const { error: delErr } = await supabase.from('lessons').delete().in('id', oldIds);
if (delErr) { console.error('DELETE FAILED:', delErr.message); process.exit(1); }
console.log('✓ Old lessons removed.');

// 2. Upsert the new tree
console.log(`Upserting ${allLessons.length} restructured lessons…`);
const { error: upErr } = await supabase.from('lessons').upsert(allLessons, { onConflict: 'id' });
if (upErr) { console.error('UPSERT FAILED:', upErr.message); process.exit(1); }
console.log('✓ Restructured lessons imported.');

// 3. Move the Exit Test to the end (display_order 42)
await supabase.from('lessons').update({ display_order: 42, step_number: 42 }).eq('id', 'COACH-WB-EXIT-TEST');
console.log('✓ Exit Test repositioned to order 42.');

// Verify
const { data: confirm } = await supabase
  .from('lessons')
  .select('id, title, display_order, linked_step_id')
  .eq('course_section', 'coach_wb')
  .order('display_order');
console.log(`\nVerification — ${confirm?.length ?? 0} rows in course_section=coach_wb:`);
for (const r of confirm ?? []) {
  console.log(`  [${String(r.display_order).padStart(2)}] ${r.id}${r.linked_step_id ? ` → ${r.linked_step_id}` : ''} · ${r.title}`);
}
console.log();
