'use client';

// ═══ Una secuencia, cuatro pestañas: Think it · Feel it · Do it · Review ═══
// Modelo de Marcelo (2026-09-09): la secuencia es la puerta de entrada y el
// paso es el detalle. Think = teoría en 5 bloques fijos; Feel = drills fuera
// del agua; Do = la misión (resultado, sin conteo) + prueba de competencia
// (el único conteo) + "cuando no sale"; Review = indicadores con espejo,
// fix y "go deeper", common mistakes y how it feels.
//
// Diseño (2026-09-14, línea aprobada · TSS_Design_Handoff + guías de ola):
// fondo navy, tarjetas crema, títulos grandes Archivo, etiquetas mono, botón
// cyan, nav inferior blanca. La ola es el Wave Guide ilustrado con el
// recorrido ORIGINAL de cada secuencia. TODO el contenido (textos, orden,
// links, lógica de Let's Play) es el mismo de antes: solo cambia cómo se ve.
import { useState } from 'react';
import { ArrowRight, Lock, Play } from 'lucide-react';
import { MarkdownContent } from '@/components/course/MarkdownContent';
import { WaveGuide } from './WaveGuide';
import { COMMAND_COLORS } from '@/lib/sequence-pages/wave-guide-svg';
import { BoardMap } from './BoardMap';
import type { SequencePageConfig } from '@/lib/sequence-pages/types';

// Tokens del paquete (public/tss/tokens.css) + semánticos legibles sobre crema.
const NAVY = '#061C2B', INK = '#10263B', CREAM = '#F3F0E5', PAPER = '#F8F5EC', BORDER = '#DCD7C6', CYAN = '#00D2FF', WHITE = '#FFFFFF';
const MUTED = '#55666E', ON_DARK = '#D9E4EA';
const GREEN = '#0F8A5F', GOLD = '#B7791F', VIOLET = '#7C4DFF', RED = '#C62828';
const GOLD_BRIGHT = '#FFDC33', VIOLET_BRIGHT = '#BA69EE', GREEN_BRIGHT = '#06D6A0';
const MONO: React.CSSProperties = { fontFamily: 'var(--tss-mono), var(--font-plex), IBM Plex Mono, monospace', fontSize: 12, fontWeight: 500, letterSpacing: '0.045em', textTransform: 'uppercase' };
const H1: React.CSSProperties = { fontFamily: 'var(--tss-font), var(--font-archivo), Archivo, sans-serif' };

export interface PieceRow { id: string; type: 'drill' | 'mission'; title: string; description_md: string | null; key_words: string[] | null; time_estimate: string | null; reps_recommended: string | null }
export interface LessonBits { id: string; title: string; whatIs: string; body: string; rules: string; mistakes: string; cue: string }

type Tab = 'think' | 'feel' | 'do' | 'review';
const TABS: { key: Tab; label: string; sub: string }[] = [
  { key: 'think', label: 'Think it', sub: 'Understand' },
  { key: 'feel', label: 'Feel it', sub: 'Rehearse' },
  { key: 'do', label: 'Do it', sub: 'Execute' },
  { key: 'review', label: 'Review', sub: 'Check' },
];

export interface SequenceProgress {
  lastRun: number | null;
  /** fs · bs · both · null (Marcelo 2026-09-10). */
  side?: 'fs' | 'bs' | 'both' | null;
  sideRatings?: { fs: number | null; bs: number | null } | null;
  heldBackId: string | null;
  heldBackTitle: string | null;
  ratedSteps: number;
  totalSteps: number;
  minRating: number | null;
  weakestId: string | null;
  weakestTitle: string | null;
  steps: { id: string; title: string; rating: number | null }[];
}

