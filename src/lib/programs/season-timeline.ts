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
}

export interface MySeasonTimeline {
  season: { id?: string; title: string; objective: string | null; start: string; end: string } | null;
  program_title: string;
  weeks: SeasonTimelineWeek[];
  /** Eventos DESPUÉS del programa (dentro de la temporada o próximos 6 meses). */
  ahead: Array<{ icon: string; label: string; date: string }>;
}

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

  const [{ data: days, error: dErr }, { data: marks, error: mErr }, { data: season }, { data: comps }, { data: appts }, { data: evals }] = await Promise.all([
    admin.from('program_days').select('id, week_number, day_number').eq('program_id', (assignment as any).program_id),
    admin.from('program_day_marks').select('day_id').eq('assignment_id', (assignment as any).id),
    admin.from('season_plans').select('id, title, objective, start_date, end_date').eq('student_id', studentId).eq('active', true).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    admin.from('athlete_competitions').select('name, comp_date, location, status').eq('student_id', studentId).order('comp_date'),
    admin.from('program_appointments').select('kind, title, appointment_date, appointment_time, status').eq('student_id', studentId).neq('status', 'cancelled').order('appointment_date'),
    admin.from('hp_deep_evaluations').select('eval_kind, created_at').eq('student_id', studentId).order('created_at'),
  ]);
  if (dErr) throw dErr;
  if (mErr) throw mErr;

  const doneIds = new Set((marks ?? []).map((m: any) => m.day_id));
  const weekNums = Array.from(new Set((days ?? []).map((d: any) => d.week_number))).sort((a, b) => a - b);

  const startMs = Date.parse(`${(assignment as any).start_date}T00:00:00Z`);
  const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
  const today = elSalvadorToday();

  const orderedDays = (days ?? []).slice().sort((a: any, b: any) => a.week_number - b.week_number || a.day_number - b.day_number);
  const cur = orderedDays.find((d: any) => !doneIds.has(d.id)) ?? null;

  type Ev = { icon: string; label: string; date: string };
  const allEvents: Ev[] = [
    ...((comps ?? []).map((c: any) => ({
      icon: '🏆',
      label: c.name + (c.location ? ` · ${c.location}` : ''),
      date: String(c.comp_date ?? '').slice(0, 10),
    }))),
    ...((appts ?? []).map((a: any) => ({
      icon: APPT_KIND_ICON[a.kind] ?? '📅',
      label: (a.title || APPT_KIND_EN[a.kind] || 'Appointment') + (a.appointment_time ? ` · ${a.appointment_time}` : ''),
      date: String(a.appointment_date ?? '').slice(0, 10),
    }))),
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
    };
  });

  const programEnd = weeks.length ? weeks[weeks.length - 1].end : today;
  const horizon = (season as any)?.end_date ?? iso(Date.parse(`${today}T00:00:00Z`) + 183 * 86400000);
  const ahead = allEvents
    .filter((e) => e.date > programEnd && e.date <= horizon)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10);

  return {
    season: season
      ? { id: (season as any).id, title: (season as any).title, objective: (season as any).objective ?? null, start: (season as any).start_date, end: (season as any).end_date }
      : null,
    program_title: program?.title ?? 'Training program',
    weeks,
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
