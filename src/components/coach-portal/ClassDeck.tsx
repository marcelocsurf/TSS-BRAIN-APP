'use client';

// ═══ UN solo modo presentación para la clase (2026-09-30) ═══
// Junta los dos que había: el de las láminas (LaminaPresenter) y el de Teach
// it (una idea por pantalla, letra grande). Una diapositiva puede ser una
// lámina, una idea en grande, la línea sobre la ola, "qué mirar" (✓ ✗ fix) o
// un video. Se pasa con los botones de abajo, las flechas / PageDown (los
// controles de presentación), o deslizando (menos en un video, que es suyo, y
// sobre algo que se desplaza de costado, como la ola del kit en el teléfono).

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Maximize2, X } from 'lucide-react';
import { VideoEmbed } from './VideoEmbed';

export type DeckSlide =
  | { kind: 'plate'; src: string; alt: string; from?: string }
  | { kind: 'text'; eyebrow?: string; big: string; small?: string }
  | { kind: 'node'; eyebrow?: string; node: ReactNode; small?: string }
  | { kind: 'check'; eyebrow?: string; ok: string; no: string; fix: string }
  | { kind: 'video'; eyebrow?: string; url: string; title: string };

const INK = '#061C2B';
const PAPER = '#F7F9FA';
const CYAN = '#00D2FF';
const MONO: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', letterSpacing: '0.12em', textTransform: 'uppercase' };
const DISPLAY: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif' };

