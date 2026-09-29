'use client';

// ═══ El curso a mano + elegir la lámina (Marcelo 2026-09-29) ═══
// Dos vistas del mismo curso del alumno: "Course" (en su orden, cada fila con
// sus láminas en miniatura, abrir la lección / Teach it) y "Plates" (todas las
// láminas de esa cinta para elegir una). Tocar una lámina la pone en pantalla.

import { useMemo, useState } from 'react';
import { ArrowLeft, Presentation, Play, X } from 'lucide-react';
import type { CourseTabMap, CourseItem } from '@/lib/coach/course-map';
import { LaminaPresenter, type PresentedLamina } from './LaminaPresenter';
import { VideoList, type CourseVideo } from './VideoEmbed';

const INK = '#061C2B';
const TEXT = '#10263B';
const MUTED = '#55666E';
const SAND = '#E9E2D2';
const BORDER = '#DCD7C6';
const CYAN = '#00D2FF';
const LINK = '#005F79';
const MONO: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' };

function hrefsFor(item: CourseItem, token: string, tabKey: CourseTabMap['key']) {
  const base = `/coach-portal/${token}`;
  if (item.kind === 'lesson') return { open: `${base}?tab=courses&lesson=${item.id}`, openLabel: 'Open the lesson', teach: null };
  // Desde Yellow, las páginas de entrada de Blue se leen con la voz de Yellow.
  if (item.kind === 'page') return { open: `${base}/seq/${item.id}${tabKey === 'yellow' ? '?course=yellow_belt' : ''}`, openLabel: 'As the student sees it', teach: `${base}/teach/${item.id}` };
  if (item.kind === 'circles') return { open: `${base}/circles`, openLabel: 'As the student sees it', teach: `${base}/teach/CIRCLE-BODY` };
  return { open: `${base}/loop`, openLabel: 'As the student sees it', teach: null };
}