export function SequencePage({
  video, cfg, lessons, pieces, token, canTrack, progress, initialTab = null, flip = false }: {
  cfg: SequencePageConfig;
  lessons: Record<string, LessonBits>;
  pieces: Record<string, PieceRow>;
  token: string;
  canTrack: boolean;
  /** Video de la ejecución (Library → kind video, título que empieza con el id de la secuencia). */
  video?: { url: string; title: string } | null;
  /** Lo que Let's Play sabe de esta secuencia para este alumno. */
  progress?: SequenceProgress | null;
  /** ?tab=feel desde Let's Play ("Rehearse it on land first"). */
  initialTab?: Tab | null;
  /** Espejar el tablero según el stance del alumno (goofy frontside / regular backside). */
  flip?: boolean;
}) {
  const [tab, setTab] = useState<Tab>(initialTab ?? 'think');
  // Foco opcional dentro de la misión (Marcelo 2026-09-09): la misión es
  // siempre la línea completa; el detalle se elige, o no.
  const [focus, setFocus] = useState<string | null>(null);
  const portal = `/portal/${token}`;
  const body = lessons[cfg.think.bodyFromLesson];
  const order: Tab[] = ['think', 'feel', 'do', 'review'];
  const next = order[order.indexOf(tab) + 1];
  const go = (t: Tab) => { setTab(t); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  // Solo la dirección del dibujo cambia con el stance; el nombre de la maniobra no.
  const waveDirection = flip ? 'left' : 'right';
  const stripStep = (t: string) => t.replace(/^\d+ · /, '').replace(/ · .*$/, '');
  const shortLesson = (t: string) => t.replace(/ Operationalized at Blue Belt/, '');

  return (
    <section className="tss" data-screen="sequence">
      <div className="tss-main pb-6">
        <header>
          <div className="tss-brand-row">
            <svg className="tss-logo" viewBox="180 183 960 269" role="img" aria-label="The Surf Sequence — Evolve through play"><image href="/tss/assets/tss-logo-original-white.png" width="1312" height="654" /></svg>
          </div>
          <a className="tss-back" href={`${portal}?tab=course`}><Icon name="back" />Course</a>
          <p className="mt-2" style={{ ...MONO, color: CYAN }}>{cfg.eyebrow ?? `Sequence #${cfg.number}`} · {cfg.belt.replace('_belt', ' belt')}</p>
          <h1 style={H1}>{cfg.title}</h1>
          <p className="tss-subtitle">{cfg.think.whatIs.headline}</p>
        </header>

        {/* Arriba de todo: la ejecución. El video cuando exista; si no, la línea sobre la ola. */}
        <Card className="mt-3">
          {video ? <SequenceVideo url={video.url} title={video.title} /> : cfg.think.board ? (
            <WaveGuide data={cfg.think.board} title={`${cfg.title} on the wave face`} waveDirection={waveDirection} />
          ) : (
            <ol className="m-0 p-0 list-none">
              {cfg.stepIds.map((id, i) => (
                <li key={id} className="flex items-center gap-3 py-2" style={{ borderTop: i ? `1px solid ${BORDER}` : undefined }}>
                  <span className="w-7 shrink-0 font-bold" style={{ ...MONO, fontSize: 15, color: INK }}>{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[15px] font-semibold" style={{ color: INK }}>{shortLesson(lessons[id]?.title ?? id)}</span>
                </li>
              ))}
            </ol>
          )}
          {/* Los pasos del cuerpo, con el color del comando (los mismos de Review). */}
          <h2 className="tss-section-title mt-4 mb-1">The steps that build it</h2>
          <ol className="m-0 p-0 list-none">
            {cfg.details.map((d, i) => (
              <li key={d.key} className="flex items-center gap-3 py-2" style={{ borderTop: `1px solid ${BORDER}` }}>
                <span className="w-7 shrink-0 font-bold" style={{ ...MONO, fontSize: 15, color: INK }}>{String(i + 1).padStart(2, '0')}</span>
                {d.command ? <i className="inline-block w-3.5 h-3.5 rounded-full shrink-0" style={{ background: COMMAND_COLORS[d.command] }} /> : <i className="inline-block w-3.5 h-3.5 shrink-0" />}
                <span className="text-[15px] font-semibold" style={{ color: INK }}>{stripStep(d.title)}</span>
              </li>
            ))}
          </ol>
        </Card>

        {/* Pestañas */}
        <div className="sticky top-0 z-10 -mx-1 px-1 pt-2 pb-1" style={{ background: NAVY }}>
          <nav className="grid grid-cols-4 gap-1" role="tablist" aria-label="Think it · Feel it · Do it · Review">
            {TABS.map((t) => (
              <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => go(t.key)}
                className="relative min-h-[44px] pt-2 pb-2.5 text-center bg-transparent border-0"
                style={{ color: tab === t.key ? CYAN : '#b9c8d1', fontWeight: tab === t.key ? 700 : 500, fontSize: 15 }}>
                {t.label}
                <span className="hidden sm:block text-[10px] font-normal" style={{ color: '#8fa3ae' }}>{t.sub}</span>
                <span className="absolute left-0 right-0 bottom-0 h-[3px] rounded" style={{ background: tab === t.key ? CYAN : '#35505e' }} />
              </button>
            ))}
          </nav>
        </div>

        {/* ── THINK ── */}
        {tab === 'think' && (
          <div className="mt-3">
            {cfg.prep && cfg.prep.length > 0 && (
              <Card title="Before you start · every session" color={GOLD_BRIGHT}>
                {cfg.prep.map((p, i) => (
                  <div key={p.lessonId} className="py-2" style={{ borderTop: i ? `1px solid ${BORDER}` : undefined }}>
                    <Go href={`${portal}?tab=course&lesson=${p.lessonId}`}>{p.label}</Go>
                    {p.note && <p className="text-[14px] leading-snug mt-0.5 m-0" style={{ color: INK }}>{p.note}</p>}
                  </div>
                ))}
              </Card>
            )}
            <Card title="01 · What it is">
              <p className="tss-intro">{cfg.think.whatIs.headline}</p>
              {video && cfg.think.board && <div className="mb-2"><WaveGuide data={cfg.think.board} title={`${cfg.title} on the wave face`} waveDirection={waveDirection} /></div>}
              <Row k="The line">{cfg.think.whatIs.line}</Row>
              <Row k="Where">{cfg.think.whatIs.where}</Row>
              <Row k="What for">{cfg.think.whatIs.whatFor}</Row>
            </Card>
            {cfg.kind === 'entry' && (
              <Card title="02 · The steps · what each one is">
                {cfg.stepIds.map((id, i) => lessons[id] ? (
                  <div key={id} className="py-2.5" style={{ borderTop: i ? `1px solid ${BORDER}` : undefined }}>
                    <p className="text-[15px] font-bold m-0" style={{ color: INK }}><span className="mr-2" style={{ ...MONO, fontSize: 13 }}>{String(i + 1).padStart(2, '0')}</span>{lessons[id].title}</p>
                    {lessons[id].whatIs && <p className="text-[14px] mt-1 mb-0 leading-snug" style={{ color: INK }}>{lessons[id].whatIs.split('\n').find((l) => l.trim() && !l.startsWith('#') && !l.startsWith('|') && !l.startsWith('>'))?.replace(/\*\*/g, '')}</p>}
                    <Go href={`${portal}?tab=course&lesson=${id}`} small>Read the full lesson in the course</Go>
                  </div>
                ) : null)}
              </Card>
            )}
            {cfg.think.feet && (
            <Card title="02 · Feet · what changes with the back foot">
              <div className="flex gap-4 items-start">
                <div className="shrink-0 rounded-[5px] p-1" style={{ background: PAPER, border: `1px solid ${BORDER}` }}>
                  <BoardMap compact active={cfg.think.feet!.recommended?.length ? cfg.think.feet!.recommended : undefined} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] leading-snug m-0" style={{ color: INK }}>{cfg.think.feet.text}</p>
                  <div className="mt-2">
                    {cfg.think.feet.options.map((o) => {
                      const rec = cfg.think.feet!.recommended;
                      const on = !rec?.length || rec.includes(o.back);
                      return (
                        <div key={o.back} className="py-1.5" style={{ borderTop: `1px solid ${BORDER}`, opacity: on ? 1 : 0.5 }}>
                          <span className="font-bold" style={{ ...MONO, fontSize: 13, color: INK }}>{o.label}</span>
                          {rec?.length ? <span className="ml-2" style={{ ...MONO, fontSize: 10, color: on ? GREEN : RED }}>{on ? 'for this sequence' : 'not here'}</span> : null}
                          <p className="text-[13px] leading-snug m-0" style={{ color: MUTED }}>{o.tradeoff}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <Callout>{cfg.think.feet.rule}</Callout>
            </Card>
            )}
            <Card title="03 · The sequence · how your body does it">
              {(cfg.think.bodyMarkdown ?? body?.body) ? <MarkdownContent markdown={cfg.think.bodyMarkdown ?? body!.body} /> : <p className="m-0" style={{ color: MUTED }}>Coming soon.</p>}
            </Card>
            <Card title="04 · The rules that hold it together">
              {(cfg.think.rulesMarkdown ?? body?.rules) ? <MarkdownContent markdown={cfg.think.rulesMarkdown ?? body!.rules} /> : <p className="m-0" style={{ color: MUTED }}>Coming soon.</p>}
            </Card>
            <Card title="05 · Key words">
              {cfg.think.keyWords.map((k) => (
                <div key={k.label} className="py-2" style={{ borderTop: `1px solid ${BORDER}` }}>
                  <p className="m-0 mb-1" style={{ ...MONO, color: MUTED }}>{k.label}</p>
                  {k.label === 'Method'
                    // Marcelo 2026-09-09: palabra con un punto de color bien marcado delante — sólido, no arcoíris.
                    ? <p className="m-0 flex flex-wrap gap-x-3 gap-y-1.5">{k.words.map((w, i) => { const cs = [COMMAND_COLORS.posture, COMMAND_COLORS.rail, COMMAND_COLORS.projection, COMMAND_COLORS.maneuver, COMMAND_COLORS.posture]; return <span key={`${w}-${i}`} className="inline-flex items-center gap-1.5 text-[15px] font-bold" style={{ color: INK }}><i className="inline-block w-3 h-3 rounded-full shrink-0" style={{ background: cs[i] ?? CYAN, boxShadow: '0 0 0 1px rgba(16,38,59,.15)' }} />{w}</span>; })}</p>
                    : <p className="m-0 flex flex-wrap gap-x-3 gap-y-1.5">{k.words.map((w, i) => <span key={`${w}-${i}`} className="text-[15px] font-bold" style={{ color: INK }}>{w}</span>)}</p>}
                </div>
              ))}
              {cfg.kind !== 'entry' && <p className="text-[13px] mt-2 mb-0" style={{ color: MUTED }}>The body words are the method&apos;s formula: posture → rotation on the rail → projection → maneuver → back to posture. Same colours as the line on the wave.</p>}
              <p className="text-[14px] mt-2 mb-0" style={{ color: INK }}>Learn them on land, in the drill, until you can run them without thinking. In the water you carry one: the mission, or the one word that is breaking.</p>
              <details className="tss-accordion mt-3">
                <summary>Go deeper: each step as its own page<Chevron /></summary>
                <div className="px-3 pb-3 flex flex-wrap gap-2">
                  {cfg.stepIds.map((id) => (
                    <a key={id} href={`${portal}?tab=course&lesson=${id}`} className="text-[13px] font-semibold px-3 py-1.5 rounded-full no-underline" style={{ background: WHITE, border: `1px solid ${BORDER}`, color: INK }}>{shortLesson(lessons[id]?.title ?? id)} →</a>
                  ))}
                </div>
              </details>
            </Card>
          </div>
        )}

        {/* ── FEEL ── */}
        {tab === 'feel' && (
          <div className="mt-3">
            <Card title="Feel it · out of the water" color={VIOLET_BRIGHT}>
              <p className="tss-intro">Connect the mechanics to your body before the wave asks for them.</p>
              <p className="text-[14px] m-0" style={{ color: INK }}>Three kinds of rehearsal, from stillness to movement. None of them is a test.</p>
            </Card>
            <Card title="Visualize" color={VIOLET_BRIGHT}>
              <p className="text-[15px] m-0 leading-snug" style={{ color: INK }}>{cfg.feel.visualize}</p>
            </Card>
            <Card title="Simulate · land, sand, pool or calm water" color={VIOLET_BRIGHT}>
              {cfg.feel.land.map((id) => <Piece key={id} p={pieces[id]} canTrack={canTrack} />)}
            </Card>
            <Card title="Simulate · surf skate" color={VIOLET_BRIGHT}>
              {cfg.feel.skate.map((id) => <Piece key={id} p={pieces[id]} canTrack={canTrack} />)}
            </Card>
            <p className="text-[13px] px-1 mt-3 mb-0" style={{ color: ON_DARK }}>Each drill closes with one question: ready to take it to the water?</p>
          </div>
        )}

        {/* ── DO ── */}
        {tab === 'do' && (
          <div className="mt-3">
            <Card title="Mission · in the water" color={GREEN_BRIGHT}>
              <p className="tss-intro">{cfg.do.result}</p>
              <Row k="Timing">{cfg.do.timing}</Row>
              <Row k="Plan">You set the time and the number of waves before you paddle out. The plan is yours; it is not graded.</Row>
              {/* Conexión con Let's Play (Marcelo 2026-09-09): la línea completa
                  = sequence_run; el foco elegido = step_focus con su palabra como
                  objetivo de la sesión. La misión sola queda como opción. */}
              {(() => {
                // Let's Play agrupa por wb_sequence_id: el mismo id de la página (BB-SEQ-09…).
                const lp = cfg.id;
                const chosen = focus ? cfg.details.find((d) => d.key === focus) : null;
                const focusStep = chosen?.deeper?.lessonId ?? null;
                const word = chosen ? chosen.title.replace(/^\d+ · /, '') : '';
                if (!canTrack) return <p className="inline-flex items-center gap-2 mt-3 mb-0 text-[13px]" style={{ color: MUTED }}><Lock size={13} /> Training and logging come with your training tool.</p>;
                if (!lp) return pieces[cfg.do.missionId] ? <a href={`${portal}?tab=sequence&drill=${cfg.do.missionId}`} className="tss-primary no-underline"><Play size={16} /> Start the mission in Let&apos;s Play</a> : null;
                const runHref = `${portal}?tab=sequence&seq=${lp}&mode=sequence_run`;
                const focusHref = focusStep ? `${portal}?tab=sequence&seq=${lp}&mode=step_focus&focus=${focusStep}&word=${encodeURIComponent(word)}` : null;
                return (
                  <div className="mt-1">
                    {focusHref ? (
                      <a href={focusHref} className="tss-primary no-underline" style={chosen?.command ? { background: COMMAND_COLORS[chosen.command], color: chosen.command === 'projection' ? NAVY : WHITE } : undefined}><Play size={16} /> Train it in Let&apos;s Play · focus: {word}</a>
                    ) : (
                      <a href={runHref} className="tss-primary no-underline"><Play size={16} /> Train the whole line in Let&apos;s Play</a>
                    )}
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      {focusHref && <Go href={runHref} small>or the whole line, no focus</Go>}
                      {pieces[cfg.do.missionId] && <a href={`${portal}?tab=sequence&drill=${cfg.do.missionId}`} className="text-[13px] no-underline" style={{ color: MUTED }}>Log the mission only</a>}
                    </div>
                  </div>
                );
              })()}
            </Card>
            <Card title="Choose a focus · optional">
              <p className="text-[14px] mt-0 mb-2" style={{ color: INK }}>The mission is always the whole line. These are the steps your body runs; if one of them is breaking, pick it and it rides along as your word for the session. Pick nothing and just surf the line.</p>
              <div className="flex flex-wrap gap-2">
                {cfg.details.map((d) => (
                  <button key={d.key} type="button" onClick={() => setFocus(focus === d.key ? null : d.key)} aria-pressed={focus === d.key}
                    className="inline-flex items-center gap-2 text-[13px] px-3 py-2 rounded-full min-h-[40px] border"
                    style={focus === d.key ? { background: CYAN, borderColor: CYAN, color: NAVY, fontWeight: 700 } : { background: WHITE, borderColor: BORDER, color: INK }}>
                    {d.command && <i className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COMMAND_COLORS[d.command] }} />}
                    {d.title}
                  </button>
                ))}
              </div>
              {cfg.details.filter((d) => d.key === focus).map((d) => (
                <div key={d.key} className="mt-3 rounded-[5px] p-3" style={{ background: PAPER, border: `1px solid ${BORDER}` }}>
                  <p className="text-[13px] mt-0 mb-2" style={{ color: MUTED }}>Where it breaks: {d.symptom}</p>
                  {d.indicators.map((ind, i) => <Indicator key={i} ok={ind.ok} no={ind.no} fix={ind.fix} first={i === 0} />)}
                  {d.deeper && (
                    <div className="mt-2 flex flex-wrap gap-2 text-[13px]">
                      <a href={`${portal}?tab=course&lesson=${d.deeper.lessonId}`} className="px-3 py-1.5 rounded-full no-underline font-semibold" style={{ background: WHITE, border: `1px solid ${BORDER}`, color: INK }}>Go deeper → {d.deeper.label}</a>
                      {d.deeper.drillId && pieces[d.deeper.drillId] && <button type="button" onClick={() => go('feel')} className="px-3 py-1.5 rounded-full font-semibold" style={{ background: WHITE, border: `1px solid ${BORDER}`, color: VIOLET }}>Drill: {pieces[d.deeper.drillId].title} · Feel it</button>}
                      {canTrack && d.deeper.missionId && pieces[d.deeper.missionId] && <a href={`${portal}?tab=sequence&drill=${d.deeper.missionId}`} className="px-3 py-1.5 rounded-full no-underline font-semibold" style={{ background: WHITE, border: `1px solid ${BORDER}`, color: GREEN }}>Mission: {pieces[d.deeper.missionId].title}</a>}
                    </div>
                  )}
                </div>
              ))}
            </Card>
            <WhereYouAre progress={progress} portal={portal} />
            <Card title="Competence · is it yours yet?" color={GREEN_BRIGHT}>
              <p className="text-[14px] m-0 leading-snug" style={{ color: INK }}>{cfg.do.competence}</p>
            </Card>
          </div>
        )}

        {/* ── REVIEW ── */}
        {tab === 'review' && (
          <div className="mt-3">
            <Card title="How you know you have it" color={GREEN_BRIGHT}>
              <p className="text-[14px] mt-0 mb-2" style={{ color: INK }}>One topic per step of the sequence. Open only the one you want to check.</p>
              {cfg.details.map((d) => (
                <details key={d.key} className="tss-accordion">
                  <summary>
                    <span className="inline-flex items-center gap-2.5 flex-1">
                      {d.command && <i className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COMMAND_COLORS[d.command] }} />}
                      <span>{d.title}</span>
                    </span>
                    <span className="inline-flex items-center gap-2"><span className="text-[12px] font-normal" style={{ color: MUTED }}>{d.indicators.length}</span><Chevron /></span>
                  </summary>
                  <div className="px-3 pb-3">
                    {d.indicators.map((ind, i) => <Indicator key={i} ok={ind.ok} no={ind.no} fix={ind.fix} first={i === 0} />)}
                    {d.deeper && <Go href={`${portal}?tab=course&lesson=${d.deeper.lessonId}`} small>Go deeper → {d.deeper.label}</Go>}
                  </div>
                </details>
              ))}
            </Card>
            {lessons[cfg.think.bodyFromLesson]?.mistakes && (
              <Card title="Common mistakes" color="#FF6B6B">
                {[cfg.think.bodyFromLesson].map((id) => lessons[id]?.mistakes ? (
                  <details key={id} className="tss-accordion">
                    <summary><span className="flex-1">{shortLesson(lessons[id].title)}</span><Chevron /></summary>
                    <div className="px-3 pb-3"><MarkdownContent markdown={lessons[id].mistakes} /></div>
                  </details>
                ) : null)}
              </Card>
            )}
            <WhereYouAre progress={progress} portal={portal} />
            <Card title="How it feels" color={VIOLET_BRIGHT}>
              <p className="text-[14px] m-0 leading-snug" style={{ color: INK }}>{cfg.review.howItFeels}</p>
            </Card>
            <Card title="After a session">
              <p className="text-[14px] m-0" style={{ color: INK }}><b>★ 1–5</b> how it went · <b>Focus 0–3</b> · <b>Flow</b> bored → too much. Then, if you want, check the indicators above one by one. The weakest one becomes your next word.</p>
              {canTrack && <Go href={`${portal}?tab=sequence`} small>Open Let&apos;s Play</Go>}
            </Card>
          </div>
        )}

        {next && (
          <button type="button" onClick={() => go(next)} className="tss-primary">
            Next: {TABS.find((t) => t.key === next)?.label} <Icon name="arrow" />
          </button>
        )}
        <p className="text-[12px] mt-6 mb-0 flex flex-wrap items-center gap-x-3 gap-y-1" style={{ color: ON_DARK, opacity: .8 }}>
          <span>Colours on the wave</span>
          {(['posture', 'rail', 'projection', 'maneuver', 'closure'] as const).map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5"><i className="inline-block w-2 h-2 rounded-full" style={{ background: COMMAND_COLORS[c] }} />{c}</span>
          ))}
        </p>
      </div>

      {/* Nav inferior blanca: los mismos destinos del portal. */}
      <nav className="tss-bottom-nav" aria-label="Main navigation"><div className="tss-bottom-nav-inner">
        <a href={`${portal}?tab=home`} className="flex flex-col items-center justify-center gap-1 min-h-[68px] text-[11px] font-bold uppercase no-underline" style={{ color: INK, letterSpacing: '0.055em' }}><Icon name="home" />Home</a>
        <a href={`${portal}?tab=course`} aria-current="page" className="relative flex flex-col items-center justify-center gap-1 min-h-[68px] text-[11px] font-bold uppercase no-underline" style={{ color: INK, letterSpacing: '0.055em' }}><span style={{ color: CYAN }}><Icon name="course" /></span>Course<span className="absolute bottom-[5px] w-[72%] h-1 rounded-full" style={{ background: CYAN }} /></a>
        <a href={`${portal}?tab=sequence`} className="flex flex-col items-center justify-center gap-1 min-h-[68px] text-[11px] font-bold uppercase no-underline" style={{ color: INK, letterSpacing: '0.055em' }}><Icon name="play" />Let&apos;s Play</a>
      </div></nav>
    </section>
  );
}

