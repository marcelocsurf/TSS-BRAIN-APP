'use client';

// ═══ THE THREE CIRCLES OF POWER — fundamentos: entender y sentir ═══
// Marcelo (2026-09-09): Think + Feel, sin Do en cuerpo y tabla; la ola lleva
// juego; compresión-extensión en amarillo; los colores del lenguaje desde acá.
//
// Diseño (2026-09-12, línea aprobada por Marcelo · TSS_Design_Handoff): fondo
// navy, tarjetas crema, un color por círculo (Body cyan · Board amarillo ·
// Wave violeta), logo original, nav inferior blanca. Los dibujos de la tabla
// y las dos fuerzas son los PNG exactos del paquete. TODO el contenido
// (textos, orden, drills, links) es el mismo de antes: solo cambia cómo se ve.
import { useState } from 'react';
import { markLessonComplete } from '@/lib/actions/course';
import { MarkdownContent } from '@/components/course/MarkdownContent';
import { WaveBoard, COMMAND_COLORS, HOLD_COLOR } from './WaveBoard';
import { CIRCLES, CIRCLES_INTRO, type Circle } from '@/lib/sequence-pages/three-circles';
import type { WaveBoardData } from '@/lib/sequence-pages/types';
import type { PieceRow } from './SequencePage';

const INK = '#10263B', NAVY = '#061C2B', CYAN = '#00D2FF', MUTED = '#55666E', PAPER = '#F8F5EC', BORDER = '#DCD7C6';
const CIRCLE_COLOR: Record<Circle['key'], string> = { body: 'var(--tss-circle-body)', board: 'var(--tss-circle-board)', wave: 'var(--tss-circle-wave)' };
const SUBTITLE: Record<Circle['key'], string> = { body: 'P · R · C · H — the four movements.', board: 'Connect through your feet.', wave: 'Two energies. One line.' };
const MONO: React.CSSProperties = { fontFamily: 'var(--tss-mono)', fontSize: 12, fontWeight: 500, letterSpacing: '0.045em', textTransform: 'uppercase' };

// La ola del círculo 3: cerca del pocket, alejarse, volver — nunca al flat.
const WAVE_GAME_BOARD: WaveBoardData = {
  pocket: { x: 100, y: 70 },
  segments: [
    { d: 'M130,95 C160,120 190,175 235,185', command: 'rail' },
    { d: 'M235,185 C275,190 300,140 325,100', command: 'projection' },
    { d: 'M325,100 C338,82 356,80 366,94', command: 'maneuver' },
    { d: 'M366,94 C385,130 410,180 455,188', command: 'rail' },
    { d: 'M455,188 C495,192 520,145 545,105', command: 'projection' },
    { d: 'M545,105 C558,86 576,84 586,98', command: 'maneuver' },
    { d: 'M586,98 C605,125 625,150 645,160', command: 'rail' },
  ],
  markers: [{ x: 130, y: 95, label: 'I' }, { x: 366, y: 94, label: 'M' }, { x: 645, y: 160, label: 'S' }],
};

function Dot({ command, hold, size = 10 }: { command: keyof typeof COMMAND_COLORS; hold?: boolean; size?: number }) {
  return <i className="inline-block rounded-full shrink-0" style={{ width: size, height: size, background: hold ? 'transparent' : COMMAND_COLORS[command], boxShadow: hold ? `0 0 0 2.5px ${HOLD_COLOR}` : '0 0 0 1px rgba(16,38,59,.15)' }} />;
}

/** Drill/juego dentro de una tarjeta crema. Los drills son ensayo: se hacen, no se registran. */
function Piece({ p, canTrack }: { p?: PieceRow; canTrack: boolean }) {
  if (!p) return null;
  const md = (p.description_md ?? '').trim();
  return (
    <div className="mt-2 rounded-[5px] px-3 py-2.5" style={{ background: PAPER, border: `1px solid ${BORDER}` }}>
      <p className="text-[14px] font-bold" style={{ color: INK }}>{p.title}</p>
      {md && (md.startsWith('#') ? <div className="mt-1 text-[14px]" style={{ color: INK }}><MarkdownContent markdown={md} /></div> : <p className="text-[14px] mt-1 leading-snug" style={{ color: INK }}>{md}</p>)}
      <p className="mt-1.5" style={{ ...MONO, color: MUTED, textTransform: 'none', letterSpacing: 0 }}>{canTrack ? 'Rehearsal · no need to log it' : 'Rehearsal'}</p>
    </div>
  );
}

