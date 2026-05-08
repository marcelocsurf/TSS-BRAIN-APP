// Quick connectivity test for the service role key.
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');
const env = readFileSync(envPath, 'utf-8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();

console.log('URL:', url);
console.log('Key prefix:', key.slice(0, 20) + '...');

const supabase = createClient(url, key, { auth: { persistSession: false } });

const { count: lessonCount, error: e1 } = await supabase
  .from('lessons')
  .select('*', { count: 'exact', head: true });
if (e1) {
  console.error('lessons error:', e1);
  process.exit(1);
}
console.log('lessons rows:', lessonCount);

const { count: dmCount, error: e2 } = await supabase
  .from('drills_missions')
  .select('*', { count: 'exact', head: true });
if (e2) {
  console.error('drills_missions error:', e2);
  process.exit(1);
}
console.log('drills_missions rows:', dmCount);

const { count: quizCount, error: e3 } = await supabase
  .from('lesson_quizzes')
  .select('*', { count: 'exact', head: true });
if (e3) {
  console.error('lesson_quizzes error:', e3);
  process.exit(1);
}
console.log('lesson_quizzes rows:', quizCount);

console.log('\n✓ Conectividad OK con service role key');
