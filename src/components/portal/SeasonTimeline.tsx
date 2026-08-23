'use client';

import { useEffect, useState } from 'react';
import { getMySeasonTimeline } from '@/lib/actions/programs';
import type { MySeasonTimeline } from '@/lib/programs/season-timeline';

// ─── Vista TEMPORADA del programa (tercer nivel de zoom, 2026-08-23) ───
// Timeline tipo Excel: una fila por microciclo con fechas reales, la matriz
// de periodización (tipo · intensidad · objetivo) y los eventos del atleta
// superpuestos (🏆 competencias · citas · 📋 evaluaciones). Tap en una fila
// salta a esa semana. Student-facing → inglés.

const MONO: React.CSSProperties = { fontFamily: 'DM Mono, monospace' };

// Colores de fase macro — mismo mapa que la tarjeta "My year" (SeasonCard).
const PHASE_STYLE: Record<string, { border: string; text: string }> = {
  general: { border: '#00A8CC', text: '#7BE4FF' },
  especifica: { border: '#00D2FF', text: '#7BE4FF' },
  precompetitiva: { border: '#FFA94D', text: '#FFC58A' },
  competitiva: { border: '#FFD166', text: '#FFD166' },
  transicion: { border: '#64748B', text: '#9aa7ad' },
  recuperacion: { border: '#39D98A', text: '#7deeb4' },
};

const fmtRange = (a: string, b: string) => {
  const f = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  return `${f(a)} – ${f(b)}`;
};

