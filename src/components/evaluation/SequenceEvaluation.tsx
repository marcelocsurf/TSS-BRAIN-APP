'use client';

// ═══ LA EVALUACIÓN OFICIAL, POR SECUENCIA ═══
//
// La unidad de evaluación es la SECUENCIA, no el paso suelto.
//
// Antes el coach llenaba el catálogo entero de un saque. Medido en producción
// (2026-08-27): la mediana era 25 pasos por alumno, todos el mismo día. En un
// camp de seis personas eso son 150 estrellas al final de un día largo — se
// llenan rápido, no se piensan.
//
// Ahora decide sobre 5 secuencias en White, 7 en Yellow, 13 en Blue:
//
//   ✓ La tiene    todos sus pasos llegan a la barra
//   Le falta      se abre y marca cuáles y con cuántas estrellas
//   No la vi      no se escribe nada — queda pendiente, NO reprobada
//
// "No la vi" tiene que existir: en seis días no se observan 55 pasos, y hoy un
// paso en blanco bloquea la graduación por algo que el coach nunca vio. Lo que
// no vio, el alumno igual lo encuentra en su curso con la clase, la explicación
// y cómo practicarlo — puede seguir estudiando solo.
//
// No hace falta guardar nada nuevo: el veredicto se escribe en las notas de los
// pasos, que es de donde el alumno ya lee todo.
//   La tiene  → 4★ SOLO donde no hay nota. Nunca baja una que ya existe: si en
//               un camp anterior sacó 5★, se queda en 5★. No es un invento —
//               por el canon, decir "la tiene" ES afirmar que cada parte llega
//               a la barra, y 4★ es el mínimo consistente con eso.
//   Le falta  → las que marca con sus estrellas; el resto de la secuencia, 4★
//               donde estuviera vacío.
//   No la vi  → deshace SOLO lo que se escribió en esta pasada. Una nota
//               anterior no se toca: para borrarla está la × del paso, que es
//               deliberada y de a una. setOfficialStepRating hace upsert con
//               null y NO hay historial: una nota borrada no vuelve.
//
// Es la MISMA evaluación en las dos puertas: al cerrar un camp y en la ficha
// del alumno en cualquier momento. Cerrar un camp es solo uno de los momentos.

import { useRef, useState } from 'react';
import { StarRating } from '@/components/sequence/StarRating';
import {
  groupBySequence,
  sequenceVerdict,
  SEQUENCE_PASS_STARS,
  type SequenceGroupable,
  sequenceLabel,
} from '@/lib/constants/learning-blocks';

export interface EvalRow extends SequenceGroupable {
  step_id: string;
  step_title: string | null;
}