export function ClassDeck({ slides, start = 0, title, onClose }: { slides: DeckSlide[]; start?: number; title?: string; onClose: () => void }) {
  const [i, setI] = useState(Math.min(Math.max(start, 0), Math.max(slides.length - 1, 0)));
  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const touchX = useRef<number | null>(null);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const s = slides[i];
  const go = useCallback((d: number) => setI((n) => Math.min(Math.max(n + d, 0), slides.length - 1)), [slides.length]);
  const close = useCallback(() => {
    try { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); } catch { /* nada */ }
    onClose();
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
      else if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [go, close]);

  useEffect(() => {
    // Al cerrar, el foco vuelve a lo que lo abrió (no se cae detrás de la hoja).
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const d = document as any;
    setCanFullscreen(!!(d.fullscreenEnabled || d.webkitFullscreenEnabled));
    return () => { try { if (opener && opener.isConnected) opener.focus(); } catch { /* nada */ } };
  }, []);

  // ¿El toque empezó sobre algo que se desplaza de costado? Entonces es suyo.
  const inSideScroller = (el: EventTarget | null) => {
    let n = el as HTMLElement | null;
    while (n && n !== rootRef.current) {
      if (n.scrollWidth > n.clientWidth + 1) {
        const ox = window.getComputedStyle(n).overflowX;
        if (ox === 'auto' || ox === 'scroll') return true;
      }
      n = n.parentElement;
    }
    return false;
  };

  // Las láminas vecinas ya cargadas: sin destello al pasar.
  useEffect(() => {
    for (const k of [i - 1, i + 1]) { const n = slides[k]; if (n?.kind === 'plate') { const im = new Image(); im.src = n.src; } }
  }, [i, slides]);

  const fullscreen = () => {
    const el = rootRef.current as any;
    try {
      const r = (el?.requestFullscreen ?? el?.webkitRequestFullscreen)?.call(el);
      if (r && typeof r.catch === 'function') r.catch(() => {});
    } catch { /* el overlay ya ocupa toda la pantalla */ }
  };

  if (!s) return null;
  const eyebrow = s.kind === 'plate' ? s.from : s.eyebrow;
  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={title ? `${title} · on screen` : 'On screen'}
      className="fixed inset-0 z-[300] flex flex-col"
      style={{ background: s.kind === 'plate' ? '#000' : INK, paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      onTouchStart={(e) => { touchX.current = s.kind !== 'video' && e.touches.length === 1 && !inSideScroller(e.target) ? (e.touches[0]?.clientX ?? null) : null; }}
      onTouchMove={(e) => { if (e.touches.length > 1) touchX.current = null; }}
      onTouchEnd={(e) => {
        const x0 = touchX.current; touchX.current = null;
        const x1 = e.changedTouches[0]?.clientX;
        if (x0 == null || x1 == null) return;
        if (x1 - x0 > 50) go(-1); else if (x0 - x1 > 50) go(1);
      }}
    >
      <div className="flex items-center gap-3 px-4 py-2.5 shrink-0" style={{ color: 'rgba(247,249,250,.85)' }}>
        <p className="min-w-0 flex-1 text-[13px] leading-tight truncate m-0">
          <span style={{ ...MONO, fontSize: 12, color: CYAN }}>{i + 1} / {slides.length}</span>
          {eyebrow ? <span> · {eyebrow}</span> : null}
        </p>
        {canFullscreen && <button type="button" onClick={fullscreen} aria-label="Full screen" className="p-2 rounded-full" style={{ color: PAPER }}><Maximize2 size={18} /></button>}
        <button ref={closeRef} type="button" onClick={close} aria-label="Close" className="w-11 h-11 inline-flex items-center justify-center rounded-full" style={{ background: 'rgba(247,249,250,.1)', color: PAPER }}><X size={20} /></button>
      </div>

      {/* Una diapositiva más alta que la pantalla (la ola + su texto en un
          teléfono) empieza arriba y se desplaza: nada queda cortado. */}
      <div className="flex-1 min-h-0 flex flex-col px-4 sm:px-8 overflow-y-auto overscroll-contain">
        {s.kind === 'plate' && (
          <div className="flex-1 min-h-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={s.src} src={s.src} alt={s.alt} className="max-w-full max-h-full object-contain select-none" draggable={false} />
          </div>
        )}
        {s.kind === 'text' && (
          <div className="my-auto py-2">
            <p className="m-0" style={{ ...DISPLAY, fontWeight: 900, color: PAPER, fontSize: 'clamp(30px, 8vw, 60px)', lineHeight: 1.04 }}>{s.big}</p>
            {s.small && <p className="text-[17px] leading-snug mt-4 mb-0" style={{ color: 'rgba(247,249,250,.8)' }}>{s.small}</p>}
          </div>
        )}
        {s.kind === 'node' && (
          <div className="my-auto py-2">
            {s.node}
            {s.small && <p className="text-[16px] leading-snug mt-4 mb-0" style={{ color: 'rgba(247,249,250,.8)' }}>{s.small}</p>}
          </div>
        )}
        {s.kind === 'check' && (
          <div className="my-auto py-2 space-y-4">
            <p className="m-0" style={{ ...DISPLAY, fontWeight: 800, color: '#7BE0A6', fontSize: 'clamp(22px, 5vw, 38px)', lineHeight: 1.12 }}>✓ {s.ok}</p>
            <p className="m-0" style={{ ...DISPLAY, fontWeight: 700, color: '#FF9B9B', fontSize: 'clamp(19px, 4.2vw, 30px)', lineHeight: 1.15 }}>✗ {s.no}</p>
            <p className="m-0" style={{ ...DISPLAY, fontWeight: 800, color: CYAN, fontSize: 'clamp(22px, 5vw, 38px)', lineHeight: 1.12 }}>→ {s.fix}</p>
          </div>
        )}
        {s.kind === 'video' && (
          <div className="my-auto w-full mx-auto" style={{ maxWidth: 'min(56rem, calc((100dvh - 170px) * 16 / 9))' }}><VideoEmbed key={s.url} url={s.url} title={s.title} /></div>
        )}
      </div>

      {/* Siempre abajo, fuera de la imagen y del video: nada se traga el toque. */}
      <div className="flex gap-2 px-4 pb-4 pt-2 shrink-0">
        <button type="button" onClick={() => go(-1)} disabled={i === 0}
          className="flex-1 min-h-[52px] rounded-[5px] inline-flex items-center justify-center disabled:opacity-30"
          style={{ border: '1px solid rgba(247,249,250,.35)', color: PAPER }} aria-label="Previous">
          <ArrowLeft size={20} />
        </button>
        <button type="button" onClick={() => go(1)} disabled={i >= slides.length - 1}
          className="flex-[2] min-h-[52px] rounded-[5px] inline-flex items-center justify-center gap-2 text-[15px] font-black uppercase disabled:opacity-30"
          style={{ ...DISPLAY, background: CYAN, color: INK, letterSpacing: '0.03em' }} aria-label="Next">
          Next <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
