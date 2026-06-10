'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

export function ExportBitacoraButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/export-bitacora');
      if (!res.ok) {
        throw new Error(
          res.status === 403 ? 'Solo el admin puede exportar.' : 'No se pudo generar el export.',
        );
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cd = res.headers.get('Content-Disposition') || '';
      const match = cd.match(/filename="([^"]+)"/);
      a.download = match?.[1] || 'tss-bitacora.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleExport}
        disabled={loading}
        className="flex items-center gap-2 px-3.5 py-2 bg-[var(--tss-navy)] text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Generando…
          </>
        ) : (
          <>
            <Download size={16} /> Exportar bitácora
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-[10px] text-gray-400">ZIP · CSV + JSON · alumnos, coaches, sesiones, evaluaciones</p>
    </div>
  );
}
