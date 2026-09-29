'use client';

// ═══ Mostrar una lámina a la clase (Marcelo 2026-09-29) ═══
// "Si quiere enseñar algo, que pueda elegir la filmina." Pantalla completa,
// fondo negro, la lámina lo más grande posible; se pasa con flechas, tocando
// los costados o deslizando, y con las teclas ← → (Esc cierra). En tablet o
// computadora pide pantalla completa real cuando el navegador lo permite.

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

export interface PresentedLamina { src: string; alt: string; caption?: string; from?: string }

export function LaminaPresenter({ items, start = 0, onClose }: { items: PresentedLamina[]; start?: number; onClose: () => void }) {
  const [i, setI] = useState(Math.min(Math.max(start, 0), Math.max(items.length - 1, 0)));
  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const touchX = useRef<number | null>(null);
  // En iPhone no hay pantalla completa de elementos: sin botón muerto.
  const [canFullscreen, setCanFullscreen] = useState(false);
  const cur = items[i];
  const go = useCallback((d: number) => setI((n) => Math.min(Math.max(n + d, 0), items.length - 1)), [items.length]);

  const close = useCallback(() => {
    try { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); } catch { /* nada */ }
    onClose();
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Los controles de presentación mandan PageDown / PageUp.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
      else if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [go, close]);

  // Foco en Cerrar al abrir (el teclado no se va a la página de atrás) y
  // si se puede, pantalla completa real.
  useEffect(() => {
    closeRef.current?.focus();
    const d = document as any;
    setCanFullscreen(!!(d.fullscreenEnabled || d.webkitFullscreenEnabled));
  }, []);

  // La siguiente y la anterior ya cargadas: sin destello negro al pasar.
  useEffect(() => {
    for (const k of [i - 1, i + 1]) { const s = items[k]?.src; if (s) { const im = new Image(); im.src = s; } }
  }, [i, items]);

  const fullscreen = () => {
    const el = rootRef.current as any;
    try {
      const r = (el?.requestFullscreen ?? el?.webkitRequestFullscreen)?.call(el);
      if (r && typeof r.catch === 'function') r.catch(() => {});
    } catch { /* el overlay ya ocupa toda la pantalla */ }
  };

  if (!cur) return null;
  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Plate on screen"
      className="fixed inset-0 z-[300] flex flex-col"
      style={{ background: '#000' }}
      onTouchStart={(e) => { touchX.current = e.touches.length === 1 ? (e.touches[0]?.clientX ?? null) : null; }}
      onTouchMove={(e) => { if (e.touches.length > 1) touchX.current = null; /* zoom con dos dedos: no es pasar de lámina */ }}
      onTouchEnd={(e) => {
        const x0 = touchX.current; touchX.current = null;
        const x1 = e.changedTouches[0]?.clientX;
        if (x0 == null || x1 == null) return;
        if (x1 - x0 > 50) go(-1); else if (x0 - x1 > 50) go(1);
      }}
    >
      <div className="flex items-center gap-3 px-4 py-2.5 shrink-0" style={{ color: 'rgba(247,249,250,.85)' }}>
        <p className="min-w-0 flex-1 text-[13px] leading-tight truncate">
          <span style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', color: '#00D2FF' }}>{i + 1} / {items.length}</span>
          {cur.from ? <span> · {cur.from}</span> : null}
        </p>
        {canFullscreen && <button type="button" onClick={fullscreen} aria-label="Full screen" className="p-2 rounded-full" style={{ color: '#F7F9FA' }}><Maximize2 size={18} /></button>}
        <button ref={closeRef} type="button" onClick={close} aria-label="Close" className="p-2 rounded-full" style={{ color: '#F7F9FA' }}><X size={22} /></button>
      </div>

      <div className="relative flex-1 min-h-0 flex items-center justify-center px-2 pb-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={cur.src} src={cur.src} alt={cur.alt} className="max-w-full max-h-full object-contain select-none" draggable={false} />
        {/* Tocar los costados también pasa de lámina. */}
        <button type="button" aria-label="Previous plate" onClick={() => go(-1)} disabled={i === 0}
          className="absolute left-0 top-0 h-full w-1/4 flex items-center justify-start pl-2 disabled:opacity-0" style={{ color: '#F7F9FA' }}>
          <span className="rounded-full p-2" style={{ background: 'rgba(0,0,0,.45)' }}><ChevronLeft size={28} /></span>
        </button>
        <button type="button" aria-label="Next plate" onClick={() => go(1)} disabled={i === items.length - 1}
          className="absolute right-0 top-0 h-full w-1/4 flex items-center justify-end pr-2 disabled:opacity-0" style={{ color: '#F7F9FA' }}>
          <span className="rounded-full p-2" style={{ background: 'rgba(0,0,0,.45)' }}><ChevronRight size={28} /></span>
        </button>
      </div>
    </div>
  );
}
