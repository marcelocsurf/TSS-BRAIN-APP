'use client';

import { useState } from 'react';
import { Wind } from 'lucide-react';
import { BreathingGuide } from './BreathingGuide';

// Launcher card (matches the other Tools cards) → opens the full-screen guide.
export function BreathingLauncher({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const [open, setOpen] = useState(false);
  const dark = variant === 'dark';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`w-full text-left rounded-2xl p-4 flex items-center gap-3 ${
          dark
            ? 'border border-white/10 hover:border-[var(--tss-cyan)]/40 transition-colors'
            : 'bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow'
        }`}
        style={dark ? { background: '#0F1E33' } : undefined}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: dark ? 'rgba(90,195,231,.15)' : 'var(--tss-navy)' }}>
          <Wind size={18} strokeWidth={1.75} className={dark ? 'text-[var(--tss-cyan)]' : 'text-white'} />
        </div>
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-[var(--tss-navy)]'}`}>Respiración guiada</p>
          <p className={`text-[11px] leading-snug ${dark ? 'text-white/50' : 'text-gray-500'}`}>
            Box breathing, 4-7-8, coherente y breath of fire — con visual y sonido.
          </p>
        </div>
      </button>

      {open && <BreathingGuide onClose={() => setOpen(false)} />}
    </>
  );
}
