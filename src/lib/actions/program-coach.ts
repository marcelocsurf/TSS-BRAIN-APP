'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { elSalvadorToday, elSalvadorDatePlus, toElSalvadorDate } from '@/lib/utils/tz';

// ─── Escalón 1: el coach da seguimiento a sus atletas de programa ───
//
// Portal del coach (por token). Solo ve las asignaciones donde ÉL es el coach
// de seguimiento (program_assignments.coach_id) y solo si tiene el Escalón 1
// otorgado (coaches.hp_escalon >= 1). No crea ni edita nada: eso es E2.
//
// createAdminClient bypassa RLS → el recorte por coach ES la seguridad acá.

export interface HPAthleteRow {
  assignment_id: string;
  student_id: string;
  student_name: string;
  program_title: string;
  position: { week: number; day: number } | null; // null = completado
  days_done: number;
  days_total: number;
  active_today: boolean; // marcó un día o hizo check-in HOY (El Salvador)
  last_checkin: {
    date: string;
    water_glasses: number | null;
    sleep_hours: number | null;
    energy: number | null;
    comment: string | null;
    nutrition: string | null;
  } | null;
}

export async function getMyHPAthletes(
  portalToken: string
): Promise<{ ok: boolean; error?: string; data: { escalon: number; athletes: HPAthleteRow[] } | null }> {
  try {
    const admin = createAdminClient();
    // course_access_granted es el interruptor de revocación del portal del
    // coach (el token NO se rota al revocar) — todas las actions del
    // coach-portal lo exigen, y esta no puede ser la excepción: sin él, un
    // ex-coach con su URL vieja seguiría viendo check-ins de atletas.
    const { data: coach, error: cErr } = await admin
      .from('coaches')
      .select('id, hp_escalon, course_access_granted')
      .eq('portal_token', portalToken)
      .maybeSingle();
    if (cErr) throw cErr;
    if (!coach || !coach.course_access_granted || (coach.hp_escalon ?? 0) < 1) {
      return { ok: true, data: null };
    }

    const { data: asg, error: aErr } = await admin
      .from('program_assignments')
      .select('id, program_id, student_id, students(first_name, last_name), programs!inner(title, active)')
      .eq('coach_id', coach.id)
      .eq('status', 'active')
      .eq('programs.active', true)
      .order('created_at', { ascending: false });
    if (aErr) throw aErr;
    if (!asg || asg.length === 0) return { ok: true, data: { escalon: coach.hp_escalon, athletes: [] } };

    const ids = asg.map((a: any) => a.id);
    const programIds = Array.from(new Set(asg.map((a: any) => a.program_id)));

    const { data: days, error: dErr } = await admin
      .from('program_days')
      .select('id, program_id, week_number, day_number')
      .in('program_id', programIds)
      .order('week_number')
      .order('day_number');
    if (dErr) throw dErr;
    const { data: marks, error: mErr } = await admin
      .from('program_day_marks')
      .select('assignment_id, day_id, done_at')
      .in('assignment_id', ids);
    if (mErr) throw mErr;
    const { data: checkins, error: kErr } = await admin
      .from('program_checkins')
      .select('assignment_id, checkin_date, water_glasses, sleep_hours, energy, comment, nutrition')
      .in('assignment_id', ids)
      .order('checkin_date', { ascending: false });
    if (kErr) throw kErr;

    const daysByProgram = new Map<string, { id: string; week_number: number; day_number: number }[]>();
    for (const d of days ?? []) {
      const arr = daysByProgram.get(d.program_id) ?? [];
      arr.push(d);
      daysByProgram.set(d.program_id, arr);
    }
    const marksByAsg = new Map<string, Set<string>>();
    const markToday = new Set<string>();
    const today = elSalvadorToday();
    for (const m of marks ?? []) {
      const set = marksByAsg.get(m.assignment_id) ?? new Set<string>();
      set.add(m.day_id);
      marksByAsg.set(m.assignment_id, set);
      // done_at es timestamptz UTC: una marca a las 7 PM de El Salvador cae en
      // el día UTC siguiente. Convertir SIEMPRE antes de comparar (invariante #4).
      if (toElSalvadorDate(m.done_at) === today) markToday.add(m.assignment_id);
    }
    const ckByAsg = new Map<string, any[]>();
    for (const c of checkins ?? []) {
      const arr = ckByAsg.get(c.assignment_id) ?? [];
      arr.push(c);
      ckByAsg.set(c.assignment_id, arr);
    }

    const athletes: HPAthleteRow[] = asg.map((a: any) => {
      const pdays = daysByProgram.get(a.program_id) ?? [];
      const done = marksByAsg.get(a.id) ?? new Set<string>();
      const current = pdays.find((d) => !done.has(d.id)) ?? null;
      const cks = ckByAsg.get(a.id) ?? [];
      const lastCk = cks[0] ?? null;
      return {
        assignment_id: a.id,
        student_id: a.student_id,
        student_name: `${a.students?.first_name ?? ''} ${a.students?.last_name ?? ''}`.trim() || '—',
        program_title: a.programs?.title ?? '—',
        position: current ? { week: current.week_number, day: current.day_number } : null,
        days_done: done.size,
        days_total: pdays.length,
        active_today: markToday.has(a.id) || (lastCk?.checkin_date === today),
        last_checkin: lastCk
          ? {
              date: lastCk.checkin_date,
              water_glasses: lastCk.water_glasses,
              sleep_hours: lastCk.sleep_hours,
              energy: lastCk.energy,
              comment: lastCk.comment,
              nutrition: lastCk.nutrition ?? null,
            }
          : null,
      };
    });

    return { ok: true, data: { escalon: coach.hp_escalon, athletes } };
  } catch (e) {
    console.error('[program-coach] getMyHPAthletes failed', e);
    return { ok: false, error: 'No se pudo cargar el seguimiento.', data: null };
  }
}

// ─── Paso 5: citas del coach + evaluaciones por pilar (especialista) ───

export interface CoachAppointment {
  id: string;
  student_id: string;
  student_name: string;
  kind: string;
  mode: string | null; // online | presencial
  title: string | null;
  appointment_date: string;
  appointment_time: string | null;
}

export interface AthleteEvaluation {
  id: string;
  pillar: string;
  score: number | null;
  notes: string | null;
  eval_date: string;
}

