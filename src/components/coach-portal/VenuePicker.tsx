'use client';

// ═══ Un solo selector de spot para todo el portal del coach ═══
// La misma lista (SURF_SPOT_OPTIONS) en el planner del día, en la vista de
// semana y en cualquier otro lugar donde se elija playa. "Other…" abre un
// texto libre; un valor guardado que no está en la lista se trata como
// personalizado. Antes la semana era texto libre y el día un desplegable:
// "el zonte" y "El Zonte Punta" no se reconocían (Marcelo 2026-09-19).

import { useEffect, useState } from 'react';
import { SURF_SPOT_OPTIONS } from '@/lib/constants/brand';

export function VenuePicker({ value, onChange, disabled = false, compact = false }: { value: string | null; onChange: (v: string | null) => void; disabled?: boolean; compact?: boolean }) {
  const known = (SURF_SPOT_OPTIONS as readonly string[]).includes(value ?? '');
  const [custom, setCustom] = useState(!!value && !known);
  const [text, setText] = useState(value && !known ? value : '');
  useEffect(() => {
    const isKnown = (SURF_SPOT_OPTIONS as readonly string[]).includes(value ?? '');
    setCustom(!!value && !isKnown);
    setText(value && !isKnown ? value : '');
  }, [value]);
  const pad = compact ? 'px-2 py-1.5' : 'px-3 py-2';

  return (
    <div className="space-y-1.5 w-full">
      <select
        value={custom ? '__other__' : (value ?? '')}
        disabled={disabled}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '__other__') { setCustom(true); onChange(text || null); }
          else { setCustom(false); onChange(v || null); }
        }}
        className={`w-full text-sm ${pad} rounded-lg border border-[#DCD7C6] bg-[#F7F9FA] focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan,#5AC3E7)] disabled:opacity-70`}
      >
        <option value="">—</option>
        {SURF_SPOT_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
        <option value="__other__">Other…</option>
      </select>
      {custom && (
        <input
          type="text"
          value={text}
          disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => onChange(text.trim() || null)}
          placeholder="Type the spot"
          className={`w-full text-sm ${pad} rounded-lg border border-[#DCD7C6] focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan,#5AC3E7)] disabled:opacity-70`}
        />
      )}
    </div>
  );
}
