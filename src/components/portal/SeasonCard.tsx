'use client';

import { useEffect, useState } from 'react';
import { CalendarRange, ChevronLeft, Play, X } from 'lucide-react';
import { getMySeason, type MySeasonData } from '@/lib/actions/programs';

// ─── Season Plan (Plan Anual) en el portal del atleta ───
// Patrón autocontenido: null si el alumno no tiene temporada activa.
// Student-facing: inglés. Paleta v10 — dorado = línea Alto Rendimiento.

const MONO: React.CSSProperties = { fontFamily: 'DM Mono, monospace' };
const ARCHIVO: React.CSSProperties = { fontFamily: 'var(--font-archivo), sans-serif', fontStretch: '125%' as any };

const PHASE_STYLE: Record<string, { border: string; text: string }> = {
  general: { border: '#00A8CC', text: '#7BE4FF' },
  especifica: { border: '#00D2FF', text: '#7BE4FF' },
  competitiva: { border: '#FFD166', text: '#FFD166' },
  transicion: { border: '#64748B', text: '#9aa7ad' },
};
const EVENT_ICON: Record<string, string> = { camp: '🌊', nacional: '⭐', internacional: '🏆', otro: '📍' };
const SPECIALTY_EN: Record<string, string> = { mental: 'Mental coach', fisico: 'Physical coach', nutricion: 'Nutritionist' };

export function SeasonCard({ token, initial }: { token: string; initial?: MySeasonData | null }) {
  // `initial` viene del bundle server-side del Home: sin él, cada tarjeta
  // disparaba su server action al montar y Next las ejecuta EN FILA por
  // cliente — el Home tardaba 40-60s en completarse (reporte 2026-08-23).
  const [data, setData] = useState<MySeasonData | null>(initial ?? null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (initial !== undefined) return; // ya vino del server
    getMySeason(token)
      .then((r) => { if (r.ok) setData(r.data); })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!data) return null;

  const current = data.phases.find((f) => f.state === 'current') ?? null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-left rounded-2xl p-4"
        style={{ background: 'rgba(255,209,102,.07)', border: '1px solid rgba(255,209,102,.4)' }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider inline-flex items-center gap-1.5" style={{ ...MONO, color: '#FFD166' }}>
            <CalendarRange size={12} /> Season plan
          </span>
          {data.days_to_peak != null && (
            <span className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: '#FFD166' }}>
              {data.days_to_peak} days to peak
            </span>
          )}
        </div>
        <p className="font-bold mt-1.5" style={{ ...ARCHIVO, color: '#f4f9fc', fontSize: 17 }}>{data.title}</p>
        <p className="text-[11.5px] mt-1" style={{ color: '#b8cad8' }}>
          {current ? `Now: ${current.name}` : 'Season view'}
          {data.objective ? ` · ${data.objective}` : ''}
        </p>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto"
          style={{ background: '#061C2B', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setOpen(false)}
                className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider" style={{ ...MONO, color: '#7BA2B5' }}>
                <ChevronLeft size={13} /> Home
              </button>
              <span className="text-[9.5px] uppercase tracking-wider" style={{ ...MONO, color: '#6f8698' }}>
                Season plan
              </span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" style={{ color: '#7BA2B5' }}>
                <X size={16} />
              </button>
            </div>

            <div>
              <h2 className="font-bold" style={{ ...ARCHIVO, color: '#fff', fontSize: 22, letterSpacing: '-0.01em' }}>{data.title}</h2>
              {data.objective && <p className="text-[12px] mt-0.5" style={{ color: '#8aa0b2' }}>Goal: {data.objective}</p>}
              {data.days_to_peak != null && data.peak_name && (
                <p className="text-[11px] mt-1 font-bold" style={{ ...MONO, color: '#FFD166' }}>
                  {data.days_to_peak} DAYS TO {data.peak_name.toUpperCase()}
                </p>
              )}
            </div>

            {/* Fases */}
            {data.phases.map((f) => {
              const st = PHASE_STYLE[f.color_key] ?? PHASE_STYLE.general;
              const isNow = f.state === 'current';
              return (
                <div key={f.id} className="rounded-2xl p-3.5"
                  style={{
                    background: 'rgba(255,255,255,.05)',
                    border: `1px solid ${isNow ? st.border : 'rgba(255,255,255,.08)'}`,
                    opacity: f.state === 'done' ? 0.55 : 1,
                  }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: st.text }}>
                      {isNow ? 'Now · ' : ''}{f.name}
                    </span>
                    <span className="text-[10px]" style={{ ...MONO, color: '#7BA2B5' }}>
                      {f.start_date.slice(5)} → {f.end_date.slice(5)}
                    </span>
                  </div>
                  {f.objective && <p className="text-[11.5px] mt-1" style={{ color: '#b8cad8' }}>{f.objective}</p>}
                  {f.state === 'done' && <p className="text-[10px] mt-1" style={{ color: '#39D98A' }}>✓ done</p>}
                </div>
              );
            })}

            {/* Eventos */}
            {data.events.length > 0 && (
              <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,209,102,.07)', border: '1px solid rgba(255,209,102,.4)' }}>
                <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: '#FFD166' }}>Events</p>
                <div className="mt-2 space-y-1.5">
                  {data.events.map((ev) => (
                    <div key={ev.id} className="flex items-center justify-between gap-2">
                      <p className="text-[12.5px]" style={{ color: ev.is_peak ? '#fff' : '#b8cad8', fontWeight: ev.is_peak ? 700 : 400 }}>
                        {EVENT_ICON[ev.kind] ?? '📍'} {ev.name}{ev.is_peak ? ' — THE PEAK' : ''}
                      </p>
                      <p className="text-[11px] font-bold shrink-0" style={{ color: '#FFD166' }}>{ev.event_date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aportes de los especialistas */}
            {data.contributions.length > 0 && (
              <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}>
                <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: '#7BA2B5' }}>From your team</p>
                <div className="mt-2 space-y-2.5">
                  {data.contributions.map((c) => (
                    <div key={c.id}>
                      <div className="flex items-center gap-2">
                        {c.video_url ? <Play size={12} style={{ color: '#00D2FF' }} /> : <span style={{ fontSize: 11 }}>{c.kind === 'tarea' ? '☑' : '✎'}</span>}
                        <p className="text-[12.5px] font-semibold" style={{ color: '#eaf4fa' }}>{c.title}</p>
                      </div>
                      <p className="text-[10.5px] ml-5" style={{ color: '#8aa0b2' }}>
                        {c.specialty ? (SPECIALTY_EN[c.specialty] ?? c.specialty) : 'Coach'} {c.coach_name}
                        {c.target_date ? ` · for ${c.target_date}` : ''}
                      </p>
                      {c.detail && <p className="text-[11.5px] ml-5 mt-0.5" style={{ color: '#b8cad8' }}>{c.detail}</p>}
                      {c.video_url && (
                        <a href={c.video_url} target="_blank" rel="noopener noreferrer" className="ml-5 text-[11px]" style={{ color: '#00D2FF' }}>
                          Watch video →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[9.5px] text-center pb-4" style={{ ...MONO, color: '#4a6272' }}>
              THE SURF SEQUENCE · SEASON PLAN
            </p>
          </div>
        </div>
      )}
    </>
  );
}