// Reutiliza el mismo gate que getMyHPAthletes (token + acceso + E1).
async function resolveE1Coach(admin: ReturnType<typeof createAdminClient>, portalToken: string) {
  const { data: coach, error } = await admin
    .from('coaches')
    .select('id, hp_escalon, course_access_granted')
    .eq('portal_token', portalToken)
    .maybeSingle();
  if (error) throw error;
  if (!coach || !coach.course_access_granted || (coach.hp_escalon ?? 0) < 1) return null;
  return coach;
}

export async function getMyHPAppointments(
  portalToken: string
): Promise<{ ok: boolean; appointments: CoachAppointment[] }> {
  try {
    const admin = createAdminClient();
    const coach = await resolveE1Coach(admin, portalToken);
    if (!coach) return { ok: true, appointments: [] };

    const { data, error } = await admin
      .from('program_appointments')
      .select('id, kind, mode, title, appointment_date, appointment_time, student_id, students(first_name, last_name)')
      .eq('coach_id', coach.id)
      .eq('status', 'scheduled')
      .gte('appointment_date', elSalvadorToday())
      .order('appointment_date')
      .order('appointment_time', { ascending: true, nullsFirst: true })
      .limit(10);
    if (error) throw error;
    return {
      ok: true,
      appointments: (data ?? []).map((a: any) => ({
        id: a.id,
        student_id: a.student_id,
        student_name: `${a.students?.first_name ?? ''} ${a.students?.last_name ?? ''}`.trim() || '—',
        kind: a.kind,
        mode: a.mode ?? null,
        title: a.title,
        appointment_date: a.appointment_date,
        appointment_time: a.appointment_time,
      })),
    };
  } catch (e) {
    console.error('[program-coach] getMyHPAppointments failed', e);
    return { ok: false, appointments: [] };
  }
}

// El atleta debe ser SUYO — el admin client bypassa RLS, así que esta
// validación es la seguridad. "Suyo" por DOS vías: (a) asignación de programa
// activa con coach_id = él (el coach de seguimiento), o (b) una CITA con ese
// alumno (el camino del especialista: el fisio o el mental atienden por cita,
// casi nunca son el coach del programa — sin esta vía, el flujo central del
// Paso 5 "el especialista evalúa su pilar tras la cita" era inalcanzable).
async function assertMyAthlete(
  admin: ReturnType<typeof createAdminClient>,
  coachId: string,
  studentId: string
): Promise<boolean> {
  const { data: asg, error } = await admin
    .from('program_assignments')
    .select('id')
    .eq('coach_id', coachId)
    .eq('student_id', studentId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (asg) return true;

  const { data: appt, error: apErr } = await admin
    .from('program_appointments')
    .select('id')
    .eq('coach_id', coachId)
    .eq('student_id', studentId)
    .neq('status', 'cancelled')
    .limit(1)
    .maybeSingle();
  if (apErr) throw apErr;
  return !!appt;
}

export async function coachCreateEvaluation(
  portalToken: string,
  studentId: string,
  input: { pillar: 'fisico' | 'tecnico' | 'tactico' | 'mental'; score: number; notes?: string | null }
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!['fisico', 'tecnico', 'tactico', 'mental'].includes(input.pillar)) {
      return { ok: false, error: 'Pilar inválido.' };
    }
    if (!(input.score >= 1 && input.score <= 10)) {
      return { ok: false, error: 'El puntaje va de 1 a 10.' };
    }
    const admin = createAdminClient();
    const coach = await resolveE1Coach(admin, portalToken);
    if (!coach) return { ok: false, error: 'Sin acceso.' };
    if (!(await assertMyAthlete(admin, coach.id, studentId))) {
      return { ok: false, error: 'Ese atleta no está a tu cargo.' };
    }
    const { error } = await admin.from('program_evaluations').insert({
      student_id: studentId,
      coach_id: coach.id,
      pillar: input.pillar,
      score: input.score,
      notes: input.notes?.trim() || null,
      eval_date: elSalvadorToday(),
    });
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[program-coach] coachCreateEvaluation failed', e);
    return { ok: false, error: 'No se pudo guardar la evaluación.' };
  }
}

