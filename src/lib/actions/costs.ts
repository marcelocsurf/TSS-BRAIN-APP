'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/auth';
import { revalidatePath } from 'next/cache';

// COST ENGINE F1 (M145) — real camp cost from real drivers.
// Freelance model: every cost is event-driven (per student, per day, per
// accepted assistant, per transport day…). Coach pay comes from the academy's
// level × group-size matrix (Tabla_Pagos_Camp), paid per ENROLLED student.
// Visible to admin + coordinator (dashboard) and the manager portal (F3).

export type CostDriver =
  | 'per_student_flat'
  | 'per_student_per_day'
  | 'per_group_flat'
  | 'per_group_per_day'
  | 'transport_per_day'
  | 'per_assistant_per_day'
  | 'per_filmer_per_day';

export const DRIVER_LABEL: Record<CostDriver, string> = {
  per_student_flat: 'Per student · once',
  per_student_per_day: 'Per student · per day',
  per_group_flat: 'Per group · once',
  per_group_per_day: 'Per group · per day',
  transport_per_day: 'Per transport day',
  per_assistant_per_day: 'Per assistant · per day',
  per_filmer_per_day: 'Per filmer · per day',
};

export interface CostRate {
  id: string;
  name: string;
  category: string | null;
  driver: CostDriver;
  amount_cents: number;
  active: boolean;
  notes: string | null;
}
export interface CoachPayRate { level_name: string; group_size: number; per_day_cents: number }
export interface RecipeRow { cost_rate_id: string; enabled: boolean; override_cents: number | null }

async function assertStaff() {
  const me = await getCurrentCoach();
  if (!me || !['admin', 'coordinator'].includes(me.role)) throw new Error('Not authorized.');
  return me;
}

// ── Settings (catalog + matrix + templates + recipes) ─────────────
export async function getCostSettings() {
  const me = await assertStaff();
  const admin = createAdminClient();
  const academyId = me.academy_id ?? null;

  const rateQ = admin.from('cost_rates').select('*').order('category').order('name');
  const matrixQ = admin.from('coach_pay_rates').select('level_name, group_size, per_day_cents').order('level_name').order('group_size');
  const tplQ = admin.from('camp_templates').select('id, template_name, level_name, service_kind, duration_days').eq('active', true).order('template_name')
    .then((r: any) => (r.error ? admin.from('camp_templates').select('id, template_name, level_name, service_kind, duration_days').order('template_name') : r));
  const recipeQ = admin.from('template_cost_items').select('template_id, cost_rate_id, enabled, override_cents');

  const [{ data: rates }, { data: matrix }, tplRes, { data: recipes }] = await Promise.all([
    academyId ? rateQ.eq('academy_id', academyId) : rateQ,
    academyId ? matrixQ.eq('academy_id', academyId) : matrixQ,
    tplQ,
    recipeQ,
  ]);

  // Official sale price per service (F2b) — separate query so a missing
  // column (pre-migration 00141) degrades to "no price" instead of failing.
  const priceMap = new Map<string, number | null>();
  try {
    const { data: prices } = await admin.from('camp_templates').select('id, list_price_cents');
    for (const r of prices ?? []) priceMap.set((r as any).id, (r as any).list_price_cents ?? null);
  } catch { /* column not there yet */ }

  const templates = (((tplRes as any).data ?? []) as Array<{ id: string; template_name: string; level_name: string | null; service_kind: string | null; duration_days: number | null }>)
    .map((t) => ({ ...t, list_price_cents: priceMap.get(t.id) ?? null }));

  return {
    rates: (rates ?? []) as CostRate[],
    matrix: (matrix ?? []) as CoachPayRate[],
    templates,
    recipes: (recipes ?? []) as Array<RecipeRow & { template_id: string }>,
  };
}

