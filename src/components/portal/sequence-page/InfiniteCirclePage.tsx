'use client';

// ═══ THE INFINITE CIRCLE — el curso del lenguaje, en dos lados ═══
// Marcelo (2026-09-09): teórico, conceptos; frontside y backside; cada paso
// con su color; lo que ya viene de los 3 Círculos vs lo nuevo de Blue.
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { WaveBoard, COMMAND_COLORS, HOLD_COLOR } from './WaveBoard';
import { InfinityCircle } from './InfinityCircle';
import { LOOP_INTRO, LOOP_SIDES, type LoopSide, type LoopStep } from '@/lib/sequence-pages/infinite-circle';

const INK = '#061C2B', PANEL = '#0A2438', PAPER = '#F7F9FA', CYAN = '#00D2FF', GOLD = '#FFD166', VIOLET = '#B388FF';
const TEXT = 'rgba(247,249,250,.92)', MUTED = 'rgba(247,249,250,.62)';
const F_M: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: 10 };

function Dot({ command, hold, size = 10 }: { command: LoopStep['command']; hold?: boolean; size?: number }) {
  return (
    <i className="inline-block rounded-full shrink-0" style={{ width: size, height: size, background: COMMAND_COLORS[command], boxShadow: hold ? `0 0 0 2.5px ${HOLD_COLOR}` : '0 0 0 2px rgba(255,255,255,.15)' }} />
  );
}

function Card({ eyebrow, color = CYAN, children }: { eyebrow: string; color?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl p-4" style={{ background: PANEL }}>
      <p className="mb-2" style={{ ...F_M, color }}>{eyebrow}</p>
      {children}
    </section>
  );
}

