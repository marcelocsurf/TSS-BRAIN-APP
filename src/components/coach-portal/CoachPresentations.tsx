'use client';

import { useEffect, useState } from 'react';
import { getMyCoachResources, type CoachResource } from '@/lib/actions/coach-resources';
import { Presentation } from 'lucide-react';

// Shows the presentations an admin has granted to this coach.
//
// Cada tile es un LINK directo al PDF (pestaña nueva → visor nativo).
// Antes abría un modal con <iframe>: en iOS un PDF embebido renderiza SOLO
// la primera página y en Android Chrome ni se renderiza (reporte de Marcelo
// 2026-08-31). La URL sigue siendo la del app (/api/materials/token/id).
export function CoachPresentations({ token }: { token: string }) {
  const [items, setItems] = useState<CoachResource[]>([]);

  useEffect(() => {
    getMyCoachResources(token).then(setItems).catch(() => {});
  }, [token]);

  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-mono uppercase tracking-wider px-1" style={{ color: '#5AC3E7' }}>
        Presentations ({items.length})
      </p>
      {items.map((r) => (
        <a
          key={r.id}
          href={r.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-left rounded-2xl border border-white/10 p-4 flex items-center gap-3 transition-colors hover:border-white/25"
          style={{ background: '#0F1E33', borderLeft: '4px solid #5AC3E7' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(90,195,231,.15)' }}>
            {r.sort_order != null ? (
              <span className="text-[13px] font-bold font-mono" style={{ color: '#5AC3E7' }}>
                {String(r.sort_order).padStart(2, '0')}
              </span>
            ) : (
              <Presentation size={18} strokeWidth={1.75} className="text-[var(--tss-cyan,#5AC3E7)]" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{r.title}</p>
            {r.description && <p className="text-[11px] text-white/50 leading-snug line-clamp-2">{r.description}</p>}
          </div>
        </a>
      ))}
    </div>
  );
}
