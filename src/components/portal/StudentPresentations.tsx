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
      <p className="text-[11px] font-mono uppercase tracking-wider px-1" style={{ color: 'rgba(247,249,250,.6)' }}>
        Presentations ({items.length})
      </p>
      {items.map((r) => {
        const isBook = r.id === 'f50677a2-72b1-4abd-9335-fe0c99c80333' || /one\s*wave/i.test(r.title ?? '');
        return (
        <button
          type="button"
          key={r.id}
          onClick={() => setReader({ id: r.id, title: r.title })}
          className="w-full text-left rounded-lg border border-[#DCD7C6] p-4 flex items-center gap-4 transition-colors shadow-sm"
          style={{ background: '#E9E2D2' }}
        >
          {/* El libro lleva su PORTADA (Marcelo 2026-09-16); el resto, número o icono. */}
          {isBook ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/web/img/one-wave-cover.jpg" alt="ONE WAVE" className="w-[56px] h-auto rounded-[4px] shadow-md shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-[5px] flex items-center justify-center shrink-0" style={{ background: '#061C2B' }}>
              {r.sort_order != null ? (
                <span className="text-[13px] font-bold font-mono" style={{ color: '#00D2FF' }}>{String(r.sort_order).padStart(2, '0')}</span>
              ) : (
                <Presentation size={18} strokeWidth={1.75} style={{ color: '#00D2FF' }} />
              )}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[15px] font-bold truncate" style={{ color: '#10263B' }}>{isBook ? 'ONE WAVE' : r.title}</p>
            {r.description && <p className="text-[12px] leading-snug line-clamp-2" style={{ color: '#55666E' }}>{r.description}</p>}
          </div>
        </button>
        );
      })}
      {reader && <MaterialReader token={token} resourceId={reader.id} title={reader.title} onClose={() => setReader(null)} />}
    </div>
  );
}
