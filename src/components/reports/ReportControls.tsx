'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

// Controles de reporte: rango de fechas (from/to), granularidad opcional
// (semana/mes) y export CSV. Escribe todo en la URL (?from=&to=&granularity=)
// para que la página server Y el <a> de export lean los mismos parámetros.

export function ReportControls({
  granularity = false,
  segments,
  exportHref,
}: {
  granularity?: boolean;
  /** control segmentado genérico (ej. agrupar por servicio/plantilla/semana). */
  segments?: { param: string; label: string; default: string; options: { value: string; label: string }[] };
  /** base del export; se le agrega el querystring actual. */
  exportHref?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = useTransition();

  const from = sp.get('from') ?? '';
  const to = sp.get('to') ?? '';
  const gran = sp.get('granularity') ?? 'week';

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    start(() => router.push(`${pathname}?${next.toString()}`));
  };

  const exportUrl = exportHref ? `${exportHref}?${sp.toString()}` : null;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wider text-gray-400" style={{ fontFamily: 'var(--font-mono)' }}>Desde</span>
        <input
          type="date"
          value={from}
          onChange={(e) => update({ from: e.target.value })}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wider text-gray-400" style={{ fontFamily: 'var(--font-mono)' }}>Hasta</span>
        <input
          type="date"
          value={to}
          onChange={(e) => update({ to: e.target.value })}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white"
        />
      </label>

      {granularity && (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-gray-400" style={{ fontFamily: 'var(--font-mono)' }}>Agrupar</span>
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            {(['week', 'month'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => update({ granularity: g })}
                className={`px-3 py-2 text-sm ${gran === g ? 'bg-[var(--tss-navy)] text-white' : 'bg-white text-gray-600'}`}
              >
                {g === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
        </div>
      )}

      {segments && (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-gray-400" style={{ fontFamily: 'var(--font-mono)' }}>{segments.label}</span>
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            {segments.options.map((o) => {
              const current = sp.get(segments.param) ?? segments.default;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => update({ [segments.param]: o.value })}
                  className={`px-3 py-2 text-sm ${current === o.value ? 'bg-[var(--tss-navy)] text-white' : 'bg-white text-gray-600'}`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex-1" />
      {pending && <span className="text-[11px] text-gray-400 self-center">Actualizando…</span>}
      {exportUrl && (
        <a
          href={exportUrl}
          className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-[var(--tss-navy)] bg-white hover:bg-gray-50"
        >
          ⬇ Export CSV
        </a>
      )}
    </div>
  );
}
