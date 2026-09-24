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

// ═══ DESDE CUÁNDO SE EXIGE CERRAR TODOS LOS DÍAS ═══
// La regla "no se finaliza un camp con días sin cerrar" (Marcelo 2026-08-28)
// arranca de hoy en adelante. Lo de atrás fue temporada de pruebas: aplicarla
// al pasado dejaba 19 camps viejos pidiendo cierres que nadie va a hacer, y
// un aviso que nadie puede completar se vuelve ruido y se ignora.
//
// Los camps anteriores siguen exactamente como estaban: se finalizan igual
// que antes, sin este candado.
export const CIERRE_DE_DIAS_OBLIGATORIO_DESDE = '2026-08-28';

/** ¿A este camp le corresponde el candado de cerrar todos los días? */
export function exigeCierreDeDias(startDate: string | null | undefined): boolean {
  return !!startDate && startDate >= CIERRE_DE_DIAS_OBLIGATORIO_DESDE;
}

// ═══ Estadía del campista: camp corto y salida anticipada ═══
// Pedido de Rick por Marcelo (2026-09-24): inscribir a alguien por 3 o 4 días
// de un camp de 6, y poder alargarlo un día si decide quedarse.
//
// Dos fechas, y el orden importa:
//   planned_departure — el último día CONTRATADO. Se fija al inscribir o desde
//                       la ficha del camp. Alargar = moverla hacia adelante.
//   departed_on       — el día que REALMENTE se fue, con finalized_at. Es un
//                       hecho consumado, así que manda sobre el plan.
// Null en las dos = hace el camp completo, que es el caso normal.
//
// NO hay fecha de llegada: hoy "camp corto" significa empieza el día 1 y
// termina antes. Si algún día hace falta que alguien ENTRE a mitad de camp,
// se agrega acá y los sitios que llaman a esta función no cambian.

export interface ParticipantStay {
  planned_departure?: string | null;
  departed_on?: string | null;
  finalized_at?: string | null;
}

/** El último día que el campista cuenta como presente, o null si hace el camp
 *  completo. Si hay plan y hecho, gana el más temprano: nadie está después de
 *  haberse ido, y nadie está después de lo que contrató. */
export function participantLastDay(p: ParticipantStay): string | null {
  const real =
    p.departed_on ||
    // Sin fecha explícita, el cierre anticipado marca el día: se resta la
    // diferencia horaria para no correrlo al día siguiente.
    (p.finalized_at ? new Date(Date.parse(p.finalized_at) - 6 * 3600000).toISOString().slice(0, 10) : null);
  const days = [p.planned_departure, real].filter(Boolean) as string[];
  return days.length ? days.sort()[0] : null;
}

/** ¿Está este campista el día que se está mostrando? `dayISO` es AAAA-MM-DD.
 *  Los días hasta su salida — la incluida — quedan intactos: el historial de
 *  lo que sí hizo no se toca. */
export function participantPresentOn(p: ParticipantStay, dayISO: string | null | undefined): boolean {
  if (!dayISO) return true;
  const last = participantLastDay(p);
  return !last || dayISO <= last;
}

/** Cuántos días contrató, contra la ventana del camp. Para la ficha: "3 de 6". */
export function stayLength(p: ParticipantStay, campStart: string, campEnd: string): { days: number; total: number } | null {
  const day = (iso: string) => Math.floor(Date.parse(`${iso}T00:00:00Z`) / 86400000);
  const total = day(campEnd) - day(campStart) + 1;
  if (total < 1) return null;
  const last = participantLastDay(p);
  const days = last && last < campEnd ? Math.max(1, day(last) - day(campStart) + 1) : total;
  return { days, total };
}
