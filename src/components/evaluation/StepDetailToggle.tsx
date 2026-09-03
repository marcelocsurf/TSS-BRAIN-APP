'use client';

// "Ver detalles" al lado de la estrella del paso. Cerrado por defecto: la
// estrella general alcanza. Si el coach abre, ve los criterios de la misión
// del paso — los mismos que el alumno marca solo — y toca Met / Partial /
// Not met SOLO en los que quiera. Lo flojo se vuelve el next focus del alumno.
// Al lado de cada criterio, lo que el propio alumno marcó la última vez.

import { useState } from 'react';
import { Check, CircleDot, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getStepCriterionContext, saveCoachCriterionEvals } from '@/lib/actions/coach-criterion-evals';
import type { CriterionResultValue } from '@/lib/utils/criteria';

type Ctx = Extract<Awaited<ReturnType<typeof getStepCriterionContext>>, { ok: true }>;

const OPTS: { key: CriterionResultValue; label: string; Icon: typeof Check; bg: string; fg: string }[] = [
  { key: 'met', label: 'Met', Icon: Check, bg: '#06D6A0', fg: '#061C2B' },
  { key: 'partial', label: 'Partial', Icon: CircleDot, bg: '#FFD166', fg: '#5b4300' },
  { key: 'not_met', label: 'Not met', Icon: X, bg: '#FF6B6B', fg: '#fff' },
];
const LABEL: Record<CriterionResultValue, string> = { met: 'met', partial: 'partial', not_met: 'not met' };

export function StepDetailToggle({
  studentId,
  stepId,
  portalToken,
  campInstanceId,
  onFocusSaved,
}: {
  studentId: string;
  stepId: string;
  portalToken?: string | null;
  campInstanceId?: string | null;
  /** El foco que quedó guardado en el alumno, para que la pantalla que cierra
   *  con "qué trabajar después" lo precargue en vez de pisarlo. */
  onFocusSaved?: (focus: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [marks, setMarks] = useState<Record<number, CriterionResultValue>>({});
  const [saving, setSaving] = useState(false);
  const [savedFocus, setSavedFocus] = useState<string | null | undefined>(undefined);

  const toggle = async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (ctx) return;
    setLoading(true);
    setError('');
    const res = await getStepCriterionContext({ studentId, stepId, portalToken }).catch(() => null);
    setLoading(false);
    if (!res || !res.ok) { setError(res && !res.ok ? res.error : 'Could not load the criteria.'); return; }
    setCtx(res);
  };

  const save = async () => {
    if (!ctx) return;
    const list = Object.entries(marks).map(([i, r]) => ({ criterion_index: Number(i), result: r }));
    if (list.length === 0) return;
    setSaving(true);
    setError('');
    const res = await saveCoachCriterionEvals({ studentId, stepId, pieceId: ctx.pieceId, marks: list, portalToken, campInstanceId }).catch(() => null);
    setSaving(false);
    if (!res || !res.ok) { setError(res && !res.ok ? res.error : 'Could not save.'); return; }
    setSavedFocus(res.nextFocus);
    onFocusSaved?.(res.nextFocus);
    // Lo guardado pasa a ser "lo último del coach".
    setCtx({ ...ctx, coachMarks: { ...ctx.coachMarks, ...Object.fromEntries(list.map((m) => [m.criterion_index, { result: m.result, at: new Date().toISOString() }])) } });
    setMarks({});
  };

  const dirty = Object.keys(marks).length > 0;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex items-center gap-1 text-[10.5px] text-gray-500 hover:text-gray-800"
      >
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {open ? 'Ocultar detalles' : 'Ver detalles'}
      </button>

      {open && (
        <div className="mt-2 rounded-lg border border-gray-200 bg-white p-2.5 space-y-2">
          {loading && <p className="text-[11px] text-gray-400">Cargando criterios…</p>}
          {error && <p className="text-[11px] text-red-600">{error}</p>}
          {ctx && ctx.criteria.length === 0 && (
            <p className="text-[11px] text-gray-400">Este paso no tiene criterios cargados.</p>
          )}
          {ctx && ctx.criteria.length > 0 && (
            <>
              <p className="text-[10px] text-gray-400">
                {ctx.pieceTitle ? `Criterios de: ${ctx.pieceTitle}` : 'Criterios del paso'} · marcá solo los que quieras
              </p>
              {ctx.criteria.map((text, i) => {
                const mine = marks[i] ?? ctx.coachMarks[i]?.result ?? null;
                const student = ctx.studentMarks[i]?.result ?? null;
                return (
                  <div key={i} className="rounded-md border border-gray-100 p-2">
                    <p className="text-[12px] text-gray-800 leading-snug"><span className="font-bold mr-1">{i + 1}.</span>{text}</p>
                    <div className="mt-1.5 grid grid-cols-3 gap-1">
                      {OPTS.map((o) => {
                        const sel = mine === o.key;
                        return (
                          <button
                            key={o.key}
                            type="button"
                            onClick={() => setMarks((m) => ({ ...m, [i]: o.key }))}
                            className="inline-flex items-center justify-center gap-1 py-1.5 rounded text-[10.5px] font-bold"
                            style={sel ? { background: o.bg, color: o.fg } : { background: '#f3f4f6', color: '#6b7280' }}
                          >
                            <o.Icon size={11} strokeWidth={2.25} />{o.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-1 text-[10px] text-gray-400">
                      {student ? `El alumno se marcó: ${LABEL[student]}` : 'El alumno todavía no se marcó este criterio.'}
                      {ctx.coachMarks[i] && !marks[i] ? ` · tu última marca: ${LABEL[ctx.coachMarks[i].result]}` : ''}
                    </p>
                  </div>
                );
              })}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={save}
                  disabled={!dirty || saving}
                  className="px-3 py-1.5 rounded-md text-[11px] font-semibold bg-[var(--tss-navy,#061C2B)] text-white disabled:opacity-40"
                >
                  {saving ? 'Guardando…' : 'Guardar detalle'}
                </button>
                {savedFocus !== undefined && (
                  <span className="text-[10.5px] text-emerald-700">
                    {savedFocus ? `Guardado · foco del alumno: “${savedFocus}”` : 'Guardado · todo logrado, sin foco nuevo'}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
