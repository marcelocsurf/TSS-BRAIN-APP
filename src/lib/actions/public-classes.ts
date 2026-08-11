'use server';

// PUBLIC class signup (QR flow, M147). No auth — everything is scoped by the
// academy slug and validated server-side. Students self-enroll into
// service_kind='class' services (yoga, skate, ice bath…), signing the waiver
// in the same flow. Payment is NEVER settled here — front desk does that.

import { createAdminClient } from '@/lib/supabase/admin';
import { elSalvadorToday } from '@/lib/utils/tz';
import { createNotification } from '@/lib/actions/notifications';
import { campGuestIncludedIn } from '@/lib/utils/camp-guest';
import { findLikelySamePerson } from '@/lib/utils/student-match';

// Aviso interno de una reserva del QR público: campanita para coordinadores,
// admins y hosts (servicio al cliente). No bloquea la reserva si falla.
async function notifyBooking(academyId: string, studentName: string, className: string, amountCents: number | null, studentId: string) {
  try {
    const admin = createAdminClient();
    const { data: staff } = await admin.from('coaches').select('id')
      .eq('academy_id', academyId).in('role', ['coordinator', 'admin', 'host']).eq('active_status', true);
    for (const c of staff ?? []) {
      await createNotification({
        recipientCoachId: c.id,
        type: 'qr_booking',
        title: `Reserva por QR: ${studentName}`,
        body: `${className}${amountCents != null ? ` — $${(amountCents / 100).toFixed(2)} pendiente de cobro en recepción` : ''}`,
        link: `/students/${studentId}`,
        metadata: { studentId, source: 'public_qr' },
      }).catch(() => {});
    }
  } catch { /* el aviso nunca debe romper la reserva */ }
}

const norm = (e: string) => e.trim().toLowerCase();

