'use client';

import { useState } from 'react';
import { MapPin, X } from 'lucide-react';

// Opens the standalone Venue Scout tool (public/venue-scout/index.html) in a
// full-screen in-app overlay. Pure tool — it keeps its own state on the device
// (localStorage); nothing is saved server-side. Used by coach + athlete.
export function VenueScoutLauncher({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const [open, setOpen] = useState(false);
  const dark = variant === 'dark';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full text-left rounded-2xl p-4 flex items-center gap-3 border transition-colors ${
          dark
            ? 'border-white/10 hover:border-[var(--tss-cyan)]/40'
            : 'border-gray-100 bg-white hover:border-[var(--tss-cyan,#5AC3E7)]/50 shadow-sm'
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
            Analizá un spot — olas, hazards, corrientes, plan táctico.
          </p>
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-[#0A1628] flex flex-col"
          style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-3 z-[110] inline-flex items-center gap-1 rounded-lg bg-black/70 px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur"
            style={{ top: 'calc(env(safe-area-inset-top) + 0.5rem)' }}
            aria-label="Cerrar"
          >
            <X size={15} /> Cerrar
          </button>
          <iframe src="/venue-scout/index.html" title="Venue Scout" className="flex-1 w-full h-full border-0" />
        </div>
      )}
    </>
  );
}
