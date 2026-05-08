// Apply Migration 00023 — replace lesson_quizzes with the 39 content-focused
// quizzes from WB_QUIZZES_STUDENT_v1_EN.json. Maps OB-WB-XX → ONB-XX so
// canon IDs match the DB lesson IDs.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');
const env = readFileSync(envPath, 'utf-8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();
const supabase = createClient(url, key, { auth: { persistSession: false } });

const QUIZZES_PATH =
  '/Users/marcelocastellanos/Desktop/1111/_TSS_WHITE_BELT_OFICIAL_v1/_FINAL_MATERIALS_v1_EN/WB_QUIZZES_STUDENT_v1_EN.json';

const quizzes = JSON.parse(readFileSync(QUIZZES_PATH, 'utf-8'));
console.log(`Loaded ${quizzes.length} quizzes from canon JSON`);

function mapItemId(canonId) {
  if (canonId.startsWith('OB-WB-')) {
    const num = canonId.split('-').pop();
    return `ONB-${num}`;
  }
  return canonId;
}

// Build flat list of rows to insert
const rows = [];
const lessonIds = new Set();
for (const q of quizzes) {
  const lessonId = mapItemId(q.item_id);
  lessonIds.add(lessonId);
  q.questions.forEach((question, idx) => {
    const optionsForDb = question.options.map((opt, i) => ({
      text: opt,
      correct: i === question.correct,
    }));
    rows.push({
      lesson_id: lessonId,
      question: question.q,
      options: optionsForDb,
      display_order: idx + 1,
    });
  });
}
console.log(`Prepared ${rows.length} quiz rows for ${lessonIds.size} lessons`);

// Step 1: delete existing quizzes for these lessons
const lessonIdArray = Array.from(lessonIds);
const { error: delErr, count: delCount } = await supabase
  .from('lesson_quizzes')
  .delete({ count: 'exact' })
  .in('lesson_id', lessonIdArray);
if (delErr) {
  console.error('Delete error:', delErr);
  process.exit(1);
}
console.log(`Deleted ${delCount ?? '?'} existing quiz rows`);

// Step 2: insert new ones in batches (Supabase has a payload size limit)
const BATCH = 30;
let inserted = 0;
for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const { error, data } = await supabase
    .from('lesson_quizzes')
    .insert(batch)
    .select('id');
  if (error) {
    console.error(`Insert error at batch starting ${i}:`, error);
    process.exit(1);
  }
  inserted += data?.length ?? 0;
  console.log(`  inserted ${inserted}/${rows.length}`);
}

// Step 3: verify
const { data: verifyRows, error: verifyErr } = await supabase
  .from('lesson_quizzes')
  .select('lesson_id')
  .in('lesson_id', lessonIdArray);
if (verifyErr) {
  console.error('Verify error:', verifyErr);
  process.exit(1);
}
const counts = {};
for (const r of verifyRows) {
  counts[r.lesson_id] = (counts[r.lesson_id] || 0) + 1;
}
console.log('\nVerification:');
for (const id of lessonIdArray.sort()) {
  console.log(`  ${id}: ${counts[id] ?? 0} questions`);
}
console.log(
  `\nTotal: ${verifyRows.length} questions across ${
    Object.keys(counts).length
  } lessons (expected ${rows.length} across ${lessonIds.size})`
);
