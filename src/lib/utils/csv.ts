// CSV helper compartido por las rutas de export de reportes. Incluye BOM UTF-8
// (para que Excel lea acentos/ñ) y saltos CRLF (estándar de Excel en Windows).

/** Escapa un valor para una celda CSV. */
export function csvCell(v: unknown): string {
  const s =
    v == null
      ? ''
      : Array.isArray(v)
        ? v.join('; ')
        : typeof v === 'object'
          ? JSON.stringify(v)
          : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export type CsvColumn<T> = [header: string, value: keyof T | ((row: T) => unknown)];

/** Arma un CSV completo (BOM + CRLF) desde filas + definición de columnas. */
export function buildCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map(([h]) => csvCell(h)).join(',');
  const body = rows.map((r) =>
    columns
      .map(([, k]) => csvCell(typeof k === 'function' ? (k as (row: T) => unknown)(r) : (r as Record<string, unknown>)[k as string]))
      .join(','),
  );
  // ﻿ = BOM UTF-8 para Excel.
  return '﻿' + [header, ...body].join('\r\n');
}
