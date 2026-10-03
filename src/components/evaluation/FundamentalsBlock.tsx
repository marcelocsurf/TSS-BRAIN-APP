'use client';

// ═══ FUNDAMENTOS · el bloque del coach (Marcelo 2026-10-03) ═══
//
// Las estrellas de TÉCNICA, aparte de las secuencias: los Tres Círculos
// (cuerpo · tabla · ola), el Infinite Circle y las herramientas. Cada fila es
// un paso real por lado y la estrella se escribe por el MISMO camino que
// SequenceEvaluation (onRate → setOfficialStepRating en la ficha; el mapa de
// la evaluación final en el camp, que closeCampFinal escribe). No hay
// "estrella del fundamento": es la del paso. Nada de esto entra en la
// aprobación de la cinta (4★ en cada paso del catálogo).
//
// Vive debajo de las secuencias en las dos puertas (ficha del alumno y
// evaluación final del camp), plegado: la línea de arriba dice cuántos
// tienen nota. Fuente única: src/lib/evaluation/fundamentals.ts.

import { useState } from 'react';
import { StarRating } from '@/components/sequence/StarRating';
import { fundamentalsView, fundamentalDotColor, type FundamentalStarView } from '@/lib/evaluation/fundamentals';
import { STEP_HOMES } from '@/lib/evaluation/shared-steps';
import { SEQUENCE_PAGES, isCircleSequence } from '@/lib/sequence-pages';
import { SIDE_SHORT, sequencePrefix } from '@/lib/constants/learning-blocks';

/** "#3 · #8": las secuencias numeradas donde también vive el paso. */
function numberedHomes(stepId: string): string[] {
  return (STEP_HOMES[stepId] ?? [])
    .filter((id) => !isCircleSequence(id))
    .map((id) => sequencePrefix(id, SEQUENCE_PAGES[id]?.number))
    .filter((p): p is string => !!p);
}

/** La nota del paso compartido, solo para los lados que tienen estrella
 *  (misma regla que SequenceEvaluation): "también en #3 · #8". */
function sharedNote(sides: FundamentalStarView[]): string | null {
  const parts = sides
    .filter((s) => s.coach !== null)
    .map((s) => {
      const homes = numberedHomes(s.stepId);
      if (homes.length === 0) return null;
      return `${s.side === 'one' ? '' : `${SIDE_SHORT[s.side]} `}en ${homes.join(' · ')}`;
    })
    .filter((x): x is string => !!x);
  return parts.length ? `también ${parts.join(' · ')}` : null;
}

export function FundamentalsBlock({
  ratings,
  onRate,
  defaultOpen = false,
}: {
  /** step_id → estrella oficial (null/ausente = sin nota). El mismo mapa que SequenceEvaluation. */
  ratings: Record<string, number | null | undefined>;
  /** Escribe por el mismo camino que SequenceEvaluation (null = borrar). */
  onRate: (changes: { stepId: string; stars: number | null }[]) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const view = fundamentalsView(ratings);

  return (
    <div className="rounded-[5px] border border-[#DCD7C6] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full px-3 py-2.5 bg-[#F7F9FA] flex items-center justify-between gap-2 text-left"
      >
        <span className="min-w-0">
          <span className="block text-[13px] font-semibold text-[#10263B]">
            Fundamentos · {view.rated} de {view.total} con nota
          </span>
          <span className="block text-[10px] text-[#55666E]">
            Técnica, aparte de las secuencias · no entra en la aprobación de la cinta
          </span>
        </span>
        <span className={`text-[#55666E] text-xs transition ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="divide-y divide-gray-100">
          {view.groups.map((g) => (
            <div key={g.key} className="px-3 py-2">
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#55666E] mb-1.5">
                {g.label.es} · {g.rated}/{g.total}
              </p>
              <div className="space-y-2">
                {g.items.map((item) => {
                  const shared = sharedNote(item.sides);
                  return (
                    <div key={item.key} className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] text-[#10263B] flex items-center gap-1.5">
                          <i className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: fundamentalDotColor(item) }} />
                          <span className="truncate">{item.name.es}</span>
                          {item.note && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#DCD7C6] text-[#10263B] shrink-0">{item.note.es.toUpperCase()}</span>
                          )}
                        </p>
                        {item.textParts && (
                          <p className="text-[10px] text-[#55666E] mt-0.5">
                            {item.textParts.map((t) => t.es).join(' · ')} · una sola estrella
                          </p>
                        )}
                        {shared && <p className="text-[10px] italic text-[#55666E] mt-0.5">{shared}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {item.sides.map((s) => (
                          <div key={s.stepId} className="flex items-center gap-1.5">
                            {s.side !== 'one' && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#DCD7C6] text-[#10263B]">{SIDE_SHORT[s.side]}</span>
                            )}
                            {s.label && <span className="text-[10px] text-[#55666E]">{s.label}</span>}
                            <StarRating
                              value={s.coach}
                              size="sm"
                              variant="official"
                              onChange={(n) => onRate([{ stepId: s.stepId, stars: n }])}
                            />
                            {s.coach !== null ? (
                              <button
                                type="button"
                                onClick={() => onRate([{ stepId: s.stepId, stars: null }])}
                                className="text-[11px] text-[#55666E] hover:text-red-600"
                                title="Borrar esta nota"
                              >
                                ×
                              </button>
                            ) : (
                              <span className="inline-block w-[7px]" aria-hidden="true" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <p className="px-3 py-2 text-[10px] text-[#55666E]">
            Cada estrella es la de su paso: la misma que ve el alumno en su portal. Se borra con la ×, de a una.
          </p>
        </div>
      )}
    </div>
  );
}
