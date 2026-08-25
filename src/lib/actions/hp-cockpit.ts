'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { isRealPlatformAdmin, getCurrentCoach } from '@/lib/actions/auth';
import { elSalvadorToday, elSalvadorDatePlus, toElSalvadorDate } from '@/lib/utils/tz';
import { computeWeekRanking, svWeekBounds, type RankRow } from '@/lib/programs/ranking';

// ─── El cockpit HP: toda la app de Alto Rendimiento en UNA pantalla de BRAIN ───
//
// Réplica del panel del head coach de la app HP (TSS El Salvador): Panel /
// Plan / Sesión / Citas / Eval / Msg / Equipo, con la Biblioteca completa
// (secuencia, drills, misiones, videos). Solo LEE y ESCRIBE en las tablas que
// ya existen — es una vista unificada, no un sistema paralelo. Nada de la
// academia se toca. Candado: SOLO admin de plataforma (Marcelo, head coach).

async function assertAdmin(): Promise<boolean> {
  return isRealPlatformAdmin().catch(() => false);
}

const DENY = { ok: false as const, error: 'Solo el head coach puede usar el cockpit HP.' };

// ─── PANEL: el día de un vistazo ───

export interface HPPanelData {
  today: string;
  athletes_total: number;
  marked_today: number;
  checkins_today: number;
  alerts: { student_id: string; name: string; days_inactive: number }[];
  ranking_top: RankRow[];
  next_appointments: { student_name: string; coach_name: string; kind: string; mode: string | null; date: string; time: string | null }[];
  next_competitions: { student_name: string; name: string; comp_date: string; status: string }[];
  unread_messages: number;
}

export async function hpPanel(): Promise<{ ok: boolean; error?: string; data: HPPanelData | null }> {
  try {
    if (!(await assertAdmin())) return { ...DENY, data: null };
    const admin = createAdminClient();
    const today = elSalvadorToday();

    const { data: asg, error: aErr } = await admin
      .from('program_assignments')
      .select('id, student_id, students(first_name, last_name)')
      .eq('status', 'active');
    if (aErr) throw aErr;
    const asgIds = (asg ?? []).map((a: any) => a.id);
    const nameOf = new Map<string, string>();
    for (const a of asg ?? []) {
      nameOf.set((a as any).student_id, `${(a as any).students?.first_name ?? ''} ${(a as any).students?.last_name ?? ''}`.trim() || '—');
    }

    let markedToday = 0, checkinsToday = 0;
    const lastActivity = new Map<string, string>(); // student → última fecha SV
    if (asgIds.length > 0) {
      const [marks, cks] = await Promise.all([
        admin.from('program_day_marks').select('assignment_id, done_at')
          .in('assignment_id', asgIds)
          .gte('done_at', elSalvadorDatePlus(-15) + 'T00:00:00Z'),
        admin.from('program_checkins').select('assignment_id, checkin_date')
          .in('assignment_id', asgIds)
          .gte('checkin_date', elSalvadorDatePlus(-15)),
      ]);
      if (marks.error) throw marks.error;
      if (cks.error) throw cks.error;
      const studentOf = new Map<string, string>((asg ?? []).map((a: any) => [a.id, a.student_id]));
      const markedSet = new Set<string>();
      const ckSet = new Set<string>();
      const bump = (student: string | undefined, date: string | null) => {
        if (!student || !date) return;
        const prev = lastActivity.get(student);
        if (!prev || date > prev) lastActivity.set(student, date);
      };
      for (const m of marks.data ?? []) {
        const sv = toElSalvadorDate(m.done_at);
        const st = studentOf.get(m.assignment_id);
        bump(st, sv);
        if (sv === today && st) markedSet.add(st);
      }
      for (const c of cks.data ?? []) {
        const st = studentOf.get(c.assignment_id);
        bump(st, c.checkin_date);
        if (c.checkin_date === today && st) ckSet.add(st);
      }
      markedToday = markedSet.size;
      checkinsToday = ckSet.size;
    }

    const diffDays = (from: string, to: string) =>
      Math.round((Date.parse(to) - Date.parse(from)) / 86400000);
    const alerts = Array.from(nameOf.entries())
      .map(([sid, name]) => {
        const last = lastActivity.get(sid);
        return { student_id: sid, name, days_inactive: last ? diffDays(last, today) : 99 };
      })
      .filter((x) => x.days_inactive >= 3)
      .sort((a, b) => b.days_inactive - a.days_inactive)
      .slice(0, 8);

    const { monday, sunday } = svWeekBounds(today);
    const [ranking, appts, comps, unread] = await Promise.all([
      computeWeekRanking(admin, monday, sunday),
      admin.from('program_appointments')
        .select('kind, mode, appointment_date, appointment_time, students(first_name, last_name), coaches(display_name)')
        .eq('status', 'scheduled').gte('appointment_date', today)
        .order('appointment_date').order('appointment_time', { ascending: true, nullsFirst: true }).limit(5),
      admin.from('athlete_competitions')
        .select('name, comp_date, status, students(first_name, last_name)')
        .neq('status', 'finished').or(`status.eq.live,comp_date.gte.${today}`)
        .order('comp_date').limit(5),
      admin.from('hp_messages').select('id', { count: 'exact', head: true }).is('read_at', null),
    ]);
    if (appts.error) throw appts.error;
    if (comps.error) throw comps.error;
    if (unread.error) throw unread.error;

    return {
      ok: true,
      data: {
        today,
        athletes_total: nameOf.size,
        marked_today: markedToday,
        checkins_today: checkinsToday,
        alerts,
        ranking_top: ranking.slice(0, 5),
        next_appointments: (appts.data ?? []).map((a: any) => ({
          student_name: `${a.students?.first_name ?? ''} ${a.students?.last_name ?? ''}`.trim(),
          coach_name: a.coaches?.display_name ?? '—',
          kind: a.kind, mode: a.mode ?? null,
          date: a.appointment_date, time: a.appointment_time,
        })),
        next_competitions: (comps.data ?? []).map((c: any) => ({
          student_name: `${c.students?.first_name ?? ''} ${c.students?.last_name ?? ''}`.trim(),
          name: c.name, comp_date: c.comp_date, status: c.status,
        })),
        unread_messages: unread.count ?? 0,
      },
    };
  } catch (e) {
    console.error('[hp-cockpit] hpPanel failed', e);
    return { ok: false, error: 'No se pudo cargar el panel.', data: null };
  }
}

// ─── PLAN: qué le toca HOY a cada atleta ───

export interface HPPlanRow {
  student_id: string;
  program_id: string; // atajo "✎ Editar su plan" → /programas?programa={id}
  name: string;
  program_title: string;
  position: string; // "M2·D3" o "Completado"
  day_title: string | null;
  items_count: number;
  done_today: boolean;
}

