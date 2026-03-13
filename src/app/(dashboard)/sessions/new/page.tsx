'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { listStudents, type StudentRow } from '@/lib/actions/students';
import { closeStandaloneSession, getCurrentCoach, getOceanRules, searchDrills, type SessionDraftInput, type SessionEvalInput } from '@/lib/actions/sessions';
import { checkOceanRule, type OceanRule } from '@/lib/validations/ocean-rules';
import { canCoachStudent } from '@/lib/validations/coach-permissions';
import { validateMandatoryFields } from '@/lib/validations/session-close';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';
import { OCEAN_CONDITIONS, PILARS, PILAR_LABELS, SESSION_STATUS_OPTIONS, type OceanCondition, type Pilar, type SessionStatus } from '@/lib/constants/brand';

const STEPS = ['Context', 'Plan', 'Execute', 'Evaluate', 'Close', 'Confirm'];

export default function CoachFlowPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedStudent = searchParams.get('student');

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Data
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [oceanRules, setOceanRules] = useState<OceanRule[]>([]);
  const [coach, setCoach] = useState<any>(null);
  const [drillResults, setDrillResults] = useState<any[]>([]);

  // Form state: Draft
  const [draft, setDraft] = useState<SessionDraftInput>({
    student_id: preselectedStudent || '',
    session_date: new Date().toISOString().slice(0, 10),
    training_venue: '',
    ocean_conditions: '3_4ft' as OceanCondition,
    risk_state: 'safe',
    is_safety_layer: false,
    pilar: 'technical' as Pilar,
    pilar_part: '',
    drill_id: '',
    mission: '',
    execution_notes: '',
    duration_minutes: 60,
    session_type: 'Training',
    mental_hack: '',
    warm_up_notes: '',
  });

  // Form state: Evaluation
  const [evaluation, setEvaluation] = useState<SessionEvalInput>({
    status: '' as SessionStatus,
    focus_rating: 0,
    frustration_rating: 0,
    coach_feedback: '',
    whats_next: '',
    homework: '',
  });

  // Ocean rule check result
  const [oceanCheck, setOceanCheck] = useState<{ state: string; note: string | null }>({ state: 'safe', note: null });

  // Load initial data
  useEffect(() => {
    Promise.all([
      listStudents({ status: 'active' }),
      getOceanRules(),
      getCurrentCoach(),
    ]).then(([s, r, c]) => {
      setStudents(s);
      setOceanRules(r as OceanRule[]);
      setCoach(c);
    });
  }, []);

  // Ocean check when student or conditions change
  useEffect(() => {
    if (!draft.student_id || !draft.ocean_conditions) return;
    const student = students.find(s => s.id === draft.student_id);
    if (!student) return;
    const result = checkOceanRule(oceanRules, student.belt_level as BeltLevel, draft.ocean_conditions);
    setOceanCheck(result);
    setDraft(d => ({ ...d, risk_state: result.state as any }));
  }, [draft.student_id, draft.ocean_conditions, students, oceanRules]);

  const selectedStudent = students.find(s => s.id === draft.student_id);

  const setD = (field: keyof SessionDraftInput, value: any) =>
    setDraft(d => ({ ...d, [field]: value }));
  const setE = (field: keyof SessionEvalInput, value: any) =>
    setEvaluation(e => ({ ...e, [field]: value }));

  // Validation per step
  const canAdvance = (): boolean => {
    switch (step) {
      case 0: // Context
        if (!draft.student_id) return false;
        if (!draft.training_venue) return false;
        if (oceanCheck.state === 'blocked') return false;
        if (oceanCheck.state === 'alert' && coach?.role !== 'holistic_coach' && coach?.role !== 'head_coach') return false;
        // Coach permission check
        if (selectedStudent && coach) {
          const perm = canCoachStudent(coach.max_belt_permission, selectedStudent.belt_level as BeltLevel);
          if (!perm.allowed) return false;
        }
        return true;
      case 1: // Plan
        return draft.mission.trim().length >= 5;
      case 2: // Execute
        return (draft.duration_minutes || 0) > 0;
      case 3: // Evaluate
        return !!evaluation.status && evaluation.focus_rating >= 1 && evaluation.frustration_rating >= 1;
      case 4: // Close
        return evaluation.coach_feedback.trim().length >= 10 &&
               evaluation.whats_next.trim().length >= 5 &&
               evaluation.homework.trim().length >= 5;
      case 5: // Confirm
        return validateMandatoryFields(evaluation).valid;
      default: return false;
    }
  };

  const handleClose = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await closeStandaloneSession(draft, evaluation);
      setSuccess(true);
      setTimeout(() => router.push(`/students/${result.studentId}`), 1500);
    } catch (err: any) {
      setError(err.message || 'Session close failed');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">✓</span>
        </div>
        <h2 className="text-xl font-bold text-[var(--tss-navy)]">Session Closed</h2>
        <p className="text-sm text-gray-500 mt-2">Student profile updated. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center">
            <div className={`w-full h-1 rounded-full mb-1 ${
              i < step ? 'bg-green-400' : i === step ? 'bg-[var(--tss-gold)]' : 'bg-gray-200'
            }`} />
            <span className={`text-[10px] ${i === step ? 'text-[var(--tss-navy)] font-semibold' : 'text-gray-400'}`}>
              {s}
            </span>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 min-h-[300px]">

        {/* STEP 0: Context */}
        {step === 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[var(--tss-navy)]">1. Context</h3>

            {/* Student picker */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Student *</label>
              <select value={draft.student_id} onChange={e => setD('student_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Select student...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name} — {BELT_DISPLAY[s.belt_level]?.levelName}
                  </option>
                ))}
              </select>
              {selectedStudent && coach && !canCoachStudent(coach.max_belt_permission, selectedStudent.belt_level as BeltLevel).allowed && (
                <p className="text-xs text-red-600 mt-1">You are not authorized for this student's belt level.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Venue *</label>
              <select value={draft.training_venue} onChange={e => setD('training_venue', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">Select...</option>
                <option value="Beachbreak">Beachbreak</option>
                <option value="Pointbreak">Pointbreak</option>
                <option value="Reefbreak">Reefbreak</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ocean Conditions *</label>
              <div className="grid grid-cols-5 gap-1">
                {OCEAN_CONDITIONS.map(oc => (
                  <button key={oc.value} type="button" onClick={() => setD('ocean_conditions', oc.value)}
                    className={`py-2 text-xs rounded-lg border transition-all ${
                      draft.ocean_conditions === oc.value
                        ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}>
                    {oc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ocean rule alert */}
            {oceanCheck.state === 'blocked' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm font-medium text-red-700">BLOCKED — Cannot proceed</p>
                <p className="text-xs text-red-600 mt-1">{oceanCheck.note}</p>
              </div>
            )}
            {oceanCheck.state === 'alert' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm font-medium text-amber-700">ALERT — Override required</p>
                <p className="text-xs text-amber-600 mt-1">{oceanCheck.note}</p>
              </div>
            )}

            {/* Safety toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={draft.is_safety_layer}
                onChange={e => setD('is_safety_layer', e.target.checked)}
                className="rounded" />
              <span className="text-sm text-gray-700">Safety-focused session</span>
            </label>

            {/* Pilar (hidden if safety) */}
            {!draft.is_safety_layer && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Pilar *</label>
                <div className="grid grid-cols-4 gap-1">
                  {PILARS.map(pil => (
                    <button key={pil} type="button" onClick={() => setD('pilar', pil)}
                      className={`py-2 text-xs rounded-lg border transition-all ${
                        draft.pilar === pil
                          ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}>
                      {PILAR_LABELS[pil].split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select value={draft.session_type} onChange={e => setD('session_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option value="Training">Training</option>
                  <option value="Competition">Competition</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                <input type="date" value={draft.session_date}
                  onChange={e => setD('session_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Plan */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[var(--tss-navy)]">2. Plan</h3>
            {selectedStudent && (
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
                <p className="font-medium">{selectedStudent.first_name} — {BELT_DISPLAY[selectedStudent.belt_level]?.levelName}</p>
                {selectedStudent.last_homework && (
                  <p className="mt-1"><span className="font-medium">Last homework:</span> {selectedStudent.last_homework}</p>
                )}
                {selectedStudent.next_recommended_focus && (
                  <p><span className="font-medium">Recommended focus:</span> {selectedStudent.next_recommended_focus}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mission * <span className="text-gray-400">(min 5 chars)</span></label>
              <textarea value={draft.mission} onChange={e => setD('mission', e.target.value)}
                rows={3} placeholder="What is the single objective of this session?"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Drill (optional)</label>
              <input type="text" placeholder="Search drills..."
                onChange={async (e) => {
                  if (e.target.value.length >= 2) {
                    const results = await searchDrills(e.target.value, draft.is_safety_layer ? undefined : draft.pilar || undefined);
                    setDrillResults(results);
                  } else setDrillResults([]);
                }}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              {drillResults.length > 0 && (
                <div className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                  {drillResults.map((d: any) => (
                    <button key={d.id} type="button"
                      onClick={() => { setD('drill_id', d.id); setDrillResults([]); }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-50 ${
                        draft.drill_id === d.id ? 'bg-blue-50' : ''
                      }`}>
                      <span className="font-medium">{d.drill_name}</span>
                      <span className="text-gray-400 ml-2">{d.key_cue}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Warm-up Notes</label>
              <input type="text" value={draft.warm_up_notes || ''} onChange={e => setD('warm_up_notes', e.target.value)}
                placeholder="e.g. Head to toe + Flow motion"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mental Hack</label>
              <input type="text" value={draft.mental_hack || ''} onChange={e => setD('mental_hack', e.target.value)}
                placeholder="e.g. Process over outcome"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>
          </div>
        )}

        {/* STEP 2: Execute */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[var(--tss-navy)]">3. Execute</h3>
            <p className="text-sm text-gray-500">Run the session. When done, record notes and duration.</p>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Duration (minutes) *</label>
              <input type="number" value={draft.duration_minutes || ''} onChange={e => setD('duration_minutes', parseInt(e.target.value) || 0)}
                min={1} max={180} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Execution Notes</label>
              <textarea value={draft.execution_notes || ''} onChange={e => setD('execution_notes', e.target.value)}
                rows={4} placeholder="What happened during the session? Key observations..."
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
            </div>
          </div>
        )}

        {/* STEP 3: Evaluate */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[var(--tss-navy)]">4. Evaluate</h3>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Status *</label>
              <div className="grid grid-cols-4 gap-1">
                {SESSION_STATUS_OPTIONS.map(opt => (
                  <button key={opt.value} type="button" onClick={() => setE('status', opt.value)}
                    className={`py-2.5 text-xs rounded-lg border transition-all ${
                      evaluation.status === opt.value
                        ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Focus Rating * <span className="text-gray-400">(1-5)</span></label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setE('focus_rating', n)}
                    className={`w-10 h-10 rounded-full border text-sm font-medium transition-all ${
                      evaluation.focus_rating === n
                        ? 'border-[var(--tss-gold)] bg-[var(--tss-gold)] text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}>
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">1 = not focused — 5 = fully focused</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Frustration Rating * <span className="text-gray-400">(1-10)</span></label>
              <div className="flex gap-1 flex-wrap">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} type="button" onClick={() => setE('frustration_rating', n)}
                    className={`w-8 h-8 rounded-lg border text-xs font-medium transition-all ${
                      evaluation.frustration_rating === n
                        ? 'border-red-400 bg-red-400 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}>
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">1 = no frustration — 10 = extremely frustrated</p>
            </div>
          </div>
        )}

        {/* STEP 4: Close */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[var(--tss-navy)]">5. Close</h3>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Coach Feedback * <span className="text-gray-400">(min 10 chars)</span></label>
              <textarea value={evaluation.coach_feedback} onChange={e => setE('coach_feedback', e.target.value)}
                rows={3} placeholder="What went well? What needs work?"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">What's Next * <span className="text-gray-400">(min 5 chars)</span></label>
              <textarea value={evaluation.whats_next} onChange={e => setE('whats_next', e.target.value)}
                rows={2} placeholder="Recommended next focus for this student"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Homework * <span className="text-gray-400">(min 5 chars)</span></label>
              <textarea value={evaluation.homework} onChange={e => setE('homework', e.target.value)}
                rows={2} placeholder="Task for the student before next session"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
            </div>
          </div>
        )}

        {/* STEP 5: Confirm */}
        {step === 5 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-[var(--tss-navy)]">6. Confirm & Close</h3>
            <p className="text-sm text-gray-500">Review all fields before closing. This action is permanent.</p>

            <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1.5">
              <SummaryRow label="Student" value={selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : ''} />
              <SummaryRow label="Venue" value={draft.training_venue} />
              <SummaryRow label="Ocean" value={OCEAN_CONDITIONS.find(o => o.value === draft.ocean_conditions)?.label || ''} />
              <SummaryRow label="Mission" value={draft.mission} />
              <SummaryRow label="Duration" value={`${draft.duration_minutes} min`} />
              <div className="border-t border-gray-200 my-2" />
              <SummaryRow label="Status" value={evaluation.status} />
              <SummaryRow label="Focus" value={`${evaluation.focus_rating}/5`} />
              <SummaryRow label="Frustration" value={`${evaluation.frustration_rating}/10`} />
              <SummaryRow label="Feedback" value={evaluation.coach_feedback.slice(0, 80) + (evaluation.coach_feedback.length > 80 ? '...' : '')} />
              <SummaryRow label="What's Next" value={evaluation.whats_next} />
              <SummaryRow label="Homework" value={evaluation.homework} />
            </div>

            {!validateMandatoryFields(evaluation).valid && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-600 font-medium">Missing required fields:</p>
                <ul className="text-xs text-red-500 mt-1">
                  {validateMandatoryFields(evaluation).missing.map(m => (
                    <li key={m}>• {m}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            Back
          </button>
        )}
        {step < 5 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canAdvance()}
            className="flex-1 py-2.5 bg-[var(--tss-navy)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-30 transition-opacity">
            Next
          </button>
        ) : (
          <button onClick={handleClose} disabled={loading || !canAdvance()}
            className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-30 transition-opacity">
            {loading ? 'Closing...' : 'Close Session'}
          </button>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-800 font-medium text-right max-w-[65%]">{value}</span>
    </div>
  );
}
