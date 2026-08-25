'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { buildSeasonTimeline, SPECIALIST_LABEL, type MySeasonTimeline, type SpecialistRoleKey } from '@/lib/programs/season-timeline';
import { elSalvadorToday } from '@/lib/utils/tz';

// ═══ PORTAL DEL ESPECIALISTA (F1-F4, dale Marcelo 2026-08-23) ═══
// Psicólogo · Prep. físico · Nutricionista · Head coach · Asistente.
// GATE: el token pertenece a un coach vinculado a temporadas ACTIVAS
// (head_coach_id o season_specialists) o con specialist_role seteado.
// El vínculo de temporada ES la autorización por atleta — admin client
// bypasea RLS, así que nunca se responde data de un atleta sin vínculo.

async function resolveSpecialist(token: string) {
  if (!token) return null;
  const admin = createAdminClient();
  const { data: coach } = await admin
    .from('coaches')
    .select('id, display_name, first_name, role, specialist_role, active_status, photo_url')
    .eq('portal_token', token)
    .maybeSingle();
  if (!coach || !(coach as any).active_status) return null;

  const [{ data: asHead }, { data: asSpec }] = await Promise.all([
    admin.from('season_plans').select('id, student_id, title, objective, start_date, end_date').eq('head_coach_id', (coach as any).id).eq('active', true),
    admin.from('season_specialists').select('season_id, season_plans:season_id!inner(id, student_id, title, objective, start_date, end_date, active)').eq('coach_id', (coach as any).id),
  ]);
  const specSeasons = (asSpec ?? [])
    .map((r: any) => (Array.isArray(r.season_plans) ? r.season_plans[0] : r.season_plans))
    .filter((sp: any) => sp && sp.active);
  const headIds = new Set((asHead ?? []).map((s: any) => s.id));
  const seasons = [
    ...(asHead ?? []).map((s: any) => ({ ...s, my_role: 'head' as const })),
    ...specSeasons.filter((s: any) => !headIds.has(s.id)).map((s: any) => ({ ...s, my_role: 'specialist' as const })),
  ];

  if (seasons.length === 0 && !(coach as any).specialist_role) return null;

  const roleKey: SpecialistRoleKey =
    ((coach as any).specialist_role as SpecialistRoleKey | null) ??
    (seasons.some((s: any) => s.my_role === 'head') ? 'head'
      : (coach as any).role === 'assistant' ? 'asistente' : 'coach');

  return { admin, coach: coach as any, seasons, roleKey };
}

/** El coach está vinculado a ESTE atleta (por temporada activa)? */
function seasonForStudent(ctx: NonNullable<Awaited<ReturnType<typeof resolveSpecialist>>>, studentId: string) {
  return ctx.seasons.find((s: any) => s.student_id === studentId) ?? null;
}

// ─── F1: home — mis atletas ───
export interface SpecialistHome {
  me: { name: string; roleKey: SpecialistRoleKey; roleLabel: string };
  athletes: Array<{
    student_id: string;
    name: string;
    nickname: string | null;
    photo_url: string | null;
    belt: string | null;
    season_id: string;
    season_title: string;
    position: string | null;   // "M2 · D4" o "Completed"
    next_event: string | null; // próximo 🏆/cita
  }>;
}