export async function hpPlanToday(): Promise<{ ok: boolean; error?: string; rows: HPPlanRow[] }> {
  try {
    if (!(await assertAdmin())) return { ...DENY, rows: [] };
    const admin = createAdminClient();
    const today = elSalvadorToday();

    const { data: asg, error: aErr } = await admin
      .from('program_assignments')
      .select('id, student_id, program_id, students(first_name, last_name), programs!inner(title, active)')
      .eq('status', 'active').eq('programs.active', true);
    if (aErr) throw aErr;
    if (!asg || asg.length === 0) return { ok: true, rows: [] };
    const asgIds = asg.map((a: any) => a.id);
    const programIds = Array.from(new Set(asg.map((a: any) => a.program_id)));

    const [days, marks] = await Promise.all([
      admin.from('program_days')
        .select('id, program_id, week_number, day_number, title, program_items(id)')
        .in('program_id', programIds).order('week_number').order('day_number'),
      admin.from('program_day_marks').select('assignment_id, day_id, done_at').in('assignment_id', asgIds),
    ]);
    if (days.error) throw days.error;
    if (marks.error) throw marks.error;

    const daysByProgram = new Map<string, any[]>();
    for (const d of days.data ?? []) {
      const arr = daysByProgram.get(d.program_id) ?? [];
      arr.push(d);
      daysByProgram.set(d.program_id, arr);
    }
    const doneByAsg = new Map<string, Set<string>>();
    const doneToday = new Set<string>();
    for (const m of marks.data ?? []) {
      const set = doneByAsg.get(m.assignment_id) ?? new Set<string>();
      set.add(m.day_id);
      doneByAsg.set(m.assignment_id, set);
      if (toElSalvadorDate(m.done_at) === today) doneToday.add(m.assignment_id);
    }

    const rows: HPPlanRow[] = (asg as any[]).map((a) => {
      const pdays = daysByProgram.get(a.program_id) ?? [];
      const done = doneByAsg.get(a.id) ?? new Set<string>();
      const current = pdays.find((d: any) => !done.has(d.id)) ?? null;
      return {
        student_id: a.student_id,
        program_id: a.program_id,
        name: `${a.students?.first_name ?? ''} ${a.students?.last_name ?? ''}`.trim() || '—',
        program_title: a.programs?.title ?? '—',
        position: current ? `M${current.week_number}·D${current.day_number}` : 'Completado ✓',
        day_title: current?.title ?? null,
        items_count: current ? (current.program_items ?? []).length : 0,
        done_today: doneToday.has(a.id),
      };
    }).sort((x, y) => x.name.localeCompare(y.name));
    return { ok: true, rows };
  } catch (e) {
    console.error('[hp-cockpit] hpPlanToday failed', e);
    return { ok: false, error: 'No se pudo cargar el plan.', rows: [] };
  }
}

// ─── BIBLIOTECA: secuencia, drills, misiones, videos (todo el método) ───

export interface HPLibrary {
  sequences: { id: string; belt_level: string | null; sequence_number: number | null; step_order: number | null; sequence_part: string | null; expectation_standard: string | null; pilar_reference: string | null }[];
  drills: { id: string; drill_name: string; related_pilar: string | null; drill_type: string | null; goal: string | null; key_cue: string | null; related_error: string | null; related_solution: string | null; environment: string | null; belt_level_range: string | null }[];
  // step_id = el paso del método (STP-###), el único enlace real drill↔paso.
  // No se estaba seleccionando: sin él, el ítem que se inserta en un programa
  // queda huérfano de la progresión de cinta (student_step_ratings).
  missions: { id: string; step_id: string | null; title: string; type: string | null; belt: string | null; time_estimate: string | null; success_criteria: string | null; description_md: string | null }[];
  videos: { id: string; title: string; pillar: string | null; video_url: string }[];
}

export async function hpLibrary(): Promise<{ ok: boolean; error?: string; data: HPLibrary | null }> {
  try {
    if (!(await assertAdmin())) return { ...DENY, data: null };
    const admin = createAdminClient();
    const [seq, dr, mi, vi] = await Promise.all([
      admin.from('sequences')
        .select('id, belt_level, sequence_number, step_order, sequence_part, expectation_standard, pilar_reference')
        .eq('active_status', true)
        .order('belt_level').order('sequence_number').order('step_order').limit(500),
      admin.from('drills')
        .select('id, drill_name, related_pilar, drill_type, goal, key_cue, related_error, related_solution, environment, belt_level_range')
        .eq('active_status', true).order('drill_name').limit(400),
      admin.from('drills_missions')
        .select('id, step_id, title, type, belt, time_estimate, success_criteria, description_md')
        .eq('active', true).order('belt').order('display_order').limit(300),
      admin.from('program_video_library')
        .select('id, title, pillar, video_url').eq('archived', false).order('pillar').order('title'),
    ]);
    if (seq.error) throw seq.error;
    if (dr.error) throw dr.error;
    if (mi.error) throw mi.error;
    if (vi.error) throw vi.error;
    return {
      ok: true,
      data: {
        sequences: (seq.data ?? []) as any,
        drills: (dr.data ?? []) as any,
        // success_criteria es text[] en la base — normalizar a string acá o el
        // buscador del cliente crashea con .toLowerCase() sobre un array.
        missions: (mi.data ?? []).map((m: any) => ({
          ...m,
          success_criteria: Array.isArray(m.success_criteria)
            ? (m.success_criteria.length ? m.success_criteria.join(' · ') : null)
            : (m.success_criteria ?? null),
        })) as any,
        videos: (vi.data ?? []) as any,
      },
    };
  } catch (e) {
    console.error('[hp-cockpit] hpLibrary failed', e);
    return { ok: false, error: 'No se pudo cargar la biblioteca.', data: null };
  }
}

// ─── EQUIPO: toda la data de cada atleta, junta ───

export interface HPTeamRow {
  student_id: string;
  name: string;
  program_title: string;
  position: string;
  adherence_pct: number;
  active_today: boolean;
  last_checkin_date: string | null;
  ranking_position: number | null;
  ranking_points: number;
  next_competition: string | null;
  evals_count: number;
}

export async function hpTeam(): Promise<{ ok: boolean; error?: string; rows: HPTeamRow[] }> {
  try {
    if (!(await assertAdmin())) return { ...DENY, rows: [] };
    const admin = createAdminClient();
    const today = elSalvadorToday();
    const plan = await hpPlanTodayInternal(admin, today);
    const studentIds = plan.map((p) => p.student_id);
    if (studentIds.length === 0) return { ok: true, rows: [] };

    const { monday, sunday } = svWeekBounds(today);
    const [ranking, comps, evals, cks] = await Promise.all([
      computeWeekRanking(admin, monday, sunday),
      admin.from('athlete_competitions')
        .select('student_id, name, comp_date, status')
        .in('student_id', studentIds).neq('status', 'finished')
        .or(`status.eq.live,comp_date.gte.${today}`).order('comp_date'),
      admin.from('program_evaluations').select('student_id').in('student_id', studentIds),
      // Ventana por FECHA (45 días), no limit global: con el historial creciendo
      // el top-400 dejaba fuera el último check-in de atletas menos recientes.
      admin.from('program_checkins')
        .select('assignment_id, checkin_date, program_assignments!inner(student_id)')
        .in('program_assignments.student_id', studentIds)
        .gte('checkin_date', elSalvadorDatePlus(-45))
        .order('checkin_date', { ascending: false }),
    ]);
    if (comps.error) throw comps.error;
    if (evals.error) throw evals.error;
    if (cks.error) throw cks.error;

    const rankOf = new Map(ranking.map((r) => [r.student_id, r]));
    const nextComp = new Map<string, string>();
    for (const c of comps.data ?? []) {
      if (!nextComp.has(c.student_id)) nextComp.set(c.student_id, `${c.name} · ${c.comp_date}`);
    }
    const evalCount = new Map<string, number>();
    for (const e of evals.data ?? []) evalCount.set(e.student_id, (evalCount.get(e.student_id) ?? 0) + 1);
    const lastCk = new Map<string, string>();
    for (const c of cks.data ?? []) {
      const sid = (c as any).program_assignments?.student_id;
      if (sid && !lastCk.has(sid)) lastCk.set(sid, c.checkin_date);
    }

    return {
      ok: true,
      rows: plan.map((p) => ({
        student_id: p.student_id,
        name: p.name,
        program_title: p.program_title,
        position: p.position,
        adherence_pct: p.adherence_pct,
        active_today: p.done_today || lastCk.get(p.student_id) === today,
        last_checkin_date: lastCk.get(p.student_id) ?? null,
        ranking_position: rankOf.get(p.student_id)?.position ?? null,
        ranking_points: rankOf.get(p.student_id)?.points ?? 0,
        next_competition: nextComp.get(p.student_id) ?? null,
        evals_count: evalCount.get(p.student_id) ?? 0,
      })),
    };
  } catch (e) {
    console.error('[hp-cockpit] hpTeam failed', e);
    return { ok: false, error: 'No se pudo cargar el equipo.', rows: [] };
  }
}

