'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createNotification } from '@/lib/actions/notifications';
import { elSalvadorToday } from '@/lib/utils/tz';
import { campGuestIncludedIn } from '@/lib/utils/camp-guest';
import { campEnrollmentClosed, campClosedNoticeES } from '@/lib/utils/camp-window';

// ── Seller 2C/2D (token-gated) ──────────────────────────────────
// The seller RESERVES a spot (never marks it paid): the participant lands as
// active + payment pending with sold_by attribution, and the coordinator
// confirms the payment from the service board as always.

async function sellerByToken(token: string) {
  const admin = createAdminClient();
  const { data: coach } = await admin
    .from('coaches')
    .select('id, display_name, academy_id, portal_can_sell, role')
    .eq('portal_token', token)
    .maybeSingle();
  // Vende quien tiene el flag O cuyo ROL vende por definición: seller y host
  // (Servicio al cliente reserva y cobra en mostrador).
  const roleSells = ['seller', 'host', 'admin', 'coordinator'].includes((coach as any)?.role);
  if (!coach || (!(coach as any).portal_can_sell && !roleSells) || !coach.academy_id) return null;
  return coach;
}

export async function sellerSearchStudents(token: string, q: string): Promise<{ id: string; name: string; email: string | null }[]> {
  const coach = await sellerByToken(token);
  if (!coach || q.trim().length < 2) return [];
  const admin = createAdminClient();
  const term = `%${q.trim()}%`;
  const { data } = await admin
    .from('students')
    .select('id, first_name, last_name, email')
    .eq('academy_id', coach.academy_id)
    .eq('status', 'active')
    .or(`first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term}`)
    .limit(8);
  return (data ?? []).map((s: any) => ({
    id: s.id,
    name: [s.first_name, s.last_name].filter(Boolean).join(' ') || 'Student',
    email: s.email ?? null,
  }));
}

