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
        <span className="text-[10px] uppercase tracking-wider text-[#55666E]" style={{ fontFamily: 'var(--font-mono)' }}>Desde</span>
        <input
          type="date"
          value={from}
          onChange={(e) => update({ from: e.target.value })}
          className="px-3 py-2 border border-[#DCD7C6] rounded-[5px] text-sm bg-[#F7F9FA]"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wider text-[#55666E]" style={{ fontFamily: 'var(--font-mono)' }}>Hasta</span>
        <input
          type="date"
          value={to}
          onChange={(e) => update({ to: e.target.value })}
          className="px-3 py-2 border border-[#DCD7C6] rounded-[5px] text-sm bg-[#F7F9FA]"
        />
      </label>

      {granularity && (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-[#55666E]" style={{ fontFamily: 'var(--font-mono)' }}>Agrupar</span>
          <div className="flex rounded-[5px] border border-[#DCD7C6] overflow-hidden">
            {(['week', 'month'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => update({ granularity: g })}
                className={`px-3 py-2 text-sm ${gran === g ? 'bg-[var(--tss-navy)] text-white' : 'bg-[#F7F9FA] text-[#55666E]'}`}
              >
                {g === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
        </div>
      )}

      {segments && (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-[#55666E]" style={{ fontFamily: 'var(--font-mono)' }}>{segments.label}</span>
          <div className="flex rounded-[5px] border border-[#DCD7C6] overflow-hidden">
            {segments.options.map((o) => {
              const current = sp.get(segments.param) ?? segments.default;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => update({ [segments.param]: o.value })}
                  className={`px-3 py-2 text-sm ${current === o.value ? 'bg-[var(--tss-navy)] text-white' : 'bg-[#F7F9FA] text-[#55666E]'}`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex-1" />
      {pending && <span className="text-[11px] text-[#55666E] self-center">Actualizando…</span>}
      {exportUrl && (
        <a
          href={exportUrl}
          className="px-4 py-2 rounded-[5px] text-sm font-semibold border border-[#DCD7C6] text-[var(--tss-navy)] bg-[#F7F9FA] hover:bg-[#F7F9FA]"
        >
          ⬇ Export CSV
        </a>
      )}
    </div>
  );
}