export async function getAthleteEvaluations(
  portalToken: string,
  studentId: string
): Promise<{ ok: boolean; evaluations: AthleteEvaluation[] }> {
  try {
    const admin = createAdminClient();
    const coach = await resolveE1Coach(admin, portalToken);
    if (!coach) return { ok: true, evaluations: [] };
    if (!(await assertMyAthlete(admin, coach.id, studentId))) return { ok: true, evaluations: [] };

    const { data, error } = await admin
      .from('program_evaluations')
      .select('id, pillar, score, notes, eval_date')
      .eq('student_id', studentId)
      .order('eval_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);
    if (error) throw error;
    return { ok: true, evaluations: data ?? [] };
  } catch (e) {
    console.error('[program-coach] getAthleteEvaluations failed', e);
    return { ok: false, evaluations: [] };
  }
}

// ─── Entrega C: la temporada desde el portal del coach/especialista ───
//
// El head coach y los especialistas de una temporada ven el plan anual del
// atleta, agendan sus propias citas (online/presencial) y dejan aportes
// (video/tarea/nota) que el atleta ve en "From your team". El head coach
// además monitorea las cargas: días marcados y check-ins de los últimos 7
// días, para ajustar y calibrar.

export interface CoachSeasonView {
  season_id: string;
  student_id: string;
  student_name: string;
  title: string;
  objective: string | null;
  start_date: string;
  end_date: string;
  is_head: boolean;
  phase_now: string | null;
  days_to_peak: number | null;
  peak_name: string | null;
  load: {
    program_title: string;
    days_done: number;
    days_total: number;
    marks_last7: number;
    checkins_last7: number;
    last_checkin_date: string | null;
  } | null; // null = sin programa activo
  contributions: {
    kind: string;
    title: string;
    coach_name: string;
    specialty: string | null;
    target_date: string | null;
  }[];
}

export async function getMySeasonsHP(
  portalToken: string
): Promise<{ ok: boolean; error?: string; seasons: CoachSeasonView[] }> {
  try {
    const admin = createAdminClient();
    const coach = await resolveE1Coach(admin, portalToken);
    if (!coach) return { ok: true, seasons: [] };

    const [head, spec] = await Promise.all([
      admin.from('season_plans')
        .select('id, student_id, title, objective, start_date, end_date, students(first_name, last_name)')
        .eq('head_coach_id', coach.id).eq('active', true),
      admin.from('season_specialists').select('season_id').eq('coach_id', coach.id),
    ]);
    if (head.error) throw head.error;
    if (spec.error) throw spec.error;

    const headIds = new Set((head.data ?? []).map((s: any) => s.id));
    const specIds = (spec.data ?? []).map((x: any) => x.season_id).filter((id: string) => !headIds.has(id));
    let specSeasons: any[] = [];
    if (specIds.length > 0) {
      const { data, error } = await admin.from('season_plans')
        .select('id, student_id, title, objective, start_date, end_date, students(first_name, last_name)')
        .in('id', specIds).eq('active', true);
      if (error) throw error;
      specSeasons = data ?? [];
    }
    const seasons = [...(head.data ?? []), ...specSeasons];
    if (seasons.length === 0) return { ok: true, seasons: [] };

    const seasonIds = seasons.map((s: any) => s.id);
    const studentIds = Array.from(new Set(seasons.map((s: any) => s.student_id)));
    // Aportes POR temporada (limit por season_id): un limit global newest-first
    // dejaba que una temporada prolífica vaciara los aportes visibles de las demás.
    const [phases, events, asg, ...contribsPer] = await Promise.all([
      admin.from('season_phases').select('season_id, name, start_date, end_date').in('season_id', seasonIds),
      admin.from('season_events').select('season_id, name, event_date, is_peak').in('season_id', seasonIds),
      admin.from('program_assignments')
        .select('id, student_id, program_id, programs!inner(title, active)')
        .in('student_id', studentIds).eq('status', 'active').eq('programs.active', true),
      ...seasonIds.map((id: string) =>
        admin.from('season_contributions')
          .select('season_id, kind, title, target_date, created_at, coaches(display_name, hp_specialty)')
          .eq('season_id', id).order('created_at', { ascending: false }).limit(5)
      ),
    ]);
    if (phases.error) throw phases.error;
    if (events.error) throw events.error;
    if (asg.error) throw asg.error;
    const contribRows: any[] = [];
    for (const c of contribsPer) {
      if (c.error) throw c.error;
      contribRows.push(...(c.data ?? []));
    }

    // Cargas: días de programa + marcas + check-ins de las asignaciones activas.
    const asgIds = (asg.data ?? []).map((a: any) => a.id);
    const programIds = Array.from(new Set((asg.data ?? []).map((a: any) => a.program_id)));
    let dayRows: any[] = [], markRows: any[] = [], ckRows: any[] = [];
    if (asgIds.length > 0) {
      const [d, m, k] = await Promise.all([
        admin.from('program_days').select('id, program_id').in('program_id', programIds),
        admin.from('program_day_marks').select('assignment_id, done_at').in('assignment_id', asgIds),
        admin.from('program_checkins').select('assignment_id, checkin_date').in('assignment_id', asgIds)
          .order('checkin_date', { ascending: false }),
      ]);
      if (d.error) throw d.error;
      if (m.error) throw m.error;
      if (k.error) throw k.error;
      dayRows = d.data ?? []; markRows = m.data ?? []; ckRows = k.data ?? [];
    }
    const today = elSalvadorToday();
    const floor7 = elSalvadorDatePlus(-6); // hoy + 6 días atrás = ventana de 7
    const daysPerProgram = new Map<string, number>();
    for (const d of dayRows) daysPerProgram.set(d.program_id, (daysPerProgram.get(d.program_id) ?? 0) + 1);
    const marksTotal = new Map<string, number>();
    const marks7 = new Map<string, number>();
    for (const m of markRows) {
      marksTotal.set(m.assignment_id, (marksTotal.get(m.assignment_id) ?? 0) + 1);
      // done_at es UTC — convertir antes de comparar contra fechas SV (invariante #4)
      const svDate = toElSalvadorDate(m.done_at);
      if (svDate && svDate >= floor7 && svDate <= today) marks7.set(m.assignment_id, (marks7.get(m.assignment_id) ?? 0) + 1);
    }
    const cks7 = new Map<string, number>();
    const lastCkDate = new Map<string, string>();
    for (const c of ckRows) {
      if (!lastCkDate.has(c.assignment_id)) lastCkDate.set(c.assignment_id, c.checkin_date);
      if (c.checkin_date >= floor7 && c.checkin_date <= today) cks7.set(c.assignment_id, (cks7.get(c.assignment_id) ?? 0) + 1);
    }
    const asgByStudent = new Map<string, any>();
    for (const a of asg.data ?? []) if (!asgByStudent.has(a.student_id)) asgByStudent.set(a.student_id, a);

    const out: CoachSeasonView[] = seasons.map((s: any) => {
      const ph = (phases.data ?? []).filter((p: any) => p.season_id === s.id);
      const now = ph.find((p: any) => p.start_date <= today && p.end_date >= today) ?? null;
      const peak = (events.data ?? []).find((e: any) => e.season_id === s.id && e.is_peak) ?? null;
      const daysToPeak = peak && peak.event_date >= today
        ? Math.round((Date.parse(peak.event_date) - Date.parse(today)) / 86400000)
        : null;
      const a = asgByStudent.get(s.student_id) ?? null;
      return {
        season_id: s.id,
        student_id: s.student_id,
        student_name: `${s.students?.first_name ?? ''} ${s.students?.last_name ?? ''}`.trim() || '—',
        title: s.title,
        objective: s.objective,
        start_date: s.start_date,
        end_date: s.end_date,
        is_head: headIds.has(s.id),
        phase_now: now?.name ?? null,
        days_to_peak: daysToPeak,
        peak_name: peak?.name ?? null,
        load: a
          ? {
              program_title: a.programs?.title ?? '—',
              days_done: marksTotal.get(a.id) ?? 0,
              days_total: daysPerProgram.get(a.program_id) ?? 0,
              marks_last7: marks7.get(a.id) ?? 0,
              checkins_last7: cks7.get(a.id) ?? 0,
              last_checkin_date: lastCkDate.get(a.id) ?? null,
            }
          : null,
        contributions: contribRows
          .filter((c: any) => c.season_id === s.id)
          .map((c: any) => ({
            kind: c.kind,
            title: c.title,
            coach_name: c.coaches?.display_name ?? '—',
            specialty: c.coaches?.hp_specialty ?? null,
            target_date: c.target_date,
          })),
      };
    });
    return { ok: true, seasons: out };
  } catch (e) {
    console.error('[program-coach] getMySeasonsHP failed', e);
    return { ok: false, error: 'No se pudo cargar la temporada.', seasons: [] };
  }
}

// El coach debe pertenecer a la temporada (head coach o especialista) — el
// admin client bypassa RLS, así que ESTA validación es la seguridad del aporte.
async function assertMySeason(
  admin: ReturnType<typeof createAdminClient>,
  coachId: string,
  seasonId: string
): Promise<{ ok: boolean; studentId: string | null }> {
  const { data: season, error } = await admin
    .from('season_plans').select('id, student_id, head_coach_id, active')
    .eq('id', seasonId).maybeSingle();
  if (error) throw error;
  if (!season || !season.active) return { ok: false, studentId: null };
  if (season.head_coach_id === coachId) return { ok: true, studentId: season.student_id };
  const { data: sp, error: spErr } = await admin
    .from('season_specialists').select('season_id')
    .eq('season_id', seasonId).eq('coach_id', coachId).maybeSingle();
  if (spErr) throw spErr;
  return { ok: !!sp, studentId: sp ? season.student_id : null };
}

export async function coachAddSeasonContribution(
  portalToken: string,
  seasonId: string,
  input: { kind: 'video' | 'tarea' | 'nota'; title: string; video_url?: string | null; detail?: string | null; target_date?: string | null }
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!['video', 'tarea', 'nota'].includes(input.kind)) return { ok: false, error: 'Tipo inválido.' };
    if (!input.title.trim()) return { ok: false, error: 'El aporte necesita un título (inglés — lo ve el atleta).' };
    const url = input.video_url?.trim() || null;
    if (input.kind === 'video' && !url) return { ok: false, error: 'El video necesita su link.' };
    if (url && !/^https?:\/\//.test(url)) return { ok: false, error: 'El link del video no es válido.' };
    if (input.target_date && !/^\d{4}-\d{2}-\d{2}$/.test(input.target_date)) return { ok: false, error: 'La fecha no es válida.' };
    const admin = createAdminClient();
    const coach = await resolveE1Coach(admin, portalToken);
    if (!coach) return { ok: false, error: 'Sin acceso.' };
    const season = await assertMySeason(admin, coach.id, seasonId);
    if (!season.ok) return { ok: false, error: 'Esa temporada no está a tu cargo.' };
    const { error } = await admin.from('season_contributions').insert({
      season_id: seasonId,
      coach_id: coach.id,
      kind: input.kind,
      title: input.title.trim(),
      video_url: input.kind === 'video' ? url : null,
      detail: input.detail?.trim() || null,
      target_date: input.target_date || null,
    });
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[program-coach] coachAddSeasonContribution failed', e);
    return { ok: false, error: 'No se pudo guardar el aporte.' };
  }
}

