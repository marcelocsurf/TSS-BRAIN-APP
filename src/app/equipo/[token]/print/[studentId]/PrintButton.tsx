'use client';

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden shrink-0 rounded-full px-4 py-2 text-[11px] font-bold text-white"
      style={{ background: '#061C2B', fontFamily: 'DM Mono, monospace', letterSpacing: '0.1em' }}
    >
      🖨 IMPRIMIR
    </button>
  );
}
