import 'server-only';

import type { createAdminClient } from '@/lib/supabase/admin';
import { pickWeakestCriterion } from '@/lib/utils/criteria';
import { computeSurfSplit, coachSessionMinutes } from '@/lib/utils/surf-hours';
import { weekKey, toElSalvadorDate } from '@/lib/utils/tz';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';

// ─── LA BITÁCORA del alumno — una sola función, para todas las pantallas ───
//
// Marcelo (2026-09-25): "que todo se registre ahí, y de ahí toda la
// información que le tiene que llegar al coach le llegue". La auditoría
// encontró que la bitácora rica existía solo en la ficha del dashboard, con
// tope de 12 eventos, y que el coach en el agua recibía una etiqueta y una
// palabra. Además había CINCO registros juntados en memoria con TRES reglas
// distintas en tres archivos — y se estaban separando.
//
// Desde hoy la regla vive acá, en buildStudentActivity(): SIN permisos
// adentro, para que la llame cualquier pantalla que ya validó los suyos.
//   · La ficha del dashboard    → getStudentActivitySummary (gate de login).
//   · La ficha del portal coach → getCoachStudentDetail (gate por token).
//   · El planner del coach      → las mismas reglas exportadas abajo.
// Este archivo NO es 'use server' a propósito: un constructor sin gate no
// puede ser un endpoint. Si una pantalla arma su propia versión, se separa.

export type ActivityKind =
  | 'coach'        // sesión con coach (cierre del día, cascada o suelta)
  | 'mission'      // misión / drill / run de secuencia por su cuenta
  | 'free_surf'    // free surf registrado
  | 'lesson'       // lecciones del curso completadas (agrupadas por día)
  | 'water_level'  // cambio del nivel de agua (coach)
  | 'belt'         // ascenso de cinta sellado
  | 'final_eval'   // evaluación final del camp (solo lo visible al alumno)
  | 'survey';      // encuesta del alumno tras una sesión

export type ActivityLang = 'es' | 'en';

export interface ActivityTimelineItem {
  kind: ActivityKind;
  date: string;               // ISO
  title: string;
  detail: string | null;      // coach / evaluación / minutos de agua / venue…
  minutes: number;
  completed: boolean;
}

export interface StudentActivitySummary {
  hours: { totalMinutes: number; trainingMinutes: number; freeSurfMinutes: number };
  counts: { coach_sessions: number; self_missions: number; free_surfs: number; lessons: number };
  week_practices: number;     // sesiones propias completadas esta semana (racha)
  timeline: ActivityTimelineItem[];
  /** Cuántos eventos hay en total, por si la pantalla muestra "N más". */
  total_events: number;
}

/** Los puentes de horas del check-in HP no son eventos: cuentan en HORAS y
 *  nada más (16/20 atletas veían "Entreno HP" 12 de 12 veces — revisión
 *  2026-08-23). Regla compartida: la ficha y el planner tienen que coincidir. */
export function isVisibleSelfSession(s: { notes?: string | null }): boolean {
  const n = String(s?.notes ?? '');
  return !n.startsWith('hp:checkin:') && !n.startsWith('checkin:') && !n.startsWith('hpsession:');
}