export async function getSpecialistHome(token: string): Promise<{ ok: boolean; data: SpecialistHome | null; error?: string }> {
  try {
    const ctx = await resolveSpecialist(token);
    if (!ctx) return { ok: true, data: null };
    const { admin, coach, seasons, roleKey } = ctx;

    const studentIds = Array.from(new Set(seasons.map((s: any) => s.student_id)));
    const today = elSalvadorToday();
    const [{ data: students }, { data: comps }, { data: appts }, { data: asgs }] = await Promise.all([
      studentIds.length ? admin.from('students').select('id, first_name, last_name, nickname, photo_url, belt_level').in('id', studentIds) : Promise.resolve({ data: [] as any[] }),
      studentIds.length ? admin.from('athlete_competitions').select('student_id, name, comp_date').in('student_id', studentIds).gte('comp_date', today).order('comp_date') : Promise.resolve({ data: [] as any[] }),
      studentIds.length ? admin.from('program_appointments').select('student_id, kind, appointment_date').in('student_id', studentIds).gte('appointment_date', today).neq('status', 'cancelled').order('appointment_date') : Promise.resolve({ data: [] as any[] }),
      studentIds.length ? admin.from('program_assignments').select('student_id, id, program_id, start_date, status').in('student_id', studentIds).eq('status', 'active') : Promise.resolve({ data: [] as any[] }),
    ]);
    const stuById = new Map((students ?? []).map((s: any) => [s.id, s]));
    const nextCompBy = new Map<string, any>();
    for (const c of comps ?? []) if (!nextCompBy.has(c.student_id)) nextCompBy.set(c.student_id, c);
    const nextApptBy = new Map<string, any>();
    for (const a of appts ?? []) if (!nextApptBy.has(a.student_id)) nextApptBy.set(a.student_id, a);

    // Posición del programa: primer día sin marcar (batch simple por atleta).
    const posBy = new Map<string, string>();
    for (const asg of asgs ?? []) {
      const [{ data: days }, { data: marks }] = await Promise.all([
        admin.from('program_days').select('id, week_number, day_number').eq('program_id', asg.program_id),
        admin.from('program_day_marks').select('day_id').eq('assignment_id', asg.id),
      ]);
      const done = new Set((marks ?? []).map((m: any) => m.day_id));
      const cur = (days ?? []).slice().sort((a: any, b: any) => a.week_number - b.week_number || a.day_number - b.day_number).find((d: any) => !done.has(d.id));
      posBy.set(asg.student_id, cur ? `M${cur.week_number} · D${cur.day_number}` : 'Completed ✓');
    }

    const seenStudents = new Set<string>();
    const athletes = seasons.filter((s: any) => {
      if (seenStudents.has(s.student_id)) return false;
      seenStudents.add(s.student_id);
      return true;
    }).map((s: any) => {
      const st = stuById.get(s.student_id);
      const comp = nextCompBy.get(s.student_id);
      const appt = nextApptBy.get(s.student_id);
      const next = comp
        ? `🏆 ${comp.name} · ${String(comp.comp_date).slice(5)}`
        : appt ? `📅 ${String(appt.appointment_date).slice(5)}` : null;
      return {
        student_id: s.student_id,
        name: st ? [st.first_name, st.last_name].filter(Boolean).join(' ') : '—',
        nickname: st?.nickname ?? null,
        photo_url: st?.photo_url ?? null,
        belt: st?.belt_level ?? null,
        season_id: s.id,
        season_title: s.title,
        position: posBy.get(s.student_id) ?? null,
        next_event: next,
      };
    });

    return {
      ok: true,
      data: {
        me: { name: coach.display_name ?? coach.first_name ?? 'Coach', roleKey, roleLabel: SPECIALIST_LABEL[roleKey] },
        athletes,
      },
    };
  } catch (e) {
    console.error('[specialist] home failed', e);
    return { ok: false, data: null, error: 'No se pudo cargar el portal.' };
  }
}

// ─── F1: detalle de UN atleta ───
export interface SpecialistAthlete {
  student: { id: string; name: string; nickname: string | null; photo_url: string | null; belt: string | null };
  season: { id: string; title: string; objective: string | null; my_role: string };
  timeline: MySeasonTimeline | null;
  pillars: { fis: number | null; tec: number | null; tac: number | null; men: number | null; global: number | null; eval_date: string | null } | null;
  appointments: Array<{ id: string; kind: string; title: string | null; date: string; time: string | null; status: string }>;
  wall: Array<{ id: string; author: string; role: string | null; mine: boolean; body: string; created_at: string }>;
  diet: { micro: Array<{ week_number: number; body: string; created_at: string }>; day: Array<{ note_date: string; body: string }> };
  tasks: Array<{ id: string; kind: string; title: string; body: string | null; video_url: string | null; due_date: string | null; done: boolean; mine: boolean }>;
}

