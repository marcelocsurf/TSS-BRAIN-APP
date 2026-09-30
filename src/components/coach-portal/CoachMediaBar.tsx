'use client';

// ═══ La barra del coach, para cualquier página del curso (2026-09-30) ═══
// Present (las láminas en pantalla, con el modo presentación único) y Videos
// (todos, para elegir). La usan los Tres Círculos, el Infinite Circle y el
// lector de lecciones; la página de la secuencia tiene la suya, más completa.

import { useState } from 'react';
import { Play } from 'lucide-react';
import { ClassDeck } from './ClassDeck';
import { VideosDialog, type CourseVideo } from './VideoEmbed';
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
      {watch && <VideosDialog title={`${title} · all videos`} videos={videos} onClose={() => setWatch(false)} />}
    </>
  );
}
