'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { resolveReportScope } from '@/lib/actions/reports-common';
import { elSalvadorToday, toElSalvadorDate } from '@/lib/utils/tz';
import { EXPERIENCE_LABELS_ES } from '@/lib/survey/experience-questions';
import { experienceReportCore, emptyDims, type ExperienceReport, type ExperienceResponseRow } from '@/lib/reports/experience-core';
export type { ExperienceReport, ExperienceResponseRow };

// Reporte de EXPERIENCIA del camp: instalaciones, equipo, transporte,
// comunicación, value for money y NPS. Fuente: camp_experience_surveys
// (una fila por camp+alumno; respondida = submitted_at NOT NULL).
// Scope por academia vía resolveReportScope (admin client salta RLS,
// así que el filtro manual ES el scope).

export async function getExperienceReport(opts: {
  from?: string | null;
  to?: string | null;
  academyId?: string | null;
}): Promise<ExperienceReport> {
  const scope = await resolveReportScope(opts.academyId);
  const to = opts.to || elSalvadorToday();
  const from = opts.from || '2020-01-01';
  const base: ExperienceReport = {
    ok: false, from, to, isPlatformAdmin: !!scope.isPlatformAdmin,
    labels: EXPERIENCE_LABELS_ES,
    totals: { responses: 0, sent: 0, responseRate: null, overall: null, dims: emptyDims(), prevDims: emptyDims(), nps: { score: null, promoters: 0, passives: 0, detractors: 0, n: 0 } },
    camps: [], responses: [], alerts: [],
  };
  if (!scope.ok) return { ...base, error: 'No autorizado.' };

  const admin = createAdminClient();
  const core = await experienceReportCore(admin, { scopeAcademyId: scope.scopeAcademyId ?? null, isPlatformAdmin: !!scope.isPlatformAdmin }, from, to);
  if ('error' in core && core.error) return { ...base, error: core.error };
  return { ...base, ok: true, ...(core as any) };
}
