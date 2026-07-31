'use server';

// HOST ("Servicio al cliente") — mezcla de vendedor + recepción + seguimiento
// de clientes. Ve lo que pasa, cobra, vende y persigue fichas incompletas.
// NO asigna coaches, NO ve costos/márgenes, NO evalúa ni promueve cintas.

import { createAdminClient } from '@/lib/supabase/admin';
import { sendIntakeLinkEmail } from '@/lib/actions/email';

async function resolveHost(token: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from('coaches')
    .select('id, display_name, academy_id, role, active_status')
    .eq('portal_token', token)
    .maybeSingle();
  if (!data || !data.active_status) return null;
  return ['host', 'admin', 'coordinator'].includes((data as any).role) ? data : null;
}

// ── Fichas del cliente: el semáforo que el host persigue ──────────
export interface HostStudentRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  belt: string | null;
  waiver: boolean;
  intake: boolean;
  quiz: boolean;
  lifecycle: string | null;
  intake_url: string | null;
  portal_url: string | null;
}

const BASE = () => process.env.NEXT_PUBLIC_APP_URL || 'https://app.thesurfsequence.com';

function toRow(s: any): HostStudentRow {
  return {
    id: s.id,
    name: [s.first_name, s.last_name].filter(Boolean).join(' '),
    email: s.email ?? null,
    phone: s.phone ?? null,
    belt: s.belt_level ?? null,
    waiver: !!s.waiver_signed,
    intake: !!s.intake_completed_at,
    quiz: !!s.level_quiz_completed_at,
    lifecycle: s.lifecycle_status ?? null,
    intake_url: s.portal_token ? `${BASE()}/intake/${s.portal_token}` : null,
    portal_url: s.portal_token ? `${BASE()}/portal/${s.portal_token}` : null,
  };
}

const STUDENT_COLS = 'id, first_name, last_name, email, phone, belt_level, waiver_signed, intake_completed_at, level_quiz_completed_at, lifecycle_status, portal_token, status, created_at';

// Buscar clientes por nombre/email/teléfono.
export async function hostSearchStudents(token: string, q: string): Promise<HostStudentRow[]> {
  const who = await resolveHost(token);
  if (!who?.academy_id || !q.trim()) return [];
  const term = `%${q.trim()}%`;
  const admin = createAdminClient();
  const { data } = await admin
    .from('students')
    .select(STUDENT_COLS)
    .eq('academy_id', who.academy_id)
    .eq('status', 'active')
    .or(`first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`)
    .order('created_at', { ascending: false })
    .limit(20);
  return (data ?? []).map(toRow);
}

// "Necesitan atención": inscritos en servicios PRÓXIMOS con alguna ficha
// incompleta — la lista de persecución diaria del host.
export async function hostAttentionList(token: string): Promise<HostStudentRow[]> {
  const who = await resolveHost(token);
  if (!who?.academy_id) return [];
  const admin = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const horizon = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
  const { data: seats } = await admin
    .from('camp_participants')
    .select('student_id, camp_instances:camp_instance_id!inner(academy_id, start_date)')
    .eq('camp_instances.academy_id', who.academy_id)
    .gte('camp_instances.start_date', today)
    .lte('camp_instances.start_date', horizon)
    .eq('enrollment_status', 'active');
  const ids = [...new Set((seats ?? []).map((s: any) => s.student_id).filter(Boolean))];
  if (!ids.length) return [];
  const { data } = await admin
    .from('students')
    .select(STUDENT_COLS)
    .in('id', ids)
    .eq('status', 'active')
    .or('waiver_signed.eq.false,intake_completed_at.is.null,level_quiz_completed_at.is.null');
  return (data ?? []).map(toRow).sort((a, b) => Number(a.waiver) - Number(b.waiver));
}

