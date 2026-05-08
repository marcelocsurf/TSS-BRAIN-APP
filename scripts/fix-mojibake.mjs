// Surgically fix mojibake in lessons + drills_missions using JS string
// replacement (UTF-8 native, no encoding ambiguity).
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(join(__dirname, '..', '.env.local'), 'utf-8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();
const supabase = createClient(url, key, { auth: { persistSession: false } });

// Order matters: longer patterns first so we don't double-replace.
const REPLACEMENTS = [
  ['‚Äî', '—'], // em dash
  ['‚Äì', '–'], // en dash
  ['‚Äô', '’'], // right single quote
  ['‚Äú', '“'], // left double quote
  ['‚Äù', '”'], // right double quote
  ['‚Ä¶', '…'], // ellipsis
  ['¬∞', '°'], // degree
  ['¬Σ', '·'], // middle dot
  ['Äî', '—'], // standalone em dash leftovers
  ['Aî', '—'], // misencoded
  ['√°', 'á'],
  ['√©', 'é'],
  ['√≠', 'í'],
  ['√≥', 'ó'],
  ['√∫', 'ú'],
  ['√±', 'ñ'],
  ['√º', 'ü'],
];

function fixText(text) {
  if (!text) return { fixed: text, changed: false };
  let out = text;
  for (const [from, to] of REPLACEMENTS) {
    while (out.includes(from)) {
      out = out.replaceAll(from, to);
    }
  }
  return { fixed: out, changed: out !== text };
}

let fixed = 0;
let unchanged = 0;
let errors = 0;

console.log('=== Fixing lessons table ===');
const { data: lessons } = await supabase
  .from('lessons')
  .select('id, title, description_md, errors_md');
for (const l of lessons) {
  const titleR = fixText(l.title);
  const dmR = fixText(l.description_md);
  const emR = fixText(l.errors_md);
  if (titleR.changed || dmR.changed || emR.changed) {
    const update = {};
    if (titleR.changed) update.title = titleR.fixed;
    if (dmR.changed) update.description_md = dmR.fixed;
    if (emR.changed) update.errors_md = emR.fixed;
    const { error } = await supabase.from('lessons').update(update).eq('id', l.id);
    if (error) {
      console.error(`  ${l.id} ERROR:`, error.message);
      errors++;
    } else {
      console.log(`  ${l.id} fixed (${Object.keys(update).join(', ')})`);
      fixed++;
    }
  } else {
    unchanged++;
  }
}

console.log('\n=== Fixing drills_missions table ===');
const { data: drills } = await supabase
  .from('drills_missions')
  .select('id, title, description_md');
for (const d of drills) {
  const titleR = fixText(d.title);
  const dmR = fixText(d.description_md);
  if (titleR.changed || dmR.changed) {
    const update = {};
    if (titleR.changed) update.title = titleR.fixed;
    if (dmR.changed) update.description_md = dmR.fixed;
    const { error } = await supabase
      .from('drills_missions')
      .update(update)
      .eq('id', d.id);
    if (error) {
      console.error(`  ${d.id} ERROR:`, error.message);
      errors++;
    } else {
      console.log(`  ${d.id} fixed (${Object.keys(update).join(', ')})`);
      fixed++;
    }
  } else {
    unchanged++;
  }
}

console.log(`\n=== Summary ===`);
console.log(`Fixed: ${fixed}`);
console.log(`Unchanged: ${unchanged}`);
console.log(`Errors: ${errors}`);