export async function coachCreateAppointmentHP(
  portalToken: string,
  input: {
    seasonId: string;
    kind: 'fisico' | 'mental' | 'tecnico' | 'nutricion' | 'evaluacion' | 'otro';
    mode: 'online' | 'presencial';
    date: string; // YYYY-MM-DD (El Salvador)
    time?: string | null; // HH:MM
    title?: string | null;
  }
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!['fisico', 'mental', 'tecnico', 'nutricion', 'evaluacion', 'otro'].includes(input.kind)) return { ok: false, error: 'Tipo inválido.' };
    if (!['online', 'presencial'].includes(input.mode)) return { ok: false, error: 'Modo inválido.' };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return { ok: false, error: 'La fecha no es válida.' };
    if (input.time && !/^\d{2}:\d{2}$/.test(input.time)) return { ok: false, error: 'La hora no es válida.' };
    if (input.date < elSalvadorToday()) return { ok: false, error: 'La cita no puede ser en el pasado.' };
    const admin = createAdminClient();
    const coach = await resolveE1Coach(admin, portalToken);
    if (!coach) return { ok: false, error: 'Sin acceso.' };
    // La cita nace DESDE la temporada: quien la agenda debe ser su head coach
    // o especialista, y el alumno sale de la temporada — no del formulario.
    const season = await assertMySeason(admin, coach.id, input.seasonId);
    if (!season.ok || !season.studentId) return { ok: false, error: 'Esa temporada no está a tu cargo.' };
    const { error } = await admin.from('program_appointments').insert({
      student_id: season.studentId,
      coach_id: coach.id,
      kind: input.kind,
      mode: input.mode,
      title: input.title?.trim() || null,
      appointment_date: input.date,
      appointment_time: input.time || null,
    });
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[program-coach] coachCreateAppointmentHP failed', e);
    return { ok: false, error: 'No se pudo agendar la cita.' };
  }
}

// ─── Escalón 2: el coach AUTOR — crea y edita programas para SU equipo ───
//
// El mismo editor del admin, recortado: el coach solo ve/toca programas donde
// programs.author_coach_id = él, y solo puede asignarlos a atletas que YA
// están a su cargo (asignación activa con coach_id = él). El catálogo global
// (author_coach_id NULL) sigue siendo territorio exclusivo de Marcelo (E3).
// Los guardarraíles calcan los del editor admin: microciclo dentro del rango,
// backfill anti-rebobinado al insertar días, y bloqueo del último día con
// alumnos activos.

async function resolveE2Coach(admin: ReturnType<typeof createAdminClient>, portalToken: string) {
  const { data: coach, error } = await admin
    .from('coaches')
    .select('id, hp_escalon, course_access_granted')
    .eq('portal_token', portalToken)
    .maybeSingle();
  if (error) throw error;
  if (!coach || !coach.course_access_granted || (coach.hp_escalon ?? 0) < 2) return null;
  return coach;
}

