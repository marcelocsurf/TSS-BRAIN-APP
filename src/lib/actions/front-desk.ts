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
  const allowed = ['support', 'manager'].includes((data as any).portal_category) || ['admin', 'coordinator', 'host'].includes((data as any).role);
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
    .in('camp_templates.service_kind', ['class', 'trip', 'surf_lesson'])
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

// Reservas de las últimas 48 h — para que recepción/host/coordinador vean de
// un vistazo QUIÉN acaba de reservar, por dónde entró y si ya pagó.
export async function getRecentBookings(token: string) {
  const who = await resolveDesk(token);
  if (!who?.academy_id) return [];
  const admin = createAdminClient();
  const since = new Date(Date.now() - 48 * 3600_000).toISOString();
  const { data } = await admin
    .from('camp_participants')
    .select('id, reserved_at, payment_status, amount_cents, sold_by, camp_instances:camp_instance_id!inner(academy_id, camp_name, start_date, scheduled_time), students(first_name, last_name), seller:sold_by(display_name)')
    .eq('camp_instances.academy_id', who.academy_id)
    .eq('enrollment_status', 'active')
    .gte('reserved_at', since)
    .order('reserved_at', { ascending: false })
    .limit(25);
  return (data ?? []).map((p: any) => {
    const st = Array.isArray(p.students) ? p.students[0] : p.students;
    const c = Array.isArray(p.camp_instances) ? p.camp_instances[0] : p.camp_instances;
    const seller = Array.isArray(p.seller) ? p.seller[0] : p.seller;
    return {
      id: p.id,
      name: [st?.first_name, st?.last_name].filter(Boolean).join(' '),
      class_name: c?.camp_name ?? '',
      when: p.reserved_at,
      paid: p.payment_status === 'paid',
      amount_cents: p.amount_cents,
      source: seller?.display_name ?? 'QR público',
    };
  });
}

// ── Transferencia de grupo (p. ej. Novice día 2 → Foundation) ──────
// El MISMO asiento se muda de servicio: el pago viaja con él, la bitácora
// ya es del alumno (student_id) así que lo sigue sola. Queda nota de
// trazabilidad y avisos a ambos coaches.

