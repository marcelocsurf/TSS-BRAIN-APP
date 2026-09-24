'use client';

import { Printer } from 'lucide-react';

/** Imprimir o guardar como PDF: el propio navegador ofrece las dos cosas
 *  (en el teléfono, Compartir → Imprimir → Guardar como PDF). No hace falta
 *  ninguna librería de PDF. */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 min-h-[44px] px-4 rounded-[5px] text-[14px] font-black uppercase"
      style={{ background: '#00D2FF', color: '#061C2B', fontFamily: 'var(--font-archivo), Archivo, sans-serif', letterSpacing: '0.03em' }}
    >
      <Printer size={16} /> Print · save as PDF
    </button>
  );
}
