'use server';

// ═══ PAGOS AL EQUIPO (nómina) ═══
// Regla de Marcelo (2026-07-31): una sesión SIN CIERRE no es pagable.
// El pago por día sale de la matriz coach_pay_rates (nivel del servicio ×
// tamaño real del grupo). "Marcar pagado" deja historial en coach_payments.

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach, isCoordinatorOrAbove } from '@/lib/actions/auth';
import { createNotification } from '@/lib/actions/notifications';

export interface PayrollDay {
  session_id: string;
  camp_id: string;
  date: string;
  service: string;
  level: string | null;
  kind: string | null;
  students: number;
  closed: boolean;
  rate_cents: number | null;   // null = falta tarifa en la matriz
  role: 'coach' | 'assistant' | 'filmer';
}

export interface PayrollPerson {
  person_key: string;          // coach:<id> | staff:<id>
  coach_id: string | null;
  staff_member_id: string | null;
  is_coach: boolean;
  roles: string[];             // Coach / Asistente / Filmer (los que jugó esta semana)
  name: string;
  cert: string | null;
  days: PayrollDay[];
  payable_cents: number;       // cerradas con tarifa
  held_cents: number;          // sin cierre (retenido)
  missing_rate: boolean;       // alguna sesión sin tarifa
  paid_cents: number;          // ya emitido para este período
  open_count: number;
}

async function requireCoordinator() {
  const me = await getCurrentCoach().catch(() => null);
  if (!me || !(await isCoordinatorOrAbove(me.role))) throw new Error('Solo coordinador o admin.');
  return me;
}

// Tarifa: preferir la fila de la academia; si no, la global. Si el tamaño
// exacto no existe, usar el mayor tamaño ≤ alumnos (y si ni eso, la menor).
function rateFor(rates: any[], academyId: string, level: string | null, students: number): number | null {
  if (!level) return null;
  const pool = rates.filter((r) => r.level_name === level);
  if (!pool.length) return null;
  const scoped = (size: number) => {
    const rows = pool.filter((r) => r.group_size === size);
    if (!rows.length) return null;
    const own = rows.find((r) => r.academy_id === academyId);
    return (own ?? rows[0]).per_day_cents as number;
  };
  const exact = scoped(Math.max(students, 1));
  if (exact != null) return exact;
  const sizes = [...new Set(pool.map((r) => r.group_size))].sort((a, b) => a - b);
  const below = sizes.filter((s) => s <= students).pop();
  return scoped(below ?? sizes[0]);
}