export function SequenceEvaluation({
  rows,
  ratings,
  onRate,
  compact = false,
}: {
  rows: EvalRow[];
  /** step_id → estrellas oficiales (null = sin evaluar). */
  ratings: Record<string, number | null>;
  /** Guarda una o varias notas de una sola vez. */
  onRate: (changes: { stepId: string; stars: number | null }[]) => void;
  compact?: boolean;
}) {
  const { groups, orphans } = groupBySequence(rows);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const starsOf = (id: string) => ratings[id] ?? null;

  // Qué notas escribió ESTA pantalla. "No la vi" solo puede deshacer esto:
  // nunca la nota que otro coach dejó en otro camp.
  //
  // En la ficha del alumno cada cambio se guarda al instante, y
  // setOfficialStepRating hace UPSERT con coach_rating: null — o sea PISA la
  // fila. No hay historial de student_step_ratings en ninguna migración, así
  // que una nota borrada no se recupera. Y como STP-035 y STP-018 están en
  // las SEIS secuencias de Blue, un "No la vi" sobre una arrastraba los
  // prerequisitos de las otras cinco.
  const written = useRef<Set<string>>(new Set());
  const emit = (changes: { stepId: string; stars: number | null }[]) => {
    if (changes.length === 0) return; // nunca escribir de gusto
    for (const c of changes) written.current.add(c.stepId);
    onRate(changes);
  };

  const markOwned = (rs: EvalRow[]) =>
    emit(
      rs
        .filter((r) => starsOf(r.step_id) === null)
        .map((r) => ({ stepId: r.step_id, stars: SEQUENCE_PASS_STARS }))
    );

  /** Deshace lo de esta pasada. Lo anterior no se toca — para borrar una nota
   *  vieja está la × del paso, que es deliberada y de a una. */
  const markUnseen = (rs: EvalRow[]) =>
    emit(
      rs
        .filter((r) => starsOf(r.step_id) !== null && written.current.has(r.step_id))
        .map((r) => ({ stepId: r.step_id, stars: null }))
    );

  return (
    <div className="space-y-2.5">
      {groups.map((g) => {
        const stars = g.rows.map((r) => starsOf(r.step_id));
        const v = sequenceVerdict(stars);
        const isOpen = open[g.id] ?? v.state === 'working';
        const label = sequenceLabel(g.id, g.order, g.name);
        return (
          <div key={g.id} className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-3 py-2.5 bg-gray-50">
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className="text-[13px] font-semibold text-gray-900">{label}</p>
                <span className="ml-auto text-[10px] font-mono shrink-0">
                  {v.state === 'owned' ? (
                    <span className="text-emerald-600 font-bold">✓ la tiene</span>
                  ) : v.state === 'unrated' ? (
                    <span className="text-gray-400">sin evaluar</span>
                  ) : (
                    <span className="text-amber-700">
                      {v.min}★
                      {v.blockerIndex >= 0 &&
                        ` · empezar por ${g.rows[v.blockerIndex].step_title ?? ''}`}
                    </span>
                  )}
                </span>
              </div>
              <div className="flex gap-1.5 mt-2">
                <button
                  type="button"
                  onClick={() => { markOwned(g.rows); setOpen((o) => ({ ...o, [g.id]: false })); }}
                  className={`flex-1 h-8 rounded-lg text-[11px] font-semibold border ${
                    v.state === 'owned'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  ✓ La tiene
                </button>
                <button
                  type="button"
                  onClick={() => setOpen((o) => ({ ...o, [g.id]: true }))}
                  className={`flex-1 h-8 rounded-lg text-[11px] font-semibold border ${
                    v.state === 'working'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  Le falta
                </button>
                <button
                  type="button"
                  onClick={() => { markUnseen(g.rows); setOpen((o) => ({ ...o, [g.id]: false })); }}
                  className={`flex-1 h-8 rounded-lg text-[11px] font-semibold border ${
                    v.state === 'unrated'
                      ? 'bg-gray-700 text-white border-gray-700'
                      : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  No la vi
                </button>
              </div>
            </div>

            {isOpen && (
              <div className="divide-y divide-gray-100">
                {g.rows.map((r, i) => {
                  const val = starsOf(r.step_id);
                  const blocks = i === v.blockerIndex;
                  return (
                    <div
                      key={`${g.id}:${r.step_id}`}
                      className="px-3 py-2 flex items-center justify-between gap-3"
                      style={blocks ? { background: '#FFFBF0', boxShadow: 'inset 3px 0 0 #E0A62B' } : undefined}
                    >
                      <div className="min-w-0 flex-1">
                        {!compact && (
                          <p className="text-[9.5px] font-mono text-gray-400">{r.step_id}</p>
                        )}
                        <p className="text-[12.5px] text-gray-800 truncate">
                          {r.step_title || r.step_id}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                      <StarRating
                        value={val}
                        size="sm"
                        variant="official"
                        onChange={(n) => {
                          const rest = g.rows
                            .filter(
                              (x) => x.step_id !== r.step_id && starsOf(x.step_id) === null
                            )
                            .map((x) => ({ stepId: x.step_id, stars: SEQUENCE_PASS_STARS }));
                          emit([{ stepId: r.step_id, stars: n }, ...rest]);
                        }}
                      />
                      {val !== null && (
                        <button
                          type="button"
                          onClick={() => emit([{ stepId: r.step_id, stars: null }])}
                          className="text-[11px] text-gray-400 hover:text-red-600"
                          title="Borrar esta nota"
                        >
                          ×
                        </button>
                      )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {orphans.length > 0 && (
        <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {orphans.map((r) => (
            <div key={r.step_id} className="px-3 py-2 flex items-center justify-between gap-3">
              <p className="text-[12.5px] text-gray-800 truncate flex-1 min-w-0">
                {r.step_title || r.step_id}
              </p>
              <div className="flex items-center gap-1.5 shrink-0">
                <StarRating
                  value={starsOf(r.step_id)}
                  size="sm"
                  variant="official"
                  onChange={(n) => emit([{ stepId: r.step_id, stars: n }])}
                />
                {starsOf(r.step_id) !== null && (
                  <button
                    type="button"
                    onClick={() => emit([{ stepId: r.step_id, stars: null }])}
                    className="text-[11px] text-gray-400 hover:text-red-600"
                    title="Borrar esta nota"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
