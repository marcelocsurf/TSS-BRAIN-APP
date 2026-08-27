'use client';

// M45 — FinalCampEvaluation
//
// Triggered when the coach closes the LAST day of a multi-day camp. The
// coach is asked to rate every STP of each student officially before the
// camp_instance flips to 'completed'. These cyan stars become the
// student's official The Surf Sequence evaluation for that step in their portal.

import { useEffect, useState, useTransition } from 'react';
import { BRAND } from '@/lib/constants/brand';
import { StarRating } from '@/components/sequence/StarRating';
import { closeCampFinal, getCampWeekMissionsByToken } from '@/lib/actions/service-planner';
import type { ServicePlanData, ServicePlanStudent } from '@/lib/actions/service-planner';
import { BELT_DISPLAY, BELT_RANK, type BeltLevel } from '@/lib/constants/belts';
import { GRADUATION_RULES, type GraduationRule } from '@/lib/constants/graduation';
import { OCEAN_LEVELS, OCEAN_LEVEL_INFO } from '@/lib/constants/ocean-levels';
import { SequenceEvaluation } from '@/components/evaluation/SequenceEvaluation';
import { groupBySequence, sequenceVerdict } from '@/lib/constants/learning-blocks';

interface Props {
  token: string;
  campInstanceId: string;
  campName: string;
  students: ServicePlanStudent[];
  stpCatalog: ServicePlanData['stpCatalog'];
  // Coach ratings already given across the camp days (student → step →
  // rating). Pre-loaded so the final evaluation reflects daily progress
  // and the coach only adjusts what changed.
  initialRatings?: RatingsMap;
  // Belt this camp graduates students into (e.g. 'yellow_belt'). When an
  // approved student is below it, the coach is offered a promotion.
  targetBelt?: string | null;
  // False when the coach's certification is below the target belt. The
  // evaluation still saves; promotions become pending recommendations that a
  // head coach / admin confirms. Defaults to true (full authority).
  canAccreditTarget?: boolean;
  onCancel: () => void;
  onCompleted: () => void;
}

type RatingsMap = Record<string, Record<string, number>>; // student → step → rating

// A student is approved when EVERY part of the sequence has >= 4 stars.
const PASS_THRESHOLD = 4;