export async function sellerReserveSpot(token: string, campId: string, input: {
  studentId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  note?: string;
  allowOverbook?: boolean;
}): Promise<{ ok: boolean; error?: string; full?: boolean; studentName?: string; included?: boolean; includedIn?: string | null; overbooked?: boolean }> {
  const coach = await sellerByToken(token);
  if (!coach) return { ok: false, error: 'Not authorized to sell.' };
  const admin = createAdminClient();

  // Service must be in the seller's academy, upcoming and sellable.
  const { data: camp } = await admin
    .from('camp_instances')
    .select('id, camp_name, academy_id, status, start_date, end_date, scheduled_time, capacity_override, camp_templates:template_id(capacity_max, list_price_cents, service_kind)')
    .eq('id', campId)
    .maybeSingle();
  if (!camp || camp.academy_id !== coach.academy_id) return { ok: false, error: 'Service not found.' };
  if (camp.status === 'cancelled') return { ok: false, error: 'This service is cancelled.' };
  // Un camp de varios días se CIERRA al arrancar (regla de Marcelo 2026-08-25):
  // nadie se suma a una secuencia empezada. Las clases sueltas no se tocan.
  if (campEnrollmentClosed(camp as any)) return { ok: false, error: campClosedNoticeES(camp as any) };
  // Walk-in retroactivo (pedido del equipo, ice bath 2026-08-08): una clase
  // YA CERRADA sigue inscribible el MISMO día para el equipo de mostrador
  // (host/coordinador/admin), para registrar a quienes llegaron sin anotarse.
  // El QR público (publicEnroll) mantiene el bloqueo. Nunca días anteriores.
  let walkIn = false;
  if (camp.status === 'completed') {
    const teamRole = ['host', 'coordinator', 'admin'].includes((coach as any).role);
    const isToday = camp.start_date === elSalvadorToday();
    if (!teamRole || !isToday) return { ok: false, error: 'This service is not open for sales.' };
    walkIn = true;
  }

  // Live capacity check.
  const tpl: any = Array.isArray(camp.camp_templates) ? camp.camp_templates[0] : camp.camp_templates;
  const cap = camp.capacity_override ?? tpl?.capacity_max ?? 4;
  const { data: parts } = await admin
    .from('camp_participants')
    .select('id, student_id, enrollment_status')
    .eq('camp_instance_id', campId);
  const active = (parts ?? []).filter((p: any) => p.enrollment_status === 'active');
  // Cupo SUGERIDO: host/coordinador/admin pueden meter +1 a propósito
  // (sobrecupo auditado). Vendedores puros no — que llamen a recepción.
  let overbookNote: string | null = null;
  if (cap > 0 && active.length >= cap) {
    const mayOverbook = input.allowOverbook && ['host', 'admin', 'coordinator'].includes((coach as any).role);
    if (!mayOverbook) return { ok: false, full: true, error: `Lleno (${active.length}/${cap}).` };
    overbookNote = `SOBRECUPO (${active.length + 1}/${cap}) — mostrador`;
  }

  // Existing student or minimal new lead.
  let studentId = input.studentId ?? null;
  let studentName = '';
  if (studentId) {
    const { data: st } = await admin.from('students').select('id, first_name, last_name').eq('id', studentId).eq('academy_id', coach.academy_id).maybeSingle();
    if (!st) return { ok: false, error: 'Student not found.' };
    studentName = [st.first_name, st.last_name].filter(Boolean).join(' ');
  } else {
    const first = input.firstName?.trim();
    if (!first) return { ok: false, error: 'Add the client name.' };
    const email = input.email?.trim().toLowerCase() || null;
    const phone = input.phone?.trim() || null;
    if (!email && !phone) return { ok: false, error: 'Add an email or phone to reach the client.' };
    // Reuse an existing record with the same email instead of duplicating.
    if (email) {
      const { data: dup } = await admin.from('students').select('id, first_name, last_name').eq('academy_id', coach.academy_id).eq('email', email).maybeSingle();
      if (dup) { studentId = dup.id; studentName = [dup.first_name, dup.last_name].filter(Boolean).join(' '); }
    }
    if (!studentId) {
      const { data: created, error } = await admin
        .from('students')
        .insert({
          academy_id: coach.academy_id, first_name: first, last_name: input.lastName?.trim() || null,
          email, phone, status: 'active', lifecycle_status: 'lead',
          how_did_you_hear: 'seller',
        })
        .select('id')
        .single();
      if (error) return { ok: false, error: error.message };
      studentId = created.id;
      studentName = [first, input.lastName?.trim()].filter(Boolean).join(' ');
    }
  }

  // One active seat per student per service.
  if (active.some((p: any) => p.student_id === studentId)) {
    return { ok: false, error: `${studentName || 'This client'} already has a spot in this service.` };
  }

  // Regla INCLUIDO — fuente única (campGuestIncludedIn): un huésped de camp
  // entra $0 a las CLASES que cubre su camp. Lessons/trips SÍ se cobran.
  const includedIn = await campGuestIncludedIn(admin, studentId, (tpl as any)?.service_kind, (camp as any).start_date);

  const listPrice = (tpl as any)?.list_price_cents ?? null;
  const { error: insErr } = await admin.from('camp_participants').insert({
    camp_instance_id: campId,
    student_id: studentId,
    enrollment_status: 'active',
    payment_status: includedIn ? 'paid' : 'pending',
    ...(includedIn
      ? { amount_cents: 0, ...(listPrice != null ? { list_price_cents: listPrice } : {}) }
      : (listPrice != null ? { amount_cents: listPrice, list_price_cents: listPrice, sale_type: 'full' } : {})),
    sold_by: coach.id,
    reserved_at: new Date().toISOString(),
    notes: [
      walkIn ? `WALK-IN (inscrito tras cerrar la clase) — ${coach.display_name || 'mostrador'}` : null,
      overbookNote,
      includedIn ? `INCLUIDO en ${includedIn} (huésped de camp) — no cobrar.` : null,
      input.note?.trim() ? `Seller note: ${input.note.trim()}` : `Reserved by seller ${coach.display_name || ''}`.trim(),
    ].filter(Boolean).join(' '),
  });
  if (insErr) return { ok: false, error: insErr.message };

  // Tell the coordinators there's a payment to confirm (best-effort).
  const { data: coords } = await admin
    .from('coaches')
    .select('id, role')
    .eq('academy_id', coach.academy_id)
    .in('role', ['coordinator', 'admin'])
    .eq('active_status', true);
  for (const c of coords ?? []) {
    if (c.id === coach.id) continue;
    await createNotification({
      recipientCoachId: c.id,
      type: 'seller_reservation',
      title: `Reserva de ${coach.display_name || 'seller'}: ${studentName}`,
      body: `${camp.camp_name} — cupo reservado, pago pendiente de confirmar.`,
      link: null,
      metadata: { campId, studentId, soldBy: coach.id },
    }).catch(() => {});
  }
  return { ok: true, studentName, included: !!includedIn, includedIn, overbooked: !!overbookNote };
}

export interface SellerSale {
  id: string;
  student_name: string;
  camp_name: string;
  start_date: string | null;
  payment_status: string;
  enrollment_status: string;
  amount_cents: number | null;
  reserved_at: string | null;
}

// 2D — the seller's own sales log: everything they reserved, with live status.
export async function sellerMySales(token: string): Promise<SellerSale[]> {
  const coach = await sellerByToken(token);
  if (!coach) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from('camp_participants')
    .select('id, payment_status, enrollment_status, amount_cents, reserved_at, students:student_id(first_name, last_name), camp_instances:camp_instance_id(camp_name, start_date)')
    .eq('sold_by', coach.id)
    .order('reserved_at', { ascending: false, nullsFirst: false })
    .limit(60);
  return (data ?? []).map((r: any) => {
    const st = Array.isArray(r.students) ? r.students[0] : r.students;
    const ci = Array.isArray(r.camp_instances) ? r.camp_instances[0] : r.camp_instances;
    return {
      id: r.id,
      student_name: [st?.first_name, st?.last_name].filter(Boolean).join(' ') || 'Student',
      camp_name: ci?.camp_name || '—',
      start_date: ci?.start_date ?? null,
      payment_status: r.payment_status,
      enrollment_status: r.enrollment_status,
      amount_cents: r.amount_cents ?? null,
      reserved_at: r.reserved_at ?? null,
    };
  });
}
