'use server';

import { createAdminClient } from '@/lib/supabase/admin';

// MANAGER PORTAL (M144) — read-only executive view for ONE academy, accessed
// by portal_token of a coaches row with portal_category='manager'. The manager
// sees sales/occupancy, the programmed calendar, incidents, inventory alerts
// and requisitions — never other academies' data.

export interface PeriodStats {
  label: string;
  services: number;
  spots: number;
  sold: number;
  reserved: number;
  available: number;
  occupancyPct: number;
  collectedCents: number;
  reservedCents: number;
}

export interface ManagerPortalData {
  manager: { display_name: string; photo_url: string | null };
  academy: { name: string | null; logo_url: string | null };
  kpis: { students: number; coaches: number; closes7d: number; incidents30d: number };
  periods: { month: PeriodStats; year: PeriodStats; total: PeriodStats };
  monthlyTargetCents: number | null;
  upcoming: Array<{
    id: string; camp_name: string; start_date: string; end_date: string | null;
    scheduled_time: string | null; coach_name: string | null; enrolled: number; capacity: number;
    status: string;
  }>;
  incidents: Array<{ id: string; incident_type: string; description: string; student_name: string | null; coach_name: string | null; created_at: string }>;
  lowStock: Array<{ name: string; unit: string | null; qty_in_stock: number; minimum: number }>;
  requisitions: Array<{ id: string; status: string; itemCount: number; created_at: string; created_by_name: string | null }>;
}

function periodBounds(p: 'month' | 'year'): { start: string; end: string } {
  const now = new Date(Date.now() - 6 * 3600000); // ES local
  const y = now.getUTCFullYear();
  if (p === 'year') return { start: `${y}-01-01`, end: `${y}-12-31` };
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const last = new Date(Date.UTC(y, now.getUTCMonth() + 1, 0)).getUTCDate();
  return { start: `${y}-${m}-01`, end: `${y}-${m}-${String(last).padStart(2, '0')}` };
}

