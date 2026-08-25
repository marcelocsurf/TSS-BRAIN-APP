'use client';

import { useState } from 'react';

// Botón "copiar para WhatsApp" — el texto viene armado del server component.
export function CopyTextButton({ text, label }: { text: string; label: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setOk(true);
          setTimeout(() => setOk(false), 2500);
        } catch {
          // Safari viejo sin clipboard API: fallback con textarea temporal.
          const ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          setOk(true);
          setTimeout(() => setOk(false), 2500);
        }
      }}
      className="shrink-0 text-[10px] font-bold rounded-full px-3 py-1.5 border transition-colors"
      style={ok
        ? { background: 'rgba(6,214,160,.15)', color: '#047857', borderColor: 'rgba(6,214,160,.4)' }
        : { background: '#fff', color: '#0090B0', borderColor: 'rgba(0,144,176,.35)' }}
    >
      {ok ? '✓ Copiado' : label}
    </button>
  );
}
