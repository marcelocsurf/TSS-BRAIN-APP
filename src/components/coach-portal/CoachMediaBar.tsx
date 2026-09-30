'use client';

// ═══ La barra del coach, para cualquier página del curso (2026-09-30) ═══
// Present (las láminas en pantalla, con el modo presentación único) y Videos
// (todos, para elegir). La usan los Tres Círculos, el Infinite Circle y el
// lector de lecciones; la página de la secuencia tiene la suya, más completa.

import { useState } from 'react';
import { Play } from 'lucide-react';
import { ClassDeck } from './ClassDeck';
import { VideoList, type CourseVideo } from './VideoEmbed';
import type { Lamina } from '@/lib/sequence-pages/laminas';

export function CoachMediaBar({ title, laminas, videos, tone = 'dark' }: {
  title: string;
  laminas: Lamina[];
  videos: CourseVideo[];
  /** 'dark' sobre navy (páginas del alumno); 'light' sobre fondo claro. */
  tone?: 'dark' | 'light';
}) {
  const [deck, setDeck] = useState(false);
  const [watch, setWatch] = useState(false);
  if (laminas.length === 0 && videos.length === 0) return null;
  const dark = tone === 'dark';
  return (
    <>
      <div className="mt-2 flex flex-wrap gap-2">
        {laminas.length > 0 && (
          <button type="button" onClick={() => setDeck(true)} className="rounded-[5px] px-3.5 min-h-[40px] text-[13px] font-black uppercase tracking-wide" style={{ background: '#00D2FF', color: '#061C2B' }}>
            Present · {laminas.length}
          </button>
        )}
        {videos.length > 0 && (
          <button type="button" onClick={() => setWatch(true)} className="rounded-[5px] px-3.5 min-h-[40px] text-[13px] font-bold inline-flex items-center gap-1.5"
            style={dark ? { background: 'transparent', color: '#F7F9FA', border: '1px solid rgba(247,249,250,.45)' } : { background: '#fff', color: '#061C2B', border: '1px solid #DCD7C6' }}>
            <Play size={13} /> Videos · {videos.length}
          </button>
        )}
      </div>
      {deck && (
        <ClassDeck title={title} slides={laminas.map((l) => ({ kind: 'plate' as const, src: l.src, alt: l.alt, from: l.caption ?? title }))} onClose={() => setDeck(false)} />
      )}
      {watch && (
        <div role="dialog" aria-modal="true" aria-label={`Videos · ${title}`} className="fixed inset-0 z-[250] flex items-center justify-center p-3" style={{ background: 'rgba(6,28,43,.85)' }} onClick={() => setWatch(false)}>
          <div className="w-full max-w-3xl rounded-lg p-4" style={{ background: '#F7F9FA' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <p className="min-w-0 flex-1 text-[16px] font-bold leading-snug m-0" style={{ color: '#061C2B' }}>{title} · all videos</p>
              <button type="button" autoFocus onClick={() => setWatch(false)} aria-label="Close" className="px-2 py-1 text-[22px] leading-none" style={{ color: '#061C2B' }}>×</button>
            </div>
            <VideoList videos={videos} />
          </div>
        </div>
      )}
    </>
  );
}