export async function getManagerPortalData(token: string): Promise<ManagerPortalData | null> {
  const admin = createAdminClient();

  const { data: manager } = await admin
    .from('coaches')
    .select('id, display_name, photo_url, academy_id, portal_category, active_status')
    .eq('portal_token', token)
    .maybeSingle();
  if (!manager || manager.portal_category !== 'manager' || manager.active_status === false || !manager.academy_id) {
    return null;
  }
  const academyId = manager.academy_id as string;

  const today = new Date(Date.now() - 6 * 3600000).toISOString().slice(0, 10);
  const in14 = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const since30 = new Date(Date.now() - 30 * 86400000).toISOString();
  const since7 = new Date(Date.now() - 7 * 86400000).toISOString();

  const [
    { data: academy },
    { count: students },
    { count: coaches },
    { data: camps },
    { data: incidents },
    { data: invItems },
    reqsRes,
    closesRes,
  ] = await Promise.all([
    admin.from('academies').select('name, logo_url, monthly_sales_target_cents').eq('id', academyId).maybeSingle()
      .then(async (r) => {
        if (!r.error) return r;
        // pre-migration: target column missing — retry without it
        return admin.from('academies').select('name, logo_url').eq('id', academyId).maybeSingle();
      }),
    admin.from('students').select('*', { count: 'exact', head: true }).eq('academy_id', academyId).eq('status', 'active'),
    admin.from('coaches').select('*', { count: 'exact', head: true }).eq('academy_id', academyId).eq('active_status', true).neq('portal_category', 'manager'),
    admin
      .from('camp_instances')
      .select('id, camp_name, start_date, end_date, status, scheduled_time, capacity_override, camp_templates:template_id(capacity_max), head_coach:head_coach_id(display_name), camp_participants(enrollment_status, payment_status, amount_cents)')
      .eq('academy_id', academyId)
      .neq('status', 'cancelled'),
    admin
      .from('session_incidents')
      .select('id, incident_type, description, student_name, created_at, coaches:coach_id(display_name)')
      .eq('academy_id', academyId)
      .gte('created_at', since30)
      .order('created_at', { ascending: false })
      .limit(15),
    admin
      .from('academy_inventory_items')
      .select('name, unit, qty_in_stock, minimum')
      .eq('academy_id', academyId)
      .eq('active', true)
      .not('minimum', 'is', null),
    admin
      .from('inventory_requisitions')
      .select('id, status, items, created_at, created_by_name')
      .eq('academy_id', academyId)
      .in('status', ['open', 'ordered'])
      .order('created_at', { ascending: false })
      .limit(10)
      .then((r) => (r.error ? { data: [] as any[] } : r)),
    admin
      .from('student_session_results')
      .select('id, students:student_id!inner(academy_id)', { count: 'exact', head: true })
      .eq('completion_state', 'closed')
      .eq('students.academy_id', academyId)
      .gte('created_at', since7)
      .then((r) => (r.error ? { count: 0 } : r)),
  ]);

  // ── Occupancy per period, from the full camp list ──
  const statsFor = (label: string, filter: (c: any) => boolean): PeriodStats => {
    let services = 0, spots = 0, sold = 0, reserved = 0, collected = 0, reservedC = 0;
    for (const c of camps ?? []) {
      if (!filter(c)) continue;
      services += 1;
      const tpl = Array.isArray(c.camp_templates) ? c.camp_templates[0] : c.camp_templates;
      spots += c.capacity_override ?? tpl?.capacity_max ?? 4;
      for (const p of (c.camp_participants ?? []).filter((x: any) => x.enrollment_status === 'active')) {
        if (p.payment_status === 'paid') { sold += 1; collected += p.amount_cents ?? 0; }
        else { reserved += 1; reservedC += p.amount_cents ?? 0; }
      }
    }
    const enrolled = sold + reserved;
    return {
      label, services, spots, sold, reserved,
      available: Math.max(0, spots - enrolled),
      occupancyPct: spots ? Math.round((enrolled / spots) * 100) : 0,
      collectedCents: collected, reservedCents: reservedC,
    };
  };
  const mb = periodBounds('month');
  const yb = periodBounds('year');
  const periods = {
    month: statsFor('Este mes', (c) => c.start_date >= mb.start && c.start_date <= mb.end),
    year: statsFor('Este año', (c) => c.start_date >= yb.start && c.start_date <= yb.end),
    total: statsFor('Histórico', () => true),
  };

  // ── Programmed calendar: next 14 days ──
  const upcoming = (camps ?? [])
    .filter((c: any) => (c.end_date ?? c.start_date) >= today && c.start_date <= in14)
    .sort((a: any, b: any) => a.start_date.localeCompare(b.start_date))
    .map((c: any) => {
      const tpl = Array.isArray(c.camp_templates) ? c.camp_templates[0] : c.camp_templates;
      const hc = Array.isArray(c.head_coach) ? c.head_coach[0] : c.head_coach;
      return {
        id: c.id,
        camp_name: c.camp_name,
        start_date: c.start_date,
        end_date: c.end_date ?? null,
        scheduled_time: c.scheduled_time ?? null,
        coach_name: hc?.display_name ?? null,
        enrolled: (c.camp_participants ?? []).filter((x: any) => x.enrollment_status === 'active').length,
        capacity: c.capacity_override ?? tpl?.capacity_max ?? 4,
        status: c.status,
      };
    });

  const lowStock = (invItems ?? [])
    .filter((i: any) => i.minimum != null && (i.qty_in_stock ?? 0) < i.minimum)
    .map((i: any) => ({ name: i.name, unit: i.unit ?? null, qty_in_stock: i.qty_in_stock ?? 0, minimum: i.minimum }))
    .sort((a: any, b: any) => (a.qty_in_stock - a.minimum) - (b.qty_in_stock - b.minimum));

  return {
    manager: { display_name: manager.display_name, photo_url: manager.photo_url ?? null },
    academy: { name: (academy as any)?.name ?? null, logo_url: (academy as any)?.logo_url ?? null },
    kpis: {
      students: students ?? 0,
      coaches: coaches ?? 0,
      closes7d: (closesRes as any)?.count ?? 0,
      incidents30d: (incidents ?? []).length,
    },
    periods,
    monthlyTargetCents: (academy as any)?.monthly_sales_target_cents ?? null,
    upcoming,
    incidents: (incidents ?? []).map((i: any) => ({
      id: i.id,
      incident_type: i.incident_type,
      description: i.description,
      student_name: i.student_name ?? null,
      coach_name: (Array.isArray(i.coaches) ? i.coaches[0] : i.coaches)?.display_name ?? null,
      created_at: i.created_at,
    })),
    lowStock,
    requisitions: ((reqsRes as any).data ?? []).map((r: any) => ({
      id: r.id,
      status: r.status,
      itemCount: Array.isArray(r.items) ? r.items.length : 0,
      created_at: r.created_at,
      created_by_name: r.created_by_name ?? null,
    })),
  };
}