export async function getSpecialistAthlete(token: string, studentId: string): Promise<{ ok: boolean; data: SpecialistAthlete | null; error?: string }> {
  try {
    const ctx = await resolveSpecialist(token);
    if (!ctx) return { ok: false, data: null, error: 'Sin acceso.' };
    const season = seasonForStudent(ctx, studentId);
    if (!season) return { ok: false, data: null, error: 'Este atleta no está en tus temporadas.' };
    const { admin, coach } = ctx;

    const [{ data: st }, timeline, { data: evalRows }, { data: appts }, { data: wallRows }, { data: dietRows }, { data: taskRows }] = await Promise.all([
      admin.from('students').select('id, first_name, last_name, nickname, photo_url, belt_level').eq('id', studentId).maybeSingle(),
      buildSeasonTimeline(admin, studentId),
      admin.from('hp_deep_evaluations').select('scores, eval_date, created_at').eq('student_id', studentId).order('eval_date', { ascending: false }).order('created_at', { ascending: false }).limit(6),
      admin.from('program_appointments').select('id, kind, title, appointment_date, appointment_time, status').eq('student_id', studentId).neq('status', 'cancelled').order('appointment_date', { ascending: false }).limit(10),
      admin.from('athlete_team_posts').select('id, body, created_at, author_student_id, author_coach_id, coaches:author_coach_id(display_name, specialist_role, role), students:author_student_id(first_name)').eq('student_id', studentId).order('created_at', { ascending: false }).limit(30),
      admin.from('athlete_diet_notes').select('scope, week_number, note_date, body, created_at').eq('student_id', studentId).order('created_at', { ascending: false }).limit(40),
      admin.from('athlete_staff_tasks').select('id, kind, title, body, video_url, due_date, done, coach_id').eq('student_id', studentId).order('created_at', { ascending: false }).limit(20),
    ]);

    // Pilares (última evaluación CON scores — mismas reglas que el portal).
    const avgOf = (scores: Record<string, number>, prefix: string): number | null => {
      const vals = Object.entries(scores ?? {}).filter(([k, v]) => k.startsWith(prefix) && Number.isFinite(Number(v))).map(([, v]) => Number(v));
      return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null;
    };
    const evalRow = (evalRows ?? []).find((r: any) => ['fis_', 'tec_', 'tac_', 'men_'].some((p) => avgOf(r.scores, p) != null)) ?? null;
    let pillars: SpecialistAthlete['pillars'] = null;
    if (evalRow) {
      const p = { fis: avgOf((evalRow as any).scores, 'fis_'), tec: avgOf((evalRow as any).scores, 'tec_'), tac: avgOf((evalRow as any).scores, 'tac_'), men: avgOf((evalRow as any).scores, 'men_') };
      const withVal = Object.values(p).filter((v): v is number => v != null);
      pillars = { ...p, global: withVal.length ? Math.round((withVal.reduce((a, b) => a + b, 0) / withVal.length) * 10) / 10 : null, eval_date: String((evalRow as any).eval_date ?? (evalRow as any).created_at).slice(0, 10) };
    }

    // Dieta: última nota por micro + notas de día recientes.
    const microSeen = new Set<number>();
    const dietMicro: Array<{ week_number: number; body: string; created_at: string }> = [];
    const dietDay: Array<{ note_date: string; body: string }> = [];
    for (const d of dietRows ?? []) {
      if (d.scope === 'micro' && d.week_number != null && !microSeen.has(d.week_number)) {
        microSeen.add(d.week_number);
        dietMicro.push({ week_number: d.week_number, body: d.body, created_at: d.created_at });
      } else if (d.scope === 'day' && d.note_date) {
        if (dietDay.length < 7) dietDay.push({ note_date: d.note_date, body: d.body });
      }
    }
    dietMicro.sort((a, b) => a.week_number - b.week_number);

    return {
      ok: true,
      data: {
        student: st ? { id: (st as any).id, name: [(st as any).first_name, (st as any).last_name].filter(Boolean).join(' '), nickname: (st as any).nickname ?? null, photo_url: (st as any).photo_url ?? null, belt: (st as any).belt_level ?? null } : { id: studentId, name: '—', nickname: null, photo_url: null, belt: null },
        season: { id: (season as any).id, title: (season as any).title, objective: (season as any).objective ?? null, my_role: (season as any).my_role },
        timeline,
        pillars,
        appointments: (appts ?? []).map((a: any) => ({ id: a.id, kind: a.kind, title: a.title ?? null, date: a.appointment_date, time: a.appointment_time ?? null, status: a.status })),
        wall: (wallRows ?? []).map((w: any) => {
          const c = Array.isArray(w.coaches) ? w.coaches[0] : w.coaches;
          const s2 = Array.isArray(w.students) ? w.students[0] : w.students;
          return {
            id: w.id,
            author: w.author_student_id ? `${s2?.first_name ?? 'Athlete'} (athlete)` : (c?.display_name ?? 'Coach'),
            role: w.author_student_id ? null : (c?.specialist_role ?? c?.role ?? null),
            mine: w.author_coach_id === coach.id,
            body: w.body,
            created_at: w.created_at,
          };
        }),
        diet: { micro: dietMicro, day: dietDay },
        tasks: (taskRows ?? []).map((t: any) => ({ id: t.id, kind: t.kind, title: t.title, body: t.body ?? null, video_url: t.video_url ?? null, due_date: t.due_date ?? null, done: !!t.done, mine: t.coach_id === coach.id })),
      },
    };
  } catch (e) {
    console.error('[specialist] athlete failed', e);
    return { ok: false, data: null, error: 'No se pudo cargar el atleta.' };
  }
}

