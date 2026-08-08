// Zona horaria de El Salvador (UTC-6, sin horario de verano).
// El servidor corre en UTC (Vercel), así que "hoy" calculado con
// new Date().toISOString() se adelanta un día desde las 6 PM locales y las
// clases del día desaparecen. Usar SIEMPRE este helper para la FECHA de hoy
// en lógica de servidor (filtros, comparaciones, defaults de fecha).
// OJO: NO usar para timestamps reales (created_at, paid_at) — esos van en UTC.

const SV_OFFSET_MS = 6 * 60 * 60 * 1000;

/** Fecha de hoy (YYYY-MM-DD) en hora de El Salvador. */
export function elSalvadorToday(): string {
  return new Date(Date.now() - SV_OFFSET_MS).toISOString().slice(0, 10);
}

/** Fecha de hoy en El Salvador desplazada N días (±). */
export function elSalvadorDatePlus(days: number): string {
  return new Date(Date.now() - SV_OFFSET_MS + days * 86400000).toISOString().slice(0, 10);
}