// El programa debe ser DEL coach — admin client bypassa RLS, esta validación
// es la seguridad de todo el editor E2.
async function assertMyProgram(
  admin: ReturnType<typeof createAdminClient>,
  coachId: string,
  programId: string
): Promise<{ id: string; weeks: number } | null> {
  const { data, error } = await admin
    .from('programs')
    .select('id, weeks, author_coach_id')
    .eq('id', programId)
    .maybeSingle();
  if (error) throw error;
  if (!data || data.author_coach_id !== coachId) return null;
  return { id: data.id, weeks: data.weeks };
}

export interface CoachProgramRow {
  id: string;
  title: string;
  subtitle: string | null;
  weeks: number;
  active: boolean;
  days_count: number;
  active_assignments: number;
}

export async function coachListMyPrograms(
  portalToken: string
): Promise<{ ok: boolean; error?: string; data: { escalon: number; programs: CoachProgramRow[] } | null }> {
  try {
    const admin = createAdminClient();
    const coach = await resolveE2Coach(admin, portalToken);
    if (!coach) return { ok: true, data: null };
    const { data: programs, error } = await admin
      .from('programs')
      .select('id, title, subtitle, weeks, active, program_days(id), program_assignments(id, status)')
      .eq('author_coach_id', coach.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return {
      ok: true,
      data: {
        escalon: coach.hp_escalon,
        programs: (programs ?? []).map((p: any) => ({
          id: p.id,
          title: p.title,
          subtitle: p.subtitle,
          weeks: p.weeks,
          active: p.active,
          days_count: (p.program_days ?? []).length,
          active_assignments: (p.program_assignments ?? []).filter((a: any) => a.status === 'active').length,
        })),
      },
    };
  } catch (e) {
    console.error('[program-coach] coachListMyPrograms failed', e);
    return { ok: false, error: 'No se pudieron cargar tus programas.', data: null };
  }
}

export async function coachCreateProgram(
  portalToken: string,
  title: string
): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    const admin = createAdminClient();
    const coach = await resolveE2Coach(admin, portalToken);
    if (!coach) return { ok: false, error: 'Necesitás el Escalón 2 para crear programas.' };
    const t = title.trim();
    if (!t) return { ok: false, error: 'El programa necesita un nombre (inglés — lo ve el atleta).' };
    const { data, error } = await admin
      .from('programs')
      .insert({ title: t, kind: 'custom', weeks: 4, author_coach_id: coach.id })
      .select('id')
      .single();
    if (error) throw error;
    return { ok: true, id: data.id };
  } catch (e) {
    console.error('[program-coach] coachCreateProgram failed', e);
    return { ok: false, error: 'No se pudo crear el programa.' };
  }
}

export interface CoachProgramDetail {
  id: string;
  title: string;
  subtitle: string | null;
  weeks: number;
  active: boolean;
  checkin_water: boolean;
  checkin_sleep: boolean;
  checkin_energy: boolean;
  checkin_comment: boolean;
  checkin_nutrition: boolean;
  week_labels: Record<string, string>;
  week_meta: Record<string, { phase?: string | null; mesocycle?: string | null; type?: string | null; intensity?: string | null; objective?: string | null; pillars?: Record<string, { pct?: number | null; obj?: string | null }> }>;
  active_assignments: number;
  days: {
    id: string;
    week_number: number;
    day_number: number;
    title: string;
    focus: string | null;
    items: { id: string; title: string; detail: string | null; video_url: string | null; display_order: number }[];
  }[];
}

