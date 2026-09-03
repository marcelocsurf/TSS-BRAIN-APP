'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { pickWeakestCriterion } from '@/lib/utils/criteria';
import { getCurrentCoach } from '@/lib/actions/auth';
import { checkCoachAccessToStudent } from '@/lib/actions/students';
import { computeSurfSplit, coachSessionMinutes } from '@/lib/utils/surf-hours';
import { weekKey } from '@/lib/utils/tz';

// ─── Resumen de actividad del alumno para la BITÁCORA de la ficha ───
//
// Lo que el alumno registra en su portal, visible para el staff sin excavar:
// horas de agua (MISMA fórmula del portal — surf-hours.ts), y la línea de
// tiempo unificada: sesiones con coach + misiones solas + free surf, una sola
// historia ordenada por fecha. Staff logueado (cualquier rol de la ficha).

export interface ActivityTimelineItem {
  kind: 'coach' | 'mission' | 'free_surf';
  date: string;               // ISO
  title: string;
  detail: string | null;      // coach / evaluación / minutos de agua
  minutes: number;
  completed: boolean;
}

export interface StudentActivitySummary {
  hours: { totalMinutes: number; trainingMinutes: number; freeSurfMinutes: number };
  counts: { coach_sessions: number; self_missions: number; free_surfs: number };
  week_practices: number;     // sesiones propias completadas esta semana (racha)
  timeline: ActivityTimelineItem[];
}

export async function getStudentActivitySummary(
  studentId: string
): Promise<{ ok: boolean; error?: string; data: StudentActivitySummary | null }> {
  try {
    const me = await getCurrentCoach().catch(() => null);
    if (!me) return { ok: false, error: 'No autorizado.', data: null };
    // Admin client bypasea RLS: el mismo gate academia/ventana que la página.
    const access = await checkCoachAccessToStudent(studentId).catch(() => null);
    if (access !== 'allowed') return { ok: false, error: 'No autorizado.', data: null };
    const admin = createAdminClient();

    // Las MISMAS tres fuentes que computa el portal del alumno.
    const [results, cascade, self] = await Promise.all([
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
        .eq('student_id', studentId)
        .order('created_at', { ascending: false }),
    ]);
    if (results.error) throw results.error;
    if (cascade.error) throw cascade.error;
    if (self.error) throw self.error;

    const matched = new Set((results.data ?? []).filter((r: any) => r.cascade_session_id).map((r: any) => r.cascade_session_id));
    const unmatchedCascade = (cascade.data ?? [])
      .filter((c: any) => !matched.has(c.id))
      .map((c: any) => ({ ...c, created_at: c.created_at || c.session_date }));
    const coachSessions = [...(results.data ?? []), ...unmatchedCascade];
    const selfSessions = self.data ?? [];
    // Históricos HP: cuentan en HORAS, no en timeline/contadores (16/20
    // atletas veían la Bitácora 12/12 "Entreno HP" — revisión 2026-08-23).
    const selfVisible = selfSessions.filter((s: any) => {
      const n = String(s.notes ?? '');
      // checkin: = puente de horas del check-in diario (misma regla que hp:).
      return !n.startsWith('hp:checkin:') && !n.startsWith('checkin:') && !n.startsWith('hpsession:');
    });

    const hours = computeSurfSplit(coachSessions, selfSessions);

    // Prácticas propias completadas esta semana (lunes SV, no la del portal
    // que es días consecutivos — por eso el copy dice "por su cuenta").
    const thisWeek = weekKey(new Date());
    const week_practices = selfVisible.filter(
      (s: any) => s.completed && weekKey(s.created_at) === thisWeek
    ).length;

    // Línea de tiempo unificada (últimos 12 eventos).
    const items: ActivityTimelineItem[] = [
      ...coachSessions.map((s: any) => ({
        kind: 'coach' as const,
        date: s.created_at,
        title: s.standalone_sessions?.mission || s.mission || 'Coach session',
        detail: s.coaches?.display_name ? `con ${s.coaches.display_name}` : null,
        minutes: coachSessionMinutes(s),
        completed: true,
      })),
      ...selfVisible.map((s: any) => ({
        kind: (s.kind === 'free_surf' ? 'free_surf' : 'mission') as 'free_surf' | 'mission',
        date: s.created_at,
        title: s.kind === 'free_surf' ? 'Free surf' : (s.drill_name || s.intention_text || 'Misión'),
        detail: s.kind === 'free_surf'
          ? `${s.total_water_minutes || s.duration_minutes || 0} min de agua`
          : [
              s.mission_completion
                ? `misión ${({ yes: 'lograda', partial: 'a medias', no: 'no lograda' } as Record<string, string>)[s.mission_completion] ?? s.mission_completion}`
                : null,
              s.execution_rating ? `${s.execution_rating}★` : null,
              s.automaticity
                ? ({ yes: 'drill: listo para la misión', almost: 'drill: casi listo', not_yet: 'drill: sigue practicando' } as Record<string, string>)[s.automaticity] ?? null
                : null,
              (() => { const w = pickWeakestCriterion(s.criteria_evaluation); return w && w.result !== 'met' ? `trabajar: ${w.criterion_text}` : null; })(),
            ].filter(Boolean).join(' · ') || null,
        minutes: s.kind === 'free_surf' ? (s.total_water_minutes || s.duration_minutes || 0) : (s.duration_minutes || 0),
        completed: !!s.completed,
      })),
    ]
      .filter((i) => i.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 12);

    return {
      ok: true,
      data: {
        hours,
        counts: {
          coach_sessions: coachSessions.length,
          self_missions: selfVisible.filter((s: any) => s.kind !== 'free_surf').length,
          free_surfs: selfVisible.filter((s: any) => s.kind === 'free_surf').length,
        },
        week_practices,
        timeline: items,
      },
    };
  } catch (e) {
    console.error('[student-activity] summary failed', e);
    return { ok: false, error: 'No se pudo cargar la actividad.', data: null };
  }
}
