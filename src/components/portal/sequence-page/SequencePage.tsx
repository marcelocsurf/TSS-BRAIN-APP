'use client';

// ═══ Una secuencia, cuatro pestañas: Think it · Feel it · Do it · Review ═══
// Modelo de Marcelo (2026-09-09): la secuencia es la puerta de entrada y el
// paso es el detalle. Think = teoría en 5 bloques fijos; Feel = drills fuera
// del agua; Do = la misión (resultado, sin conteo) + prueba de competencia
// (el único conteo) + "cuando no sale"; Review = indicadores con espejo,
// fix y "go deeper", common mistakes y how it feels.
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Lock, Waves, Footprints, Brain, Play, CheckCircle2 } from 'lucide-react';
import { MarkdownContent } from '@/components/course/MarkdownContent';
import { WaveBoard, COMMAND_COLORS } from './WaveBoard';
import { BoardMap } from './BoardMap';
import type { SequencePageConfig } from '@/lib/sequence-pages/types';

// Brand Manual v10 (src/lib/constants/brand.ts): Ink · Ink claro · Paper · Signature Cyan · Pop dorado · Foam · Coral.
const INK = '#061C2B', PANEL = '#0A2438', PAPER = '#F7F9FA', CYAN = '#00D2FF', GREEN = '#06D6A0', GOLD = '#FFD166', VIOLET = '#B388FF', RED = '#FF6B6B';
const TEXT = 'rgba(247,249,250,.92)', MUTED = 'rgba(247,249,250,.62)';
const F_M: React.CSSProperties = { fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.16em', fontSize: 10 };

export interface PieceRow { id: string; type: 'drill' | 'mission'; title: string; description_md: string | null; key_words: string[] | null; time_estimate: string | null; reps_recommended: string | null }
export interface LessonBits { id: string; title: string; whatIs: string; body: string; rules: string; mistakes: string; cue: string }

type Tab = 'think' | 'feel' | 'do' | 'review';
const TABS: { key: Tab; label: string; sub: string; Icon: typeof Brain }[] = [
  { key: 'think', label: 'Think it', sub: 'Understand', Icon: Brain },
  { key: 'feel', label: 'Feel it', sub: 'Rehearse', Icon: Footprints },
  { key: 'do', label: 'Do it', sub: 'Execute', Icon: Waves },
  { key: 'review', label: 'Review', sub: 'Check', Icon: CheckCircle2 },
];

export function SequencePage({
  video, cfg, lessons, pieces, token, canTrack }: {
  cfg: SequencePageConfig;
  lessons: Record<string, LessonBits>;
  pieces: Record<string, PieceRow>;
  token: string;
  canTrack: boolean;
  /** Video de la ejecución (Library → kind video, título que empieza con el id de la secuencia). */
  video?: { url: string; title: string } | null;
}) {
  const [tab, setTab] = useState<Tab>('think');
  // Foco opcional dentro de la misión (Marcelo 2026-09-09): la misión es
  // siempre la línea completa; el detalle se elige, o no.
  const [focus, setFocus] = useState<string | null>(null);
  const portal = `/portal/${token}`;
  const body = lessons[cfg.think.bodyFromLesson];
  const order: Tab[] = ['think', 'feel', 'do', 'review'];
  const next = order[order.indexOf(tab) + 1];
  const go = (t: Tab) => { setTab(t); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="min-h-screen pb-24 text-[15px]" style={{ background: INK, color: PAPER }}>
      <div className="max-w-lg md:max-w-2xl mx-auto px-4 pt-4">
        <a href={`${portal}?tab=course`} className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: CYAN }}><ArrowLeft size={14} /> Course</a>
        <p className="mt-3" style={{ ...F_M, color: CYAN }}>Sequence #{cfg.number} · {cfg.belt.replace('_belt', ' belt')}</p>
        <h1 className="text-[26px] font-extrabold leading-tight mt-1" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%' }}>{cfg.title}</h1>
        <p className="text-[13px] mt-2" style={{ color: TEXT }}>{cfg.think.whatIs.headline}</p>

        {/* Arriba de todo: la ejecución. El video cuando exista; si no, la línea sobre la ola. */}
        <div className="rounded-2xl overflow-hidden mt-4" style={{ background: PANEL }}>
          {video ? <SequenceVideo url={video.url} title={video.title} /> : <div className="p-3"><WaveBoard data={cfg.think.board} title={`${cfg.title} on the wave face`} /></div>}
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-3 text-[12px]">
          <span style={{ ...F_M, color: MUTED }}>The steps that build it</span>
          {cfg.stepIds.map((id, i) => (
            <span key={id}>
              {i > 0 && <span style={{ color: MUTED }}>→ </span>}
              <a href={`${portal}?tab=course&lesson=${id}`} className="font-semibold underline decoration-dotted underline-offset-2" style={{ color: CYAN }}>{lessons[id]?.title.replace(/ Operationalized at Blue Belt/, '') ?? id}</a>
            </span>
          ))}
        </div>

        {/* Pestañas */}
        <div className="grid grid-cols-4 gap-1 rounded-2xl p-1.5 mt-4 sticky top-2 z-10" style={{ background: PANEL }} role="tablist">
          {TABS.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => go(t.key)}
              className="rounded-xl py-2 text-center"
              style={tab === t.key ? { background: '#132840', boxShadow: `inset 0 0 0 1px ${CYAN}55` } : {}}>
              <span className="block text-[14px] font-bold" style={{ color: tab === t.key ? CYAN : PAPER }}>{t.label}</span>
              <span className="hidden sm:block text-[10px]" style={{ color: MUTED }}>{t.sub}</span>
            </button>
          ))}
        </div>

        {/* ── THINK ── */}
        {tab === 'think' && (
          <div className="space-y-3 mt-4">
            <Card eyebrow="01 · What it is">
              <h2 className="text-[16px] font-bold">{cfg.think.whatIs.headline}</h2>
              {video && <WaveBoard data={cfg.think.board} title={`${cfg.title} on the wave face`} />}
              <Row k="The line">{cfg.think.whatIs.line}</Row>
              <Row k="Where">{cfg.think.whatIs.where}</Row>
              <Row k="What for">{cfg.think.whatIs.whatFor}</Row>
            </Card>
            <Card eyebrow="02 · Feet · what changes with the back foot">
              <div className="flex gap-4 items-start">
                <BoardMap compact />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-snug" style={{ color: TEXT }}>{cfg.think.feet.text}</p>
                  <div className="mt-2">
                    {cfg.think.feet.options.map((o) => (
                      <div key={o.back} className="py-1.5" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
                        <span className="font-mono font-bold text-[12px]" style={{ color: PAPER }}>{o.label}</span>
                        <p className="text-[12px] leading-snug" style={{ color: MUTED }}>{o.tradeoff}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[14px] mt-3 rounded-xl px-3 py-2.5" style={{ background: 'rgba(0,210,255,.07)', color: PAPER }}>{cfg.think.feet.rule}</p>
            </Card>
            <Card eyebrow="03 · The sequence · how your body does it">
              {body?.body ? <MarkdownContent markdown={body.body} /> : <p style={{ color: MUTED }}>Coming soon.</p>}
            </Card>
            <Card eyebrow="04 · The rules that hold it together">
              {body?.rules ? <MarkdownContent markdown={body.rules} /> : <p style={{ color: MUTED }}>Coming soon.</p>}
            </Card>
            <Card eyebrow="05 · Key words">
              {cfg.think.keyWords.map((k) => (
                <p key={k.label} className="text-[14px] mb-1"><span style={{ color: MUTED }}>{k.label} · </span>
                  {k.label === 'Method'
                    ? k.words.map((w, i) => { const cs = [COMMAND_COLORS.posture, COMMAND_COLORS.rail, COMMAND_COLORS.projection, COMMAND_COLORS.maneuver, COMMAND_COLORS.posture]; return <span key={w} className="font-mono" style={{ color: cs[i] ?? CYAN }}>{i ? ' · ' : ''}{w}</span>; })
                    : <span className="font-mono" style={{ color: CYAN }}>{k.words.join(' · ')}</span>}
                </p>
              ))}
              <p className="text-[12px] mt-1" style={{ color: MUTED }}>The body words are the method's formula: posture → rotation on the rail → projection → maneuver → back to posture. Same colours as the line on the wave.</p>
              <p className="text-[13.5px] mt-2" style={{ color: TEXT }}>Learn them on land, in the drill, until you can run them without thinking. In the water you carry one: the mission, or the one word that is breaking.</p>
              <details className="mt-3">
                <summary className="cursor-pointer text-[13.5px]" style={{ color: CYAN }}>Go deeper: each step as its own page</summary>
                <div className="mt-2 flex flex-wrap gap-2">
                  {cfg.stepIds.map((id) => (
                    <a key={id} href={`${portal}?tab=course&lesson=${id}`} className="text-[12px] px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,.06)', color: PAPER }}>{lessons[id]?.title.replace(/ Operationalized at Blue Belt/, '') ?? id} →</a>
                  ))}
                </div>
              </details>
            </Card>
          </div>
        )}

        {/* ── FEEL ── */}
        {tab === 'feel' && (
          <div className="space-y-3 mt-4">
            <Card eyebrow="Feel it · out of the water" color={VIOLET}>
              <h2 className="text-[16px] font-bold">Connect the mechanics to your body before the wave asks for them.</h2>
              <p className="text-[14px] mt-1" style={{ color: TEXT }}>Three kinds of rehearsal, from stillness to movement. None of them is a test.</p>
            </Card>
            <Card eyebrow="Visualize" color={VIOLET}>
              <p className="text-[14.5px]" style={{ color: TEXT }}>{cfg.feel.visualize}</p>
            </Card>
            <Card eyebrow="Simulate · land, sand, pool or calm water" color={VIOLET}>
              {cfg.feel.land.map((id) => <Piece key={id} p={pieces[id]} href={`${portal}?tab=sequence&drill=${id}`} canTrack={canTrack} />)}
            </Card>
            <Card eyebrow="Simulate · surf skate" color={VIOLET}>
              {cfg.feel.skate.map((id) => <Piece key={id} p={pieces[id]} href={`${portal}?tab=sequence&drill=${id}`} canTrack={canTrack} />)}
            </Card>
            <p className="text-[12px] px-1" style={{ color: MUTED }}>Each drill closes with one question: ready to take it to the water?</p>
          </div>
        )}

        {/* ── DO ── */}
        {tab === 'do' && (
          <div className="space-y-3 mt-4">
            <Card eyebrow="Mission · in the water" color={GREEN}>
              <h2 className="text-[16px] font-bold">{cfg.do.result}</h2>
              <Row k="Timing">{cfg.do.timing}</Row>
              <Row k="Plan">You set the time and the number of waves before you paddle out. The plan is yours; it is not graded.</Row>
              {pieces[cfg.do.missionId] && (
                canTrack ? (
                  <a href={`${portal}?tab=sequence&drill=${cfg.do.missionId}`} className="inline-flex items-center gap-2 mt-3 px-4 py-2.5 rounded-full text-[12px] font-bold" style={{ background: CYAN, color: INK }}><Play size={14} /> Start the mission in Let&apos;s Play</a>
                ) : (
                  <p className="inline-flex items-center gap-2 mt-3 text-[12px]" style={{ color: MUTED }}><Lock size={13} /> Training and logging come with your training tool.</p>
                )
              )}
            </Card>
            <Card eyebrow="Choose a focus · optional">
              <p className="text-[14px] mb-2" style={{ color: TEXT }}>The mission is always the whole line. These are the steps your body runs; if one of them is breaking, pick it and it rides along as your word for the session. Pick nothing and just surf the line.</p>
              <div className="flex flex-wrap gap-2">
                {cfg.details.map((d) => (
                  <button key={d.key} type="button" onClick={() => setFocus(focus === d.key ? null : d.key)}
                    className="inline-flex items-center gap-2 text-[12px] px-3 py-1.5 rounded-full"
                    style={focus === d.key ? { background: CYAN, color: INK, fontWeight: 700 } : { background: 'rgba(255,255,255,.06)', color: PAPER }}>
                    {d.command && <i className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COMMAND_COLORS[d.command] }} />}
                    {d.title}
                  </button>
                ))}
              </div>
              {cfg.details.filter((d) => d.key === focus).map((d) => (
                <div key={d.key} className="mt-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,.04)' }}>
                  <p className="text-[12px] mb-2" style={{ color: MUTED }}>Where it breaks: {d.symptom}</p>
                  {d.indicators.map((ind, i) => (
                    <div key={i} className="py-2" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
                      <p className="text-[14px]"><span style={{ color: GREEN }}>✓</span> {ind.ok}</p>
                      <p className="text-[13.5px] mt-0.5" style={{ color: TEXT }}><span style={{ color: RED }}>✗</span> {ind.no}</p>
                      <p className="text-[13.5px] mt-0.5"><span className="font-bold" style={{ color: GOLD }}>Fix:</span> {ind.fix}</p>
                    </div>
                  ))}
                  {d.deeper && (
                    <div className="mt-2 flex flex-wrap gap-2 text-[12px]">
                      <a href={`${portal}?tab=course&lesson=${d.deeper.lessonId}`} className="px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,.06)', color: CYAN }}>Go deeper → {d.deeper.label}</a>
                      {canTrack && d.deeper.drillId && pieces[d.deeper.drillId] && <a href={`${portal}?tab=sequence&drill=${d.deeper.drillId}`} className="px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,.06)', color: VIOLET }}>Drill: {pieces[d.deeper.drillId].title}</a>}
                      {canTrack && d.deeper.missionId && pieces[d.deeper.missionId] && <a href={`${portal}?tab=sequence&drill=${d.deeper.missionId}`} className="px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,.06)', color: GREEN }}>Mission: {pieces[d.deeper.missionId].title}</a>}
                    </div>
                  )}
                </div>
              ))}
            </Card>
            <Card eyebrow="Competence · is it yours yet?" color={GREEN}>
              <p className="text-[13.5px]" style={{ color: TEXT }}>{cfg.do.competence}</p>
            </Card>
          </div>
        )}

        {/* ── REVIEW ── */}
        {tab === 'review' && (
          <div className="space-y-3 mt-4">
            <Card eyebrow="How you know you have it" color={GREEN}>
              <p className="text-[14px] mb-1" style={{ color: TEXT }}>One topic per step of the sequence. Open only the one you want to check.</p>
              {cfg.details.map((d) => (
                <details key={d.key} className="group" style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
                  <summary className="cursor-pointer list-none flex items-center gap-2.5 py-3">
                    {d.command && <i className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COMMAND_COLORS[d.command] }} />}
                    <span className="text-[15px] font-semibold flex-1" style={{ color: PAPER }}>{d.title}</span>
                    <span className="text-[11px]" style={{ color: MUTED }}>{d.indicators.length}</span>
                    <span className="transition-transform group-open:rotate-90" style={{ color: MUTED }}>›</span>
                  </summary>
                  <div className="pb-3">
                    {d.indicators.map((ind, i) => (
                      <div key={i} className="py-2" style={{ borderTop: i ? '1px solid rgba(255,255,255,.06)' : undefined }}>
                        <p className="text-[14px]" style={{ color: PAPER }}><span style={{ color: GREEN }}>✓</span> {ind.ok}</p>
                        <p className="text-[13.5px] mt-1" style={{ color: TEXT }}><span style={{ color: RED }}>✗</span> {ind.no}</p>
                        <p className="text-[13.5px] mt-1" style={{ color: TEXT }}><span className="font-bold" style={{ color: GOLD }}>Fix:</span> {ind.fix}</p>
                      </div>
                    ))}
                    {d.deeper && <a href={`${portal}?tab=course&lesson=${d.deeper.lessonId}`} className="inline-block mt-1 text-[13px] font-semibold" style={{ color: CYAN }}>Go deeper → {d.deeper.label}</a>}
                  </div>
                </details>
              ))}
            </Card>
            {cfg.stepIds.some((id) => lessons[id]?.mistakes) && (
              <Card eyebrow="Common mistakes" color={RED}>
                {cfg.stepIds.map((id) => lessons[id]?.mistakes ? (
                  <details key={id} className="group" style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
                    <summary className="cursor-pointer list-none flex items-center gap-2 py-3">
                      <span className="text-[15px] font-semibold flex-1" style={{ color: PAPER }}>{lessons[id].title.replace(/ Operationalized at Blue Belt/, '')}</span>
                      <span className="transition-transform group-open:rotate-90" style={{ color: MUTED }}>›</span>
                    </summary>
                    <div className="pb-3"><MarkdownContent markdown={lessons[id].mistakes} /></div>
                  </details>
                ) : null)}
              </Card>
            )}
            <Card eyebrow="How it feels" color={VIOLET}>
              <p className="text-[13.5px]" style={{ color: TEXT }}>{cfg.review.howItFeels}</p>
            </Card>
            <Card eyebrow="After a session">
              <p className="text-[14px]" style={{ color: TEXT }}><b>★ 1–5</b> how it went · <b>Focus 0–3</b> · <b>Flow</b> bored → too much. Then, if you want, check the indicators above one by one. The weakest one becomes your next word.</p>
              {canTrack && <a href={`${portal}?tab=sequence`} className="inline-flex items-center gap-1.5 mt-2 text-[12px] font-semibold" style={{ color: CYAN }}>Open Let&apos;s Play <ArrowRight size={13} /></a>}
            </Card>
          </div>
        )}

        {next && (
          <button type="button" onClick={() => go(next)} className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold px-4 py-2 rounded-full" style={{ boxShadow: `inset 0 0 0 1px ${CYAN}80`, color: CYAN }}>
            Next: {TABS.find((t) => t.key === next)?.label} <ArrowRight size={13} />
          </button>
        )}
        <p className="text-[10px] mt-8" style={{ color: 'rgba(255,255,255,.3)' }}>Colours on the wave: <span style={{ color: COMMAND_COLORS.posture }}>posture</span> · <span style={{ color: COMMAND_COLORS.rail }}>rail</span> · <span style={{ color: COMMAND_COLORS.projection }}>projection</span> · <span style={{ color: COMMAND_COLORS.maneuver }}>maneuver</span> · <span style={{ color: COMMAND_COLORS.closure }}>closure</span></p>
      </div>
    </div>
  );
}