/** "Where you are · from Let's Play" — el mismo bloque en Do y en Review. */
function WhereYouAre({ progress, portal }: { progress?: SequenceProgress | null; portal: string }) {
  if (!progress || !(progress.ratedSteps > 0 || progress.lastRun !== null)) return null;
  return (
    <Card title="Where you are · from Let's Play" color={GOLD_BRIGHT}>
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-[14px]" style={{ color: INK }}>
        {progress.minRating !== null && <span><b>{progress.minRating}★</b> the sequence is worth its weakest step</span>}
        {progress.side === 'both' && progress.sideRatings ? (
          <span>frontside <b>{progress.sideRatings.fs ?? '—'}{progress.sideRatings.fs != null ? '★' : ''}</b> · backside <b>{progress.sideRatings.bs ?? '—'}{progress.sideRatings.bs != null ? '★' : ''}</b></span>
        ) : progress.lastRun !== null && <span>last run <b>{progress.lastRun}★</b></span>}
        <span>{progress.ratedSteps}/{progress.totalSteps} steps rated</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {progress.steps.map((st) => (
          <span key={st.id} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ background: WHITE, border: `1px solid ${BORDER}`, color: st.rating === null ? MUTED : st.rating >= 4 ? GREEN : GOLD }}>
            {st.title.replace(/ Operationalized at Blue Belt/, '')} {st.rating === null ? '·' : `${st.rating}★`}
          </span>
        ))}
      </div>
      {(progress.heldBackTitle || progress.weakestTitle) && (
        <Callout label="Work on">
          {progress.heldBackTitle ? `${progress.heldBackTitle} held your last run back.` : `${progress.weakestTitle} is the earliest step below 4★.`} Pick it as your focus above and train it.
        </Callout>
      )}
      <Go href={`${portal}?tab=sequence`} small>See all your sequences in Let&apos;s Play</Go>
    </Card>
  );
}