// ─── F2: muro del equipo (escribe el staff) ───
export async function specialistPostWall(token: string, studentId: string, body: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const text = (body ?? '').trim();
    if (!text) return { ok: false, error: 'Escribí algo primero.' };
    if (text.length > 1000) return { ok: false, error: 'Máximo 1000 caracteres.' };
    const ctx = await resolveSpecialist(token);
    if (!ctx) return { ok: false, error: 'Sin acceso.' };
    if (!seasonForStudent(ctx, studentId)) return { ok: false, error: 'Este atleta no está en tus temporadas.' };
    const { error } = await ctx.admin.from('athlete_team_posts').insert({ student_id: studentId, author_coach_id: ctx.coach.id, body: text });
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[specialist] wall post failed', e);
    return { ok: false, error: 'No se pudo publicar.' };
  }
}

// ─── F3: dieta (nutricionista o head coach) ───
export async function specialistSaveDiet(
  token: string,
  studentId: string,
  input: { scope: 'micro' | 'day'; week_number?: number | null; note_date?: string | null; body: string },
): Promise<{ ok: boolean; error?: string }> {
  try {
    const text = (input.body ?? '').trim();
    if (!text) return { ok: false, error: 'Escribí la dieta primero.' };
    if (text.length > 3000) return { ok: false, error: 'Máximo 3000 caracteres.' };
    const ctx = await resolveSpecialist(token);
    if (!ctx) return { ok: false, error: 'Sin acceso.' };
    const season = seasonForStudent(ctx, studentId);
    if (!season) return { ok: false, error: 'Este atleta no está en tus temporadas.' };
    // Permiso POR TEMPORADA: nutricionista, o head de ESTA temporada (no de
    // cualquier otra — hallazgo de la revisión).
    const canDiet = ctx.coach.specialist_role === 'nutricionista' || (season as any).my_role === 'head';
    if (!canDiet) return { ok: false, error: 'Solo la nutricionista (o el head coach) edita la dieta.' };
    if (input.scope === 'micro' && (!input.week_number || input.week_number < 1 || input.week_number > 52)) return { ok: false, error: 'Elegí el microciclo.' };
    if (input.scope === 'day' && !/^\d{4}-\d{2}-\d{2}$/.test(input.note_date ?? '')) return { ok: false, error: 'Elegí el día.' };
    const { error } = await ctx.admin.from('athlete_diet_notes').insert({
      student_id: studentId,
      coach_id: ctx.coach.id,
      scope: input.scope,
      week_number: input.scope === 'micro' ? input.week_number : null,
      note_date: input.scope === 'day' ? input.note_date : null,
      body: text,
    });
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[specialist] diet failed', e);
    return { ok: false, error: 'No se pudo guardar la dieta.' };
  }
}