export function InfiniteCirclePage({ token, video, threeCirclesLessonId, loopLessonId }: {
  token: string;
  video?: { url: string; title: string } | null;
  threeCirclesLessonId: string;
  loopLessonId: string | null;
}) {
  const [side, setSide] = useState<LoopSide['key']>('fs');
  const portal = `/portal/${token}`;
  const cur = LOOP_SIDES.find((s) => s.key === side)!;

  return (
    <div className="seq-dark min-h-screen pb-24 text-[15px]" style={{ background: INK, color: PAPER }}>
      <div className="max-w-lg md:max-w-2xl mx-auto px-4 pt-4">
        <a href={`${portal}?tab=course`} className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: CYAN }}><ArrowLeft size={14} /> Course</a>
        <p className="mt-3" style={{ ...F_M, color: CYAN }}>Blue belt · the language of every sequence</p>
        <h1 className="text-[26px] font-extrabold leading-tight mt-1" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%' }}>{LOOP_INTRO.title}</h1>
        <p className="text-[14px] mt-2" style={{ color: TEXT }}>{LOOP_INTRO.headline}</p>

        {/* Arriba: el video si existe; si no, la imagen del círculo (Marcelo 2026-09-09). */}
        <div className="rounded-2xl overflow-hidden mt-4" style={{ background: PANEL }}>
          {video ? <LoopVideo url={video.url} title={video.title} /> : <div className="p-2"><InfinityCircle side={side} /></div>}
        </div>

        <div className="space-y-3 mt-4">
          <Card eyebrow="01 · What it is">
            <p className="text-[14px] leading-relaxed" style={{ color: TEXT }}>{LOOP_INTRO.what}</p>
            {video && <div className="mt-3"><InfinityCircle side={side} /></div>}
            <div className="mt-3"><WaveBoard data={cur.board} title="One turn of the circle on the wave face" /></div>
            <p className="text-[13.5px] mt-2 leading-relaxed" style={{ color: MUTED }}>{LOOP_INTRO.before}</p>
            <p className="text-[13.5px] mt-2 leading-relaxed rounded-xl px-3 py-2.5" style={{ background: 'rgba(0,210,255,.07)', color: PAPER }}>{LOOP_INTRO.why}</p>
          </Card>

          <Card eyebrow="02 · The colour code · one colour per action" color={GOLD}>
            <div className="space-y-2">
              {LOOP_INTRO.colours.map((c) => (
                <div key={c.command} className="flex items-center gap-2.5">
                  <Dot command={c.command} size={12} />
                  <span className="font-mono text-[13px] font-semibold" style={{ color: PAPER }}>{c.label}</span>
                  <span className="text-[12.5px]" style={{ color: MUTED }}>· {c.note}</span>
                </div>
              ))}
              <div className="flex items-center gap-2.5">
                <i className="inline-block w-3 h-3 rounded-full shrink-0" style={{ background: 'transparent', boxShadow: `0 0 0 2.5px ${HOLD_COLOR}` }} />
                <span className="font-mono text-[13px] font-semibold" style={{ color: PAPER }}>Hold</span>
                <span className="text-[12.5px]" style={{ color: MUTED }}>· a light-blue ring on top: this position is kept</span>
              </div>
            </div>
            <p className="text-[12.5px] mt-3" style={{ color: MUTED }}>The same colours draw the line on the wave in every sequence page. When a word is breaking, you know its colour, and you know where on the wave it lives.</p>
          </Card>

          <Card eyebrow="03 · You already have this · from the Three Circles of Power" color={VIOLET}>
            <div className="space-y-2">
              {LOOP_INTRO.known.map((k) => (
                <p key={k.word} className="text-[13.5px] leading-snug" style={{ color: TEXT }}><span className="font-semibold" style={{ color: PAPER }}>{k.word}</span> · {k.note}</p>
              ))}
            </div>
            <a href={`${portal}?tab=course&lesson=${threeCirclesLessonId}`} className="inline-block mt-3 text-[13px] font-semibold" style={{ color: CYAN }}>Go back to the Three Circles →</a>
          </Card>

          <Card eyebrow="04 · New in Blue · the words the circle adds" color={GOLD}>
            <div className="space-y-2">
              {LOOP_INTRO.newWords.map((k) => (
                <p key={k.word} className="text-[13.5px] leading-snug" style={{ color: TEXT }}><span className="font-semibold" style={{ color: PAPER }}>{k.word}</span> · {k.note}</p>
              ))}
            </div>
          </Card>

          {/* ── Frontside / Backside ── */}
          <div className="grid grid-cols-2 gap-1 rounded-2xl p-1.5 sticky top-2 z-10" style={{ background: PANEL }} role="tablist">
            {LOOP_SIDES.map((s) => (
              <button key={s.key} type="button" role="tab" aria-selected={side === s.key} onClick={() => setSide(s.key)}
                className="rounded-xl py-2 text-center" style={side === s.key ? { background: '#132840', boxShadow: `inset 0 0 0 1px ${CYAN}55` } : {}}>
                <span className="block text-[14px] font-bold" style={{ color: side === s.key ? CYAN : PAPER }}>{s.label}</span>
                <span className="block text-[10px]" style={{ color: MUTED }}>{s.sub}</span>
              </button>
            ))}
          </div>

          <Card eyebrow={`05 · The ${cur.label.toLowerCase()} circle · step by step`}>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] mb-3">
              {cur.steps.map((st, i) => (
                <span key={st.key} className="inline-flex items-center gap-1.5 font-semibold" style={{ color: PAPER }}>
                  {i > 0 && <span style={{ color: MUTED }}>→</span>}
                  <Dot command={st.command} hold={st.hold} size={9} />
                  {st.name.replace(/ · .*$/, '')}
                </span>
              ))}
            </div>
            <div>
              {cur.steps.map((st, i) => (
                <details key={st.key} className="group" open={i === 0} style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
                  <summary className="cursor-pointer list-none flex items-center gap-2.5 py-3">
                    <Dot command={st.command} hold={st.hold} />
                    <span className="text-[15px] font-semibold flex-1" style={{ color: PAPER }}>{st.name}</span>
                    <span className="text-[10px] font-mono rounded-full px-2 py-0.5" style={{ color: st.known === 'new' ? INK : MUTED, background: st.known === 'new' ? GOLD : 'rgba(255,255,255,.08)' }}>{st.known === 'new' ? 'new' : 'known'}</span>
                    <span className="transition-transform group-open:rotate-90" style={{ color: MUTED }}>›</span>
                  </summary>
                  <div className="pb-4 pl-5">
                    <p style={{ ...F_M, color: COMMAND_COLORS[st.command] }}>{st.commandLabel}{st.hold ? ' · hold' : ''}</p>
                    <p className="text-[14px] mt-1.5 leading-relaxed" style={{ color: TEXT }}>{st.whatIs}</p>
                    <ul className="mt-2 space-y-1.5">
                      {st.body.map((b, j) => (
                        <li key={j} className="flex gap-2 text-[13.5px] leading-snug" style={{ color: TEXT }}><span style={{ color: COMMAND_COLORS[st.command] }}>•</span><span>{b}</span></li>
                      ))}
                    </ul>
                    <p className="mt-2 text-[12.5px]"><span style={{ color: MUTED }}>Key words · </span><span className="font-mono" style={{ color: PAPER }}>{st.keyWords.join(' · ')}</span></p>
                    <a href={`${portal}?tab=course&lesson=${st.lessonId}`} className="inline-block mt-2 text-[13px] font-semibold" style={{ color: CYAN }}>Go deeper → {st.lessonLabel}</a>
                  </div>
                </details>
              ))}
            </div>
          </Card>

          <Card eyebrow="06 · When a wave breaks down · where to look" color={VIOLET}>
            <div className="space-y-2">
              {LOOP_INTRO.diagnose.map((d) => (
                <p key={d.block} className="text-[13.5px] leading-snug" style={{ color: TEXT }}><span className="font-semibold" style={{ color: PAPER }}>{d.block}</span> · {d.q}</p>
              ))}
            </div>
            <p className="text-[12.5px] mt-3" style={{ color: MUTED }}>Name the block, not the whole wave. That is what you will train tomorrow.</p>
          </Card>

          {loopLessonId && (
            <a href={`${portal}?tab=course&lesson=${loopLessonId}`} className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold" style={{ border: `1px solid ${CYAN}66`, color: CYAN }}>
              Mark the lesson as read →
            </a>
          )}
        </div>

        <p className="text-[11px] mt-8 flex flex-wrap items-center gap-x-3 gap-y-1" style={{ color: MUTED }}>
          <span>Colours on the wave</span>
          {(['posture', 'rail', 'projection', 'maneuver', 'closure'] as const).map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5"><i className="inline-block w-2 h-2 rounded-full" style={{ background: COMMAND_COLORS[c] }} />{c}</span>
          ))}
        </p>
      </div>
    </div>
  );
}

function LoopVideo({ url, title }: { url: string; title: string }) {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{6,})/);
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  const src = yt ? `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1` : vm ? `https://player.vimeo.com/video/${vm[1]}` : null;
  if (src) return <div className="relative w-full" style={{ paddingTop: '56.25%' }}><iframe src={src} title={title} className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /></div>;
  return <video src={url} controls playsInline preload="metadata" className="w-full block" title={title} />;
}