export async function coachGetProgram(
  portalToken: string,
  programId: string
): Promise<{ ok: boolean; error?: string; program: CoachProgramDetail | null }> {
  try {
    const admin = createAdminClient();
    const coach = await resolveE2Coach(admin, portalToken);
    if (!coach) return { ok: true, program: null };
    const mine = await assertMyProgram(admin, coach.id, programId);
    if (!mine) return { ok: false, error: 'Ese programa no es tuyo.', program: null };

    const { data: p, error } = await admin
      .from('programs')
      .select('id, title, subtitle, weeks, active, checkin_water, checkin_sleep, checkin_energy, checkin_comment, checkin_nutrition, week_labels, week_meta')
      .eq('id', programId)
      .single();
    if (error) throw error;
    const { data: days, error: dErr } = await admin
      .from('program_days')
      .select('id, week_number, day_number, title, focus, program_items(id, title, detail, video_url, display_order)')
      .eq('program_id', programId)
      .order('week_number')
      .order('day_number');
    if (dErr) throw dErr;
    const { count, error: cErr } = await admin
      .from('program_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('program_id', programId)
      .eq('status', 'active');
    if (cErr) throw cErr;

    return {
      ok: true,
      program: {
        ...(p as any),
        checkin_nutrition: (p as any).checkin_nutrition ?? false,
        week_labels: (p as any).week_labels ?? {},
        week_meta: (p as any).week_meta ?? {},
        active_assignments: count ?? 0,
        days: (days ?? []).map((d: any) => ({
          id: d.id,
          week_number: d.week_number,
          day_number: d.day_number,
          title: d.title,
          focus: d.focus,
          items: (d.program_items ?? []).sort((a: any, b: any) => a.display_order - b.display_order),
        })),
      },
    };
  } catch (e) {
    console.error('[program-coach] coachGetProgram failed', e);
    return { ok: false, error: 'No se pudo cargar el programa.', program: null };
  }
}

export async function coachUpdateProgramMeta(
  portalToken: string,
  programId: string,
  patch: {
    title?: string; subtitle?: string | null; weeks?: number;
    checkin_water?: boolean; checkin_sleep?: boolean; checkin_energy?: boolean;
    checkin_comment?: boolean; checkin_nutrition?: boolean;
    week_labels?: Record<string, string>;
    week_meta?: Record<string, { phase?: string | null; mesocycle?: string | null; type?: string | null; intensity?: string | null; objective?: string | null; pillars?: Record<string, { pct?: number | null; obj?: string | null }> }>;
  }
): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    const coach = await resolveE2Coach(admin, portalToken);
    if (!coach) return { ok: false, error: 'Sin acceso.' };
    const mine = await assertMyProgram(admin, coach.id, programId);
    if (!mine) return { ok: false, error: 'Ese programa no es tuyo.' };
    if (patch.title !== undefined && !patch.title.trim()) return { ok: false, error: 'El programa necesita un nombre.' };
    if (patch.weeks !== undefined) {
      if (patch.weeks < 1 || patch.weeks > 24) return { ok: false, error: 'Los microciclos van de 1 a 24.' };
      // Reducir microciclos con días ya cargados los dejaría huérfanos:
      // invisibles en el editor pero 100% vivos para el atleta.
      const { data: maxDay, error: mErr } = await admin
        .from('program_days')
        .select('week_number')
        .eq('program_id', programId)
        .order('week_number', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (mErr) throw mErr;
      if (maxDay && patch.weeks < maxDay.week_number) {
        return { ok: false, error: `Hay días cargados hasta el microciclo ${maxDay.week_number} — borralos antes de reducir.` };
      }
    }
    // WHITELIST campo por campo: `{ ...patch }` directo al UPDATE dejaría a un
    // coach E2 inyectar columnas fuera del contrato (author_coach_id, active,
    // for_sale, kind…) con un POST crafteado — los tipos TS no validan runtime.
    const row: Record<string, unknown> = {};
    if (patch.title !== undefined) row.title = patch.title.trim();
    if (patch.subtitle !== undefined) row.subtitle = patch.subtitle?.trim() || null;
    if (patch.weeks !== undefined) row.weeks = patch.weeks;
    if (patch.checkin_water !== undefined) row.checkin_water = !!patch.checkin_water;
    if (patch.checkin_sleep !== undefined) row.checkin_sleep = !!patch.checkin_sleep;
    if (patch.checkin_energy !== undefined) row.checkin_energy = !!patch.checkin_energy;
    if (patch.checkin_comment !== undefined) row.checkin_comment = !!patch.checkin_comment;
    if (patch.checkin_nutrition !== undefined) row.checkin_nutrition = !!patch.checkin_nutrition;
    if (patch.week_labels !== undefined) row.week_labels = patch.week_labels;
    if (patch.week_meta !== undefined) {
      // Sanitizar el INTERIOR del jsonb — el whitelist de columnas no alcanza:
      // un POST crafteado podía meter claves basura, objetos gigantes o tipos
      // no-string que rompen el visor del atleta.
      const TYPES = ['Load', 'Deload', 'Tapering', 'Competition', 'Recovery'];
      const INTENSITIES = ['Low', 'Medium', 'High', 'Peak'];
      const PHASES = ['general', 'especifica', 'competitiva', 'transicion'];
      const PILLAR_KEYS = ['fisico', 'tecnico', 'tactico', 'mental', 'equipment', 'surf'];
      const str = (v: unknown, max: number) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
      const clean: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(patch.week_meta)) {
        const wk = Number(k);
        if (!Number.isInteger(wk) || wk < 1 || wk > 24 || !v || typeof v !== 'object') continue;
        const wm: any = v;
        const pillars: Record<string, unknown> = {};
        if (wm.pillars && typeof wm.pillars === 'object') {
          for (const pk of PILLAR_KEYS) {
            const pv: any = (wm.pillars as any)[pk];
            if (!pv || typeof pv !== 'object') continue;
            const pct = Number(pv.pct);
            pillars[pk] = {
              pct: Number.isFinite(pct) ? Math.max(0, Math.min(100, Math.round(pct))) : null,
              obj: str(pv.obj, 200),
            };
          }
        }
        clean[String(wk)] = {
          phase: PHASES.includes(wm.phase) ? wm.phase : null,
          mesocycle: str(wm.mesocycle, 80),
          type: TYPES.includes(wm.type) ? wm.type : null,
          intensity: INTENSITIES.includes(wm.intensity) ? wm.intensity : null,
          objective: str(wm.objective, 300),
          pillars,
        };
      }
      row.week_meta = clean;
    }
    if (Object.keys(row).length === 0) return { ok: true };
    const { error } = await admin.from('programs').update(row).eq('id', programId);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[program-coach] coachUpdateProgramMeta failed', e);
    return { ok: false, error: 'No se pudo guardar.' };
  }
}

export async function coachSaveDay(
  portalToken: string,
  programId: string,
  day: { id?: string; week_number: number; day_number: number; title: string; focus?: string | null }
): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    const admin = createAdminClient();
    const coach = await resolveE2Coach(admin, portalToken);
    if (!coach) return { ok: false, error: 'Sin acceso.' };
    const mine = await assertMyProgram(admin, coach.id, programId);
    if (!mine) return { ok: false, error: 'Ese programa no es tuyo.' };
    if (!day.title.trim()) return { ok: false, error: 'El día necesita un título.' };
    if (day.week_number < 1 || day.day_number < 1) return { ok: false, error: 'Microciclo y día deben ser 1 o más.' };
    if (day.week_number > mine.weeks) {
      return { ok: false, error: `El programa tiene ${mine.weeks} microciclo${mine.weeks === 1 ? '' : 's'}.` };
    }

    if (day.id) {
      const { error } = await admin
        .from('program_days')
        .update({ week_number: day.week_number, day_number: day.day_number, title: day.title.trim(), focus: day.focus?.trim() || null })
        .eq('id', day.id)
        .eq('program_id', programId);
      if (error) {
        if ((error as any).code === '23505') return { ok: false, error: `Ya existe el día ${day.day_number} en el microciclo ${day.week_number}.` };
        throw error;
      }
      return { ok: true, id: day.id };
    }
    const { data, error } = await admin
      .from('program_days')
      .insert({ program_id: programId, week_number: day.week_number, day_number: day.day_number, title: day.title.trim(), focus: day.focus?.trim() || null })
      .select('id')
      .single();
    if (error) {
      if ((error as any).code === '23505') return { ok: false, error: `Ya existe el día ${day.day_number} en el microciclo ${day.week_number}.` };
      throw error;
    }

    // BACKFILL anti-rebobinado — misma regla que el editor admin: insertar un
    // día ANTES de la posición de un atleta activo lo mandaría de vuelta.
    const { data: activeAsg, error: aErr } = await admin
      .from('program_assignments')
      .select('id, start_date')
      .eq('program_id', programId)
      .eq('status', 'active');
    if (aErr) throw aErr;
    const activeRows = (activeAsg ?? []) as { id: string; start_date: string | null }[];
    if (activeRows.length > 0) {
      const { data: allDays, error: adErr } = await admin
        .from('program_days')
        .select('id, week_number, day_number')
        .eq('program_id', programId);
      if (adErr) throw adErr;
      const laterIds = (allDays ?? [])
        .filter((d: any) =>
          d.week_number > day.week_number ||
          (d.week_number === day.week_number && d.day_number > day.day_number)
        )
        .map((d: any) => d.id);
      if (laterIds.length > 0) {
        const { data: passed, error: pmErr } = await admin
          .from('program_day_marks')
          .select('assignment_id')
          .in('assignment_id', activeRows.map((a) => a.id))
          .in('day_id', laterIds);
        if (pmErr) throw pmErr;
        const passedIds = Array.from(new Set((passed ?? []).map((m: any) => m.assignment_id)));
        if (passedIds.length > 0) {
          // done_at HISTÓRICO (inicio de la asignación): con el default now()
          // cada backfill regalaba +30 en el ranking semanal de esta semana.
          const startOf = new Map(activeRows.map((a) => [a.id, a.start_date]));
          const { error: bfErr } = await admin.from('program_day_marks').upsert(
            passedIds.map((assignmentId) => ({
              assignment_id: assignmentId,
              day_id: data.id,
              done_at: `${startOf.get(assignmentId) || '2020-01-01'}T12:00:00Z`,
            })),
            { onConflict: 'assignment_id,day_id', ignoreDuplicates: true }
          );
          if (bfErr) throw bfErr;
        }
      }
    }
    return { ok: true, id: data.id };
  } catch (e) {
    console.error('[program-coach] coachSaveDay failed', e);
    return { ok: false, error: 'No se pudo guardar el día.' };
  }
}

