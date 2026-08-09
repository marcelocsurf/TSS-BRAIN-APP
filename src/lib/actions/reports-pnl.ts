'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { resolveReportScope } from '@/lib/actions/reports-common';
import { elSalvadorToday, elSalvadorDatePlus, toElSalvadorDate } from '@/lib/utils/tz';

// P&L realizado por academia (v1): INGRESOS (asientos pagados + membresías) menos
// NÓMINA REAL de coaches (coach_payments — pagos efectivamente emitidos). Usa
// SOLO actuales para no doble-contar la mano de obra contra la matriz estimada.
// Los costos no-coach (equipo, transporte, etc.) viven en el motor de costos
// por-camp (getCampCostBreakdown); no se agregan acá para no disparar cientos de
// queries por carga en la base en vivo — se muestran como "no incluidos".
// 3 queries agregadas en total, escala a cualquier número de academias.

export interface PnLRow {
  academyId: string | null;
  academyName: string;
  seatRevenueCents: number;
  membershipRevenueCents: number;
  revenueCents: number;
  coachCostCents: number;
  netCents: number;
  marginPct: number | null;
}

export interface PnLReport {
  ok: boolean;
  error?: string;
  from: string;
  to: string;
  isPlatformAdmin: boolean;
  rows: PnLRow[];
  totals: { seatRevenueCents: number; membershipRevenueCents: number; revenueCents: number; coachCostCents: number; netCents: number; marginPct: number | null };
}

export async function getAcademyPnL(opts: {
  from?: string | null;
  to?: string | null;
  academyId?: string | null;
}): Promise<PnLReport> {
  const scope = await resolveReportScope(opts.academyId);
  const to = opts.to || elSalvadorToday();
  const from = opts.from || elSalvadorDatePlus(-90);
  const base: PnLReport = {
    ok: false, from, to, isPlatformAdmin: !!scope.isPlatformAdmin, rows: [],
    totals: { seatRevenueCents: 0, membershipRevenueCents: 0, revenueCents: 0, coachCostCents: 0, netCents: 0, marginPct: null },
  };
  if (!scope.ok) return { ...base, error: 'No autorizado.' };

  const admin = createAdminClient();
  const only = scope.scopeAcademyId; // null = todas (platform admin sin override)
  const fromUtc = `${from}T00:00:00.000Z`;
  const toUtc = new Date(Date.parse(`${to}T00:00:00.000Z`) + 2 * 86400000).toISOString();

  // Acumuladores por academia.
  const seat = new Map<string, number>();
  const membership = new Map<string, number>();
  const coach = new Map<string, number>();
  const add = (m: Map<string, number>, k: string | null, v: number) => { const key = k ?? '__none__'; m.set(key, (m.get(key) ?? 0) + v); };

  // 1) Ingreso por asientos pagados (por paid_at).
  let seatQ = admin
    .from('camp_participants')
    .select('amount_cents, paid_at, reserved_at, camp_instances:camp_instance_id!inner(academy_id, status)')
    .eq('enrollment_status', 'active').eq('payment_status', 'paid').gt('amount_cents', 0).neq('sale_type', 'courtesy')
    .gte('paid_at', fromUtc).lte('paid_at', toUtc);
  if (only) seatQ = seatQ.eq('camp_instances.academy_id', only);
  seatQ = seatQ.neq('camp_instances.status', 'cancelled');
  const { data: seatRows, error: seatErr } = await seatQ;
  if (seatErr) return { ...base, error: seatErr.message };
  for (const r of (seatRows as any[]) ?? []) {
    const d = toElSalvadorDate(r.paid_at);
    if (d && (d < from || d > to)) continue;
    const inst = Array.isArray(r.camp_instances) ? r.camp_instances[0] : r.camp_instances;
    add(seat, inst?.academy_id ?? null, r.amount_cents ?? 0);
  }

  // 2) Ingreso por membresías (activas, con monto, por created_at).
  let memQ = admin
    .from('memberships')
    .select('amount_cents, academy_id, created_at')
    .eq('status', 'active').not('amount_cents', 'is', null)
    .gte('created_at', fromUtc).lte('created_at', toUtc);
  if (only) memQ = memQ.eq('academy_id', only);
  const { data: memRows } = await memQ;
  for (const r of (memRows as any[]) ?? []) {
    const d = toElSalvadorDate(r.created_at);
    if (d && (d < from || d > to)) continue;
    add(membership, r.academy_id ?? null, r.amount_cents ?? 0);
  }

  // 3) Nómina real de coaches (coach_payments, por period_start dentro del rango).
  let payQ = admin
    .from('coach_payments')
    .select('amount_cents, academy_id, period_start')
    .gte('period_start', from).lte('period_start', to);
  if (only) payQ = payQ.eq('academy_id', only);
  const { data: payRows } = await payQ;
  for (const r of (payRows as any[]) ?? []) add(coach, r.academy_id ?? null, r.amount_cents ?? 0);

  // Nombres de academia.
  const academyIds = new Set<string>();
  for (const m of [seat, membership, coach]) for (const k of m.keys()) if (k !== '__none__') academyIds.add(k);
  if (only) academyIds.add(only);
  const nameById = new Map<string, string>();
  if (academyIds.size) {
    const { data: acs } = await admin.from('academies').select('id, name').in('id', Array.from(academyIds));
    for (const a of acs ?? []) nameById.set(a.id, a.name);
  }

  const rows: PnLRow[] = Array.from(academyIds).map((id) => {
    const seatRev = seat.get(id) ?? 0;
    const memRev = membership.get(id) ?? 0;
    const revenue = seatRev + memRev;
    const coachCost = coach.get(id) ?? 0;
    const net = revenue - coachCost;
    return {
      academyId: id,
      academyName: nameById.get(id) ?? 'Academia',
      seatRevenueCents: seatRev, membershipRevenueCents: memRev, revenueCents: revenue,
      coachCostCents: coachCost, netCents: net,
      marginPct: revenue > 0 ? Math.round((net / revenue) * 100) : null,
    };
  }).sort((a, b) => b.revenueCents - a.revenueCents);

  const t = base.totals;
  for (const r of rows) { t.seatRevenueCents += r.seatRevenueCents; t.membershipRevenueCents += r.membershipRevenueCents; t.revenueCents += r.revenueCents; t.coachCostCents += r.coachCostCents; }
  t.netCents = t.revenueCents - t.coachCostCents;
  t.marginPct = t.revenueCents > 0 ? Math.round((t.netCents / t.revenueCents) * 100) : null;

  return { ok: true, from, to, isPlatformAdmin: !!scope.isPlatformAdmin, rows, totals: t };
}
