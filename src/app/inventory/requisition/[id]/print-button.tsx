'use client';

// Print / Save-as-PDF button. Hidden in the printed output via @media print.
export function PrintButton() {
  return (
    <>
      <style>{`@media print { .no-print { display: none !important; } body { margin: 0; } }`}</style>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => window.print()}
          style={{ background: '#0A1628', color: 'white', border: 'none', borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
        >
          🖨 Imprimir / Guardar como PDF
        </button>
      </div>
    </>
  );
}
