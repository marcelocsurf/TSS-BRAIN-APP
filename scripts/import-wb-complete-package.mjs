// import-wb-complete-package.mjs
//
// Imports the WHITE BELT COMPLETE PACKAGE (12 files in COMPLETE PACKAGE/) into
// Supabase. Touches three tables:
//   - lessons          (8 PC + 6 ONB + 25 STP = 39 rows)
//   - drills_missions  (25 drills + 25 missions = 50 rows)
//   - lesson_quizzes   (133 questions across 39 lessons)
//
// Modes:
//   --dry-run   parse and show counts/samples; do NOT touch DB
//   --apply     run the import for real (delete-then-insert for quizzes,
//               upsert for lessons + drills_missions)
//
// ID conventions:
//   - Pre-Course canon ID = PC-PRE-XX → DB id PC-PRE-XX (no change)
//   - Onboarding canon ID = OB-WB-XX  → DB id ONB-XX  (mapping required)
//   - Step canon ID       = STP-XXX   → DB id STP-XXX (no change)
//   - Drills/Missions IDs = DRL-WB-XX / MIS-WB-XX (no change)
//
// Run from repo root:
//   node scripts/import-wb-complete-package.mjs --dry-run
//   node scripts/import-wb-complete-package.mjs --apply

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
const DRY = !APPLY;
if (!APPLY && !args.has('--dry-run')) {
  console.error('Usage: node scripts/import-wb-complete-package.mjs --dry-run | --apply');
  process.exit(1);
}

// ─── source files ─────────────────────────────────────────────

const PKG = '/Users/marcelocastellanos/Desktop/Copia de CONSOLIDADO DE TSS VERSION FINAL/LO MAS ACTUALIZADO/COMPLETE PACKAGE ';

const FILES = {
  preCourse: join(PKG, '01_PRE_COURSE.md'),
  onboarding: join(PKG, '02_ONBOARDING.md'),
  steps: join(PKG, '04_STEPS_DETAIL.md'),
  drills: join(PKG, '05_DRILLS.md'),
  missions: join(PKG, '06_MISSIONS.md'),
  quizzes: join(PKG, '07_QUIZZES.json'),
};

// ─── helpers ─────────────────────────────────────────────────

function readMd(path) {
  return readFileSync(path, 'utf-8');
}

