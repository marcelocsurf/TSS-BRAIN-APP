'use client';

// ═══ THE THREE CIRCLES OF POWER — fundamentos: entender y sentir ═══
// Marcelo (2026-09-09): Think + Feel, sin Do en cuerpo y tabla; la ola lleva
// juego; compresión-extensión en amarillo; los colores del lenguaje desde acá.
import { useState } from 'react';
import { ArrowLeft, Play, Lock } from 'lucide-react';
import { MarkdownContent } from '@/components/course/MarkdownContent';
import { WaveBoard, COMMAND_COLORS, HOLD_COLOR } from './WaveBoard';
import { BoardMap } from './BoardMap';
import { ThreeCirclesDiagram } from './ThreeCirclesDiagram';
import { CIRCLES, CIRCLES_INTRO, type Circle } from '@/lib/sequence-pages/three-circles';
import type { WaveBoardData } from '@/lib/sequence-pages/types';
import type { PieceRow } from './SequencePage';

const INK = '#061C2B', PANEL = '#0A2438', PAPER = '#F7F9FA', CYAN = '#00D2FF', GOLD = '#FFD166', VIOLET = '#B388FF', GREEN = '#06D6A0';
const TEXT = 'rgba(247,249,250,.92)', MUTED = 'rgba(247,249,250,.62)';
const F_M: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: 10 };
const CIRCLE_COLOR: Record<Circle['key'], string> = { body: CYAN, board: GOLD, wave: VIOLET };

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

function Card({ eyebrow, color = CYAN, children }: { eyebrow: string; color?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl p-4" style={{ background: PANEL }}>
      <p className="mb-2" style={{ ...F_M, color }}>{eyebrow}</p>
      {children}
    </section>
  );
}

function Dot({ command, hold, size = 10 }: { command: keyof typeof COMMAND_COLORS; hold?: boolean; size?: number }) {
  return <i className="inline-block rounded-full shrink-0" style={{ width: size, height: size, background: hold ? 'transparent' : COMMAND_COLORS[command], boxShadow: hold ? `0 0 0 2.5px ${HOLD_COLOR}` : '0 0 0 2px rgba(255,255,255,.15)' }} />;
}

function Piece({ p, canTrack }: { p?: PieceRow; href?: string | null; canTrack: boolean }) {
  if (!p) return null;
  const md = (p.description_md ?? '').trim();
  return (
    <div className="py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
      <p className="text-[14px] font-semibold">{p.title}</p>
      {md && (md.startsWith('#') ? <div className="mt-1"><MarkdownContent markdown={md} /></div> : <p className="text-[13.5px] mt-1 leading-snug" style={{ color: TEXT }}>{md}</p>)}
      <div className="flex items-center gap-3 mt-1.5 text-[11px]" style={{ color: MUTED }}>
        {/* Los drills son ensayo: se hacen, no se registran (doctrina 2026-09-10). */}
        <span>{canTrack ? 'rehearsal · no need to log it' : 'rehearsal'}</span>
      </div>
    </div>
  );
}

