'use client';

import { useState } from 'react';
import { MapPin, X } from 'lucide-react';

// Opens the standalone Venue Scout tool (public/venue-scout/index.html) in a
// full-screen in-app overlay. Pure tool — it keeps its own state on the device
// (localStorage); nothing is saved server-side. Used by coach + athlete.
export function VenueScoutLauncher({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  // null = closed · 'check' = free-session Venue Check · 'scout' = competition
  const [open, setOpen] = useState<null | 'check' | 'train' | 'comp'>(null);
  const [chooser, setChooser] = useState(false);
  const dark = variant === 'dark';

  return (
    <>
      <button
        type="button"
        onClick={() => setChooser(true)}
        className={`w-full text-left rounded-2xl p-4 flex items-center gap-3 ${
          dark
            ? 'border border-white/10 hover:border-[var(--tss-cyan)]/40 transition-colors'
            : 'bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow'
        }`}
        style={dark ? { background: '#0F1E33' } : undefined}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: dark ? 'rgba(90,195,231,.15)' : 'var(--tss-navy)' }}
        >
          <MapPin size={18} strokeWidth={1.75} className={dark ? 'text-[var(--tss-cyan)]' : 'text-white'} />
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-[var(--tss-navy)]'}`}>Venue Scout</p>
          <p className={`text-[11px] leading-snug ${dark ? 'text-white/50' : 'text-gray-500'}`}>
            Analyze a spot — waves, hazards, currents, tactical plan.
          </p>
        </div>
      </button>

      {chooser && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-5" onClick={() => setChooser(false)}>
          <div className="w-full max-w-sm rounded-3xl p-5 space-y-3" style={{ background: '#061C2B' }} onClick={(e) => e.stopPropagation()}>
            <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#00D2FF]">¿Qué vas a hacer?</p>
            <button type="button" onClick={() => { setChooser(false); setOpen('check'); }}
              className="w-full text-left rounded-2xl p-4 border border-white/10 hover:border-[#00D2FF]/50">
              <p className="text-[15px] font-bold text-white">🌊 Venue Check · sencillo</p>
              <p className="text-[12px] text-white/50 mt-0.5">Para novatos e intermedios — entrada/salida, corrientes, picos y tu zona. Todo se dibuja en el mapa.</p>
            </button>
            <button type="button" onClick={() => { setChooser(false); setOpen('train'); }}
              className="w-full text-left rounded-2xl p-4 border border-white/10 hover:border-[#00D2FF]/50">
              <p className="text-[15px] font-bold text-white">🏄 Sesión de entreno</p>
              <p className="text-[12px] text-white/50 mt-0.5">Análisis avanzado — conteo de olas buenas, zona ideal, hazards con reporte completo.</p>
            </button>
            <button type="button" onClick={() => { setChooser(false); setOpen('comp'); }}
              className="w-full text-left rounded-2xl p-4 border border-white/10 hover:border-[#00D2FF]/50">
              <p className="text-[15px] font-bold text-white">🏁 Competencia</p>
              <p className="text-[12px] text-white/50 mt-0.5">Plan táctico del heat — observación, simulación y estrategia por zonas.</p>
            </button>
            <button type="button" onClick={() => setChooser(false)} className="w-full py-2 text-[12px] text-white/40">Cancelar</button>
          </div>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-[#0A1628] flex flex-col"
          style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <button
            type="button"
            onClick={() => setOpen(null)}
            className="absolute right-3 z-[110] inline-flex items-center gap-1 rounded-lg bg-black/70 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur border border-white/20"
            style={{ top: 'calc(env(safe-area-inset-top) + 4.5rem)' }}
            aria-label="Cerrar"
          >
            <X size={15} /> Cerrar
          </button>
          <iframe
            src={open === 'check' ? `/venue-check/index.html?v=${Date.now()}` : `/venue-scout/index.html?mode=${open === 'train' ? 'free' : 'comp'}&v=${Date.now()}`}
            title="Venue tool" className="flex-1 w-full h-full border-0" />
        </div>
      )}
    </>
  );
}
