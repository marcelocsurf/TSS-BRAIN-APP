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
}

export interface PayrollPerson {
  coach_id: string;
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

  const [{ data: sessions }, { data: rates }, { data: payments }] = await Promise.all([
    admin.from('camp_sessions')
      .select(`id, session_date, session_status, camp_instances:camp_instance_id!inner(
        id, academy_id, camp_name, coach_id, status,
        camp_templates:template_id(level_name, service_kind, template_name),
        camp_participants(enrollment_status),
        coaches:coach_id(id, display_name, certification_level)
      )`)
      .gte('session_date', weekStartISO)
      .lte('session_date', weekEnd),
    admin.from('coach_pay_rates').select('*'),
    admin.from('coach_payments').select('coach_id, amount_cents')
      .eq('academy_id', academyId)
      .eq('period_start', weekStartISO)
      .eq('period_end', weekEnd),
  ]);

  const byCoach = new Map<string, PayrollPerson>();
  for (const s of (sessions as any[]) ?? []) {
    const inst = Array.isArray(s.camp_instances) ? s.camp_instances[0] : s.camp_instances;
    if (!inst || inst.academy_id !== academyId || inst.status === 'cancelled' || !inst.coach_id) continue;
    const coach = Array.isArray(inst.coaches) ? inst.coaches[0] : inst.coaches;
    const tpl = Array.isArray(inst.camp_templates) ? inst.camp_templates[0] : inst.camp_templates;
    const students = (inst.camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active').length;
    const level = tpl?.level_name ?? null;
    const rate = rateFor((rates as any[]) ?? [], academyId, level, students);
    const p: PayrollPerson = byCoach.get(inst.coach_id) ?? {
      coach_id: inst.coach_id,
      name: coach?.display_name ?? '—',
      cert: coach?.certification_level ?? null,
      days: [], payable_cents: 0, held_cents: 0, missing_rate: false, paid_cents: 0, open_count: 0,
    };
    const closed = s.session_status === 'completed';
    p.days.push({
      session_id: s.id, camp_id: inst.id, date: s.session_date,
      service: (inst.camp_name ?? tpl?.template_name ?? '').split(' · ')[0],
      level, kind: tpl?.service_kind ?? null, students, closed, rate_cents: rate,
    });
    if (rate == null) p.missing_rate = true;
    else if (closed) p.payable_cents += rate;
    else { p.held_cents += rate; }
    if (!closed) p.open_count++;
    byCoach.set(inst.coach_id, p);
  }

  for (const pay of (payments as any[]) ?? []) {
    const p = byCoach.get(pay.coach_id);
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

  const people = [...byCoach.values()].sort((a, b) => (b.held_cents + b.payable_cents) - (a.held_cents + a.payable_cents));
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
  coachId: string;
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
  const { error } = await admin.from('coach_payments').insert({
    academy_id: (me as any).academy_id,
    coach_id: input.coachId,
    period_start: input.weekStart,
    period_end: input.weekEnd,
    amount_cents: input.amountCents,
    session_ids: input.sessionIds,
    method: input.method ?? 'manual',
    note: input.note ?? null,
    created_by: (me as any).id ?? null,
  });
  if (error) return { ok: false, error: error.message };
  await createNotification({
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
export async function getCoachPaymentHistory(coachId: string) {
  await requireCoordinator();
  const admin = createAdminClient();
  const { data } = await admin.from('coach_payments')
    .select('id, period_start, period_end, amount_cents, method, note, created_at')
    .eq('coach_id', coachId)
    .order('period_start', { ascending: false })
    .limit(26);
  return data ?? [];
}