// Edad a partir de la fecha de nacimiento (para el waiver de menores).
export async function ageFromDob(dob: string | null | undefined): Promise<number | null> {
  if (!dob) return null;
  const d = new Date(dob + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
  return a;
}
const MIN_AGE = 7;   // el método TSS arranca a los 7 (Canon)
const ADULT = 18;

async function academyBySlug(slug: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from('academies')
    .select('id, name, slug, logo_url, primary_color, accent_color')
    .eq('slug', slug)
    .is('archived_at', null)
    .maybeSingle();
  return data;
}

export async function getPublicClasses(slug: string, templateId?: string | null) {
  const admin = createAdminClient();
  const academy = await academyBySlug(slug);
  if (!academy) return null;

  const today = elSalvadorToday();
  let q = admin
    .from('camp_instances')
    .select('id, camp_name, start_date, scheduled_time, capacity_override, template_id, head_coach_id, head_coach_status, camp_templates:template_id!inner(id, template_name, service_kind, capacity_max, session_duration_minutes, list_price_cents, card_color, description, video_url), coaches:coach_id(display_name), hc:head_coach_id(display_name), camp_participants(id, enrollment_status)')
    .eq('academy_id', academy.id)
    .in('camp_templates.service_kind', ['class', 'trip', 'surf_lesson'])
    .gte('start_date', today)
    .neq('status', 'cancelled')
    // Ventana de 6 semanas: suficiente para que un huésped planifique su
    // estadía sin traer el trimestre entero al navegador.
    .lte('start_date', new Date(Date.now() + 42 * 86400000).toISOString().slice(0, 10))
    .order('start_date')
    .limit(400);
  if (templateId) q = q.eq('template_id', templateId);
  const { data } = await q;

  const classes = (data ?? []).map((c: any) => {
    const tpl = Array.isArray(c.camp_templates) ? c.camp_templates[0] : c.camp_templates;
    // Coach efectivo (invariante #1): head coach si aceptó la transferencia,
    // si no el coach original. El QR mostraba siempre el coach_id legacy.
    const useHead = c.head_coach_id && c.head_coach_status === 'accepted';
    const hc = Array.isArray(c.hc) ? c.hc[0] : c.hc;
    const orig = Array.isArray(c.coaches) ? c.coaches[0] : c.coaches;
    const coach = (useHead ? hc : orig) ?? orig;
    const enrolled = (c.camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active').length;
    const capacity = c.capacity_override ?? tpl?.capacity_max ?? 0;
    return {
      id: c.id,
      name: c.camp_name || tpl?.template_name,
      template_name: tpl?.template_name ?? null,
      date: c.start_date,
      time: c.scheduled_time,
      minutes: tpl?.session_duration_minutes ?? null,
      coach: coach?.display_name ?? null,
      color: tpl?.card_color ?? null,
      description: tpl?.description ?? null,
      video_url: tpl?.video_url ?? null,
      price_cents: tpl?.list_price_cents ?? null,
      enrolled,
      capacity,
      full: capacity > 0 && enrolled >= capacity,
    };
  });

  // Prefer a light-background version of the logo when one was uploaded
  // (convention: avatars/academies/<id>-light.png).
  let logoLight: string | null = null;
  try {
    const { data: files } = await admin.storage.from('avatars').list('academies', { search: `${academy.id}-light` });
    if (files && files.length > 0) {
      logoLight = admin.storage.from('avatars').getPublicUrl(`academies/${academy.id}-light.png`).data.publicUrl;
    }
  } catch { /* storage lookup is cosmetic */ }

  return { academy: { name: academy.name, logo_url: academy.logo_url, logo_light_url: logoLight }, classes };
}

// Minimal-disclosure lookup: given an email, return WHO is registered under it.
// Las familias comparten un mismo correo (mamá inscribe a sus hijos), así que
// devolvemos la lista y el QR pregunta "¿quién reserva?" en vez de asumir el
// primero — antes una mamá entraba y la app la reconocía como su hija.
// Solo se expone nombre + si el waiver está firmado + si es menor (nunca la
// fecha de nacimiento ni datos de contacto).
export interface PublicPerson {
  id: string;
  first_name: string;
  last_name: string | null;
  waiver_signed: boolean;
  is_minor: boolean;
}

export async function lookupPublicStudent(
  slug: string,
  email: string,
): Promise<{ found: false } | { found: true; people: PublicPerson[] }> {
  const academy = await academyBySlug(slug);
  if (!academy || !email.trim()) return { found: false };
  const admin = createAdminClient();
  const { data } = await admin
    .from('students')
    .select('id, first_name, last_name, waiver_signed, date_of_birth')
    .eq('academy_id', academy.id)
    .eq('status', 'active')
    .ilike('email', norm(email))
    .order('date_of_birth', { ascending: true, nullsFirst: false }) // adultos primero
    .limit(10);
  if (!data || data.length === 0) return { found: false };
  const people: PublicPerson[] = [];
  for (const s of data) {
    const age = await ageFromDob((s as any).date_of_birth);
    people.push({
      id: s.id,
      first_name: s.first_name,
      last_name: (s as any).last_name ?? null,
      waiver_signed: !!s.waiver_signed,
      is_minor: age != null && age < ADULT,
    });
  }
  return { found: true, people };
}

export async function publicEnroll(input: {
  slug: string;
  campId: string;
  email: string;
  /** Cuál de las personas del correo reserva (familias comparten email). */
  studentId?: string | null;
  /** Nombre del adulto que firma cuando quien reserva es menor de edad. */
  guardian_name?: string | null;
  coupon?: string | null;
  // Present only for first-timers (creates the profile). accept_waiver must
  // be true in both paths when the waiver isn't signed yet.
  profile?: {
    first_name: string;
    last_name: string;
    phone: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    medical_notes: string | null;
    date_of_birth?: string | null;
    guardian_name?: string | null;   // adulto que firma cuando es menor
    guardian_phone?: string | null;
  } | null;
  accept_waiver: boolean;
  signed_name?: string | null;
}): Promise<{ ok: boolean; error?: string; summary?: { class_name: string; date: string; time: string | null; amount_cents: number | null; sale_type: string; coupon_applied: string | null; first_name: string; booking_id?: string | null } }> {
  const academy = await academyBySlug(input.slug);
  if (!academy) return { ok: false, error: 'Academy not found.' };
  const admin = createAdminClient();
  const email = norm(input.email);
  if (!email || !email.includes('@')) return { ok: false, error: 'Enter a valid email.' };

  // 1. The class — must be a future 'class' service of this academy with room.
  const { data: camp } = await admin
    .from('camp_instances')
    .select('id, camp_name, start_date, scheduled_time, capacity_override, template_id, camp_templates:template_id(template_name, service_kind, capacity_max, list_price_cents), camp_participants(id, enrollment_status, student_id)')
    .eq('id', input.campId)
    .eq('academy_id', academy.id)
    .maybeSingle();
  const tpl = camp ? (Array.isArray((camp as any).camp_templates) ? (camp as any).camp_templates[0] : (camp as any).camp_templates) : null;
  // Debe aceptar exactamente lo mismo que lista getPublicClasses — incluidas
  // las lecciones de surf (Discover), o el cliente ve la clase pero no puede
  // reservarla ("Class not found").
  if (!camp || !['class', 'trip', 'surf_lesson'].includes(tpl?.service_kind)) return { ok: false, error: 'Class not found.' };
  const active = ((camp as any).camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active');
  const capacity = (camp as any).capacity_override ?? tpl?.capacity_max ?? 0;
  if (capacity > 0 && active.length >= capacity) return { ok: false, error: 'This class is full.' };

  // 2. Coupon (optional).
  let coupon: { id: string; code: string; percent_off: number } | null = null;
  if (input.coupon?.trim()) {
    const { data: cp } = await admin
      .from('class_coupons')
      .select('id, code, percent_off, active, expires_on, max_uses, uses')
      .eq('academy_id', academy.id)
      .ilike('code', input.coupon.trim())
      .maybeSingle();
    const today = elSalvadorToday();
    if (!cp || !cp.active) return { ok: false, error: 'That code is not valid.' };
    if (cp.expires_on && cp.expires_on < today) return { ok: false, error: 'That code has expired.' };
    if (cp.max_uses != null && cp.uses >= cp.max_uses) return { ok: false, error: 'That code has no uses left.' };
    coupon = cp;
  }

  // 3. The student — existing by email, or created from the profile form.
  let studentId: string;
  let firstName: string;
  let dupWarning: string | null = null;
  // Quién reserva: si el QR mandó un studentId (familias con email compartido)
  // usamos ESA persona — verificando que pertenezca al mismo correo y academia,
  // para que un id suelto no permita reservar a nombre de otro.
  let existingQ = admin
    .from('students')
    .select('id, first_name, waiver_signed, date_of_birth')
    .eq('academy_id', academy.id)
    .eq('status', 'active')
    .ilike('email', email);
  if (input.studentId) existingQ = existingQ.eq('id', input.studentId);
  const { data: existing } = await existingQ
    .order('date_of_birth', { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    studentId = existing.id;
    firstName = existing.first_name;
    if (!existing.waiver_signed) {
      if (!input.accept_waiver) return { ok: false, error: 'The waiver must be accepted to join.' };
      // Un menor NO puede firmar su propia exención — la firma su adulto, cuyo
      // nombre llega en guardian_name (el QR muestra ese campo cuando quien
      // reserva es menor). Sin él no se puede continuar.
      const exAge = await ageFromDob(existing.date_of_birth);
      const exIsMinor = exAge != null && exAge < ADULT;
      const guardian = input.guardian_name?.trim() || input.profile?.guardian_name?.trim() || '';
      if (exIsMinor && !guardian) {
        return { ok: false, error: 'A parent or legal guardian must sign for a minor.' };
      }
      await admin.from('students').update({
        waiver_signed: true,
        waiver_signed_at: new Date().toISOString(),
        waiver_signed_by: exIsMinor
          ? `${guardian} (parent/guardian)`
          : (input.signed_name?.trim() || existing.first_name),
      }).eq('id', existing.id);
    }
    if (active.some((p: any) => p.student_id === existing.id)) {
      return { ok: false, error: 'You are already enrolled in this class.' };
    }
  } else {
    const p = input.profile;
    if (!p?.first_name?.trim()) return { ok: false, error: 'We could not find that email — complete your profile to join.' };
    if (!input.accept_waiver) return { ok: false, error: 'The waiver must be accepted to join.' };
    // Menores: un menor NO puede firmar su propia exención — la firma el
    // padre/madre/tutor, y su nombre queda registrado como firmante.
    const age = await ageFromDob(p.date_of_birth);
    if (p.date_of_birth && age == null) return { ok: false, error: 'Check the date of birth.' };
    if (age != null && age < MIN_AGE) {
      return { ok: false, error: `For surfers under ${MIN_AGE} we set things up in person — please stop by front desk.` };
    }
    const isMinor = age != null && age < ADULT;
    if (isMinor && !p.guardian_name?.trim()) {
      return { ok: false, error: 'A parent or legal guardian must sign for a minor.' };
    }
    const { data: created, error: createErr } = await admin
      .from('students')
      .insert({
        academy_id: academy.id,
        first_name: p.first_name.trim(),
        last_name: (p.last_name ?? '').trim(),
        email,
        phone: p.phone?.trim() || null,
        emergency_contact_name: p.emergency_contact_name?.trim() || null,
        emergency_contact_phone: p.emergency_contact_phone?.trim() || null,
        medical_notes: p.medical_notes?.trim() || null,
        date_of_birth: p.date_of_birth?.trim() || null,
        status: 'active',
        lifecycle_status: 'lead',
        student_type: 'dropin',   // OJO: sin guion bajo — el intake compara con 'dropin' y es lo que corta el flujo largo
        how_did_you_hear: 'class_qr',
        waiver_signed: true,
        waiver_signed_at: new Date().toISOString(),
        waiver_signed_by: isMinor
          ? `${p.guardian_name!.trim()} (parent/guardian)`
          : (input.signed_name?.trim() || p.first_name.trim()),
        ...(isMinor && p.guardian_phone?.trim() ? { emergency_contact_phone: p.emergency_contact_phone?.trim() || p.guardian_phone.trim() } : {}),
      })
      .select('id, first_name')
      .single();
    if (createErr || !created) return { ok: false, error: 'Could not create your profile — try again or ask at front desk.' };
    studentId = created.id;
    firstName = created.first_name;
    // Acá NO reusamos automáticamente: dos personas distintas pueden llamarse
    // igual, y el cliente ya firmó su waiver en ESTA ficha. Pero si huele a
    // duplicado (caso Kelly Uszenski: entró con su otro correo), lo dejamos
    // anotado para que el mostrador lo una — el cliente nunca se traba.
    try {
      const likely = await findLikelySamePerson(admin, academy.id, {
        first_name: p.first_name, last_name: p.last_name, date_of_birth: p.date_of_birth,
      }, studentId);
      if (likely.length) {
        dupWarning = `⚠ POSIBLE DUPLICADO — ya existe ${likely.map((l) => `${l.first_name} ${l.last_name ?? ''}`.trim() + (l.email ? ` <${l.email}>` : '')).join(', ')}. Entró por el QR con ${email}. Revisar y unir si es la misma persona.`;
        await admin.from('students').update({
          coach_notes_general: dupWarning,
        }).eq('id', studentId);
      }
    } catch { /* el aviso nunca bloquea la reserva */ }
  }

  // Regla INCLUIDO — fuente única (campGuestIncludedIn): un huésped de camp
  // que se auto-inscribe por el QR a una CLASE cubierta entra $0/pagado.
  const includedIn = await campGuestIncludedIn(admin, studentId, (tpl as any)?.service_kind, (camp as any).start_date);

  // 4. The seat — priced by list price and coupon; ALWAYS settled at front desk.
  const list = tpl?.list_price_cents ?? null;
  let sale_type = 'full';
  let amount: number | null = list;
  let reason: string | null = null;
  if (coupon) {
    if (coupon.percent_off >= 100) {
      sale_type = 'courtesy'; amount = 0; reason = `Coupon ${coupon.code}`;
    } else {
      sale_type = 'discount';
      amount = list != null ? Math.round(list * (1 - coupon.percent_off / 100)) : null;
      reason = `Coupon ${coupon.code} (−${coupon.percent_off}%)`;
    }
  }

  if (includedIn) { amount = 0; sale_type = 'full'; reason = null; }
  const { data: seatRow, error: enrollErr } = await admin.from('camp_participants').insert({
    camp_instance_id: (camp as any).id,
    student_id: studentId,
    enrollment_status: 'active',
    payment_status: includedIn ? 'paid' : (sale_type === 'courtesy' ? 'paid' : 'reserved'),
    reserved_at: new Date().toISOString(),
    ...(sale_type === 'courtesy' ? { paid_at: new Date().toISOString(), payment_method: 'coupon' } : {}),
    ...(amount != null ? { amount_cents: amount } : {}),
    ...(list != null ? { list_price_cents: list } : {}),
    sale_type,
    ...(reason ? { discount_reason: reason } : {}),
    ...((includedIn || dupWarning) ? {
      notes: [includedIn ? `INCLUIDO en ${includedIn} (huésped de camp) — no cobrar.` : null, dupWarning].filter(Boolean).join(' · '),
    } : {}),
  }).select('id').single();
  if (enrollErr) return { ok: false, error: 'Could not save your spot — ask at front desk.' };
  await notifyBooking(academy.id, firstName, (camp as any).camp_name, amount, studentId);
  // Confirmación con link de gestión (cancelar/mover con política de 24 h).
  try {
    const { sendBookingConfirmationEmail } = await import('@/lib/actions/email');
    const base = process.env.NEXT_PUBLIC_APP_URL || 'https://app.thesurfsequence.com';
    const dt = new Date(((camp as any).start_date) + 'T00:00:00');
    await sendBookingConfirmationEmail({
      toEmail: email,
      firstName,
      className: ((camp as any).camp_name ?? '').split(' · ')[0],
      dateLabel: dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) + ((camp as any).scheduled_time ? ` · ${(camp as any).scheduled_time.slice(0, 5)}` : ''),
      amountLabel: amount != null && amount > 0 ? `$${(amount / 100).toFixed(2)}` : null,
      manageUrl: `${base}/booking/${(seatRow as any)?.id}`,
      academyId: (camp as any)?.academy_id ?? null,
    }).catch(() => {});
  } catch { /* el email nunca bloquea la reserva */ }

  if (coupon) {
    // Plain read-modify-write — signup volume makes a race here harmless.
    const { data: cur } = await admin.from('class_coupons').select('uses').eq('id', coupon.id).single();
    await admin.from('class_coupons').update({ uses: ((cur as any)?.uses ?? 0) + 1 }).eq('id', coupon.id);
  }

  return {
    ok: true,
    summary: {
      class_name: (camp as any).camp_name || tpl?.template_name,
      date: (camp as any).start_date,
      time: (camp as any).scheduled_time ?? null,
      amount_cents: amount,
      sale_type,
      coupon_applied: coupon?.code ?? null,
      first_name: firstName,
      booking_id: (seatRow as any)?.id ?? null,
    },
  };
}

// ── Familia (#familia): agregar acompañantes a la MISMA clase reusando el
// contacto y el adulto responsable de quien ya reservó. Cada persona queda
// como su propio alumno (bitácora propia) pero con el mismo firmante.
export async function publicAddCompanion(input: {
  slug: string;
  campId: string;
  bookerEmail: string;          // el adulto que ya reservó
  first_name: string;
  last_name?: string | null;
  date_of_birth?: string | null;
  medical_notes?: string | null;
}): Promise<{ ok: boolean; error?: string; name?: string; amount_cents?: number | null }> {
  const academy = await academyBySlug(input.slug);
  if (!academy) return { ok: false, error: 'Academy not found.' };
  const admin = createAdminClient();

  const { data: booker } = await admin
    .from('students')
    .select('id, first_name, last_name, phone, emergency_contact_name, emergency_contact_phone, waiver_signed_by, date_of_birth')
    .eq('academy_id', academy.id)
    .ilike('email', norm(input.bookerEmail))
    .limit(1)
    .maybeSingle();
  if (!booker) return { ok: false, error: 'Start by booking your own spot first.' };

  const name = input.first_name?.trim();
  if (!name) return { ok: false, error: 'Add their first name.' };

  // Clase + cupo disponible en vivo.
  const { data: camp } = await admin
    .from('camp_instances')
    .select('id, camp_name, capacity_override, camp_templates:template_id(service_kind, capacity_max, list_price_cents), camp_participants(id, enrollment_status)')
    .eq('id', input.campId).eq('academy_id', academy.id).maybeSingle();
  const tpl: any = camp ? (Array.isArray((camp as any).camp_templates) ? (camp as any).camp_templates[0] : (camp as any).camp_templates) : null;
  if (!camp || !['class', 'trip', 'surf_lesson'].includes(tpl?.service_kind)) return { ok: false, error: 'Class not found.' };
  const active = ((camp as any).camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active');
  const capacity = (camp as any).capacity_override ?? tpl?.capacity_max ?? 0;
  if (capacity > 0 && active.length >= capacity) return { ok: false, error: 'No spots left for another person.' };

  const age = await ageFromDob(input.date_of_birth);
  if (input.date_of_birth && age == null) return { ok: false, error: 'Check the date of birth.' };
  if (age != null && age < MIN_AGE) {
    return { ok: false, error: `For surfers under ${MIN_AGE} we set things up in person — please stop by front desk.` };
  }
  const bookerName = [booker.first_name, booker.last_name].filter(Boolean).join(' ');
  // Si quien reserva es a su vez menor, el firmante NO puede ser él: se hereda
  // el adulto que firmó su propio waiver ("Ana Pérez (parent/guardian)").
  const bookerAge = await ageFromDob((booker as any).date_of_birth);
  const bookerIsMinor = bookerAge != null && bookerAge < ADULT;
  const guardianOfBooker = ((booker as any).waiver_signed_by || '').replace(/\s*\((parent\/guardian|booked together)\)\s*$/i, '').trim();
  if (bookerIsMinor && !guardianOfBooker) {
    return { ok: false, error: 'A parent or guardian must add other people — please ask at front desk.' };
  }
  const responsibleAdult = bookerIsMinor ? guardianOfBooker : bookerName;

  // ¿Esta persona YA existe? (familia Uszenski, 2026-08-10: Kelly entró con
  // otro correo suyo y al agregar a sus hijos el sistema creó personas nuevas
  // — que además, al no estar en ningún camp, perdían el $0 de huésped.)
  // Apellido + fecha de nacimiento atrapa incluso el apodo (Eddie/Edward).
  const already = await findLikelySamePerson(admin, academy.id, {
    first_name: name, last_name: input.last_name, date_of_birth: input.date_of_birth,
  });
  let personId: string | null = already[0]?.id ?? null;
  let personName = already[0]?.first_name ?? name;

  if (personId) {
    const { data: dupSeat } = await admin
      .from('camp_participants')
      .select('id')
      .eq('camp_instance_id', (camp as any).id)
      .eq('student_id', personId)
      .eq('enrollment_status', 'active')
      .maybeSingle();
    if (dupSeat) return { ok: false, error: `${personName} already has a spot in this class.` };
  }

  if (!personId) {
    const { data: created, error: cErr } = await admin
      .from('students')
      .insert({
        academy_id: academy.id,
        first_name: name,
        last_name: (input.last_name ?? '').trim(),
        email: null,                                   // el contacto es el adulto
        phone: booker.phone,
        emergency_contact_name: booker.emergency_contact_name || bookerName,
        emergency_contact_phone: booker.emergency_contact_phone || booker.phone,
        medical_notes: input.medical_notes?.trim() || null,
        date_of_birth: input.date_of_birth?.trim() || null,
        status: 'active',
        lifecycle_status: 'lead',
        student_type: 'dropin',   // OJO: sin guion bajo — el intake compara con 'dropin' y es lo que corta el flujo largo
        how_did_you_hear: 'class_qr',
        waiver_signed: true,
        waiver_signed_at: new Date().toISOString(),
        waiver_signed_by: `${responsibleAdult} (${age != null && age < ADULT ? 'parent/guardian' : 'booked together'})`,
        coach_notes_general: `Booked by ${responsibleAdult}${bookerIsMinor ? ` (via ${bookerName})` : ''} (${norm(input.bookerEmail)}) — family booking from the public QR.`,
      })
      .select('id, first_name')
      .single();
    if (cErr || !created) return { ok: false, error: 'Could not add them — ask at front desk.' };
    personId = created.id as string;
    personName = created.first_name as string;
  }
  const seatFor: string = personId;

  // Regla INCLUIDO — la misma fuente única que usan el QR y el mostrador: un
  // huésped de camp entra $0 a las CLASES que su camp cubre. Faltaba acá, así
  // que a la familia de un campista se le cobraba tarifa completa.
  const includedIn = await campGuestIncludedIn(admin, seatFor, (tpl as any)?.service_kind, (camp as any).start_date);

  const list = tpl?.list_price_cents ?? null;
  const amount = includedIn ? 0 : list;
  const { error: eErr } = await admin.from('camp_participants').insert({
    camp_instance_id: (camp as any).id,
    student_id: seatFor,
    enrollment_status: 'active',
    payment_status: includedIn ? 'paid' : 'reserved',
    reserved_at: new Date().toISOString(),
    ...(includedIn ? { paid_at: new Date().toISOString() } : {}),
    ...(amount != null ? { amount_cents: amount } : {}),
    ...(list != null ? { list_price_cents: list } : {}),
    sale_type: 'full',
    notes: [
      `Family booking · ${responsibleAdult}`,
      already[0] ? 'Persona ya registrada — se reusó su ficha en vez de crear otra.' : null,
      includedIn ? `INCLUIDO en ${includedIn} (huésped de camp) — no cobrar.` : null,
    ].filter(Boolean).join(' · '),
  });
  if (eErr) return { ok: false, error: 'Could not save their spot — ask at front desk.' };
  await notifyBooking(academy.id, `${personName} (familia de ${bookerName})`, (camp as any).camp_name, amount, seatFor);
  return { ok: true, name: personName, amount_cents: amount };
}


// ── Gestión de la reserva por el CLIENTE (link del email de confirmación) ──
// El id del participante (uuid) actúa como token de capacidad — mismo patrón
// que portal_token. Política de 24 h: cancelar antes es gratis; dentro de las
// 24 h se debe la clase completa (regla de Marcelo, 2026-07-31).

function classStart(camp: any): Date {
  return new Date(`${camp.start_date}T${(camp.scheduled_time || '23:59').slice(0, 5)}:00-06:00`);
}
const hoursUntil = (camp: any) => (classStart(camp).getTime() - Date.now()) / 3600_000;

async function bookingById(bookingId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from('camp_participants')
    .select('id, enrollment_status, payment_status, amount_cents, list_price_cents, student_id, notes, camp_instances:camp_instance_id!inner(id, academy_id, camp_name, start_date, scheduled_time, template_id, status), students(first_name, last_name, email)')
    .eq('id', bookingId)
    .maybeSingle();
  if (!data) return null;
  const camp = Array.isArray((data as any).camp_instances) ? (data as any).camp_instances[0] : (data as any).camp_instances;
  const student = Array.isArray((data as any).students) ? (data as any).students[0] : (data as any).students;
  return { seat: data as any, camp, student };
}

export async function getPublicBooking(bookingId: string) {
  const b = await bookingById(bookingId);
  if (!b) return null;
  const { seat, camp, student } = b;
  return {
    id: seat.id,
    class_name: (camp.camp_name ?? '').split(' · ')[0],
    date: camp.start_date,
    time: camp.scheduled_time ?? null,
    first_name: student?.first_name ?? 'surfer',
    amount_cents: seat.amount_cents,
    paid: seat.payment_status === 'paid',
    active: seat.enrollment_status === 'active' && camp.status !== 'cancelled',
    hours_left: Math.floor(hoursUntil(camp)),
    free_cancel: hoursUntil(camp) >= 24,
    template_id: camp.template_id,
  };
}

// Otras fechas de la MISMA clase con cupo (para mover la reserva).
export async function getPublicMoveTargets(bookingId: string) {
  const b = await bookingById(bookingId);
  if (!b) return [];
  const admin = createAdminClient();
  const today = elSalvadorToday();
  const { data } = await admin
    .from('camp_instances')
    .select('id, camp_name, start_date, scheduled_time, capacity_override, camp_templates:template_id(capacity_max), camp_participants(id, enrollment_status)')
    .eq('academy_id', b.camp.academy_id)
    .eq('template_id', b.camp.template_id)
    .gte('start_date', today)
    .neq('status', 'cancelled')
    .neq('id', b.camp.id)
    .order('start_date')
    .limit(14);
  return (data ?? []).map((c: any) => {
    const tpl = Array.isArray(c.camp_templates) ? c.camp_templates[0] : c.camp_templates;
    const act = (c.camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active').length;
    const cap = c.capacity_override ?? tpl?.capacity_max ?? 0;
    return { id: c.id, date: c.start_date, time: c.scheduled_time, left: cap > 0 ? cap - act : null };
  }).filter((c: any) => c.left == null || c.left > 0);
}

async function notifyStaffChange(academyId: string, title: string, body: string, studentId: string | null) {
  try {
    const admin = createAdminClient();
    const { data: staff } = await admin.from('coaches').select('id')
      .eq('academy_id', academyId).in('role', ['coordinator', 'admin', 'host']).eq('active_status', true);
    for (const c of staff ?? []) {
      await createNotification({
        recipientCoachId: c.id, type: 'booking_change', title, body,
        link: studentId ? `/students/${studentId}` : null, metadata: { studentId },
      }).catch(() => {});
    }
  } catch { /* aviso best-effort */ }
}

export async function publicCancelBooking(bookingId: string, actor: 'student' | 'desk' = 'student'): Promise<{ ok: boolean; error?: string; late?: boolean }> {
  const b = await bookingById(bookingId);
  if (!b || b.seat.enrollment_status !== 'active') return { ok: false, error: 'Booking not found or already cancelled.' };
  if (hoursUntil(b.camp) < 0) return { ok: false, error: 'This class already happened.' };
  const admin = createAdminClient();
  const late = hoursUntil(b.camp) < 24; // la política de 24 h aplica igual para todos
  const name = [b.student?.first_name, b.student?.last_name].filter(Boolean).join(' ');
  const price = b.seat.amount_cents ?? b.seat.list_price_cents;
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const note = late
    ? `LATE CANCEL (${actor === 'desk' ? 'front desk' : 'self'}, <24h) ${stamp} — full charge due${price != null ? ` $${(price / 100).toFixed(2)}` : ''}`
    : `Cancelled ${actor === 'desk' ? 'at front desk' : 'by student'} (≥24h, free) ${stamp}`;
  const { error } = await admin.from('camp_participants')
    .update({ enrollment_status: 'removed', notes: [b.seat.notes, note].filter(Boolean).join(' | ') })
    .eq('id', bookingId);
  if (error) return { ok: false, error: 'Could not cancel — contact front desk.' };
  await notifyStaffChange(
    b.camp.academy_id,
    `${late ? '⚠ Cancelación tardía' : 'Cancelación'}: ${name}`,
    `${b.camp.camp_name}${late ? ` — dentro de 24h: DEBE la clase completa${price != null ? ` ($${(price / 100).toFixed(2)})` : ''}${b.seat.payment_status === 'paid' ? ' (ya pagada, sin reembolso)' : ''}` : b.seat.payment_status === 'paid' ? ' — ya había pagado: coordinar crédito o reembolso.' : ' — cupo liberado, sin cargo.'}`,
    b.seat.student_id,
  );
  return { ok: true, late };
}

export async function publicMoveBooking(bookingId: string, targetCampId: string, actor: 'student' | 'desk' = 'student'): Promise<{ ok: boolean; error?: string; new_date?: string; new_time?: string | null }> {
  const b = await bookingById(bookingId);
  if (!b || b.seat.enrollment_status !== 'active') return { ok: false, error: 'Booking not found or already cancelled.' };
  const admin = createAdminClient();
  const { data: target } = await admin
    .from('camp_instances')
    .select('id, academy_id, template_id, camp_name, start_date, scheduled_time, capacity_override, camp_templates:template_id(capacity_max), camp_participants(id, enrollment_status, student_id)')
    .eq('id', targetCampId).neq('status', 'cancelled').maybeSingle();
  if (!target || (target as any).academy_id !== b.camp.academy_id || (target as any).template_id !== b.camp.template_id) {
    return { ok: false, error: 'That date is not available.' };
  }
  const act = ((target as any).camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active');
  const tpl = Array.isArray((target as any).camp_templates) ? (target as any).camp_templates[0] : (target as any).camp_templates;
  const cap = (target as any).capacity_override ?? tpl?.capacity_max ?? 0;
  if (cap > 0 && act.length >= cap) return { ok: false, error: 'That date is full — pick another.' };
  if (act.some((p: any) => p.student_id === b.seat.student_id)) return { ok: false, error: 'You are already booked on that date.' };

  const stamp = elSalvadorToday();
  const { error } = await admin.from('camp_participants')
    .update({ camp_instance_id: targetCampId, notes: [b.seat.notes, `Moved ${actor === 'desk' ? 'at front desk' : 'by student'} ${stamp}: ${b.camp.start_date} → ${(target as any).start_date}`].filter(Boolean).join(' | ') })
    .eq('id', bookingId);
  if (error) return { ok: false, error: 'Could not move — contact front desk.' };
  const name = [b.student?.first_name, b.student?.last_name].filter(Boolean).join(' ');
  await notifyStaffChange(b.camp.academy_id, `Cambio de fecha: ${name}`,
    `${(b.camp.camp_name ?? '').split(' · ')[0]}: ${b.camp.start_date} → ${(target as any).start_date}${(target as any).scheduled_time ? ` ${(target as any).scheduled_time.slice(0, 5)}` : ''}. Pago ${b.seat.payment_status === 'paid' ? 'ya realizado' : 'pendiente en recepción'}.`,
    b.seat.student_id);
  return { ok: true, new_date: (target as any).start_date, new_time: (target as any).scheduled_time ?? null };
}
