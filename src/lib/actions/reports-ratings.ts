'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { resolveReportScope } from '@/lib/actions/reports-common';
import { elSalvadorToday, toElSalvadorDate } from '@/lib/utils/tz';

// Ratings por coach: satisfacción promedio + distribución de estrellas.
// survey_responses NO tiene coach_id — el coach calificado se alcanza vía
// session_result_id -> student_session_results.coach_id (quien CERRÓ la sesión),
// y students.academy_id da el scope. La columna del puntaje es coach_rating
// (NO 'rating' — ese bug ya se arregló). Se cuenta solo coach_rating > 0.

export interface CoachRatingRow {
  coachId: string;
  name: string;
  academyName: string | null;
  avg: number;
  total: number;
  stars: Record<'5' | '4' | '3' | '2' | '1', number>;
}

export interface RatingsReport {
  ok: boolean;
  error?: string;
  from: string;
  to: string;
  isPlatformAdmin: boolean;
  coaches: CoachRatingRow[];
  totals: { avg: number | null; total: number };
}

export async function getRatingsByCoach(opts: {
  from?: string | null;
  to?: string | null;
  academyId?: string | null;
}): Promise<RatingsReport> {
  const scope = await resolveReportScope(opts.academyId);
  const to = opts.to || elSalvadorToday();
  const from = opts.from || '2020-01-01';
  const base: RatingsReport = { ok: false, from, to, isPlatformAdmin: !!scope.isPlatformAdmin, coaches: [], totals: { avg: null, total: 0 } };
  if (!scope.ok) return { ...base, error: 'No autorizado.' };

  const admin = createAdminClient();
  const fromUtc = `${from}T00:00:00.000Z`;
  const toUtc = new Date(Date.parse(`${to}T00:00:00.000Z`) + 2 * 86400000).toISOString();

  let q = admin
    .from('survey_responses')
    .select('coach_rating, submitted_at, student_session_results!inner(coach_id, students!inner(academy_id))')
    .not('coach_rating', 'is', null)
    .gt('coach_rating', 0)
    .gte('submitted_at', fromUtc)
    .lte('submitted_at', toUtc);
  if (scope.scopeAcademyId) q = q.eq('student_session_results.students.academy_id', scope.scopeAcademyId);
  const { data, error } = await q;
  if (error) return { ...base, error: error.message };

  const byCoach = new Map<string, { sum: number; total: number; stars: Record<string, number> }>();
  let grandSum = 0;
  let grandTotal = 0;
  for (const r of data ?? []) {
    const svDate = toElSalvadorDate((r as any).submitted_at);
    if (svDate && (svDate < from || svDate > to)) continue;
    const ssr = Array.isArray((r as any).student_session_results) ? (r as any).student_session_results[0] : (r as any).student_session_results;
    const coachId = ssr?.coach_id;
    if (!coachId) continue; // sin coach atribuible
    const rating = Number((r as any).coach_rating);
    if (!rating || rating < 1 || rating > 5) continue;
    let e = byCoach.get(coachId);
    if (!e) { e = { sum: 0, total: 0, stars: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 } }; byCoach.set(coachId, e); }
    e.sum += rating;
    e.total += 1;
    e.stars[String(rating)] += 1;
    grandSum += rating;
    grandTotal += 1;
  }

  const ids = Array.from(byCoach.keys());
  const nameById = new Map<string, { name: string; academyId: string | null }>();
  if (ids.length) {
    const { data: coaches } = await admin.from('coaches').select('id, display_name, academy_id').in('id', ids);
    for (const c of coaches ?? []) nameById.set(c.id, { name: c.display_name || 'Coach', academyId: c.academy_id ?? null });
  }
  const academyName = new Map<string, string>();
  if (scope.isPlatformAdmin) {
    const acIds = Array.from(new Set(Array.from(nameById.values()).map((v) => v.academyId).filter(Boolean))) as string[];
    if (acIds.length) {
      const { data: acs } = await admin.from('academies').select('id, name').in('id', acIds);
      for (const a of acs ?? []) academyName.set(a.id, a.name);
    }
  }

  const coachesRows: CoachRatingRow[] = ids.map((id) => {
    const e = byCoach.get(id)!;
    const meta = nameById.get(id);
    return {
      coachId: id,
      name: meta?.name || 'Coach',
      academyName: meta?.academyId ? academyName.get(meta.academyId) ?? null : null,
      avg: Math.round((e.sum / e.total) * 10) / 10,
      total: e.total,
      stars: e.stars as CoachRatingRow['stars'],
    };
  }).sort((a, b) => b.avg - a.avg || b.total - a.total);

  return {
    ok: true, from, to, isPlatformAdmin: !!scope.isPlatformAdmin,
    coaches: coachesRows,
    totals: { avg: grandTotal ? Math.round((grandSum / grandTotal) * 10) / 10 : null, total: grandTotal },
  };
}