export async function coachDeleteDay(
  portalToken: string,
  programId: string,
  dayId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    const coach = await resolveE2Coach(admin, portalToken);
    if (!coach) return { ok: false, error: 'Sin acceso.' };
    const mine = await assertMyProgram(admin, coach.id, programId);
    if (!mine) return { ok: false, error: 'Ese programa no es tuyo.' };
    const { data: day, error: dErr } = await admin
      .from('program_days')
      .select('id, program_id')
      .eq('id', dayId)
      .eq('program_id', programId)
      .maybeSingle();
    if (dErr) throw dErr;
    if (!day) return { ok: true };
    // Guardarraíl del editor admin: no dejar un "Completed ✓" falso.
    const { count: daysLeft, error: cErr } = await admin
      .from('program_days')
      .select('id', { count: 'exact', head: true })
      .eq('program_id', programId);
    if (cErr) throw cErr;
    if ((daysLeft ?? 0) <= 1) {
      const { count: actives, error: aErr } = await admin
        .from('program_assignments')
        .select('id', { count: 'exact', head: true })
        .eq('program_id', programId)
        .eq('status', 'active');
      if (aErr) throw aErr;
      if ((actives ?? 0) > 0) {
        return { ok: false, error: `Es el último día y hay ${actives} atleta${actives === 1 ? '' : 's'} activo${actives === 1 ? '' : 's'} en el programa.` };
      }
    }
    const { error } = await admin.from('program_days').delete().eq('id', dayId);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[program-coach] coachDeleteDay failed', e);
    return { ok: false, error: 'No se pudo eliminar el día.' };
  }
}

export async function coachSaveItem(
  portalToken: string,
  programId: string,
  dayId: string,
  item: { id?: string; title: string; detail?: string | null; video_url?: string | null; display_order: number }
): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    const admin = createAdminClient();
    const coach = await resolveE2Coach(admin, portalToken);
    if (!coach) return { ok: false, error: 'Sin acceso.' };
    const mine = await assertMyProgram(admin, coach.id, programId);
    if (!mine) return { ok: false, error: 'Ese programa no es tuyo.' };
    if (!item.title.trim()) return { ok: false, error: 'El ítem necesita un título.' };
    // El día debe pertenecer al programa del coach (un dayId ajeno colaría
    // contenido en el programa de otro).
    const { data: day, error: dErr } = await admin
      .from('program_days').select('id').eq('id', dayId).eq('program_id', programId).maybeSingle();
    if (dErr) throw dErr;
    if (!day) return { ok: false, error: 'Ese día no es de tu programa.' };
    const row = {
      title: item.title.trim(),
      detail: item.detail?.trim() || null,
      video_url: item.video_url?.trim() || null,
      display_order: item.display_order,
    };
    if (item.id) {
      const { error } = await admin.from('program_items').update(row).eq('id', item.id).eq('day_id', dayId);
      if (error) throw error;
      return { ok: true, id: item.id };
    }
    const { data, error } = await admin
      .from('program_items')
      .insert({ ...row, day_id: dayId })
      .select('id')
      .single();
    if (error) throw error;
    return { ok: true, id: data.id };
  } catch (e) {
    console.error('[program-coach] coachSaveItem failed', e);
    return { ok: false, error: 'No se pudo guardar el ítem.' };
  }
}

export async function coachDeleteItem(
  portalToken: string,
  programId: string,
  itemId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    const coach = await resolveE2Coach(admin, portalToken);
    if (!coach) return { ok: false, error: 'Sin acceso.' };
    const mine = await assertMyProgram(admin, coach.id, programId);
    if (!mine) return { ok: false, error: 'Ese programa no es tuyo.' };
    // Solo ítems de días de SU programa.
    const { data: item, error: iErr } = await admin
      .from('program_items')
      .select('id, program_days!inner(program_id)')
      .eq('id', itemId)
      .maybeSingle();
    if (iErr) throw iErr;
    const pd: any = item ? (Array.isArray((item as any).program_days) ? (item as any).program_days[0] : (item as any).program_days) : null;
    if (!item || pd?.program_id !== programId) return { ok: true };
    const { error } = await admin.from('program_items').delete().eq('id', itemId);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[program-coach] coachDeleteItem failed', e);
    return { ok: false, error: 'No se pudo eliminar el ítem.' };
  }
}

export async function coachListVideoLibrary(
  portalToken: string
): Promise<{ ok: boolean; videos: { id: string; title: string; pillar: string | null; video_url: string }[] }> {
  try {
    const admin = createAdminClient();
    const coach = await resolveE2Coach(admin, portalToken);
    if (!coach) return { ok: true, videos: [] };
    const { data, error } = await admin
      .from('program_video_library')
      .select('id, title, pillar, video_url')
      .eq('archived', false)
      .order('pillar')
      .order('title');
    if (error) throw error;
    return { ok: true, videos: data ?? [] };
  } catch (e) {
    console.error('[program-coach] coachListVideoLibrary failed', e);
    return { ok: false, videos: [] };
  }
}