// ─── F3: sesión online / tarea para el atleta ───
export async function specialistCreateTask(
  token: string,
  studentId: string,
  input: { kind: 'fisico' | 'mental' | 'tecnico' | 'nutricion' | 'otro'; title: string; body?: string | null; video_url?: string | null; due_date?: string | null },
): Promise<{ ok: boolean; error?: string }> {
  try {
    const title = (input.title ?? '').trim();
    if (!title) return { ok: false, error: 'Poné un título.' };
    if (!['fisico', 'mental', 'tecnico', 'nutricion', 'otro'].includes(input.kind)) return { ok: false, error: 'Tipo inválido.' };
    if (input.video_url && !/^https?:\/\//.test(input.video_url)) return { ok: false, error: 'El video debe ser un link http(s).' };
    if (input.due_date && !/^\d{4}-\d{2}-\d{2}$/.test(input.due_date)) return { ok: false, error: 'Fecha inválida.' };
    const ctx = await resolveSpecialist(token);
    if (!ctx) return { ok: false, error: 'Sin acceso.' };
    if (!seasonForStudent(ctx, studentId)) return { ok: false, error: 'Este atleta no está en tus temporadas.' };
    const { error } = await ctx.admin.from('athlete_staff_tasks').insert({
      student_id: studentId,
      coach_id: ctx.coach.id,
      kind: input.kind,
      title: title.slice(0, 120),
      body: input.body?.trim().slice(0, 2000) || null,
      video_url: input.video_url?.trim() || null,
      due_date: input.due_date || null,
    });
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[specialist] task failed', e);
    return { ok: false, error: 'No se pudo crear la sesión.' };
  }
}

// ─── Citas desde /equipo: gate por VÍNCULO DE TEMPORADA (la revisión atrapó
// que coachCreateAppointmentHP exige E1 — curso + escalón — y rechazaba a
// todos los especialistas externos, y hasta al head con escalón 0). ───
export async function specialistCreateAppointment(
  token: string,
  studentId: string,
  // location = link de Zoom (online) o dónde se encuentran (presencial):
  // sin esto la cita le llegaba al atleta sin decirle a dónde ir ni a qué
  // link entrar (pedido de Marcelo 2026-08-25).
  input: { kind: 'fisico' | 'mental' | 'tecnico' | 'nutricion' | 'evaluacion' | 'otro'; mode: 'online' | 'presencial'; date: string; time?: string | null; title?: string | null; location?: string | null; notes?: string | null },
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!['fisico', 'mental', 'tecnico', 'nutricion', 'evaluacion', 'otro'].includes(input.kind)) return { ok: false, error: 'Tipo inválido.' };
    if (!['online', 'presencial'].includes(input.mode)) return { ok: false, error: 'Modo inválido.' };
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return { ok: false, error: 'La fecha no es válida.' };
    if (input.time && !/^\d{2}:\d{2}$/.test(input.time)) return { ok: false, error: 'La hora no es válida.' };
    if (input.date < elSalvadorToday()) return { ok: false, error: 'La cita no puede ser en el pasado.' };
    const ctx = await resolveSpecialist(token);
    if (!ctx) return { ok: false, error: 'Sin acceso.' };
    if (!seasonForStudent(ctx, studentId)) return { ok: false, error: 'Este atleta no está en tus temporadas.' };
    const { error } = await ctx.admin.from('program_appointments').insert({
      student_id: studentId,
      coach_id: ctx.coach.id,
      kind: input.kind,
      mode: input.mode,
      title: input.title?.trim() || null,
      appointment_date: input.date,
      appointment_time: input.time || null,
      location: input.location?.trim().slice(0, 300) || null,
      notes: input.notes?.trim().slice(0, 1000) || null,
    });
    if (error) throw error;
    return { ok: true };
  } catch (e) {
    console.error('[specialist] appointment failed', e);
    return { ok: false, error: 'No se pudo agendar la cita.' };
  }
}
