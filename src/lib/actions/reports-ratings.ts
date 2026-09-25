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


// ─── Respuesta a la encuesta POR CAMP (Marcelo 2026-09-25: "que Rick lo vea
// semana a semana en vez de preguntarse si llegó") ───
// invitados = alumnos activos con email o con encuesta desbloqueada/enviada ·
// respondieron = con survey_responses en algún resultado del camp ·
// experiencia = camp_experience_surveys enviada.
export interface CampSurveyRow {
  campId: string;
  campName: string;
  endDate: string;
  students: number;
  invited: number;
  answered: number;
  experience: number;
  pct: number | null;
}

export async function getSurveyResponseByCamp(opts: { from?: string | null; to?: string | null; academyId?: string | null }): Promise<{ ok: boolean; error?: string; rows: CampSurveyRow[]; totals: { students: number; invited: number; answered: number; experience: number; pct: number | null } }> {
  const scope = await resolveReportScope(opts.academyId);
  const empty = { students: 0, invited: 0, answered: 0, experience: 0, pct: null as number | null };
  if (!scope.ok) return { ok: false, error: 'No autorizado.', rows: [], totals: empty };
  const admin = createAdminClient();
  const to = opts.to || elSalvadorToday();
  const from = opts.from || toElSalvadorDate(new Date(Date.now() - 56 * 86400000)) || '2020-01-01';
  let cq = admin.from('camp_instances').select('id, camp_name, end_date, academy_id, is_test, camp_templates:template_id(service_kind)')
    .gte('end_date', from).lte('end_date', to).neq('status', 'cancelled').order('end_date', { ascending: false });
  if (scope.scopeAcademyId) cq = cq.eq('academy_id', scope.scopeAcademyId);
  const { data: camps, error } = await cq;
  if (error) return { ok: false, error: error.message, rows: [], totals: empty };
  const list = (camps ?? []).filter((c: any) => !c.is_test);
  const campIds = list.map((c: any) => c.id);
  if (campIds.length === 0) return { ok: true, rows: [], totals: empty };
  const [{ data: parts }, { data: sessions }, { data: exps }] = await Promise.all([
    admin.from('camp_participants').select('camp_instance_id, student_id, students:student_id(email, is_test)').in('camp_instance_id', campIds).in('enrollment_status', ['active', 'completed']),
    admin.from('camp_sessions').select('id, camp_instance_id').in('camp_instance_id', campIds),
    admin.from('camp_experience_surveys').select('camp_instance_id, student_id, submitted_at').in('camp_instance_id', campIds).not('submitted_at', 'is', null),
  ]);
  const sessIds = (sessions ?? []).map((s: any) => s.id);
  const campOfSession = new Map((sessions ?? []).map((s: any) => [s.id, s.camp_instance_id]));
  const { data: results } = sessIds.length
    ? await admin.from('student_session_results').select('id, student_id, camp_session_id, email_sent, survey_unlocked').in('camp_session_id', sessIds)
    : { data: [] as any[] };
  const resultIds = (results ?? []).map((r: any) => r.id);
  const { data: responses } = resultIds.length
    ? await admin.from('survey_responses').select('session_result_id').in('session_result_id', resultIds)
    : { data: [] as any[] };
  const answeredResults = new Set((responses ?? []).map((r: any) => r.session_result_id));
  // por camp: alumnos, invitados, respondieron, experiencia
  const byCamp = new Map<string, { students: Set<string>; invited: Set<string>; answered: Set<string>; experience: Set<string> }>();
  const get = (id: string) => { if (!byCamp.has(id)) byCamp.set(id, { students: new Set(), invited: new Set(), answered: new Set(), experience: new Set() }); return byCamp.get(id)!; };
  const hasEmail = new Map<string, boolean>();
  for (const p of (parts ?? []) as any[]) {
    const st = Array.isArray(p.students) ? p.students[0] : p.students;
    if (st?.is_test) continue;
    get(p.camp_instance_id).students.add(p.student_id);
    hasEmail.set(`${p.camp_instance_id}:${p.student_id}`, !!st?.email);
  }
  for (const r of (results ?? []) as any[]) {
    const cid = campOfSession.get(r.camp_session_id); if (!cid) continue;
    const g = get(cid);
    if (!g.students.has(r.student_id)) continue;
    if (r.email_sent || r.survey_unlocked || hasEmail.get(`${cid}:${r.student_id}`)) g.invited.add(r.student_id);
    if (answeredResults.has(r.id)) g.answered.add(r.student_id);
  }
  for (const e of (exps ?? []) as any[]) { const g = byCamp.get(e.camp_instance_id); if (g && g.students.has(e.student_id)) g.experience.add(e.student_id); }
  const rows: CampSurveyRow[] = list.map((c: any) => {
    const g = get(c.id);
    const invited = g.invited.size, answered = g.answered.size;
    return { campId: c.id, campName: c.camp_name, endDate: c.end_date, students: g.students.size, invited, answered, experience: g.experience.size, pct: invited ? Math.round((answered / invited) * 100) : null };
  }).filter((r) => r.students > 0);
  const totals = rows.reduce((t, r) => ({ students: t.students + r.students, invited: t.invited + r.invited, answered: t.answered + r.answered, experience: t.experience + r.experience, pct: null as number | null }), { ...empty });
  totals.pct = totals.invited ? Math.round((totals.answered / totals.invited) * 100) : null;
  return { ok: true, rows, totals };
}
