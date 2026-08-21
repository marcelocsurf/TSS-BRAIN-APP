'use server';

// Platform "control tower" — the admin's per-academy vision of everything
// happening: what runs today, where incidents come from, what needs action.
// Read-only aggregation over existing tables; every block is guarded so one
// broken query never blanks the dashboard.

import { createAdminClient } from '@/lib/supabase/admin';
import { elSalvadorToday } from '@/lib/utils/tz';
import { getCurrentCoach } from '@/lib/actions/auth';

export interface AcademyPulse {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  studentsActive: number;
  servicesToday: Array<{ id: string; camp_name: string; scheduled_time: string | null; head_coach_name: string | null }>;
  unreadIncidents: number;
  recentIncidents: Array<{ type: string | null; description: string | null; when: string }>;
  pendingPromotions: number;
  overdueTasks: number;
  weekSessionsClosed: number;
  weekNewStudents: number;
}

export interface PlatformOverviewData {
  totals: {
    studentsActive: number;
    servicesToday: number;
    unreadIncidents: number;
    pendingPromotions: number;
    salesThisMonth: { count: number; cents: number };
    /** Experiencia del camp (últimos 30 días): score 1-5 + NPS. */
    experience30d: { score: number | null; nps: number | null; n: number };
  };
  academies: AcademyPulse[];
}

export async function getPlatformOverview(): Promise<PlatformOverviewData | null> {
  const me = await getCurrentCoach().catch(() => null);
  if (!me || ((me as any).role !== 'admin' && !(me as any).is_platform_admin)) return null;

  const admin = createAdminClient();
  const today = elSalvadorToday();
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const monthStart = today.slice(0, 8) + '01';

  const { data: academies } = await admin
    .from('academies')
    .select('id, name, slug, logo_url')
    .is('archived_at', null)
    .order('name');

  const pulses: AcademyPulse[] = [];
  for (const a of academies ?? []) {
    const pulse: AcademyPulse = {
      id: a.id, name: a.name, slug: a.slug, logo_url: a.logo_url ?? null,
      studentsActive: 0, servicesToday: [], unreadIncidents: 0, recentIncidents: [],
      pendingPromotions: 0, overdueTasks: 0, weekSessionsClosed: 0, weekNewStudents: 0,
    };

    try {
      const { count } = await admin
        .from('students')
        .select('id', { count: 'exact', head: true })
        .eq('academy_id', a.id)
        .eq('status', 'active');
      pulse.studentsActive = count ?? 0;
    } catch { /* soft */ }

    try {
      const { data: svcs } = await admin
        .from('camp_instances')
        .select('id, camp_name, scheduled_time, head_coach:head_coach_id(display_name)')
        .eq('academy_id', a.id)
        .lte('start_date', today)
        .gte('end_date', today)
        .not('status', 'in', '("completed","cancelled")')
        .limit(6);
      pulse.servicesToday = (svcs ?? []).map((s: any) => {
        const hc = Array.isArray(s.head_coach) ? s.head_coach[0] : s.head_coach;
        return { id: s.id, camp_name: s.camp_name, scheduled_time: s.scheduled_time ?? null, head_coach_name: hc?.display_name ?? null };
      });
    } catch { /* soft */ }

    try {
      const { data: inc } = await admin
        .from('session_incidents')
        .select('incident_type, description, created_at, acknowledged_at')
        .eq('academy_id', a.id)
        .order('created_at', { ascending: false })
        .limit(5);
      pulse.unreadIncidents = (inc ?? []).filter((i: any) => !i.acknowledged_at).length;
      pulse.recentIncidents = (inc ?? []).slice(0, 3).map((i: any) => ({
        type: i.incident_type ?? null,
        description: i.description ?? null,
        when: i.created_at,
      }));
    } catch { /* soft — table shape differs; incidents panel still covers it */ }

    try {
      const { data: pend } = await admin
        .from('belt_promotion_recommendations')
        .select('id, camp_instance_id, camp_instances!inner(academy_id)')
        .eq('status', 'pending')
        .eq('camp_instances.academy_id', a.id);
      pulse.pendingPromotions = (pend ?? []).length;
    } catch { /* soft */ }

    try {
      const { count } = await admin
        .from('academy_tasks')
        .select('id', { count: 'exact', head: true })
        .eq('academy_id', a.id)
        .eq('status', 'open')
        .not('due_date', 'is', null)
        .lt('due_date', today);
      pulse.overdueTasks = count ?? 0;
    } catch { /* soft */ }

    try {
      const { count } = await admin
        .from('camp_sessions')
        .select('id, camp_instances!inner(academy_id)', { count: 'exact', head: true })
        .eq('camp_instances.academy_id', a.id)
        .eq('session_status', 'completed')
        .gte('session_date', weekAgo.slice(0, 10));
      pulse.weekSessionsClosed = count ?? 0;
    } catch { /* soft */ }

    try {
      const { count } = await admin
        .from('students')
        .select('id', { count: 'exact', head: true })
        .eq('academy_id', a.id)
        .gte('created_at', weekAgo);
      pulse.weekNewStudents = count ?? 0;
    } catch { /* soft */ }

    pulses.push(pulse);
  }

  // ── Platform totals ──────────────────────────────────────────
  const totals = {
    studentsActive: pulses.reduce((n, p) => n + p.studentsActive, 0),
    servicesToday: pulses.reduce((n, p) => n + p.servicesToday.length, 0),
    unreadIncidents: pulses.reduce((n, p) => n + p.unreadIncidents, 0),
    pendingPromotions: pulses.reduce((n, p) => n + p.pendingPromotions, 0),
    salesThisMonth: { count: 0, cents: 0 },
    experience30d: { score: null as number | null, nps: null as number | null, n: 0 },
  };
  try {
    const { data: grants } = await admin
      .from('course_grants')
      .select('price_cents, billable, granted_at, revoked_at')
      .gte('granted_at', monthStart)
      .is('revoked_at', null);
    const billable = (grants ?? []).filter((g: any) => g.billable !== false);
    totals.salesThisMonth.count = billable.length;
    totals.salesThisMonth.cents = billable.reduce((n: number, g: any) => n + (g.price_cents || 0), 0);
  } catch { /* soft */ }

  // Score de experiencia del camp (30 días) — el "cómo nos está yendo" visible
  // desde el Home; el detalle vive en /reports/experiencia.
  try {
    const since30 = new Date(Date.now() - 30 * 86400000).toISOString();
    const { data: exp } = await admin
      .from('camp_experience_surveys')
      .select('facilities_rating, equipment_rating, transport_rating, communication_rating, value_rating, nps')
      .not('submitted_at', 'is', null)
      .gte('submitted_at', since30)
      .limit(1000);
    const rows = exp ?? [];
    const dimVals: number[] = [];
    for (const r of rows as any[]) {
      for (const c of ['facilities_rating', 'equipment_rating', 'transport_rating', 'communication_rating', 'value_rating']) {
        const v = r[c];
        if (typeof v === 'number' && v >= 1 && v <= 5) dimVals.push(v);
      }
    }
    const npsVals = (rows as any[]).map((r) => r.nps).filter((v) => typeof v === 'number' && v >= 0 && v <= 10);
    totals.experience30d = {
      score: dimVals.length ? Math.round((dimVals.reduce((a, b) => a + b, 0) / dimVals.length) * 10) / 10 : null,
      nps: npsVals.length
        ? Math.round(((npsVals.filter((v) => v >= 9).length - npsVals.filter((v) => v <= 6).length) / npsVals.length) * 100)
        : null,
      n: rows.length,
    };
  } catch { /* soft */ }

  return { totals, academies: pulses };
}