/** YouTube / Vimeo → iframe; archivo directo → <video>. */
function SequenceVideo({ url, title }: { url: string; title: string }) {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{6,})/);
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  const src = yt ? `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1` : vm ? `https://player.vimeo.com/video/${vm[1]}` : null;
  const box = 'relative w-full rounded-[5px] overflow-hidden';
  if (src) return <div className={box} style={{ paddingTop: '56.25%', background: NAVY }}><iframe src={src} title={title} className="absolute inset-0 w-full h-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /></div>;
  return <video src={url} controls playsInline preload="metadata" className="w-full block rounded-[5px]" title={title} />;
}

function Card({ title, color, className = '', children }: { title?: string; color?: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={`tss-card ${className}`} style={color ? { borderTop: `4px solid ${color}` } : undefined}>
      {title && <h2 className="tss-section-title">{title}</h2>}
      {children}
    </section>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="py-2.5" style={{ borderTop: `1px solid ${BORDER}` }}>
      <p className="m-0 mb-0.5" style={{ ...MONO, color: MUTED }}>{k}</p>
      <p className="text-[14px] leading-snug m-0" style={{ color: INK }}>{children}</p>
    </div>
  );
}

/** La regla / el aviso: caja navy dentro de la tarjeta crema (como "timing" en Three Circles). */
function Callout({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="tss-timing"><div>
      {label && <h3>{label}</h3>}
      <p style={{ color: WHITE, fontSize: 15, fontWeight: 600, lineHeight: 1.35 }}>{children}</p>
    </div></div>
  );
}

