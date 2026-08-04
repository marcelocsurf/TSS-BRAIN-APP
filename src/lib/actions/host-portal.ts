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
    .select(`${STUDENT_COLS}, ocean_level, medical_notes, emergency_contact_name, emergency_contact_phone, primary_goal, goal_short_term, goal_mid_term, goal_long_term, personal_goal, biggest_barrier, fears_phobias, injuries, allergies, surf_experience_years, surf_frequency, board_type, goofy_or_regular, favorite_wave_size, age, languages, height, weight, surf_self_level`)
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
    goal_mid: (s as any).goal_mid_term ?? null,
    goal_long: (s as any).goal_long_term ?? null,
    week_wish: (s as any).personal_goal ?? null,
    barrier: (s as any).biggest_barrier ?? null,
    fears: (s as any).fears_phobias ?? null,
    injuries: (s as any).injuries ?? null,
    allergies: (s as any).allergies ?? null,
    experience: (s as any).surf_experience_years ?? null,
    frequency: (s as any).surf_frequency ?? null,
    board: (s as any).board_type ?? null,
    stance: (s as any).goofy_or_regular ?? null,
    wave_size: (s as any).favorite_wave_size ?? null,
    self_level: (s as any).surf_self_level ?? null,
    age: (s as any).age ?? null,
    languages: (s as any).languages ?? null,
    body: [(s as any).height, (s as any).weight].filter(Boolean).join(' · ') || null,
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

// ── OPERACIÓN: la línea de tiempo del día (reemplaza el Excel semanal) ──
// Todo lo que pasa en una fecha: servicios/camps con coach, alumnos y su
// semáforo, avance del camp (día X de Y), espacio reservado y transporte.
export interface HostDayEvent {
  camp_id: string;
  name: string;
  kind: string | null;
  time: string | null;
  coach: string | null;
  day_number: number | null;
  total_days: number | null;
  session_status: string | null;
  capacity: number;
  enrolled: number;
  students: { name: string; paid: boolean; waiver: boolean }[];
  spaces: string[];
  transport: { depart: string | null; ret: string | null; status: string | null } | null;
  venue: string | null;
  price_cents: number | null;
}

export async function hostDayOperation(token: string, dateISO: string): Promise<HostDayEvent[]> {
  const who = await resolveHost(token);
  if (!who?.academy_id) return [];
  const admin = createAdminClient();

  const { data: instances } = await admin
    .from('camp_instances')
    .select(`id, camp_name, start_date, end_date, scheduled_time, capacity_override, status,
      camp_templates:template_id(template_name, service_kind, capacity_max, list_price_cents),
      coaches:coach_id(display_name),
      hc:head_coach_id(display_name),
      camp_participants(enrollment_status, payment_status, students(first_name, last_name, waiver_signed)),
      camp_sessions(id, day_number, session_date, session_status)`)
    .eq('academy_id', who.academy_id)
    .lte('start_date', dateISO)
    .gte('end_date', dateISO)
    .neq('status', 'cancelled');

  const ids = (instances ?? []).map((i: any) => i.id);
  if (!ids.length) return [];

  // Espacios y transporte del día, en paralelo.
  const dayStart = `${dateISO}T00:00:00-06:00`, dayEnd = `${dateISO}T23:59:59-06:00`;
  const sessionIds = (instances ?? []).flatMap((i: any) => (i.camp_sessions ?? []).filter((s: any) => s.session_date === dateISO).map((s: any) => s.id));
  const [{ data: spaces }, { data: plans }] = await Promise.all([
    admin.from('space_bookings')
      .select('camp_instance_id, starts_at, academy_spaces:space_id(name)')
      .in('camp_instance_id', ids)
      .gte('starts_at', dayStart).lte('starts_at', dayEnd)
      .neq('status', 'cancelled'),
    sessionIds.length
      ? admin.from('service_plans')
          .select('camp_instance_id, camp_session_id, transport_needed, transport_depart, transport_return, transport_status, surf_venue, class_start_time')
          .in('camp_session_id', sessionIds)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const spacesByCamp = new Map<string, string[]>();
  for (const sp of (spaces as any[]) ?? []) {
    const nm = (Array.isArray(sp.academy_spaces) ? sp.academy_spaces[0] : sp.academy_spaces)?.name;
    if (!nm) continue;
    const hh = new Date(sp.starts_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/El_Salvador' });
    spacesByCamp.set(sp.camp_instance_id, [...(spacesByCamp.get(sp.camp_instance_id) ?? []), `${nm} ${hh}`]);
  }
  const planByCamp = new Map<string, any>();
  for (const p of (plans as any[]) ?? []) planByCamp.set(p.camp_instance_id, p);

  const events: HostDayEvent[] = ((instances ?? []) as any[]).map((i: any) => {
    const tpl = Array.isArray(i.camp_templates) ? i.camp_templates[0] : i.camp_templates;
    const hcRow = Array.isArray((i as any).hc) ? (i as any).hc[0] : (i as any).hc;
    const coach = hcRow ?? (Array.isArray(i.coaches) ? i.coaches[0] : i.coaches);
    const act = (i.camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active');
    const session = (i.camp_sessions ?? []).find((s: any) => s.session_date === dateISO) ?? null;
    const plan = planByCamp.get(i.id);
    return {
      camp_id: i.id,
      name: (i.camp_name ?? tpl?.template_name ?? '').split(' · ')[0],
      kind: tpl?.service_kind ?? null,
      time: plan?.class_start_time ?? i.scheduled_time ?? null,
      coach: coach?.display_name ?? null,
      day_number: session?.day_number ?? null,
      total_days: (i.camp_sessions ?? []).length || null,
      session_status: session?.session_status ?? null,
      capacity: i.capacity_override ?? tpl?.capacity_max ?? 0,
      price_cents: tpl?.list_price_cents ?? null,
      enrolled: act.length,
      students: act.map((p: any) => {
        const st = Array.isArray(p.students) ? p.students[0] : p.students;
        return { name: [st?.first_name, st?.last_name].filter(Boolean).join(' '), paid: p.payment_status === 'paid', waiver: !!st?.waiver_signed };
      }),
      spaces: spacesByCamp.get(i.id) ?? [],
      transport: plan?.transport_needed
        ? { depart: plan.transport_depart, ret: plan.transport_return, status: plan.transport_status }
        : null,
      venue: plan?.surf_venue ?? null,
    };
  });

  return events.sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'));
}
