// Detailed audit of lesson_quizzes: counts, content sanity, mojibake check.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();
const supabase = createClient(url, key, { auth: { persistSession: false } });

const MOJIBAKE = ['‚Äî', '‚Äì', '‚Äô', '‚Äú', '‚Äù', '‚Ä¶', '¬∞', '¬Σ', 'Äî', 'Aî', '√°', '√©', '√≠', '√≥', '√∫', '√±'];
const SPANISH_WORDS = ['alumno', 'tabla', 'espuma', 'enseñar', 'verbaliza', 'patrón'];

function findIssues(text) {
  const out = [];
  for (const p of MOJIBAKE) if (text.includes(p)) out.push(`mojibake "${p}"`);
  const lower = text.toLowerCase();
  for (const w of SPANISH_WORDS) if (lower.includes(w)) out.push(`spanish "${w}"`);
  return out;
}

const { data: quizzes } = await supabase
  .from('lesson_quizzes')
  .select('lesson_id, question, options, display_order')
  .or('lesson_id.like.PC-PRE-%,lesson_id.like.ONB-%,lesson_id.like.STP-%')
  .order('lesson_id, display_order');

const byLesson = {};
let totalIssues = 0;
let totalQuestions = quizzes.length;

for (const q of quizzes) {
  if (!byLesson[q.lesson_id]) byLesson[q.lesson_id] = 0;
  byLesson[q.lesson_id]++;

  const qIssues = findIssues(q.question);
  let optionIssues = [];
  let hasCorrect = false;
  for (const opt of q.options || []) {
    if (opt.correct) hasCorrect = true;
    optionIssues.push(...findIssues(opt.text || ''));
  }
  const all = [...qIssues, ...optionIssues];
  if (all.length > 0 || !hasCorrect) {
    console.log(`${q.lesson_id} #${q.display_order} — ${q.question.slice(0, 60)}...`);
    if (!hasCorrect) console.log('  ⚠️ NO correct option marked');
    all.forEach((i) => console.log(`  ${i}`));
    totalIssues++;
  }
}

console.log(`\n=== Quiz coverage by lesson ===`);
const expectedIds = [
  ...Array.from({ length: 8 }, (_, i) => `PC-PRE-${String(i + 1).padStart(2, '0')}`),
  ...Array.from({ length: 6 }, (_, i) => `ONB-${String(i + 1).padStart(2, '0')}`),
  ...Array.from({ length: 25 }, (_, i) => `STP-${String(i + 1).padStart(3, '0')}`),
];
let lessonsCovered = 0;
let lessonsMissing = [];
for (const id of expectedIds) {
  const count = byLesson[id] || 0;
  if (count === 0) lessonsMissing.push(id);
  else lessonsCovered++;
  if (count > 0 && count < 3) {
    console.log(`  ⚠️ ${id}: only ${count} questions (canon spec: 3-4)`);
  }
}

console.log(`\n=== Summary ===`);
console.log(`Total questions: ${totalQuestions} (canon: 133)`);
console.log(`Lessons with quizzes: ${lessonsCovered} / 39`);
if (lessonsMissing.length > 0) console.log(`MISSING: ${lessonsMissing.join(', ')}`);
console.log(`Quizzes with content issues: ${totalIssues}`);
console.log(
  totalIssues === 0 && totalQuestions === 133 && lessonsCovered === 39
    ? '\n🎯 PERFECT — quizzes are clean and complete'
    : '\n⚠️ Some issues remain — see above'
);

// Sample 3 random quizzes to spot-check
console.log('\n=== Sample (3 quizzes) ===');
const samples = [
  quizzes.find((q) => q.lesson_id === 'PC-PRE-01' && q.display_order === 1),
  quizzes.find((q) => q.lesson_id === 'STP-016' && q.display_order === 1),
  quizzes.find((q) => q.lesson_id === 'ONB-04' && q.display_order === 1),
];
for (const s of samples) {
  if (!s) continue;
  console.log(`\n${s.lesson_id} Q#${s.display_order}: ${s.question}`);
  for (const opt of s.options) {
    console.log(`  ${opt.correct ? '✅' : '  '} ${opt.text}`);
  }
}