function Indicator({ ok, no, fix, first }: { ok: string; no: string; fix: string; first: boolean }) {
  return (
    <div className="py-2" style={{ borderTop: first ? undefined : `1px solid ${BORDER}` }}>
      <p className="text-[14px] m-0" style={{ color: INK }}><b style={{ color: GREEN }}>✓</b> {ok}</p>
      <p className="text-[14px] mt-1 mb-0" style={{ color: INK }}><b style={{ color: RED }}>✗</b> {no}</p>
      <p className="text-[14px] mt-1 mb-0" style={{ color: INK }}><b style={{ color: GOLD }}>Fix:</b> {fix}</p>
    </div>
  );
}

/** Link sobre crema: tinta, negrita, flecha. */
function Go({ href, children, small = false }: { href: string; children: React.ReactNode; small?: boolean }) {
  return <a href={href} className={`inline-flex items-center gap-1.5 font-bold no-underline ${small ? 'text-[13px] mt-1' : 'text-[15px]'}`} style={{ color: INK }}>{children} <ArrowRight size={small ? 13 : 15} /></a>;
}

function Piece({ p, href = null, canTrack }: { p?: PieceRow; href?: string | null; canTrack: boolean }) {
  if (!p) return null;
  const md = (p.description_md ?? '').trim();
  return (
    <div className="mt-2 rounded-[5px] px-3 py-2.5" style={{ background: PAPER, border: `1px solid ${BORDER}` }}>
      <p className="text-[15px] font-bold m-0" style={{ color: INK }}>{p.title}</p>
      {/* Los drills de White/Yellow vienen en markdown (## What you'll train…):
          se renderizan como en el curso, no como texto plano. */}
      {md && (md.startsWith('#') || /\n\s*[-*] /.test(md)
        ? <div className="mt-1"><MarkdownContent markdown={md} /></div>
        : <p className="text-[14px] mt-1 mb-0 leading-snug" style={{ color: INK }}>{md}</p>)}
      <div className="flex items-center gap-3 mt-1.5 text-[12px]" style={{ color: MUTED }}>
        {p.time_estimate && <span>{p.time_estimate}</span>}
        {p.reps_recommended && <span>{p.reps_recommended} reps</span>}
        {/* Los drills son ensayo: se hacen, no se registran (doctrina 2026-09-10). Solo las misiones llevan a Let's Play. */}
        {href ? (canTrack ? <a href={href} className="inline-flex items-center gap-1 font-bold no-underline" style={{ color: INK }}><Play size={12} /> Log it in Let&apos;s Play</a> : <span className="inline-flex items-center gap-1"><Lock size={11} /> with your training tool</span>) : <span>rehearsal · no need to log it</span>}
      </div>
    </div>
  );
}

function Chevron() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>;
}

function Icon({ name }: { name: 'home' | 'course' | 'play' | 'back' | 'arrow' }) {
  const p: Record<string, React.ReactNode> = {
    home: <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
    course: <><path d="M2 8.5 12 4l10 4.5-10 4.5z" /><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" /></>,
    play: <path d="M7 4.5v15l12-7.5z" />,
    back: <path d="M15 5l-7 7 7 7" />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  };
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{p[name]}</svg>;
}