// El dashboard habla español (copy interno); el portal del coach, inglés
// (regla de marca). Una sola bitácora, dos diccionarios chicos.
const STR = {
  es: {
    coach_session: 'Sesión con coach', free_surf: 'Free surf', mission: 'Misión', lesson: 'lección del curso', lessons: 'lecciones del curso',
    water_min: 'min de agua', intention: 'intención', outcome: 'resultado', mission_w: 'misión', sequence: 'secuencia', held: 'freno', work: 'trabajar',
    focus: 'foco', flow: 'flow', waves: 'olas', tide: 'marea', wind: 'viento', with: 'con', quiz: 'quiz',
    water_level: 'Nivel de agua', before: 'antes', from: 'antes', by: 'por', final_eval: 'Evaluación final', approved: 'aprobada', not_approved: 'en progreso',
    improve: 'a mejorar', homework: 'tarea', survey: 'Encuesta del alumno', coach: 'coach', session: 'sesión', method: 'método', belt: 'Cinta',
    done: { yes: 'lograda', partial: 'parcial', no: 'no lograda' } as Record<string, string>,
    auto: { yes: 'drill: listo para la misión', almost: 'drill: casi listo', not_yet: 'drill: sigue practicando' } as Record<string, string>,
    level: { beginner: 'principiante', supervised: 'supervisado', semi_autonomous: 'semi-autónomo', autonomous: 'autónomo', advanced: 'avanzado' } as Record<string, string>,
    // El canal de flow es una POSICIÓN, no un puntaje: 3 es el objetivo (mismas
    // palabras que el picker del portal: Bored · Easy · Flow · Hard · Too much).
    flow_words: ['—', 'aburrido', 'fácil', 'en flow', 'difícil', 'demasiado'],
  },
  en: {
    coach_session: 'Coach session', free_surf: 'Free surf', mission: 'Mission', lesson: 'course lesson', lessons: 'course lessons',
    water_min: 'min in the water', intention: 'intention', outcome: 'outcome', mission_w: 'mission', sequence: 'sequence', held: 'held back by', work: 'work on',
    focus: 'focus', flow: 'flow', waves: 'waves', tide: 'tide', wind: 'wind', with: 'with', quiz: 'quiz',
    water_level: 'Water level', before: 'was', from: 'from', by: 'by', final_eval: 'Final evaluation', approved: 'approved', not_approved: 'in progress',
    improve: 'to improve', homework: 'homework', survey: 'Student survey', coach: 'coach', session: 'session', method: 'method', belt: 'Belt',
    // Mismas palabras que el cierre del coach: Achieved · Partial · Not yet.
    done: { yes: 'achieved', partial: 'partial', no: 'not yet' } as Record<string, string>,
    auto: { yes: 'drill: ready for the mission', almost: 'drill: almost ready', not_yet: 'drill: keep practicing' } as Record<string, string>,
    level: { beginner: 'beginner', supervised: 'supervised', semi_autonomous: 'semi-autonomous', autonomous: 'autonomous', advanced: 'advanced' } as Record<string, string>,
    flow_words: ['—', 'bored', 'easy', 'in flow', 'hard', 'too much'],
  },
} as const;

/** El Venue Check que hizo antes de entrar, si lo hizo. */
function venueLine(s: any, t: (typeof STR)[ActivityLang]): string | null {
  const parts = [
    s.venue_type ? String(s.venue_type).replace(/_/g, ' ') : null,
    s.wave_conditions ? `${t.waves} ${String(s.wave_conditions).replace(/^(\d+)_(\d+)ft$/, '$1–$2 ft').replace(/_/g, ' ')}` : null,
    s.tide ? `${t.tide} ${s.tide}` : null,
    s.wind ? `${t.wind} ${String(s.wind).replace(/_/g, ' ')}` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}

/** El detalle de una sesión propia, en una línea. Es la MISMA frase para la
 *  ficha y para el planner: "secuencia 3★ · freno: Bottom turn · trabajar:
 *  caderas abajo · foco 2/3 · flow 4/5 · playa · olas medianas". */
export function selfSessionDetail(s: any, stepTitle: Map<string, string>, lang: ActivityLang = 'es'): string | null {
  const t = STR[lang];
  if (s.kind === 'free_surf') {
    return [
      `${s.total_water_minutes || s.duration_minutes || 0} ${t.water_min}`,
      s.intention_text ? `${t.intention}: ${s.intention_text}` : null,
      s.mission_completion ? `${t.outcome}: ${t.done[s.mission_completion] ?? s.mission_completion}` : null,
      venueLine(s, t),
    ].filter(Boolean).join(' · ') || null;
  }
  const held = ((s.step_marks ?? []) as any[]).filter((m) => m?.held_back);
  const heldLine = held.length
    ? (() => {
        const names = held.map((m) => stepTitle.get(m.step_id) ?? m.step_id).join(', ');
        const w = pickWeakestCriterion(held[0].criteria_evaluation ?? null);
        return `${t.held}: ${names}` + (w && w.result !== 'met' ? ` · ${t.work}: ${w.criterion_text}` : '');
      })()
    : null;
  const weakest = (() => { const w = pickWeakestCriterion(s.criteria_evaluation); return w && w.result !== 'met' ? `${t.work}: ${w.criterion_text}` : null; })();
  return [
    s.training_mode === 'sequence_run' && s.sequence_rating ? `${t.sequence} ${s.sequence_rating}★` : null,
    heldLine,
    s.mission_completion ? `${t.mission_w} ${t.done[s.mission_completion] ?? s.mission_completion}` : null,
    s.execution_rating ? `${s.execution_rating}★` : null,
    s.automaticity ? (t.auto[s.automaticity] ?? null) : null,
    weakest,
    // Lo que el alumno reporta de sí mismo en cada cierre (Marcelo 2026-09-25:
    // "el foco y el flow que el alumno reporta no los lee nadie del lado del
    // coach"). Foco 0–3, flow 1–5: las mismas escalas de su portal.
    s.focus_rating != null ? `${t.focus} ${s.focus_rating}/3` : null,
    s.flow_channel != null ? `${t.flow}: ${t.flow_words[Number(s.flow_channel)] ?? s.flow_channel}` : null,
    venueLine(s, t),
  ].filter(Boolean).join(' · ') || null;
}

/** Nombres de pasos, juegos o drills por id: los pasos viven en lessons, los
 *  juegos (GAME-*) y drills en drills_missions. Una consulta por tabla. */
export async function resolveStepTitles(admin: ReturnType<typeof createAdminClient>, ids: Set<string>): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (ids.size === 0) return out;
  const { data: ls } = await admin.from('lessons').select('id, title').in('id', Array.from(ids));
  for (const l of (ls ?? []) as any[]) out.set(l.id, l.title);
  const rest = Array.from(ids).filter((id) => !out.has(id));
  if (rest.length > 0) {
    const { data: dm } = await admin.from('drills_missions').select('id, title').in('id', rest);
    for (const d of (dm ?? []) as any[]) out.set(d.id, d.title);
  }
  return out;
}

