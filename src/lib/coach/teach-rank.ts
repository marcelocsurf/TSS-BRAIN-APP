// La cinta hasta la que este coach ve el curso del alumno (servidor): su
// max_belt_permission o la cinta más alta de los camps que tiene asignados
// (coach o head coach, vigentes o de la última semana). Ver course-access.ts.

import type { createAdminClient } from '@/lib/supabase/admin';
import { elSalvadorToday } from '@/lib/utils/tz';
import { beltRankOf } from './course-access';

export async function coachTeachRank(
  admin: ReturnType<typeof createAdminClient>,
  coach: { id: string; max_belt_permission?: string | null },
): Promise<number> {
  const base = beltRankOf(coach.max_belt_permission);
  const since = new Date(new Date(elSalvadorToday() + 'T12:00:00Z').getTime() - 7 * 86400000).toISOString().slice(0, 10);
  const { data } = await admin
    .from('camp_instances')
    .select('status, camp_templates:template_id(includes_course_key)')
    .or(`coach_id.eq.${coach.id},head_coach_id.eq.${coach.id}`)
    .gte('end_date', since);
  let rank = base;
  for (const c of (data ?? []) as any[]) {
    if (c.status === 'cancelled') continue;
    const t = Array.isArray(c.camp_templates) ? c.camp_templates[0] : c.camp_templates;
    if (t?.includes_course_key) rank = Math.max(rank, beltRankOf(t.includes_course_key));
  }
  return rank;
}
