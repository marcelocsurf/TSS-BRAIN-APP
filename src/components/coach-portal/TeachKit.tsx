'use client';

// ═══ TEACH IT · el material del coach para dar ESA clase ═══
//
// Marcelo (2026-09-24): "quiero algo que sea herramienta para el coach para
// cuando va a impartir clases… que entre a la secuencia y tenga ahí su
// material didáctico para enseñar, fácil de llegar".
//
// El coach tenía DOS puertas que no se hablaban: Cursos lo llevaba a la
// secuencia (la explicación) y Herramientas a una lista de pasos (los drills).
// Para dar una clase de Pumping tenía que salir de una y entrar a la otra, y
// los seis juegos no salían por ninguna. Acá las herramientas van HACIA la
// secuencia, en el orden en que se da una clase: qué digo, qué muestro, qué
// les pongo a hacer, qué vigilo.
//
// No hay contenido nuevo: todo sale de lo que ya existe (la config de la
// secuencia, drills_missions, coach_resources y la capa COACH-* de lessons).

import { useState } from 'react';
import { MarkdownContent } from '@/components/course/MarkdownContent';
import { WaveGuide, WAVE_KIT_SEQUENCE } from '@/components/portal/sequence-page/WaveGuide';
import type { SequencePageConfig } from '@/lib/sequence-pages/types';
import { ChevronDown, Play, Presentation, X, ArrowLeft, ArrowRight } from 'lucide-react';

const INK = '#061C2B', NAVY = '#10263B', PAPER = '#F7F9FA', SAND = '#E9E2D2', BORDER = '#DCD7C6', MUTED = '#55666E', CYAN = '#00D2FF';
const MONO: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.14em' };
const DISPLAY: React.CSSProperties = { fontFamily: 'var(--font-archivo), Archivo, sans-serif' };

export interface TeachPiece {
  id: string;
  type: 'drill' | 'mission' | 'game';
  title: string;
  description_md: string | null;
  key_words: string[] | null;
  time_estimate: string | null;
  reps_recommended: string | null;
}
export interface TeachLayer { stepId: string; title: string; what: string; deliver: string; errors: string; validate: string }

