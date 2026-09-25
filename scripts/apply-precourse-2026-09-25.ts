// Aplica la reestructura del Pre-Course (Marcelo 2026-09-25). Respaldo previo:
// ops_lessons_backup_2026_09_25_precourse. Uso:
//   DRY=1 node apply.cjs   → solo imprime el plan
//   node apply.cjs         → aplica
import { createAdminClient } from '@/lib/supabase/admin';
import { readFileSync, existsSync } from 'node:fs';
const NEW = process.env.NEW_DIR!;
const DEACTIVATE = ['SAFE-OSE-01', 'SAFE-OSE-02', 'SAFE-OSE-03', 'SAFE-OSE-04', 'SAFE-OSE-EXIT', 'ONB-02', 'ONB-04', 'PC-PRE-03'];
// Orden dentro de Safety & Ocean (una sola sección M0-SAFETY, order 2001…2008).
const SAFETY_ORDER = ['PC-PRE-01', 'PC-PRE-04', 'PC-PRE-09', 'PC-PRE-07', 'PC-PRE-06', 'PC-PRE-05', 'PC-PRE-02', 'PC-PRE-10'];
const KEEP = ['PC-PRE-08', ...SAFETY_ORDER, 'ONB-05', 'ONB-01', 'VAL-001', 'VAL-002', 'ONB-06', 'PC-WARMUP'];
async function main() {
  const dry = !!process.env.DRY;
  const admin = createAdminClient();
  const plan: { id: string; title?: string; chars?: number; extra?: Record<string, unknown> }[] = [];
  for (const id of KEEP) {
    const f = `${NEW}/${id}.md`;
    if (!existsSync(f)) { console.log('FALTA', f); process.exit(1); }
    const raw = readFileSync(f, 'utf8');
    const lines = raw.split('\n');
    const title = lines[0].replace(/^#\s*/, '').trim();
    const body = lines.slice(1).join('\n').trim() + '\n';
    const extra: Record<string, unknown> = { title, description_md: body, active: true };
    const so = SAFETY_ORDER.indexOf(id);
    if (so >= 0) { extra.pc_section_id = 'M0-SAFETY'; extra.pc_section_name = 'Safety & Ocean'; extra.pc_section_order = 20; extra.display_order = 2001 + so; }
    plan.push({ id, title, chars: body.length, extra });
  }
  for (const p of plan) console.log(`${p.id.padEnd(10)} ${String(p.chars).padStart(5)} chars  ${p.extra?.display_order ? '#' + p.extra.display_order : ''}  ${p.title}`);
  console.log('DEACTIVATE', DEACTIVATE.join(', '));
  if (dry) { console.log('(dry run: nada aplicado)'); return; }
  for (const p of plan) {
    const { error } = await admin.from('lessons').update(p.extra!).eq('id', p.id);
    if (error) { console.log('ERROR', p.id, error.message); process.exit(1); }
  }
  const { error: e2 } = await admin.from('lessons').update({ active: false }).in('id', DEACTIVATE);
  if (e2) { console.log('ERROR deactivate', e2.message); process.exit(1); }
  const { data: check } = await admin.from('lessons').select('id, title, pc_section_id, display_order, active').in('course_section', ['pre_course_fundamentals', 'pre_course_values']).eq('active', true).order('pc_section_order').order('display_order');
  console.log('ACTIVAS AHORA:', (check ?? []).length);
  for (const l of check ?? []) console.log(`  ${l.pc_section_id} #${l.display_order} ${l.id} · ${l.title}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