export function CoachCourseBrowser({ token, tabs, initialBelt, initialView }: {
  token: string;
  tabs: CourseTabMap[];
  /** ?belt= y ?view= de la URL: volver de una lección no resetea la pantalla. */
  initialBelt?: string | null;
  initialView?: string | null;
}) {
  const [tabKey, setTabKeyState] = useState<CourseTabMap['key']>(
    (tabs.find((t) => t.key === initialBelt)?.key) ?? tabs[0]?.key ?? 'pre');
  const [view, setViewState] = useState<'course' | 'plates' | 'videos'>(initialView === 'plates' ? 'plates' : initialView === 'videos' ? 'videos' : 'course');
  // Videos de una fila en un panel encima (se cierra con ×).
  const [watch, setWatch] = useState<{ title: string; videos: CourseVideo[] } | null>(null);
  const remember = (belt: string, v: string) => {
    try { window.history.replaceState(window.history.state, '', `${window.location.pathname}?belt=${belt}&view=${v}`); } catch { /* nada */ }
  };
  const setTabKey = (k: CourseTabMap['key']) => { setTabKeyState(k); remember(k, view); };
  const setView = (v: 'course' | 'plates' | 'videos') => { setViewState(v); remember(tabKey, v); };
  const [show, setShow] = useState<{ items: PresentedLamina[]; start: number } | null>(null);
  const tab = tabs.find((t) => t.key === tabKey) ?? tabs[0];

  // Todas las láminas de la cinta, en el orden del curso: el presentador pasa de
  // una a la siguiente aunque sean de lecciones distintas.
  const plates = useMemo(() => (tab?.groups ?? []).flatMap((g) => g.items.flatMap((it) =>
    it.laminas.map((l) => ({ src: l.src, alt: l.alt, caption: l.caption, from: it.title, itemId: it.id })))), [tab]);
  const withVideos = useMemo(() => (tab?.groups ?? []).flatMap((g) => g.items.filter((it) => it.videos.length > 0)), [tab]);
  const videoCount = withVideos.reduce((n, it) => n + it.videos.length, 0);
  const present = (src: string, itemId: string) => {
    const start = Math.max(0, plates.findIndex((p) => p.src === src && p.itemId === itemId));
    setShow({ items: plates, start });
  };

  if (!tab) return null;
  return (
    <div className="min-h-screen" style={{ background: '#F7F9FA', color: TEXT }}>
      <div className="max-w-3xl mx-auto px-4 pt-4 pb-16">
        <a href={`/coach-portal/${token}?tab=courses`} className="inline-flex items-center gap-1.5 text-[13px] font-semibold no-underline" style={{ color: LINK }}><ArrowLeft size={14} /> Courses</a>
        <p className="mt-3" style={{ ...MONO, color: '#0090B0' }}>The course · as your students see it</p>
        <h1 className="text-[26px] leading-tight mt-1" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontWeight: 900, color: INK }}>Teach from the course</h1>
        <p className="text-[14px] mt-1" style={{ color: MUTED }}>Pick a plate and put it on screen for the class. Swipe or use the arrows to move on.</p>

        {/* Cinta */}
        <div className="flex flex-wrap gap-1.5 mt-4" role="tablist" aria-label="Belt">
          {tabs.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={t.key === tab.key} onClick={() => setTabKey(t.key)}
              className="px-3.5 py-2 rounded-full text-[13px] font-semibold border"
              style={t.key === tab.key ? { background: INK, borderColor: INK, color: '#F7F9FA' } : { background: '#fff', borderColor: BORDER, color: INK }}>
              {t.label}
            </button>
          ))}
        </div>
        {/* Vista */}
        <div className="inline-flex mt-3 rounded-full p-1" style={{ background: SAND }}>
          {(['course', 'plates', 'videos'] as const).map((v) => (
            <button key={v} type="button" onClick={() => setView(v)} aria-pressed={view === v}
              className="px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold"
              style={view === v ? { background: '#fff', color: INK } : { background: 'transparent', color: MUTED }}>
              {v === 'course' ? 'Course' : v === 'plates' ? `Plates · ${plates.length}` : `Videos · ${videoCount}`}
            </button>
          ))}
        </div>

        {view === 'videos' ? (
          withVideos.length === 0 ? (
            <p className="mt-6 text-[14px]" style={{ color: MUTED }}>No videos in this belt yet.</p>
          ) : (
            <div className="mt-5 space-y-5">
              {withVideos.map((it) => (
                <section key={it.id} className="rounded-lg p-4" style={{ background: '#fff', border: `1px solid ${BORDER}` }}>
                  <p className="text-[16px] font-bold leading-snug mb-2" style={{ color: INK }}>{it.title}</p>
                  <VideoList videos={it.videos} />
                </section>
              ))}
            </div>
          )
        ) : view === 'plates' ? (
          plates.length === 0 ? (
            <p className="mt-6 text-[14px]" style={{ color: MUTED }}>No plates in this belt yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
              {plates.map((p, idx) => (
                <button key={`${p.itemId}:${p.src}:${idx}`} type="button" onClick={() => setShow({ items: plates, start: idx })}
                  className="text-left rounded-lg overflow-hidden" style={{ background: '#fff', border: `1px solid ${BORDER}` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt={p.alt} loading="lazy" className="w-full aspect-[16/10] object-cover" style={{ background: INK }} />
                  <span className="block px-2.5 py-2 text-[12px] leading-snug" style={{ color: TEXT }}>{p.from}</span>
                </button>
              ))}
            </div>
          )
        ) : (
          <div className="mt-5 space-y-6">
            {tab.groups.map((g) => (
              <section key={g.title}>
                <p style={{ ...MONO, color: MUTED }}>{g.title}</p>
                <div className="mt-2 rounded-lg overflow-hidden" style={{ background: '#fff', border: `1px solid ${BORDER}` }}>
                  {g.items.map((it, idx) => {
                    const h = hrefsFor(it, token, tab.key);
                    return (
                      <div key={it.id} className="px-4 py-3" style={{ borderTop: idx ? `1px solid ${BORDER}` : undefined }}>
                        {it.kind === 'page' && <p style={{ ...MONO, fontSize: 10, color: '#0090B0' }}>{it.eyebrow}</p>}
                        <p className="text-[16px] font-bold leading-snug" style={{ color: INK }}>{it.title}</p>
                        {it.laminas.length > 0 && (
                          <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                            {it.laminas.map((l) => (
                              <button key={l.src} type="button" onClick={() => present(l.src, it.id)} aria-label={`Show on screen: ${l.caption ?? it.title}`}
                                className="shrink-0 rounded-[5px] overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={l.src} alt="" loading="lazy" className="h-[72px] w-[112px] object-cover" style={{ background: INK }} />
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[13px] font-semibold">
                          {it.laminas.length > 0 && (
                            <button type="button" onClick={() => setShow({ items: it.laminas.map((l) => ({ src: l.src, alt: l.alt, caption: l.caption, from: it.title })), start: 0 })} className="inline-flex items-center gap-1.5" style={{ color: LINK }}>
                              <Presentation size={14} /> Show {it.laminas.length === 1 ? 'the plate' : `the ${it.laminas.length} plates`}
                            </button>
                          )}
                          {it.videos.length > 0 && (
                            <button type="button" onClick={() => setWatch({ title: it.title, videos: it.videos })} className="inline-flex items-center gap-1.5" style={{ color: LINK }}>
                              <Play size={14} /> Watch{it.videos.length > 1 ? ` · ${it.videos.length}` : ''}
                            </button>
                          )}
                          {h.teach && <a href={h.teach} className="no-underline" style={{ color: LINK }}>Teach it →</a>}
                          <a href={h.open} className="no-underline" style={{ color: LINK }}>{h.openLabel} →</a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
      {show && <LaminaPresenter items={show.items} start={show.start} onClose={() => setShow(null)} />}
      {watch && (
        <div role="dialog" aria-modal="true" aria-label={`Videos · ${watch.title}`} className="fixed inset-0 z-[250] flex items-center justify-center p-3" style={{ background: 'rgba(6,28,43,.85)' }} onClick={() => setWatch(null)}>
          <div className="w-full max-w-3xl rounded-lg p-4" style={{ background: '#F7F9FA' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <p className="min-w-0 flex-1 text-[16px] font-bold leading-snug" style={{ color: INK }}>{watch.title}</p>
              <button type="button" autoFocus onClick={() => setWatch(null)} aria-label="Close" className="p-1.5 rounded-full" style={{ color: INK }}><X size={20} /></button>
            </div>
            <VideoList videos={watch.videos} />
          </div>
        </div>
      )}
    </div>
  );
}
