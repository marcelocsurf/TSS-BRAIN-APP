// Comprehensive audit: detect any remaining mojibake or Spanish content.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();
const supabase = createClient(url, key, { auth: { persistSession: false } });

// Known mojibake patterns (UTF-8 misencoded as MacRoman, then re-stored as UTF-8)
const MOJIBAKE_PATTERNS = [
  '‚Äî', // em dash
  '‚Äì', // en dash
  '‚Äô', // right single quote
  '‚Äú', // left double quote
  '‚Äù', // right double quote
  '‚Ä¶', // ellipsis
  '¬∞', // degree sign
  '¬Σ', // middle dot
  'Äî',
  'Aî',
  '√°',
  '√©',
  '√≠',
  '√≥',
  '√∫',
  '√±',
  'Est√°',
];

const SPANISH_MARKERS = [
  'alumno',
  'tabla', // ambiguous (board)
  'espuma',
  'instalar el patrón',
  'enseñar',
  'coach verbaliza',
];

function findIssues(text) {
  if (!text) return [];
  const issues = [];
  for (const p of MOJIBAKE_PATTERNS) {
    if (text.includes(p)) issues.push(`mojibake: "${p}"`);
  }
  return issues;
}

function findSpanish(text) {
  if (!text) return [];
  const issues = [];
  const lower = text.toLowerCase();
  for (const w of SPANISH_MARKERS) {
    if (lower.includes(w.toLowerCase())) issues.push(`spanish: "${w}"`);
  }
  return issues;
}

console.log('=== AUDIT: lessons table ===\n');

const { data: lessons } = await supabase
  .from('lessons')
  .select('id, title, description_md, errors_md, drill_md')
  .eq('active', true)
  .or('id.like.PC-PRE-%,id.like.ONB-%,id.like.STP-%')
  .order('id');

let lessonsWithIssues = 0;
let mojibakeCount = 0;
let spanishCount = 0;
let drillMdNotNull = 0;

for (const l of lessons) {
  const dmIssues = findIssues(l.description_md);
  const emIssues = findIssues(l.errors_md);
  const titleIssues = findIssues(l.title);
  const dmSpanish = findSpanish(l.description_md);

  if (l.drill_md !== null) drillMdNotNull++;

  const all = [
    ...dmIssues.map((x) => `  description_md ${x}`),
    ...emIssues.map((x) => `  errors_md ${x}`),
    ...titleIssues.map((x) => `  title ${x}`),
    ...dmSpanish.map((x) => `  description_md ${x}`),
  ];
  if (all.length > 0) {
    console.log(`${l.id} — ${l.title}`);
    all.forEach((s) => console.log(s));
    lessonsWithIssues++;
    mojibakeCount += dmIssues.length + emIssues.length + titleIssues.length;
    spanishCount += dmSpanish.length;
  }
}

console.log(`\nlessons: ${lessons.length} active`);
console.log(`lessons with issues: ${lessonsWithIssues}`);
console.log(`mojibake matches: ${mojibakeCount}`);
console.log(`spanish matches: ${spanishCount}`);
console.log(`drill_md not null: ${drillMdNotNull}`);

console.log('\n=== AUDIT: drills_missions table ===\n');

const { data: drills } = await supabase
  .from('drills_missions')
  .select('id, title, type, description_md')
  .eq('active', true)
  .order('id');

let drillsWithIssues = 0;
let dMojibake = 0;
let dSpanish = 0;
for (const d of drills) {
  const issues = findIssues(d.description_md);
  const titleIssues = findIssues(d.title);
  const spanish = findSpanish(d.description_md);
  const all = [
    ...issues.map((x) => `  description_md ${x}`),
    ...titleIssues.map((x) => `  title ${x}`),
    ...spanish.map((x) => `  description_md ${x}`),
  ];
  if (all.length > 0) {
    console.log(`${d.id} (${d.type}) — ${d.title}`);
    all.forEach((s) => console.log(s));
    drillsWithIssues++;
    dMojibake += issues.length + titleIssues.length;
    dSpanish += spanish.length;
  }
}

console.log(`\ndrills_missions: ${drills.length} active`);
console.log(`drills with issues: ${drillsWithIssues}`);
console.log(`mojibake matches: ${dMojibake}`);
console.log(`spanish matches: ${dSpanish}`);

console.log(
  `\n=== TOTAL: ${
    mojibakeCount + dMojibake
  } mojibake patterns + ${spanishCount + dSpanish} spanish markers + ${drillMdNotNull} legacy drill_md`
);
