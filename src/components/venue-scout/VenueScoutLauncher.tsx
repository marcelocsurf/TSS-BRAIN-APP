'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapPin, X } from 'lucide-react';

// Opens the standalone Venue Scout tool (public/venue-scout/index.html) in a
// full-screen in-app overlay. Pure tool — it keeps its own state on the device
// (localStorage); nothing is saved server-side. Used by coach + athlete.
/** Lo que el Venue Check manda de vuelta al portal (postMessage, mismo origen). */
export type VenueCheckResult = {
  summary: { spot: string; wave: string | null; tide: string | null; wind: string | null; level: string | null; items: string[] };
  /** Contenido SVG del mapa (viewBox 0 0 100 100). */
  svg: string;
};

export function VenueScoutLauncher({ variant = 'light', belt, ocean, openDirect, onVenueCheck, title, subtitle }: {
  variant?: 'light' | 'dark';
  /** Cinta del alumno: el Venue Check muestra el consejo de seguridad por nivel (Marcelo 2026-09-17). */
  belt?: string | null;
  ocean?: string | null;
  /** Abrir esa herramienta directo, sin el selector (Let's Play → Venue Check). */
  openDirect?: 'check';
  /** Venue Check terminado: el plan con el mapa vuelve al que lo abrió (Marcelo 2026-09-17). */
  onVenueCheck?: (r: VenueCheckResult) => void;
  title?: string;
  subtitle?: string;
}) {
  const lvl = belt ? `&belt=${encodeURIComponent(belt)}${ocean ? `&ocean=${encodeURIComponent(ocean)}` : ''}` : '';
  // null = closed · 'check' = Venue Check sencillo · 'scout' = análisis
  // avanzado (entreno O competencia: el tool pregunta el objetivo ADENTRO —
  // el modo por URL solo distingue 'game', verificado 2026-09-01: tener dos
  // opciones acá era una duplicidad que confundía) · 'game' = Lineup Game.
  const [open, setOpen] = useState<null | 'check' | 'scout' | 'game'>(null);
  const [chooser, setChooser] = useState(false);
  const dark = variant === 'dark';
  // La URL del iframe se fija al abrir: si cambiara en cada render (Date.now()),
  // cualquier estado nuevo del padre recargaría la herramienta y el alumno
  // perdería la pantalla del resumen (bug visto 2026-09-17).
  const iframeSrc = useMemo(() => {
    if (!open) return '';
    const v = Date.now();
    return open === 'check' ? `/venue-check/index.html?src=portal${lvl}&v=${v}` : `/venue-scout/index.html?mode=${open === 'game' ? 'game' : 'free'}&src=portal&v=${v}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  // El Venue Check avisa por postMessage (mismo origen). done=true = "Back to your plan".
  useEffect(() => {
    if (!onVenueCheck) return;
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data;
      if (!d || d.type !== 'tss-venue-check' || !d.summary || typeof d.svg !== 'string') return;
      onVenueCheck({ summary: d.summary, svg: d.svg });
      if (d.done) setOpen(null);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [onVenueCheck]);

  return (
    <>
      <button
        type="button"
        onClick={() => (openDirect ? setOpen(openDirect) : setChooser(true))}
        className={`w-full text-left rounded-lg p-4 flex items-center gap-3 ${
          dark
            ? 'border border-white/10 hover:border-[var(--tss-cyan)]/40 transition-colors'
            : 'bg-[#E9E2D2] border border-[#DCD7C6] shadow-sm hover:shadow-md transition-shadow'
        }`}
        style={dark ? { background: '#0A2532' } : undefined}
      >
        <div
          className="w-10 h-10 rounded-[5px] flex items-center justify-center shrink-0"
          style={{ background: dark ? 'rgba(90,195,231,.15)' : 'var(--tss-navy)' }}
        >
          <MapPin size={18} strokeWidth={1.75} className={dark ? 'text-[var(--tss-cyan)]' : 'text-white'} />
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-[var(--tss-navy)]'}`}>{title ?? 'Venue Scout'}</p>
          <p className={`text-[11px] leading-snug ${dark ? 'text-white/50' : 'text-gray-500'}`}>
            {subtitle ?? 'Analyze a spot — waves, hazards, currents, tactical plan.'}
          </p>
        </div>
      </button>

      {chooser && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-5" onClick={() => setChooser(false)}>
          <div className="w-full max-w-sm rounded-lg p-5 space-y-3" style={{ background: '#061C2B' }} onClick={(e) => e.stopPropagation()}>
            <p className="text-[11px] font-mono uppercase tracking-[0.16em] text-[#00D2FF]">What are you here for?</p>
            <button type="button" onClick={() => { setChooser(false); setOpen('check'); }}
              className="w-full text-left rounded-lg p-4 border border-white/10 hover:border-[#00D2FF]/50">
              <p className="text-[15px] font-bold text-white">🌊 Venue Check · simple</p>
              <p className="text-[12px] text-white/50 mt-0.5">For beginners and intermediates — entry/exit, currents, peaks and your zone. All drawn on the map.</p>
            </button>
            <button type="button" onClick={() => { setChooser(false); setOpen('scout'); }}
              className="w-full text-left rounded-lg p-4 border border-white/10 hover:border-[#00D2FF]/50">
              <p className="text-[15px] font-bold text-white">🏄 Advanced analysis — training or competition</p>
              <p className="text-[12px] text-white/50 mt-0.5">Wave count, ideal zone, hazards and the tactical plan — the tool asks your goal once you're in.</p>
            </button>
            <button type="button" onClick={() => { setChooser(false); setOpen('game'); }}
              className="w-full text-left rounded-lg p-4 border border-white/10 hover:border-[#FFD166]/60">
              <p className="text-[15px] font-bold text-white">🎮 Lineup Game <span className="text-[11px] font-mono uppercase tracking-widest text-[#FFD166] ml-1">code</span></p>
              <p className="text-[12px] text-white/50 mt-0.5">Positioning game: athletes choose where to sit, the coach marks the real waves. ISA priority.</p>
            </button>
            <button type="button" onClick={() => setChooser(false)} className="w-full py-2 text-[12px] text-white/40">Cancel</button>
          </div>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-[#0A2532] flex flex-col"
          style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <button
            type="button"
            onClick={() => setOpen(null)}
            className="absolute right-3 z-[110] inline-flex items-center gap-1 rounded-lg bg-black/70 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur border border-white/20"
            style={{ top: 'calc(env(safe-area-inset-top) + 4.5rem)' }}
            aria-label="Cerrar"
          >
            <X size={15} /> Close
          </button>
          <iframe src={iframeSrc} title="Venue tool" className="flex-1 w-full h-full border-0" />
        </div>
      )}
    </>
  );
}