export function TeachKit({
  cfg, video, pieces, layers, cue, token, waveDirection = 'right', focus = null,
}: {
  cfg: SequencePageConfig;
  video: { url: string; title: string } | null;
  pieces: TeachPiece[];
  layers: TeachLayer[];
  /** "The cue you will hear" de la lección del paso principal. */
  cue: string;
  token: string;
  waveDirection?: 'left' | 'right';
  /** El puente (Marcelo 2026-09-24): el coach llegó desde un veredicto —
   *  "lo frenó la rotación" — y esta pantalla tiene que abrirse en eso. */
  focus?: { title: string; from?: string } | null;
}) {
  const [present, setPresent] = useState(false);

  const words = cfg.think?.keyWords?.[0]?.words ?? [];
  // El veredicto viene con el título del momento ("Rotation · lead with the
  // oblique"); los detalles tienen el suyo ("1 · Rotation · lead with the
  // oblique · get on the rail"). Se abre el que más palabras comparte: no
  // hay ids que casen entre las dos listas y no quiero inventar un mapa.
  const norm = (t: string) => new Set(String(t).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 3));
  const focusKey = (() => {
    if (!focus?.title) return null;
    const want = norm(focus.title);
    let best: { key: string; score: number } | null = null;
    for (const d of (cfg.details ?? []) as any[]) {
      const score = [...norm(d.title)].filter((w) => want.has(w)).length;
      if (score >= 2 && (!best || score > best.score)) best = { key: d.key, score };
    }
    return best?.key ?? null;
  })();
  const drills = pieces.filter((p) => p.type === 'drill');
  const missions = pieces.filter((p) => p.type === 'mission');
  const games = pieces.filter((p) => p.type === 'game');
  const label = cfg.eyebrow ? cfg.title : `#${cfg.number} · ${cfg.title}`;

  if (present) return <Present cfg={cfg} words={words} cue={cue} missions={missions} waveDirection={waveDirection} onClose={() => setPresent(false)} />;

  return (
    <div className="min-h-screen" style={{ background: PAPER }}>
      {/* Cabecera */}
      <div style={{ background: INK }} className="px-5 pt-5 pb-4">
        <a href={`/coach-portal/${token}?tab=courses`} className="inline-flex items-center gap-1.5 text-[13px] font-bold no-underline" style={{ color: CYAN }}>
          <ArrowLeft size={14} /> Sequences
        </a>
        <p className="text-[11px] mt-3 mb-1" style={{ ...MONO, color: CYAN }}>
          Teach it · {cfg.eyebrow ?? `Sequence #${cfg.number}`} · {String(cfg.belt ?? '').replace('_belt', '')}
        </p>
        <h1 className="text-[27px] leading-[1.03] m-0" style={{ ...DISPLAY, fontWeight: 900, color: PAPER }}>{cfg.title}</h1>
        {cfg.think?.whatIs?.headline && (
          <p className="text-[14px] leading-snug mt-2 mb-0" style={{ color: 'rgba(247,249,250,.86)' }}>{cfg.think.whatIs.headline}</p>
        )}
        <div className="flex gap-2 mt-4">
          <button type="button" onClick={() => setPresent(true)}
            className="flex-1 min-h-[44px] rounded-[5px] inline-flex items-center justify-center gap-2 text-[14px] font-black uppercase"
            style={{ ...DISPLAY, background: CYAN, color: INK, letterSpacing: '0.03em' }}>
            <Presentation size={16} /> Present it
          </button>
          <a href={`/coach-portal/${token}/seq/${cfg.id}`}
            className="flex-1 min-h-[44px] rounded-[5px] inline-flex items-center justify-center text-[14px] font-bold no-underline"
            style={{ border: '1px solid rgba(247,249,250,.35)', color: PAPER }}>
            The full page
          </a>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {focus?.title && (
          <div className="rounded-[8px] px-4 py-3" style={{ background: '#FFF4D6', border: '1px solid #E0A62B' }}>
            <p className="text-[11px] m-0 mb-1" style={{ ...MONO, color: '#9A6A12' }}>You came here for{focus.from ? ` · ${focus.from}` : ''}</p>
            <p className="text-[17px] font-extrabold leading-snug m-0" style={{ ...DISPLAY, color: INK }}>{focus.title}</p>
            <p className="text-[12.5px] m-0 mt-1" style={{ color: '#7a5c00' }}>
              {focusKey ? 'Open below: what it looks like when it breaks, and the sentence that fixes it.' : 'Everything for this sequence is below.'}
            </p>
          </div>
        )}

        {/* 1 · QUÉ DIGO */}
        <Block n={1} title="Say it" hint="The words, in the order you say them.">
          {words.length > 0 && (
            <ol className="m-0 p-0 list-none space-y-1.5">
              {words.map((w, i) => (
                <li key={w} className="flex items-start gap-2.5">
                  <span className="shrink-0 w-6 h-6 rounded-full inline-flex items-center justify-center text-[12px] font-black" style={{ background: INK, color: CYAN }}>{i + 1}</span>
                  <span className="text-[16px] font-bold leading-snug pt-0.5" style={{ color: INK }}>{w}</span>
                </li>
              ))}
            </ol>
          )}
          {cue && (
            <div className="mt-3 rounded-[5px] px-3 py-2.5" style={{ background: SAND }}>
              <p className="text-[11px] m-0 mb-1" style={{ ...MONO, color: MUTED }}>The cue they will hear</p>
              <div className="text-[14px] leading-snug" style={{ color: INK }}><MarkdownContent markdown={cue} /></div>
            </div>
          )}
          {(cfg.think?.whatIs?.where || cfg.think?.whatIs?.whatFor) && (
            <div className="mt-3 space-y-1.5">
              {cfg.think?.whatIs?.where && <Line k="Where on the wave" v={cfg.think.whatIs.where} />}
              {cfg.think?.whatIs?.whatFor && <Line k="What it buys them" v={cfg.think.whatIs.whatFor} />}
            </div>
          )}
        </Block>

        {/* 2 · QUÉ MUESTRO */}
        <Block n={2} title="Show it" hint="Hold up the phone. This is what they look at.">
          {video ? <Video url={video.url} title={video.title} /> : (
            <p className="text-[13px] m-0" style={{ color: MUTED }}>No video for this one yet. The drawing below still does the job.</p>
          )}
          {cfg.think?.board && (
            <div className="mt-3">
              <WaveGuide data={cfg.think.board} title={`${cfg.title} on the wave face`} waveDirection={waveDirection} kitSequence={WAVE_KIT_SEQUENCE[cfg.id]} legendColor={MUTED} />
            </div>
          )}
        </Block>

        {/* 3 · QUÉ LES PONGO A HACER */}
        <Block n={3} title="Run it" hint={`${drills.length} on land · ${missions.length} in the water${games.length ? ` · ${games.length} to play` : ''}`}>
          <Group label="On land · rehearsal, nothing to log" items={drills} />
          <Group label="In the water · the mission" items={missions} />
          {games.length > 0 && <Group label="Play it · one rule, the wave is the referee" items={games} />}
          {drills.length + missions.length + games.length === 0 && (
            <p className="text-[13px] m-0" style={{ color: MUTED }}>Nothing indexed for these steps yet.</p>
          )}
        </Block>

        {/* 4 · QUÉ VIGILO */}
        <Block n={4} title="Watch for" hint="What breaks it, and the one thing you say to fix it.">
          <div className="space-y-2">
            {(cfg.details ?? []).map((d: any) => (
              <details key={d.key} open={d.key === focusKey} className="rounded-[5px]" style={{ background: PAPER, border: d.key === focusKey ? '1.5px solid #E0A62B' : `1px solid ${BORDER}` }}>
                <summary className="cursor-pointer list-none px-3 py-2.5 flex items-center justify-between gap-2">
                  <span className="text-[14px] font-bold" style={{ color: INK }}>{d.title}</span>
                  <ChevronDown size={16} style={{ color: MUTED }} />
                </summary>
                <div className="px-3 pb-3 space-y-2">
                  {d.symptom && <p className="text-[13px] leading-snug m-0" style={{ color: MUTED }}>{d.symptom}</p>}
                  {(d.indicators ?? []).map((i: any, k: number) => (
                    <div key={k} className="rounded-[5px] px-2.5 py-2" style={{ background: SAND }}>
                      <p className="text-[13px] leading-snug m-0" style={{ color: INK }}>{i.ok}</p>
                      {i.no && <p className="text-[13px] leading-snug m-0 mt-1" style={{ color: '#9A6A12' }}>{i.no}</p>}
                      {i.fix && <p className="text-[13px] font-bold leading-snug m-0 mt-1" style={{ color: INK }}>Say: “{i.fix}”</p>}
                    </div>
                  ))}
                </div>
              </details>
            ))}
            {layers.map((l) => (
              (l.errors || l.validate) && (
                <details key={l.stepId} className="rounded-[5px]" style={{ background: PAPER, border: `1px solid ${BORDER}` }}>
                  <summary className="cursor-pointer list-none px-3 py-2.5 flex items-center justify-between gap-2">
                    <span className="text-[14px] font-bold" style={{ color: INK }}>{l.title} · your notes</span>
                    <ChevronDown size={16} style={{ color: MUTED }} />
                  </summary>
                  <div className="px-3 pb-3 text-[13px]" style={{ color: INK }}>
                    {l.errors && <MarkdownContent markdown={l.errors} />}
                    {l.validate && <MarkdownContent markdown={l.validate} />}
                  </div>
                </details>
              )
            ))}
          </div>
        </Block>

        <p className="text-[12px] leading-snug px-1 pb-4 m-0" style={{ color: MUTED }}>
          Everything here already lives in the method. Nothing was written for this screen.
        </p>
      </div>
    </div>
  );
}

