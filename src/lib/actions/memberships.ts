'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createNotification } from '@/lib/actions/notifications';

// ── Membresías (M156) ──────────────────────────────────────────
// Un camp incluye 6 meses de acceso al portal. Al vencer, los datos quedan
// intactos y el portal muestra la pantalla de renovación. El alumno SOLICITA;
// el coordinador confirma el pago (mismo patrón de confianza que el seller).

const MEMBERSHIP_PLANS = [
  { months: 1, cents: 999, label: '1 month' },
  { months: 6, cents: 4999, label: '6 months' },
  { months: 12, cents: 9990, label: '12 months' },
] as const;

export interface MembershipInfo {
  active: boolean;
  ends_at: string | null;        // vencimiento vigente (fila active más lejana)
  pending_request: boolean;      // ya pidió renovación, espera confirmación
  days_left: number | null;
}

// Extiende (o crea) la membresía sumando meses AL FINAL de la vigente —
// nunca se pierden meses ya pagados. Fila nueva siempre (historial).
export async function extendMembership(
  studentId: string,
  months: number,
  source: 'camp_enrollment' | 'renewal' | 'launch_gift',
  opts?: { amountCents?: number | null; paymentMethod?: string | null; createdBy?: string | null; note?: string | null }
): Promise<void> {
  const admin = createAdminClient();
  const { data: student } = await admin.from('students').select('academy_id').eq('id', studentId).maybeSingle();
  const { data: latest } = await admin
    .from('memberships')
    .select('ends_at')
    .eq('student_id', studentId)
    .eq('status', 'active')
    .order('ends_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const base = latest?.ends_at && new Date(latest.ends_at) > new Date() ? new Date(latest.ends_at) : new Date();
  const starts = base.toISOString();
  base.setMonth(base.getMonth() + months);
  await admin.from('memberships').insert({
    student_id: studentId,
    academy_id: student?.academy_id ?? null,
    source,
    months,
    starts_at: starts,
    ends_at: base.toISOString(),
    amount_cents: opts?.amountCents ?? null,
    payment_method: opts?.paymentMethod ?? null,
    created_by: opts?.createdBy ?? null,
    note: opts?.note ?? null,
    status: 'active',
  });
}

export async function getMembershipInfo(studentId: string): Promise<MembershipInfo> {
  const admin = createAdminClient();
  const [{ data: latest }, { count: pending }] = await Promise.all([
    admin.from('memberships').select('ends_at').eq('student_id', studentId).eq('status', 'active')
      .order('ends_at', { ascending: false }).limit(1).maybeSingle(),
    admin.from('memberships').select('id', { count: 'exact', head: true }).eq('student_id', studentId).eq('status', 'requested'),
  ]);
  const ends = latest?.ends_at ?? null;
  const active = !!ends && new Date(ends) > new Date();
  const days = ends ? Math.ceil((new Date(ends).getTime() - Date.now()) / 86400000) : null;
  return { active, ends_at: ends, pending_request: (pending ?? 0) > 0, days_left: days };
}

// El alumno (token del portal) pide renovar: fila 'requested' + aviso a los
// coordinadores. Nada de pagos acá — el coordinador cobra y confirma.
export async function requestMembershipRenewal(portalToken: string, months: number): Promise<{ ok: boolean; error?: string }> {
  const plan = MEMBERSHIP_PLANS.find((p) => p.months === months);
  if (!plan) return { ok: false, error: 'Invalid plan.' };
  const admin = createAdminClient();
  const { data: student } = await admin
    .from('students')
    .select('id, academy_id, first_name, last_name')
    .eq('portal_token', portalToken)
    .maybeSingle();
  if (!student) return { ok: false, error: 'Student not found.' };

  const { count } = await admin.from('memberships').select('id', { count: 'exact', head: true })
    .eq('student_id', student.id).eq('status', 'requested');
  if ((count ?? 0) > 0) return { ok: true }; // ya hay una pendiente — idempotente

  const now = new Date();
  const { error } = await admin.from('memberships').insert({
    student_id: student.id,
    academy_id: student.academy_id,
    source: 'renewal',
    months: plan.months,
    starts_at: now.toISOString(),
    ends_at: now.toISOString(), // se recalcula al confirmar
    amount_cents: plan.cents,
    status: 'requested',
  });
  if (error) return { ok: false, error: error.message };

  const name = [student.first_name, student.last_name].filter(Boolean).join(' ');
  const { data: coords } = await admin.from('coaches').select('id')
    .eq('academy_id', student.academy_id).in('role', ['coordinator', 'admin']).eq('active_status', true);
  for (const c of coords ?? []) {
    await createNotification({
      recipientCoachId: c.id,
      type: 'membership_renewal',
      title: `Renovación de membresía: ${name}`,
      body: `${plan.label} · $${(plan.cents / 100).toFixed(2)} — cobrar y confirmar desde su perfil.`,
      link: `/students/${student.id}`,
      metadata: { studentId: student.id, months: plan.months },
    }).catch(() => {});
  }
  return { ok: true };
}

// Coordinador/admin confirma el pago de la solicitud → extiende de verdad.
export async function confirmMembershipRenewal(studentId: string, paymentMethod?: string): Promise<{ ok: boolean; error?: string }> {
  const { getCurrentCoach, isCoordinatorOrAbove } = await import('@/lib/actions/auth');
  const me = await getCurrentCoach().catch(() => null);
  if (!me || !(await isCoordinatorOrAbove(me.role))) return { ok: false, error: 'Solo coordinador o admin.' };
  const admin = createAdminClient();
  const { data: req } = await admin.from('memberships').select('id, months, amount_cents')
    .eq('student_id', studentId).eq('status', 'requested')
    .order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (!req) return { ok: false, error: 'No hay solicitud pendiente.' };
  await admin.from('memberships').update({ status: 'cancelled', note: 'convertida al confirmar' }).eq('id', req.id);
  await extendMembership(studentId, req.months, 'renewal', {
    amountCents: req.amount_cents, paymentMethod: paymentMethod ?? 'manual', createdBy: (me as any).id ?? null,
  });
  return { ok: true };
}

// Coordinador/admin OTORGA membresía a mano (alta inicial, regalo de
// lanzamiento, cortesía). Esto es lo que "abre" el portal a un member.
export async function grantMembership(studentId: string, months: number, gift = false): Promise<{ ok: boolean; error?: string; portal_url?: string }> {
  const { getCurrentCoach, isCoordinatorOrAbove } = await import('@/lib/actions/auth');
  const me = await getCurrentCoach().catch(() => null);
  if (!me || !(await isCoordinatorOrAbove(me.role))) return { ok: false, error: 'Solo coordinador o admin.' };
  if (![1, 6, 12].includes(months)) return { ok: false, error: 'Plan inválido.' };
  await extendMembership(studentId, months, gift ? 'launch_gift' : 'renewal', {
    paymentMethod: gift ? 'gift' : 'manual', createdBy: (me as any).id ?? null,
    note: gift ? 'Otorgada manualmente (regalo/lanzamiento)' : 'Otorgada manualmente desde el perfil',
  });
  const admin = createAdminClient();
  const { data: st } = await admin.from('students').select('portal_token').eq('id', studentId).maybeSingle();
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://app.thesurfsequence.com';
  return { ok: true, portal_url: st?.portal_token ? `${base}/portal/${st.portal_token}` : undefined };
}