function Card({ title, children, color, id }: { title?: string; children: React.ReactNode; color?: string; id?: string }) {
  return (
    <section id={id} className="tss-card" style={color ? { borderTop: `4px solid ${color}` } : undefined}>
      {title && <h2 className="tss-section-title">{title}</h2>}
      {children}
    </section>
  );
}

function Acc({ title, open = false, children, lead }: { title: React.ReactNode; open?: boolean; children: React.ReactNode; lead?: React.ReactNode }) {
  return (
    <details className="tss-accordion" open={open}>
      <summary>{lead ? <span className="inline-flex items-center gap-2.5">{lead}{title}</span> : title}<Chevron /></summary>
      <div className="px-3 pb-3 text-[14px] leading-[1.45]" style={{ color: INK }}>{children}</div>
    </details>
  );
}

function Chevron() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>;
}

function Icon({ name }: { name: 'home' | 'course' | 'play' | 'back' | 'link' | 'arrow' }) {
  const p: Record<string, React.ReactNode> = {
    home: <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
    course: <><path d="M2 8.5 12 4l10 4.5-10 4.5z" /><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" /></>,
    play: <path d="M7 4.5v15l12-7.5z" />,
    back: <path d="M15 5l-7 7 7 7" />,
    link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5" /></>,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  };
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{p[name]}</svg>;
}

export function ThreeCirclesPage({ token, pieces, canTrack, video, lessonId }: {
  token: string;
  pieces: Record<string, PieceRow>;
  canTrack: boolean;
  video?: { url: string; title: string } | null;
  lessonId: string;
}) {
  const [key, setKey] = useState<Circle['key']>('body');
  const [pos, setPos] = useState<'P1' | 'P2' | 'P3'>('P2');
  const portal = `/portal/${token}`;
  const cur = CIRCLES.find((c) => c.key === key)!;
  const feet = cur.feet ?? [];
  const posRow = feet.find((f) => f.pos === pos) ?? feet[0];

  return (
    <section className="tss" data-screen={key}>
      <div className="tss-main">
        <header>
          <div className="tss-brand-row">
            <svg className="tss-logo" viewBox="180 183 960 269" role="img" aria-label="The Surf Sequence — Evolve through play"><image href="/tss/assets/tss-logo-original-white.png" width="1312" height="654" /></svg>
          </div>
          <a className="tss-back" href={`${portal}?tab=course`}><Icon name="back" />Course</a>
          <h1>0{cur.n} / {cur.label}</h1>
          <p className="tss-subtitle">{SUBTITLE[cur.key]}</p>
          <nav className="tss-circle-nav" aria-label="Three Circles">
            {CIRCLES.map((c) => (
              <button key={c.key} type="button" style={{ '--circle-color': CIRCLE_COLOR[c.key] } as React.CSSProperties} data-active={key === c.key} aria-current={key === c.key ? 'page' : undefined} onClick={() => setKey(c.key)}>
                <span className="tss-circle-number">{c.n}</span>{c.label}
              </button>
            ))}
          </nav>
        </header>

        {/* ── Qué son los tres círculos: el mismo texto de siempre, plegado ── */}
        {key === 'body' && (
          <Card>
            <Acc title={CIRCLES_INTRO.title}>
              {video && <Video url={video.url} title={video.title} />}
              <p className="font-bold">{CIRCLES_INTRO.headline}</p>
              <p className="mt-2">{CIRCLES_INTRO.what}</p>
              <p className="mt-2">{CIRCLES_INTRO.three}</p>
              <p className="mt-2" style={{ color: MUTED }}>{CIRCLES_INTRO.when}</p>
              <p className="mt-3 font-bold">The language starts here</p>
              <p className="mt-1">{CIRCLES_INTRO.language}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-[13px] font-semibold">
                <span className="inline-flex items-center gap-1.5"><Dot command="posture" />Posture</span>
                <span className="inline-flex items-center gap-1.5"><Dot command="rail" />Rotation / rail</span>
                <span className="inline-flex items-center gap-1.5"><Dot command="projection" />Compression · extension</span>
                <span className="inline-flex items-center gap-1.5"><Dot command="rail" hold />Hold</span>
              </div>
            </Acc>
            <p className="tss-intro mt-3 mb-0">{cur.question}</p>
            <p className="text-[14px] leading-[1.45] mt-1" style={{ color: INK }}>{cur.intro}</p>
          </Card>
        )}

        {/* ── 1 · BODY: los cuatro movimientos ── */}
        {cur.moves && (
          <Card title="Think it · the four movements" color={CIRCLE_COLOR.body}>
            {cur.moves.map((m, i) => (
              <Acc key={m.key} open={i === 0} lead={<Dot command={m.command} hold={m.hold} />} title={m.name}>
                <p>{m.what}</p>
                <ul className="mt-2 space-y-1.5">
                  {m.think.map((b, j) => <li key={j} className="flex gap-2 leading-snug"><span style={{ color: m.hold ? HOLD_COLOR : COMMAND_COLORS[m.command] }}>•</span><span>{b}</span></li>)}
                </ul>
                {m.feels && (
                  <div className="tss-timing mt-3"><div><h3>How it feels</h3><p>{m.feels}</p></div></div>
                )}
                <p className="mt-3" style={{ ...MONO, color: MUTED }}>Feel it · on land</p>
                {m.feel.map((id) => <Piece key={id} p={pieces[id]} canTrack={canTrack} />)}
                <a href={`${portal}?tab=course&lesson=${m.lessonId}`} className="inline-block mt-3 text-[14px] font-bold" style={{ color: '#005F79' }}>Go deeper → {m.lessonLabel}</a>
              </Acc>
            ))}
          </Card>
        )}

        {/* ── 2 · BOARD: la tabla exacta + P1/P2/P3 ── */}
        {cur.feet && (
          <>
            <Card color={CIRCLE_COLOR.board}>
              <p className="tss-intro">Your back foot changes the line.<br />Your front foot controls how the rail responds.</p>
              <p className="text-[14px] leading-[1.45] mb-3" style={{ color: INK }}>{cur.intro}</p>
              <figure className="tss-board-figure">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/tss/assets/board-figure-exact.png" width="352" height="362" alt="Board viewed from above: target D at the front foot; P1 yellow at the tail, P2 pink above it, P3 green further forward. The nose points up." />
              </figure>
              <div className="tss-position-selector" role="group" aria-label="Back-foot position">
                {(['P1', 'P2', 'P3'] as const).map((p) => <button type="button" key={p} aria-pressed={pos === p} onClick={() => setPos(p)}>{p}</button>)}
              </div>
              {posRow && (
                <div className="tss-position-copy" aria-live="polite">
                  <h2>{posRow.label}</h2>
                  <p>{posRow.line}</p>
                  <p style={{ color: MUTED }}>{posRow.energy}</p>
                </div>
              )}
              <dl className="tss-position-summary">
                {feet.map((f) => <div key={f.pos}><dt>{f.label}</dt><dd>{f.energy.split('.')[0]}</dd></div>)}
              </dl>
            </Card>
            <Card title="The front foot · centre and rails" color={CIRCLE_COLOR.board}>
              <ul className="space-y-2 text-[14px] leading-[1.45]" style={{ color: INK }}>
                {cur.frontFoot!.map((b, j) => <li key={j} className="flex gap-2"><span style={{ color: '#B8860B' }}>•</span><span>{b}</span></li>)}
              </ul>
            </Card>
            <Card title="Feel it · on land and on the skate" id="feel">
              {cur.feel!.map((id) => <Piece key={id} p={pieces[id]} canTrack={canTrack} />)}
              <a href={`${portal}?tab=course&lesson=${cur.lessonId}`} className="inline-block mt-3 text-[14px] font-bold" style={{ color: '#005F79' }}>Go deeper → {cur.lessonLabel}</a>
            </Card>
          </>
        )}

        {/* ── 3 · WAVE: las dos energías ── */}
        {cur.reads && (
          <>
            <Card title="Think it" color={CIRCLE_COLOR.wave}>
              <p className="text-[14px] leading-[1.45] mb-3" style={{ color: INK }}>{cur.intro}</p>
              {cur.energy?.map((e, i) => {
                const kind = /external/i.test(e.title) ? 'wave' : /internal/i.test(e.title) ? 'body' : /combine/i.test(e.title) ? 'timing' : null;
                if (kind === 'timing') {
                  return (
                    <div key={e.title} className="tss-timing"><span style={{ color: CYAN }}><Icon name="link" /></span><div><h3>{e.title}</h3><p>{e.note}</p></div></div>
                  );
                }
                return (
                  <div key={e.title} className="tss-force">
                    {kind ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/tss/assets/${kind === 'wave' ? 'wave-force-exact' : 'body-force-exact'}.png`} width="45" height="45" alt="" />
                    ) : (
                      <span className="w-10 text-center" style={{ ...MONO, color: '#7B4FBE', fontSize: 15, fontWeight: 900 }}>0{i + 1}</span>
                    )}
                    <div><div className="tss-eyebrow">0{i + 1} / {e.title}</div><p>{e.note}</p></div>
                  </div>
                );
              })}
              <p className="mt-3 text-[15px] font-bold leading-snug" style={{ color: INK }}>{cur.formula}</p>
              <div className="mt-3 rounded-[5px] p-2" style={{ background: NAVY }}>
                <WaveBoard data={WAVE_GAME_BOARD} title="Down, up, a maneuver at the top, down again — never to the flat" />
              </div>
            </Card>
            <Card title="Understand the wave" color={CIRCLE_COLOR.wave}>
              {cur.reads.map((r) => <Acc key={r.word} title={r.word} open={r.word === 'Pocket'}>{r.note}</Acc>)}
              <a className="tss-primary" href="#feel">Next: Feel it<Icon name="arrow" /></a>
            </Card>
            <Card title="Feel it · from the beach" id="feel">
              {cur.feel!.map((id) => <Piece key={id} p={pieces[id]} canTrack={canTrack} />)}
            </Card>
            {cur.game && (
              <Card title="Play it · the game" color={CIRCLE_COLOR.wave}>
                <h3 className="text-[26px] leading-[1.05] uppercase" style={{ fontWeight: 900, letterSpacing: '-0.02em', color: INK }}>{cur.game.name}</h3>
                <p className="text-[15px] mt-2 leading-snug font-semibold" style={{ color: INK }}>{cur.game.image}</p>
                <div className="tss-timing mt-3"><div><h3>The rule</h3><p style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 700, lineHeight: 1.35 }}>{cur.game.rule}</p></div></div>
                <p className="text-[14px] mt-3 leading-[1.45]" style={{ color: MUTED }}>{cur.game.how}</p>
                <a href={`${portal}?tab=course&lesson=${cur.lessonId}`} className="inline-block mt-3 text-[14px] font-bold" style={{ color: '#005F79' }}>Go deeper → {cur.lessonLabel}</a>
              </Card>
            )}
          </>
        )}

        {/* ── Dónde nacen los errores + cuál círculo falló ── */}
        <Card title="Where the errors are born" color="#FF6B6B">
          <p className="text-[14px] leading-[1.45]" style={{ color: INK }}>Most errors do not come from the bottom turn or the snap. They come from one of the three circles. Diagnose here before correcting the maneuver.</p>
          <div className="mt-2">
            {CIRCLES_INTRO.born.map((b) => (
              <div key={b.title} className="tss-force mt-1.5" style={{ alignItems: 'flex-start' }}>
                <i className="inline-block w-2.5 h-2.5 rounded-full shrink-0 mt-1.5" style={{ background: CIRCLE_COLOR[b.circle] }} />
                <div><p className="text-[14px] font-bold" style={{ color: INK }}>{b.title}</p><p>{b.note}</p></div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Which circle failed?">
          <p className="text-[14px] leading-[1.45]" style={{ color: INK }}>You have this framework when, after a wave that did not work, you can say which circle failed — not just “it went badly”. Try it on your next three waves; answer with one word.</p>
          <div className="mt-2 space-y-1.5">
            {CIRCLES_INTRO.diagnose.map((d) => <p key={d.circle} className="text-[14px] leading-snug" style={{ color: INK }}><span className="font-bold" style={{ color: CIRCLE_COLOR[d.circle.toLowerCase() as Circle['key']] === CIRCLE_COLOR.body ? '#005F79' : d.circle.toLowerCase() === 'board' ? '#8A6D00' : '#6A3FB0' }}>{d.circle}</span> · {d.q}</p>)}
          </div>
          <p className="text-[13px] mt-3" style={{ color: MUTED }}>If you can name the circle, you already know what to train tomorrow.</p>
          <div className="mt-3"><MarkReadButton token={token} lessonId={lessonId} portal={portal} /></div>
        </Card>
      </div>

      {/* Nav inferior blanca: los mismos destinos del portal. */}
      <nav className="tss-bottom-nav" aria-label="Main navigation"><div className="tss-bottom-nav-inner">
        <a href={`${portal}?tab=home`} className="flex flex-col items-center justify-center gap-1 min-h-[68px] text-[11px] font-bold uppercase" style={{ color: INK, letterSpacing: '0.055em' }}><Icon name="home" />Home</a>
        <a href={`${portal}?tab=course`} aria-current="page" className="relative flex flex-col items-center justify-center gap-1 min-h-[68px] text-[11px] font-bold uppercase" style={{ color: INK, letterSpacing: '0.055em' }}><span style={{ color: CYAN }}><Icon name="course" /></span>Course<span className="absolute bottom-[5px] w-[72%] h-1 rounded-full" style={{ background: CYAN }} /></a>
        <a href={`${portal}?tab=sequence`} className="flex flex-col items-center justify-center gap-1 min-h-[68px] text-[11px] font-bold uppercase" style={{ color: INK, letterSpacing: '0.055em' }}><Icon name="play" />Let&apos;s Play</a>
      </div></nav>
    </section>
  );
}

function Video({ url, title }: { url: string; title: string }) {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{6,})/);
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  const src = yt ? `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1` : vm ? `https://player.vimeo.com/video/${vm[1]}` : null;
  const box = 'relative w-full mb-3 rounded-[5px] overflow-hidden';
  if (src) return <div className={box} style={{ paddingTop: '56.25%' }}><iframe src={src} title={title} className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /></div>;
  return <video src={url} controls playsInline preload="metadata" className="w-full block mb-3 rounded-[5px]" title={title} />;
}

export function MarkReadButton({ token, lessonId, portal }: { token: string; lessonId: string; portal: string }) {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button type="button" disabled={state === 'busy' || state === 'done'}
        onClick={async () => {
          setState('busy');
          const r = await markLessonComplete(token, lessonId).catch(() => ({ ok: false }));
          setState((r as any)?.ok ? 'done' : 'error');
        }}
        className="inline-flex items-center justify-center gap-2 rounded-[5px] px-4 min-h-[44px] text-[14px] font-black uppercase tracking-wide disabled:opacity-80"
        style={state === 'done' ? { background: CYAN, color: NAVY } : { background: NAVY, color: '#FFFFFF' }}>
        {state === 'done' ? '✓ Marked as read' : state === 'busy' ? 'Saving…' : state === 'error' ? 'Could not save · try again' : 'Mark the lesson as read'}
      </button>
      {state === 'done' && <a href={`${portal}?tab=course`} className="text-[14px] font-bold" style={{ color: '#005F79' }}>Back to Course →</a>}
    </div>
  );
}
