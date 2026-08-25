// ═══ VENTANA DE INSCRIPCIÓN DE UN CAMP ═══
// Regla de Marcelo (2026-08-25): "cuando un camp ya inició ya no se puede
// inscribir gente — se cierra al iniciar el camp". Un camp es una SECUENCIA:
// el día 2 se para sobre el día 1. Quien entra a mitad ni aprende bien ni se
// puede evaluar, y le rompe el ritmo al grupo.
//
// Fuente única: la usan el QR público, el vendedor, el mostrador y el
// dashboard. Si algún día se relaja la regla, se toca ACÁ y nada más.

import { elSalvadorToday, elSalvadorNowHM } from './tz';

export interface CampWindow {
  start_date?: string | null;
  end_date?: string | null;
  scheduled_time?: string | null;
}

/** ¿Es un servicio de varios días (camp) y no una clase suelta? */
export function isMultiDay(c: CampWindow): boolean {
  return !!c.start_date && !!c.end_date && c.end_date > c.start_date;
}

/**
 * ¿La inscripción a este camp ya está cerrada porque el camp arrancó?
 *
 * OJO — solo aplica a servicios de VARIOS DÍAS. Una clase de un día se
 * inscribe el mismo día (el alumno escanea el QR al llegar, a veces con la
 * clase ya empezada): ahí el cierre lo maneja el estado del servicio, no esto.
 *
 * El día 1 queda abierto HASTA la hora de encuentro — quien llega a las 7:30
 * a un camp que arranca a las 8:00 todavía entra; a las 8:01 ya no.
 * Sin hora de encuentro cargada, el día 1 entero queda abierto.
 */
export function campEnrollmentClosed(c: CampWindow): boolean {
  if (!isMultiDay(c)) return false;
  const today = elSalvadorToday();
  const start = c.start_date as string;
  if (start < today) return true;    // arrancó ayer o antes
  if (start > today) return false;   // todavía no arranca
  const t = (c.scheduled_time ?? '').slice(0, 5);
  if (!t) return false;              // sin hora: el día 1 sigue abierto
  return elSalvadorNowHM() >= t;
}

/** Día en curso del camp (1-based) — para decir "va en el día 3 de 6". */
export function campDayProgress(c: CampWindow): { day: number; total: number } | null {
  if (!isMultiDay(c)) return null;
  const ms = 86400000;
  const s = Date.parse(`${c.start_date}T00:00:00Z`);
  const e = Date.parse(`${c.end_date}T00:00:00Z`);
  const n = Date.parse(`${elSalvadorToday()}T00:00:00Z`);
  const total = Math.round((e - s) / ms) + 1;
  const day = Math.round((n - s) / ms) + 1;
  if (day < 1 || day > total) return null;
  return { day, total };
}

/** Aviso en español para el equipo (mostrador, vendedor, coordinación). */
export function campClosedNoticeES(c: CampWindow): string {
  const p = campDayProgress(c);
  return p
    ? `Este camp ya arrancó (día ${p.day} de ${p.total}) — la inscripción se cierra al iniciar.`
    : 'Este camp ya arrancó — la inscripción se cierra al iniciar.';
}

/** Aviso en inglés para el alumno (QR público, portal). */
export function campClosedNoticeEN(): string {
  return 'This camp has already started — sign-ups close when the camp begins. Ask at the front desk about the next one.';
}