// Asignar SU programa a SU atleta: reemplaza la asignación activa del atleta
// (una sola activa por alumno — misma regla que el admin) manteniéndolo a su
// cargo. Solo atletas que YA sigue (E1): el primer programa siempre lo asigna
// Marcelo; después el coach puede rotarles SUS programas.
export async function coachAssignProgram(
  portalToken: string,
  programId: string,
  studentId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const admin = createAdminClient();
    const coach = await resolveE2Coach(admin, portalToken);
    if (!coach) return { ok: false, error: 'Sin acceso.' };
    const mine = await assertMyProgram(admin, coach.id, programId);
    if (!mine) return { ok: false, error: 'Ese programa no es tuyo.' };

    const { data: prog, error: pErr } = await admin
      .from('programs').select('id, active').eq('id', programId).single();
    if (pErr) throw pErr;
    if (!prog.active) return { ok: false, error: 'El programa está inactivo — activalo primero (pedíselo a Marcelo).' };
    const { count: daysCount, error: dcErr } = await admin
      .from('program_days').select('id', { count: 'exact', head: true }).eq('program_id', programId);
    if (dcErr) throw dcErr;
    if ((daysCount ?? 0) === 0) return { ok: false, error: 'El programa no tiene días cargados todavía.' };

    // El atleta debe estar a SU cargo. OJO: puede haber MÁS de una asignación
    // activa por datos sucios (pasó en producción) — se listan todas, se exige
    // que la más reciente sea suya, y la rotación las cancela TODAS (sanea).
    const { data: actives, error: curErr } = await admin
      .from('program_assignments')
      .select('id, coach_id, program_id, created_at')
      .eq('student_id', studentId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (curErr) throw curErr;
    if (!actives || actives.length === 0 || actives[0].coach_id !== coach.id) {
      return { ok: false, error: 'Ese atleta no está a tu cargo.' };
    }
    if (actives.some((a: any) => a.program_id === programId)) {
      return { ok: false, error: 'El atleta ya está en ese programa.' };
    }

    // Rotación: cancelar TODAS las vigentes y crear la nueva (mismo coach).
    const prevIds = actives.map((a: any) => a.id);
    const { error: offErr } = await admin
      .from('program_assignments')
      .update({ status: 'cancelled' })
      .in('id', prevIds);
    if (offErr) throw offErr;
    const { error: insErr } = await admin.from('program_assignments').insert({
      program_id: programId,
      student_id: studentId,
      coach_id: coach.id,
      status: 'active',
      start_date: elSalvadorToday(),
    });
    if (insErr) {
      // Restaurar si la nueva no pudo crearse — el atleta nunca queda sin
      // programa por una rotación fallida.
      await admin.from('program_assignments').update({ status: 'active' }).in('id', prevIds);
      throw insErr;
    }
    return { ok: true };
  } catch (e) {
    console.error('[program-coach] coachAssignProgram failed', e);
    return { ok: false, error: 'No se pudo asignar el programa.' };
  }
}

// ─── Plantillas de bloque para el autor E2 (solo lectura + insertar en SU día) ───

export async function coachListBlockTemplates(
  portalToken: string
): Promise<{ ok: boolean; templates: { id: string; title: string; belt: string | null; pillar: string | null; items_count: number }[] }> {
  try {
    const admin = createAdminClient();
    const coach = await resolveE2Coach(admin, portalToken);
    if (!coach) return { ok: true, templates: [] };
    const { data, error } = await admin
      .from('program_block_templates')
      .select('id, title, belt, pillar, items')
      .order('pillar').order('title').limit(300);
    if (error) throw error;
    return {
      ok: true,
      templates: (data ?? []).map((t: any) => ({
        id: t.id, title: t.title, belt: t.belt, pillar: t.pillar,
        items_count: Array.isArray(t.items) ? t.items.length : 0,
      })),
    };
  } catch (e) {
    console.error('[program-coach] coachListBlockTemplates failed', e);
    return { ok: false, templates: [] };
  }
}

export async function coachInsertBlockTemplate(
  portalToken: string,
  programId: string,
  dayId: string,
  templateId: string
): Promise<{ ok: boolean; error?: string; inserted?: number }> {
  try {
    const admin = createAdminClient();
    const coach = await resolveE2Coach(admin, portalToken);
    if (!coach) return { ok: false, error: 'Sin acceso.' };
    const mine = await assertMyProgram(admin, coach.id, programId);
    if (!mine) return { ok: false, error: 'Ese programa no es tuyo.' };
    const { data: day, error: dErr } = await admin
      .from('program_days').select('id').eq('id', dayId).eq('program_id', programId).maybeSingle();
    if (dErr) throw dErr;
    if (!day) return { ok: false, error: 'Ese día no es de tu programa.' };
    const { data: tpl, error: tErr } = await admin
      .from('program_block_templates').select('items').eq('id', templateId).maybeSingle();
    if (tErr) throw tErr;
    if (!tpl) return { ok: false, error: 'Plantilla no encontrada.' };
    const items = Array.isArray(tpl.items) ? tpl.items : [];
    if (items.length === 0) return { ok: false, error: 'La plantilla está vacía.' };
    const { data: existing, error: eErr } = await admin
      .from('program_items').select('display_order').eq('day_id', dayId)
      .order('display_order', { ascending: false }).limit(1);
    if (eErr) throw eErr;
    const base = (existing?.[0]?.display_order as number | undefined) ?? 0;
    const { error } = await admin.from('program_items').insert(
      items.map((it: any, i: number) => ({
        day_id: dayId,
        title: (it.title || 'Item').slice(0, 200),
        detail: it.detail || null,
        video_url: it.video_url || null,
        display_order: base + i + 1,
      }))
    );
    if (error) throw error;
    return { ok: true, inserted: items.length };
  } catch (e) {
    console.error('[program-coach] coachInsertBlockTemplate failed', e);
    return { ok: false, error: 'No se pudo insertar el bloque.' };
  }
}
