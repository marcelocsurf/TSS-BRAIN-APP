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

const INK = '#061C2B', PANEL = '#0F1E33', CYAN = '#00D2FF', GREEN = '#06D6A0', GOLD = '#FFD166', VIOLET = '#B48CFF', RED = '#FF6B6B', MUTED = '#8AA0B2';
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

export function SequencePage({ cfg, lessons, pieces, token, canTrack }: {
  cfg: SequencePageConfig;
  lessons: Record<string, LessonBits>;
  pieces: Record<string, PieceRow>;
  token: string;
  canTrack: boolean;
}) {
  const [tab, setTab] = useState<Tab>('think');
  const portal = `/portal/${token}`;
  const body = lessons[cfg.think.bodyFromLesson];
  const order: Tab[] = ['think', 'feel', 'do', 'review'];
  const next = order[order.indexOf(tab) + 1];
  const go = (t: Tab) => { setTab(t); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="min-h-screen pb-24" style={{ background: '#000', color: '#F0F7FA' }}>
      <div className="max-w-lg md:max-w-2xl mx-auto px-4 pt-4">
        <a href={`${portal}?tab=course`} className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: CYAN }}><ArrowLeft size={14} /> Course</a>
        <p className="mt-3" style={{ ...F_M, color: CYAN }}>Sequence #{cfg.number} · {cfg.belt.replace('_belt', ' belt')}</p>
        <h1 className="text-[26px] font-extrabold leading-tight mt-1" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%' }}>{cfg.title}</h1>
        <p className="text-[12px] mt-1" style={{ color: MUTED }}>{cfg.stepIds.map((id) => lessons[id]?.title.replace(/ Operationalized at Blue Belt/, '') ?? id).join(' → ')}</p>

        {/* Pestañas */}
        <div className="grid grid-cols-4 gap-1 rounded-2xl p-1.5 mt-4 sticky top-2 z-10" style={{ background: PANEL }} role="tablist">
          {TABS.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => go(t.key)}
              className="rounded-xl py-2 text-center"
              style={tab === t.key ? { background: '#132840', boxShadow: `inset 0 0 0 1px ${CYAN}55` } : {}}>
              <span className="block text-[13px] font-bold" style={{ color: tab === t.key ? CYAN : '#F0F7FA' }}>{t.label}</span>
              <span className="hidden sm:block text-[10px]" style={{ color: MUTED }}>{t.sub}</span>
            </button>
          ))}
        </div>

        {/* ── THINK ── */}
        {tab === 'think' && (
          <div className="space-y-3 mt-4">
            <Card eyebrow="01 · What it is">
              <h2 className="text-[16px] font-bold">{cfg.think.whatIs.headline}</h2>
              <WaveBoard data={cfg.think.board} title={`${cfg.title} on the wave face`} />
              <Row k="The line">{cfg.think.whatIs.line}</Row>
              <Row k="Where">{cfg.think.whatIs.where}</Row>
              <Row k="What for">{cfg.think.whatIs.whatFor}</Row>
            </Card>
            <Card eyebrow="02 · Feet">
              <div className="flex gap-4 items-start">
                <BoardMap compact active={cfg.think.feet.phases.map((p) => p.back)} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-snug" style={{ color: '#cfdbe4' }}>{cfg.think.feet.text}</p>
                  <div className="mt-2 divide-y" style={{ borderColor: 'rgba(255,255,255,.06)' }}>
                    {cfg.think.feet.phases.map((p) => (
                      <div key={p.phase} className="flex items-center justify-between py-1.5 text-[12px]">
                        <span style={{ color: MUTED }}>{p.phase}</span>
                        <span className="font-mono font-bold" style={{ color: '#F0F7FA' }}>{p.back}{p.note ? <span className="font-normal ml-1" style={{ color: MUTED }}>· {p.note}</span> : null}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
            <Card eyebrow="03 · The sequence · how your body does it">
              {body?.body ? <MarkdownContent markdown={body.body} /> : <p style={{ color: MUTED }}>Coming soon.</p>}
            </Card>
            <Card eyebrow="04 · The rules that hold it together">
              {body?.rules ? <MarkdownContent markdown={body.rules} /> : <p style={{ color: MUTED }}>Coming soon.</p>}
            </Card>
            <Card eyebrow="05 · Key words">
              {cfg.think.keyWords.map((k) => (
                <p key={k.label} className="text-[14px] mb-1"><span style={{ color: MUTED }}>{k.label} · </span><span className="font-mono" style={{ color: CYAN }}>{k.words.join(' · ')}</span></p>
              ))}
              <p className="text-[12.5px] mt-2" style={{ color: '#cfdbe4' }}>Learn them on land, in the drill, until you can run them without thinking. In the water you carry one: the mission, or the one word that is breaking.</p>
              <details className="mt-3">
                <summary className="cursor-pointer text-[12.5px]" style={{ color: CYAN }}>Go deeper: each step as its own page</summary>
                <div className="mt-2 flex flex-wrap gap-2">
                  {cfg.stepIds.map((id) => (
                    <a key={id} href={`${portal}?tab=course&lesson=${id}`} className="text-[12px] px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,.06)', color: '#F0F7FA' }}>{lessons[id]?.title.replace(/ Operationalized at Blue Belt/, '') ?? id} →</a>
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
              <p className="text-[13px] mt-1" style={{ color: '#cfdbe4' }}>Three kinds of rehearsal, from stillness to movement. None of them is a test.</p>
            </Card>
            <Card eyebrow="Visualize" color={VIOLET}>
              <p className="text-[13.5px]" style={{ color: '#cfdbe4' }}>{cfg.feel.visualize}</p>
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
            <Card eyebrow="Competence · is it yours yet?" color={GREEN}>
              <p className="text-[13.5px]" style={{ color: '#cfdbe4' }}>{cfg.do.competence}</p>
            </Card>
            <Card eyebrow="When it does not come out">
              <p className="text-[13px] mb-2" style={{ color: '#cfdbe4' }}>Two things can fail: the wave (no wall, wrong timing) or a step of the body. If it is the body, find the step and open its detail — one step, one detail, one session.</p>
              {cfg.do.whenNot.map((w) => (
                <a key={w.label + w.symptom} href={`${portal}?tab=course&lesson=${w.lessonId}`} className="block rounded-xl px-3 py-2.5 mb-1.5" style={{ background: 'rgba(255,255,255,.05)' }}>
                  <span className="block text-[12px]" style={{ color: MUTED }}>{w.symptom}</span>
                  <span className="text-[13px] font-semibold" style={{ color: '#F0F7FA' }}>→ open {w.label}</span>
                </a>
              ))}
            </Card>
          </div>
        )}

        {/* ── REVIEW ── */}
        {tab === 'review' && (
          <div className="space-y-3 mt-4">
            {cfg.review.groups.map((g) => (
              <Card key={g.title} eyebrow={`How you know you have it · ${g.title}`} color={GREEN}>
                {g.indicators.map((ind, i) => (
                  <div key={i} className="py-2.5" style={{ borderTop: i ? '1px solid rgba(255,255,255,.06)' : undefined }}>
                    <p className="text-[13px]"><span style={{ color: GREEN }}>✓</span> {ind.ok}</p>
                    <p className="text-[12.5px] mt-1" style={{ color: '#cfdbe4' }}><span style={{ color: RED }}>✗</span> {ind.no}</p>
                    <p className="text-[12.5px] mt-1"><span className="font-bold" style={{ color: GOLD }}>Fix:</span> {ind.fix}
                      {ind.step && <a href={`${portal}?tab=course&lesson=${ind.step.lessonId}`} className="ml-2 text-[12px]" style={{ color: CYAN }}>Go deeper → {ind.step.label}</a>}
                    </p>
                  </div>
                ))}
              </Card>
            ))}
            {cfg.stepIds.some((id) => lessons[id]?.mistakes) && (
              <Card eyebrow="Common mistakes" color={RED}>
                {cfg.stepIds.map((id) => lessons[id]?.mistakes ? (
                  <div key={id} className="mb-2">
                    <p className="text-[11px] mb-1" style={{ ...F_M, color: MUTED }}>{lessons[id].title.replace(/ Operationalized at Blue Belt/, '')}</p>
                    <MarkdownContent markdown={lessons[id].mistakes} />
                  </div>
                ) : null)}
              </Card>
            )}
            <Card eyebrow="How it feels" color={VIOLET}>
              <p className="text-[13.5px]" style={{ color: '#cfdbe4' }}>{cfg.review.howItFeels}</p>
            </Card>
            <Card eyebrow="After a session">
              <p className="text-[13px]" style={{ color: '#cfdbe4' }}><b>★ 1–5</b> how it went · <b>Focus 0–3</b> · <b>Flow</b> bored → too much. Then, if you want, check the indicators above one by one. The weakest one becomes your next word.</p>
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
      <p className="text-[13px] leading-snug" style={{ color: '#cfdbe4' }}>{children}</p>
    </div>
  );
}

function Piece({ p, href, canTrack }: { p?: PieceRow; href: string; canTrack: boolean }) {
  if (!p) return null;
  return (
    <div className="py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
      <p className="text-[14px] font-semibold">{p.title}</p>
      {p.description_md && <p className="text-[12.5px] mt-1 leading-snug" style={{ color: '#cfdbe4' }}>{p.description_md}</p>}
      <div className="flex items-center gap-3 mt-1.5 text-[11px]" style={{ color: MUTED }}>
        {p.time_estimate && <span>{p.time_estimate}</span>}
        {p.reps_recommended && <span>{p.reps_recommended} reps</span>}
        {canTrack ? <a href={href} className="inline-flex items-center gap-1 font-semibold" style={{ color: CYAN }}><Play size={12} /> Rehearse it</a> : <span className="inline-flex items-center gap-1"><Lock size={11} /> with your training tool</span>}
      </div>
    </div>
  );
}