// Versión interna (comparte queries con hpTeam sin doble assertAdmin).
async function hpPlanTodayInternal(admin: ReturnType<typeof createAdminClient>, today: string) {
  const { data: asg, error: aErr } = await admin
    .from('program_assignments')
    .select('id, student_id, program_id, students(first_name, last_name), programs!inner(title, active)')
    .eq('status', 'active').eq('programs.active', true);
  if (aErr) throw aErr;
  if (!asg || asg.length === 0) return [];
  const asgIds = asg.map((a: any) => a.id);
  const programIds = Array.from(new Set(asg.map((a: any) => a.program_id)));
  const [days, marks] = await Promise.all([
    admin.from('program_days').select('id, program_id, week_number, day_number').in('program_id', programIds).order('week_number').order('day_number'),
    admin.from('program_day_marks').select('assignment_id, day_id, done_at').in('assignment_id', asgIds),
  ]);
  if (days.error) throw days.error;
  if (marks.error) throw marks.error;
  const daysByProgram = new Map<string, any[]>();
  for (const d of days.data ?? []) {
    const arr = daysByProgram.get(d.program_id) ?? [];
    arr.push(d);
    daysByProgram.set(d.program_id, arr);
  }
  const doneByAsg = new Map<string, Set<string>>();
  const doneToday = new Set<string>();
  for (const m of marks.data ?? []) {
    const set = doneByAsg.get(m.assignment_id) ?? new Set<string>();
    set.add(m.day_id);
    doneByAsg.set(m.assignment_id, set);
    if (toElSalvadorDate(m.done_at) === today) doneToday.add(m.assignment_id);
  }
  return (asg as any[]).map((a) => {
    const pdays = daysByProgram.get(a.program_id) ?? [];
    const done = doneByAsg.get(a.id) ?? new Set<string>();
    const current = pdays.find((d: any) => !done.has(d.id)) ?? null;
    return {
      student_id: a.student_id as string,
      name: `${a.students?.first_name ?? ''} ${a.students?.last_name ?? ''}`.trim() || '—',
      program_title: a.programs?.title ?? '—',
      position: current ? `M${current.week_number}·D${current.day_number}` : 'Completado ✓',
      adherence_pct: pdays.length > 0 ? Math.round((done.size / pdays.length) * 100) : 0,
      done_today: doneToday.has(a.id),
    };
  }).sort((x, y) => x.name.localeCompare(y.name));
}

// ─── MSG: mensajes simples coach → atleta (aparecen en el portal del alumno) ───

export interface HPMessageRow {
  id: string;
  student_id: string;
  student_name: string;
  subject: string | null;
  body: string;
  read_at: string | null;
  created_at: string;
}

