// ═══ Candado del curso hasta el día antes del camp (Marcelo 2026-09-17) ═══
// Al inscribirse a un camp el alumno recibe el curso de esa cinta
// (course_grants.source = auto_on_camp_enrol). Desde ese momento el portal
// abre con el Pre-Course (y el libro si lo tiene); el curso de su nivel se ve
// completo pero con candado, y se destraba solo UN DÍA ANTES del inicio del
// camp. Quien compró el curso sin camp (cualquier otra fuente) no cambia.
// Un camp pasado o en curso de esa cinta también destraba (ya lo vivió).
import { createAdminClient } from '@/lib/supabase/admin';
import { elSalvadorToday } from '@/lib/utils/tz';

export interface CourseLock {
  courseKey: string;
  /** Fecha (YYYY-MM-DD, El Salvador) en que se destraba: start_date − 1 día. */
  unlocksOn: string;
  campName: string | null;
  startDate: string;
}

function minusOneDay(ymd: string): string {
  const d = new Date(`${ymd}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function formatUnlockDate(ymd: string): string {
  return new Date(`${ymd}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

export async function getCourseLocks(studentId: string): Promise<Record<string, CourseLock>> {
  const admin = createAdminClient();
  const [{ data: grants }, { data: seats }] = await Promise.all([
    admin.from('course_grants').select('course_key, source').eq('student_id', studentId).is('revoked_at', null),
    admin.from('camp_participants')
      .select('camp_instances:camp_instance_id(camp_name, start_date, status, camp_templates:template_id(includes_course_key))')
      .eq('student_id', studentId),
  ]);
  const out: Record<string, CourseLock> = {};
  const byKey = new Map<string, string[]>();
  for (const g of grants ?? []) (byKey.get(g.course_key) ?? byKey.set(g.course_key, []).get(g.course_key)!).push(String(g.source ?? ''));
  const today = elSalvadorToday();
  for (const [key, sources] of byKey.entries()) {
    // Solo se traba lo que vino ÚNICAMENTE por inscripción a camp.
    if (!sources.every((s) => s === 'auto_on_camp_enrol')) continue;
    const camps = (seats ?? [])
      .map((r: any) => (Array.isArray(r.camp_instances) ? r.camp_instances[0] : r.camp_instances))
      .filter((ci: any) => ci && ci.status !== 'cancelled' && ci.start_date)
      .filter((ci: any) => {
        const t = Array.isArray(ci.camp_templates) ? ci.camp_templates[0] : ci.camp_templates;
        return t?.includes_course_key === key;
      })
      .sort((a: any, b: any) => String(a.start_date).localeCompare(String(b.start_date)));
    if (camps.length === 0) continue; // sin camp de esa cinta: no se traba por error
    const first = camps[0];
    const unlocksOn = minusOneDay(String(first.start_date));
    if (today >= unlocksOn) continue;
    out[key] = { courseKey: key, unlocksOn, campName: first.camp_name ?? null, startDate: String(first.start_date) };
  }
  return out;
}
