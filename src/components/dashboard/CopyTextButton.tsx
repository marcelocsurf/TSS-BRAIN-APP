'use client';

import { useState } from 'react';

// Botón "copiar para WhatsApp" — el texto viene armado del server component.
export function CopyTextButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<'idle' | 'ok' | 'fail'>('idle');

  const flash = (s: 'ok' | 'fail') => {
    setState(s);
    setTimeout(() => setState('idle'), 2500);
  };

  return (
    <button
      type="button"
      aria-live="polite"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          flash('ok');
        } catch {
          // Fallback sin clipboard API (HTTP/LAN, WebView): textarea fuera de
          // pantalla + readonly para no robar scroll/foco ni abrir teclado, y
          // el boolean de execCommand SÍ se chequea — "✓" falso era peor que
          // un error visible (revisión).
          try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.readOnly = true;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            const okCopy = document.execCommand('copy');
            document.body.removeChild(ta);
            flash(okCopy ? 'ok' : 'fail');
          } catch {
            flash('fail');
          }
        }
      }}
      className="shrink-0 text-[10px] font-bold rounded-full px-3 py-1.5 border transition-colors text-center"
      style={{
        minWidth: 96,
        ...(state === 'ok'
          ? { background: 'rgba(6,214,160,.15)', color: '#047857', borderColor: 'rgba(6,214,160,.4)' }
          : state === 'fail'
            ? { background: 'rgba(255,107,107,.12)', color: '#c04545', borderColor: 'rgba(255,107,107,.4)' }
            : { background: '#fff', color: '#0090B0', borderColor: 'rgba(0,144,176,.35)' }),
      }}
    >
      {state === 'ok' ? '✓ Copiado' : state === 'fail' ? '✕ No se pudo copiar' : label}
    </button>
  );
}
