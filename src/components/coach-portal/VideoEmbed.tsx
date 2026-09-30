'use client';

// ═══ Un video del curso, en el portal del coach (2026-09-29) ═══
// Marcelo: "asegúrate que en el material del coach también salgan los videos
// si hay cargados, para que tenga todo el material del curso". YouTube,
// Vimeo, un archivo de Google Drive (vista previa) o un archivo directo.
// Con varios videos, chips arriba para elegir cuál se ve.

import { useEffect, useState } from 'react';

export interface CourseVideo { url: string; title: string; label?: string | null }

function embedSrc(url: string): string | null {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  const gd = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/) ?? url.match(/drive\.google\.com\/open\?id=([\w-]+)/);
  if (gd) return `https://drive.google.com/file/d/${gd[1]}/preview`;
  return null;
}

export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const src = embedSrc(url);
  if (!src) return <video src={url} controls playsInline preload="metadata" className="w-full block rounded-[5px]" title={title} />;
  return (
    <div className="relative w-full rounded-[5px] overflow-hidden" style={{ paddingTop: '56.25%', background: '#061C2B' }}>
      <iframe src={src} title={title} loading="lazy" className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
    </div>
  );
}

export function VideoList({ videos }: { videos: CourseVideo[] }) {
  const [i, setI] = useState(0);
  const cur = videos[Math.min(i, videos.length - 1)];
  if (!cur) return null;
  return (
    <div>
      {videos.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {videos.map((v, k) => (
            <button key={`${v.url}:${k}`} type="button" aria-pressed={k === i} onClick={() => setI(k)}
              className="min-h-[40px] px-3 py-1.5 rounded-full text-[12px] font-semibold border"
              style={k === i ? { background: '#061C2B', borderColor: '#061C2B', color: '#F7F9FA' } : { background: '#fff', borderColor: '#DCD7C6', color: '#061C2B' }}>
              {v.label || v.title}
            </button>
          ))}
        </div>
      )}
      <VideoEmbed key={cur.url} url={cur.url} title={cur.title} />
    </div>
  );
}

/** Todos los videos en un panel encima (el mismo en la secuencia, los
 *  círculos, el lector y el índice del curso). Esc o × lo cierran; la página
 *  de atrás no se mueve; con el teléfono acostado, el panel se desplaza. */
export function VideosDialog({ title, videos, onClose }: { title: string; videos: CourseVideo[]; onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label={`Videos · ${title}`} className="fixed inset-0 z-[250] flex items-start sm:items-center justify-center p-3 overflow-y-auto overscroll-contain" style={{ background: 'rgba(6,28,43,.85)' }} onClick={onClose}>
      <div className="w-full max-w-3xl rounded-lg p-4 max-h-[calc(100dvh-24px)] overflow-y-auto overscroll-contain" style={{ background: '#F7F9FA' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <p className="min-w-0 flex-1 text-[16px] font-bold leading-snug m-0" style={{ color: '#061C2B' }}>{title}</p>
          <button type="button" autoFocus onClick={onClose} aria-label="Close" className="w-11 h-11 shrink-0 inline-flex items-center justify-center rounded-full text-[24px] leading-none" style={{ color: '#061C2B' }}>×</button>
        </div>
        {/* El video no pasa del alto de la pantalla (teléfono acostado). */}
        <div className="mx-auto" style={{ maxWidth: 'min(48rem, calc((100dvh - 150px) * 16 / 9))' }}>
          <VideoList videos={videos} />
        </div>
      </div>
    </div>
  );
}