export async function hpListMessages(): Promise<{ ok: boolean; error?: string; messages: HPMessageRow[] }> {
  try {
    if (!(await assertAdmin())) return { ...DENY, messages: [] };
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('hp_messages')
      .select('id, student_id, subject, body, read_at, created_at, students(first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(40);
    if (error) throw error;
    return {
      ok: true,
      messages: (data ?? []).map((m: any) => ({
        id: m.id,
        student_id: m.student_id,
        student_name: `${m.students?.first_name ?? ''} ${m.students?.last_name ?? ''}`.trim() || '—',
        subject: m.subject,
        body: m.body,
        read_at: m.read_at,
        created_at: m.created_at,
      })),
    };
  } catch (e) {
    console.error('[hp-cockpit] hpListMessages failed', e);
    return { ok: false, error: 'No se pudieron cargar los mensajes.', messages: [] };
  }
}

export async function hpSendMessage(input: {
  studentId: string | 'all';
  subject?: string | null;
  body: string;
}): Promise<{ ok: boolean; error?: string; sent?: number }> {
  try {
    if (!(await assertAdmin())) return DENY;
    const body = input.body.trim();
    if (!body) return { ok: false, error: 'El mensaje está vacío.' };
    if (body.length > 2000) return { ok: false, error: 'Máximo 2000 caracteres.' };
    const admin = createAdminClient();
    const me = await getCurrentCoach();

    let targets: string[] = [];
    if (input.studentId === 'all') {
      // "Todos" = los atletas HP (asignación activa) — como el buzón de HP.
      const { data: asg, error } = await admin
        .from('program_assignments').select('student_id').eq('status', 'active');
      if (error) throw error;
      targets = Array.from(new Set((asg ?? []).map((a: any) => a.student_id)));
    } else {
      targets = [input.studentId];
    }
    if (targets.length === 0) return { ok: false, error: 'No hay atletas destino.' };

    const { error: insErr } = await admin.from('hp_messages').insert(
      targets.map((sid) => ({
        student_id: sid,
        sender_coach_id: me?.id ?? null,
        subject: input.subject?.trim() || null,
        body,
      }))
    );
    if (insErr) throw insErr;
    return { ok: true, sent: targets.length };
  } catch (e) {
    console.error('[hp-cockpit] hpSendMessage failed', e);
    return { ok: false, error: 'No se pudo enviar.' };
  }
}

// ─── SESIÓN: sesiones presenciales del equipo — pasar lista sin fricción ───

export interface HPSessionRow {
  id: string;
  session_date: string;
  title: string;
  notes: string | null;
  // Migración 00167 — la sesión registra todo (antes solo fecha + título).
  session_time: string | null;
  duration_minutes: number | null;
  location: string | null;
  focus: string | null;
  kind: string | null;
  coach_name: string | null;
  attendance: { student_id: string; name: string; present: boolean; note: string | null }[];
}

export async function hpListSessions(): Promise<{ ok: boolean; error?: string; sessions: HPSessionRow[] }> {
  try {
    if (!(await assertAdmin())) return { ...DENY, sessions: [] };
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('hp_team_sessions')
      .select('id, session_date, session_time, duration_minutes, location, focus, kind, title, notes, coaches:coach_id(display_name), hp_session_attendance(student_id, present, note, students(first_name, last_name))')
      .order('session_date', { ascending: false })
      // Desempate por hora: dos sesiones el mismo día salían en orden
      // no determinístico y eran visualmente idénticas.
      .order('session_time', { ascending: false, nullsFirst: false })
      .limit(12);
    if (error) throw error;
    return {
      ok: true,
      sessions: (data ?? []).map((s: any) => ({
        id: s.id,
        session_date: s.session_date,
        title: s.title,
        notes: s.notes,
        session_time: s.session_time ?? null,
        duration_minutes: s.duration_minutes ?? null,
        location: s.location ?? null,
        focus: s.focus ?? null,
        kind: s.kind ?? null,
        coach_name: (Array.isArray(s.coaches) ? s.coaches[0] : s.coaches)?.display_name ?? null,
        attendance: (s.hp_session_attendance ?? []).map((r: any) => ({
          student_id: r.student_id,
          name: `${r.students?.first_name ?? ''} ${r.students?.last_name ?? ''}`.trim() || '—',
          present: r.present,
          note: r.note,
        })).sort((a: any, b: any) => a.name.localeCompare(b.name)),
      })),
    };
  } catch (e) {
    console.error('[hp-cockpit] hpListSessions failed', e);
    return { ok: false, error: 'No se pudieron cargar las sesiones.', sessions: [] };
  }
}

// ─── Puente: la sesión presencial SUMA HORAS al atleta ───
// Hasta ahora la sesión existía solo para el staff: no aparecía en el portal
// del atleta ni sumaba un minuto a sus horas de agua. Con la duración de la
// migración 00167 ya se puede. Idempotente por (sesión, atleta) vía el tag en
// notes; kind 'drill' = TRAINING, que es lo correcto: una sesión presencial
// dirigida por el coach es intervención, no surf libre.
async function syncSessionHours(
  admin: ReturnType<typeof createAdminClient>,
  sessionId: string,
): Promise<void> {
  try {
    // CADA lectura se chequea: un fallo transitorio interpretado como "sin
    // duración" o "sin presentes" BORRABA las horas ya acreditadas a todo el
    // equipo, en silencio (hallazgo crítico de la revisión). Ante un error se
    // aborta el sync — mejor no tocar nada que destruir datos.
    const { data: sess, error: sErr } = await admin
      .from('hp_team_sessions')
      .select('id, title, duration_minutes, session_date, kind')
      .eq('id', sessionId)
      .maybeSingle();
    if (sErr) throw sErr;
    if (!sess) return; // la sesión ya no existe: nada que sincronizar
    const minutes = (sess as any).duration_minutes ?? null;
    // Solo el AGUA cuenta como minutos de agua: una sesión de gym, video o
    // skate se acredita como entreno pero NO infla las horas de agua.
    const isWater = !(sess as any).kind || ['agua', 'mixto'].includes((sess as any).kind);
    // Una sesión FUTURA no acredita horas todavía (crearla el lunes para el
    // viernes sumaba las horas al instante y las metía en el ranking).
    const happened = String((sess as any).session_date) <= elSalvadorToday();

    const { data: att, error: aErr } = await admin
      .from('hp_session_attendance')
      .select('student_id, present')
      .eq('session_id', sessionId);
    if (aErr) throw aErr;
    const present = new Set((att ?? []).filter((a: any) => a.present).map((a: any) => a.student_id));

    // Filas ya creadas por esta sesión.
    const { data: existing, error: eErr } = await admin
      .from('self_training_sessions')
      .select('id, student_id, notes')
      .like('notes', `hpsession:${sessionId}:%`);
    if (eErr) throw eErr; // sin esta lectura el bucle DUPLICARÍA las filas
    const byStudent = new Map((existing ?? []).map((r: any) => [r.student_id, r]));

    // Sin duración (o sesión futura) = no declara horas: se limpia lo que hubiera.
    const shouldHave = minutes && minutes > 0 && happened ? present : new Set<string>();

    const toDelete = (existing ?? []).filter((r: any) => !shouldHave.has(r.student_id)).map((r: any) => r.id);
    if (toDelete.length) await admin.from('self_training_sessions').delete().in('id', toDelete);

    for (const sid of shouldHave) {
      const row = byStudent.get(sid);
      if (row) {
        await admin.from('self_training_sessions')
          .update({ duration_minutes: minutes, total_water_minutes: isWater ? minutes : 0 })
          .eq('id', (row as any).id);
      } else {
        await admin.from('self_training_sessions').insert({
          student_id: sid,
          drill_name: `Sesión de equipo · ${(sess as any).title ?? 'HP'}`,
          duration_minutes: minutes,
          total_water_minutes: isWater ? minutes : 0,
          completed: true,
          notes: `hpsession:${sessionId}:${sid}`,
          // session_date para que la fila caiga en la SEMANA correcta del
          // ranking y de la bitácora, no en el día en que se pasó lista.
          session_date: (sess as any).session_date,
          created_at: `${(sess as any).session_date}T18:00:00Z`,
        });
      }
    }
  } catch (e) {
    // Best-effort: nunca debe tumbar el pase de lista.
    console.error('[hp-cockpit] syncSessionHours failed', e);
  }
}

export async function hpCreateSession(input: {
  date: string; title: string;
  // Migración 00167 — la sesión presencial ahora registra TODO (pedido de
  // Marcelo 2026-08-25): antes solo tenía fecha y un texto libre, y el staff
  // terminaba escribiendo el lugar dentro del título ("EL ZONTE").
  time?: string | null;
  durationMinutes?: number | null;
  location?: string | null;
  coachId?: string | null;
  focus?: string | null;
  kind?: string | null;
}): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return { ok: false, error: 'La fecha no es válida.' };
    if (!input.title.trim()) return { ok: false, error: 'La sesión necesita un nombre.' };
    if (input.time && !/^\d{2}:\d{2}$/.test(input.time)) return { ok: false, error: 'La hora no es válida.' };
    const dur = input.durationMinutes ?? null;
    if (dur != null && (!Number.isFinite(dur) || dur <= 0 || dur > 600)) {
      return { ok: false, error: 'La duración va de 1 a 600 minutos.' };
    }
    const KINDS = ['agua', 'tierra', 'gym', 'skate', 'video', 'mixto'];
    if (input.kind && !KINDS.includes(input.kind)) return { ok: false, error: 'Tipo de sesión inválido.' };
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('hp_team_sessions')
      .insert({
        session_date: input.date,
        title: input.title.trim(),
        session_time: input.time || null,
        duration_minutes: dur,
        location: input.location?.trim().slice(0, 200) || null,
        coach_id: input.coachId || null,
        focus: input.focus?.trim().slice(0, 500) || null,
        kind: input.kind || null,
      })
      .select('id').single();
    if (error) throw error;

    // Pre-cargar la lista con TODOS los atletas HP como presentes: pasar lista
    // = destildar a los que faltaron. Cero fricción (pedido de Marcelo).
    const { data: asg, error: aErr } = await admin
      .from('program_assignments').select('student_id').eq('status', 'active');
    if (aErr) throw aErr;
    const students = Array.from(new Set((asg ?? []).map((a: any) => a.student_id)));
    if (students.length > 0) {
      const { error: attErr } = await admin.from('hp_session_attendance').insert(
        students.map((sid) => ({ session_id: data.id, student_id: sid, present: true }))
      );
      if (attErr) throw attErr;
    }
    await syncSessionHours(admin, data.id);
    return { ok: true, id: data.id };
  } catch (e) {
    console.error('[hp-cockpit] hpCreateSession failed', e);
    return { ok: false, error: 'No se pudo crear la sesión.' };
  }
}

export async function hpSetAttendance(
  sessionId: string,
  studentId: string,
  patch: { present?: boolean; note?: string | null }
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    const admin = createAdminClient();
    // UPSERT, no update: un atleta asignado DESPUÉS de crear la sesión no
    // tenía fila y el update silencioso de 0 filas devolvía ok mintiendo.
    const { data: existing, error: exErr } = await admin
      .from('hp_session_attendance')
      .select('present, note')
      .eq('session_id', sessionId).eq('student_id', studentId)
      .maybeSingle();
    if (exErr) throw exErr;
    const row = {
      session_id: sessionId,
      student_id: studentId,
      present: patch.present !== undefined ? !!patch.present : (existing?.present ?? true),
      note: patch.note !== undefined ? (patch.note?.trim() || null) : (existing?.note ?? null),
    };
    const { error } = await admin
      .from('hp_session_attendance')
      .upsert(row, { onConflict: 'session_id,student_id' });
    if (error) throw error;
    // Presente/ausente cambia las horas del atleta.
    if (patch.present !== undefined) await syncSessionHours(admin, sessionId);
    return { ok: true };
  } catch (e) {
    console.error('[hp-cockpit] hpSetAttendance failed', e);
    return { ok: false, error: 'No se pudo guardar la asistencia.' };
  }
}

// Agrega a la lista los atletas HP que se asignaron DESPUÉS de crear la sesión.
export async function hpSyncSessionRoster(sessionId: string): Promise<{ ok: boolean; error?: string; added?: number }> {
  try {
    if (!(await assertAdmin())) return DENY;
    const admin = createAdminClient();
    const [{ data: asg, error: aErr }, { data: existing, error: eErr }] = await Promise.all([
      admin.from('program_assignments').select('student_id').eq('status', 'active'),
      admin.from('hp_session_attendance').select('student_id').eq('session_id', sessionId),
    ]);
    if (aErr) throw aErr;
    if (eErr) throw eErr;
    const have = new Set((existing ?? []).map((x: any) => x.student_id));
    const missing = Array.from(new Set((asg ?? []).map((a: any) => a.student_id))).filter((sid) => !have.has(sid));
    if (missing.length > 0) {
      const { error } = await admin.from('hp_session_attendance').insert(
        missing.map((sid) => ({ session_id: sessionId, student_id: sid, present: true }))
      );
      if (error) throw error;
      await syncSessionHours(admin, sessionId);
    }
    return { ok: true, added: missing.length };
  } catch (e) {
    console.error('[hp-cockpit] hpSyncSessionRoster failed', e);
    return { ok: false, error: 'No se pudo actualizar la lista.' };
  }
}

