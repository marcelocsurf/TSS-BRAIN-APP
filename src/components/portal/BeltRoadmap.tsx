'use client';

// ═══ WHAT IT TAKES — la guía del alumno hacia su próxima cinta ═══
//
// Es la evaluación del coach dada vuelta: las mismas secuencias, el mismo
// umbral de estrellas, las mismas pruebas de agua. El alumno tenía las piezas
// sueltas (sus estrellas, su próximo movimiento) pero nunca la regla completa
// ni cuánto le faltaba.
//
// Tres decisiones que se ven en el diseño:
//   · Lo que el coach no vio queda PENDIENTE, no reprobado. Nunca en rojo.
//   · El curso se muestra pero NO bloquea la cinta.
//   · No hay botón de "aplicar": todavía no hay quién responda del otro lado.
//     Cuando la evaluación sea un servicio que se cobra, ese botón es una
//     reserva, no un formulario.

import { useEffect, useState } from 'react';
import { X, Check, Star, Waves, BookOpen, Compass, Loader2 } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';
import { getBeltRoadmap, type BeltRoadmap as Roadmap } from '@/lib/actions/belt-roadmap';

const CYAN = BRAND.colors.cyan;
const GOLD = BRAND.colors.gold;

function SectionTitle({
  icon: Icon,
  children,
  rule,
}: {
  icon: typeof Waves;
  children: React.ReactNode;
  rule?: string;
}) {
  return (
    <div className="flex items-start gap-2.5 mb-3">
      <Icon size={16} style={{ color: CYAN }} className="mt-0.5 shrink-0" />
      <div className="min-w-0">
        <h3 className="text-[14px] font-semibold" style={{ color: '#eaf4fa' }}>
          {children}
        </h3>
        {rule && (
          <p className="text-[11.5px] mt-0.5 leading-snug" style={{ color: '#8aa0b2' }}>
            {rule}
          </p>
        )}
      </div>
    </div>
  );
}

/** Una fila con estado: hecho, en curso, o todavía sin ver. */
function Row({
  done,
  pending,
  title,
  detail,
  onClick,
}: {
  done: boolean;
  pending?: boolean;
  title: string;
  detail?: string | null;
  onClick?: () => void;
}) {
  const body = (
    <div className="flex items-start gap-2.5 py-2">
      <span
        className="shrink-0 mt-0.5 rounded-full flex items-center justify-center"
        style={{
          width: 18,
          height: 18,
          background: done ? 'rgba(6,214,160,.18)' : 'transparent',
          border: done ? 'none' : `1px solid ${pending ? '#33506b' : 'rgba(255,209,102,.55)'}`,
        }}
      >
        {done && <Check size={11} style={{ color: '#06D6A0' }} />}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className="text-[13px] leading-snug"
          style={{ color: done ? '#8aa0b2' : '#eaf4fa' }}
        >
          {title}
        </p>
        {detail && (
          <p className="text-[11.5px] mt-0.5 leading-snug" style={{ color: pending ? '#6f8698' : GOLD }}>
            {detail}
          </p>
        )}
      </div>
    </div>
  );
  if (!onClick) return body;
  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      {body}
    </button>
  );
}

