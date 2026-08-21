'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { resolveReportScope } from '@/lib/actions/reports-common';
import { elSalvadorToday, toElSalvadorDate } from '@/lib/utils/tz';
import { EXPERIENCE_LABELS_ES, DIM_COLS, type ExperienceCol } from '@/lib/survey/experience-questions';

// Reporte de EXPERIENCIA del camp: instalaciones, equipo, transporte,
// comunicación, value for money y NPS. Fuente: camp_experience_surveys
// (una fila por camp+alumno; respondida = submitted_at NOT NULL).
// Scope por academia vía resolveReportScope (admin client salta RLS,
// así que el filtro manual ES el scope).

export interface ExperienceResponseRow {
  id: string;
  date: string;            // fecha SV de submitted_at
  studentName: string;
  campName: string | null;
  scores: Partial<Record<ExperienceCol, number | null>>;
  nps: number | null;
  comment: string | null;
  /** true si alguna dimensión ≤3 o NPS ≤6 — para la sección de alertas. */
  isAlert: boolean;
}

export interface ExperienceReport {
  ok: boolean;
  error?: string;
  from: string;
  to: string;
  isPlatformAdmin: boolean;
  labels: Record<ExperienceCol, string>;
  totals: {
    responses: number;
    sent: number;               // filas creadas en el rango (respondidas o no)
    responseRate: number | null; // 0-100
    overall: number | null;      // promedio de todas las dimensiones
    dims: Record<ExperienceCol, { avg: number | null; n: number }>;
    prevDims: Record<ExperienceCol, { avg: number | null; n: number }>; // rango anterior de igual largo
    nps: { score: number | null; promoters: number; passives: number; detractors: number; n: number };
  };
  camps: { campName: string; startDate: string | null; n: number; overall: number | null; value: number | null; nps: number | null }[];
  responses: ExperienceResponseRow[]; // más recientes primero (feed + CSV)
  alerts: ExperienceResponseRow[];
}

const emptyDims = (): Record<ExperienceCol, { avg: number | null; n: number }> =>
  Object.fromEntries(DIM_COLS.map((c) => [c, { avg: null, n: 0 }])) as any;

function dimAverages(rows: any[]): Record<ExperienceCol, { avg: number | null; n: number }> {
  const out = emptyDims();
  for (const col of DIM_COLS) {
    const vals = rows.map((r) => r[col]).filter((v: any) => typeof v === 'number' && v >= 1 && v <= 5);
    out[col] = vals.length
      ? { avg: Math.round((vals.reduce((a: number, b: number) => a + b, 0) / vals.length) * 10) / 10, n: vals.length }
      : { avg: null, n: 0 };
  }
  return out;
}

