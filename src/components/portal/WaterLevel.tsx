'use client';

// ═══ YOUR WATER LEVEL — la vista APARTE de la escalera del agua ═══
//
// Separada de "What it takes" a pedido de Marcelo (2026-08-29): la cinta es
// técnica, el agua es seguridad — cada una responde su propia pregunta. Esta:
// ¿qué me falta para entrar solo?
//
// El nivel solo se AFIRMA si un coach lo validó; sin validar, la escalera se
// muestra igual (los requisitos son públicos) pero sin "you are here".

import { useEffect, useState } from 'react';
import { X, Check, Waves, Loader2 } from 'lucide-react';
import { BRAND } from '@/lib/constants/brand';
import { getWaterLevel, type WaterLevelData } from '@/lib/actions/water-level';

const CYAN = BRAND.colors.cyan;
const GOLD = BRAND.colors.gold;

export function WaterLevel({ token, onClose }: { token: string; onClose: () => void }) {
  const [data, setData] = useState<WaterLevelData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getWaterLevel(token)
      .then((r) => {
        if (!alive) return;
        if (r.ok) setData(r.data);
        else setError(r.error);
      })
      .catch(() => alive && setError('Could not load your water level.'));
    return () => {
      alive = false;
    };
  }, [token]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[140]" style={{ background: '#02090F' }}>
      <div className="h-[100dvh] max-w-lg mx-auto flex flex-col" style={{ background: BRAND.colors.navy }}>
        <div
          className="shrink-0 px-4 py-4 flex items-start justify-between gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,.08)', background: BRAND.colors.navy }}
        >
          <div className="min-w-0">
            <p className="text-[9px] uppercase tracking-[.16em]" style={{ color: CYAN, fontFamily: 'var(--font-plex), DM Mono, monospace', fontWeight: 500 }}>
              In the water
            </p>
            <h2 className="text-[17px] font-bold mt-0.5" style={{ color: '#eaf4fa' }}>
              Your water level
            </h2>
            <p className="text-[12.5px] mt-1 leading-snug" style={{ color: '#8aa0b2' }}>
              Where you can paddle out on your own. Separate from your belt — this is
              safety, not technique. No stars here: you pass it or you don&apos;t.
            </p>
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

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {!data && !error && (
            <div className="flex items-center gap-2 justify-center py-16" style={{ color: '#6f8698' }}>
              <Loader2 size={16} className="animate-spin" />
              <span className="text-[13px]">Loading…</span>
            </div>
          )}
          {error && (
            <p className="text-[13px] text-center py-16" style={{ color: '#8aa0b2' }}>
              {error}
            </p>
          )}

          {data && (
            <>
              {data.provisional && (
                <p
                  className="text-[12px] rounded-xl px-3 py-2.5 leading-snug"
                  style={{ background: 'rgba(255,255,255,.05)', color: '#8aa0b2' }}
                >
                  Your level is confirmed by your coach, in the water. Until then, this is
                  the full ladder — every level keeps what the one below asks for.
                </p>
              )}

              {data.ladder.map((lv) => {
                const accent = lv.isNext ? GOLD : lv.isCurrent ? CYAN : 'rgba(255,255,255,.18)';
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
                        <span className="text-[9px] uppercase tracking-[.16em] shrink-0" style={{ color: accent, fontFamily: 'var(--font-plex), DM Mono, monospace', fontWeight: 500 }}>
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
                          <div key={`${lv.key}:${t.key}`} className="flex items-start gap-2.5 py-2">
                            <span
                              className="shrink-0 mt-0.5 rounded-full flex items-center justify-center"
                              style={{
                                width: 18,
                                height: 18,
                                background: t.passed ? 'rgba(6,214,160,.18)' : 'transparent',
                                border: t.passed ? 'none' : `1px solid ${lv.isNext ? 'rgba(255,209,102,.55)' : 'rgba(255,255,255,.18)'}`,
                              }}
                            >
                              {t.passed && <Check size={11} style={{ color: '#06D6A0' }} />}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[13px] leading-snug" style={{ color: t.passed ? '#8aa0b2' : '#eaf4fa' }}>
                                {t.target !== null && t.unit ? `${t.name} · ${t.target} ${t.unit}` : t.name}
                              </p>
                              <p className="text-[11.5px] mt-0.5 leading-snug" style={{ color: t.passed ? '#6f8698' : GOLD }}>
                                {t.passed
                                  ? t.measured != null && t.unit
                                    ? `Done · ${t.measured} ${t.unit}`
                                    : 'Done'
                                  : t.proves}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* La flotada larga: ningún nivel la pide. */}
              <div
                className="rounded-2xl px-3.5 py-3"
                style={{
                  background: data.longFloatDone ? 'rgba(255,209,102,.10)' : 'rgba(255,255,255,.035)',
                  border: `1px solid ${data.longFloatDone ? 'rgba(255,209,102,.35)' : 'rgba(255,255,255,.06)'}`,
                }}
              >
                <p className="text-[12.5px] font-semibold" style={{ color: data.longFloatDone ? GOLD : '#8aa0b2' }}>
                  {data.longFloatDone ? '★ ' : ''}The long float · {data.longFloatMinutes}+ minutes
                </p>
                <p className="text-[11.5px] mt-0.5 leading-snug" style={{ color: '#6f8698' }}>
                  No level asks for this one. It&apos;s for when there&apos;s nothing left to
                  prove: fifteen minutes in the water, no board, no hurry.
                </p>
              </div>

              <p className="text-[11.5px] text-center leading-snug pt-2" style={{ color: '#6f8698' }}>
                <Waves size={12} className="inline -mt-0.5 mr-1" />
                Your coach confirms each level in the water.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
