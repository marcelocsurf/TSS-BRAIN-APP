'use server';

// PUBLIC class signup (QR flow, M147). No auth — everything is scoped by the
// academy slug and validated server-side. Students self-enroll into
// service_kind='class' services (yoga, skate, ice bath…), signing the waiver
// in the same flow. Payment is NEVER settled here — front desk does that.

import { createAdminClient } from '@/lib/supabase/admin';

const norm = (e: string) => e.trim().toLowerCase();

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

  const today = new Date().toISOString().slice(0, 10);
  let q = admin
    .from('camp_instances')
    .select('id, camp_name, start_date, scheduled_time, capacity_override, template_id, camp_templates:template_id!inner(id, template_name, service_kind, capacity_max, session_duration_minutes, list_price_cents, card_color, description), coaches:coach_id(display_name), camp_participants(id, enrollment_status)')
    .eq('academy_id', academy.id)
    .in('camp_templates.service_kind', ['class', 'trip'])
    .gte('start_date', today)
    .neq('status', 'cancelled')
    .order('start_date')
    .limit(30);
  if (templateId) q = q.eq('template_id', templateId);
  const { data } = await q;

  const classes = (data ?? []).map((c: any) => {
    const tpl = Array.isArray(c.camp_templates) ? c.camp_templates[0] : c.camp_templates;
    const coach = Array.isArray(c.coaches) ? c.coaches[0] : c.coaches;
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

// Minimal-disclosure lookup: given an email, say only whether a profile
// exists, the first name, and whether the waiver is already signed.
export async function lookupPublicStudent(slug: string, email: string) {
  const academy = await academyBySlug(slug);
  if (!academy || !email.trim()) return { found: false as const };
  const admin = createAdminClient();
  const { data } = await admin
    .from('students')
    .select('id, first_name, waiver_signed')
    .eq('academy_id', academy.id)
    .ilike('email', norm(email))
    .limit(1)
    .maybeSingle();
  if (!data) return { found: false as const };
  return { found: true as const, first_name: data.first_name, waiver_signed: !!data.waiver_signed };
}

export async function publicEnroll(input: {
  slug: string;
  campId: string;
  email: string;
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
  } | null;
  accept_waiver: boolean;
  signed_name?: string | null;
}): Promise<{ ok: boolean; error?: string; summary?: { class_name: string; date: string; time: string | null; amount_cents: number | null; sale_type: string; coupon_applied: string | null; first_name: string } }> {
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
  if (!camp || !['class', 'trip'].includes(tpl?.service_kind)) return { ok: false, error: 'Class not found.' };
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
    const today = new Date().toISOString().slice(0, 10);
    if (!cp || !cp.active) return { ok: false, error: 'That code is not valid.' };
    if (cp.expires_on && cp.expires_on < today) return { ok: false, error: 'That code has expired.' };
    if (cp.max_uses != null && cp.uses >= cp.max_uses) return { ok: false, error: 'That code has no uses left.' };
    coupon = cp;
  }

  // 3. The student — existing by email, or created from the profile form.
  let studentId: string;
  let firstName: string;
  const { data: existing } = await admin
    .from('students')
    .select('id, first_name, waiver_signed')
    .eq('academy_id', academy.id)
    .ilike('email', email)
    .limit(1)
    .maybeSingle();

  if (existing) {
    studentId = existing.id;
    firstName = existing.first_name;
    if (!existing.waiver_signed) {
      if (!input.accept_waiver) return { ok: false, error: 'The waiver must be accepted to join.' };
      await admin.from('students').update({
        waiver_signed: true,
        waiver_signed_at: new Date().toISOString(),
        waiver_signed_by: input.signed_name?.trim() || existing.first_name,
      }).eq('id', existing.id);
    }
    if (active.some((p: any) => p.student_id === existing.id)) {
      return { ok: false, error: 'You are already enrolled in this class.' };
    }
  } else {
    const p = input.profile;
    if (!p?.first_name?.trim()) return { ok: false, error: 'We could not find that email — complete your profile to join.' };
    if (!input.accept_waiver) return { ok: false, error: 'The waiver must be accepted to join.' };
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
        status: 'active',
        lifecycle_status: 'lead',
        student_type: 'drop_in',
        how_did_you_hear: 'class_qr',
        waiver_signed: true,
        waiver_signed_at: new Date().toISOString(),
        waiver_signed_by: input.signed_name?.trim() || p.first_name.trim(),
      })
      .select('id, first_name')
      .single();
    if (createErr || !created) return { ok: false, error: 'Could not create your profile — try again or ask at front desk.' };
    studentId = created.id;
    firstName = created.first_name;
  }

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

  const { error: enrollErr } = await admin.from('camp_participants').insert({
    camp_instance_id: (camp as any).id,
    student_id: studentId,
    enrollment_status: 'active',
    payment_status: sale_type === 'courtesy' ? 'paid' : 'reserved',
    reserved_at: new Date().toISOString(),
    ...(sale_type === 'courtesy' ? { paid_at: new Date().toISOString(), payment_method: 'coupon' } : {}),
    ...(amount != null ? { amount_cents: amount } : {}),
    ...(list != null ? { list_price_cents: list } : {}),
    sale_type,
    ...(reason ? { discount_reason: reason } : {}),
  });
  if (enrollErr) return { ok: false, error: 'Could not save your spot — ask at front desk.' };

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
    },
  };
}
