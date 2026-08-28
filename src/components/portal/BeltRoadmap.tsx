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
import { sequenceLabel } from '@/lib/constants/learning-blocks';
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
  // Se puede mirar CUALQUIER cinta, no solo la propia (Marcelo 2026-08-28:
  // "si pongo en white que salga ese, si pongo blue que salga ese"). null =
  // la que le toca.
  const [belt, setBelt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getBeltRoadmap(token, belt ?? undefined)
      .then((r) => {
        if (!alive) return;
        if (r.ok) setData(r.data);
        else setError(r.error);
      })
      .catch(() => alive && setError('Could not load your requirements.'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [token, belt]);

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
  const isOwnBelt = !!data && data.fromBelt === data.ownBelt;
  const count = (n: number) => `${n} ${n === 1 ? 'thing' : 'things'}`;
  const headline = !data
    ? ''
    : blocking === 0
    ? isOwnBelt && !data.targetIsCurrent
      ? "You've got everything on the list. Talk to your coach about your evaluation."
      : `You meet everything ${data.targetBeltLabel} asks for.`
    : isOwnBelt && !data.targetIsCurrent
    ? `${count(blocking)} left before your ${data.targetBeltLabel} evaluation.`
    : `${count(blocking)} left for ${data.targetBeltLabel}.`;

  return (
    // El fondo va SÓLIDO. Con la capa traslúcida se leía el curso por detrás
    // de la lista y la pantalla parecía rota (reporte de Marcelo con captura).
    <div className="fixed inset-0 z-[130]" style={{ background: '#02090F' }}>
      <div
        className="h-[100dvh] max-w-lg mx-auto flex flex-col"
        style={{ background: BRAND.colors.navy }}
      >
        {/* Cabecera */}
        <div
          className="shrink-0 px-4 py-4 flex items-start justify-between gap-3"
          style={{
            borderBottom: '1px solid rgba(255,255,255,.08)',
            background: BRAND.colors.navy,
          }}
        >
          <div className="min-w-0">
            <p className="text-[9px] font-mono uppercase tracking-[.18em]" style={{ color: CYAN }}>
              What it takes
            </p>
            <h2 className="text-[17px] font-bold mt-0.5" style={{ color: '#eaf4fa' }}>
              {!data
                ? 'Your road'
                : data.targetIsCurrent
                ? // Desde acá no hay camino publicado hacia arriba: lo que se
                  // muestra es el estándar que ya sostiene, no un destino.
                  `Your ${data.targetBeltLabel} standard`
                : `Your road to ${data.targetBeltLabel}`}
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

        {/* Cualquier cinta se puede mirar: la propia viene marcada. */}
        {data && data.availableBelts.length > 1 && (
          <div
            className="shrink-0 px-4 py-2.5 flex gap-1.5 overflow-x-auto no-scrollbar"
            style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}
          >
            {data.availableBelts.map((b) => {  // b.key = la cinta que se tiene
              const active = b.key === data.fromBelt;
              const mine = b.key === data.ownBelt;
              return (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => setBelt(b.key)}
                  className="shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-semibold"
                  style={{
                    background: active ? CYAN : 'rgba(255,255,255,.06)',
                    color: active ? BRAND.colors.navy : '#8aa0b2',
                  }}
                >
                  {b.label}
                  {mine && (
                    <span className="ml-1 text-[9.5px] font-normal opacity-80">· yours</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {(!data || loading) && !error && (
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

          {data && !loading && (
            <>
              {data.targetIsCurrent && (
                <p
                  className="text-[12px] rounded-xl px-3 py-2.5 leading-snug"
                  style={{ background: 'rgba(255,255,255,.05)', color: '#8aa0b2' }}
                >
                  The requirements for the belt after {data.targetBeltLabel} aren&apos;t published yet.
                  This is the standard that belt asks for.
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
                      title={sequenceLabel(s.id, s.order, s.name)}
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

              {/* 2 · EL AGUA — la escalera entera. Antes se veía solo el escalón
                  siguiente y el alumno no sabía qué le van a pedir más arriba
                  (Marcelo: "tiene que decir todos los requisitos"). */}
              <section>
                <SectionTitle
                  icon={Waves}
                  rule="No stars here: you pass it or you don't — it's safety, not technique. Every level keeps what the one below asks for."
                >
                  In the water
                </SectionTitle>
                <div className="space-y-2">
                  {data.oceanLadder.map((lv) => {
                    const accent = lv.isNext ? GOLD : lv.isCurrent ? CYAN : '#33506b';
                    return (
                      <div
                        key={lv.key}
                        className="rounded-2xl px-3.5 py-3"
                        style={{
                          background: lv.isNext || lv.isCurrent ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.03)',
                          border: `1px solid ${lv.isNext ? 'rgba(255,209,102,.35)' : lv.isCurrent ? 'rgba(0,210,255,.28)' : 'rgba(255,255,255,.06)'}`,
                        }}
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-[13px] font-semibold" style={{ color: lv.isCleared ? '#8aa0b2' : '#eaf4fa' }}>
                            L{lv.tier} · {lv.name}
                          </p>
                          {(lv.isCurrent || lv.isNext) && (
                            <span className="text-[9px] font-mono uppercase tracking-[.14em] shrink-0" style={{ color: accent }}>
                              {lv.isCurrent ? 'you are here' : 'next'}
                            </span>
                          )}
                        </div>
                        <p className="text-[11.5px] mt-0.5 leading-snug" style={{ color: '#6f8698' }}>
                          {lv.cleared}
                        </p>
                        {lv.tests.length > 0 && (
                          <div className="mt-1.5 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
                            {lv.tests.map((t) => (
                              <Row
                                key={`${lv.key}:${t.key}`}
                                done={t.passed}
                                pending={!lv.isNext}
                                title={
                                  t.target !== null && t.unit
                                    ? `${t.name} · ${t.target} ${t.unit}`
                                    : t.name
                                }
                                detail={
                                  t.passed
                                    ? t.measured != null && t.unit
                                      ? `Done · ${t.measured} ${t.unit}`
                                      : 'Done'
                                    : t.proves
                                }
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {data.oceanLevelProvisional && (
                  <p className="text-[11.5px] mt-2 leading-snug" style={{ color: '#6f8698' }}>
                    Your level is still to be confirmed in the water with your coach.
                  </p>
                )}
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
