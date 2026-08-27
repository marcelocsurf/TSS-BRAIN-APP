'use server';

import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Perfil doble: una persona que es coach Y alumno.
 *
 * Ya pasa hoy con varias personas del equipo (Stanley, Melvin, Daniel Fiallos,
 * Kat, Cony). Las dos tablas se mantienen separadas a propósito —guardan cosas
 * distintas— y `students.coach_id` es lo único que las conecta, para poder
 * saltar de un portal al otro.
 *
 * Tolera que la columna todavía no exista: si la migración 00170 no se aplicó,
 * devuelve null en vez de romper el portal.
 */

export interface DualProfileLink {
  /** A qué portal lleva el botón. */
  href: string;
  /** Nombre de la otra cara de la persona. */
  name: string;
}

/** Desde el portal del ALUMNO: ¿tiene también perfil de coach? */
export async function getCoachSideForStudent(
  studentId: string
): Promise<DualProfileLink | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('students')
    .select('coach_id, coaches:coach_id(display_name, portal_token, active_status)')
    .eq('id', studentId)
    .maybeSingle();
  // La columna puede no existir todavía (migración 00170 sin aplicar).
  if (error || !data?.coach_id) return null;
  const c: any = Array.isArray((data as any).coaches)
    ? (data as any).coaches[0]
    : (data as any).coaches;
  if (!c?.portal_token || c.active_status === false) return null;
  return { href: `/coach-portal/${c.portal_token}`, name: c.display_name ?? 'Coach' };
}

/** Desde el portal del COACH: ¿tiene también perfil de alumno? */
export async function getStudentSideForCoach(
  coachId: string
): Promise<DualProfileLink | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('students')
    .select('id, first_name, last_name, portal_token')
    .eq('coach_id', coachId)
    .maybeSingle();
  if (error || !data?.portal_token) return null;
  const name = [data.first_name, data.last_name].filter(Boolean).join(' ').trim();
  return { href: `/portal/${data.portal_token}`, name: name || 'Mi progreso' };
}
