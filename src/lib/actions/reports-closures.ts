'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { resolveReportScope } from '@/lib/actions/reports-common';
import { elSalvadorToday, elSalvadorDatePlus } from '@/lib/utils/tz';

// Cierres por coach: cumplimiento de cierre de sesiones (el cierre es el candado
// de pago + gate de calidad; regla de Marcelo: sin cierre no se paga).
// camp_sessions.session_status='completed' = CERRADA. Se atribuye al coach
// EFECTIVO del servicio (head_coach si aceptó, si no el coach original).
// "Atrasada" = sesión con fecha pasada aún sin cerrar. "Próxima" = futura sin cerrar.

export interface CoachClosureRow {
  coachId: string;
  name: string;
  academyName: string | null;
  scheduled: number;
  closed: number;
  overdue: number;   // pasadas sin cerrar
  upcoming: number;  // futuras sin cerrar
  compliancePct: number | null; // closed / (closed + overdue)
}

export interface ClosuresReport {
  ok: boolean;
  error?: string;
  from: string;
  to: string;
  isPlatformAdmin: boolean;
  rows: CoachClosureRow[];
  totals: { scheduled: number; closed: number; overdue: number; upcoming: number; compliancePct: number | null };
}

export async function getClosuresByCoach(opts: {
  from?: string | null;
  to?: string | null;
  academyId?: string | null;
}): Promise<ClosuresReport> {
  const scope = await resolveReportScope(opts.academyId);
  const from = opts.from || elSalvadorDatePlus(-30);
  const to = opts.to || elSalvadorToday();
  const today = elSalvadorToday();
  const base: ClosuresReport = {
    ok: false, from, to, isPlatformAdmin: !!scope.isPlatformAdmin, rows: [],
    totals: { scheduled: 0, closed: 0, overdue: 0, upcoming: 0, compliancePct: null },
  };
  if (!scope.ok) return { ...base, error: 'No autorizado.' };

  const admin = createAdminClient();
  let q = admin
    .from('camp_sessions')
    .select('session_date, session_status, camp_instances:camp_instance_id!inner(coach_id, head_coach_id, head_coach_status, academy_id, status)')
    .gte('session_date', from)
    .lte('session_date', to);
  if (scope.scopeAcademyId) q = q.eq('camp_instances.academy_id', scope.scopeAcademyId);
  q = q.neq('camp_instances.status', 'cancelled');
  const { data, error } = await q;
  if (error) return { ...base, error: error.message };

  const byCoach = new Map<string, { name: string; academyId: string | null; scheduled: number; closed: number; overdue: number; upcoming: number }>();
  for (const s of (data as any[]) ?? []) {
    const inst = Array.isArray(s.camp_instances) ? s.camp_instances[0] : s.camp_instances;
    if (!inst) continue;
    const useHead = inst.head_coach_id && inst.head_coach_status === 'accepted';
    const coachId = (useHead ? inst.head_coach_id : inst.coach_id) as string | null;
    if (!coachId) continue;
    let e = byCoach.get(coachId);
    if (!e) { e = { name: 'Coach', academyId: inst.academy_id ?? null, scheduled: 0, closed: 0, overdue: 0, upcoming: 0 }; byCoach.set(coachId, e); }
    e.scheduled += 1;
    if (s.session_status === 'completed') e.closed += 1;
    else if (s.session_date < today) e.overdue += 1;
    else e.upcoming += 1;
  }

  const ids = Array.from(byCoach.keys());
  if (ids.length) {
    const { data: coaches } = await admin.from('coaches').select('id, display_name, academy_id').in('id', ids);
    for (const c of coaches ?? []) {
      const e = byCoach.get(c.id);
      if (e) { e.name = c.display_name || 'Coach'; e.academyId = c.academy_id ?? e.academyId; }
    }
  }
  const academyName = new Map<string, string>();
  if (scope.isPlatformAdmin) {
    const acIds = Array.from(new Set(Array.from(byCoach.values()).map((v) => v.academyId).filter(Boolean))) as string[];
    if (acIds.length) {
      const { data: acs } = await admin.from('academies').select('id, name').in('id', acIds);
      for (const a of acs ?? []) academyName.set(a.id, a.name);
    }
  }

  const rows: CoachClosureRow[] = ids.map((id) => {
    const e = byCoach.get(id)!;
    const due = e.closed + e.overdue;
    return {
      coachId: id,
      name: e.name,
      academyName: e.academyId ? academyName.get(e.academyId) ?? null : null,
      scheduled: e.scheduled,
      closed: e.closed,
      overdue: e.overdue,
      upcoming: e.upcoming,
      compliancePct: due ? Math.round((e.closed / due) * 100) : null,
    };
  }).sort((a, b) => b.overdue - a.overdue || (a.compliancePct ?? 101) - (b.compliancePct ?? 101));

  const t = base.totals;
  for (const r of rows) { t.scheduled += r.scheduled; t.closed += r.closed; t.overdue += r.overdue; t.upcoming += r.upcoming; }
  const due = t.closed + t.overdue;
  t.compliancePct = due ? Math.round((t.closed / due) * 100) : null;

  return { ok: true, from, to, isPlatformAdmin: !!scope.isPlatformAdmin, rows, totals: t };
}
