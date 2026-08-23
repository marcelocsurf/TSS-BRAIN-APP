import { createAdminClient } from '@/lib/supabase/admin';
import { elSalvadorToday } from '@/lib/utils/tz';

// ─── Builder COMPARTIDO del timeline de temporada ───
// Lo usan el portal del atleta (getMySeasonTimeline, gate por su token) y el
// portal del especialista (gate por vínculo de temporada). Vive FUERA de los
// archivos 'use server' a propósito: un builder por studentId exportado como
// server action sería un endpoint IDOR.

export interface SeasonTimelineWeek {
  week: number;
  label: string | null;
  type: string | null;
  intensity: string | null;
  objective: string | null;
  start: string; // YYYY-MM-DD (SV)
  end: string;
  days_total: number;
  days_done: number;
  current: boolean;
  events: Array<{ icon: string; label: string; date: string }>;
  /** Fase macro de la temporada que cubre esta semana (por solapamiento de fechas). */
  phase: string | null;
  phase_id: string | null;
  phase_color_key: string | null;
}

export interface SeasonTimelinePhase {
  id: string;
  name: string;
  objective: string | null;
  color_key: string;
  start: string;
  end: string;
  state: 'done' | 'current' | 'future';
}

export interface MySeasonTimeline {
  season: { id?: string; title: string; objective: string | null; start: string; end: string } | null;
  program_title: string;
  weeks: SeasonTimelineWeek[];
  /** Fases macro del PLAN ANUAL (season_phases) — vacío si la temporada no las tiene. */
  phases: SeasonTimelinePhase[];
  /** Eventos DESPUÉS del programa (dentro de la temporada o próximos 6 meses). */
  ahead: Array<{ icon: string; label: string; date: string }>;
}

export const SEASON_EVENT_ICON: Record<string, string> = {
  camp: '🌊', nacional: '⭐', internacional: '🏆', viaje: '✈️', medico: '🩺', otro: '📍',
};

export const APPT_KIND_ICON: Record<string, string> = {
  evaluacion: '📋', fisico: '💪', mental: '🧠', tecnico: '🎯', nutricion: '🥗', otro: '📅',
};
export const APPT_KIND_EN: Record<string, string> = {
  evaluacion: 'Evaluation', fisico: 'Physio', mental: 'Mental', tecnico: 'Technique', nutricion: 'Nutrition', otro: 'Appointment',
};

