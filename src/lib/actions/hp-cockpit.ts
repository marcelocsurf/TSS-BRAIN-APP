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
  missions: { id: string; title: string; type: string | null; belt: string | null; time_estimate: string | null; success_criteria: string | null; description_md: string | null }[];
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
        .select('id, title, type, belt, time_estimate, success_criteria, description_md')
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
  attendance: { student_id: string; name: string; present: boolean; note: string | null }[];
}

export async function hpListSessions(): Promise<{ ok: boolean; error?: string; sessions: HPSessionRow[] }> {
  try {
    if (!(await assertAdmin())) return { ...DENY, sessions: [] };
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('hp_team_sessions')
      .select('id, session_date, title, notes, hp_session_attendance(student_id, present, note, students(first_name, last_name))')
      .order('session_date', { ascending: false })
      .limit(12);
    if (error) throw error;
    return {
      ok: true,
      sessions: (data ?? []).map((s: any) => ({
        id: s.id,
        session_date: s.session_date,
        title: s.title,
        notes: s.notes,
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

export async function hpCreateSession(input: {
  date: string; title: string;
}): Promise<{ ok: boolean; error?: string; id?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return { ok: false, error: 'La fecha no es válida.' };
    if (!input.title.trim()) return { ok: false, error: 'La sesión necesita un nombre.' };
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('hp_team_sessions')
      .insert({ session_date: input.date, title: input.title.trim() })
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
    }
    return { ok: true, added: missing.length };
  } catch (e) {
    console.error('[hp-cockpit] hpSyncSessionRoster failed', e);
    return { ok: false, error: 'No se pudo actualizar la lista.' };
  }
}

export async function hpDeleteSession(sessionId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!(await assertAdmin())) return DENY;
    const admin = createAdminClient();
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