export function FinalCampEvaluation({
  token,
  campInstanceId,
  campName,
  students,
  stpCatalog,
  initialRatings,
  targetBelt,
  canAccreditTarget = true,
  onCancel,
  onCompleted,
  savedIds,
  onStudentSaved,
  earlyMode = false,
}: Props & { savedIds?: string[]; onStudentSaved?: (id: string) => void;
  /** Short camp: evaluar UN alumno a mitad de camp — sin el botón que cierra el camp entero. */
  earlyMode?: boolean }) {
  // Recorrido del camp por alumno (qué misión/STP/drill trabajó cada día) —
  // sin esto el coach evaluaba a ciegas: solo veía el día seleccionado.
  const [weekMissions, setWeekMissions] = useState<Record<string, Array<{ day: number; items: string[] }>> | null>(null);
  useEffect(() => {
    getCampWeekMissionsByToken(token, campInstanceId)
      .then((r) => { if (r.ok) setWeekMissions(r.byStudent ?? {}); })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campInstanceId]);

  // M153 — per-student persistence: each save writes immediately, so closing
  // the app never loses finished students again.
  const [savedSet, setSavedSet] = useState<Set<string>>(() => new Set(savedIds ?? []));
  const [savingId, setSavingId] = useState<string | null>(null);
  // Seed from the ratings already given during the camp days so they show
  // up here (deep-copied so edits don't mutate the parent's map).
  const [ratings, setRatings] = useState<RatingsMap>(() => {
    const seed: RatingsMap = {};
    for (const sid of Object.keys(initialRatings ?? {})) {
      seed[sid] = { ...(initialRatings![sid] ?? {}) };
    }
    return seed;
  });
  // Per-student written notes: one the student sees in their portal, one
  // private (coach + bitácora/profile only).
  const [notes, setNotes] = useState<Record<string, { visible: string; private: string }>>({});
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [openStudent, setOpenStudent] = useState<string | null>(students[0]?.student_id ?? null);

  const setRating = (studentId: string, stepId: string, rating: number) => {
    setRatings((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] ?? {}), [stepId]: rating },
    }));
  };

  // In-water level the coach assesses (per student). Seeded from the
  // student's current ocean level. Written to the bitácora on finalize.
  const [oceanLevel, setOceanLevel] = useState<Record<string, string>>(() => {
    const seed: Record<string, string> = {};
    for (const s of students) {
      const lvl = (s.profile as any)?.ocean_level;
      if (lvl) seed[s.student_id] = lvl;
    }
    return seed;
  });

  // Canon-principle checkboxes (per student → principle index → met).
  const [principles, setPrinciples] = useState<Record<string, Record<number, boolean>>>({});
  const togglePrinciple = (studentId: string, idx: number, val: boolean) => {
    setPrinciples((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] ?? {}), [idx]: val },
    }));
  };

  // Level-based graduation rule (the "complete evaluation"). Falls back to
  // "all sequence parts at >= 4 stars" when the camp has no specific belt.
  const rule: GraduationRule =
    (targetBelt && GRADUATION_RULES[targetBelt]) || {
      beltLabel: (targetBelt && BELT_DISPLAY[targetBelt as BeltLevel]?.en) || 'Next level',
      sections: [],
      stpThreshold: PASS_THRESHOLD,
      minStps: stpCatalog.length,
      requireAllStps: true,
      principles: [],
      minPrinciples: 0,
    };

  const setNote = (studentId: string, field: 'visible' | 'private', value: string) => {
    setNotes((prev) => ({
      ...prev,
      [studentId]: {
        visible: prev[studentId]?.visible ?? '',
        private: prev[studentId]?.private ?? '',
        [field]: value,
      },
    }));
  };

  const studentRatedCount = (studentId: string): number =>
    stpCatalog.filter((stp) => (ratings[studentId]?.[stp.id] ?? 0) > 0).length;

  // STPs demonstrated = rated at or above the rule's threshold.
  const studentStpsOk = (studentId: string): number =>
    stpCatalog.filter((stp) => (ratings[studentId]?.[stp.id] ?? 0) >= rule.stpThreshold).length;

  const studentPrinciplesMet = (studentId: string): number =>
    rule.principles.length
      ? rule.principles.filter((_, i) => principles[studentId]?.[i]).length
      : 0;

  // Ready for the next level. Canon rule: when requireAllStps is set, EVERY part
  // of the sequence must be at >= stpThreshold (4★ en cada parte) — not a subset.
  const studentApproved = (studentId: string): boolean => {
    const stpsOk = rule.requireAllStps
      ? studentStpsOk(studentId) >= stpCatalog.length
      : studentStpsOk(studentId) >= rule.minStps;
    return stpsOk && studentPrinciplesMet(studentId) >= rule.minPrinciples;
  };

  // El catálogo agrupado en secuencias: es la unidad con la que el coach
  // decide, así que el veredicto también se cuenta en secuencias.
  const catalogRows = (stpCatalog as any[]).map((stp) => ({
    step_id: stp.id,
    step_title: stp.title,
    course_section: stp.course_section,
    step_number: stp.step_number,
    sequence_id: stp.wb_sequence_id ?? null,
    sequence_name: stp.wb_sequence_name ?? null,
    sequence_order: stp.wb_sequence_order ?? null,
    sequence_step_order: stp.sequence_step_order ?? null,
  }));
  const seqGroups = groupBySequence(catalogRows).groups;

  // Veredicto en el idioma del coach: "9/13 secuencias · 2 sin evaluar".
  // La regla NO cambia — sigue siendo 4★ en cada parte — pero contarlo en
  // pasos cuando él decide por secuencia era hablarle en otro idioma. Y las
  // "sin evaluar" se dicen aparte: no las vio, no es que las reprobó.
  const readinessSummary = (studentId: string): string => {
    const r = ratings[studentId] ?? {};
    let owned = 0;
    let unseen = 0;
    for (const g of seqGroups) {
      const v = sequenceVerdict(g.rows.map((x) => r[x.step_id] ?? null));
      if (v.state === 'owned') owned++;
      else if (v.state === 'unrated') unseen++;
    }
    const base = `${owned}/${seqGroups.length} secuencias`;
    const pend = unseen ? ` · ${unseen} sin evaluar` : '';
    if (!rule.principles.length) return base + pend;
    return `${base}${pend} · ${studentPrinciplesMet(studentId)}/${rule.principles.length} principles`;
  };

  const totalRated = students.reduce((sum, s) => sum + studentRatedCount(s.student_id), 0);
  const totalNeeded = students.length * stpCatalog.length;
  const approvedCount = students.filter((s) => studentApproved(s.student_id)).length;

  // Belt promotion: offered for approved students whose current belt is
  // below the camp's target belt. Coach confirms (default on).
  const targetBeltValid = !!targetBelt && targetBelt in BELT_RANK;
  const targetBeltLabel = targetBeltValid ? BELT_DISPLAY[targetBelt as BeltLevel]?.en : null;
  const canPromote = (s: ServicePlanStudent): boolean => {
    if (!targetBeltValid || !studentApproved(s.student_id)) return false;
    const cur = s.belt_level ? BELT_RANK[s.belt_level as BeltLevel] ?? 0 : 0;
    return BELT_RANK[targetBelt as BeltLevel] > cur;
  };
  const [promote, setPromote] = useState<Record<string, boolean>>({});
  const willPromote = (s: ServicePlanStudent) => canPromote(s) && (promote[s.student_id] ?? true);

  // 🎯 FOCUS PARA SU PRÓXIMA ETAPA (obligatorio — pedido de Marcelo 2026-08-09):
  // el cierre final debe dejar claro QUÉ debe seguir trabajando cada alumno.
  // La app sugiere los STPs que quedaron débiles (<4★) como punto de partida.
  const [nextFocus, setNextFocus] = useState<Record<string, string>>({});
  const weakStps = (studentId: string): string[] =>
    stpCatalog
      .filter((stp) => {
        const r = ratings[studentId]?.[stp.id] ?? 0;
        return r > 0 && r < rule.stpThreshold;
      })
      .slice(0, 3)
      .map((stp) => stp.title || stp.id);
  const suggestFocus = (studentId: string) => {
    const weak = weakStps(studentId);
    if (weak.length === 0) return;
    setNextFocus((prev) => ({ ...prev, [studentId]: `Keep working on: ${weak.join(', ')}` }));
  };

  const buildStudentPayload = (s: ServicePlanStudent) => {
    const ratingsPayload: Array<{ student_id: string; step_id: string; rating: number }> = [];
    for (const stepId of Object.keys(ratings[s.student_id] ?? {})) {
      ratingsPayload.push({ student_id: s.student_id, step_id: stepId, rating: ratings[s.student_id][stepId] });
    }
    const result = {
      student_id: s.student_id,
      approved: studentApproved(s.student_id),
      readiness_summary: readinessSummary(s.student_id),
      ocean_level: oceanLevel[s.student_id] || '',
      student_visible_note: notes[s.student_id]?.visible?.trim() ?? '',
      coach_private_note: notes[s.student_id]?.private?.trim() ?? '',
      next_focus: nextFocus[s.student_id]?.trim() ?? '',
    };
    const promos = willPromote(s) ? [{ student_id: s.student_id, belt_level: targetBelt as string }] : [];
    return { ratingsPayload, result, promos };
  };

  const saveOneStudent = (s: ServicePlanStudent) => {
    // Short camp: guardar acá CIERRA al alumno (Finished + encuestas hoy) —
    // irreversible desde el portal; confirmación explícita.
    if (earlyMode && !confirm(`${s.display_name.split(' ')[0]} queda FINISHED: sale de los próximos días del camp y sus encuestas le llegan hoy. ¿Confirmás el cierre?`)) {
      return;
    }
    // Focus para su próxima etapa: OBLIGATORIO por alumno.
    if ((nextFocus[s.student_id]?.trim().length ?? 0) < 5) {
      alert(`Write the "Next focus" for ${s.display_name.split(' ')[0]} — what should they keep working on after this camp? (Tip: tap "Use suggestion" to start from the weak STPs.)`);
      return;
    }
    const { ratingsPayload, result, promos } = buildStudentPayload(s);
    setSavingId(s.student_id);
    startTransition(async () => {
      try {
        const res = await closeCampFinal(token, campInstanceId, ratingsPayload, [result], promos, { finalize: false });
        if (!res?.ok) { alert(res?.error || 'No se pudo guardar este alumno.'); return; }
        setSavedSet((prev) => new Set(prev).add(s.student_id));
        onStudentSaved?.(s.student_id);
        // saltar al siguiente sin guardar
        const next = students.find((x) => x.student_id !== s.student_id && !savedSet.has(x.student_id));
        setOpenStudent(next?.student_id ?? null);
      } catch (e: any) {
        alert(e.message || 'No se pudo guardar este alumno.');
      } finally {
        setSavingId(null);
      }
    });
  };

  const submit = () => {
    // Focus para su próxima etapa: OBLIGATORIO para cerrar el camp.
    const missingFocus = students.filter((s) => (nextFocus[s.student_id]?.trim().length ?? 0) < 5);
    if (missingFocus.length > 0) {
      alert(
        `Write the "Next focus" for: ${missingFocus.map((s) => s.display_name.split(' ')[0]).join(', ')}.\n\nWhat should each of them keep working on after this camp? It shows in their portal and guides their next coach.`
      );
      setConfirming(false);
      return;
    }
    const payload: Array<{ student_id: string; step_id: string; rating: number }> = [];
    for (const studentId of Object.keys(ratings)) {
      for (const stepId of Object.keys(ratings[studentId])) {
        payload.push({
          student_id: studentId,
          step_id: stepId,
          rating: ratings[studentId][stepId],
        });
      }
    }

    // One result row per student (the camp "acta"): approved + notes.
    const resultsPayload = students.map((s) => ({
      student_id: s.student_id,
      approved: studentApproved(s.student_id),
      readiness_summary: readinessSummary(s.student_id),
      ocean_level: oceanLevel[s.student_id] || '',
      student_visible_note: notes[s.student_id]?.visible?.trim() ?? '',
      coach_private_note: notes[s.student_id]?.private?.trim() ?? '',
      next_focus: nextFocus[s.student_id]?.trim() ?? '',
    }));

    const promotionsPayload = students
      .filter((s) => willPromote(s))
      .map((s) => ({ student_id: s.student_id, belt_level: targetBelt as string }));

    startTransition(async () => {
      try {
        const res = await closeCampFinal(token, campInstanceId, payload, resultsPayload, promotionsPayload);
        if (!res?.ok) { alert(res?.error || 'Failed to finalize camp.'); return; }
        onCompleted();
      } catch (e: any) {
        alert(e.message || 'Failed to finalize camp.');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[120] bg-[var(--tss-navy)]/80 backdrop-blur-sm">
      {/* iPad (md:): lienzo ancho para calificar la secuencia con menos scroll. */}
      <div className="max-w-lg md:max-w-4xl mx-auto h-[100dvh] bg-[var(--tss-gray-50,#F6F7F9)] flex flex-col">
        <div
          className="text-white px-4 py-5 shrink-0"
          style={{ background: BRAND.colors.navy }}
        >
          <p className="text-[10px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)]">
            Final official evaluation
          </p>
          <h2 className="text-base font-bold mt-0.5">{campName}</h2>
          <p className="text-[11px] text-white/70 mt-1">
            Rate every step of the sequence for every student. These cyan
            stars become the official The Surf Sequence record in their portal.
          </p>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-[11px] text-[var(--tss-cyan,#5AC3E7)] font-semibold">
              {seqGroups.length} secuencias · {stpCatalog.length} pasos
            </p>
            <p className="text-[11px] text-white/80 font-semibold">
              {approvedCount} / {students.length} approved
            </p>
          </div>
          <p className="text-[10px] text-white/50 mt-1">
            {rule.beltLabel} ready = las {seqGroups.length} secuencias logradas
            {` (${rule.stpThreshold}★ en cada parte)`}
            {rule.principles.length > 0 && ` + ≥${rule.minPrinciples}/${rule.principles.length} principles`}.
            {' '}Lo que no viste queda pendiente, no reprobado — el alumno lo encuentra en su curso.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {students.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
              {(savedIds?.length ?? 0) > 0 ? (
                <>
                  {/* Todos cerrados por short camp: sus actas ya existen — el
                      camp igual necesita su cierre formal (status completed +
                      encuestas idempotentes). Sin este botón quedaba trabado
                      en in_progress para siempre (hallazgo de la revisión). */}
                  <p className="text-sm font-semibold text-[var(--tss-navy)]">All students already evaluated ✓</p>
                  <p className="text-[13px] text-gray-500 mt-1">
                    Everyone was closed out early (short camp) with their official evaluation saved. Finalize the camp to wrap it up.
                  </p>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => startTransition(async () => {
                      try {
                        const res = await closeCampFinal(token, campInstanceId, [], [], [], { finalize: true });
                        if (!res?.ok) { alert(res?.error || 'Could not finalize the camp.'); return; }
                        onCompleted();
                      } catch (e: any) {
                        alert(e?.message || 'Could not finalize the camp.');
                      }
                    })}
                    className="mt-4 px-5 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                    style={{ background: 'var(--tss-cyan, #5AC3E7)' }}
                  >
                    {pending ? 'Finalizing…' : '🏁 Finalize camp'}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold text-[var(--tss-navy)]">No students enrolled</p>
                  <p className="text-[13px] text-gray-500 mt-1">
                    This service has no students to evaluate. Enroll students first, or close this window.
                  </p>
                </>
              )}
              <button
                type="button"
                onClick={onCancel}
                className="mt-3 px-5 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 text-gray-700"
              >
                Close
              </button>
            </div>
          )}
          {students.map((s) => {
            const isOpen = openStudent === s.student_id;
            const rated = studentRatedCount(s.student_id);
            return (
              <div
                key={s.student_id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenStudent(isOpen ? null : s.student_id)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {s.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.photo_url}
                        alt={s.display_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[var(--tss-navy)] text-white text-[10px] font-bold flex items-center justify-center">
                        {s.display_name
                          .split(' ')
                          .map((p) => p[0])
                          .filter(Boolean)
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--tss-navy)] truncate">
                        {s.display_name}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {readinessSummary(s.student_id)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {savedSet.has(s.student_id) && (
                      <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">Guardado ✓</span>
                    )}
                    {studentApproved(s.student_id) ? (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                        Ready
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                        In progress
                      </span>
                    )}
                    <span className={`text-gray-400 text-xs transition ${isOpen ? 'rotate-180' : ''}`}>
                      ▾
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div className="p-3 border-t border-gray-100 space-y-2.5">
                    {/* Lo que trabajó en el camp — contexto para evaluar. */}
                    {weekMissions && (weekMissions[s.student_id]?.length ?? 0) > 0 && (
                      <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
                        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-500 mb-1">
                          📋 What they worked on this camp
                        </p>
                        <div className="space-y-0.5">
                          {weekMissions[s.student_id].map((d) => (
                            <p key={d.day} className="text-[11px] text-gray-700 leading-snug">
                              <b className="text-gray-500">D{d.day}</b> · {d.items.join(' · ')}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => saveOneStudent(s)}
                      disabled={pending || savingId === s.student_id}
                      className="w-full py-2.5 text-[12px] font-bold rounded-xl text-white disabled:opacity-50"
                      style={{ background: savedSet.has(s.student_id) ? '#047857' : 'var(--tss-navy)' }}
                    >
                      {savingId === s.student_id
                        ? 'Guardando…'
                        : savedSet.has(s.student_id)
                          ? '✓ Guardado — guardar cambios de nuevo'
                          : earlyMode
                            ? `🏁 Cerrar a ${s.display_name.split(' ')[0]} HOY (evaluación + encuestas)`
                            : '💾 Guardar este alumno (no se pierde)'}
                    </button>
                    {/* La evaluación es por SECUENCIA, no por 55 pasos
                        sueltos. Ver src/components/evaluation/SequenceEvaluation.
                        Es la misma pantalla que en la ficha del alumno: cerrar
                        un camp es solo uno de los momentos en que se corre. */}
                    <SequenceEvaluation
                      rows={catalogRows}
                      ratings={ratings[s.student_id] ?? {}}
                      onRate={(changes) =>
                        setRatings((prev) => {
                          const mine = { ...(prev[s.student_id] ?? {}) };
                          for (const c of changes) {
                            if (c.stars === null) delete mine[c.stepId];
                            else mine[c.stepId] = c.stars;
                          }
                          return { ...prev, [s.student_id]: mine };
                        })
                      }
                    />

                    {/* Canon principles — part of the level graduation check */}
                    {rule.principles.length > 0 && (
                      <div className="pt-3 mt-1 border-t border-gray-100">
                        <p className="text-[11px] font-mono uppercase tracking-wider text-gray-500 mb-1.5">
                          Canon principles · {studentPrinciplesMet(s.student_id)}/{rule.principles.length}
                          {' '}(need {rule.minPrinciples})
                        </p>
                        <div className="space-y-1.5">
                          {rule.principles.map((p, i) => (
                            <label key={i} className="flex items-start gap-2 text-[12px] text-gray-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={principles[s.student_id]?.[i] ?? false}
                                onChange={(e) => togglePrinciple(s.student_id, i, e.target.checked)}
                                className="mt-0.5 accent-[var(--tss-cyan,#5AC3E7)]"
                              />
                              <span>{p}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* In-water level — coach assessment for the bitácora */}
                    <div className="pt-3 mt-1 border-t border-gray-100">
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-500 mb-1">
                        In-water level (self-sufficiency)
                      </label>
                      <select
                        value={oceanLevel[s.student_id] ?? ''}
                        onChange={(e) =>
                          setOceanLevel((prev) => ({ ...prev, [s.student_id]: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[var(--tss-cyan,#5AC3E7)]"
                      >
                        <option value="">— Select —</option>
                        {OCEAN_LEVELS.map((lvl) => (
                          <option key={lvl} value={lvl}>
                            {OCEAN_LEVEL_INFO[lvl].short} · {OCEAN_LEVEL_INFO[lvl].name}
                          </option>
                        ))}
                      </select>
                      {oceanLevel[s.student_id] && (
                        <p className="text-[10px] text-gray-400 mt-1">
                          {OCEAN_LEVEL_INFO[oceanLevel[s.student_id] as keyof typeof OCEAN_LEVEL_INFO]?.cleared}
                        </p>
                      )}
                    </div>

                    {/* 🎯 Next focus — REQUIRED. Qué debe seguir trabajando
                        después del camp. Alimenta el portal del alumno, la
                        ficha del host y el plan del próximo coach. */}
                    <div className="pt-3 mt-1 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-cyan-700">
                          🎯 Next focus for {s.display_name.split(' ')[0]} · required
                        </label>
                        {weakStps(s.student_id).length > 0 && (
                          <button
                            type="button"
                            onClick={() => suggestFocus(s.student_id)}
                            className="text-[10px] font-semibold text-cyan-700 underline decoration-dotted"
                          >
                            Use suggestion ({weakStps(s.student_id).length} weak STPs)
                          </button>
                        )}
                      </div>
                      <textarea
                        value={nextFocus[s.student_id] ?? ''}
                        onChange={(e) => setNextFocus((prev) => ({ ...prev, [s.student_id]: e.target.value }))}
                        rows={2}
                        className="w-full px-3 py-2 border border-cyan-200 bg-cyan-50/40 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--tss-cyan,#5AC3E7)]"
                        placeholder="What should they keep working on after this camp? e.g. Bottom turn timing + reading the wave down the line"
                      />
                    </div>

                    {/* Written notes — one the student sees, one private */}
                    <div className="pt-3 mt-1 border-t border-gray-100 space-y-3">
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--tss-cyan,#5AC3E7)] mb-1">
                          Note for {s.display_name.split(' ')[0]} (they will see this)
                        </label>
                        <textarea
                          value={notes[s.student_id]?.visible ?? ''}
                          onChange={(e) => setNote(s.student_id, 'visible', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--tss-cyan,#5AC3E7)]"
                          placeholder="What they achieved, what to keep working on — shows in the student's portal."
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-500 mb-1">
                          🔒 Private coach note (bitácora / profile only)
                        </label>
                        <textarea
                          value={notes[s.student_id]?.private ?? ''}
                          onChange={(e) => setNote(s.student_id, 'private', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--tss-navy)] bg-gray-50"
                          placeholder="Only the coach and those with profile/bitácora access see this. The student never sees it."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {students.length > 0 && (
          <div className="shrink-0 bg-white border-t border-gray-200 p-3 flex gap-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onCancel}
              disabled={pending}
              className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 text-gray-700"
            >
              Later
            </button>
            {!earlyMode && (
              <button
                type="button"
                onClick={() => setConfirming(true)}
                disabled={pending || totalRated === 0}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                style={{ background: 'var(--tss-cyan, #5AC3E7)' }}
              >
                {pending ? 'Saving…' : 'Finalize camp'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Confirmation summary — review who graduates before committing */}
      {confirming && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-3">
          <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden flex flex-col max-h-[85dvh]">
            <div className="px-4 py-4 shrink-0 border-b border-gray-100">
              <h3 className="text-base font-bold text-[var(--tss-navy)]">Finalize {campName}?</h3>
              <p className="text-[12px] text-gray-500 mt-0.5">
                {approvedCount} of {students.length} ready for {rule.beltLabel}.
              </p>
              {!canAccreditTarget && targetBeltValid && (
                <p className="mt-2 text-[12px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">
                  Your certification is below <strong>{targetBeltLabel}</strong>. Your evaluation still saves — any promotion is sent as a <strong>recommendation</strong> for a head coach or admin to confirm. The belt won&apos;t change until then.
                </p>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {students.map((s) => {
                const ok = studentApproved(s.student_id);
                const promotable = canPromote(s);
                return (
                  <div key={s.student_id} className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-gray-800 truncate">{s.display_name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${ok ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                        {ok ? `Ready · ${rule.beltLabel}` : 'In progress'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 pl-1">{readinessSummary(s.student_id)}</p>
                    {promotable && (
                      <label className="flex items-center gap-2 pl-1 text-[12px] text-[var(--tss-navy)] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={promote[s.student_id] ?? true}
                          onChange={(e) =>
                            setPromote((prev) => ({ ...prev, [s.student_id]: e.target.checked }))
                          }
                          className="accent-[var(--tss-cyan,#5AC3E7)]"
                        />
                        Promote to {targetBeltLabel}
                      </label>
                    )}
                  </div>
                );
              })}
              <p className="text-[11px] text-gray-400 pt-2">
                Students below the threshold are recorded as “in progress”, not graduated. You can still finalize the camp.
              </p>
            </div>
            <div className="shrink-0 border-t border-gray-200 p-3 flex gap-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={pending}
                className="px-4 py-2.5 text-sm font-semibold rounded-xl border border-gray-300 text-gray-700"
              >
                Back
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={pending}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white disabled:opacity-50"
                style={{ background: BRAND.colors.navy }}
              >
                {pending ? 'Saving…' : `Confirm · finalize camp`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
