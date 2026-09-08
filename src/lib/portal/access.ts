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
  membershipEndsAt: string | null;
  /** Puede registrar sesiones, horas y progreso (= membresía vigente). */
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
  // Marcelo (2026-09-08): el curso es para siempre (lecciones + drills para
  // ver), pero Let's Play, el registro y el progreso son MEMBRESÍA. El curso
  // trae 12 meses incluidos (grantCourseToStudent); después se renueva a $99/año.
  return { hasCourse, membershipActive, membershipEndsAt: mem?.ends_at ?? null, canTrack: membershipActive };
}

export async function studentCanTrack(studentId: string): Promise<boolean> {
  return (await getStudentAccess(studentId)).canTrack;
}

export const TRACKING_LOCKED_MESSAGE = "Let's Play and progress tracking come with your training membership. Renew it to keep training.";