export function SeasonTimeline({ token, onJumpWeek }: {
  token: string;
  onJumpWeek: (week: number) => void;
}) {
  const [data, setData] = useState<MySeasonTimeline | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    getMySeasonTimeline(token)
      .then((r) => { if (r.ok) setData(r.data); else setFailed(true); })
      .catch(() => setFailed(true));
  }, [token]);

  if (failed) return <p className="text-[12px]" style={{ color: '#ffb4a6' }}>Could not load the season view. Pull to refresh.</p>;
  if (!data) return <p className="text-[12px]" style={{ color: '#7BA2B5' }}>Loading your season…</p>;

  return (
    <div className="space-y-3">
      {/* Banda del Plan Anual */}
      {data.season && (
        <div
          className="rounded-2xl px-4 py-3"
          style={{ background: 'linear-gradient(120deg, rgba(255,209,102,.14), rgba(0,210,255,.06))', border: '1px solid rgba(255,209,102,.4)' }}
        >
          <p className="text-[9px] uppercase tracking-wider" style={{ ...MONO, color: '#FFD166' }}>
            Season plan · {fmtRange(data.season.start, data.season.end)}
          </p>
          <p className="font-bold mt-0.5" style={{ fontFamily: 'var(--font-archivo), sans-serif', fontStretch: '125%' as any, color: '#f4f9fc', fontSize: 16 }}>
            {data.season.title}
          </p>
          {data.season.objective && (
            <p className="text-[11px] mt-0.5 italic" style={{ color: '#b8cad8' }}>{data.season.objective}</p>
          )}
        </div>
      )}

      {/* Encabezado de la grilla */}
      <div className="grid items-center px-2" style={{ gridTemplateColumns: '44px 1fr 64px' }}>
        <span className="text-[8.5px] uppercase tracking-wider" style={{ ...MONO, color: '#5f7a8c' }}>Micro</span>
        <span className="text-[8.5px] uppercase tracking-wider" style={{ ...MONO, color: '#5f7a8c' }}>Block · focus · events</span>
        <span className="text-[8.5px] uppercase tracking-wider text-right" style={{ ...MONO, color: '#5f7a8c' }}>Days</span>
      </div>

      {/* Una fila por microciclo — timeline vertical con línea al costado */}
      <div className="relative">
        <div className="absolute left-[21px] top-2 bottom-2 w-px" style={{ background: 'rgba(255,255,255,.1)' }} />
        <div className="space-y-1.5">
          {data.weeks.map((w, wi) => {
            const done = w.days_total > 0 && w.days_done >= w.days_total;
            // Header de FASE macro cuando cambia respecto de la semana
            // anterior — por ID, no por nombre (dos fases pueden llamarse igual).
            const prevPhase = wi > 0 ? data.weeks[wi - 1].phase_id : null;
            const phaseHeader = w.phase && w.phase_id !== prevPhase
              ? (PHASE_STYLE[w.phase_color_key ?? ''] ?? PHASE_STYLE.general)
              : null;
            return (
              <div key={w.week}>
                {phaseHeader && (
                  <div className="flex items-center gap-2 pl-1 pb-1.5 pt-1">
                    <span className="rounded-full" style={{ width: 8, height: 8, background: phaseHeader.border }} />
                    <span className="text-[9px] uppercase tracking-[0.16em] font-bold" style={{ ...MONO, color: phaseHeader.text }}>
                      {w.phase}
                    </span>
                    <span className="flex-1 h-px" style={{ background: `${phaseHeader.border}44` }} />
                  </div>
                )}
              <button
                type="button"
                onClick={() => onJumpWeek(w.week)}
                className="relative w-full text-left rounded-xl px-2 py-2.5 grid items-start gap-1"
                style={{
                  gridTemplateColumns: '44px 1fr 64px',
                  background: w.current ? 'rgba(255,209,102,.10)' : 'rgba(255,255,255,.04)',
                  border: w.current ? '1px solid rgba(255,209,102,.55)' : '1px solid rgba(255,255,255,.07)',
                }}
              >
                {/* Punto del timeline + numero de micro */}
                <div className="flex flex-col items-center gap-1">
                  <span
                    className="rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      ...MONO,
                      width: 26, height: 26,
                      background: w.current ? '#FFD166' : done ? 'rgba(57,217,138,.18)' : 'rgba(255,255,255,.06)',
                      color: w.current ? '#061C2B' : done ? '#39D98A' : '#7BA2B5',
                      border: done && !w.current ? '1px solid rgba(57,217,138,.4)' : '1px solid transparent',
                    }}
                  >
                    {done && !w.current ? '✓' : `M${w.week}`}
                  </span>
                  {w.current && (
                    <span className="text-[6.5px] uppercase tracking-wide font-bold" style={{ ...MONO, color: '#FFD166' }}>YOU</span>
                  )}
                </div>

                {/* Centro: fechas + matriz + eventos */}
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-wider" style={{ ...MONO, color: '#7BA2B5' }}>
                    {fmtRange(w.start, w.end)}
                  </p>
                  <p className="text-[12px] font-semibold mt-0.5 truncate" style={{ color: '#eaf4fa' }}>
                    {[w.label, w.type, w.intensity].filter(Boolean).join(' · ') || `Microcycle ${w.week}`}
                  </p>
                  {w.objective && (
                    <p className="text-[10.5px] italic truncate" style={{ color: '#8aa0b2' }}>{w.objective}</p>
                  )}
                  {w.events.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {w.events.map((e, i) => (
                        <p key={i} className="text-[10.5px] truncate" style={{ color: e.icon === '🏆' ? '#FFD166' : '#9fd7e8' }}>
                          {e.icon} {e.label}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Progreso de días */}
                <div className="text-right">
                  <p className="text-[11px] font-bold" style={{ ...MONO, color: done ? '#39D98A' : w.days_done > 0 ? '#00D2FF' : '#5f7a8c' }}>
                    {w.days_done}/{w.days_total}
                  </p>
                  <div className="mt-1 h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${w.days_total ? (w.days_done / w.days_total) * 100 : 0}%`, background: done ? '#39D98A' : '#00D2FF' }} />
                  </div>
                </div>
              </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lo que viene después del programa, dentro de la temporada */}
      {data.ahead.length > 0 && (
        <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,.04)', border: '1px dashed rgba(255,255,255,.14)' }}>
          <p className="text-[9px] uppercase tracking-wider mb-1.5" style={{ ...MONO, color: '#7BA2B5' }}>
            Also this season
          </p>
          <div className="space-y-1">
            {data.ahead.map((e, i) => (
              <p key={i} className="text-[11.5px]" style={{ color: e.icon === '🏆' ? '#FFD166' : '#b8cad8' }}>
                <span style={{ ...MONO, color: '#7BA2B5' }}>{e.date.slice(5)}</span> · {e.icon} {e.label}
              </p>
            ))}
          </div>
        </div>
      )}

      <p className="text-[9.5px]" style={{ ...MONO, color: '#4a6272' }}>
        Tap a microcycle to open that week. 🏆 competition · 📋 evaluation · ✅ done
      </p>
    </div>
  );
}