// Official sale price of a service — every enrolled seat defaults to this
// at full price; the seller only intervenes for discounts/courtesies.
export async function setTemplateListPrice(templateId: string, cents: number | null): Promise<{ ok: boolean; error?: string }> {
  await assertStaff();
  const admin = createAdminClient();
  const { error } = await admin.from('camp_templates')
    .update({ list_price_cents: cents == null ? null : Math.max(0, Math.round(cents)) })
    .eq('id', templateId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/costs');
  return { ok: true };
}

export async function upsertCostRate(input: {
  id?: string; name: string; category?: string | null; driver: CostDriver;
  amount_cents: number; active?: boolean; notes?: string | null;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const me = await assertStaff();
  const admin = createAdminClient();
  const row: any = {
    name: input.name.trim(),
    category: input.category ?? null,
    driver: input.driver,
    amount_cents: Math.max(0, Math.round(input.amount_cents)),
    active: input.active ?? true,
    notes: input.notes?.trim() || null,
    updated_at: new Date().toISOString(),
  };
  if (!row.name) return { ok: false, error: 'Name is required.' };
  if (input.id) {
    const { error } = await admin.from('cost_rates').update(row).eq('id', input.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath('/costs');
    return { ok: true, id: input.id };
  }
  const { data, error } = await admin.from('cost_rates').insert({ ...row, academy_id: me.academy_id ?? null }).select('id').single();
  if (error) return { ok: false, error: error.message };
  revalidatePath('/costs');
  return { ok: true, id: data.id };
}

export async function deleteCostRate(id: string): Promise<{ ok: boolean; error?: string }> {
  await assertStaff();
  const admin = createAdminClient();
  const { error } = await admin.from('cost_rates').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/costs');
  return { ok: true };
}

export async function saveCoachPayRate(level_name: string, group_size: number, per_day_cents: number): Promise<{ ok: boolean; error?: string }> {
  const me = await assertStaff();
  const admin = createAdminClient();
  const { error } = await admin.from('coach_pay_rates').upsert(
    { academy_id: me.academy_id ?? null, level_name, group_size, per_day_cents: Math.max(0, Math.round(per_day_cents)) },
    { onConflict: 'academy_id,level_name,group_size' },
  );
  if (error) return { ok: false, error: error.message };
  revalidatePath('/costs');
  return { ok: true };
}

export async function setTemplateCostItem(templateId: string, costRateId: string, enabled: boolean, overrideCents?: number | null): Promise<{ ok: boolean; error?: string }> {
  await assertStaff();
  const admin = createAdminClient();
  const { error } = await admin.from('template_cost_items').upsert(
    { template_id: templateId, cost_rate_id: costRateId, enabled, override_cents: overrideCents ?? null },
    { onConflict: 'template_id,cost_rate_id' },
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── The engine: estimated cost of one camp instance ───────────────
export interface CostLine { name: string; category: string | null; driver: string; unit_cents: number; qty: number; qty_label: string; total_cents: number; real_qty: number; real_qty_label: string; real_total_cents: number }
export interface CampCostBreakdown {
  students: number; days: number; transportDays: number; assistants: number; filmers: number;
  level: string | null;
  lines: CostLine[];
  coachLine: CostLine | null;
  totalCents: number;
  // Real delivery (F2): only CLOSED days count.
  deliveredDays: number;
  realTransportDays: number;
  realTotalCents: number;
  revenueCollectedCents: number;
  revenueCommittedCents: number;
  marginCents: number;
  marginPct: number | null;
  realMarginCents: number;
  saleMix: { full: number; discount: number; courtesy: number; unset: number };
  matrixMissing: boolean;
}

export async function getCampCostBreakdown(campInstanceId: string): Promise<CampCostBreakdown | null> {
  await assertStaff();
  const admin = createAdminClient();

  const { data: camp } = await admin
    .from('camp_instances')
    .select('id, academy_id, template_id, camp_templates:template_id(level_name), camp_participants(enrollment_status, payment_status, amount_cents)')
    .eq('id', campInstanceId)
    .maybeSingle();
  if (!camp) return null;
  const tpl: any = Array.isArray(camp.camp_templates) ? camp.camp_templates[0] : camp.camp_templates;
  // "Foundation 1" → "Foundation" so it matches the pay matrix.
  const level = tpl?.level_name ? String(tpl.level_name).split(' ')[0] : null;

  const [{ data: sessions }, { data: staff }, ratesRes, recipeRes, matrixRes] = await Promise.all([
    admin.from('camp_sessions').select('id').eq('camp_instance_id', campInstanceId),
    admin.from('service_staff').select('role, status').eq('camp_instance_id', campInstanceId).eq('status', 'accepted'),
    admin.from('cost_rates').select('*').eq('active', true).then((r: any) => r),
    admin.from('template_cost_items').select('cost_rate_id, enabled, override_cents').eq('template_id', camp.template_id ?? ''),
    admin.from('coach_pay_rates').select('level_name, group_size, per_day_cents'),
  ]);
  if ((ratesRes as any).error) return null; // pre-migration

  const sessIds = (sessions ?? []).map((s: any) => s.id);
  let transportDays = 0;
  let deliveredDays = 0;
  let realTransportDays = 0;
  if (sessIds.length) {
    const [{ count: t }, { count: d }, { count: rt }] = await Promise.all([
      admin.from('service_plans').select('*', { count: 'exact', head: true }).in('camp_session_id', sessIds).eq('transport_needed', true),
      admin.from('service_plans').select('*', { count: 'exact', head: true }).in('camp_session_id', sessIds).eq('completion_state', 'closed'),
      admin.from('service_plans').select('*', { count: 'exact', head: true }).in('camp_session_id', sessIds).eq('transport_needed', true).eq('completion_state', 'closed'),
    ]);
    transportDays = t ?? 0;
    deliveredDays = d ?? 0;
    realTransportDays = rt ?? 0;
  }

  const activeParts = (camp.camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active');
  const students = activeParts.length;
  const days = Math.max(1, sessIds.length);
  const assistants = (staff ?? []).filter((s: any) => !/photo|film/i.test(s.role ?? '')).length;
  const filmers = (staff ?? []).filter((s: any) => /photo|film/i.test(s.role ?? '')).length;

  // Recipe: explicit rows win; a template with NO rows uses every active rate.
  const recipeRows = ((recipeRes as any).data ?? []) as Array<{ cost_rate_id: string; enabled: boolean; override_cents: number | null }>;
  const hasRecipe = recipeRows.length > 0;
  const recipeMap = new Map(recipeRows.map((r) => [r.cost_rate_id, r]));
  const rates = (((ratesRes as any).data ?? []) as CostRate[]).filter((r) => {
    if (!hasRecipe) return true;
    const row = recipeMap.get(r.id);
    return row ? row.enabled : false;
  });

  // qty for a driver — estimated (all days, planned transport) or real
  // (closed days only; one-off items accrue once delivery started).
  const qtyFor = (driver: string, real: boolean): { qty: number; label: string } => {
    const d = real ? deliveredDays : days;
    const started = real ? deliveredDays > 0 : true;
    switch (driver) {
      case 'per_student_flat': return { qty: started ? students : 0, label: `${students} student${students === 1 ? '' : 's'}` };
      case 'per_student_per_day': return { qty: students * d, label: `${students} × ${d}d` };
      case 'per_group_flat': return { qty: started ? 1 : 0, label: 'once' };
      case 'per_group_per_day': return { qty: d, label: `${d}d` };
      case 'transport_per_day': {
        const td = real ? realTransportDays : transportDays;
        return { qty: td, label: `${td} transport day${td === 1 ? '' : 's'}` };
      }
      case 'per_assistant_per_day': return { qty: assistants * d, label: `${assistants} × ${d}d` };
      case 'per_filmer_per_day': return { qty: filmers * d, label: `${filmers} × ${d}d` };
      default: return { qty: 0, label: '—' };
    }
  };

  const lines: CostLine[] = rates.map((r) => {
    const override = recipeMap.get(r.id)?.override_cents ?? null;
    const unit = override ?? r.amount_cents;
    const { qty, label } = qtyFor(r.driver, false);
    const rq = qtyFor(r.driver, true);
    return {
      name: r.name, category: r.category, driver: r.driver, unit_cents: unit,
      qty, qty_label: label, total_cents: unit * qty,
      real_qty: rq.qty, real_qty_label: rq.label, real_total_cents: unit * rq.qty,
    };
  }).filter((l) => l.total_cents > 0);

  // Coach pay from the matrix — per enrolled student count, per day.
  const matrix = (((matrixRes as any).data ?? []) as CoachPayRate[]);
  let coachLine: CostLine | null = null;
  let matrixMissing = false;
  if (students > 0) {
    const size = Math.min(Math.max(students, 1), 6);
    const hit = level ? matrix.find((m) => m.level_name.toLowerCase() === level.toLowerCase() && m.group_size === size) : null;
    if (hit) {
      coachLine = {
        name: `Coach (${level} · ${size} student${size === 1 ? '' : 's'})`,
        category: 'coaching', driver: 'coach_matrix',
        unit_cents: hit.per_day_cents, qty: days, qty_label: `${days}d`,
        total_cents: hit.per_day_cents * days,
        real_qty: deliveredDays, real_qty_label: `${deliveredDays}d`,
        real_total_cents: hit.per_day_cents * deliveredDays,
      };
    } else {
      matrixMissing = true;
    }
  }

  const totalCents = lines.reduce((n, l) => n + l.total_cents, 0) + (coachLine?.total_cents ?? 0);
  const realTotalCents = lines.reduce((n, l) => n + l.real_total_cents, 0) + (coachLine?.real_total_cents ?? 0);
  let collected = 0, committed = 0;
  const saleMix = { full: 0, discount: 0, courtesy: 0, unset: 0 };
  for (const p of activeParts) {
    const amt = p.amount_cents ?? 0;
    committed += amt;
    if (p.payment_status === 'paid') collected += amt;
    const st = (p as any).sale_type as string | null;
    if (st === 'full') saleMix.full++;
    else if (st === 'discount') saleMix.discount++;
    else if (st === 'courtesy') saleMix.courtesy++;
    else saleMix.unset++;
  }
  const marginCents = committed - totalCents;

  return {
    students, days, transportDays, assistants, filmers, level,
    lines: [...(coachLine ? [coachLine] : []), ...lines],
    coachLine, totalCents,
    deliveredDays, realTransportDays, realTotalCents,
    revenueCollectedCents: collected,
    revenueCommittedCents: committed,
    marginCents,
    marginPct: committed > 0 ? Math.round((marginCents / committed) * 100) : null,
    realMarginCents: committed - realTotalCents,
    saleMix,
    matrixMissing,
  };
}