export function BeltRoadmap({
  token,
  onClose,
  onOpenStep,
}: {
  token: string;
  onClose: () => void;
  /** Abre el paso que frena una secuencia, en Let's Play. */
  onOpenStep?: (stepId: string) => void;
}) {
  const [data, setData] = useState<Roadmap | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getBeltRoadmap(token)
      .then((r) => {
        if (!alive) return;
        if (r.ok) setData(r.data);
        else setError(r.error);
      })
      .catch(() => alive && setError('Could not load your requirements.'));
    return () => {
      alive = false;
    };
  }, [token]);

  // El fondo no scrollea mientras la guía está abierta (mismo patrón que el
  // buzón del Home).
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const working = data?.sequences.filter((s) => s.state === 'working') ?? [];
  const unseen = data?.sequences.filter((s) => s.state === 'unrated' || s.state === 'partial') ?? [];
  const waterLeft = data?.waterTests.filter((t) => !t.passed).length ?? 0;

  // La verdad en una línea. Solo cuenta lo que BLOQUEA (secuencias y agua):
  // el curso se ve pero no frena la cinta.
  const blocking = working.length + unseen.length + waterLeft;
  const headline = !data
    ? ''
    : blocking === 0
    ? "You've got everything on the list. Talk to your coach about your evaluation."
    : `${blocking} ${blocking === 1 ? 'thing' : 'things'} left before your ${data.targetBeltLabel} evaluation.`;

  return (
    <div className="fixed inset-0 z-[130]" style={{ background: 'rgba(6,28,43,.94)' }}>
      <div className="h-[100dvh] max-w-lg mx-auto flex flex-col">
        {/* Cabecera */}
        <div
          className="shrink-0 px-4 py-4 flex items-start justify-between gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,.08)' }}
        >
          <div className="min-w-0">
            <p className="text-[9px] font-mono uppercase tracking-[.18em]" style={{ color: CYAN }}>
              What it takes
            </p>
            <h2 className="text-[17px] font-bold mt-0.5" style={{ color: '#eaf4fa' }}>
              {data ? `Your road to ${data.targetBeltLabel}` : 'Your road'}
            </h2>
            {headline && (
              <p className="text-[12.5px] mt-1 leading-snug" style={{ color: GOLD }}>
                {headline}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 -mt-1 -mr-1 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ color: '#8aa0b2' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {!data && !error && (
            <div className="flex items-center gap-2 justify-center py-16" style={{ color: '#6f8698' }}>
              <Loader2 size={16} className="animate-spin" />
              <span className="text-[13px]">Loading your requirements…</span>
            </div>
          )}
          {error && (
            <p className="text-[13px] text-center py-16" style={{ color: '#8aa0b2' }}>
              {error}
            </p>
          )}

          {data && (
            <>
              {data.targetIsCurrent && (
                <p
                  className="text-[12px] rounded-xl px-3 py-2.5 leading-snug"
                  style={{ background: 'rgba(255,255,255,.05)', color: '#8aa0b2' }}
                >
                  The requirements for the belt after {data.targetBeltLabel} aren&apos;t published yet.
                  This is the standard you hold today.
                </p>
              )}

              {/* 1 · LA SECUENCIA */}
              <section>
                <SectionTitle
                  icon={Star}
                  rule={`${data.passStars} stars in every part of every sequence — that is the whole rule. A sequence is worth its weakest step.`}
                >
                  The sequence · {data.sequencesOwned} of {data.sequences.length}
                </SectionTitle>
                <div className="rounded-2xl px-3.5 py-1" style={{ background: 'rgba(255,255,255,.05)' }}>
                  {data.sequences.map((s) => (
                    <Row
                      key={s.id}
                      done={s.state === 'owned'}
                      pending={s.state === 'unrated' || s.state === 'partial'}
                      title={`#${s.order} · ${s.name}`}
                      detail={
                        s.state === 'owned'
                          ? null
                          : s.state === 'working' && s.weakestTitle
                          ? `Holding it back: ${s.weakestTitle}${s.minRating !== null ? ` · ${s.minRating}★` : ''}`
                          : "Your coach hasn't rated this one yet"
                      }
                      onClick={
                        s.weakestStepId && onOpenStep
                          ? () => {
                              onClose();
                              onOpenStep(s.weakestStepId!);
                            }
                          : undefined
                      }
                    />
                  ))}
                </div>
                {unseen.length > 0 && (
                  <p className="text-[11.5px] mt-2 leading-snug" style={{ color: '#6f8698' }}>
                    What your coach hasn&apos;t seen yet is pending, not failed — you&apos;ll find it in your course.
                  </p>
                )}
              </section>

              {/* 2 · EL AGUA */}
              <section>
                <SectionTitle
                  icon={Waves}
                  rule="No stars here: you pass it or you don't. It's safety, not technique."
                >
                  In the water{data.nextOceanLevelName ? ` · toward ${data.nextOceanLevelName}` : ''}
                </SectionTitle>
                <div className="rounded-2xl px-3.5 py-3" style={{ background: 'rgba(255,255,255,.05)' }}>
                  {data.oceanLevelName && (
                    <div className="pb-2 mb-1" style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                      <p className="text-[12px]" style={{ color: '#8aa0b2' }}>
                        Where you are today:{' '}
                        <span style={{ color: '#eaf4fa' }}>{data.oceanLevelName}</span>
                        {data.oceanLevelProvisional && ' (still to be confirmed in the water)'}
                      </p>
                      {data.oceanLevelCleared && (
                        <p className="text-[11.5px] mt-0.5 leading-snug" style={{ color: '#6f8698' }}>
                          {data.oceanLevelCleared}
                        </p>
                      )}
                    </div>
                  )}
                  {data.waterTests.length === 0 ? (
                    <p className="text-[12.5px] py-1" style={{ color: '#8aa0b2' }}>
                      Nothing left to prove in the water at your level.
                    </p>
                  ) : (
                    data.waterTests.map((t) => (
                      <Row
                        key={t.key}
                        done={t.passed}
                        title={
                          t.target !== null && t.unit
                            ? `${t.name} · ${t.target} ${t.unit}`
                            : t.name
                        }
                        detail={t.passed ? null : t.proves}
                      />
                    ))
                  )}
                </div>
                {/* La flotada larga: no la pide ningún nivel. */}
                <div
                  className="mt-2 rounded-2xl px-3.5 py-3"
                  style={{
                    background: data.longFloatDone ? 'rgba(255,209,102,.10)' : 'rgba(255,255,255,.035)',
                    border: `1px solid ${data.longFloatDone ? 'rgba(255,209,102,.35)' : 'rgba(255,255,255,.06)'}`,
                  }}
                >
                  <p className="text-[12.5px] font-semibold" style={{ color: data.longFloatDone ? GOLD : '#8aa0b2' }}>
                    {data.longFloatDone ? '★ ' : ''}The long float · {data.longFloatMinutes}+ minutes
                  </p>
                  <p className="text-[11.5px] mt-0.5 leading-snug" style={{ color: '#6f8698' }}>
                    No level asks for this one. It&apos;s for when there&apos;s nothing left to prove:
                    fifteen minutes in the water, no board, no hurry.
                  </p>
                </div>
              </section>

              {/* 3 · EL CURSO */}
              <section>
                <SectionTitle icon={BookOpen} rule="Good to have. It doesn't hold your belt back.">
                  Your course
                </SectionTitle>
                <div className="rounded-2xl px-3.5 py-1" style={{ background: 'rgba(255,255,255,.05)' }}>
                  <Row done={data.preCourseCompleted} title="Pre-course finished" />
                  <Row
                    done={data.lessonsTotal > 0 && data.lessonsCompleted >= data.lessonsTotal}
                    title={`${data.targetBeltLabel} lessons`}
                    detail={`${data.lessonsCompleted} of ${data.lessonsTotal} done`}
                  />
                </div>
              </section>

              {/* 4 · AUTONOMÍA (solo la cinta que la pide) */}
              {data.autonomyPrinciples.length > 0 && (
                <section>
                  <SectionTitle icon={Compass} rule="Your coach confirms this one during your evaluation.">
                    On your own
                  </SectionTitle>
                  <div className="rounded-2xl px-3.5 py-1" style={{ background: 'rgba(255,255,255,.05)' }}>
                    {data.autonomyPrinciples.map((p) => (
                      <Row
                        key={p}
                        done={false}
                        pending
                        title="You can name which stage of the sequence failed, by yourself — without being told."
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Lo último que le dijo su coach */}
              {data.coachFocus && (
                <div
                  className="rounded-2xl px-4 py-3.5"
                  style={{ background: 'rgba(0,210,255,.08)', border: '1px solid rgba(0,210,255,.28)' }}
                >
                  <p className="text-[9px] tracking-[.18em] uppercase" style={{ color: CYAN }}>
                    From your coach
                  </p>
                  <p className="text-[13.5px] mt-1 leading-snug" style={{ color: '#eaf4fa' }}>
                    🎯 {data.coachFocus}
                  </p>
                </div>
              )}

              <p className="text-[11.5px] text-center leading-snug pt-1" style={{ color: '#6f8698' }}>
                Your coach decides when you&apos;re ready. This is the same list they fill in.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
