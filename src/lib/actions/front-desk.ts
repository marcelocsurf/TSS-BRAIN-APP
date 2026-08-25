'use server';

// FRONT DESK view (M147): token-gated screen for reception. Shows today's
// (and upcoming) classes with every enrollee's settle state, and lets front
// desk mark seats paid (cash / card / transfer / room charge). The token is
// the coaches.portal_token of a 'support' or 'manager' team member, or any
// coordinator/admin.

import { createAdminClient } from '@/lib/supabase/admin';
import { campEnrollmentClosed, campClosedNoticeES, campDayProgress } from '@/lib/utils/camp-window';
import { elSalvadorToday } from '@/lib/utils/tz';

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

  const today = elSalvadorToday();
  const horizon = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const { data } = await admin
    .from('camp_instances')
    .select('id, camp_name, start_date, scheduled_time, capacity_override, head_coach_id, head_coach_status, camp_templates:template_id!inner(template_name, service_kind, capacity_max, list_price_cents), coaches:coach_id(display_name), hc:head_coach_id(display_name), camp_participants(id, enrollment_status, payment_status, payment_method, amount_cents, sale_type, discount_reason, room_number, notes, reserved_at, sold_by, seller:sold_by(display_name), students(id, first_name, last_name, waiver_signed, phone, email))')
    .eq('academy_id', who.academy_id)
    .in('camp_templates.service_kind', ['class', 'trip', 'surf_lesson', 'surf_camp'])
    // Visible mientras el servicio NO haya terminado: un camp de 6 días en
    // curso (día 2, 3…) debe seguir en el mostrador para cobrar/transferir.
    .gte('end_date', today)
    .lte('start_date', horizon)
    .neq('status', 'cancelled')
    .order('start_date');

  const classes = (data ?? []).map((c: any) => {
    const tpl = Array.isArray(c.camp_templates) ? c.camp_templates[0] : c.camp_templates;
    // Coach efectivo (invariante #1): head coach SOLO si aceptó la transferencia;
    // si está pendiente/rechazada sigue mandando el coach original.
    const useHead = (c as any).head_coach_id && (c as any).head_coach_status === 'accepted';
    const hcRow = Array.isArray((c as any).hc) ? (c as any).hc[0] : (c as any).hc;
    const coach = useHead ? hcRow : (Array.isArray(c.coaches) ? c.coaches[0] : c.coaches);
    const seats = (c.camp_participants ?? [])
      .filter((p: any) => p.enrollment_status === 'active')
      .map((p: any) => {
        const st = Array.isArray(p.students) ? p.students[0] : p.students;
        const seller = Array.isArray(p.seller) ? p.seller[0] : p.seller;
        return {
          participant_id: p.id,
          student_id: st?.id ?? null,
          name: `${st?.first_name ?? '?'} ${st?.last_name ?? ''}`.trim(),
          phone: st?.phone ?? null,
          email: st?.email ?? null,
          waiver_signed: !!st?.waiver_signed,
          payment_status: p.payment_status,
          payment_method: p.payment_method,
          amount_cents: p.amount_cents,
          sale_type: p.sale_type,
          discount_reason: p.discount_reason,
          // Trazabilidad del sign-up (pedido de Cony): habitación del huésped,
          // por dónde entró la reserva y las notas del asiento.
          room_number: p.room_number ?? null,
          notes: p.notes ?? null,
          reserved_at: p.reserved_at ?? null,
          booked_via: p.sold_by ? (seller?.display_name ?? 'Mostrador') : 'QR (auto-servicio)',
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

export async function frontDeskSettle(token: string, participantId: string, method: string): Promise<{ ok: boolean; error?: string; warning?: string }> {
  const who = await resolveDesk(token);
  if (!who?.academy_id) return { ok: false, error: 'Not authorized.' };
  const admin = createAdminClient();

  // The seat must belong to a class of THIS academy.
  const { data: seat } = await admin
    .from('camp_participants')
    .select('id, notes, amount_cents, list_price_cents, camp_instances:camp_instance_id!inner(academy_id, camp_templates:template_id(service_kind)), students(waiver_signed, first_name)')
    .eq('id', participantId)
    .maybeSingle();
  const inst = seat ? (Array.isArray((seat as any).camp_instances) ? (seat as any).camp_instances[0] : (seat as any).camp_instances) : null;
  if (!inst || inst.academy_id !== who.academy_id) return { ok: false, error: 'Seat not found.' };

  // El waiver frena la ENTRADA AL AGUA, no el dinero (reporte de Cony
  // 2026-08-10). Este candado venía del flujo del QR, donde el waiver siempre
  // se firma al reservar; con un walk-in que agrega el mostrador nunca está
  // firmado todavía, así que trababa el cobro: la persona ya estaba en la
  // clase, el cargo a la habitación no se podía registrar y quedaba en
  // "pendiente" sin salida. Ahora se cobra y el waiver queda como deuda
  // VISIBLE (chip "Waiver ✗" + nota auditada + aviso al cobrar).
  const st = Array.isArray((seat as any).students) ? (seat as any).students[0] : (seat as any).students;
  const noWaiver = !!st && !st.waiver_signed;
  const stamp = new Date().toISOString();

  const { error } = await admin
    .from('camp_participants')
    .update({
      payment_status: 'paid', paid_at: stamp, payment_method: method,
      ...((seat as any).amount_cents == null && (seat as any).list_price_cents != null ? { amount_cents: (seat as any).list_price_cents } : {}),
      ...(noWaiver ? {
        notes: [(seat as any).notes, `⚠ Cobrado SIN waiver firmado — ${who.display_name || 'mostrador'} ${stamp.slice(0, 16).replace('T', ' ')}. Pedir la firma antes de que entre al agua.`]
          .filter(Boolean).join(' · '),
      } : {}),
    })
    .eq('id', participantId);
  if (error) return { ok: false, error: error.message };
  return noWaiver
    ? { ok: true, warning: `Cobrado ✓ — pero ${st.first_name} todavía no firmó el waiver. Mandale el link antes de que entre al agua.` }
    : { ok: true };
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
    .select('id, student_id, camp_instances:camp_instance_id!inner(id, academy_id, start_date, end_date, scheduled_time)')
    .eq('id', participantId).maybeSingle();
  const cur = seat ? (Array.isArray((seat as any).camp_instances) ? (seat as any).camp_instances[0] : (seat as any).camp_instances) : null;
  if (!cur || cur.academy_id !== who.academy_id) return [];
  // Quien YA está dentro de un camp en curso no se está inscribiendo: se está
  // MUDANDO de grupo (el coach lo vio y es de otro nivel). Ese traslado
  // lateral entre los camps de la misma semana sí se permite. Quien viene de
  // una clase suelta o de un camp futuro, no — eso sería entrar a mitad.
  const movingInsideRunningCamp = campEnrollmentClosed(cur);

  const today = elSalvadorToday();
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
      full: cap > 0 && act.length >= cap,
      price_cents: tpl?.list_price_cents ?? null,
      already_in: act.some((p: any) => p.student_id === (seat as any).student_id),
      // Un camp arrancado solo se ofrece como destino cuando es un traslado
      // lateral; el mostrador lo ve etiquetado "en curso · día X de Y".
      closed: campEnrollmentClosed(c),
      day_progress: campDayProgress(c),
    };
  }).filter((c: any) => !c.already_in && (!c.closed || movingInsideRunningCamp));
}

// Ajuste de cobro desde el mostrador (pedido de Cony 2026-08-09): el host
// cubre al coordinador los fines de semana y necesita corregir el cobro de
// una reserva — p.ej. clase INCLUIDA en un paquete del hotel, cortesía, o un
// monto especial. Todo queda auditado en la nota del asiento. Fuera del
// alcance del host: precios de plantillas y nómina (solo coordinador/admin).
export async function deskAdjustSeatPayment(
  token: string,
  participantId: string,
  input: { kind: 'package' | 'courtesy' | 'custom'; amount_cents?: number; reason?: string },
): Promise<{ ok: boolean; error?: string }> {
  const who = await resolveDesk(token);
  if (!who?.academy_id) return { ok: false, error: 'Not authorized.' };
  const admin = createAdminClient();

  const { data: seat } = await admin
    .from('camp_participants')
    .select('id, notes, camp_instances:camp_instance_id!inner(academy_id)')
    .eq('id', participantId)
    .maybeSingle();
  const inst = seat ? (Array.isArray((seat as any).camp_instances) ? (seat as any).camp_instances[0] : (seat as any).camp_instances) : null;
  if (!inst || inst.academy_id !== who.academy_id) return { ok: false, error: 'Seat not found.' };

  const stamp = elSalvadorToday();
  let patch: Record<string, unknown>;
  let desc: string;
  if (input.kind === 'package') {
    desc = input.reason?.trim() || 'Incluido en paquete del hotel';
    patch = { amount_cents: 0, sale_type: 'courtesy', discount_reason: desc, payment_status: 'paid', payment_method: 'package' };
  } else if (input.kind === 'courtesy') {
    desc = input.reason?.trim() || 'Cortesía';
    patch = { amount_cents: 0, sale_type: 'courtesy', discount_reason: desc, payment_status: 'paid', payment_method: 'courtesy' };
  } else {
    const cents = Math.round(input.amount_cents ?? NaN);
    if (!Number.isFinite(cents) || cents < 0) return { ok: false, error: 'Monto inválido.' };
    desc = `${input.reason?.trim() || 'Monto ajustado'} → $${(cents / 100).toFixed(2)}`;
    patch = { amount_cents: cents, sale_type: 'discount', discount_reason: input.reason?.trim() || 'Ajuste de mostrador' };
  }

  const note = `Cobro ajustado (${desc}) — ${who.display_name || 'mostrador'} ${stamp}`;
  const { error } = await admin
    .from('camp_participants')
    .update({ ...patch, notes: [(seat as any).notes, note].filter(Boolean).join(' | ') })
    .eq('id', participantId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// Habitación del huésped en una reserva (pedido de Cony 2026-08-10). Se guarda
// en el asiento; el mostrador la usa para cobrar a la habitación y para saber
// quién es huésped al rastrear un sign-up.
export async function deskSetRoom(
  token: string,
  participantId: string,
  room: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const who = await resolveDesk(token);
  if (!who?.academy_id) return { ok: false, error: 'Not authorized.' };
  const admin = createAdminClient();

  const { data: seat } = await admin
    .from('camp_participants')
    .select('id, camp_instances:camp_instance_id!inner(academy_id)')
    .eq('id', participantId)
    .maybeSingle();
  const inst = seat ? (Array.isArray((seat as any).camp_instances) ? (seat as any).camp_instances[0] : (seat as any).camp_instances) : null;
  if (!inst || inst.academy_id !== who.academy_id) return { ok: false, error: 'Seat not found.' };

  const { error } = await admin
    .from('camp_participants')
    .update({ room_number: room?.trim() || null })
    .eq('id', participantId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deskTransferSeat(token: string, participantId: string, targetCampId: string): Promise<{ ok: boolean; error?: string }> {
  const who = await resolveDesk(token);
  if (!who?.academy_id) return { ok: false, error: 'No autorizado.' };
  const admin = createAdminClient();

  const { data: seat } = await admin
    .from('camp_participants')
    .select('id, student_id, payment_status, amount_cents, list_price_cents, notes, camp_instances:camp_instance_id!inner(id, academy_id, camp_name, coach_id, head_coach_id, head_coach_status, start_date, end_date, scheduled_time), students(first_name, last_name)')
    .eq('id', participantId).maybeSingle();
  const cur = seat ? (Array.isArray((seat as any).camp_instances) ? (seat as any).camp_instances[0] : (seat as any).camp_instances) : null;
  if (!cur || cur.academy_id !== who.academy_id) return { ok: false, error: 'Reserva no encontrada.' };

  const { data: target } = await admin
    .from('camp_instances')
    .select('id, academy_id, camp_name, start_date, end_date, scheduled_time, coach_id, head_coach_id, head_coach_status, capacity_override, status, camp_templates:template_id(template_name, capacity_max, list_price_cents), camp_participants(enrollment_status, student_id)')
    .eq('id', targetCampId).maybeSingle();
  if (!target || (target as any).academy_id !== who.academy_id || (target as any).status === 'cancelled') {
    return { ok: false, error: 'Servicio destino no disponible.' };
  }
  // Un camp arrancado no recibe gente NUEVA. Pero mover a alguien que ya
  // viene surfeando desde el día 1 al grupo de su nivel real es una MUDANZA,
  // no una inscripción — y es justo para lo que se construyó la transferencia.
  const lateralMove = campEnrollmentClosed(cur);
  const targetRunning = campEnrollmentClosed(target as any);
  if (targetRunning && !lateralMove) return { ok: false, error: campClosedNoticeES(target as any) };
  const tTpl = Array.isArray((target as any).camp_templates) ? (target as any).camp_templates[0] : (target as any).camp_templates;
  const tAct = ((target as any).camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active');
  const tCap = (target as any).capacity_override ?? tTpl?.capacity_max ?? 0;
  if (tAct.some((p: any) => p.student_id === (seat as any).student_id)) return { ok: false, error: 'Ya está inscrito en ese grupo.' };
  const overCap = tCap > 0 && tAct.length >= tCap; // sobrecupo permitido en transferencias (decisión de mostrador)

  const st = Array.isArray((seat as any).students) ? (seat as any).students[0] : (seat as any).students;
  const name = [st?.first_name, st?.last_name].filter(Boolean).join(' ');
  const fromName = (cur.camp_name ?? '').split(' · ')[0];
  const toName = ((target as any).camp_name ?? tTpl?.template_name ?? '').split(' · ')[0];
  const paid = (seat as any).payment_status === 'paid';
  const targetPrice = tTpl?.list_price_cents ?? null;
  const stamp = elSalvadorToday();

  // Precio: sin pagar → adopta el del destino. Pagado → se conserva y queda
  // nota de la diferencia para que el coordinador ajuste (cobrar o dejar).
  const priceDiff = paid && targetPrice != null && (seat as any).amount_cents != null && targetPrice !== (seat as any).amount_cents
    ? targetPrice - (seat as any).amount_cents : 0;
  const tProg = targetRunning ? campDayProgress(target as any) : null;
  const note = `Transferido ${fromName} → ${toName} (${stamp}, mostrador)` +
    (targetRunning ? ` · TRASLADO A CAMP EN CURSO${tProg ? ` (día ${tProg.day} de ${tProg.total})` : ''} — autorizado por ${who.display_name || 'mostrador'}` : '') +
    (overCap ? ` · SOBRECUPO (${tAct.length + 1}/${tCap})` : '') +
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
  // Coach efectivo (invariante #1): el head coach recibe el aviso SOLO si aceptó
  // la transferencia del servicio; si no, va al coach original. Antes el `??`
  // mandaba al head coach aunque tuviera la asignación pendiente/rechazada.
  const curCoach = (cur.head_coach_status === 'accepted' && cur.head_coach_id) ? cur.head_coach_id : cur.coach_id;
  const tgtCoach = ((target as any).head_coach_status === 'accepted' && (target as any).head_coach_id) ? (target as any).head_coach_id : (target as any).coach_id;
  await notify(curCoach, `Transferencia: ${name} sale de tu grupo`, `${fromName} → ${toName}. Su bitácora queda en su perfil.`);
  await notify(tgtCoach, `Transferencia: ${name} entra a tu grupo`, `Viene de ${fromName} — revisá su perfil y bitácora antes de planear.`);
  const { data: coords } = await admin.from('coaches').select('id').eq('academy_id', who.academy_id).in('role', ['coordinator', 'admin']).eq('active_status', true);
  for (const c of coords ?? []) {
    if (c.id === curCoach || c.id === tgtCoach) continue;
    await notify(c.id, `Transferencia de grupo: ${name}`, `${fromName} → ${toName}${priceDiff !== 0 ? ` · dif. $${(priceDiff / 100).toFixed(2)} por ajustar` : ''}. Pago ${paid ? 'ya realizado' : 'pendiente en recepción'}.`);
  }
  return { ok: true };
}
