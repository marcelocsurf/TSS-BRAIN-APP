'use client';

import { useEffect, useState } from 'react';
import { CalendarRange, ChevronLeft, Play, X } from 'lucide-react';
import { getMySeason, type MySeasonData } from '@/lib/actions/programs';

// ─── Season Plan (PLAN ANUAL) en el portal del atleta ───
// La visión del AÑO completo (pedido Marcelo 2026-08-23, estilo de su programa
// anual en papel): franja de 12 meses con bandas de color por fase macro,
// picos ▲, eventos, competencias, viajes y "YOU" en el hoy — y abajo cada
// fase con su objetivo y lo que cae adentro. Patrón autocontenido: null si
// el alumno no tiene temporada activa. Student-facing: inglés. Paleta v10 —
// dorado = línea Alto Rendimiento.

const MONO: React.CSSProperties = { fontFamily: 'DM Mono, monospace' };
const ARCHIVO: React.CSSProperties = { fontFamily: 'var(--font-archivo), sans-serif', fontStretch: '125%' as any };

const PHASE_STYLE: Record<string, { border: string; text: string; en: string }> = {
  general: { border: '#00A8CC', text: '#7BE4FF', en: 'General prep' },
  especifica: { border: '#00D2FF', text: '#7BE4FF', en: 'Specific prep' },
  precompetitiva: { border: '#FFA94D', text: '#FFC58A', en: 'Pre-competition' },
  competitiva: { border: '#FFD166', text: '#FFD166', en: 'Competition' },
  transicion: { border: '#64748B', text: '#9aa7ad', en: 'Transition' },
  recuperacion: { border: '#39D98A', text: '#7deeb4', en: 'Recovery' },
};
const EVENT_ICON: Record<string, string> = { camp: '🌊', nacional: '⭐', internacional: '🏆', viaje: '✈️', medico: '🩺', otro: '📍' };
const APPT_ICON: Record<string, string> = { evaluacion: '📋', fisico: '💪', mental: '🧠', tecnico: '🎯', nutricion: '🥗', otro: '📅' };
const SPECIALTY_EN: Record<string, string> = { mental: 'Mental coach', fisico: 'Physical coach', nutricion: 'Nutritionist' };

const fmtD = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

const clampPct = (n: number) => Math.max(0, Math.min(100, n));
function pctOf(date: string, startMs: number, spanMs: number): number {
  return clampPct(((Date.parse(`${date}T12:00:00Z`) - startMs) / spanMs) * 100);
}

