'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { elSalvadorToday } from '@/lib/utils/tz';
import { listCoachStps, type StpSummary } from '@/lib/actions/coach-tools';
import { getAcceptedAssistantCampIds } from '@/lib/actions/service-staff';
import { revalidatePath } from 'next/cache';

// Coach reports an incident (general or student-specific) from their portal.
// Token-gated like the rest of the coach portal. Lands in session_incidents
// so the coordinator + admin see it on their dashboard.
export async function reportIncident(input: {
  token: string;
  incident_type: string;
  student_id?: string | null;
  student_name?: string | null;
  board_id?: string | null;       // optional: a board that was damaged
  board_action?: 'repair' | 'retire' | 'keep'; // what to do with that board
  description: string;
  action_taken?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  // Invariante #2: devolver estados esperables, nunca lanzar (Next enmascara
  // los throw de server actions en producción → el coach vería un error genérico).
  const admin = createAdminClient();
  const { data: coach } = await admin
    .from('coaches')
    .select('id, academy_id')
    .eq('portal_token', input.token)
    .maybeSingle();
  if (!coach) return { success: false, error: 'Coach not found.' };
  if (!input.incident_type) return { success: false, error: 'Incident type is required.' };
  if (!input.description?.trim()) return { success: false, error: 'A short description is required.' };

  const { error } = await admin.from('session_incidents').insert({
    academy_id: coach.academy_id ?? null,
    coach_id: coach.id,
    student_id: input.student_id || null,
    student_name: input.student_name?.trim() || null,
    incident_type: input.incident_type,
    description: input.description.trim(),
    action_taken: input.action_taken?.trim() || null,
  });
  if (error) return { success: false, error: error.message };

  // A damaged board is taken out of circulation per the coach's choice:
  //   repair (default) → in_repair · retire → retired · keep → just logged.
  // Either way its condition drops to 'poor' when pulled.
  if (input.board_id) {
    const action = input.board_action ?? 'repair';
    if (action === 'retire') {
      await admin.from('boards').update({ status: 'retired', condition: 'poor' }).eq('id', input.board_id);
    } else if (action === 'repair') {
      await admin.from('boards').update({ status: 'in_repair', condition: 'poor' }).eq('id', input.board_id);
    }
    // 'keep' → leave the board available; the incident is still on record.
  }

  revalidatePath('/dashboard');
  return { success: true };
}

// Coach Portal — public route accessed via /coach-portal/[token].
// Mirrors the student portal pattern. No auth required at the route level;
// the portal_token is the access credential. Coach gets the link from
// their academy coordinator.

export interface CoachPortalData {
  unclosedPast: {
    camp_id: string; camp_name: string; day_number: number; date: string;
  }[];
  pendingStaffInvites: {
    id: string; role: string; response_token: string; camp_name: string;
    start_date: string; end_date: string; scheduled_time: string | null;
  }[];
  coach: {
    id: string;
    first_name: string;
    last_name: string | null;
    display_name: string;
    email: string | null;
    role: string;
    portal_category: string;
    job_title: string | null;
    portal_can_sell: boolean;
    certification_level: string | null;
    max_belt_permission: string;
    languages: string | null;
    specialty_area: string | null;
    portal_token: string;
    photo_url: string | null;
    intake_completed_at: string | null;
    waiver_signed: boolean;
  };
  stats: {
    totalServicesAsHead: number;
    upcomingServicesCount: number;
    studentsWorkedWith: number;
    avgRating: number | null;
    ratingsCount: number;
    coachingHours: number;
  };
  upcomingServices: any[];
  pendingAssignments: any[];
  pastServices: any[];
  academyServices: any[];  // all upcoming academy services (sellers only)
  academySchedule: any[];  // next-7-days academy schedule (support members)
  todayLogistics?: any;    // coach's service running TODAY + its class-day plan (M139)
  coachCourses: any[];  // lessons WHERE course_section LIKE 'coach_%'
  courseProgress: Record<string, { completed: boolean; completed_at: string | null; started: boolean }>;
  availableDrills: any[];  // drills_missions filtered by max_belt_permission
  stps: StpSummary[];  // STPs grouped by sequence for the Tools tab browser
  academyBranding: {
    name: string | null;
    logo_url: string | null;
    primary_color: string | null;
    accent_color: string | null;
    tagline: string | null;
  } | null;
  myStudents: { id: string; name: string }[];
  boards: { id: string; code: string }[];
  emergencyPlan: {
    emergency_numbers: string | null;
    nearest_hospital: string | null;
    lifeguard_contact: string | null;
    emergency_address: string | null;
    emergency_protocol: string | null;
  } | null;
}

export async function getCoachPortalData(token: string): Promise<CoachPortalData | null> {
  const admin = createAdminClient();

  // 1. Resolve coach by token
  const { data: coach } = await admin
    .from('coaches')
    .select(
      'id, first_name, last_name, display_name, email, role, portal_category, job_title, portal_can_sell, certification_level, max_belt_permission, languages, specialty_area, portal_token, academy_id, course_access_granted, course_access_scope, photo_url, intake_completed_at, waiver_signed'
    )
    .eq('portal_token', token)
    .single();

  if (!coach) return null;
  // Gate: coach needs explicit access granted by platform admin
  if (!coach.course_access_granted) return null;

  const today = elSalvadorToday();

  // Services where this coach is an accepted assistant (read-only access).
  const assistantCampIds = await getAcceptedAssistantCampIds(coach.id);
  const svcOr = `coach_id.eq.${coach.id},head_coach_id.eq.${coach.id}${
    assistantCampIds.length ? `,id.in.(${assistantCampIds.join(',')})` : ''
  }`;

  // 2. Pull everything in parallel
  const [
    upcomingResult,
    pastResult,
    { count: totalServicesAsHead },
    surveysResult,
    coachCoursesResult,
    drillsResult,
  ] = await Promise.all([
    admin
      .from('camp_instances')
      .select('id, camp_name, start_date, end_date, status, scheduled_time, head_coach_id, head_coach_status, camp_templates:template_id(service_kind, template_name, capacity_max)')
      .or(svcOr)
      .in('status', ['planned', 'active'])
      .gte('end_date', today)
      .order('start_date'),
    admin
      .from('camp_instances')
      .select('id, camp_name, start_date, end_date, status')
      .or(svcOr)
      .lt('end_date', today)
      .order('end_date', { ascending: false })
      .limit(10),
    admin
      .from('camp_instances')
      .select('id', { count: 'exact', head: true })
      .eq('head_coach_id', coach.id),
    admin
      .from('survey_responses')
      .select('coach_rating, student_session_results!inner(coach_id)')
      .eq('student_session_results.coach_id', coach.id),
    admin
      .from('lessons')
      .select('id, title, course_section, step_number, display_order, lesson_type, estimated_minutes, prerequisites')
      .like('course_section', 'coach_%')
      .eq('active', true)
      .order('display_order'),
    admin
      .from('drills_missions')
      .select('id, step_id, title, type, time_estimate, key_words, block_name, belt, description_md, success_criteria, reps_recommended')
      .eq('active', true)
      .order('belt')
      .order('display_order'),
  ]);

  // 3. Derive stats
  const studentsWorkedWith = new Set<string>();
  // (cheap-ish — pull distinct students from student_session_results for this coach)
  const { data: distinctStudents } = await admin
    .from('student_session_results')
    .select('student_id, camp_session_id, standalone_session_id, cascade_session_id, multi_block_session_id, duration_minutes')
    .eq('coach_id', coach.id);
  for (const r of distinctStudents ?? []) studentsWorkedWith.add(r.student_id);

  // Coaching hours — sum durations once per distinct session (a group class
  // has many student rows but is one coaching session, so we dedupe by the
  // session key to avoid multiplying by headcount).
  const seenSessions = new Set<string>();
  let coachingMinutes = 0;
  for (const r of distinctStudents ?? []) {
    const mins = (r as any).duration_minutes;
    if (!mins) continue;
    const key =
      (r as any).camp_session_id || (r as any).standalone_session_id ||
      (r as any).cascade_session_id || (r as any).multi_block_session_id;
    if (key) {
      if (seenSessions.has(key)) continue;
      seenSessions.add(key);
    }
    coachingMinutes += mins;
  }
  const coachingHours = Math.round((coachingMinutes / 60) * 10) / 10;

  const surveys = (surveysResult.data ?? []) as any[];
  const ratings = surveys.map((s) => s.coach_rating).filter((n: number) => n > 0);
  const avgRating = ratings.length
    ? Math.round((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length) * 10) / 10
    : null;

  // 4. Filter drills by coach's belt permission (max_belt_permission >= drill.belt)
  // Order is white < yellow < blue < purple < brown < black. drills_missions.belt
  // uses short values ('white','yellow'); max_belt_permission is enum
  // ('white_belt','yellow_belt'...). Normalize.
  const beltRank: Record<string, number> = {
    white: 1, yellow: 2, blue: 3, purple: 4, brown: 5, black: 6,
  };
  const myBeltShort = (coach.max_belt_permission || '').replace('_belt', '');
  // Unset belt permission defaults to the MOST restrictive (white only) —
  // content is earned per level, never granted by omission.
  const myRank = beltRank[myBeltShort] ?? 1;
  const availableDrills = (drillsResult.data ?? []).filter((d: any) => {
    const r = beltRank[d.belt] ?? 1;
    return r <= myRank;
  });

  // 4b. Enrich upcoming + past with participant counts (one query)
  const allCampIds = [
    ...(upcomingResult.data ?? []).map((s: any) => s.id),
    ...(pastResult.data ?? []).map((s: any) => s.id),
  ];
  const participantCounts: Record<string, number> = {};
  const myStudentsMap = new Map<string, string>(); // id → display name
  if (allCampIds.length > 0) {
    const { data: pCounts } = await admin
      .from('camp_participants')
      .select('camp_instance_id, student_id, students:student_id(first_name, last_name)')
      .in('camp_instance_id', allCampIds)
      .eq('enrollment_status', 'active');
    for (const p of pCounts ?? []) {
      participantCounts[p.camp_instance_id] =
        (participantCounts[p.camp_instance_id] || 0) + 1;
      const stu: any = Array.isArray((p as any).students) ? (p as any).students[0] : (p as any).students;
      if ((p as any).student_id && stu) {
        myStudentsMap.set((p as any).student_id, `${stu.first_name ?? ''} ${stu.last_name ?? ''}`.trim());
      }
    }
  }
  const enrich = (s: any) => ({ ...s, participant_count: participantCounts[s.id] || 0 });
  const upcomingEnriched = (upcomingResult.data ?? []).map(enrich);
  const pastEnriched = (pastResult.data ?? []).map(enrich);

  // Course progress map (coach_lesson_progress for this coach).
  // "started" = the coach opened the lesson but hasn't completed it yet.
  // We mark started when there's a row + content_read/video_watched/quiz_attempts
  // signal, even if completed=false.
  const { data: progressRows } = await admin
    .from('coach_lesson_progress')
    .select('lesson_id, completed, completed_at, started_at, video_watched, content_read, quiz_attempts')
    .eq('coach_id', coach.id);
  const courseProgress: Record<string, {
    completed: boolean;
    completed_at: string | null;
    started: boolean;
  }> = {};
  for (const r of progressRows ?? []) {
    const interacted =
      !!r.video_watched ||
      !!r.content_read ||
      (r.quiz_attempts ?? 0) > 0 ||
      !!r.started_at;
    courseProgress[r.lesson_id] = {
      completed: !!r.completed,
      completed_at: r.completed_at,
      started: !r.completed && interacted,
    };
  }

  // M9 — coach portal also themed by academy.
  let academyBranding: CoachPortalData['academyBranding'] = null;
  let emergencyPlan: CoachPortalData['emergencyPlan'] = null;
  let boards: CoachPortalData['boards'] = [];
  if (coach.academy_id) {
    const { data: boardRows } = await admin
      .from('boards')
      .select('id, code')
      .eq('academy_id', coach.academy_id)
      .neq('status', 'retired')
      .order('code');
    boards = (boardRows ?? []) as any[];
  }
  if (coach.academy_id) {
    const { data: aca } = await admin
      .from('academies')
      .select('name, logo_url, primary_color, accent_color, tagline, emergency_numbers, nearest_hospital, lifeguard_contact, emergency_address, emergency_protocol')
      .eq('id', coach.academy_id)
      .single();
    if (aca) {
      academyBranding = {
        name: aca.name, logo_url: aca.logo_url, primary_color: aca.primary_color,
        accent_color: aca.accent_color, tagline: aca.tagline,
      };
      emergencyPlan = {
        emergency_numbers: aca.emergency_numbers ?? null,
        nearest_hospital: aca.nearest_hospital ?? null,
        lifeguard_contact: aca.lifeguard_contact ?? null,
        emergency_address: aca.emergency_address ?? null,
        emergency_protocol: aca.emergency_protocol ?? null,
      };
    }
  }

  // Sellers see ALL upcoming academy services (with availability), not just
  // the ones they're assigned to. Skip the query for everyone else.
  let academyServices: any[] = [];
  if (((coach as any).portal_can_sell || ['seller', 'host'].includes((coach as any).role)) && coach.academy_id) {
    const { data: svc } = await admin
      .from('camp_instances')
      .select('id, camp_name, start_date, end_date, status, scheduled_time, capacity_override, template_id, camp_templates:template_id(template_name, service_kind, capacity_max, level_name, sales_deck_resource_id, video_url), camp_participants(id, enrollment_status, payment_status, amount_cents)')
      .eq('academy_id', coach.academy_id)
      .gte('start_date', today)
      .order('start_date');
    academyServices = svc ?? [];

    // 2B — the selling deck per service: mint one signed URL per distinct deck
    // and attach it to every service whose template points at it.
    const deckIds = [...new Set(academyServices
      .map((s: any) => (Array.isArray(s.camp_templates) ? s.camp_templates[0] : s.camp_templates)?.sales_deck_resource_id)
      .filter(Boolean))] as string[];
    if (deckIds.length) {
      const { data: decks } = await admin
        .from('coach_resources')
        .select('id, title, storage_path, file_url, active')
        .in('id', deckIds);
      const urlById = new Map<string, { url: string; title: string }>();
      for (const d of decks ?? []) {
        if (!d.active) continue;
        let url = d.file_url as string | null;
        if (d.storage_path) {
          const { data: signed } = await admin.storage
            .from('coach-presentations')
            .createSignedUrl(d.storage_path, 60 * 60);
          if (signed?.signedUrl) url = signed.signedUrl;
        }
        if (url) urlById.set(d.id, { url, title: d.title });
      }
      academyServices = academyServices.map((s: any) => {
        const tpl = Array.isArray(s.camp_templates) ? s.camp_templates[0] : s.camp_templates;
        const deck = tpl?.sales_deck_resource_id ? urlById.get(tpl.sales_deck_resource_id) : null;
        return deck ? { ...s, sales_deck_url: deck.url, sales_deck_title: deck.title } : s;
      });
    }
  }

  // Academy schedule for SUPPORT members (customer service, cleaning, coffee,
  // reception): every service running in the next 7 days with its time, coach
  // and headcount — the operational picture so the whole team knows what's
  // happening and can prepare for each group.
  let academySchedule: any[] = [];
  if ((coach as any).portal_category === 'support' && coach.academy_id) {
    try {
      const weekOut = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
      const { data: sched } = await admin
        .from('camp_instances')
        .select(
          'id, camp_name, start_date, end_date, scheduled_time, status, ' +
            'camp_templates:template_id(template_name, service_kind), ' +
            'head_coach:head_coach_id(display_name), ' +
            'camp_participants(id, enrollment_status)'
        )
        .eq('academy_id', coach.academy_id)
        .lte('start_date', weekOut)
        .gte('end_date', today)
        .not('status', 'in', '("completed","cancelled")')
        .order('start_date');
      academySchedule = (sched ?? []).map((s: any) => {
        const tpl = Array.isArray(s.camp_templates) ? s.camp_templates[0] : s.camp_templates;
        const hc = Array.isArray(s.head_coach) ? s.head_coach[0] : s.head_coach;
        return {
          id: s.id,
          camp_name: s.camp_name,
          start_date: s.start_date,
          end_date: s.end_date,
          scheduled_time: s.scheduled_time ?? null,
          service_kind: tpl?.service_kind ?? null,
          template_name: tpl?.template_name ?? null,
          coach_name: hc?.display_name ?? null,
          students: (s.camp_participants ?? []).filter((p: any) => p.enrollment_status === 'active').length,
        };
      });

      // Class-day logistics (M133): pull each day's plan so the team also sees
      // start time, beach, and transport — not just which group is running.
      if (academySchedule.length > 0) {
        try {
          const instIds = academySchedule.map((s) => s.id);
          const { data: sess } = await admin
            .from('camp_sessions')
            .select('id, camp_instance_id, session_date, day_number')
            .in('camp_instance_id', instIds)
            .gte('session_date', today)
            .lte('session_date', weekOut);
          const sessIds = (sess ?? []).map((x: any) => x.id);
          const { data: plans } = sessIds.length
            ? await admin
                .from('service_plans')
                .select('camp_session_id, class_start_time, surf_venue, transport_needed, transport_depart, transport_return, transport_status')
                .in('camp_session_id', sessIds)
            : { data: [] as any[] };
          const planBySession = new Map((plans ?? []).map((p: any) => [p.camp_session_id, p]));
          const daysByInstance = new Map<string, any[]>();
          for (const x of sess ?? []) {
            const p = planBySession.get(x.id);
            if (!p) continue;
            const arr = daysByInstance.get(x.camp_instance_id) ?? [];
            arr.push({
              session_date: x.session_date,
              day_number: x.day_number,
              class_start_time: p.class_start_time ?? null,
              surf_venue: p.surf_venue ?? null,
              transport_needed: p.transport_needed ?? null,
              transport_depart: p.transport_depart ?? null,
              transport_return: p.transport_return ?? null,
              transport_status: p.transport_status ?? null,
            });
            daysByInstance.set(x.camp_instance_id, arr);
          }
          academySchedule = academySchedule.map((s) => ({
            ...s,
            day_logistics: (daysByInstance.get(s.id) ?? []).sort((a, b) => a.session_date.localeCompare(b.session_date)),
          }));
        } catch { /* pre-migration or partial data — schedule still renders */ }
      }
    } catch { /* soft — the rest of the portal still works */ }
  }

  // M139 — the coach's service running TODAY + its class-day logistics, for
  // the redesigned home "Today" hero card. Soft-fail: null hides the card.
  let todayLogistics: any = null;
  try {
    const running = (upcomingEnriched as any[]).find(
      (s: any) => s.start_date <= today && (s.end_date ?? s.start_date) >= today,
    );
    if (running) {
      const [{ data: sess }, { count: totalDays }, { count: studentsCount }] = await Promise.all([
        admin.from('camp_sessions').select('id, day_number').eq('camp_instance_id', running.id).eq('session_date', today).maybeSingle(),
        admin.from('camp_sessions').select('*', { count: 'exact', head: true }).eq('camp_instance_id', running.id),
        admin.from('camp_participants').select('*', { count: 'exact', head: true }).eq('camp_instance_id', running.id).eq('enrollment_status', 'active'),
      ]);
      let plan: any = null;
      if (sess) {
        const { data: pl } = await admin
          .from('service_plans')
          .select('class_start_time, surf_venue, transport_needed, transport_depart')
          .eq('camp_session_id', sess.id)
          .maybeSingle();
        plan = pl;
      }
      todayLogistics = {
        camp_id: running.id,
        camp_name: running.camp_name ?? null,
        day_number: sess?.day_number ?? null,
        total_days: totalDays ?? null,
        students: studentsCount ?? 0,
        class_start_time: plan?.class_start_time ?? null,
        surf_venue: plan?.surf_venue ?? null,
        transport_depart: plan?.transport_needed ? (plan?.transport_depart ?? null) : null,
      };
    }
  } catch { /* non-blocking */ }

  // Invitaciones de staff (asistente/filmer/fotógrafo) SIN responder, de
  // servicios vigentes — se muestran en el Home del portal para aceptar o
  // rechazar ahí mismo (antes solo iban por email y quedaban en el limbo).
  const { data: staffInviteRows } = await admin
    .from('service_staff')
    .select('id, role, status, response_token, camp_instances:camp_instance_id!inner(id, camp_name, start_date, end_date, scheduled_time, status)')
    .eq('coach_id', coach.id)
    .eq('status', 'invited')
    .gte('camp_instances.end_date', today);
  const pendingStaffInvites = ((staffInviteRows as any[]) ?? [])
    .map((r: any) => {
      const inst = Array.isArray(r.camp_instances) ? r.camp_instances[0] : r.camp_instances;
      if (!inst || inst.status === 'cancelled') return null;
      return {
        id: r.id,
        role: r.role,
        response_token: r.response_token,
        camp_name: inst.camp_name,
        start_date: inst.start_date,
        end_date: inst.end_date,
        scheduled_time: inst.scheduled_time ?? null,
      };
    })
    .filter(Boolean) as CoachPortalData['pendingStaffInvites'];

  // Días PASADOS sin cierre (14 días) de servicios donde este coach es el
  // responsable — tarjeta "Needs closing" en Plan: un toque abre el planner
  // en ese día. Antes vivían enterrados en "Past" y nadie los encontraba.
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10);
  const { data: unclosedRows } = await admin
    .from('camp_sessions')
    .select('id, day_number, session_date, session_status, camp_instances:camp_instance_id!inner(id, camp_name, status, coach_id, head_coach_id, camp_participants(enrollment_status))')
    .gte('session_date', twoWeeksAgo)
    .lt('session_date', today)
    .neq('session_status', 'completed');
  const unclosedPast = ((unclosedRows as any[]) ?? [])
    .map((r: any) => {
      const inst = Array.isArray(r.camp_instances) ? r.camp_instances[0] : r.camp_instances;
      if (!inst || inst.status === 'cancelled') return null;
      if (inst.coach_id !== coach.id && inst.head_coach_id !== coach.id) return null;
      const hasStudents = (inst.camp_participants ?? []).some((p: any) => p.enrollment_status === 'active');
      if (!hasStudents) return null; // clase vacía que pasó = ruido, no deuda
      return { camp_id: inst.id, camp_name: inst.camp_name, day_number: r.day_number, date: r.session_date };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => a.date.localeCompare(b.date)) as CoachPortalData['unclosedPast'];

  return {
    coach,
    unclosedPast,
    pendingStaffInvites,
    stats: {
      totalServicesAsHead: totalServicesAsHead ?? 0,
      upcomingServicesCount: (upcomingResult.data ?? []).length,
      studentsWorkedWith: studentsWorkedWith.size,
      avgRating,
      ratingsCount: ratings.length,
      coachingHours,
    },
    upcomingServices: upcomingEnriched,
    pendingAssignments: upcomingEnriched.filter(
      (s: any) => s.head_coach_id === coach.id && s.head_coach_status === 'pending',
    ),
    pastServices: pastEnriched,
    academyServices,
    academySchedule,
    todayLogistics,
    // Belt-gated courses: a coach only sees the belt courses up to their
    // max_belt_permission (same ladder used for drills). Non-belt coach
    // courses (Method, Foundations Tier 1, Career, Safety Canon, …) are
    // universal — any course_section not in the belt map shows to everyone.
    coachCourses: (coachCoursesResult.data ?? []).filter((l: any) => {
      // Alcance restringido: instructores en formación inicial ven SOLO
      // Safety Canon + Foundations (método) hasta que se les abra el resto.
      if ((coach as any).course_access_scope === 'safety_method') {
        return l.id.startsWith('COACH-SAFETY-') || l.id.startsWith('COACH-FOUND-');
      }
      const sectionBelt: Record<string, string> = {
        coach_wb: 'white', coach_wb_master: 'white', coach_yb: 'yellow',
        coach_bb: 'blue', coach_pb: 'purple', coach_brb: 'brown', coach_blb: 'black',
      };
      const belt = sectionBelt[l.course_section];
      if (!belt) return true; // universal course
      return (beltRank[belt] ?? 1) <= myRank;
    }),
    courseProgress,
    availableDrills,
    stps: await listCoachStps(token),
    myStudents: Array.from(myStudentsMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
    boards,
    academyBranding,
    emergencyPlan,
  };
}

// ─── Coach Lesson detail (lazy-loaded on click) ────────────────
//
// Returns the full markdown body + video URL + any attached content
// videos for a single coach lesson. Used by CoursesTab when a coach
// clicks into a course to read it. Also reads any existing
// coach_lesson_progress row for this coach+lesson pair so the UI can
// show "read / not read" state.

export interface CoachLessonDetail {
  lesson: {
    id: string;
    title: string;
    subtitle: string | null;
    description_md: string | null;
    video_url: string | null;
    cover_image_url: string | null;
    estimated_minutes: number | null;
    prerequisites: string[];
    display_order: number;
    lesson_type: string;
    // Coach STP pillar columns (null on non-STP lessons)
    coach_what_md: string | null;
    coach_deliver_md: string | null;
    coach_errors_md: string | null;
    coach_validate_md: string | null;
    linked_step_id: string | null;
  };
  videos: { id: string; title: string | null; url: string; provider: string; display_order: number }[];
  progress: {
    completed: boolean;
    completed_at: string | null;
    quiz_score: number | null;
    quiz_attempts: number;
  } | null;
  // Ojo: NUNCA exponer el flag `correct` al navegador — sería el answer key del
  // quiz de certificación. La corrección la hace el server (submitCoachQuiz).
  quizzes: { id: string; question: string; options: { text: string }[]; display_order: number }[];
  // The drill + mission for the linked STP (pulled from drills_missions)
  linkedDrill: LinkedTool | null;
  linkedMission: LinkedTool | null;
}

export interface LinkedTool {
  id: string;
  title: string;
  key_words: string[] | null;
  time_estimate: string | null;
  block_name: string | null;
  description_md: string | null;
  success_criteria: string[] | null;
  reps_recommended: string | null;
}

export async function getCoachLessonDetail(
  token: string,
  lessonId: string
): Promise<CoachLessonDetail | null> {
  const admin = createAdminClient();

  // Resolve coach by token to scope progress lookup
  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) return null;

  const { data: lesson } = await admin
    .from('lessons')
    .select(
      'id, title, subtitle, description_md, video_url, cover_image_url, estimated_minutes, prerequisites, display_order, lesson_type, coach_what_md, coach_deliver_md, coach_errors_md, coach_validate_md, linked_step_id'
    )
    .eq('id', lessonId)
    .eq('active', true)
    .single();
  if (!lesson) return null;

  const { data: videos } = await admin
    .from('content_videos')
    .select('id, title, url, provider, display_order')
    .eq('content_type', 'lesson')
    .eq('content_id', lessonId)
    .order('display_order');

  // Touch a coach_lesson_progress row on first open so the coach's Courses
  // list can show "In progress" for lessons they've started reading but
  // haven't marked as read. The upsert is a no-op for rows that already
  // exist (so completed lessons stay completed).
  await admin
    .from('coach_lesson_progress')
    .upsert(
      {
        coach_id: coach.id,
        lesson_id: lessonId,
        started_at: new Date().toISOString(),
      },
      { onConflict: 'coach_id,lesson_id', ignoreDuplicates: true },
    );

  const { data: progress } = await admin
    .from('coach_lesson_progress')
    .select('completed, completed_at, quiz_score, quiz_attempts')
    .eq('coach_id', coach.id)
    .eq('lesson_id', lessonId)
    .maybeSingle();

  const { data: quizzes } = await admin
    .from('lesson_quizzes')
    .select('id, question, options, display_order')
    .eq('lesson_id', lessonId)
    .order('display_order');

  // For STP lessons, pull the linked drill + mission from drills_missions
  let linkedDrill: CoachLessonDetail['linkedDrill'] = null;
  let linkedMission: CoachLessonDetail['linkedMission'] = null;
  if (lesson.linked_step_id) {
    const { data: dm } = await admin
      .from('drills_missions')
      .select('id, title, type, key_words, time_estimate, block_name, description_md, success_criteria, reps_recommended')
      .eq('step_id', lesson.linked_step_id)
      .eq('active', true);
    for (const row of dm ?? []) {
      const item: LinkedTool = {
        id: row.id,
        title: row.title,
        key_words: row.key_words,
        time_estimate: row.time_estimate,
        block_name: row.block_name,
        description_md: row.description_md,
        success_criteria: row.success_criteria,
        reps_recommended: row.reps_recommended,
      };
      if (row.type === 'drill' && !linkedDrill) linkedDrill = item;
      if (row.type === 'mission' && !linkedMission) linkedMission = item;
    }
  }

  return {
    lesson: {
      ...lesson,
      prerequisites: (lesson.prerequisites ?? []) as string[],
    },
    videos: videos ?? [],
    progress: progress ?? null,
    // Strip the answer key: solo mandamos el texto de cada opción al navegador.
    quizzes: (quizzes ?? []).map((q: any) => ({
      id: q.id,
      question: q.question,
      display_order: q.display_order,
      options: ((q.options ?? []) as any[]).map((o) => ({ text: o.text })),
    })),
    linkedDrill,
    linkedMission,
  };
}

// Score + persist a coach quiz attempt. Returns the score and a per-question
// correctness map so the UI can show which they got wrong.
export async function submitCoachQuiz(
  token: string,
  lessonId: string,
  answers: Record<string, number>  // questionId → chosen option index
): Promise<{
  score: number;       // 0-100 percentage
  passed: boolean;     // >= 80%
  correctById: Record<string, { correctIdx: number; gotIt: boolean }>;
  attempts: number;
}> {
  const admin = createAdminClient();

  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  const { data: quizzes } = await admin
    .from('lesson_quizzes')
    .select('id, options')
    .eq('lesson_id', lessonId)
    .order('display_order');
  if (!quizzes || quizzes.length === 0) {
    throw new Error('No quiz questions for this lesson.');
  }

  let correctCount = 0;
  const correctById: Record<string, { correctIdx: number; gotIt: boolean }> = {};
  for (const q of quizzes as any[]) {
    const correctIdx = (q.options as any[]).findIndex((o) => o.correct);
    const chosen = answers[q.id];
    const gotIt = chosen === correctIdx;
    if (gotIt) correctCount++;
    correctById[q.id] = { correctIdx, gotIt };
  }
  const score = Math.round((correctCount / quizzes.length) * 100);
  const passed = score >= 80;

  // Upsert progress with score + attempts++
  const { data: prev } = await admin
    .from('coach_lesson_progress')
    .select('quiz_attempts, quiz_score')
    .eq('coach_id', coach.id)
    .eq('lesson_id', lessonId)
    .maybeSingle();
  const attempts = (prev?.quiz_attempts ?? 0) + 1;
  // Keep the best score
  const bestScore = Math.max(prev?.quiz_score ?? 0, score);

  await admin.from('coach_lesson_progress').upsert(
    {
      coach_id: coach.id,
      lesson_id: lessonId,
      quiz_score: bestScore,
      quiz_attempts: attempts,
      completed: passed || ((prev as any)?.completed ?? false),
      completed_at: passed ? new Date().toISOString() : (prev as any)?.completed_at ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'coach_id,lesson_id' }
  );

  return { score, passed, correctById, attempts };
}

// Mark a coach lesson as read. Upserts into coach_lesson_progress.
export async function markCoachLessonRead(token: string, lessonId: string): Promise<void> {
  const admin = createAdminClient();

  const { data: coach } = await admin
    .from('coaches')
    .select('id')
    .eq('portal_token', token)
    .single();
  if (!coach) throw new Error('Coach not found.');

  const { error } = await admin
    .from('coach_lesson_progress')
    .upsert(
      {
        coach_id: coach.id,
        lesson_id: lessonId,
        content_read: true,
        completed: true,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'coach_id,lesson_id' }
    );
  if (error) throw new Error(error.message);
}

// ── Waiver de staff (#12b) — firma desde el portal, token-gated ──
export async function signStaffWaiver(token: string, typedName: string): Promise<{ ok: boolean; error?: string }> {
  const name = typedName?.trim();
  if (!name || name.length < 5) return { ok: false, error: 'Type your full legal name to sign.' };
  const admin = createAdminClient();
  const { data: coach } = await admin.from('coaches').select('id, waiver_signed').eq('portal_token', token).maybeSingle();
  if (!coach) return { ok: false, error: 'Not found.' };
  if (coach.waiver_signed) return { ok: true };
  const { error } = await admin.from('coaches').update({
    waiver_signed: true,
    waiver_signed_at: new Date().toISOString(),
    waiver_signature: name,
  }).eq('id', coach.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
