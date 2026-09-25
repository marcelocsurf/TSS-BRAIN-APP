'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentCoach } from '@/lib/actions/auth';
import { checkCoachAccessToStudent } from '@/lib/actions/students';
import { buildStudentActivity, type StudentActivitySummary } from '@/lib/activity/build';

export type { StudentActivitySummary, ActivityTimelineItem, ActivityKind } from '@/lib/activity/build';

// ─── La bitácora del alumno, para la ficha del DASHBOARD ───
// La regla de qué es un evento vive en src/lib/activity/build.ts (una sola
// para todas las pantallas). Acá solo el gate de login: el mismo de la
// página (academia + ventana de fechas del coach). Sin cambios de permiso.

export async function getStudentActivitySummary(
  studentId: string,
  opts: { limit?: number } = {},
): Promise<{ ok: boolean; error?: string; data: StudentActivitySummary | null }> {
  try {
    const me = await getCurrentCoach().catch(() => null);
    if (!me) return { ok: false, error: 'No autorizado.', data: null };
    const access = await checkCoachAccessToStudent(studentId).catch(() => null);
    if (access !== 'allowed') return { ok: false, error: 'No autorizado.', data: null };
    // La encuesta califica al coach: la ve coordinación/admin, no un coach
    // que entra al dashboard a ver su propio alumno.
    const coordination = me.role === 'coordinator' || me.role === 'admin' || !!me.is_platform_admin;
    const data = await buildStudentActivity(createAdminClient(), studentId, { limit: opts.limit, lang: 'es', surveys: coordination });
    return { ok: true, data };
  } catch (e) {
    console.error('[student-activity] summary failed', e);
    return { ok: false, error: 'No se pudo cargar la actividad.', data: null };
  }
}
