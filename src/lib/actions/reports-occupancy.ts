'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { resolveReportScope } from '@/lib/actions/reports-common';
import { elSalvadorDatePlus } from '@/lib/utils/tz';

// Ocupación vs capacidad por servicio. Capacidad efectiva = capacity_override
// ?? template.capacity_max ?? 0 (default 0 para NO inventar cupos fantasma).
// Asiento ocupado = enrollment_status='active'. Vendido = activo y pagado.
// Se agrupa por tipo de servicio, plantilla, o semana (por start_date).

export type OccupancyGroupBy = 'service_kind' | 'template' | 'week';

const SERVICE_LABELS: Record<string, string> = {
  surf_camp: 'Camps', class: 'Clases', surf_lesson: 'Lecciones', trip: 'Trips', custom: 'Custom',
};

export interface OccupancyRow {
  key: string;
  label: string;
  services: number;
  spots: number;
  enrolled: number;
  sold: number;
  reserved: number;
  available: number;
  occupancyPct: number;      // enrolled / spots
  paidPct: number;           // sold / spots
  capacityNotSet: number;    // servicios sin cupo definido (spots=0)
}

export interface OccupancyReport {
  ok: boolean;
  error?: string;
  from: string;
  to: string;
  groupBy: OccupancyGroupBy;
  isPlatformAdmin: boolean;
  rows: OccupancyRow[];
  totals: { services: number; spots: number; enrolled: number; sold: number; reserved: number; available: number; occupancyPct: number; paidPct: number; capacityNotSet: number };
}

function weekOfDate(d: string): string {
  const dt = new Date(d + 'T00:00:00Z');
  const dow = dt.getUTCDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  dt.setUTCDate(dt.getUTCDate() + diff);
  return dt.toISOString().slice(0, 10);
}

export async function getOccupancyReport(opts: {
  from?: string | null;
  to?: string | null;
  groupBy?: OccupancyGroupBy;
  academyId?: string | null;
}): Promise<OccupancyReport> {
  const scope = await resolveReportScope(opts.academyId);
  const groupBy: OccupancyGroupBy = opts.groupBy === 'template' || opts.groupBy === 'week' ? opts.groupBy : 'service_kind';
  const from = opts.from || elSalvadorDatePlus(-30);
  const to = opts.to || elSalvadorDatePlus(30);
  const base: OccupancyReport = {
    ok: false, from, to, groupBy, isPlatformAdmin: !!scope.isPlatformAdmin, rows: [],
    totals: { services: 0, spots: 0, enrolled: 0, sold: 0, reserved: 0, available: 0, occupancyPct: 0, paidPct: 0, capacityNotSet: 0 },
  };
  if (!scope.ok) return { ...base, error: 'No autorizado.' };

  const admin = createAdminClient();
  let q = admin
    .from('camp_instances')
    .select('id, camp_name, start_date, status, capacity_override, template_id, camp_templates:template_id(template_name, service_kind, capacity_max), camp_participants(enrollment_status, payment_status)')
    .gte('start_date', from)
    .lte('start_date', to)
    .neq('status', 'cancelled');
  if (scope.scopeAcademyId) q = q.eq('academy_id', scope.scopeAcademyId);
  const { data, error } = await q;
  if (error) return { ...base, error: error.message };

  const groups = new Map<string, OccupancyRow>();
  const ensure = (key: string, label: string): OccupancyRow => {
    let g = groups.get(key);
    if (!g) { g = { key, label, services: 0, spots: 0, enrolled: 0, sold: 0, reserved: 0, available: 0, occupancyPct: 0, paidPct: 0, capacityNotSet: 0 }; groups.set(key, g); }
    return g;
  };

  for (const c of (data as any[]) ?? []) {
    const tpl = Array.isArray(c.camp_templates) ? c.camp_templates[0] : c.camp_templates;
    const cap = c.capacity_override ?? tpl?.capacity_max ?? 0;
    const parts = (c.camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active');
    const sold = parts.filter((p: any) => p.payment_status === 'paid').length;
    const enrolled = parts.length;

    let key: string, label: string;
    if (groupBy === 'template') {
      key = c.template_id || 'none';
      label = tpl?.template_name || 'Sin plantilla';
    } else if (groupBy === 'week') {
      key = weekOfDate(c.start_date);
      label = key;
    } else {
      const sk = tpl?.service_kind || 'other';
      key = sk;
      label = SERVICE_LABELS[sk] || 'Otro';
    }
    const g = ensure(key, label);
    g.services += 1;
    g.spots += cap;
    g.enrolled += enrolled;
    g.sold += sold;
    g.reserved += enrolled - sold;
    if (cap <= 0) g.capacityNotSet += 1;
  }

  const rows = Array.from(groups.values()).map((g) => {
    g.available = Math.max(0, g.spots - g.enrolled);
    g.occupancyPct = g.spots ? Math.round((g.enrolled / g.spots) * 100) : 0;
    g.paidPct = g.spots ? Math.round((g.sold / g.spots) * 100) : 0;
    return g;
  }).sort((a, b) => (groupBy === 'week' ? a.key.localeCompare(b.key) : b.enrolled - a.enrolled));

  const t = base.totals;
  for (const g of rows) {
    t.services += g.services; t.spots += g.spots; t.enrolled += g.enrolled;
    t.sold += g.sold; t.reserved += g.reserved; t.capacityNotSet += g.capacityNotSet;
  }
  t.available = Math.max(0, t.spots - t.enrolled);
  t.occupancyPct = t.spots ? Math.round((t.enrolled / t.spots) * 100) : 0;
  t.paidPct = t.spots ? Math.round((t.sold / t.spots) * 100) : 0;

  return { ok: true, from, to, groupBy, isPlatformAdmin: !!scope.isPlatformAdmin, rows, totals: t };
}