function Block({ n, title, hint, children }: { n: number; title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[8px] p-4" style={{ background: SAND, border: `1px solid ${BORDER}` }}>
      <div className="flex items-baseline gap-2.5 mb-1">
        <span className="shrink-0 w-7 h-7 rounded-[5px] inline-flex items-center justify-center text-[13px] font-black" style={{ ...MONO, background: NAVY, color: CYAN, letterSpacing: 0 }}>{n}</span>
        <h2 className="text-[20px] m-0 leading-none" style={{ ...DISPLAY, fontWeight: 900, color: INK }}>{title}</h2>
      </div>
      <p className="text-[12.5px] m-0 mb-3 ml-[38px]" style={{ color: MUTED }}>{hint}</p>
      <div>{children}</div>
    </section>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <p className="text-[13px] leading-snug m-0" style={{ color: INK }}>
      <span className="text-[11px] mr-1.5" style={{ ...MONO, color: MUTED }}>{k}</span>{v}
    </p>
  );
}

function Group({ label, items }: { label: string; items: TeachPiece[] }) {
  if (!items.length) return null;
  return (
    <div className="mb-3 last:mb-0">
      <p className="text-[11px] m-0 mb-1.5" style={{ ...MONO, color: MUTED }}>{label}</p>
      <div className="space-y-1.5">
        {items.map((p) => {
          const md = (p.description_md ?? '').trim();
          return (
            <details key={p.id} className="rounded-[5px]" style={{ background: PAPER, border: `1px solid ${BORDER}` }}>
              <summary className="cursor-pointer list-none px-3 py-2.5 flex items-center justify-between gap-2">
                <span className="min-w-0">
                  <span className="block text-[14px] font-bold leading-snug" style={{ color: INK }}>{p.title}</span>
                  {(p.time_estimate || p.reps_recommended) && (
                    <span className="block text-[12px] mt-0.5" style={{ color: MUTED }}>
                      {[p.time_estimate, p.reps_recommended ? `${p.reps_recommended} reps` : null].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </span>
                <ChevronDown size={16} className="shrink-0" style={{ color: MUTED }} />
              </summary>
              <div className="px-3 pb-3 text-[13.5px] leading-snug" style={{ color: INK }}>
                {md ? (md.startsWith('#') || /\n\s*[-*] /.test(md) ? <MarkdownContent markdown={md} /> : <p className="m-0">{md}</p>) : <p className="m-0" style={{ color: MUTED }}>No instructions written yet.</p>}
                {(p.key_words ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(p.key_words ?? []).map((w) => (
                      <span key={w} className="px-2 py-1 rounded-full text-[12px] font-semibold" style={{ background: SAND, color: INK }}>{w}</span>
                    ))}
                  </div>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}

function Video({ url, title }: { url: string; title: string }) {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{6,})/);
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  const src = yt ? `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1` : vm ? `https://player.vimeo.com/video/${vm[1]}` : null;
  if (!src) return <video src={url} controls playsInline preload="metadata" className="w-full block rounded-[5px]" title={title} />;
  return (
    <div className="relative w-full rounded-[5px] overflow-hidden" style={{ paddingTop: '56.25%', background: NAVY }}>
      <iframe src={src} title={title} className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
    </div>
  );
}

// ─── Modo presentación: una idea por pantalla, letra grande ───
// Marcelo: "que le sirva como usarlo tipo una presentación". Mismo contenido,
// sin nada nuevo que escribir.
function Present({ cfg, words, cue, missions, waveDirection, onClose }: {
  cfg: SequencePageConfig; words: string[]; cue: string; missions: TeachPiece[]; waveDirection: 'left' | 'right'; onClose: () => void;
}) {
  const slides: { kind: 'text' | 'wave'; eyebrow?: string; big?: string; small?: string }[] = [
    { kind: 'text', eyebrow: cfg.eyebrow ?? `Sequence #${cfg.number}`, big: cfg.title, small: cfg.think?.whatIs?.headline ?? '' },
    ...words.map((w, i) => ({ kind: 'text' as const, eyebrow: `${i + 1} of ${words.length}`, big: w })),
    ...(cfg.think?.board ? [{ kind: 'wave' as const, eyebrow: 'The line you are drawing', small: cfg.think?.whatIs?.line ?? '' }] : []),
    ...(cue ? [{ kind: 'text' as const, eyebrow: 'The cue', big: cue.replace(/^>\s*/gm, '').replace(/["“”]/g, '').trim() }] : []),
    ...missions.slice(0, 3).map((m) => ({ kind: 'text' as const, eyebrow: 'In the water', big: m.title, small: (m.description_md ?? '').replace(/[#*>`]/g, '').split('\n').filter(Boolean)[1] ?? '' })),
  ];
  const [i, setI] = useState(0);
  const s = slides[Math.min(i, slides.length - 1)];
  return (
    <div className="fixed inset-0 z-[100] flex flex-col" style={{ background: INK, paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-[12px]" style={{ ...MONO, color: 'rgba(247,249,250,.6)' }}>{i + 1} / {slides.length}</span>
        <button type="button" onClick={onClose} aria-label="Close" className="w-11 h-11 inline-flex items-center justify-center rounded-full" style={{ background: 'rgba(247,249,250,.1)', color: PAPER }}>
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 flex flex-col justify-center px-6 min-h-0">
        {s.eyebrow && <p className="text-[13px] m-0 mb-3" style={{ ...MONO, color: CYAN }}>{s.eyebrow}</p>}
        {s.kind === 'wave' && cfg.think?.board ? (
          <WaveGuide data={cfg.think.board} title={`${cfg.title} on the wave face`} waveDirection={waveDirection} kitSequence={WAVE_KIT_SEQUENCE[cfg.id]} legendColor="rgba(247,249,250,.8)" />
        ) : (
          <p className="m-0" style={{ ...DISPLAY, fontWeight: 900, color: PAPER, fontSize: 'clamp(30px, 8vw, 52px)', lineHeight: 1.04 }}>{s.big}</p>
        )}
        {s.small && <p className="text-[16px] leading-snug mt-4 mb-0" style={{ color: 'rgba(247,249,250,.8)' }}>{s.small}</p>}
      </div>
      <div className="flex gap-2 px-4 pb-4">
        <button type="button" onClick={() => setI((n) => Math.max(0, n - 1))} disabled={i === 0}
          className="flex-1 min-h-[52px] rounded-[5px] inline-flex items-center justify-center disabled:opacity-30"
          style={{ border: '1px solid rgba(247,249,250,.35)', color: PAPER }} aria-label="Previous">
          <ArrowLeft size={20} />
        </button>
        <button type="button" onClick={() => setI((n) => Math.min(slides.length - 1, n + 1))} disabled={i >= slides.length - 1}
          className="flex-[2] min-h-[52px] rounded-[5px] inline-flex items-center justify-center gap-2 text-[15px] font-black uppercase disabled:opacity-30"
          style={{ ...DISPLAY, background: CYAN, color: INK, letterSpacing: '0.03em' }} aria-label="Next">
          Next <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

export { Play };
