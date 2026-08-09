'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { resolveReportScope } from '@/lib/actions/reports-common';
import { elSalvadorToday, elSalvadorDatePlus, toElSalvadorDate, weekKey, monthKey } from '@/lib/utils/tz';
import { SERVICE_ORDER, SERVICE_LABELS, serviceBucket, type ServiceBucket } from '@/lib/reports/revenue-shared';

// Ingresos por venta de asientos (camp/clase/lección/trip) por semana o mes.
// Ingreso REALIZADO = amount_cents de asientos pagados (nunca list_price_cents).
// Los asientos $0 (INCLUIDO/cortesía) no son ingreso → se excluyen con amount_cents>0.
// "Pendiente" (pipeline) = asientos reservados/pendientes de pago, para que las
// reservas no parezcan dinero perdido. Todo se agrupa en hora de El Salvador.
// SERVICE_LABELS/ServiceBucket viven en @/lib/reports/revenue-shared (este
// archivo es 'use server' → solo puede exportar funciones async).

export type Granularity = 'week' | 'month';
export type { ServiceBucket };

export interface RevenueRow {
  period: string;                       // clave de semana (lunes) o mes (YYYY-MM)
  byService: Record<ServiceBucket, number>; // cents por servicio
  total: number;                        // cents
  seats: number;
}

export interface SeatRevenueReport {
  ok: boolean;
  error?: string;
  from: string;
  to: string;
  granularity: Granularity;
  isPlatformAdmin: boolean;
  rows: RevenueRow[];
  totals: { total: number; seats: number };
  pipeline: { total: number; seats: number };
  serviceTotals: { key: ServiceBucket; label: string; cents: number; seats: number }[];
}

function emptyByService(): Record<ServiceBucket, number> {
  return { camp: 0, class: 0, lesson: 0, trip: 0, custom: 0, other: 0 };
}

export async function getSeatRevenue(opts: {
  from?: string | null;
  to?: string | null;
  granularity?: Granularity;
  academyId?: string | null;
}): Promise<SeatRevenueReport> {
  const scope = await resolveReportScope(opts.academyId);
  const granularity: Granularity = opts.granularity === 'month' ? 'month' : 'week';
  const to = opts.to || elSalvadorToday();
  const from = opts.from || elSalvadorDatePlus(-90);
  const base: SeatRevenueReport = {
    ok: false, from, to, granularity, isPlatformAdmin: !!scope.isPlatformAdmin,
    rows: [], totals: { total: 0, seats: 0 }, pipeline: { total: 0, seats: 0 }, serviceTotals: [],
  };
  if (!scope.ok) return { ...base, error: 'No autorizado.' };

  const admin = createAdminClient();
  // Ventana UTC ensanchada ±1 día; el filtro fino por fecha SV se hace en JS.
  const fromUtc = `${from}T00:00:00.000Z`;
  const toUtc = new Date(Date.parse(`${to}T00:00:00.000Z`) + 2 * 86400000).toISOString();
  const select =
    'amount_cents, sale_type, is_refresher, paid_at, reserved_at, ' +
    'camp_instances:camp_instance_id!inner(academy_id, status, camp_templates:template_id(service_kind))';

  const applyScope = (q: any) => {
    if (scope.scopeAcademyId) q = q.eq('camp_instances.academy_id', scope.scopeAcademyId);
    return q.neq('camp_instances.status', 'cancelled');
  };

  // 1) Realizado — pagados, fechados por paid_at (fallback reserved_at).
  let realizedQ = admin
    .from('camp_participants')
    .select(select)
    .eq('enrollment_status', 'active')
    .eq('payment_status', 'paid')
    .gt('amount_cents', 0)
    .neq('sale_type', 'courtesy')
    .gte('paid_at', fromUtc)
    .lte('paid_at', toUtc);
  realizedQ = applyScope(realizedQ);
  const { data: realized, error: realErr } = await realizedQ;
  if (realErr) return { ...base, error: realErr.message };

  // Grandfathered (M93): pagados sin paid_at → los tomamos por reserved_at para
  // no perder ingreso histórico legítimo.
  let legacyQ = admin
    .from('camp_participants')
    .select(select)
    .eq('enrollment_status', 'active')
    .eq('payment_status', 'paid')
    .gt('amount_cents', 0)
    .neq('sale_type', 'courtesy')
    .is('paid_at', null)
    .gte('reserved_at', fromUtc)
    .lte('reserved_at', toUtc);
  legacyQ = applyScope(legacyQ);
  const { data: legacy } = await legacyQ;

  // 2) Pipeline — reservados/pendientes, fechados por reserved_at.
  let pipeQ = admin
    .from('camp_participants')
    .select(select)
    .eq('enrollment_status', 'active')
    .in('payment_status', ['reserved', 'pending'])
    .gt('amount_cents', 0)
    .gte('reserved_at', fromUtc)
    .lte('reserved_at', toUtc);
  pipeQ = applyScope(pipeQ);
  const { data: pipe } = await pipeQ;

  const bucketOf = (dayIso: string) => (granularity === 'week' ? weekKey(dayIso) : monthKey(dayIso));
  const rowsMap = new Map<string, RevenueRow>();
  const serviceTotals = emptyByService();
  const serviceSeats = emptyByService();
  let totalCents = 0;
  let totalSeats = 0;

  const addRealized = (rows: any[] | null, dateField: 'paid_at' | 'reserved_at') => {
    for (const r of rows ?? []) {
      const svDate = toElSalvadorDate(r[dateField]);
      if (!svDate || svDate < from || svDate > to) continue;
      const key = bucketOf(r[dateField]);
      if (!key) continue;
      const inst = Array.isArray(r.camp_instances) ? r.camp_instances[0] : r.camp_instances;
      const tpl = inst && (Array.isArray(inst.camp_templates) ? inst.camp_templates[0] : inst.camp_templates);
      const bucket = serviceBucket(tpl?.service_kind);
      const cents = r.amount_cents ?? 0;
      let row = rowsMap.get(key);
      if (!row) { row = { period: key, byService: emptyByService(), total: 0, seats: 0 }; rowsMap.set(key, row); }
      row.byService[bucket] += cents;
      row.total += cents;
      row.seats += 1;
      serviceTotals[bucket] += cents;
      serviceSeats[bucket] += 1;
      totalCents += cents;
      totalSeats += 1;
    }
  };
  addRealized(realized, 'paid_at');
  addRealized(legacy, 'reserved_at');

  let pipeCents = 0;
  let pipeSeats = 0;
  for (const r of (pipe as any[]) ?? []) {
    const svDate = toElSalvadorDate(r.reserved_at);
    if (!svDate || svDate < from || svDate > to) continue;
    pipeCents += r.amount_cents ?? 0;
    pipeSeats += 1;
  }

  const rows = Array.from(rowsMap.values()).sort((a, b) => a.period.localeCompare(b.period));
  return {
    ok: true,
    from, to, granularity,
    isPlatformAdmin: !!scope.isPlatformAdmin,
    rows,
    totals: { total: totalCents, seats: totalSeats },
    pipeline: { total: pipeCents, seats: pipeSeats },
    serviceTotals: SERVICE_ORDER
      .map((k) => ({ key: k, label: SERVICE_LABELS[k], cents: serviceTotals[k], seats: serviceSeats[k] }))
      .filter((s) => s.seats > 0),
  };
}