// ─── La franja del año: bandas de fase + marcadores + YOU ───
// A nivel de módulo (regla del proyecto: componentes definidos dentro del
// render cambian de identidad y remontan el DOM).
function YearStrip({ data, mini }: { data: MySeasonData; mini?: boolean }) {
  const startMs = Date.parse(`${data.start_date}T00:00:00Z`);
  const endMs = Date.parse(`${data.end_date}T23:59:59Z`);
  const span = Math.max(1, endMs - startMs);

  // Ticks de mes: primer día de cada mes dentro del rango.
  const months: { pct: number; label: string }[] = [];
  const d0 = new Date(startMs);
  const cursor = new Date(Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth(), 1));
  for (let i = 0; i < 26; i++) {
    cursor.setUTCMonth(cursor.getUTCMonth() + (i === 0 ? 0 : 1));
    const ms = cursor.getTime();
    if (ms > endMs) break;
    if (ms >= startMs) {
      months.push({
        pct: clampPct(((ms - startMs) / span) * 100),
        label: cursor.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }).slice(0, 1),
      });
    }
  }

  const todayPct = pctOf(data.today, startMs, span);
  const H = mini ? 8 : 30;

  return (
    <div>
      {/* Marcadores arriba de la banda (solo versión completa) */}
      {!mini && (
        <div className="relative" style={{ height: 16 }}>
          {data.events.map((ev) => (
            <span key={ev.id} className="absolute -translate-x-1/2 leading-none"
              style={{ left: `${pctOf(ev.event_date, startMs, span)}%`, top: 0, fontSize: ev.is_peak ? 13 : 10 }}>
              {ev.is_peak ? '▲' : EVENT_ICON[ev.kind] ?? '📍'}
            </span>
          ))}
          {data.competitions.map((c) => (
            <span key={c.id} className="absolute -translate-x-1/2 leading-none" style={{ left: `${pctOf(c.comp_date, startMs, span)}%`, top: 2, fontSize: 10 }}>
              🏆
            </span>
          ))}
        </div>
      )}

      {/* Banda de fases */}
      <div className="relative rounded-lg overflow-hidden" style={{ height: H, background: 'rgba(255,255,255,.06)' }}>
        {data.phases.map((f) => {
          const st = PHASE_STYLE[f.color_key] ?? PHASE_STYLE.general;
          const l = pctOf(f.start_date, startMs, span);
          const r = pctOf(f.end_date, startMs, span);
          return (
            <div key={f.id} className="absolute top-0 bottom-0 flex items-center justify-center overflow-hidden"
              style={{
                left: `${l}%`, width: `${Math.max(r - l, 1.5)}%`,
                background: `${st.border}${f.state === 'done' ? '22' : '3d'}`,
                borderLeft: `2px solid ${st.border}`,
              }}>
              {!mini && (
                <span className="text-[8px] uppercase font-bold truncate px-1" style={{ ...MONO, color: st.text }}>{f.name}</span>
              )}
            </div>
          );
        })}
        {/* Rangos de eventos (viajes/camps) como subrayado dentro de la banda */}
        {!mini && data.events.filter((e) => e.end_date).map((ev) => {
          const l = pctOf(ev.event_date, startMs, span);
          const r = pctOf(ev.end_date as string, startMs, span);
          return (
            <div key={`r-${ev.id}`} className="absolute rounded-full"
              style={{ left: `${l}%`, width: `${Math.max(r - l, 1)}%`, bottom: 2, height: 3, background: '#00D2FF' }} />
          );
        })}
        {/* Hoy */}
        <div className="absolute top-0 bottom-0" style={{ left: `${todayPct}%`, width: 2, background: '#FFD166' }} />
      </div>

      {/* YOU + meses */}
      {!mini && (
        <div className="relative" style={{ height: 14 }}>
          <span className="absolute -translate-x-1/2 text-[7px] font-bold uppercase" style={{ ...MONO, left: `${todayPct}%`, color: '#FFD166' }}>
            YOU
          </span>
          {months.map((m, i) => (
            // El mes pegado al marcador YOU se omite para que no se encimen.
            Math.abs(m.pct - todayPct) > 3 && (
              <span key={i} className="absolute text-[7.5px] uppercase" style={{ ...MONO, left: `${m.pct}%`, color: '#5f7a8c' }}>
                {m.label}
              </span>
            )
          ))}
        </div>
      )}
    </div>
  );
}

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

  // "The road": todo el año en una sola línea de tiempo — eventos del plan,
  // competencias y citas, ordenado por fecha. Lo pasado queda atenuado.
  type RoadItem = { key: string; icon: string; label: string; date: string; end?: string | null; gold?: boolean };
  const road: RoadItem[] = [
    ...data.events.map((ev) => ({
      key: `e${ev.id}`,
      icon: ev.is_peak ? '▲' : EVENT_ICON[ev.kind] ?? '📍',
      label: ev.name + (ev.is_peak ? ' — THE PEAK' : '') + (ev.notes ? ` · ${ev.notes}` : ''),
      date: ev.event_date, end: ev.end_date, gold: ev.is_peak,
    })),
    ...data.competitions.map((c) => ({
      key: `c${c.id}`, icon: '🏆',
      label: c.name + (c.location ? ` · ${c.location}` : ''),
      date: c.comp_date, gold: true,
    })),
    ...data.appointments.map((a, i) => ({
      key: `a${i}`, icon: APPT_ICON[a.kind] ?? '📅',
      label: a.title || (a.kind === 'evaluacion' ? 'Evaluation' : 'Appointment'),
      date: a.appointment_date,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));

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
            <CalendarRange size={12} /> My year
          </span>
          {data.days_to_peak != null && (
            <span className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: '#FFD166' }}>
              {data.days_to_peak} days to peak
            </span>
          )}
        </div>
        <p className="font-bold mt-1.5" style={{ ...ARCHIVO, color: '#f4f9fc', fontSize: 17 }}>{data.title}</p>
        {/* Mini franja del año — la visión completa a un vistazo */}
        {data.phases.length > 0 && <div className="mt-2"><YearStrip data={data} mini /></div>}
        <p className="text-[11.5px] mt-1.5" style={{ color: '#b8cad8' }}>
          {current ? `Now: ${current.name}` : 'See your whole year →'}
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
                My year
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

            {/* LA FRANJA DEL AÑO */}
            {data.phases.length > 0 && (
              <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)' }}>
                <p className="text-[9px] uppercase tracking-wider mb-1" style={{ ...MONO, color: '#7BA2B5' }}>
                  {fmtD(data.start_date)} → {fmtD(data.end_date)}
                </p>
                <YearStrip data={data} />
                <p className="text-[8.5px] mt-1" style={{ ...MONO, color: '#4a6272' }}>
                  ▲ peak · 🏆 competition · ✈️ trip · — travel/camp span
                </p>
              </div>
            )}

            {/* Fases con su objetivo y lo que cae adentro */}
            {data.phases.map((f) => {
              const st = PHASE_STYLE[f.color_key] ?? PHASE_STYLE.general;
              const isNow = f.state === 'current';
              const inside = road.filter((it) => it.date >= f.start_date && it.date <= f.end_date);
              return (
                <div key={f.id} className="rounded-2xl p-3.5"
                  style={{
                    background: 'rgba(255,255,255,.05)',
                    border: `1px solid ${isNow ? st.border : 'rgba(255,255,255,.08)'}`,
                    borderLeft: `3px solid ${st.border}`,
                    opacity: f.state === 'done' ? 0.55 : 1,
                  }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold" style={{ ...MONO, color: st.text }}>
                      {isNow ? 'Now · ' : ''}{f.name}
                    </span>
                    <span className="text-[10px]" style={{ ...MONO, color: '#7BA2B5' }}>
                      {fmtD(f.start_date)} → {fmtD(f.end_date)}
                    </span>
                  </div>
                  {f.objective && <p className="text-[11.5px] mt-1" style={{ color: '#b8cad8' }}>{f.objective}</p>}
                  {inside.length > 0 && (
                    <div className="mt-1.5 space-y-0.5">
                      {inside.slice(0, 6).map((it) => (
                        <p key={it.key} className="text-[10.5px] truncate" style={{ color: it.gold ? '#FFD166' : '#9fd7e8' }}>
                          {it.icon} {it.label} · {fmtD(it.date)}{it.end ? ` → ${fmtD(it.end)}` : ''}
                        </p>
                      ))}
                      {inside.length > 6 && <p className="text-[10px]" style={{ color: '#5f7a8c' }}>+{inside.length - 6} more</p>}
                    </div>
                  )}
                  {f.state === 'done' && <p className="text-[10px] mt-1" style={{ color: '#39D98A' }}>✓ done</p>}
                </div>
              );
            })}

            {/* El camino: todo el año fecha por fecha */}
            {road.length > 0 && (
              <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,209,102,.07)', border: '1px solid rgba(255,209,102,.4)' }}>
                <p className="text-[10px] uppercase tracking-wider" style={{ ...MONO, color: '#FFD166' }}>The road</p>
                <div className="mt-2 space-y-1.5">
                  {road.map((it) => {
                    const past = (it.end ?? it.date) < data.today;
                    return (
                      <div key={it.key} className="flex items-center justify-between gap-2" style={{ opacity: past ? 0.45 : 1 }}>
                        <p className="text-[12.5px] min-w-0 truncate" style={{ color: it.gold ? '#fff' : '#b8cad8', fontWeight: it.gold ? 700 : 400 }}>
                          {past ? '✓ ' : ''}{it.icon} {it.label}
                        </p>
                        <p className="text-[11px] font-bold shrink-0" style={{ ...MONO, color: it.gold ? '#FFD166' : '#7BA2B5' }}>
                          {fmtD(it.date)}{it.end ? ` → ${fmtD(it.end)}` : ''}
                        </p>
                      </div>
                    );
                  })}
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