// EDITAR una sesión ya creada. No existía: si la duración salía mal o el
// lugar cambiaba, la única salida era borrar y rehacer — y el CASCADE se
// llevaba la asistencia ya pasada (hallazgo de la revisión).
export async function hpUpdateSession(
  sessionId: string,
  patch: { title?: string; date?: string; time?: string | null; durationMinutes?: number | null; location?: string | null; coachId?: string | null; focus?: string | null; kind?: string | null },
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    const row: Record<string, unknown> = {};
    if (patch.title !== undefined) {
      if (!patch.title.trim()) return { ok: false, error: 'La sesión necesita un nombre.' };
      row.title = patch.title.trim();
    }
    if (patch.date !== undefined) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(patch.date)) return { ok: false, error: 'La fecha no es válida.' };
      row.session_date = patch.date;
    }
    if (patch.time !== undefined) {
      if (patch.time && !/^\d{2}:\d{2}$/.test(patch.time)) return { ok: false, error: 'La hora no es válida.' };
      row.session_time = patch.time || null;
    }
    if (patch.durationMinutes !== undefined) {
      const d = patch.durationMinutes;
      if (d != null && (!Number.isFinite(d) || d <= 0 || d > 600)) return { ok: false, error: 'La duración va de 1 a 600 minutos.' };
      row.duration_minutes = d;
    }
    if (patch.location !== undefined) row.location = patch.location?.trim().slice(0, 200) || null;
    if (patch.coachId !== undefined) row.coach_id = patch.coachId || null;
    if (patch.focus !== undefined) row.focus = patch.focus?.trim().slice(0, 500) || null;
    if (patch.kind !== undefined) {
      if (patch.kind && !['agua', 'tierra', 'gym', 'skate', 'video', 'mixto'].includes(patch.kind)) {
        return { ok: false, error: 'Tipo de sesión inválido.' };
      }
      row.kind = patch.kind || null;
    }
    if (Object.keys(row).length === 0) return { ok: false, error: 'Nada que guardar.' };

    const admin = createAdminClient();
    const { error } = await admin.from('hp_team_sessions').update(row).eq('id', sessionId);
    if (error) throw error;
    // Duración/fecha/tipo cambian las horas acreditadas.
    await syncSessionHours(admin, sessionId);
    return { ok: true };
  } catch (e) {
    console.error('[hp-cockpit] hpUpdateSession failed', e);
    return { ok: false, error: 'No se pudo guardar la sesión.' };
  }
}

export async function hpDeleteSession(sessionId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    const admin = createAdminClient();
    // Las horas que generó esta sesión se van con ella (el CASCADE solo se
    // lleva la asistencia, no las filas de self_training_sessions).
    await admin.from('self_training_sessions').delete().like('notes', `hpsession:${sessionId}:%`);
    const { error } = await admin.from('hp_team_sessions').delete().eq('id', sessionId);
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[hp-cockpit] hpDeleteSession failed', e);
    return { ok: false, error: 'No se pudo eliminar la sesión.' };
  }
}

// ─── EVAL: evaluaciones por pilar de todo el equipo ───

export interface HPEvalRow {
  id: string;
  student_name: string;
  coach_name: string;
  pillar: string;
  score: number | null;
  notes: string | null;
  eval_date: string;
}