function npsOf(rows: any[]): { score: number | null; promoters: number; passives: number; detractors: number; n: number } {
  const vals = rows.map((r) => r.nps).filter((v: any) => typeof v === 'number' && v >= 0 && v <= 10);
  const promoters = vals.filter((v: number) => v >= 9).length;
  const passives = vals.filter((v: number) => v >= 7 && v <= 8).length;
  const detractors = vals.filter((v: number) => v <= 6).length;
  return {
    score: vals.length ? Math.round(((promoters - detractors) / vals.length) * 100) : null,
    promoters,
    passives,
    detractors,
    n: vals.length,
  };
}

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
  const fromMs = Date.parse(`${from}T00:00:00.000Z`);
  const toMs = Date.parse(`${to}T00:00:00.000Z`);
  const fromUtc = new Date(fromMs).toISOString();
  const toUtc = new Date(toMs + 2 * 86400000).toISOString(); // +2d cubre el shift SV
  // Rango anterior del mismo largo, para la tendencia por dimensión.
  const spanMs = Math.max(86400000, toMs - fromMs + 86400000);
  const prevFrom = toElSalvadorDate(new Date(fromMs - spanMs)) ?? from;
  const prevFromUtc = new Date(fromMs - spanMs).toISOString();

  let q = admin
    .from('camp_experience_surveys')
    .select('id, submitted_at, created_at, facilities_rating, equipment_rating, transport_rating, communication_rating, value_rating, nps, open_comment, students:student_id(first_name, last_name), camp_instances:camp_instance_id(camp_name, start_date)')
    .gte('created_at', prevFromUtc)
    .lte('created_at', toUtc)
    .order('created_at', { ascending: false })
    .limit(2000);
  if (scope.scopeAcademyId) q = q.eq('academy_id', scope.scopeAcademyId);
  const { data, error } = await q;
  if (error) return { ...base, error: error.message };

  const all = (data ?? []).map((r: any) => {
    const stu = Array.isArray(r.students) ? r.students[0] : r.students;
    const inst = Array.isArray(r.camp_instances) ? r.camp_instances[0] : r.camp_instances;
    return { ...r, _stu: stu, _inst: inst, _subDay: toElSalvadorDate(r.submitted_at), _createdDay: toElSalvadorDate(r.created_at) };
  });

  const inRange = (d: string | null) => !!d && d >= from && d <= to;
  const inPrev = (d: string | null) => !!d && d >= prevFrom && d < from;

  const sentRows = all.filter((r) => inRange(r._createdDay));
  const answered = all.filter((r) => r.submitted_at && inRange(r._subDay));
  const answeredPrev = all.filter((r) => r.submitted_at && inPrev(r._subDay));

  const dims = dimAverages(answered);
  const withAvg = DIM_COLS.map((c) => dims[c]).filter((d) => d.avg != null) as { avg: number; n: number }[];
  const overall = withAvg.length
    ? Math.round((withAvg.reduce((a, d) => a + d.avg * d.n, 0) / withAvg.reduce((a, d) => a + d.n, 0)) * 10) / 10
    : null;

  const toRow = (r: any): ExperienceResponseRow => {
    const scores = Object.fromEntries(DIM_COLS.map((c) => [c, r[c] ?? null])) as ExperienceResponseRow['scores'];
    const low = DIM_COLS.some((c) => typeof r[c] === 'number' && r[c] <= 3) || (typeof r.nps === 'number' && r.nps <= 6);
    return {
      id: r.id,
      date: r._subDay ?? '',
      studentName: [r._stu?.first_name, r._stu?.last_name].filter(Boolean).join(' ') || '—',
      campName: r._inst?.camp_name ?? null,
      scores,
      nps: r.nps ?? null,
      comment: r.open_comment ?? null,
      isAlert: low,
    };
  };
  const responses = answered
    .sort((a, b) => String(b.submitted_at).localeCompare(String(a.submitted_at)))
    .map(toRow);

  // Por camp (solo respondidas en rango)
  const byCamp = new Map<string, any[]>();
  for (const r of answered) {
    const key = r._inst?.camp_name ?? '—';
    if (!byCamp.has(key)) byCamp.set(key, []);
    byCamp.get(key)!.push(r);
  }
  const camps = Array.from(byCamp.entries()).map(([campName, rows]) => {
    const d = dimAverages(rows);
    const w = DIM_COLS.map((c) => d[c]).filter((x) => x.avg != null) as { avg: number; n: number }[];
    return {
      campName,
      startDate: rows[0]?._inst?.start_date ?? null,
      n: rows.length,
      overall: w.length ? Math.round((w.reduce((a, x) => a + x.avg * x.n, 0) / w.reduce((a, x) => a + x.n, 0)) * 10) / 10 : null,
      value: d.value_rating.avg,
      nps: npsOf(rows).score,
    };
  }).sort((a, b) => String(b.startDate ?? '').localeCompare(String(a.startDate ?? '')));

  return {
    ...base,
    ok: true,
    totals: {
      responses: answered.length,
      sent: sentRows.length,
      responseRate: sentRows.length ? Math.round((sentRows.filter((r) => r.submitted_at).length / sentRows.length) * 100) : null,
      overall,
      dims,
      prevDims: dimAverages(answeredPrev),
      nps: npsOf(answered),
    },
    camps,
    responses,
    alerts: responses.filter((r) => r.isAlert),
  };
}