// Ficha completa de un cliente: bitácora resumida + membresía + incidentes.
export async function hostStudentDetail(token: string, studentId: string) {
  const who = await resolveHost(token);
  if (!who?.academy_id) return null;
  const admin = createAdminClient();
  const { data: s } = await admin
    .from('students')
    .select(`${STUDENT_COLS}, ocean_level, medical_notes, emergency_contact_name, emergency_contact_phone, primary_goal, goal_short_term, fears_phobias, injuries, surf_experience_years, age`)
    .eq('id', studentId)
    .eq('academy_id', who.academy_id)
    .maybeSingle();
  if (!s) return null;

  const today = new Date().toISOString().slice(0, 10);
  const [{ data: next }, { data: sessions }, { data: incidents }, membership] = await Promise.all([
    admin.from('camp_participants')
      .select('payment_status, amount_cents, camp_instances:camp_instance_id!inner(camp_name, start_date, scheduled_time)')
      .eq('student_id', studentId).eq('enrollment_status', 'active')
      .gte('camp_instances.start_date', today)
      .order('camp_instances(start_date)').limit(3),
    admin.from('student_session_results')
      .select('created_at, status, coach_feedback, whats_next')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false }).limit(5),
    admin.from('session_incidents')
      .select('created_at, incident_type, description, action_taken')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false }).limit(3),
    import('@/lib/actions/memberships').then((m) => m.getMembershipInfo(studentId)).catch(() => null),
  ]);

  return {
    student: toRow(s),
    ocean_level: (s as any).ocean_level ?? null,
    medical_notes: (s as any).medical_notes ?? null,
    goals: [(s as any).primary_goal, (s as any).goal_short_term].filter(Boolean).join(' · ') || null,
    fears: (s as any).fears_phobias ?? null,
    injuries: (s as any).injuries ?? null,
    experience: (s as any).surf_experience_years != null ? `${(s as any).surf_experience_years} años surfeando` : null,
    age: (s as any).age ?? null,
    emergency: [(s as any).emergency_contact_name, (s as any).emergency_contact_phone].filter(Boolean).join(' · ') || null,
    upcoming: (next ?? []).map((p: any) => {
      const c = Array.isArray(p.camp_instances) ? p.camp_instances[0] : p.camp_instances;
      return { name: c?.camp_name, date: c?.start_date, time: c?.scheduled_time, paid: p.payment_status === 'paid', amount_cents: p.amount_cents };
    }),
    sessions: sessions ?? [],
    incidents: incidents ?? [],
    membership,
  };
}

// Incidentes recientes de la academia (visibilidad, no gestión).
export async function hostRecentIncidents(token: string) {
  const who = await resolveHost(token);
  if (!who?.academy_id) return [];
  const admin = createAdminClient();
  const since = new Date(Date.now() - 14 * 86400000).toISOString();
  const { data } = await admin
    .from('session_incidents')
    .select('id, created_at, incident_type, student_name, description, action_taken, coaches:coach_id(display_name)')
    .eq('academy_id', who.academy_id)
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(15);
  return (data ?? []).map((i: any) => ({
    ...i,
    coach: (Array.isArray(i.coaches) ? i.coaches[0] : i.coaches)?.display_name ?? null,
  }));
}

// Enviar el link de intake (ficha + waiver + quiz de nivel) por email.
export async function hostSendIntakeEmail(token: string, studentId: string): Promise<{ ok: boolean; error?: string }> {
  const who = await resolveHost(token);
  if (!who?.academy_id) return { ok: false, error: 'No autorizado.' };
  const admin = createAdminClient();
  const { data: s } = await admin
    .from('students')
    .select('first_name, email, portal_token, academy_id')
    .eq('id', studentId)
    .eq('academy_id', who.academy_id)
    .maybeSingle();
  if (!s) return { ok: false, error: 'Cliente no encontrado.' };
  if (!s.email) return { ok: false, error: 'Este cliente no tiene email — usá el botón de copiar link y mandalo por WhatsApp.' };
  if (!s.portal_token) return { ok: false, error: 'Este cliente no tiene link de intake.' };
  const r = await sendIntakeLinkEmail({ toEmail: s.email, firstName: s.first_name, intakeUrl: `${BASE()}/intake/${s.portal_token}` });
  return r.success ? { ok: true } : { ok: false, error: r.error };
}
