'use server';

// HOST ("Servicio al cliente") — mezcla de vendedor + recepción + seguimiento
// de clientes. Ve lo que pasa, cobra, vende y persigue fichas incompletas.
// NO asigna coaches, NO ve costos/márgenes, NO evalúa ni promueve cintas.

import { createAdminClient } from '@/lib/supabase/admin';
import { elSalvadorToday } from '@/lib/utils/tz';
import { ageFromDob } from '@/lib/utils/age';
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

// MODO COBERTURA: el host puede cubrir coordinación (asignar coach,
// reprogramar/cancelar una clase de un día) los días que el coordinador
// no está. Regla: coordinador/admin siempre; host según el switch
// portal_can_coordinate (si la columna aún no existe, todos los hosts).
async function hostCanCoordinate(who: { id: string; role: string }): Promise<boolean> {
  if (['admin', 'coordinator'].includes(who.role)) return true;
  if (who.role !== 'host') return false;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('coaches')
    .select('portal_can_coordinate')
    .eq('id', who.id)
    .maybeSingle();
  if (error) return true; // migración 00156 pendiente → hosts habilitados
  return (data as any)?.portal_can_coordinate !== false;
}

export async function hostPortalFlags(token: string): Promise<{ canCoordinate: boolean; academySlug: string | null }> {
  const who = await resolveHost(token);
  if (!who) return { canCoordinate: false, academySlug: null };
  let academySlug: string | null = null;
  if (who.academy_id) {
    const admin = createAdminClient();
    const { data: ac } = await admin.from('academies').select('slug').eq('id', who.academy_id).maybeSingle();
    academySlug = (ac as any)?.slug ?? null;
  }
  return { canCoordinate: await hostCanCoordinate(who as any), academySlug };
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
  const today = elSalvadorToday();
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
    .select(`${STUDENT_COLS}, ocean_level, medical_notes, emergency_contact_name, emergency_contact_phone, primary_goal, goal_short_term, goal_mid_term, goal_long_term, personal_goal, biggest_barrier, fears_phobias, injuries, allergies, surf_experience_years, surf_frequency, board_type, goofy_or_regular, favorite_wave_size, age, languages, height, weight, surf_self_level, date_of_birth, instagram, shirt_size`)
    .eq('id', studentId)
    .eq('academy_id', who.academy_id)
    .maybeSingle();
  if (!s) return null;

  const today = elSalvadorToday();
  const [{ data: next }, { data: sessions }, { data: incidents }, membership] = await Promise.all([
    admin.from('camp_participants')
      .select('payment_status, amount_cents, camp_instances:camp_instance_id!inner(camp_name, start_date, scheduled_time)')
      .eq('student_id', studentId).eq('enrollment_status', 'active')
      .gte('camp_instances.start_date', today)
      .order('camp_instances(start_date)').limit(3),
    admin.from('student_session_results')
      .select('id, created_at, status, coach_feedback, whats_next, feedback_token')
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
    // Edad calculada del cumpleaños (la columna guardada queda vieja).
    age: ageFromDob((s as any).date_of_birth) ?? (s as any).age ?? null,
    dob: (s as any).date_of_birth ?? null,
    shirt: (s as any).shirt_size ?? null,
    height: (s as any).height ?? null,
    weight: (s as any).weight ?? null,
    instagram: (s as any).instagram ?? null,
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
    // Encuesta pendiente: la sesión cerrada más reciente que tiene link y
    // todavía nadie respondió. La encuesta solo salía por correo, así que si
    // el correo era dudoso o no existía, no había forma de recuperarla
    // (reporte de Cony 2026-08-11). Ahora el mostrador la manda por WhatsApp.
    pendingSurvey: await (async () => {
      const withToken = (sessions ?? []).filter((r: any) => r.feedback_token);
      for (const r of withToken) {
        const { count } = await admin
          .from('survey_responses')
          .select('id', { count: 'exact', head: true })
          .eq('session_result_id', (r as any).id);
        if (!count) {
          return { token: (r as any).feedback_token as string, date: (r as any).created_at as string };
        }
      }
      return null;
    })(),
    // Experiencia del camp sin responder (instalaciones/equipo/transporte/
    // value) — mismo patrón de recuperación por WhatsApp que pendingSurvey.
    pendingExperience: await (async () => {
      const { data: exp } = await admin
        .from('camp_experience_surveys')
        .select('token, created_at, camp_instances:camp_instance_id(camp_name)')
        .eq('student_id', studentId)
        .is('submitted_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!exp) return null;
      const inst = Array.isArray((exp as any).camp_instances) ? (exp as any).camp_instances[0] : (exp as any).camp_instances;
      return { token: (exp as any).token as string, campName: (inst?.camp_name as string) ?? null };
    })(),
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
  const r = await sendIntakeLinkEmail({ toEmail: s.email, firstName: s.first_name, intakeUrl: `${BASE()}/intake/${s.portal_token}`, academyId: who.academy_id });
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
  coach_status: string | null;   // 'pending' = invitado, aún sin aceptar
  capacity: number;
  enrolled: number;
  // El asiento completo, igual que en el mostrador: la Agenda muestra el
  // MISMO bloque de contacto/trazabilidad (SeatContactPanel) para que el host
  // no tenga que cambiar de pestaña para saber quién es cada alumno.
  // Cobrar/ajustar sigue viviendo SOLO en Hoy.
  students: {
    participant_id: string;
    student_id: string | null;
    name: string;
    paid: boolean;
    waiver: boolean;
    phone: string | null;
    email: string | null;
    room_number: string | null;
    notes: string | null;
    reserved_at: string | null;
    booked_via: string | null;
  }[];
  spaces: string[];
  transport: { plan_id: string | null; depart: string | null; ret: string | null; status: string | null } | null;
  venue: string | null;
  price_cents: number | null;
}

export async function hostDayOperation(token: string, dateISO: string): Promise<HostDayEvent[]> {
  const who = await resolveHost(token);
  if (!who?.academy_id) return [];
  const admin = createAdminClient();

  const { data: instances } = await admin
    .from('camp_instances')
    .select(`id, camp_name, start_date, end_date, scheduled_time, capacity_override, status, head_coach_status,
      camp_templates:template_id(template_name, service_kind, capacity_max, list_price_cents),
      coaches:coach_id(display_name),
      hc:head_coach_id(display_name),
      camp_participants(id, enrollment_status, payment_status, room_number, notes, reserved_at, sold_by, seller:sold_by(display_name), students(id, first_name, last_name, waiver_signed, phone, email)),
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
          .select('id, camp_instance_id, camp_session_id, transport_needed, transport_depart, transport_return, transport_status, surf_venue, class_start_time')
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
      coach_status: hcRow ? (i.head_coach_status ?? null) : null,
      day_number: session?.day_number ?? null,
      total_days: (i.camp_sessions ?? []).length || null,
      session_status: session?.session_status ?? null,
      capacity: i.capacity_override ?? tpl?.capacity_max ?? 0,
      price_cents: tpl?.list_price_cents ?? null,
      enrolled: act.length,
      students: act.map((p: any) => {
        const st = Array.isArray(p.students) ? p.students[0] : p.students;
        const seller = Array.isArray(p.seller) ? p.seller[0] : p.seller;
        return {
          participant_id: p.id,
          student_id: st?.id ?? null,
          name: [st?.first_name, st?.last_name].filter(Boolean).join(' '),
          paid: p.payment_status === 'paid',
          waiver: !!st?.waiver_signed,
          phone: st?.phone ?? null,
          email: st?.email ?? null,
          room_number: p.room_number ?? null,
          notes: p.notes ?? null,
          reserved_at: p.reserved_at ?? null,
          booked_via: p.sold_by ? (seller?.display_name ?? 'Mostrador') : 'QR (auto-servicio)',
        };
      }),
      spaces: spacesByCamp.get(i.id) ?? [],
      transport: plan?.transport_needed
        ? { plan_id: plan.id ?? null, depart: plan.transport_depart, ret: plan.transport_return, status: plan.transport_status }
        : null,
      venue: plan?.surf_venue ?? null,
    };
  });

  return events.sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'));
}

// ── Clase fuera de horario (pedido de Rick): el host agenda una sesión
// ad-hoc de una plantilla existente (Skate un martes 2pm, etc.) y ahí
// mismo puede reservar al cliente. Queda como instancia normal del sistema.
export async function hostAdhocTemplates(token: string) {
  const who = await resolveHost(token);
  if (!who?.academy_id) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from('camp_templates')
    .select('id, template_name, service_kind, list_price_cents, session_duration_minutes, capacity_max')
    .eq('academy_id', who.academy_id)
    .eq('active_status', true)
    .in('service_kind', ['class', 'surf_lesson', 'trip'])
    .order('template_name');
  return data ?? [];
}

export async function hostCreateAdhocClass(token: string, input: {
  templateId: string;
  dateISO: string;   // YYYY-MM-DD
  time: string;      // HH:MM
}): Promise<{ ok: boolean; error?: string; camp_id?: string; name?: string }> {
  const who = await resolveHost(token);
  if (!who?.academy_id) return { ok: false, error: 'No autorizado.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.dateISO) || !/^\d{2}:\d{2}$/.test(input.time)) {
    return { ok: false, error: 'Fecha u hora inválida.' };
  }
  const admin = createAdminClient();
  const { data: tpl } = await admin
    .from('camp_templates')
    .select('id, template_name, service_kind')
    .eq('id', input.templateId)
    .eq('academy_id', who.academy_id)
    .maybeSingle();
  if (!tpl || !['class', 'surf_lesson', 'trip'].includes((tpl as any).service_kind)) {
    return { ok: false, error: 'Plantilla no válida.' };
  }
  const d = new Date(input.dateISO + 'T00:00:00');
  const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const h = parseInt(input.time.slice(0, 2), 10);
  const ampm = h === 0 ? '12 AM' : h < 12 ? `${h}${input.time.slice(3) !== '00' ? ':' + input.time.slice(3) : ''} AM` : h === 12 ? `12${input.time.slice(3) !== '00' ? ':' + input.time.slice(3) : ''} PM` : `${h - 12}${input.time.slice(3) !== '00' ? ':' + input.time.slice(3) : ''} PM`;
  const name = `${(tpl as any).template_name} · ${label} · ${ampm}`;

  const { data: inst, error } = await admin.from('camp_instances').insert({
    template_id: tpl.id,
    camp_name: name,
    start_date: input.dateISO,
    end_date: input.dateISO,
    scheduled_time: input.time,
    modality: 'group',
    status: 'planned',
    academy_id: who.academy_id,
  }).select('id').single();
  if (error || !inst) return { ok: false, error: error?.message ?? 'No se pudo crear.' };
  await admin.from('camp_sessions').insert({
    camp_instance_id: inst.id, day_number: 1, session_date: input.dateISO, session_status: 'planned',
  });
  // Aviso a coordinación: hay una clase nueva fuera de la parrilla, asignarle coach.
  const { createNotification } = await import('@/lib/actions/notifications');
  const { data: coords } = await admin.from('coaches').select('id').eq('academy_id', who.academy_id).in('role', ['coordinator', 'admin']).eq('active_status', true);
  for (const c of coords ?? []) {
    await createNotification({
      recipientCoachId: c.id, type: 'adhoc_class',
      title: `Clase fuera de horario: ${name}`,
      body: `Creada por ${who.display_name ?? 'host'} desde el mostrador — asignale coach.`,
      link: null, metadata: { campInstanceId: inst.id },
    }).catch(() => {});
  }
  return { ok: true, camp_id: inst.id, name };
}

// ── SEMÁFORO DEL DÍA: los incendios del coordinador, visibles al host ──
// Clases de hoy sin coach / con invitación sin aceptar, sesiones pasadas
// sin cierre (última semana) y grupos en sobrecupo. Solo lectura.
export interface HostDayAlerts {
  no_coach: string[];
  pending_coach: string[];
  overcap: string[];
  unclosed: { service: string; date: string; coach: string | null }[];
}

export async function hostDayAlerts(token: string): Promise<HostDayAlerts | null> {
  const who = await resolveHost(token);
  if (!who?.academy_id) return null;
  const admin = createAdminClient();
  const today = new Date(Date.now() - 6 * 3600_000).toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  const [{ data: todays }, { data: past }] = await Promise.all([
    admin.from('camp_instances')
      .select(`id, camp_name, status, head_coach_id, head_coach_status, coach_id, capacity_override,
        camp_templates:template_id(template_name, capacity_max),
        camp_participants(enrollment_status)`)
      .eq('academy_id', who.academy_id)
      .lte('start_date', today).gte('end_date', today)
      .neq('status', 'cancelled'),
    admin.from('camp_sessions')
      .select(`session_date, session_status, camp_instances:camp_instance_id!inner(
        academy_id, camp_name, status, head_coach_id, head_coach_status,
        coaches:coach_id(display_name), hc:head_coach_id(display_name),
        camp_participants(enrollment_status))`)
      .gte('session_date', weekAgo).lt('session_date', today)
      .neq('session_status', 'completed'),
  ]);

  const alerts: HostDayAlerts = { no_coach: [], pending_coach: [], overcap: [], unclosed: [] };
  for (const i of (todays as any[]) ?? []) {
    const tpl = Array.isArray(i.camp_templates) ? i.camp_templates[0] : i.camp_templates;
    const name = (i.camp_name ?? tpl?.template_name ?? '').split(' · ')[0];
    const accepted = i.head_coach_id && i.head_coach_status === 'accepted';
    if (!accepted && !i.coach_id) {
      (i.head_coach_id ? alerts.pending_coach : alerts.no_coach).push(name);
    }
    const cap = i.capacity_override ?? tpl?.capacity_max ?? 0;
    const act = (i.camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active').length;
    if (cap > 0 && act > cap) alerts.overcap.push(`${name} ${act}/${cap}`);
  }
  for (const s of (past as any[]) ?? []) {
    const inst = Array.isArray(s.camp_instances) ? s.camp_instances[0] : s.camp_instances;
    if (!inst || inst.academy_id !== who.academy_id || inst.status === 'cancelled') continue;
    const active = (inst.camp_participants ?? []).some((p: any) => p.enrollment_status === 'active');
    if (!active) continue; // clases vacías que pasaron sin cierre = ruido
    const hcRow = Array.isArray(inst.hc) ? inst.hc[0] : inst.hc;
    const useHead = inst.head_coach_id && inst.head_coach_status === 'accepted';
    const coach = useHead ? hcRow : (Array.isArray(inst.coaches) ? inst.coaches[0] : inst.coaches);
    alerts.unclosed.push({
      service: (inst.camp_name ?? '').split(' · ')[0],
      date: s.session_date,
      coach: coach?.display_name ?? null,
    });
  }
  alerts.unclosed.sort((a, b) => b.date.localeCompare(a.date));
  return alerts;
}

// ── MODO COBERTURA 1/3: asignar coach a un servicio ───────────────
// Mismo flujo que el dashboard (updateCampHeadCoach): invitación con
// estado 'pending' que el coach acepta o rechaza desde su portal.
export async function hostCoachOptions(token: string) {
  const who = await resolveHost(token);
  if (!who?.academy_id || !(await hostCanCoordinate(who as any))) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from('coaches')
    .select('id, display_name, certification_level, role')
    .eq('academy_id', who.academy_id)
    .eq('active_status', true)
    .in('role', ['coach', 'head_coach', 'coordinator'])
    .order('display_name');
  return data ?? [];
}

export async function hostAssignCoach(token: string, campId: string, coachId: string): Promise<{ ok: boolean; error?: string; coachName?: string }> {
  const who = await resolveHost(token);
  if (!who?.academy_id) return { ok: false, error: 'No autorizado.' };
  if (!(await hostCanCoordinate(who as any))) return { ok: false, error: 'Tu cuenta no tiene modo cobertura activado.' };
  const admin = createAdminClient();

  const [{ data: camp }, { data: coach }] = await Promise.all([
    admin.from('camp_instances')
      .select('id, camp_name, start_date, end_date, scheduled_time, status, camp_templates:template_id(duration_days)')
      .eq('id', campId).eq('academy_id', who.academy_id).maybeSingle(),
    admin.from('coaches')
      .select('id, first_name, display_name, email, portal_token, academy_id, active_status')
      .eq('id', coachId).maybeSingle(),
  ]);
  if (!camp || (camp as any).status === 'cancelled') return { ok: false, error: 'Servicio no encontrado.' };
  if (!coach || coach.academy_id !== who.academy_id || !coach.active_status) return { ok: false, error: 'Coach no válido.' };

  const { error } = await admin.from('camp_instances').update({
    head_coach_id: coachId,
    head_coach_status: 'pending',
    head_coach_responded_at: null,
    head_coach_response_note: null,
    head_coach_assigned_by: who.id,
  }).eq('id', campId);
  if (error) return { ok: false, error: error.message };

  // Invitación al coach (in-app + email) — AWAITED: en serverless lo que
  // no se espera, muere. Misma copy que el flujo del coordinador.
  const { formatServiceWhen } = await import('@/lib/utils/format-date');
  const tpl = Array.isArray((camp as any).camp_templates) ? (camp as any).camp_templates[0] : (camp as any).camp_templates;
  const dateRange = formatServiceWhen({
    startDate: (camp as any).start_date,
    endDate: (camp as any).end_date,
    scheduledTime: (camp as any).scheduled_time,
    durationDays: tpl?.duration_days,
  });
  const { createNotification } = await import('@/lib/actions/notifications');
  await createNotification({
    recipientCoachId: coach.id,
    type: 'assignment',
    title: `New service to confirm: ${(camp as any).camp_name}`,
    body: `${dateRange}. Please accept or decline so your coordinator knows.`,
    link: coach.portal_token ? `/coach-portal/${coach.portal_token}` : null,
    metadata: { campInstanceId: campId },
  }).catch(() => {});
  if (coach.email) {
    const { sendAssignmentEmail } = await import('@/lib/actions/email');
    await sendAssignmentEmail({
      toEmail: coach.email,
      coachFirstName: coach.first_name || 'Coach',
      serviceName: (camp as any).camp_name,
      dateRange,
      portalUrl: coach.portal_token ? `${BASE()}/coach-portal/${coach.portal_token}` : BASE(),
      academyId: who.academy_id,
    }).catch(() => {});
  }
  // Trazabilidad: coordinación se entera de que el host cubrió esto.
  const { data: coords } = await admin.from('coaches').select('id').eq('academy_id', who.academy_id).in('role', ['coordinator', 'admin']).eq('active_status', true).neq('id', who.id);
  for (const c of coords ?? []) {
    await createNotification({
      recipientCoachId: c.id, type: 'assignment',
      title: `Coach invitado desde el mostrador: ${(camp as any).camp_name}`,
      body: `${who.display_name ?? 'Host'} invitó a ${coach.display_name} (${dateRange}). Queda pendiente de aceptación.`,
      link: null, metadata: { campInstanceId: campId },
    }).catch(() => {});
  }
  return { ok: true, coachName: coach.display_name ?? undefined };
}

// ── MODO COBERTURA 2/3 y 3/3: reprogramar o cancelar una clase de UN día
// (class / surf_lesson / trip). Camps multi-día quedan fuera a propósito.
async function loadSingleDayClass(admin: any, campId: string, academyId: string) {
  const { data: camp } = await admin
    .from('camp_instances')
    .select(`id, camp_name, start_date, end_date, scheduled_time, status, head_coach_id, head_coach_status, coach_id,
      camp_templates:template_id(template_name, service_kind),
      camp_sessions(id, session_date, session_status),
      camp_participants(enrollment_status, payment_status, students(first_name, last_name))`)
    .eq('id', campId).eq('academy_id', academyId).maybeSingle();
  if (!camp || camp.status === 'cancelled') return { error: 'Servicio no encontrado.' };
  const tpl = Array.isArray(camp.camp_templates) ? camp.camp_templates[0] : camp.camp_templates;
  if (camp.start_date !== camp.end_date || !['class', 'surf_lesson', 'trip'].includes(tpl?.service_kind)) {
    return { error: 'Solo clases de un día — los camps los mueve coordinación.' };
  }
  const session = (camp.camp_sessions ?? [])[0] ?? null;
  if (session?.session_status === 'completed') return { error: 'Esta sesión ya tiene cierre — no se puede modificar.' };
  return { camp, tpl, session };
}

function classLabel(dateISO: string, time: string) {
  const d = new Date(dateISO + 'T00:00:00');
  const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const h = parseInt(time.slice(0, 2), 10);
  const mm = time.slice(3) !== '00' ? ':' + time.slice(3) : '';
  const ampm = h === 0 ? `12${mm} AM` : h < 12 ? `${h}${mm} AM` : h === 12 ? `12${mm} PM` : `${h - 12}${mm} PM`;
  return `${label} · ${ampm}`;
}

async function notifyClassChange(admin: any, who: any, campId: string, title: string, body: string, effectiveCoachId: string | null) {
  const { createNotification } = await import('@/lib/actions/notifications');
  const { data: coords } = await admin.from('coaches').select('id').eq('academy_id', who.academy_id).in('role', ['coordinator', 'admin']).eq('active_status', true).neq('id', who.id);
  const targets = [...new Set([...(coords ?? []).map((c: any) => c.id), ...(effectiveCoachId ? [effectiveCoachId] : [])])];
  for (const id of targets) {
    await createNotification({ recipientCoachId: id, type: 'adhoc_class', title, body, link: null, metadata: { campInstanceId: campId } }).catch(() => {});
  }
}

export async function hostRescheduleClass(token: string, campId: string, input: { dateISO: string; time: string }): Promise<{ ok: boolean; error?: string; name?: string }> {
  const who = await resolveHost(token);
  if (!who?.academy_id) return { ok: false, error: 'No autorizado.' };
  if (!(await hostCanCoordinate(who as any))) return { ok: false, error: 'Tu cuenta no tiene modo cobertura activado.' };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.dateISO) || !/^\d{2}:\d{2}$/.test(input.time)) return { ok: false, error: 'Fecha u hora inválida.' };
  const admin = createAdminClient();
  const loaded = await loadSingleDayClass(admin, campId, who.academy_id);
  if ('error' in loaded) return { ok: false, error: loaded.error };
  const { camp, session } = loaded as any;

  const before = `${camp.start_date}${camp.scheduled_time ? ' ' + String(camp.scheduled_time).slice(0, 5) : ''}`;
  const base = (camp.camp_name ?? '').split(' · ')[0];
  const name = `${base} · ${classLabel(input.dateISO, input.time)}`;
  const { error } = await admin.from('camp_instances').update({
    start_date: input.dateISO, end_date: input.dateISO, scheduled_time: input.time, camp_name: name,
  }).eq('id', campId);
  if (error) return { ok: false, error: error.message };
  if (session) await admin.from('camp_sessions').update({ session_date: input.dateISO }).eq('id', session.id);

  const effective = camp.head_coach_id && camp.head_coach_status === 'accepted' ? camp.head_coach_id : camp.coach_id;
  await notifyClassChange(admin, who, campId,
    `Clase reprogramada: ${base}`,
    `${who.display_name ?? 'Host'} la movió de ${before} a ${input.dateISO} ${input.time}. Si tenía espacio o transporte reservado, reagendalo.`,
    effective);
  return { ok: true, name };
}

export async function hostCancelClass(token: string, campId: string): Promise<{ ok: boolean; error?: string; students?: string[] }> {
  const who = await resolveHost(token);
  if (!who?.academy_id) return { ok: false, error: 'No autorizado.' };
  if (!(await hostCanCoordinate(who as any))) return { ok: false, error: 'Tu cuenta no tiene modo cobertura activado.' };
  const admin = createAdminClient();
  const loaded = await loadSingleDayClass(admin, campId, who.academy_id);
  if ('error' in loaded) return { ok: false, error: loaded.error };
  const { camp } = loaded as any;

  const { error } = await admin.from('camp_instances').update({ status: 'cancelled' }).eq('id', campId);
  if (error) return { ok: false, error: error.message };

  const act = (camp.camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active');
  const names = act.map((p: any) => {
    const st = Array.isArray(p.students) ? p.students[0] : p.students;
    return [st?.first_name, st?.last_name].filter(Boolean).join(' ');
  }).filter(Boolean);
  const paid = act.filter((p: any) => p.payment_status === 'paid').length;
  const effective = camp.head_coach_id && camp.head_coach_status === 'accepted' ? camp.head_coach_id : camp.coach_id;
  await notifyClassChange(admin, who, campId,
    `Clase cancelada: ${(camp.camp_name ?? '').split(' · ')[0]}`,
    `${who.display_name ?? 'Host'} la canceló desde el mostrador (${camp.start_date}${camp.scheduled_time ? ' ' + String(camp.scheduled_time).slice(0, 5) : ''}).${names.length ? ` Avisar a: ${names.join(', ')}.` : ''}${paid ? ` ${paid} ya habían pagado — revisar en recepción.` : ''}`,
    effective);
  return { ok: true, students: names };
}

// ── Host cubre coordinador (Marcelo 2026-08-09): transporte + renovaciones ──

// Confirmar/ajustar el transporte del día desde el mostrador. El host de fin
// de semana ajusta horarios de la van y marca que salió ('taken', mismo
// vocabulario que el tablero del coordinador) sin esperar al lunes.
export async function hostSetTransport(
  token: string,
  planId: string,
  input: { depart?: string | null; ret?: string | null; status?: 'taken' | 'cancelled' | 'requested' | null },
): Promise<{ ok: boolean; error?: string }> {
  const who = await resolveHost(token);
  if (!who?.academy_id || !(await hostCanCoordinate(who as any))) return { ok: false, error: 'No autorizado.' };
  const admin = createAdminClient();

  // El plan debe pertenecer a un servicio de ESTA academia.
  const { data: plan } = await admin
    .from('service_plans')
    .select('id, camp_instance_id, camp_instances:camp_instance_id!inner(academy_id)')
    .eq('id', planId)
    .maybeSingle();
  const inst = plan ? (Array.isArray((plan as any).camp_instances) ? (plan as any).camp_instances[0] : (plan as any).camp_instances) : null;
  if (!inst || inst.academy_id !== who.academy_id) return { ok: false, error: 'Transporte no encontrado.' };

  const patch: Record<string, unknown> = {};
  if (input.depart !== undefined) patch.transport_depart = input.depart || null;
  if (input.ret !== undefined) patch.transport_return = input.ret || null;
  if (input.status !== undefined) patch.transport_status = input.status;
  if (Object.keys(patch).length === 0) return { ok: false, error: 'Nada que actualizar.' };

  const { error } = await admin.from('service_plans').update(patch).eq('id', planId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ─── Tablero de TRANSPORTE del Front Desk ───
// Todas las solicitudes de transporte de los próximos 14 días (clases y
// camps): quién lo pide (coach), cuántos alumnos van, hora de salida y
// regreso, lugar. El coach lo solicita al planear su día (service_plans);
// el Front Desk lo ve todo junto acá y marca "salió".
export interface TransportBoardRow {
  plan_id: string;
  date: string;              // YYYY-MM-DD (día SV de la sesión)
  camp_name: string;
  coach_name: string | null; // quién lo solicita
  students: number;          // alumnos activos del servicio
  staff: number;             // coach + asistentes/camarógrafo aceptados
  passengers: number;        // total que va en la van (alumnos + staff)
  venue: string | null;      // lugar (playa/punto)
  class_start: string | null;
  depart: string | null;
  ret: string | null;
  status: string | null;     // null=pendiente · taken=salió · cancelled
}

// Devuelve null si la carga FALLÓ (para que la UI no muestre "sin
// transportes" cuando en realidad hubo un error de red/DB).
export async function hostTransportBoard(token: string): Promise<TransportBoardRow[] | null> {
  const who = await resolveHost(token);
  if (!who?.academy_id) return [];
  const admin = createAdminClient();
  const today = elSalvadorToday();
  const end = new Date(Date.parse(`${today}T00:00:00Z`) + 13 * 86400000).toISOString().slice(0, 10);

  const { data: sess, error: sessErr } = await admin
    .from('camp_sessions')
    .select('id, session_date, camp_instance_id, camp_instances:camp_instance_id!inner(camp_name, academy_id, status, coach_id, head_coach_id, head_coach_status)')
    .gte('session_date', today)
    .lte('session_date', end)
    .eq('camp_instances.academy_id', who.academy_id)
    .order('session_date');
  if (sessErr) return null;
  const sessions = (sess ?? []).filter((s: any) => {
    const inst = Array.isArray(s.camp_instances) ? s.camp_instances[0] : s.camp_instances;
    return inst && inst.status !== 'cancelled';
  });
  if (sessions.length === 0) return [];

  const sessIds = sessions.map((s: any) => s.id);
  const { data: plans, error: plansErr } = await admin
    .from('service_plans')
    .select('id, camp_session_id, class_start_time, surf_venue, transport_needed, transport_depart, transport_return, transport_status')
    .in('camp_session_id', sessIds)
    .eq('transport_needed', true);
  if (plansErr) return null;
  if (!plans || plans.length === 0) return [];
  const sessById = new Map(sessions.map((s: any) => [s.id, s]));

  // Alumnos activos por servicio + nombre del coach que lo pide.
  const instIds = Array.from(new Set(
    plans.map((p: any) => sessById.get(p.camp_session_id)).filter(Boolean).map((s: any) => s.camp_instance_id),
  ));
  const [{ data: parts }, { data: staffRows }] = instIds.length
    ? await Promise.all([
        admin.from('camp_participants').select('camp_instance_id, enrollment_status').in('camp_instance_id', instIds),
        admin.from('service_staff').select('camp_instance_id, status').in('camp_instance_id', instIds).eq('status', 'accepted'),
      ])
    : [{ data: [] as any[] }, { data: [] as any[] }];
  const countByInst = new Map<string, number>();
  for (const p of parts ?? []) {
    if (p.enrollment_status !== 'active') continue; // mismo criterio que transport.ts
    countByInst.set(p.camp_instance_id, (countByInst.get(p.camp_instance_id) ?? 0) + 1);
  }
  // Staff aceptado (asistentes, camarógrafo…) por servicio — van en la van.
  const staffByInst = new Map<string, number>();
  for (const st of staffRows ?? []) {
    staffByInst.set(st.camp_instance_id, (staffByInst.get(st.camp_instance_id) ?? 0) + 1);
  }
  const coachIds = Array.from(new Set(sessions.flatMap((s: any) => {
    const inst = Array.isArray(s.camp_instances) ? s.camp_instances[0] : s.camp_instances;
    return [inst?.coach_id, inst?.head_coach_id].filter(Boolean);
  })));
  const { data: coachRows } = coachIds.length
    ? await admin.from('coaches').select('id, display_name').in('id', coachIds)
    : { data: [] as any[] };
  const coachName = new Map((coachRows ?? []).map((c: any) => [c.id, c.display_name]));

  return plans
    .map((p: any) => {
      const s = sessById.get(p.camp_session_id);
      if (!s) return null;
      const inst = Array.isArray((s as any).camp_instances) ? (s as any).camp_instances[0] : (s as any).camp_instances;
      // Coach efectivo (invariante #1): head coach solo si ACEPTÓ la
      // transferencia — igual que transport.ts y el resto del archivo.
      const useHead = inst?.head_coach_id && inst?.head_coach_status === 'accepted';
      const nStudents = countByInst.get((s as any).camp_instance_id) ?? 0;
      // Pasajeros = alumnos + coach efectivo (1) + staff aceptado.
      const nStaff = 1 + (staffByInst.get((s as any).camp_instance_id) ?? 0);
      return {
        plan_id: p.id,
        date: (s as any).session_date,
        camp_name: inst?.camp_name ?? '—',
        coach_name: coachName.get(useHead ? inst.head_coach_id : inst?.coach_id) ?? null,
        students: nStudents,
        staff: nStaff,
        passengers: nStudents + nStaff,
        venue: p.surf_venue ?? null,
        class_start: p.class_start_time ?? null,
        depart: p.transport_depart ?? null,
        ret: p.transport_return ?? null,
        status: p.transport_status ?? null,
      } as TransportBoardRow;
    })
    .filter(Boolean)
    .sort((a, b) => a!.date.localeCompare(b!.date) || String(a!.depart ?? '99').localeCompare(String(b!.depart ?? '99'))) as TransportBoardRow[];
}

// Avisos de transporte para el Front Desk: las notas que dejan los coaches
// al pedir/modificar/cancelar transporte (type transport_change/request).
export async function hostTransportNotices(
  token: string,
): Promise<Array<{ id: string; title: string; body: string | null; created_at: string }>> {
  const who = await resolveHost(token);
  if (!who) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from('notifications')
    .select('id, title, body, created_at')
    .eq('recipient_coach_id', (who as any).id)
    .in('type', ['transport_change', 'transport_request'])
    .order('created_at', { ascending: false })
    .limit(8);
  return (data ?? []) as any;
}

// Precios de membresía del mostrador — mismos planes del portal (RenewalGate).
const DESK_MEMBERSHIP_PLANS: Record<number, number> = { 1: 999, 6: 4999, 12: 9990 };

// Confirmar una renovación PEDIDA por el alumno desde su portal (fila
// 'requested'). Mismo flujo que confirmMembershipRenewal del dashboard, pero
// token-gated para el host que cubre el fin de semana.
export async function hostConfirmRenewal(
  token: string,
  studentId: string,
  method: string,
): Promise<{ ok: boolean; error?: string }> {
  const who = await resolveHost(token);
  if (!who?.academy_id || !(await hostCanCoordinate(who as any))) return { ok: false, error: 'No autorizado.' };
  const admin = createAdminClient();

  const { data: stu } = await admin.from('students').select('id, academy_id').eq('id', studentId).maybeSingle();
  if (!stu || stu.academy_id !== who.academy_id) return { ok: false, error: 'Alumno no encontrado.' };

  const { data: req } = await admin.from('memberships').select('id, months, amount_cents')
    .eq('student_id', studentId).eq('status', 'requested')
    .order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (!req) return { ok: false, error: 'No hay solicitud de renovación pendiente.' };

  await admin.from('memberships').update({ status: 'cancelled', note: 'convertida al confirmar (mostrador)' }).eq('id', req.id);
  const { extendMembership } = await import('@/lib/actions/memberships');
  await extendMembership(studentId, req.months, 'renewal', {
    amountCents: req.amount_cents ?? DESK_MEMBERSHIP_PLANS[req.months] ?? null,
    paymentMethod: method || 'manual',
    createdBy: who.id,
    note: `Renovación confirmada en mostrador por ${who.display_name ?? 'host'}`,
  });
  return { ok: true };
}

// Renovación directa en mostrador (sin solicitud previa): el alumno llega un
// sábado y quiere renovar. Planes 1/6/12 meses a precio de lista del portal.
export async function hostGrantRenewal(
  token: string,
  studentId: string,
  months: number,
  method: string,
): Promise<{ ok: boolean; error?: string }> {
  const who = await resolveHost(token);
  if (!who?.academy_id || !(await hostCanCoordinate(who as any))) return { ok: false, error: 'No autorizado.' };
  if (![1, 6, 12].includes(months)) return { ok: false, error: 'Plan inválido (1, 6 o 12 meses).' };
  const admin = createAdminClient();

  const { data: stu } = await admin.from('students').select('id, academy_id').eq('id', studentId).maybeSingle();
  if (!stu || stu.academy_id !== who.academy_id) return { ok: false, error: 'Alumno no encontrado.' };

  const { extendMembership } = await import('@/lib/actions/memberships');
  await extendMembership(studentId, months, 'renewal', {
    amountCents: DESK_MEMBERSHIP_PLANS[months],
    paymentMethod: method || 'cash',
    createdBy: who.id,
    note: `Renovada en mostrador por ${who.display_name ?? 'host'}`,
  });
  return { ok: true };
}
