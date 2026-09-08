import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { COURSES } from '@/lib/constants/courses';

// ═══ Qué puede hacer un alumno en el portal (blueprint 2026-09-04) ═══
//   Curso      = aprender (lecciones + drills).
//   Membresía  = entrenar y llevar registro (Let's Play, sesiones, horas, progreso).
//   Libro solo = leer el libro y hacer el quiz de nivel. Nada de registro.
// Marcelo (2026-09-08): "el que solo compró el libro no debería poder
// registrar horas de surf". Esta es la compuerta del SERVIDOR; la interfaz
// esconde lo mismo, pero lo que manda es esto.
export type StudentAccess = {
  hasCourse: boolean;
  membershipActive: boolean;
  /** Puede registrar sesiones, horas y progreso. */
  canTrack: boolean;
};

export async function getStudentAccess(studentId: string): Promise<StudentAccess> {
  const admin = createAdminClient();
  const [{ data: st }, { data: mem }] = await Promise.all([
    admin.from('students').select(COURSES.map((c) => c.accessColumn).join(', ')).eq('id', studentId).maybeSingle(),
    admin.from('memberships').select('ends_at').eq('student_id', studentId).eq('status', 'active')
      .order('ends_at', { ascending: false }).limit(1).maybeSingle(),
  ]);
  const hasCourse = !!st && COURSES.some((c) => !!(st as any)[c.accessColumn]);
  const membershipActive = !!mem?.ends_at && new Date(mem.ends_at) > new Date();
  // Un curso incluye sus drills (decisión 2026-08-27) y entrenar con drills
  // ya es registrar: el curso también abre el registro. Lo que NO lo abre es
  // el libro solo, ni una ficha creada por un lead o un regalo.
  return { hasCourse, membershipActive, canTrack: hasCourse || membershipActive };
}

export async function studentCanTrack(studentId: string): Promise<boolean> {
  return (await getStudentAccess(studentId)).canTrack;
}

export const TRACKING_LOCKED_MESSAGE = 'Training and progress tracking come with your course or membership.';
