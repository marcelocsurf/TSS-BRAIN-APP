'use client';

import { useEffect, useState } from 'react';

// ═══ Lámina que se abre ADENTRO del app (Marcelo 2026-09-25) ═══
// Antes cada lámina abría en otra pestaña y sacaba al alumno del app. Ahora:
// tocar → se ve grande sobre un fondo oscuro; × / Esc / tocar afuera → cierra
// y seguís donde estabas. Sin dependencias.

export function ZoomImage({
  src, alt, caption, width = 1672, height = 941, className = '', style,
}: {
  src: string;
  alt: string;
  caption?: string | null;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${alt} — tap to enlarge`}
        className={`block w-full p-0 m-0 border-0 bg-transparent cursor-zoom-in ${className}`}
        style={style}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={width} height={height} alt={alt} loading="lazy" style={{ width: '100%', height: 'auto', display: 'block' }} />
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[1000] flex flex-col items-center justify-center p-3"
          style={{ background: 'rgba(6,28,43,.94)' }}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen(false); }}
            aria-label="Close"
            className="absolute top-3 right-3 w-11 h-11 rounded-full text-[22px] font-bold flex items-center justify-center"
            style={{ background: 'rgba(247,249,250,.12)', color: '#F7F9FA' }}
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '100%', maxHeight: caption ? 'calc(100vh - 88px)' : 'calc(100vh - 48px)', width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: 8 }}
          />
          {caption && (
            <p className="mt-3 text-[13px] text-center" style={{ color: 'rgba(247,249,250,.85)' }}>{caption}</p>
          )}
          <p className="mt-1 text-[11px]" style={{ color: 'rgba(247,249,250,.55)' }}>Tap anywhere to close</p>
        </div>
      )}
    </>
  );
}
