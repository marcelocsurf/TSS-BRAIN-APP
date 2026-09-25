'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { resolveReportScope } from '@/lib/actions/reports-common';
import { elSalvadorToday, toElSalvadorDate } from '@/lib/utils/tz';
import { ratingsByCoachCore, surveyResponseByCampCore, type CoachRatingRow, type CampSurveyRow } from '@/lib/reports/satisfaction-core';
export type { CoachRatingRow, CampSurveyRow };

// Ratings por coach: satisfacción promedio + distribución de estrellas.
// survey_responses NO tiene coach_id — el coach calificado se alcanza vía
// session_result_id -> student_session_results.coach_id (quien CERRÓ la sesión),
// y students.academy_id da el scope. La columna del puntaje es coach_rating
// (NO 'rating' — ese bug ya se arregló). Se cuenta solo coach_rating > 0.

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
  const core = await ratingsByCoachCore(admin, { scopeAcademyId: scope.scopeAcademyId ?? null, isPlatformAdmin: !!scope.isPlatformAdmin }, from, to);
  if (core.error) return { ...base, error: core.error };
  return { ok: true, from, to, isPlatformAdmin: !!scope.isPlatformAdmin, coaches: core.coaches, totals: core.totals };
}


// ─── Respuesta a la encuesta POR CAMP (Marcelo 2026-09-25: "que Rick lo vea
// semana a semana en vez de preguntarse si llegó") ───
// invitados = alumnos activos con email o con encuesta desbloqueada/enviada ·
// respondieron = con survey_responses en algún resultado del camp ·
// experiencia = camp_experience_surveys enviada.
export async function getSurveyResponseByCamp(opts: { from?: string | null; to?: string | null; academyId?: string | null }): Promise<{ ok: boolean; error?: string; rows: CampSurveyRow[]; totals: { students: number; invited: number; answered: number; experience: number; pct: number | null } }> {
  const scope = await resolveReportScope(opts.academyId);
  const empty = { students: 0, invited: 0, answered: 0, experience: 0, pct: null as number | null };
  if (!scope.ok) return { ok: false, error: 'No autorizado.', rows: [], totals: empty };
  const admin = createAdminClient();
  const to = opts.to || elSalvadorToday();
  const from = opts.from || toElSalvadorDate(new Date(Date.now() - 56 * 86400000)) || '2020-01-01';
  const core = await surveyResponseByCampCore(admin, scope.scopeAcademyId ?? null, from, to);
  if (core.error) return { ok: false, error: core.error, rows: [], totals: empty };
  return { ok: true, rows: core.rows, totals: core.totals };
}