export async function hpListEvaluations(): Promise<{ ok: boolean; error?: string; evaluations: HPEvalRow[] }> {
  try {
    if (!(await assertAdmin())) return { ...DENY, evaluations: [] };
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('program_evaluations')
      .select('id, pillar, score, notes, eval_date, students(first_name, last_name), coaches(display_name)')
      .order('eval_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(30);
    if (error) throw error;
    return {
      ok: true,
      evaluations: (data ?? []).map((e: any) => ({
        id: e.id,
        student_name: `${e.students?.first_name ?? ''} ${e.students?.last_name ?? ''}`.trim() || '—',
        coach_name: e.coaches?.display_name ?? '—',
        pillar: e.pillar,
        score: e.score,
        notes: e.notes,
        eval_date: e.eval_date,
      })),
    };
  } catch (e) {
    console.error('[hp-cockpit] hpListEvaluations failed', e);
    return { ok: false, error: 'No se pudieron cargar las evaluaciones.', evaluations: [] };
  }
}

export async function hpCreateEvaluation(input: {
  studentId: string;
  pillar: 'fisico' | 'tecnico' | 'tactico' | 'mental';
  score: number;
  notes?: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    if (!['fisico', 'tecnico', 'tactico', 'mental'].includes(input.pillar)) return { ok: false, error: 'Pilar inválido.' };
    if (!(input.score >= 1 && input.score <= 10)) return { ok: false, error: 'El puntaje va de 1 a 10.' };
    const admin = createAdminClient();
    const me = await getCurrentCoach();
    if (!me) return { ok: false, error: 'No se encontró tu perfil de coach.' };
    const { error } = await admin.from('program_evaluations').insert({
      student_id: input.studentId,
      coach_id: me.id,
      pillar: input.pillar,
      score: input.score,
      notes: input.notes?.trim() || null,
      eval_date: elSalvadorToday(),
    });
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[hp-cockpit] hpCreateEvaluation failed', e);
    return { ok: false, error: 'No se pudo guardar la evaluación.' };
  }
}

// ─── REPORTE del atleta (el "Reporte PDF" de la app HP) ───
//
// Todo el seguimiento del atleta en una página imprimible: score por pilar
// (promedio de evaluaciones), programa y adherencia, hábitos de la semana,
// ranking, competencias y temporada. La página /hp/reporte/[id] lo dibuja
// listo para Imprimir → Guardar como PDF.

export interface HPAthleteReport {
  generated_at: string;
  student: { id: string; name: string; belt: string | null };
  program: { title: string; position: string; days_done: number; days_total: number; adherence_pct: number; start_date: string | null } | null;
  pillars: { pillar: string; avg: number; count: number }[];
  global_score: number | null;
  habits: { checkins_last7: number; avg_sleep: number | null; avg_water: number | null; avg_energy: number | null; nutrition_days: number };
  ranking: { position: number; points: number; total: number } | null;
  competitions: { total: number; next: string | null; last: string | null };
  season: { title: string; phase_now: string | null; days_to_peak: number | null } | null;
  attendance_30d: number;
  last_comment: string | null;
}

export async function hpAthleteReport(
  studentId: string
): Promise<{ ok: boolean; error?: string; report: HPAthleteReport | null }> {
  try {
    if (!(await assertAdmin())) return { ...DENY, report: null };
    const admin = createAdminClient();
    const today = elSalvadorToday();

    const { data: student, error: sErr } = await admin
      .from('students').select('id, first_name, last_name, belt_level').eq('id', studentId).maybeSingle();
    if (sErr) throw sErr;
    if (!student) return { ok: false, error: 'Atleta no encontrado.', report: null };

    // Programa activo + posición + adherencia
    const { data: asg, error: aErr } = await admin
      .from('program_assignments')
      .select('id, start_date, program_id, programs!inner(title, active)')
      .eq('student_id', studentId).eq('status', 'active')
      .order('created_at', { ascending: false }).limit(1).maybeSingle();
    if (aErr) throw aErr;
    let program: HPAthleteReport['program'] = null;
    if (asg) {
      const [days, marks] = await Promise.all([
        admin.from('program_days').select('id, week_number, day_number').eq('program_id', asg.program_id).order('week_number').order('day_number'),
        admin.from('program_day_marks').select('day_id').eq('assignment_id', asg.id),
      ]);
      if (days.error) throw days.error;
      if (marks.error) throw marks.error;
      const done = new Set((marks.data ?? []).map((m: any) => m.day_id));
      const current = (days.data ?? []).find((d: any) => !done.has(d.id)) ?? null;
      const total = (days.data ?? []).length;
      program = {
        title: (asg as any).programs?.title ?? '—',
        position: current ? `M${current.week_number}·D${current.day_number}` : 'Completado ✓',
        days_done: done.size,
        days_total: total,
        adherence_pct: total > 0 ? Math.round((done.size / total) * 100) : 0,
        start_date: asg.start_date,
      };
    }

    // Score por pilar (promedio de TODAS las evaluaciones, escala 1-10)
    const { data: evals, error: eErr } = await admin
      .from('program_evaluations').select('pillar, score').eq('student_id', studentId);
    if (eErr) throw eErr;
    const byPillar = new Map<string, number[]>();
    for (const e of evals ?? []) {
      if (e.score == null) continue;
      const arr = byPillar.get(e.pillar) ?? [];
      arr.push(Number(e.score));
      byPillar.set(e.pillar, arr);
    }
    const pillars = ['fisico', 'tecnico', 'tactico', 'mental']
      .filter((p) => byPillar.has(p))
      .map((p) => {
        const arr = byPillar.get(p)!;
        return { pillar: p, avg: Math.round((arr.reduce((s, x) => s + x, 0) / arr.length) * 10) / 10, count: arr.length };
      });
    const global_score = pillars.length
      ? Math.round((pillars.reduce((s, p) => s + p.avg, 0) / pillars.length) * 10) / 10
      : null;

    // Hábitos de los últimos 7 días (check-ins de cualquier asignación)
    const { data: allAsg, error: allErr } = await admin
      .from('program_assignments').select('id').eq('student_id', studentId);
    if (allErr) throw allErr;
    const asgIds = (allAsg ?? []).map((a: any) => a.id);
    let habits: HPAthleteReport['habits'] = { checkins_last7: 0, avg_sleep: null, avg_water: null, avg_energy: null, nutrition_days: 0 };
    let last_comment: string | null = null;
    if (asgIds.length > 0) {
      const { data: cks, error: ckErr } = await admin
        .from('program_checkins')
        .select('checkin_date, sleep_hours, water_glasses, energy, nutrition, nutrition_clean, comment')
        .in('assignment_id', asgIds)
        .gte('checkin_date', elSalvadorDatePlus(-6))
        .order('checkin_date', { ascending: false });
      if (ckErr) throw ckErr;
      const rows = cks ?? [];
      const avg = (vals: number[]) => (vals.length ? Math.round((vals.reduce((s, x) => s + x, 0) / vals.length) * 10) / 10 : null);
      habits = {
        checkins_last7: rows.length,
        avg_sleep: avg(rows.map((r: any) => Number(r.sleep_hours)).filter((x: number) => Number.isFinite(x) && x > 0)),
        avg_water: avg(rows.map((r: any) => r.water_glasses).filter((x: any) => x != null)),
        avg_energy: avg(rows.map((r: any) => r.energy).filter((x: any) => x != null)),
        nutrition_days: rows.filter((r: any) => r.nutrition_clean === 'si' || r.nutrition_clean === 'parcial' || (r.nutrition ?? '').trim()).length,
      };
      last_comment = rows.find((r: any) => (r.comment ?? '').trim())?.comment ?? null;
    }

    // Ranking, competencias, temporada, asistencia
    const { monday, sunday } = svWeekBounds(today);
    const [rankingRows, comps, nextComp, lastComp, season, att] = await Promise.all([
      computeWeekRanking(admin, monday, sunday),
      admin.from('athlete_competitions').select('id', { count: 'exact', head: true }).eq('student_id', studentId),
      admin.from('athlete_competitions').select('name, comp_date').eq('student_id', studentId)
        .neq('status', 'finished').or(`status.eq.live,comp_date.gte.${today}`).order('comp_date').limit(1).maybeSingle(),
      admin.from('athlete_competitions').select('name, final_place').eq('student_id', studentId)
        .eq('status', 'finished').order('comp_date', { ascending: false }).limit(1).maybeSingle(),
      admin.from('season_plans').select('id, title, season_phases(name, start_date, end_date), season_events(name, event_date, is_peak)')
        .eq('student_id', studentId).eq('active', true).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      admin.from('hp_session_attendance')
        .select('id, hp_team_sessions!inner(session_date)', { count: 'exact', head: true })
        .eq('student_id', studentId).eq('present', true)
        .gte('hp_team_sessions.session_date', elSalvadorDatePlus(-30)),
    ]);
    if (comps.error) throw comps.error;
    if (nextComp.error) throw nextComp.error;
    if (lastComp.error) throw lastComp.error;
    if (season.error) throw season.error;
    if (att.error) throw att.error;

    const mine = rankingRows.find((r) => r.student_id === studentId) ?? null;
    let seasonOut: HPAthleteReport['season'] = null;
    if (season.data) {
      const phases: any[] = (season.data as any).season_phases ?? [];
      const now = phases.find((f) => f.start_date <= today && f.end_date >= today) ?? null;
      const peak = ((season.data as any).season_events ?? []).find((e: any) => e.is_peak) ?? null;
      seasonOut = {
        title: season.data.title,
        phase_now: now?.name ?? null,
        days_to_peak: peak && peak.event_date >= today
          ? Math.round((Date.parse(peak.event_date) - Date.parse(today)) / 86400000)
          : null,
      };
    }

    return {
      ok: true,
      report: {
        generated_at: today,
        student: {
          id: student.id,
          name: `${student.first_name ?? ''} ${student.last_name ?? ''}`.trim(),
          belt: (student as any).belt_level ?? null,
        },
        program,
        pillars,
        global_score,
        habits,
        ranking: mine ? { position: mine.position, points: mine.points, total: rankingRows.length } : null,
        competitions: {
          total: comps.count ?? 0,
          next: nextComp.data ? `${nextComp.data.name} · ${nextComp.data.comp_date}` : null,
          last: lastComp.data ? `${lastComp.data.name}${lastComp.data.final_place ? ` — ${lastComp.data.final_place}` : ''}` : null,
        },
        season: seasonOut,
        attendance_30d: att.count ?? 0,
        last_comment,
      },
    };
  } catch (e) {
    console.error('[hp-cockpit] hpAthleteReport failed', e);
    return { ok: false, error: 'No se pudo generar el reporte.', report: null };
  }
}

// ─── EVALUACIÓN PROFUNDA post-competencia (la de ~90 campos de la app HP) ───
//
// scores = ítems 1-5 por sección (tec_/tac_/men_/fis_); diagnostico = los 9
// campos de texto del cierre. El catálogo de ítems vive en el cliente
// (HP_DEEP_ITEMS en HPCockpit); acá se sanitiza por prefijo y rango — un
// payload crafteado no puede meter claves basura ni valores fuera de 1-5.

export interface HPDeepEvalRow {
  id: string;
  student_name: string;
  coach_name: string | null;
  eval_kind: string; // competencia | general
  eval_date: string;
  event_name: string | null;
  round_reached: string | null;
  final_ranking: string | null;
  scores: Record<string, number>;
  diagnostico: Record<string, string>;
  section_avgs: { tec: number | null; tac: number | null; men: number | null; fis: number | null; com: number | null };
}

function sectionAvg(scores: Record<string, number>, prefix: string): number | null {
  const vals = Object.entries(scores).filter(([k, v]) => k.startsWith(prefix) && Number.isFinite(v)).map(([, v]) => Number(v));
  if (!vals.length) return null;
  return Math.round((vals.reduce((s, x) => s + x, 0) / vals.length) * 10) / 10;
}

export async function hpListDeepEvaluations(): Promise<{ ok: boolean; error?: string; evaluations: HPDeepEvalRow[] }> {
  try {
    if (!(await assertAdmin())) return { ...DENY, evaluations: [] };
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('hp_deep_evaluations')
      .select('id, eval_kind, eval_date, event_name, round_reached, final_ranking, scores, diagnostico, students(first_name, last_name), coaches(display_name)')
      .order('eval_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(30);
    if (error) throw error;
    return {
      ok: true,
      evaluations: (data ?? []).map((e: any) => {
        const scores = (e.scores && typeof e.scores === 'object' && !Array.isArray(e.scores)) ? e.scores : {};
        const diag = (e.diagnostico && typeof e.diagnostico === 'object' && !Array.isArray(e.diagnostico)) ? e.diagnostico : {};
        return {
          id: e.id,
          student_name: `${e.students?.first_name ?? ''} ${e.students?.last_name ?? ''}`.trim() || '—',
          coach_name: e.coaches?.display_name ?? null,
          eval_kind: e.eval_kind ?? 'competencia',
          eval_date: e.eval_date,
          event_name: e.event_name,
          round_reached: e.round_reached,
          final_ranking: e.final_ranking,
          scores,
          diagnostico: diag,
          section_avgs: {
            tec: sectionAvg(scores, 'tec_'),
            tac: sectionAvg(scores, 'tac_'),
            men: sectionAvg(scores, 'men_'),
            fis: sectionAvg(scores, 'fis_'),
            com: sectionAvg(scores, 'com_'),
          },
        };
      }),
    };
  } catch (e) {
    console.error('[hp-cockpit] hpListDeepEvaluations failed', e);
    return { ok: false, error: 'No se pudieron cargar las evaluaciones profundas.', evaluations: [] };
  }
}

const DEEP_DIAG_KEYS = ['what_worked', 'what_failed', 'critical_error', 'pattern', 'main_strength', 'key_limitation', 'top_priority', 'concrete_action', 'notes'];

export async function hpCreateDeepEvaluation(input: {
  studentId: string;
  eval_kind?: 'competencia' | 'general';
  event_name: string;
  round_reached?: string | null;
  final_ranking?: string | null;
  scores: Record<string, number>;
  diagnostico: Record<string, string>;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    if (!input.event_name?.trim()) return { ok: false, error: 'La evaluación necesita un nombre (evento o motivo).' };
    // Sanitizar por dentro: solo claves de sección conocidas, enteros 1-5.
    const scores: Record<string, number> = {};
    for (const [k, v] of Object.entries(input.scores ?? {})) {
      if (!/^(tec|tac|men|fis|com)_[a-z_]{1,40}$/.test(k)) continue;
      const n = Math.round(Number(v));
      if (n >= 1 && n <= 5) scores[k] = n;
    }
    const diagnostico: Record<string, string> = {};
    for (const k of DEEP_DIAG_KEYS) {
      const v = (input.diagnostico ?? {})[k];
      if (typeof v === 'string' && v.trim()) diagnostico[k] = v.trim().slice(0, 800);
    }
    if (Object.keys(scores).length === 0 && Object.keys(diagnostico).length === 0) {
      return { ok: false, error: 'La evaluación está vacía — puntuá al menos una sección o escribí el diagnóstico.' };
    }
    const admin = createAdminClient();
    const me = await getCurrentCoach();
    const { error } = await admin.from('hp_deep_evaluations').insert({
      student_id: input.studentId,
      coach_id: me?.id ?? null,
      eval_kind: input.eval_kind === 'general' ? 'general' : 'competencia',
      eval_date: elSalvadorToday(),
      event_name: input.event_name.trim().slice(0, 160),
      round_reached: input.round_reached?.trim().slice(0, 80) || null,
      final_ranking: input.final_ranking?.trim().slice(0, 80) || null,
      scores,
      diagnostico,
    });
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[hp-cockpit] hpCreateDeepEvaluation failed', e);
    return { ok: false, error: 'No se pudo guardar la evaluación profunda.' };
  }
}

// ─── PERFIL HP DEL ATLETA (la vista de Equipo de la app HP, completa) ───
//
// Todo lo del atleta en una pantalla: índice por pilares (última evaluación
// general), capacidad de score, datos físicos, ficha técnica % completa,
// lesión, hábitos 14 días + últimas 7 noches, horas de agua de la bitácora,
// citas, competencias y palmarés. Fuentes: students + hp_athlete_profiles +
// program_checkins + hp_deep_evaluations + athlete_competitions + citas.

export interface HPAthleteFull {
  student: { id: string; name: string; nickname: string | null; belt: string | null; age: number | null; stance: string | null };
  profile: {
    score_capacity: number | null;
    injury: string | null; injury_since: string | null;
    height_cm: number | null; weight_kg: number | null; bmi: number | null;
    years_surfing: number | null; years_competing: number | null; events_per_year: number | null;
    discipline: string | null; favorite_maneuver: string | null;
    dominant_hand: string | null; dominant_foot: string | null;
    sponsors: string | null; club_academy: string | null; palmares: string | null;
    why_train: string | null;
    goals: { short: string | null; mid: string | null; long: string | null };
    ficha_pct: number; ficha_missing: string[];
  } | null;
  last_eval: { date: string; kind: string; pillars: { key: string; avg: number }[]; global: number | null } | null;
  habits14: { checkins: number; avg_sleep: number | null; avg_water: number | null; avg_energy: number | null; nutrition_days: number; last_nights: { date: string; sleep: number | null }[] };
  water: { total_minutes: number; week_minutes: number };
  counts: { sessions_attended: number; evals: number; checkins: number };
  appointments: { upcoming: { kind: string; mode: string | null; title: string | null; date: string; time: string | null; coach: string }[]; past_count: number };
  competitions: { id: string; name: string; comp_date: string; status: string; final_place: string | null }[];
  ranking: { position: number; points: number; total: number } | null;
}

export async function hpAthleteFull(
  studentId: string
): Promise<{ ok: boolean; error?: string; data: HPAthleteFull | null }> {
  try {
    if (!(await assertAdmin())) return { ...DENY, data: null };
    const admin = createAdminClient();
    const today = elSalvadorToday();

    const [st, prof, allAsg] = await Promise.all([
      admin.from('students').select('id, first_name, last_name, nickname, belt_level, date_of_birth, goofy_or_regular').eq('id', studentId).maybeSingle(),
      admin.from('hp_athlete_profiles').select('*').eq('student_id', studentId).maybeSingle(),
      admin.from('program_assignments').select('id').eq('student_id', studentId),
    ]);
    if (st.error) throw st.error;
    if (!st.data) return { ok: false, error: 'Atleta no encontrado.', data: null };
    if (prof.error) throw prof.error;
    if (allAsg.error) throw allAsg.error;
    const asgIds = (allAsg.data ?? []).map((a: any) => a.id);

    const age = (() => {
      const dob = (st.data as any).date_of_birth;
      if (!dob) return null;
      const d = new Date(dob + 'T00:00:00');
      if (Number.isNaN(d.getTime())) return null;
      const n = new Date();
      let a = n.getFullYear() - d.getFullYear();
      const m = n.getMonth() - d.getMonth();
      if (m < 0 || (m === 0 && n.getDate() < d.getDate())) a--;
      return a;
    })();

    // Hábitos 14 días + últimas 7 noches
    let habits14: HPAthleteFull['habits14'] = { checkins: 0, avg_sleep: null, avg_water: null, avg_energy: null, nutrition_days: 0, last_nights: [] };
    let checkinsTotal = 0;
    if (asgIds.length > 0) {
      const [{ data: cks, error: ckErr }, { count: ckCount, error: ccErr }] = await Promise.all([
        admin.from('program_checkins')
          .select('checkin_date, sleep_hours, water_glasses, energy, nutrition, nutrition_clean')
          .in('assignment_id', asgIds)
          .gte('checkin_date', elSalvadorDatePlus(-13))
          .order('checkin_date', { ascending: false }),
        admin.from('program_checkins').select('id', { count: 'exact', head: true }).in('assignment_id', asgIds),
      ]);
      if (ckErr) throw ckErr;
      if (ccErr) throw ccErr;
      checkinsTotal = ckCount ?? 0;
      const rows = cks ?? [];
      const avg = (vals: number[]) => (vals.length ? Math.round((vals.reduce((s, x) => s + x, 0) / vals.length) * 10) / 10 : null);
      habits14 = {
        checkins: rows.length,
        avg_sleep: avg(rows.map((r: any) => Number(r.sleep_hours)).filter((x: number) => Number.isFinite(x) && x > 0)),
        avg_water: avg(rows.map((r: any) => r.water_glasses).filter((x: any) => x != null)),
        avg_energy: avg(rows.map((r: any) => r.energy).filter((x: any) => x != null)),
        nutrition_days: rows.filter((r: any) => r.nutrition_clean === 'si' || r.nutrition_clean === 'parcial' || (r.nutrition ?? '').trim()).length,
        last_nights: rows.slice(0, 7).map((r: any) => ({ date: r.checkin_date.slice(5), sleep: r.sleep_hours != null ? Number(r.sleep_hours) : null })),
      };
    }

    // Última evaluación profunda GENERAL (para el índice por pilares tipo HP)
    const { data: lastEv, error: leErr } = await admin
      .from('hp_deep_evaluations')
      .select('eval_date, eval_kind, scores')
      .eq('student_id', studentId).eq('eval_kind', 'general')
      .order('eval_date', { ascending: false }).order('created_at', { ascending: false })
      .limit(1).maybeSingle();
    if (leErr) throw leErr;
    let last_eval: HPAthleteFull['last_eval'] = null;
    if (lastEv && lastEv.scores && typeof lastEv.scores === 'object') {
      const sc = lastEv.scores as Record<string, number>;
      const pillars = (['fis', 'tec', 'tac', 'men', 'com'] as const)
        .map((k) => ({ key: k, avg: sectionAvg(sc, k + '_') }))
        .filter((p) => p.avg != null) as { key: string; avg: number }[];
      last_eval = pillars.length
        ? {
            date: lastEv.eval_date, kind: lastEv.eval_kind,
            pillars,
            global: Math.round((pillars.reduce((s, p) => s + p.avg, 0) / pillars.length) * 10) / 10,
          }
        : null;
    }

    // Horas de agua (bitácora BRAIN: self_training_sessions completadas)
    const { data: sts, error: stsErr } = await admin
      .from('self_training_sessions')
      .select('duration_minutes, total_water_minutes, kind, completed, created_at')
      .eq('student_id', studentId).eq('completed', true);
    if (stsErr) throw stsErr;
    const { monday } = svWeekBounds(today);
    let total_minutes = 0, week_minutes = 0;
    for (const s of sts ?? []) {
      const dur = (s as any).duration_minutes || 0;
      const water = (s as any).total_water_minutes || 0;
      const mins = (s as any).kind === 'free_surf' ? (water || dur) : Math.max(dur, water);
      total_minutes += mins;
      const sv = toElSalvadorDate((s as any).created_at);
      if (sv && sv >= monday) week_minutes += mins;
    }

    // Citas, asistencia, evaluaciones, competencias, ranking
    const [appts, pastAppts, att, evalsCount, comps, rankingRows] = await Promise.all([
      admin.from('program_appointments')
        .select('kind, mode, title, appointment_date, appointment_time, coaches(display_name)')
        .eq('student_id', studentId).eq('status', 'scheduled').gte('appointment_date', today)
        .order('appointment_date').limit(5),
      admin.from('program_appointments').select('id', { count: 'exact', head: true })
        .eq('student_id', studentId).lt('appointment_date', today),
      admin.from('hp_session_attendance').select('id', { count: 'exact', head: true })
        .eq('student_id', studentId).eq('present', true),
      admin.from('hp_deep_evaluations').select('id', { count: 'exact', head: true }).eq('student_id', studentId),
      admin.from('athlete_competitions')
        .select('id, name, comp_date, status, final_place')
        .eq('student_id', studentId).order('comp_date', { ascending: false }).limit(6),
      computeWeekRanking(admin, svWeekBounds(today).monday, svWeekBounds(today).sunday),
    ]);
    if (appts.error) throw appts.error;
    if (pastAppts.error) throw pastAppts.error;
    if (att.error) throw att.error;
    if (evalsCount.error) throw evalsCount.error;
    if (comps.error) throw comps.error;

    const p: any = prof.data ?? null;
    let profileOut: HPAthleteFull['profile'] = null;
    if (p) {
      const h = p.height_cm != null ? Number(p.height_cm) : null;
      const w = p.weight_kg != null ? Number(p.weight_kg) : null;
      const bmi = h && w && h > 0 ? Math.round((w / Math.pow(h / 100, 2)) * 10) / 10 : null;
      // % de ficha técnica: los campos que la app HP consideraba la ficha.
      const fichaFields: { key: string; label: string; val: unknown }[] = [
        { key: 'height', label: 'altura', val: p.height_cm },
        { key: 'weight', label: 'peso', val: p.weight_kg },
        { key: 'blood', label: 'tipo de sangre', val: p.blood_type },
        { key: 'dui', label: 'DUI', val: p.dui },
        { key: 'passport', label: 'pasaporte', val: p.passport_number },
        { key: 'passport_exp', label: 'vencimiento pasaporte', val: p.passport_expiry_date },
        { key: 'emergency', label: 'contacto emergencia (parentesco)', val: p.emergency_relationship },
        { key: 'insurance', label: 'seguro', val: p.insurance_provider },
        { key: 'doctor', label: 'médico', val: p.doctor_name },
        { key: 'goals', label: 'metas', val: p.goal_short_term || p.goal_mid_term || p.goal_long_term },
      ];
      const filled = fichaFields.filter((f) => f.val != null && String(f.val).trim() !== '');
      profileOut = {
        score_capacity: p.score_capacity,
        injury: p.injury, injury_since: p.injury_since,
        height_cm: h, weight_kg: w, bmi,
        years_surfing: p.years_surfing, years_competing: p.years_competing, events_per_year: p.events_per_year,
        discipline: p.discipline, favorite_maneuver: p.favorite_maneuver,
        dominant_hand: p.dominant_hand, dominant_foot: p.dominant_foot,
        sponsors: p.sponsors, club_academy: p.club_academy, palmares: p.palmares_historico,
        why_train: p.why_train,
        goals: { short: p.goal_short_term, mid: p.goal_mid_term, long: p.goal_long_term },
        ficha_pct: Math.round((filled.length / fichaFields.length) * 100),
        ficha_missing: fichaFields.filter((f) => !(f.val != null && String(f.val).trim() !== '')).map((f) => f.label),
      };
    }

    const mine = rankingRows.find((r) => r.student_id === studentId) ?? null;
    return {
      ok: true,
      data: {
        student: {
          id: st.data.id,
          name: `${st.data.first_name ?? ''} ${st.data.last_name ?? ''}`.trim(),
          nickname: (st.data as any).nickname ?? null,
          belt: (st.data as any).belt_level ?? null,
          age,
          stance: (st.data as any).goofy_or_regular ?? null,
        },
        profile: profileOut,
        last_eval,
        habits14,
        water: { total_minutes, week_minutes },
        counts: { sessions_attended: att.count ?? 0, evals: evalsCount.count ?? 0, checkins: checkinsTotal },
        appointments: {
          upcoming: (appts.data ?? []).map((a: any) => ({
            kind: a.kind, mode: a.mode ?? null, title: a.title,
            date: a.appointment_date, time: a.appointment_time,
            coach: a.coaches?.display_name ?? '—',
          })),
          past_count: pastAppts.count ?? 0,
        },
        competitions: (comps.data ?? []) as any,
        ranking: mine ? { position: mine.position, points: mine.points, total: rankingRows.length } : null,
      },
    };
  } catch (e) {
    console.error('[hp-cockpit] hpAthleteFull failed', e);
    return { ok: false, error: 'No se pudo cargar el perfil del atleta.', data: null };
  }
}