/**
 * Arma la bitácora completa. SIN permisos: quien la llama ya validó los
 * suyos (login del dashboard, token del portal del coach). Recibe el admin
 * client del llamador para no abrir otra conexión.
 */
export async function buildStudentActivity(
  admin: ReturnType<typeof createAdminClient>,
  studentId: string,
  opts: { limit?: number; lang?: ActivityLang; surveys?: boolean } = {},
): Promise<StudentActivitySummary> {
  const limit = opts.limit ?? 40;
  const lang: ActivityLang = opts.lang ?? 'es';
  // La encuesta es lo que el alumno dice DEL coach: la lee el coordinador
  // (/reports), no el coach calificado. El portal del coach pasa false.
  const withSurveys = opts.surveys ?? true;
  const t = STR[lang];

  // Las fuentes. Las tres primeras son las de siempre (mismas que el portal
  // del alumno); las cinco siguientes son lo que la auditoría del 2026-09-25
  // encontró que un coach esperaría y no estaba: lecciones, nivel de agua,
  // cinta, evaluación final y encuesta.
  const [results, cascade, self, lessons, water, finals, surveys, stud] = await Promise.all([
    admin.from('student_session_results')
      .select('*, standalone_sessions(*), coaches:coach_id(display_name)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false }),
    admin.from('cascade_sessions')
      .select('*, coaches:coach_id(display_name)')
      .eq('student_id', studentId)
      .eq('completion_state', 'closed')
      .order('session_date', { ascending: false }),
    admin.from('self_training_sessions')
      .select('*')
      .eq('status', 'done')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false }),
    admin.from('lesson_progress')
      .select('lesson_id, completed_at, quiz_score, lessons:lesson_id(title)')
      .eq('student_id', studentId)
      .eq('completed', true)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false }),
    admin.from('ocean_level_evaluations')
      .select('previous_level, new_level, method, notes, created_at, coaches:evaluated_by(display_name)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false }),
    // Solo columnas visibles al alumno. coach_private_note NUNCA sale de acá:
    // es la nota para el próximo coach, no para una bitácora que también
    // puede ver un asistente.
    admin.from('camp_final_evaluations')
      .select('created_at, finalized_at, approved, readiness_summary, areas_to_improve, homework_for_after_camp, coaches:coach_id(display_name), camp_instances:camp_instance_id(camp_name)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false }),
    withSurveys
      ? admin.from('survey_responses')
          .select('submitted_at, coach_rating, flow_channel, session_quality, method_clarity, method_next, open_comment')
          .eq('student_id', studentId)
          .order('submitted_at', { ascending: false })
      : Promise.resolve({ data: [] as any[], error: null }),
    admin.from('students')
      .select('belt_level, belt_promoted_at, belt_promoted_from')
      .eq('id', studentId)
      .maybeSingle(),
  ]);
  if (results.error) throw results.error;
  if (cascade.error) throw cascade.error;
  if (self.error) throw self.error;
  // Las fuentes nuevas no tiran la bitácora si fallan: se registra y se sigue.
  for (const [name, r] of [['lesson_progress', lessons], ['ocean_level_evaluations', water], ['camp_final_evaluations', finals], ['survey_responses', surveys], ['students', stud]] as const) {
    if ((r as any).error) console.error(`[student-activity] ${name} failed`, (r as any).error);
  }

  const matched = new Set((results.data ?? []).filter((r: any) => r.cascade_session_id).map((r: any) => r.cascade_session_id));
  const unmatchedCascade = (cascade.data ?? [])
    .filter((c: any) => !matched.has(c.id))
    .map((c: any) => ({ ...c, created_at: c.created_at || c.session_date }));
  const coachSessions = [...(results.data ?? []), ...unmatchedCascade];
  const selfSessions = self.data ?? [];
  const selfVisible = selfSessions.filter((s: any) => isVisibleSelfSession(s));

  const hours = computeSurfSplit(coachSessions, selfSessions);

  // Títulos de los pasos que frenaron una cadena, en una sola consulta.
  const heldIds = new Set<string>();
  for (const s of selfVisible as any[]) {
    for (const m of (s.step_marks ?? []) as any[]) if (m?.held_back && m?.step_id) heldIds.add(m.step_id);
  }
  const stepTitle = await resolveStepTitles(admin, heldIds);

  const thisWeek = weekKey(new Date());
  const week_practices = selfVisible.filter((s: any) => s.completed && weekKey(s.created_at) === thisWeek).length;

  const one = (x: any) => (Array.isArray(x) ? x[0] : x);
  const lvl = (v: string | null | undefined) => (v ? (t.level[v] ?? String(v).replace(/_/g, ' ')) : null);

  // Lecciones agrupadas por día: 67 lecciones sueltas taparían todo lo demás.
  const lessonsByDay = new Map<string, { date: string; titles: string[]; quiz: number[] }>();
  for (const l of (lessons.data ?? []) as any[]) {
    const day = toElSalvadorDate(l.completed_at) ?? String(l.completed_at).slice(0, 10);
    const g = lessonsByDay.get(day) ?? { date: String(l.completed_at), titles: [] as string[], quiz: [] as number[] };
    g.titles.push(one(l.lessons)?.title ?? l.lesson_id);
    if (l.quiz_score != null) g.quiz.push(l.quiz_score);
    if (l.completed_at > g.date) g.date = l.completed_at;
    lessonsByDay.set(day, g);
  }

  const items: ActivityTimelineItem[] = [
    ...coachSessions.map((s: any) => ({
      kind: 'coach' as const,
      date: s.created_at,
      title: s.standalone_sessions?.mission || s.mission || t.coach_session,
      // La palabra del coach de ESA sesión viaja en la bitácora: es lo que
      // el próximo coach —y el alumno— tienen que ver.
      detail: [
        s.coaches?.display_name ? `${t.with} ${s.coaches.display_name}` : null,
        (s.whats_next || s.homework_text) ? `→ ${String(s.whats_next || s.homework_text).trim()}` : null,
      ].filter(Boolean).join(' · ') || null,
      minutes: coachSessionMinutes(s),
      completed: true,
    })),
    ...selfVisible.map((s: any) => ({
      kind: (s.kind === 'free_surf' ? 'free_surf' : 'mission') as ActivityKind,
      date: s.created_at,
      title: s.kind === 'free_surf' ? t.free_surf : (s.drill_name || s.intention_text || t.mission),
      detail: selfSessionDetail(s, stepTitle, lang),
      minutes: s.kind === 'free_surf' ? (s.total_water_minutes || s.duration_minutes || 0) : (s.duration_minutes || 0),
      completed: !!s.completed,
    })),
    ...Array.from(lessonsByDay.values()).map((g) => ({
      kind: 'lesson' as const,
      date: g.date,
      title: g.titles.length === 1 ? g.titles[0] : `${g.titles.length} ${t.lessons}`,
      detail: g.titles.length === 1
        ? (g.quiz.length ? `${t.lesson} · ${t.quiz} ${g.quiz[0]}` : t.lesson)
        : g.titles.slice(0, 3).join(' · ') + (g.titles.length > 3 ? ` · +${g.titles.length - 3}` : ''),
      minutes: 0,
      completed: true,
    })),
    ...((water.data ?? []) as any[]).map((w) => ({
      kind: 'water_level' as const,
      date: w.created_at,
      title: `${t.water_level}: ${lvl(w.new_level) ?? '—'}`,
      detail: [
        w.previous_level ? `${t.before} ${lvl(w.previous_level)}` : null,
        one(w.coaches)?.display_name ? `${t.by} ${one(w.coaches).display_name}` : null,
        w.notes ? String(w.notes).trim() : null,
      ].filter(Boolean).join(' · ') || null,
      minutes: 0,
      completed: true,
    })),
    ...((finals.data ?? []) as any[]).map((f) => ({
      kind: 'final_eval' as const,
      date: f.finalized_at || f.created_at,
      title: `${t.final_eval}${one(f.camp_instances)?.camp_name ? ` · ${String(one(f.camp_instances).camp_name).trim()}` : ''}`,
      detail: [
        // approved es tri-estado: null = evaluación sin veredicto (fuera de camp).
        f.approved === true ? t.approved : f.approved === false ? t.not_approved : null,
        one(f.coaches)?.display_name ? `${t.by} ${one(f.coaches).display_name}` : null,
        f.readiness_summary ? String(f.readiness_summary).trim() : null,
        f.areas_to_improve ? `${t.improve}: ${String(f.areas_to_improve).trim()}` : null,
        f.homework_for_after_camp ? `${t.homework}: ${String(f.homework_for_after_camp).trim()}` : null,
      ].filter(Boolean).join(' · ') || null,
      minutes: 0,
      completed: true,
    })),
    ...((surveys.data ?? []) as any[]).filter((r) => r.submitted_at).map((r) => ({
      kind: 'survey' as const,
      date: r.submitted_at,
      title: t.survey,
      detail: [
        r.coach_rating != null ? `${t.coach} ${r.coach_rating}★` : null,
        r.session_quality != null ? `${t.session} ${r.session_quality}★` : null,
        r.method_clarity != null ? `${t.method} ${r.method_clarity}★` : null,
        r.flow_channel != null ? `${t.flow}: ${t.flow_words[Number(r.flow_channel)] ?? r.flow_channel}` : null,
        r.open_comment ? `"${String(r.open_comment).trim().slice(0, 120)}${String(r.open_comment).trim().length > 120 ? '…' : ''}"` : null,
      ].filter(Boolean).join(' · ') || null,
      minutes: 0,
      completed: true,
    })),
  ];
  // El ascenso de cinta sellado es un solo evento, y de los que más importan.
  const st: any = stud.data;
  if (st?.belt_promoted_at) {
    const pretty = (b: string | null) => (b ? (BELT_DISPLAY[b as BeltLevel]?.[lang] ?? String(b).replace(/_belt$/, '').replace(/_/g, ' ')) : null);
    items.push({
      kind: 'belt',
      date: st.belt_promoted_at,
      title: pretty(st.belt_level) ?? t.belt,
      detail: st.belt_promoted_from && st.belt_promoted_from !== st.belt_level ? `${t.from} ${pretty(st.belt_promoted_from)}` : null,
      minutes: 0,
      completed: true,
    });
  }

  const sorted = items
    .filter((i) => i.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    hours,
    counts: {
      coach_sessions: coachSessions.length,
      self_missions: selfVisible.filter((s: any) => s.kind !== 'free_surf').length,
      free_surfs: selfVisible.filter((s: any) => s.kind === 'free_surf').length,
      lessons: (lessons.data ?? []).length,
    },
    week_practices,
    timeline: sorted.slice(0, limit),
    total_events: sorted.length,
  };
}
