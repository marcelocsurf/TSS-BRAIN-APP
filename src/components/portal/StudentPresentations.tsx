'use client';

import { useEffect, useState } from 'react';
import { getMyStudentResources, type CoachResource } from '@/lib/actions/coach-resources';
import { Presentation } from 'lucide-react';
import { MaterialReader } from './MaterialReader';

// Shows the presentations an admin has granted to this student.
//
// Cada tile abre el LECTOR del portal (MaterialReader: pdf.js sobre canvas).
// Historia: el <iframe> mostraba solo la primera página en iOS (2026-08-31),
// así que pasó a pestaña nueva; pero ese link con el token del portal se
// podía copiar y pasar (2026-09-08). El lector resuelve las dos cosas: dibuja
// todas las páginas en cualquier teléfono y pide un ticket de 10 minutos.
export function StudentPresentations({ token, initial }: { token: string; initial?: CoachResource[] }) {
  const [items, setItems] = useState<CoachResource[]>(initial ?? []);
  const [reader, setReader] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (initial !== undefined) return; // vino del bundle server-side
    getMyStudentResources(token).then(setItems).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-mono uppercase tracking-wider px-1 text-gray-400">
        Presentations ({items.length})
      </p>
      {items.map((r) => (
        <button
          type="button"
          key={r.id}
          onClick={() => setReader({ id: r.id, title: r.title })}
          className="w-full text-left rounded-2xl border border-gray-200 bg-white p-4 flex items-center gap-3 transition-colors hover:border-gray-300 shadow-sm"
          style={{ borderLeft: '4px solid var(--tss-cyan, #5AC3E7)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(90,195,231,.12)' }}>
            {r.sort_order != null ? (
              <span className="text-[13px] font-bold font-mono text-[var(--tss-cyan,#5AC3E7)]">
                {String(r.sort_order).padStart(2, '0')}
              </span>
            ) : (
              <Presentation size={18} strokeWidth={1.75} className="text-[var(--tss-cyan,#5AC3E7)]" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--tss-navy)] truncate">{r.title}</p>
            {r.description && <p className="text-[11px] text-gray-500 leading-snug line-clamp-2">{r.description}</p>}
          </div>
        </button>
      ))}
      {reader && <MaterialReader token={token} resourceId={reader.id} title={reader.title} onClose={() => setReader(null)} />}
    </div>
  );
}
