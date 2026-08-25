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

// ── Bucketing de reportes ────────────────────────────────────────
// Los timestamps reales (paid_at, reserved_at, created_at, submitted_at) se
// guardan en UTC. Para agrupar por semana/mes hay que convertirlos ANTES a la
// fecha local de El Salvador, o los buckets cercanos a medianoche caen en el
// período equivocado. Estos helpers hacen esa conversión una sola vez.

/** Convierte un timestamp UTC (ISO string o Date) a la FECHA local SV (YYYY-MM-DD). */
export function toElSalvadorDate(tsUtc: string | Date | null | undefined): string | null {
  if (!tsUtc) return null;
  const ms = typeof tsUtc === 'string' ? Date.parse(tsUtc) : tsUtc.getTime();
  if (Number.isNaN(ms)) return null;
  return new Date(ms - SV_OFFSET_MS).toISOString().slice(0, 10);
}

/** Clave de mes (YYYY-MM) en hora de El Salvador para un timestamp UTC. */
export function monthKey(tsUtc: string | Date | null | undefined): string | null {
  const d = toElSalvadorDate(tsUtc);
  return d ? d.slice(0, 7) : null;
}

/** Clave de semana = lunes (YYYY-MM-DD) de la semana local SV que contiene el timestamp. */
export function weekKey(tsUtc: string | Date | null | undefined): string | null {
  const day = toElSalvadorDate(tsUtc);
  if (!day) return null;
  const d = new Date(day + 'T00:00:00Z');
  const dow = d.getUTCDay(); // 0=Dom..6=Sáb
  const diff = dow === 0 ? -6 : 1 - dow; // retroceder al lunes
  d.setUTCDate(d.getUTCDate() + diff);
  return d.toISOString().slice(0, 10);
}

/** Hora local de El Salvador ahora mismo, en formato HH:MM (24 h). */
export function elSalvadorNowHM(): string {
  return new Date(Date.now() - SV_OFFSET_MS).toISOString().slice(11, 16);
}