export function ThreeCirclesPage({ token, pieces, canTrack, video, lessonId }: {
  token: string;
  pieces: Record<string, PieceRow>;
  canTrack: boolean;
  video?: { url: string; title: string } | null;
  lessonId: string;
}) {
  const [key, setKey] = useState<Circle['key']>('body');
  const portal = `/portal/${token}`;
  const cur = CIRCLES.find((c) => c.key === key)!;

  return (
    <div className="seq-dark min-h-screen pb-24 text-[15px]" style={{ background: INK, color: PAPER }}>
      <div className="max-w-lg md:max-w-2xl mx-auto px-4 pt-4">
        <a href={`${portal}?tab=course`} className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: CYAN }}><ArrowLeft size={14} /> Course</a>
        <p className="mt-3" style={{ ...F_M, color: CYAN }}>The fundamentals · body · board · wave</p>
        <h1 className="text-[26px] font-extrabold leading-tight mt-1" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%' }}>{CIRCLES_INTRO.title}</h1>
        <p className="text-[14px] mt-2" style={{ color: TEXT }}>{CIRCLES_INTRO.headline}</p>

        <div className="rounded-2xl overflow-hidden mt-4" style={{ background: PANEL }}>
          {video ? <Video url={video.url} title={video.title} /> : <div className="p-2"><ThreeCirclesDiagram active={key} /></div>}
        </div>

        <div className="space-y-3 mt-4">
          <Card eyebrow="01 · What it is">
            <p className="text-[14px] leading-relaxed" style={{ color: TEXT }}>{CIRCLES_INTRO.what}</p>
            <p className="text-[14px] mt-2 leading-relaxed" style={{ color: TEXT }}>{CIRCLES_INTRO.three}</p>
            <p className="text-[13.5px] mt-2 leading-relaxed" style={{ color: MUTED }}>{CIRCLES_INTRO.when}</p>
          </Card>
          <Card eyebrow="02 · The language starts here" color={GOLD}>
            <p className="text-[14px] leading-relaxed" style={{ color: TEXT }}>{CIRCLES_INTRO.language}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[13px]">
              <span className="inline-flex items-center gap-1.5 font-semibold"><Dot command="posture" />Posture</span>
              <span className="inline-flex items-center gap-1.5 font-semibold"><Dot command="rail" />Rotation / rail</span>
              <span className="inline-flex items-center gap-1.5 font-semibold"><Dot command="projection" />Compression · extension</span>
              <span className="inline-flex items-center gap-1.5 font-semibold"><Dot command="rail" hold />Hold</span>
            </div>
          </Card>

          {/* ── Body / Board / Wave ── */}
          <div className="grid grid-cols-3 gap-1 rounded-2xl p-1.5 sticky top-2 z-10" style={{ background: PANEL }} role="tablist">
            {CIRCLES.map((c) => (
              <button key={c.key} type="button" role="tab" aria-selected={key === c.key} onClick={() => setKey(c.key)}
                className="rounded-xl py-2 text-center" style={key === c.key ? { background: '#132840', boxShadow: `inset 0 0 0 1px ${CIRCLE_COLOR[c.key]}77` } : {}}>
                <span className="block text-[14px] font-bold" style={{ color: key === c.key ? CIRCLE_COLOR[c.key] : PAPER }}>{c.n} · {c.label}</span>
                <span className="block text-[10px]" style={{ color: MUTED }}>{c.sub}</span>
              </button>
            ))}
          </div>

          <Card eyebrow={`Circle ${cur.n} · ${cur.label} · ${cur.question}`} color={CIRCLE_COLOR[cur.key]}>
            <p className="text-[14px] leading-relaxed" style={{ color: TEXT }}>{cur.intro}</p>
          </Card>

          {/* Cuerpo: cuatro movimientos */}
          {cur.moves && (
            <Card eyebrow="Think it · the four movements" color={CIRCLE_COLOR[cur.key]}>
              {cur.moves.map((m, i) => (
                <details key={m.key} className="group" open={i === 0} style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
                  <summary className="cursor-pointer list-none flex items-center gap-2.5 py-3">
                    <Dot command={m.command} hold={m.hold} />
                    <span className="text-[15px] font-semibold flex-1" style={{ color: PAPER }}>{m.name}</span>
                    <span className="transition-transform group-open:rotate-90" style={{ color: MUTED }}>›</span>
                  </summary>
                  <div className="pb-4 pl-5">
                    <p className="text-[14px] leading-relaxed" style={{ color: PAPER }}>{m.what}</p>
                    <ul className="mt-2 space-y-1.5">
                      {m.think.map((b, j) => <li key={j} className="flex gap-2 text-[13.5px] leading-snug" style={{ color: TEXT }}><span style={{ color: m.hold ? HOLD_COLOR : COMMAND_COLORS[m.command] }}>•</span><span>{b}</span></li>)}
                    </ul>
                    {m.feels && <p className="text-[13.5px] mt-2 leading-relaxed rounded-xl px-3 py-2.5" style={{ background: 'rgba(0,210,255,.07)', color: PAPER }}><span style={{ ...F_M, color: VIOLET }}>How it feels · </span>{m.feels}</p>}
                    <p className="mt-3" style={{ ...F_M, color: GREEN }}>Feel it · on land</p>
                    {m.feel.map((id) => <Piece key={id} p={pieces[id]} canTrack={canTrack} />)}
                    <a href={`${portal}?tab=course&lesson=${m.lessonId}`} className="inline-block mt-2 text-[13px] font-semibold" style={{ color: CYAN }}>Go deeper → {m.lessonLabel}</a>
                  </div>
                </details>
              ))}
            </Card>
          )}

          {/* Tabla */}
          {cur.feet && (
            <>
              <Card eyebrow="Think it · the back foot · the line you can draw" color={CIRCLE_COLOR[cur.key]}>
                <div className="flex gap-4 items-start">
                  <BoardMap />
                  <div className="min-w-0 flex-1">
                    {cur.feet.map((f) => (
                      <div key={f.pos} className="py-2" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
                        <span className="font-mono font-bold text-[13px]" style={{ color: PAPER }}>{f.label}</span>
                        <p className="text-[13px] leading-snug mt-0.5" style={{ color: TEXT }}>{f.line}</p>
                        <p className="text-[12.5px] leading-snug" style={{ color: MUTED }}>{f.energy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              <Card eyebrow="Think it · the front foot · centre and rails" color={CIRCLE_COLOR[cur.key]}>
                <ul className="space-y-1.5">
                  {cur.frontFoot!.map((b, j) => <li key={j} className="flex gap-2 text-[13.5px] leading-snug" style={{ color: TEXT }}><span style={{ color: GOLD }}>•</span><span>{b}</span></li>)}
                </ul>
              </Card>
              <Card eyebrow="Feel it · on land and on the skate" color={GREEN}>
                {cur.feel!.map((id) => <Piece key={id} p={pieces[id]} canTrack={canTrack} />)}
                <a href={`${portal}?tab=course&lesson=${cur.lessonId}`} className="inline-block mt-2 text-[13px] font-semibold" style={{ color: CYAN }}>Go deeper → {cur.lessonLabel}</a>
              </Card>
            </>
          )}

          {/* Ola */}
          {cur.reads && (
            <>
              <Card eyebrow="Think it · what you read on the wave" color={CIRCLE_COLOR[cur.key]}>
                <WaveBoard data={WAVE_GAME_BOARD} title="Down, up, a maneuver at the top, down again — never to the flat" />
                {cur.energy && (
                  <ol className="mt-3 space-y-2">
                    {cur.energy.map((e, i) => (
                      <li key={e.title} className="flex gap-2.5">
                        <span className="font-mono text-[11px] font-bold shrink-0 mt-0.5" style={{ color: VIOLET }}>0{i + 1}</span>
                        <div><p className="text-[14px] font-semibold" style={{ color: PAPER }}>{e.title}</p><p className="text-[13.5px] leading-snug" style={{ color: TEXT }}>{e.note}</p></div>
                      </li>
                    ))}
                  </ol>
                )}
                <p className="text-[14px] mt-3 leading-relaxed rounded-xl px-3 py-2.5" style={{ background: 'rgba(179,136,255,.10)', color: PAPER }}>{cur.formula}</p>
                <div className="mt-2">
                  {cur.reads.map((r) => <p key={r.word} className="text-[13.5px] leading-snug py-1" style={{ color: TEXT }}><span className="font-semibold" style={{ color: PAPER }}>{r.word}</span> · {r.note}</p>)}
                </div>
              </Card>
              <Card eyebrow="Feel it · from the beach" color={GREEN}>
                {cur.feel!.map((id) => <Piece key={id} p={pieces[id]} canTrack={canTrack} />)}
              </Card>
              {cur.game && (
                <Card eyebrow="Play it · the game" color={VIOLET}>
                  <h2 className="text-[17px] font-bold">{cur.game.name}</h2>
                  <p className="text-[14px] mt-1 leading-relaxed" style={{ color: TEXT }}>{cur.game.image}</p>
                  <p className="text-[14px] mt-2 leading-relaxed font-semibold" style={{ color: PAPER }}>{cur.game.rule}</p>
                  <p className="text-[13px] mt-2 leading-relaxed" style={{ color: MUTED }}>{cur.game.how}</p>
                </Card>
              )}
              <a href={`${portal}?tab=course&lesson=${cur.lessonId}`} className="inline-block text-[13px] font-semibold" style={{ color: CYAN }}>Go deeper → {cur.lessonLabel}</a>
            </>
          )}

          <Card eyebrow="Where the errors are born · not in the maneuver" color="#FF6B6B">
            <p className="text-[14px] leading-relaxed" style={{ color: TEXT }}>Most errors do not come from the bottom turn or the snap. They come from one of the three circles. Diagnose here before correcting the maneuver.</p>
            <div className="mt-2">
              {CIRCLES_INTRO.born.map((b) => (
                <div key={b.title} className="py-2" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
                  <p className="text-[14px] font-semibold flex items-center gap-2" style={{ color: PAPER }}><i className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: CIRCLE_COLOR[b.circle] }} />{b.title}</p>
                  <p className="text-[13px] leading-snug mt-0.5 pl-4" style={{ color: TEXT }}>{b.note}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card eyebrow="Where the three overlap · which circle failed?" color={VIOLET}>
            <p className="text-[14px] leading-relaxed" style={{ color: TEXT }}>You have this framework when, after a wave that did not work, you can say which circle failed — not just “it went badly”. Try it on your next three waves; answer with one word.</p>
            <div className="mt-2 space-y-1.5">
              {CIRCLES_INTRO.diagnose.map((d) => <p key={d.circle} className="text-[13.5px] leading-snug" style={{ color: TEXT }}><span className="font-semibold" style={{ color: CIRCLE_COLOR[d.circle.toLowerCase() as Circle['key']] }}>{d.circle}</span> · {d.q}</p>)}
            </div>
            <p className="text-[12.5px] mt-3" style={{ color: MUTED }}>If you can name the circle, you already know what to train tomorrow.</p>
          </Card>

          <a href={`${portal}?tab=course&lesson=${lessonId}`} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold" style={{ border: `1px solid ${CYAN}66`, color: CYAN }}>Mark the lesson as read →</a>
        </div>
      </div>
    </div>
  );
}

function Video({ url, title }: { url: string; title: string }) {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{6,})/);
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  const src = yt ? `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1` : vm ? `https://player.vimeo.com/video/${vm[1]}` : null;
  if (src) return <div className="relative w-full" style={{ paddingTop: '56.25%' }}><iframe src={src} title={title} className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /></div>;
  return <video src={url} controls playsInline preload="metadata" className="w-full block" title={title} />;
}