/** Devuelve el timeline del alumno, o null si no tiene programa activo. */
export async function buildSeasonTimeline(
  admin: ReturnType<typeof createAdminClient>,
  studentId: string,
): Promise<MySeasonTimeline | null> {
  const { data: assignment, error: asgErr } = await admin
    .from('program_assignments')
    .select('id, program_id, start_date, programs!inner(id, title, weeks, week_labels, week_meta, active)')
    .eq('student_id', studentId)
    .eq('status', 'active')
    .eq('programs.active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (asgErr) throw asgErr;
  if (!assignment) return null;
  const program: any = (assignment as any).programs;

  const [{ data: days, error: dErr }, { data: marks, error: mErr }, { data: season, error: snErr }, { data: comps, error: cErr }, { data: appts, error: aErr }, { data: evals, error: eErr }] = await Promise.all([
    admin.from('program_days').select('id, week_number, day_number').eq('program_id', (assignment as any).program_id),
    admin.from('program_day_marks').select('day_id').eq('assignment_id', (assignment as any).id),
    admin.from('season_plans').select('id, title, objective, start_date, end_date').eq('student_id', studentId).eq('active', true).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    admin.from('athlete_competitions').select('name, comp_date, location, status').eq('student_id', studentId).order('comp_date'),
    admin.from('program_appointments').select('kind, title, appointment_date, appointment_time, status').eq('student_id', studentId).neq('status', 'cancelled').order('appointment_date'),
    admin.from('hp_deep_evaluations').select('eval_kind, created_at').eq('student_id', studentId).order('created_at'),
  ]);
  if (dErr) throw dErr;
  if (mErr) throw mErr;
  // season es load-bearing desde el plan anual: si su query falla en
  // silencio, el timeline sale "sin fases" indistinguible de una temporada
  // sin configurar (revisión) — mejor error visible.
  if (snErr) throw snErr;
  if (cErr) throw cErr;
  if (aErr) throw aErr;
  if (eErr) throw eErr;

  // Plan anual: fases macro + eventos de la temporada (viajes, camps, picos).
  // Segundo lote porque necesitan el id de la temporada resuelto arriba.
  let seasonPhases: any[] = [];
  let seasonEvents: any[] = [];
  if (season) {
    const [fRes, eRes] = await Promise.all([
      admin.from('season_phases').select('id, name, objective, start_date, end_date, color_key').eq('season_id', (season as any).id).order('start_date'),
      admin.from('season_events').select('id, name, kind, event_date, end_date, is_peak').eq('season_id', (season as any).id).order('event_date'),
    ]);
    if (fRes.error) throw fRes.error;
    if (eRes.error) throw eRes.error;
    seasonPhases = fRes.data ?? [];
    seasonEvents = eRes.data ?? [];
  }

  const doneIds = new Set((marks ?? []).map((m: any) => m.day_id));
  const weekNums = Array.from(new Set((days ?? []).map((d: any) => d.week_number))).sort((a, b) => a - b);

  const startMs = Date.parse(`${(assignment as any).start_date}T00:00:00Z`);
  const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
  const today = elSalvadorToday();

  const orderedDays = (days ?? []).slice().sort((a: any, b: any) => a.week_number - b.week_number || a.day_number - b.day_number);
  const cur = orderedDays.find((d: any) => !doneIds.has(d.id)) ?? null;

  type Ev = { icon: string; label: string; date: string };
  // La misma competencia suele existir como evento del plan anual (el pico)
  // Y en athlete_competitions (heats/resultados) — dedup por nombre+fecha
  // para no mostrarla doble en la semana (revisión).
  const seKey = (n: string, d: string) => `${String(n).trim().toLowerCase()}|${d}`;
  const seasonEvKeys = new Set(seasonEvents.map((e: any) => seKey(e.name, String(e.event_date ?? '').slice(0, 10))));
  const allEvents: Ev[] = [
    ...((comps ?? [])
      .filter((c: any) => !seasonEvKeys.has(seKey(c.name, String(c.comp_date ?? '').slice(0, 10))))
      .map((c: any) => ({
        icon: '🏆',
        label: c.name + (c.location ? ` · ${c.location}` : ''),
        date: String(c.comp_date ?? '').slice(0, 10),
      }))),
    ...((appts ?? []).map((a: any) => ({
      icon: APPT_KIND_ICON[a.kind] ?? '📅',
      label: (a.title || APPT_KIND_EN[a.kind] || 'Appointment') + (a.appointment_time ? ` · ${a.appointment_time}` : ''),
      date: String(a.appointment_date ?? '').slice(0, 10),
    }))),
    // Eventos del plan anual (viajes ✈️, camps 🌊, picos): con rango visible.
    ...seasonEvents.map((e: any) => ({
      icon: e.is_peak ? '▲' : (SEASON_EVENT_ICON[e.kind] ?? '📍'),
      label: e.name + (e.end_date ? ` (→ ${String(e.end_date).slice(5)})` : '') + (e.is_peak ? ' — THE PEAK' : ''),
      date: String(e.event_date ?? '').slice(0, 10),
    })),
    // Evaluaciones hechas: colapsadas por fecha (las migradas comparten día).
    ...(() => {
      const byDate = new Map<string, number>();
      for (const e of evals ?? []) {
        const d = String((e as any).created_at ?? '').slice(0, 10);
        if (d) byDate.set(d, (byDate.get(d) ?? 0) + 1);
      }
      return Array.from(byDate.entries()).map(([date, n]) => ({
        icon: '✅',
        label: n > 1 ? `${n} evaluations done` : 'Evaluation done',
        date,
      }));
    })(),
  ].filter((e) => e.date);

  const weeks: SeasonTimelineWeek[] = weekNums.map((w) => {
    const wStart = iso(startMs + (w - 1) * 7 * 86400000);
    const wEnd = iso(startMs + ((w - 1) * 7 + 6) * 86400000);
    const wDays = (days ?? []).filter((d: any) => d.week_number === w);
    // Fase macro que cubre la semana: la que contiene su inicio, o la primera
    // que se solape (semanas puente entre fases quedan con la fase entrante).
    const ph = seasonPhases.find((f: any) => f.start_date <= wStart && f.end_date >= wStart)
      ?? seasonPhases.find((f: any) => f.start_date <= wEnd && f.end_date >= wStart)
      ?? null;
    return {
      week: w,
      label: program?.week_labels?.[String(w)] ?? null,
      type: program?.week_meta?.[String(w)]?.type ?? null,
      intensity: program?.week_meta?.[String(w)]?.intensity ?? null,
      objective: program?.week_meta?.[String(w)]?.objective ?? null,
      start: wStart,
      end: wEnd,
      days_total: wDays.length,
      days_done: wDays.filter((d: any) => doneIds.has(d.id)).length,
      current: cur ? cur.week_number === w : false,
      events: allEvents.filter((e) => e.date >= wStart && e.date <= wEnd),
      phase: ph?.name ?? null,
      phase_id: ph?.id ?? null,
      phase_color_key: ph?.color_key ?? null,
    };
  });

  const programStart = weeks.length ? weeks[0].start : today;
  const programEnd = weeks.length ? weeks[weeks.length - 1].end : today;
  const horizon = (season as any)?.end_date ?? iso(Date.parse(`${today}T00:00:00Z`) + 183 * 86400000);
  // Fuera de la ventana del programa por CUALQUIER lado: un evento del plan
  // anual anterior al inicio del programa desaparecía por completo (revisión).
  const ahead = allEvents
    .filter((e) => (e.date > programEnd && e.date <= horizon) || e.date < programStart)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 12);

  return {
    season: season
      ? { id: (season as any).id, title: (season as any).title, objective: (season as any).objective ?? null, start: (season as any).start_date, end: (season as any).end_date }
      : null,
    program_title: program?.title ?? 'Training program',
    weeks,
    phases: seasonPhases.map((f: any) => ({
      id: f.id, name: f.name, objective: f.objective ?? null, color_key: f.color_key,
      start: f.start_date, end: f.end_date,
      state: f.end_date < today ? 'done' : f.start_date > today ? 'future' : 'current',
    })),
    ahead,
  };
}

// ─── Meta del portal de especialistas (módulo plano — 'use server' no puede
// exportar objetos) ───
export type SpecialistRoleKey = 'psicologo' | 'fisico' | 'nutricionista' | 'head' | 'asistente' | 'coach';
export const SPECIALIST_LABEL: Record<SpecialistRoleKey, string> = {
  psicologo: 'Psicólogo',
  fisico: 'Preparador físico',
  nutricionista: 'Nutricionista',
  head: 'Head Coach',
  asistente: 'Asistente de programa',
  coach: 'Coach',
};