export async function getTransferTargets(token: string, participantId: string) {
  const who = await resolveDesk(token);
  if (!who?.academy_id) return [];
  const admin = createAdminClient();
  const { data: seat } = await admin
    .from('camp_participants')
    .select('id, student_id, camp_instances:camp_instance_id!inner(id, academy_id)')
    .eq('id', participantId).maybeSingle();
  const cur = seat ? (Array.isArray((seat as any).camp_instances) ? (seat as any).camp_instances[0] : (seat as any).camp_instances) : null;
  if (!cur || cur.academy_id !== who.academy_id) return [];

  const today = new Date().toISOString().slice(0, 10);
  const { data } = await admin
    .from('camp_instances')
    .select('id, camp_name, start_date, end_date, scheduled_time, capacity_override, camp_templates:template_id(template_name, service_kind, capacity_max, list_price_cents), camp_participants(enrollment_status, student_id)')
    .eq('academy_id', who.academy_id)
    .gte('end_date', today)
    .neq('status', 'cancelled')
    .neq('id', cur.id)
    .order('start_date')
    .limit(40);
  return (data ?? []).map((c: any) => {
    const tpl = Array.isArray(c.camp_templates) ? c.camp_templates[0] : c.camp_templates;
    const act = (c.camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active');
    const cap = c.capacity_override ?? tpl?.capacity_max ?? 0;
    return {
      id: c.id,
      name: (c.camp_name ?? tpl?.template_name ?? '').split(' · ')[0],
      kind: tpl?.service_kind ?? null,
      date: c.start_date,
      end_date: c.end_date,
      time: c.scheduled_time,
      left: cap > 0 ? cap - act.length : null,
      price_cents: tpl?.list_price_cents ?? null,
      already_in: act.some((p: any) => p.student_id === (seat as any).student_id),
    };
  }).filter((c: any) => (c.left == null || c.left > 0) && !c.already_in);
}

export async function deskTransferSeat(token: string, participantId: string, targetCampId: string): Promise<{ ok: boolean; error?: string }> {
  const who = await resolveDesk(token);
  if (!who?.academy_id) return { ok: false, error: 'No autorizado.' };
  const admin = createAdminClient();

  const { data: seat } = await admin
    .from('camp_participants')
    .select('id, student_id, payment_status, amount_cents, list_price_cents, notes, camp_instances:camp_instance_id!inner(id, academy_id, camp_name, coach_id, start_date), students(first_name, last_name)')
    .eq('id', participantId).maybeSingle();
  const cur = seat ? (Array.isArray((seat as any).camp_instances) ? (seat as any).camp_instances[0] : (seat as any).camp_instances) : null;
  if (!cur || cur.academy_id !== who.academy_id) return { ok: false, error: 'Reserva no encontrada.' };

  const { data: target } = await admin
    .from('camp_instances')
    .select('id, academy_id, camp_name, coach_id, capacity_override, status, camp_templates:template_id(template_name, capacity_max, list_price_cents), camp_participants(enrollment_status, student_id)')
    .eq('id', targetCampId).maybeSingle();
  if (!target || (target as any).academy_id !== who.academy_id || (target as any).status === 'cancelled') {
    return { ok: false, error: 'Servicio destino no disponible.' };
  }
  const tTpl = Array.isArray((target as any).camp_templates) ? (target as any).camp_templates[0] : (target as any).camp_templates;
  const tAct = ((target as any).camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active');
  const tCap = (target as any).capacity_override ?? tTpl?.capacity_max ?? 0;
  if (tCap > 0 && tAct.length >= tCap) return { ok: false, error: 'El grupo destino está lleno.' };
  if (tAct.some((p: any) => p.student_id === (seat as any).student_id)) return { ok: false, error: 'Ya está inscrito en ese grupo.' };

  const st = Array.isArray((seat as any).students) ? (seat as any).students[0] : (seat as any).students;
  const name = [st?.first_name, st?.last_name].filter(Boolean).join(' ');
  const fromName = (cur.camp_name ?? '').split(' · ')[0];
  const toName = ((target as any).camp_name ?? tTpl?.template_name ?? '').split(' · ')[0];
  const paid = (seat as any).payment_status === 'paid';
  const targetPrice = tTpl?.list_price_cents ?? null;
  const stamp = new Date().toISOString().slice(0, 10);

  // Precio: sin pagar → adopta el del destino. Pagado → se conserva y queda
  // nota de la diferencia para que el coordinador ajuste (cobrar o dejar).
  const priceDiff = paid && targetPrice != null && (seat as any).amount_cents != null && targetPrice !== (seat as any).amount_cents
    ? targetPrice - (seat as any).amount_cents : 0;
  const note = `Transferido ${fromName} → ${toName} (${stamp}, mostrador)` +
    (priceDiff !== 0 ? ` · dif. de precio ${priceDiff > 0 ? '+' : ''}$${(priceDiff / 100).toFixed(2)} — ajustar en recepción` : '');

  const { error } = await admin.from('camp_participants').update({
    camp_instance_id: targetCampId,
    notes: [(seat as any).notes, note].filter(Boolean).join(' | '),
    ...(!paid && targetPrice != null ? { amount_cents: targetPrice, list_price_cents: targetPrice } : {}),
  }).eq('id', participantId);
  if (error) return { ok: false, error: error.message };

  // Avisos: coach que lo pierde, coach que lo recibe, y coordinación.
  const notify = async (coachId: string | null, title: string, body: string) => {
    if (!coachId) return;
    const { createNotification } = await import('@/lib/actions/notifications');
    await createNotification({ recipientCoachId: coachId, type: 'group_transfer', title, body, link: `/students/${(seat as any).student_id}`, metadata: { participantId } }).catch(() => {});
  };
  await notify(cur.coach_id, `Transferencia: ${name} sale de tu grupo`, `${fromName} → ${toName}. Su bitácora queda en su perfil.`);
  await notify((target as any).coach_id, `Transferencia: ${name} entra a tu grupo`, `Viene de ${fromName} — revisá su perfil y bitácora antes de planear.`);
  const { data: coords } = await admin.from('coaches').select('id').eq('academy_id', who.academy_id).in('role', ['coordinator', 'admin']).eq('active_status', true);
  for (const c of coords ?? []) {
    if (c.id === cur.coach_id || c.id === (target as any).coach_id) continue;
    await notify(c.id, `Transferencia de grupo: ${name}`, `${fromName} → ${toName}${priceDiff !== 0 ? ` · dif. $${(priceDiff / 100).toFixed(2)} por ajustar` : ''}. Pago ${paid ? 'ya realizado' : 'pendiente en recepción'}.`);
  }
  return { ok: true };
}