function splitSections(md) {
  // Split on "\n## " — first segment is the file header.
  return md.split(/\n## /).slice(1).map((s) => '## ' + s.trim());
}

function extractField(section, label) {
  // Matches "**Label:** value" on a single line.
  const re = new RegExp(`\\*\\*${label}:\\*\\*\\s*(.+)`);
  const m = section.match(re);
  return m ? m[1].trim().replace(/^`|`$/g, '') : null;
}

function extractSubsection(section, headingText) {
  // Returns the text under "### <headingText>" up to the next "###" or end.
  const re = new RegExp(
    `### ${headingText.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s*\\n([\\s\\S]*?)(?=\\n###|\\n---|$)`,
    'i'
  );
  const m = section.match(re);
  return m ? m[1].trim() : null;
}

function asMd(parts) {
  // Compose a single description_md from labelled parts. Skip empty entries.
  return parts
    .filter((p) => p.body && p.body.trim().length > 0)
    .map((p) => `### ${p.heading}\n\n${p.body.trim()}`)
    .join('\n\n');
}

function mapCanonToDbId(canonId) {
  if (canonId.startsWith('OB-WB-')) {
    const num = canonId.split('-').pop();
    return `ONB-${num}`;
  }
  return canonId;
}

// ─── parsers ─────────────────────────────────────────────────

function parsePreCourse(md) {
  // Only numbered item sections (skip "Closing" or other footer headings)
  const sections = splitSections(md).filter((s) => /^## \d+\. /.test(s));
  return sections.map((s, idx) => {
    const titleMatch = s.match(/^## \d+\. (.+)/);
    const id = extractField(s, 'ID');
    if (!id) throw new Error(`Pre-course section ${idx + 1} missing ID`);
    return {
      canonId: id,
      dbId: mapCanonToDbId(id),
      position: idx + 1,
      title: titleMatch ? titleMatch[1].trim() : id,
      pillar: extractField(s, 'Pillar'),
      description_md: asMd([
        { heading: "What you'll learn", body: extractSubsection(s, "What you'll learn") },
        { heading: 'Why it matters', body: extractSubsection(s, 'Why it matters') },
        { heading: 'Key content', body: extractSubsection(s, 'Key content') },
        { heading: 'How to verify yourself (self-check)', body: extractSubsection(s, 'How to verify yourself \\(self-check\\)') },
      ]),
    };
  });
}

function parseOnboarding(md) {
  const sections = splitSections(md).filter((s) => /^## \d+\. /.test(s));
  return sections.map((s, idx) => {
    const titleMatch = s.match(/^## \d+\. (.+)/);
    const id = extractField(s, 'ID');
    if (!id) throw new Error(`Onboarding section ${idx + 1} missing ID`);
    return {
      canonId: id,
      dbId: mapCanonToDbId(id),
      position: idx + 1,
      title: titleMatch ? titleMatch[1].trim() : id,
      pillar: extractField(s, 'Pillar'),
      description_md: asMd([
        { heading: "What you'll learn", body: extractSubsection(s, "What you'll learn") },
        { heading: 'Why it matters', body: extractSubsection(s, 'Why it matters') },
        { heading: 'Key content', body: extractSubsection(s, 'Key content') },
        { heading: 'How to verify yourself (self-check)', body: extractSubsection(s, 'How to verify yourself \\(self-check\\)') },
      ]),
    };
  });
}

function parseSteps(md) {
  const sections = splitSections(md).filter((s) => /^## Step \d+ /.test(s));
  return sections.map((s, idx) => {
    // "## Step 1 — STP-001 — Venue Analysis"
    const head = s.match(/^## Step (\d+) — (STP-\d+) — (.+)/);
    if (!head) throw new Error(`Step section ${idx + 1} unparseable heading`);
    const [, position, id, title] = head;
    return {
      canonId: id,
      dbId: id,
      position: parseInt(position, 10),
      title: title.trim(),
      pillar: extractField(s, 'Pillar'),
      description_md: asMd([
        { heading: "What you'll learn", body: extractSubsection(s, "What you'll learn") },
        { heading: 'Why it matters', body: extractSubsection(s, 'Why it matters') },
        { heading: 'Key concepts', body: extractSubsection(s, 'Key concepts') },
        { heading: 'What your body does (biomechanics)', body: extractSubsection(s, 'What your body does \\(biomechanics\\)') },
        { heading: '5 KEY WORDS (memorize and recite while training)', body: extractSubsection(s, '5 KEY WORDS \\(memorize and recite while training\\)') },
        { heading: "Self-check (how you know you've mastered this step)", body: extractSubsection(s, "Self-check \\(how you know you've mastered this step\\)") },
      ]),
      errors_md: extractSubsection(s, 'Common errors \\(watch yourself for these\\)'),
    };
  });
}

function parseDrills(md) {
  const sections = splitSections(md).filter((s) => s.startsWith('## DRL-'));
  return sections.map((s) => {
    // "## DRL-WB-01 — Venue Analysis Map Drill"
    const head = s.match(/^## (DRL-WB-\d+) — (.+)/);
    if (!head) throw new Error('Drill section unparseable heading');
    const [, id, title] = head;
    return {
      id,
      step_id: extractField(s, 'Linked STP'),
      title: title.trim(),
      type: 'drill',
      time_estimate: extractField(s, 'Time'),
      reps_recommended: extractField(s, 'Reps'),
      belt: extractField(s, 'Belt') || 'white',
      description_md: asMd([
        { heading: "What you'll train", body: extractSubsection(s, "What you'll train") },
        { heading: 'What you need before', body: extractSubsection(s, 'What you need before') },
        { heading: 'How to execute it', body: extractSubsection(s, 'How to execute it') },
      ]),
      success_block: extractSubsection(s, "How you know you've got it"),
    };
  });
}

function parseMissions(md) {
  const sections = splitSections(md).filter((s) => s.startsWith('## MIS-'));
  return sections.map((s) => {
    // "## MIS-WB-01 — Read Today's Spot"
    const head = s.match(/^## (MIS-WB-\d+) — (.+)/);
    if (!head) throw new Error('Mission section unparseable heading');
    const [, id, title] = head;
    return {
      id,
      step_id: extractField(s, 'Linked Step'),
      title: title.trim(),
      type: 'mission',
      time_estimate: extractField(s, 'Time'),
      reps_recommended: extractField(s, 'Reps target'),
      belt: 'white',
      description_md: asMd([
        { heading: 'What to do', body: extractSubsection(s, 'What to do') },
        { heading: 'Where', body: extractField(s, 'Where') ? `**${extractField(s, 'Where')}**` : null },
      ]),
      success_block: extractSubsection(s, 'How you know you completed it \\(self-check\\)'),
    };
  });
}

function parseQuizzes(jsonText) {
  const data = JSON.parse(jsonText);
  return data.map((q) => ({
    canonId: q.item_id,
    dbId: mapCanonToDbId(q.item_id),
    title: q.title,
    questions: q.questions.map((qq, idx) => ({
      lesson_id: mapCanonToDbId(q.item_id),
      question: qq.q,
      options: qq.options.map((opt, i) => ({ text: opt, correct: i === qq.correct })),
      display_order: idx + 1,
    })),
  }));
}

// ─── builders → DB rows ───────────────────────────────────────

function buildLessonRows(precourse, onboarding, steps) {
  const rows = [];
  precourse.forEach((p) => {
    rows.push({
      id: p.dbId,
      course_section: 'pre_course_fundamentals',
      step_number: 200 + p.position,
      title: p.title,
      pillar: p.pillar,
      description_md: p.description_md,
      display_order: 200 + p.position,
      active: true,
    });
  });
  onboarding.forEach((o) => {
    rows.push({
      id: o.dbId,
      course_section: 'wb_onboarding',
      step_number: 300 + o.position,
      title: o.title,
      pillar: o.pillar,
      description_md: o.description_md,
      display_order: 300 + o.position,
      active: true,
    });
  });
  steps.forEach((st) => {
    rows.push({
      id: st.dbId,
      course_section: 'white_belt',
      step_number: st.position,
      title: st.title,
      pillar: st.pillar,
      description_md: st.description_md,
      errors_md: st.errors_md,
      display_order: st.position,
      active: true,
    });
  });
  return rows;
}

function buildDrillMissionRows(drills, missions) {
  const rows = [];
  drills.forEach((d, idx) => {
    const successList = (d.success_block || '')
      .split(/\n[-*]\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    rows.push({
      id: d.id,
      step_id: d.step_id,
      title: d.title,
      type: 'drill',
      time_estimate: d.time_estimate,
      reps_recommended: d.reps_recommended,
      key_words: [],
      description_md: d.description_md,
      success_criteria: successList,
      belt: d.belt,
      display_order: idx + 1,
      active: true,
    });
  });
  missions.forEach((m, idx) => {
    const successList = (m.success_block || '')
      .split(/\n[-*]\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
    rows.push({
      id: m.id,
      step_id: m.step_id,
      title: m.title,
      type: 'mission',
      time_estimate: m.time_estimate,
      reps_recommended: m.reps_recommended,
      key_words: [],
      description_md: m.description_md,
      success_criteria: successList,
      belt: m.belt,
      display_order: idx + 1,
      active: true,
    });
  });
  return rows;
}

function buildQuizRows(quizzes) {
  const rows = [];
  quizzes.forEach((q) => {
    q.questions.forEach((question) => rows.push(question));
  });
  return rows;
}

// ─── main ────────────────────────────────────────────────────

console.log(`\n┌─ TSS WB Complete Package Importer ────────────────────────`);
console.log(`│  Mode: ${APPLY ? '⚡️ APPLY (writes to DB)' : '🧪 DRY-RUN (read-only)'}`);
console.log(`│  Source: ${PKG}`);
console.log(`└────────────────────────────────────────────────────────────\n`);

const precourse = parsePreCourse(readMd(FILES.preCourse));
const onboarding = parseOnboarding(readMd(FILES.onboarding));
const steps = parseSteps(readMd(FILES.steps));
const drills = parseDrills(readMd(FILES.drills));
const missions = parseMissions(readMd(FILES.missions));
const quizzes = parseQuizzes(readMd(FILES.quizzes));

const lessonRows = buildLessonRows(precourse, onboarding, steps);
const drillMissionRows = buildDrillMissionRows(drills, missions);
const quizRows = buildQuizRows(quizzes);

console.log(`📦 Parsed:`);
console.log(`   ${precourse.length} pre-course items   (expected 8)`);
console.log(`   ${onboarding.length} onboarding items  (expected 6)`);
console.log(`   ${steps.length} steps              (expected 25)`);
console.log(`   ${drills.length} drills              (expected 25)`);
console.log(`   ${missions.length} missions            (expected 25)`);
console.log(`   ${quizzes.length} quizzes             (expected 39)`);
console.log(`   ${quizRows.length} quiz questions     (expected 133)`);
console.log('');
console.log(`🛠  Will affect:`);
console.log(`   lessons          → upsert ${lessonRows.length} rows`);
console.log(`   drills_missions  → upsert ${drillMissionRows.length} rows`);
console.log(`   lesson_quizzes   → delete-then-insert ${quizRows.length} questions across ${quizzes.length} lessons`);
console.log('');

// Sample preview
console.log(`🔍 Sample lesson (first PC):`);
console.log(JSON.stringify(lessonRows[0], null, 2).slice(0, 800));
console.log('\n🔍 Sample lesson (first STP):');
const firstStp = lessonRows.find((r) => r.id.startsWith('STP-'));
console.log(JSON.stringify(firstStp, null, 2).slice(0, 800));
console.log('\n🔍 Sample drill (first DRL):');
console.log(JSON.stringify(drillMissionRows[0], null, 2).slice(0, 800));
console.log('\n🔍 Sample quiz question:');
console.log(JSON.stringify(quizRows[0], null, 2).slice(0, 500));
console.log('');

// Sanity checks
const lessonIdSet = new Set(lessonRows.map((r) => r.id));
const drillStepIds = new Set(drillMissionRows.filter((r) => r.type === 'drill').map((r) => r.step_id));
const missingForDrills = [...drillStepIds].filter((sid) => !lessonIdSet.has(sid));
if (missingForDrills.length > 0) {
  console.warn(`⚠️  Drills reference step_ids not in lessons: ${missingForDrills.join(', ')}`);
}
const quizLessonIds = new Set(quizRows.map((r) => r.lesson_id));
const orphanQuizLessons = [...quizLessonIds].filter((lid) => !lessonIdSet.has(lid));
if (orphanQuizLessons.length > 0) {
  console.warn(`⚠️  Quizzes reference lesson_ids not in lessons: ${orphanQuizLessons.join(', ')}`);
}

if (DRY) {
  console.log(`\n✅ DRY-RUN complete. No DB writes performed.`);
  console.log(`   To apply: node scripts/import-wb-complete-package.mjs --apply\n`);
  process.exit(0);
}

// ─── APPLY ────────────────────────────────────────────────────

console.log(`\n⚡️ APPLYING to Supabase...\n`);

// 1) lessons — upsert by id (preserves prerequisites, video_url, etc. that we don't set)
{
  const { error } = await supabase.from('lessons').upsert(lessonRows, { onConflict: 'id' });
  if (error) {
    console.error('❌ lessons upsert failed:', error.message);
    process.exit(1);
  }
  console.log(`   ✓ lessons          upserted ${lessonRows.length} rows`);
}

// 2) drills_missions — upsert by id
{
  const { error } = await supabase.from('drills_missions').upsert(drillMissionRows, { onConflict: 'id' });
  if (error) {
    console.error('❌ drills_missions upsert failed:', error.message);
    process.exit(1);
  }
  console.log(`   ✓ drills_missions  upserted ${drillMissionRows.length} rows`);
}

// 3) lesson_quizzes — delete-then-insert per lesson_id
{
  const lessonIds = Array.from(quizLessonIds);
  const { error: delErr } = await supabase
    .from('lesson_quizzes')
    .delete()
    .in('lesson_id', lessonIds);
  if (delErr) {
    console.error('❌ lesson_quizzes delete failed:', delErr.message);
    process.exit(1);
  }
  console.log(`   ✓ lesson_quizzes   deleted prior questions for ${lessonIds.length} lessons`);

  // Insert in batches (avoid hitting row-size limits)
  const BATCH = 200;
  for (let i = 0; i < quizRows.length; i += BATCH) {
    const slice = quizRows.slice(i, i + BATCH);
    const { error: insErr } = await supabase.from('lesson_quizzes').insert(slice);
    if (insErr) {
      console.error(`❌ lesson_quizzes insert batch ${i}-${i + BATCH} failed:`, insErr.message);
      process.exit(1);
    }
  }
  console.log(`   ✓ lesson_quizzes   inserted ${quizRows.length} questions`);
}

console.log(`\n🎉 IMPORT COMPLETE.\n`);
console.log(`   Verify in portal: https://tss-brain-app.vercel.app/portal/<token>`);
console.log(`   Course tab should show updated content.\n`);
