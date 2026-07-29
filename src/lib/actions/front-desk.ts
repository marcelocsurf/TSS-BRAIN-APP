'use server';

// FRONT DESK view (M147): token-gated screen for reception. Shows today's
// (and upcoming) classes with every enrollee's settle state, and lets front
// desk mark seats paid (cash / card / transfer / room charge). The token is
// the coaches.portal_token of a 'support' or 'manager' team member, or any
// coordinator/admin.

import { createAdminClient } from '@/lib/supabase/admin';

async function resolveDesk(token: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from('coaches')
    .select('id, display_name, academy_id, role, portal_category, active_status')
    .eq('portal_token', token)
    .maybeSingle();
  if (!data || !data.active_status) return null;
  const allowed = ['support', 'manager'].includes((data as any).portal_category) || ['admin', 'coordinator'].includes((data as any).role);
  return allowed ? data : null;
}

export async function getFrontDeskData(token: string) {
  const who = await resolveDesk(token);
  if (!who?.academy_id) return null;
  const admin = createAdminClient();

  const today = new Date().toISOString().slice(0, 10);
  const horizon = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const { data } = await admin
    .from('camp_instances')
    .select('id, camp_name, start_date, scheduled_time, capacity_override, camp_templates:template_id!inner(template_name, service_kind, capacity_max, list_price_cents), coaches:coach_id(display_name), camp_participants(id, enrollment_status, payment_status, payment_method, amount_cents, sale_type, discount_reason, students(id, first_name, last_name, waiver_signed, phone))')
    .eq('academy_id', who.academy_id)
    .in('camp_templates.service_kind', ['class', 'trip'])
    .gte('start_date', today)
    .lte('start_date', horizon)
    .neq('status', 'cancelled')
    .order('start_date');

  const classes = (data ?? []).map((c: any) => {
    const tpl = Array.isArray(c.camp_templates) ? c.camp_templates[0] : c.camp_templates;
    const coach = Array.isArray(c.coaches) ? c.coaches[0] : c.coaches;
    const seats = (c.camp_participants ?? [])
      .filter((p: any) => p.enrollment_status === 'active')
      .map((p: any) => {
        const st = Array.isArray(p.students) ? p.students[0] : p.students;
        return {
          participant_id: p.id,
          name: `${st?.first_name ?? '?'} ${st?.last_name ?? ''}`.trim(),
          phone: st?.phone ?? null,
          waiver_signed: !!st?.waiver_signed,
          payment_status: p.payment_status,
          payment_method: p.payment_method,
          amount_cents: p.amount_cents,
          sale_type: p.sale_type,
          discount_reason: p.discount_reason,
        };
      });
    return {
      id: c.id,
      name: c.camp_name || tpl?.template_name,
      date: c.start_date,
      time: c.scheduled_time,
      coach: coach?.display_name ?? null,
      capacity: c.capacity_override ?? tpl?.capacity_max ?? 0,
      list_price_cents: tpl?.list_price_cents ?? null,
      seats,
    };
  });

  return { desk: { name: (who as any).display_name }, classes };
}

export async function frontDeskSettle(token: string, participantId: string, method: string): Promise<{ ok: boolean; error?: string }> {
  const who = await resolveDesk(token);
  if (!who?.academy_id) return { ok: false, error: 'Not authorized.' };
  const admin = createAdminClient();

  // The seat must belong to a class of THIS academy.
  const { data: seat } = await admin
    .from('camp_participants')
    .select('id, camp_instances:camp_instance_id!inner(academy_id, camp_templates:template_id(service_kind)), students(waiver_signed, first_name)')
    .eq('id', participantId)
    .maybeSingle();
  const inst = seat ? (Array.isArray((seat as any).camp_instances) ? (seat as any).camp_instances[0] : (seat as any).camp_instances) : null;
  if (!inst || inst.academy_id !== who.academy_id) return { ok: false, error: 'Seat not found.' };
  const st = Array.isArray((seat as any).students) ? (seat as any).students[0] : (seat as any).students;
  if (st && !st.waiver_signed) return { ok: false, error: `${st.first_name} has not signed the waiver yet — have them sign it first (QR or intake link).` };

  const { error } = await admin
    .from('camp_participants')
    .update({ payment_status: 'paid', paid_at: new Date().toISOString(), payment_method: method,
      ...((seat as any).amount_cents == null && (seat as any).list_price_cents != null ? { amount_cents: (seat as any).list_price_cents } : {}) })
    .eq('id', participantId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