export async function getPayrollWeek(weekStartISO: string): Promise<{
  people: PayrollPerson[];
  duplicates: { level: string; size: number; values: string[] }[];
  week_start: string;
  week_end: string;
}> {
  const me = await requireCoordinator();
  const admin = createAdminClient();
  const academyId = (me as any).academy_id;
  const end = new Date(weekStartISO + 'T00:00:00');
  end.setDate(end.getDate() + 6);
  const weekEnd = end.toISOString().slice(0, 10);

  const [{ data: sessions }, { data: rates }, { data: payments }, { data: staffRates }] = await Promise.all([
    admin.from('camp_sessions')
      .select(`id, session_date, session_status, camp_instances:camp_instance_id!inner(
        id, academy_id, camp_name, coach_id, head_coach_id, head_coach_status, status,
        camp_templates:template_id(level_name, service_kind, template_name),
        camp_participants(enrollment_status),
        coaches:coach_id(id, display_name, certification_level),
        hc:head_coach_id(id, display_name, certification_level)
      )`)
      .gte('session_date', weekStartISO)
      .lte('session_date', weekEnd),
    admin.from('coach_pay_rates').select('*'),
    (academyId
      ? admin.from('coach_payments').select('coach_id, staff_member_id, amount_cents')
          .eq('academy_id', academyId).eq('period_start', weekStartISO).eq('period_end', weekEnd)
      : admin.from('coach_payments').select('coach_id, staff_member_id, amount_cents')
          .eq('period_start', weekStartISO).eq('period_end', weekEnd)),
    admin.from('cost_rates').select('name, driver, amount_cents, academy_id, active')
      .in('driver', ['per_assistant_per_day', 'per_filmer_per_day']),
  ]);

  // Tarifa de staff por rol (asistente/filmer): preferir la de ESA academia.
  const staffRate = (driver: string, acId: string | null): number | null => {
    const rows = ((staffRates as any[]) ?? []).filter((r) => r.driver === driver && r.active !== false);
    if (!rows.length) return null;
    return (rows.find((r) => r.academy_id === acId) ?? rows[0]).amount_cents;
  };

  // Staff aceptado por servicio (asistentes / filmers) — cobran por día
  // trabajado, con el MISMO candado: el día paga cuando la sesión cierra.
  const instIds = [...new Set(((sessions as any[]) ?? []).map((s: any) => {
    const i = Array.isArray(s.camp_instances) ? s.camp_instances[0] : s.camp_instances;
    return i?.id;
  }).filter(Boolean))];
  const { data: staffRows } = instIds.length
    ? await admin.from('service_staff')
        .select('camp_instance_id, role, status, coaches:coach_id(id, display_name, certification_level), staff_members:staff_member_id(id, name)')
        .in('camp_instance_id', instIds)
        .eq('status', 'accepted')
    : { data: [] as any[] };
  const staffByInstance = new Map<string, any[]>();
  for (const r of (staffRows as any[]) ?? []) {
    staffByInstance.set(r.camp_instance_id, [...(staffByInstance.get(r.camp_instance_id) ?? []), r]);
  }

  const byPerson = new Map<string, PayrollPerson>();
  const ensure = (key: string, name: string, cert: string | null, coachId: string | null, staffId: string | null): PayrollPerson => {
    const found = byPerson.get(key);
    if (found) return found;
    const fresh: PayrollPerson = {
      person_key: key, coach_id: coachId, staff_member_id: staffId, is_coach: !!coachId, roles: [],
      name, cert, days: [], payable_cents: 0, held_cents: 0, missing_rate: false, paid_cents: 0, open_count: 0,
    };
    byPerson.set(key, fresh);
    return fresh;
  };
  const addDay = (p: PayrollPerson, day: PayrollDay, roleLabel: string) => {
    p.days.push(day);
    if (!p.roles.includes(roleLabel)) p.roles.push(roleLabel);
    if (day.rate_cents == null) p.missing_rate = true;
    else if (day.closed) p.payable_cents += day.rate_cents;
    else p.held_cents += day.rate_cents;
    if (!day.closed) p.open_count++;
  };

  for (const s of (sessions as any[]) ?? []) {
    const inst = Array.isArray(s.camp_instances) ? s.camp_instances[0] : s.camp_instances;
    // Platform admin (academy_id null) ve TODAS las academias.
    if (!inst || (academyId && inst.academy_id !== academyId) || inst.status === 'cancelled') continue;
    const tpl = Array.isArray(inst.camp_templates) ? inst.camp_templates[0] : inst.camp_templates;
    const students = (inst.camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active').length;
    const level = tpl?.level_name ?? null;
    const closed = s.session_status === 'completed';
    const service = (inst.camp_name ?? tpl?.template_name ?? '').split(' · ')[0];
    const base = { session_id: s.id, camp_id: inst.id, date: s.session_date, service, level, kind: tpl?.service_kind ?? null, students, closed };

    // 1) Responsable del día: head coach ACEPTADO (flujo moderno) o coach_id
    const hcRow = Array.isArray(inst.hc) ? inst.hc[0] : inst.hc;
    const useHead = inst.head_coach_id && inst.head_coach_status === 'accepted';
    const respId = useHead ? inst.head_coach_id : inst.coach_id;
    const respCoach = useHead ? hcRow : (Array.isArray(inst.coaches) ? inst.coaches[0] : inst.coaches);
    if (respId) {
      const p = ensure(`coach:${respId}`, respCoach?.display_name ?? '—', respCoach?.certification_level ?? null, respId, null);
      addDay(p, { ...base, rate_cents: rateFor((rates as any[]) ?? [], inst.academy_id, level, students), role: 'coach' }, 'Coach');
    }

    // 2) Staff aceptado del servicio — tarifa por rol del catálogo
    for (const st of staffByInstance.get(inst.id) ?? []) {
      const isFilmer = /film|foto|cam/i.test(st.role ?? '');
      const rate = staffRate(isFilmer ? 'per_filmer_per_day' : 'per_assistant_per_day', inst.academy_id);
      const c = Array.isArray(st.coaches) ? st.coaches[0] : st.coaches;
      const m = Array.isArray(st.staff_members) ? st.staff_members[0] : st.staff_members;
      if (c?.id) {
        const p = ensure(`coach:${c.id}`, c.display_name ?? '—', c.certification_level ?? null, c.id, null);
        addDay(p, { ...base, rate_cents: rate, role: isFilmer ? 'filmer' : 'assistant' }, isFilmer ? 'Filmer' : 'Asistente');
      } else if (m?.id) {
        const p = ensure(`staff:${m.id}`, m.name ?? '—', null, null, m.id);
        addDay(p, { ...base, rate_cents: rate, role: isFilmer ? 'filmer' : 'assistant' }, isFilmer ? 'Filmer' : 'Asistente');
      }
    }
  }

  for (const pay of (payments as any[]) ?? []) {
    const p = byPerson.get(pay.coach_id ? `coach:${pay.coach_id}` : `staff:${pay.staff_member_id}`);
    if (p) p.paid_cents += pay.amount_cents;
  }

  // Tarifas duplicadas (limpieza pendiente del catálogo): mismo nivel+tamaño
  // con montos distintos — reportarlas para que Marcelo decida cuál vale.
  const dupMap = new Map<string, Set<number>>();
  for (const r of (rates as any[]) ?? []) {
    const k = `${r.level_name}|${r.group_size}`;
    dupMap.set(k, (dupMap.get(k) ?? new Set()).add(r.per_day_cents));
  }
  const duplicates = [...dupMap.entries()]
    .filter(([, v]) => v.size > 1)
    .map(([k, v]) => {
      const [level, size] = k.split('|');
      return { level, size: Number(size), values: [...v].map((c) => `$${(c / 100).toFixed(0)}`) };
    });

  const people = [...byPerson.values()].sort((a, b) => (b.held_cents + b.payable_cents) - (a.held_cents + a.payable_cents));
  people.forEach((p) => p.days.sort((a, b) => a.date.localeCompare(b.date)));
  return { people, duplicates, week_start: weekStartISO, week_end: weekEnd };
}

// Recordarle al coach que cierre — el cierre es requisito para emitir pago.
export async function remindClosures(coachId: string, dates: string[]): Promise<{ ok: boolean }> {
  await requireCoordinator();
  await createNotification({
    recipientCoachId: coachId,
    type: 'closure_reminder',
    title: 'Cerrá tus sesiones para emitir tu pago 💵',
    body: `Tenés ${dates.length} sesión(es) sin cierre (${dates.join(', ')}). El cierre es requisito para procesar el pago de la semana.`,
    link: null,
    metadata: { dates },
  }).catch(() => {});
  return { ok: true };
}

// Emitir el pago del período: SOLO las sesiones cerradas con tarifa.
export async function markWeekPaid(input: {
  coachId?: string | null;
  staffMemberId?: string | null;
  weekStart: string;
  weekEnd: string;
  amountCents: number;
  sessionIds: string[];
  method?: string | null;
  note?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const me = await requireCoordinator();
  if (input.amountCents <= 0) return { ok: false, error: 'Nada pagable en este período.' };
  const admin = createAdminClient();
  if (!input.coachId && !input.staffMemberId) return { ok: false, error: 'Persona inválida.' };
  const { error } = await admin.from('coach_payments').insert({
    academy_id: (me as any).academy_id,
    coach_id: input.coachId ?? null,
    staff_member_id: input.staffMemberId ?? null,
    period_start: input.weekStart,
    period_end: input.weekEnd,
    amount_cents: input.amountCents,
    session_ids: input.sessionIds,
    method: input.method ?? 'manual',
    note: input.note ?? null,
    created_by: (me as any).id ?? null,
  });
  if (error) return { ok: false, error: error.message };
  if (input.coachId) await createNotification({
    recipientCoachId: input.coachId,
    type: 'payment_issued',
    title: `Pago emitido: $${(input.amountCents / 100).toFixed(2)} 🌊`,
    body: `Semana ${input.weekStart} → ${input.weekEnd} · ${input.sessionIds.length} sesión(es) cerradas.`,
    link: null,
    metadata: { weekStart: input.weekStart },
  }).catch(() => {});
  return { ok: true };
}

// Historial de pagos de una persona (control por persona).
export async function getCoachPaymentHistory(personKey: string) {
  await requireCoordinator();
  const admin = createAdminClient();
  const [kind, id] = personKey.split(':');
  const { data } = await admin.from('coach_payments')
    .select('id, period_start, period_end, amount_cents, method, note, created_at')
    .eq(kind === 'staff' ? 'staff_member_id' : 'coach_id', id)
    .order('period_start', { ascending: false })
    .limit(26);
  return data ?? [];
}