/** YouTube / Vimeo → iframe; archivo directo → <video>. */
function SequenceVideo({ url, title }: { url: string; title: string }) {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{6,})/);
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  const src = yt ? `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1` : vm ? `https://player.vimeo.com/video/${vm[1]}` : null;
  if (src) return <div className="relative w-full" style={{ paddingTop: '56.25%' }}><iframe src={src} title={title} className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /></div>;
  return <video src={url} controls playsInline preload="metadata" className="w-full block" title={title} />;
}

function Card({ eyebrow, color = CYAN, children }: { eyebrow: string; color?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl p-4" style={{ background: PANEL }}>
      <p className="mb-2" style={{ ...F_M, color }}>{eyebrow}</p>
      {children}
    </section>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start py-2" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
      <span className="shrink-0 pt-0.5" style={{ ...F_M, color: MUTED, minWidth: 62 }}>{k}</span>
      <p className="text-[14px] leading-snug" style={{ color: TEXT }}>{children}</p>
    </div>
  );
}

function Piece({ p, href, canTrack }: { p?: PieceRow; href: string; canTrack: boolean }) {
  if (!p) return null;
  return (
    <div className="py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
      <p className="text-[14px] font-semibold">{p.title}</p>
      {p.description_md && <p className="text-[13.5px] mt-1 leading-snug" style={{ color: TEXT }}>{p.description_md}</p>}
      <div className="flex items-center gap-3 mt-1.5 text-[11px]" style={{ color: MUTED }}>
        {p.time_estimate && <span>{p.time_estimate}</span>}
        {p.reps_recommended && <span>{p.reps_recommended} reps</span>}
        {canTrack ? <a href={href} className="inline-flex items-center gap-1 font-semibold" style={{ color: CYAN }}><Play size={12} /> Rehearse it</a> : <span className="inline-flex items-center gap-1"><Lock size={11} /> with your training tool</span>}
      </div>
    </div>
  );
}
