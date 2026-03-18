'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { listStudents, type StudentRow } from '@/lib/actions/students';
import {
  closeStandaloneSession, getCurrentCoach, getOceanRules,
  getPilarPartsForBelt, getDrillsFiltered,
  type SessionDraftInput, type SessionEvalInput,
} from '@/lib/actions/sessions';
import { checkOceanRule, type OceanRule } from '@/lib/validations/ocean-rules';
import { canCoachStudent } from '@/lib/validations/coach-permissions';
import { validateMandatoryFields } from '@/lib/validations/session-close';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';
import {
  OCEAN_CONDITIONS, SESSION_STATUS_OPTIONS, TRAINING_VENUES,
  WARMUP_OPTIONS, SIMULATION_OPTIONS, MENTAL_HACK_OPTIONS,
  MISSION_TIME_OPTIONS, DURATION_OPTIONS, FRUSTRATION_DESCRIPTORS,
  COACH_FEEDBACK_QUICK, HOMEWORK_CUES, INCIDENT_TYPES, SESSION_TYPES,
  type OceanCondition, type SessionStatus,
} from '@/lib/constants/brand';

// ═══════════════════════════════════════
// 3 MOMENTS
// ═══════════════════════════════════════

const MOMENTS = [
  { id: 'context', label: 'Context', color: 'bg-blue-400' },
  { id: 'planning', label: 'Planning', color: 'bg-[var(--tss-gold)]' },
  { id: 'close', label: 'Close', color: 'bg-green-500' },
];

export default function SessionCascadePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedStudent = searchParams.get('student');

  const [moment, setMoment] = useState(0); // 0=Context, 1=Planning, 2=Close
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Data from DB
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [oceanRules, setOceanRules] = useState<OceanRule[]>([]);
  const [coach, setCoach] = useState<any>(null);
  const [pilarParts, setPilarParts] = useState<{ id: string; pilar: string; part_name: string }[]>([]);
  const [drills, setDrills] = useState<any[]>([]);
  const [drillSearch, setDrillSearch] = useState('');

  // Form: Draft (Context + Planning)
  const [draft, setDraft] = useState<SessionDraftInput>({
    student_id: preselectedStudent || '',
    session_date: new Date().toISOString().slice(0, 10),
    training_venue: '',
    ocean_conditions: '3_4ft' as OceanCondition,
    risk_state: 'safe',
    is_safety_layer: false,
    pilar: null,
    pilar_part: '',
    drill_id: '',
    mission: '',
    execution_notes: '',
    duration_minutes: 60,
    session_type: 'Training',
    mental_hack: '',
    warm_up_notes: '',
    simulation: '',
    mission_time: '',
    repetitions: undefined,
  });

  // Form: Evaluation (Close)
  const [evaluation, setEvaluation] = useState<SessionEvalInput>({
    status: '' as SessionStatus,
    focus_rating: 0,
    frustration_rating: 0,
    coach_feedback: '',
    whats_next: '',
    homework: '',
    internal_notes: '',
    incident_type: '',
    incident_description: '',
    incident_action: '',
  });

  const [showIncident, setShowIncident] = useState(false);
  const [oceanCheck, setOceanCheck] = useState<{ state: string; note: string | null }>({ state: 'safe', note: null });

  // ═══════════════════════════════════════
  // LOAD DATA
  // ═══════════════════════════════════════

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

  // Ocean check
  useEffect(() => {
    if (!draft.student_id || !draft.ocean_conditions) return;
    const student = students.find(s => s.id === draft.student_id);
    if (!student) return;
    const result = checkOceanRule(oceanRules, student.belt_level as BeltLevel, draft.ocean_conditions);
    setOceanCheck(result);
    setDraft(d => ({ ...d, risk_state: result.state as any }));
  }, [draft.student_id, draft.ocean_conditions, students, oceanRules]);

  // Load pilar parts when student changes
  useEffect(() => {
    const student = students.find(s => s.id === draft.student_id);
    if (!student) return;
    getPilarPartsForBelt(student.belt_level).then(setPilarParts).catch(() => {});
  }, [draft.student_id, students]);

  // Load drills when pilar_part changes
  useEffect(() => {
    if (!draft.pilar_part || !draft.student_id) {
      setDrills([]);
      return;
    }
    const student = students.find(s => s.id === draft.student_id);
    if (!student) return;
    const venue = TRAINING_VENUES.find(v => v.value === draft.training_venue);
    getDrillsFiltered({
      beltLevel: student.belt_level,
      pilarPart: draft.pilar_part,
      isWaterVenue: venue?.isWater,
    }).then(setDrills).catch(() => {});
  }, [draft.pilar_part, draft.student_id, draft.training_venue, students]);

  const selectedStudent = students.find(s => s.id === draft.student_id);
  const selectedVenue = TRAINING_VENUES.find(v => v.value === draft.training_venue);
  const isWaterVenue = selectedVenue?.isWater ?? true;
  const selectedDrill = drills.find((d: any) => d.id === draft.drill_id);

  // Filtered drills by search
  const filteredDrills = drillSearch
    ? drills.filter((d: any) =>
        d.drill_name.toLowerCase().includes(drillSearch.toLowerCase()) ||
        d.key_cue?.toLowerCase().includes(drillSearch.toLowerCase())
      )
    : drills;

  const setD = (field: keyof SessionDraftInput, value: any) =>
    setDraft(d => ({ ...d, [field]: value }));
  const setE = (field: keyof SessionEvalInput, value: any) =>
    setEvaluation(e => ({ ...e, [field]: value }));

  // When pilar_part is selected, auto-set the pilar based on the part's pilar
  const handlePilarPartSelect = (partName: string) => {
    const part = pilarParts.find(p => p.part_name === partName);
    const pilarMap: Record<string, string> = {
      'Technical': 'technical',
      'Tactical': 'tactical',
      'Mental': 'mental',
      'Physical': 'physical',
    };
    setDraft(d => ({
      ...d,
      pilar_part: partName,
      pilar: pilarMap[part?.pilar || ''] as any || null,
      drill_id: '', // Reset drill when pilar_part changes
    }));
  };

  // ═══════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════

  const canAdvance = (): boolean => {
    switch (moment) {
      case 0: // Context
        if (!draft.student_id || !draft.training_venue) return false;
        if (isWaterVenue && oceanCheck.state === 'blocked') return false;
        if (selectedStudent && coach) {
          const perm = canCoachStudent(coach.max_belt_permission, selectedStudent.belt_level as BeltLevel);
          if (!perm.allowed) return false;
        }
        return true;
      case 1: // Planning
        return !!draft.pilar_part && draft.mission.trim().length >= 5;
      case 2: // Close
        return validateMandatoryFields(evaluation).valid;
      default: return false;
    }
  };

  // ═══════════════════════════════════════
  // SUBMIT
  // ═══════════════════════════════════════

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

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════

  return (
    <div className="max-w-lg mx-auto">
      {/* Moment indicator */}
      <div className="flex items-center gap-1 mb-6">
        {MOMENTS.map((m, i) => (
          <div key={m.id} className="flex-1 flex flex-col items-center">
            <div className={`w-full h-1.5 rounded-full mb-1 ${
              i < moment ? 'bg-green-400' : i === moment ? m.color : 'bg-gray-200'
            }`} />
            <span className={`text-[10px] ${i === moment ? 'text-[var(--tss-navy)] font-semibold' : 'text-gray-400'}`}>
              {m.label}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4 min-h-[300px]">

        {/* ═══════════════════════════════════════ */}
        {/* MOMENT 1: CONTEXT */}
        {/* ═══════════════════════════════════════ */}
        {moment === 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[var(--tss-navy)] text-sm">Moment 1 — Context</h3>

            {/* Step 1: Student */}
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

            {/* Student info card */}
            {selectedStudent && (
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
                <p className="font-medium">{selectedStudent.first_name} {selectedStudent.last_name} — {BELT_DISPLAY[selectedStudent.belt_level]?.en}</p>
                <p>Seq {selectedStudent.current_sequence_number} / Step {selectedStudent.current_step_order}</p>
                {selectedStudent.allergies && <p className="text-red-600">Allergies: {selectedStudent.allergies}</p>}
                {selectedStudent.injuries && <p className="text-red-600">Injuries: {selectedStudent.injuries}</p>}
                {selectedStudent.last_homework && <p>Last HW: {selectedStudent.last_homework}</p>}
                {selectedStudent.next_recommended_focus && <p>Next focus: {selectedStudent.next_recommended_focus}</p>}
              </div>
            )}

            {/* Step 2: Venue */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Training Venue *</label>
              <div className="grid grid-cols-3 gap-1">
                {TRAINING_VENUES.map(v => (
                  <button key={v.value} type="button" onClick={() => setD('training_venue', v.value)}
                    className={`py-2 text-xs rounded-lg border transition-all ${
                      draft.training_venue === v.value
                        ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Ocean Conditions (only for water venues) */}
            {isWaterVenue && (
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
            )}

            {/* Safety override rule */}
            {isWaterVenue && oceanCheck.state === 'blocked' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm font-medium text-amber-700">Safety Override — Dry land only</p>
                <p className="text-xs text-amber-600 mt-1">Conditions exceed student level. Select a non-water venue to continue.</p>
              </div>
            )}
            {isWaterVenue && oceanCheck.state === 'alert' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm font-medium text-amber-700">ALERT — Proceed with caution</p>
                <p className="text-xs text-amber-600 mt-1">{oceanCheck.note}</p>
              </div>
            )}

            {/* Step 4: Session Type + Step 5: Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Session Type</label>
                <select value={draft.session_type} onChange={e => setD('session_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  {SESSION_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
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

        {/* ═══════════════════════════════════════ */}
        {/* MOMENT 2: PLANNING (The Cascade) */}
        {/* ═══════════════════════════════════════ */}
        {moment === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[var(--tss-navy)] text-sm">Moment 2 — Planning</h3>

            {/* Step 6: Pilar Part (filtered by belt) */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                What to work on * <span className="text-gray-400">(filtered by {selectedStudent ? BELT_DISPLAY[selectedStudent.belt_level]?.en : 'belt'})</span>
              </label>
              {pilarParts.length > 0 ? (
                <select value={draft.pilar_part} onChange={e => handlePilarPartSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option value="">Select pilar part...</option>
                  {/* Group by pilar */}
                  {['Technical', 'Tactical'].map(pilar => {
                    const parts = pilarParts.filter(p => p.pilar === pilar);
                    if (parts.length === 0) return null;
                    return (
                      <optgroup key={pilar} label={pilar}>
                        {parts.map(p => (
                          <option key={p.id} value={p.part_name}>{p.part_name}</option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              ) : (
                <p className="text-xs text-gray-400 py-2">Select a student first to load available parts.</p>
              )}
              {draft.pilar_part && (
                <p className="text-[10px] text-gray-400 mt-1">
                  Pilar: {pilarParts.find(p => p.part_name === draft.pilar_part)?.pilar} — auto-assigned
                </p>
              )}
            </div>

            {/* Step 7: Mission */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mission * <span className="text-gray-400">(min 5 chars)</span></label>
              <textarea value={draft.mission} onChange={e => setD('mission', e.target.value)}
                rows={2} placeholder="What is the single objective of this session?"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
            </div>

            {/* Step 8: Drill (filtered by pilar_part + belt + venue) */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Drill {draft.pilar_part ? `(${filteredDrills.length} available)` : ''}
              </label>
              {draft.pilar_part ? (
                <>
                  <input type="text" placeholder="Search drills..." value={drillSearch}
                    onChange={e => setDrillSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-1" />
                  <div className="border border-gray-200 rounded-lg max-h-36 overflow-y-auto">
                    {filteredDrills.length > 0 ? filteredDrills.map((d: any) => (
                      <button key={d.id} type="button"
                        onClick={() => { setD('drill_id', d.id); setDrillSearch(''); }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-50 ${
                          draft.drill_id === d.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}>
                        <span className="font-medium">{d.drill_name}</span>
                        {d.key_cue && <span className="text-gray-400 ml-2">{d.key_cue}</span>}
                        <span className="text-gray-300 ml-2">{d.drill_type}</span>
                      </button>
                    )) : (
                      <p className="text-xs text-gray-400 p-3">No drills found for this combination.</p>
                    )}
                  </div>
                  {selectedDrill && (
                    <div className="mt-1 bg-blue-50 rounded-lg p-2 text-xs text-blue-800">
                      Selected: <span className="font-medium">{selectedDrill.drill_name}</span>
                      {selectedDrill.goal && <p className="text-blue-600 mt-0.5">{selectedDrill.goal}</p>}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-400 py-2">Select a pilar part first.</p>
              )}
            </div>

            {/* Step 9: Warm-up */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Warm-up</label>
              <div className="grid grid-cols-2 gap-1">
                {WARMUP_OPTIONS.map(w => (
                  <button key={w.value} type="button" onClick={() => setD('warm_up_notes', w.value)}
                    className={`py-2 px-2 text-xs rounded-lg border transition-all text-left ${
                      draft.warm_up_notes === w.value
                        ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}>
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 10: Simulation */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Simulation</label>
              <div className="grid grid-cols-2 gap-1">
                {SIMULATION_OPTIONS.map(s => (
                  <button key={s.value} type="button" onClick={() => setD('simulation', s.value)}
                    className={`py-2 px-2 text-xs rounded-lg border transition-all text-left ${
                      draft.simulation === s.value
                        ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 11: Mental Hack */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mental Hack</label>
              <div className="grid grid-cols-2 gap-1">
                {MENTAL_HACK_OPTIONS.map(m => (
                  <button key={m.value} type="button" onClick={() => setD('mental_hack', m.value)}
                    className={`py-2 px-2 text-xs rounded-lg border transition-all text-left ${
                      draft.mental_hack === m.value
                        ? 'border-[var(--tss-gold)] bg-[var(--tss-gold)] text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 12: Mission Time + Step 13: Repetitions */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mission Time</label>
                <select value={draft.mission_time} onChange={e => setD('mission_time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option value="">Select...</option>
                  {MISSION_TIME_OPTIONS.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Repetitions</label>
                <input type="number" value={draft.repetitions || ''} onChange={e => setD('repetitions', parseInt(e.target.value) || undefined)}
                  min={1} max={50} placeholder="#"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* MOMENT 3: CLOSE */}
        {/* ═══════════════════════════════════════ */}
        {moment === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[var(--tss-navy)] text-sm">Moment 3 — Close</h3>

            {/* Step 14: Status */}
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

            {/* Step 15: Focus Rating */}
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

            {/* Step 16: Frustration Rating with descriptors */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Frustration / Flow * <span className="text-gray-400">(1-10)</span></label>
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
              {evaluation.frustration_rating > 0 && FRUSTRATION_DESCRIPTORS[evaluation.frustration_rating] && (
                <p className="text-[10px] text-amber-600 mt-1">{FRUSTRATION_DESCRIPTORS[evaluation.frustration_rating]}</p>
              )}
            </div>

            {/* Step 17: Coach Feedback (quick + free text) */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Coach Feedback * <span className="text-gray-400">(min 10 chars)</span></label>
              <div className="flex gap-1 mb-1 flex-wrap">
                {COACH_FEEDBACK_QUICK.map(cue => (
                  <button key={cue} type="button"
                    onClick={() => setE('coach_feedback', evaluation.coach_feedback ? `${evaluation.coach_feedback}. ${cue}` : cue)}
                    className="px-2 py-1 text-[10px] rounded-full border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700">
                    + {cue}
                  </button>
                ))}
              </div>
              <textarea value={evaluation.coach_feedback} onChange={e => setE('coach_feedback', e.target.value)}
                rows={3} placeholder="What went well? What needs work?"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
            </div>

            {/* Step 18: Achieved — merged into feedback */}

            {/* Step 19: What's Next (dropdown of pilar parts) */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">What's Next * <span className="text-gray-400">(min 5 chars)</span></label>
              {pilarParts.length > 0 && (
                <div className="flex gap-1 mb-1 flex-wrap">
                  {pilarParts.slice(0, 8).map(p => (
                    <button key={p.id} type="button"
                      onClick={() => setE('whats_next', evaluation.whats_next ? `${evaluation.whats_next}, ${p.part_name}` : p.part_name)}
                      className="px-2 py-1 text-[10px] rounded-full border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700">
                      + {p.part_name}
                    </button>
                  ))}
                </div>
              )}
              <textarea value={evaluation.whats_next} onChange={e => setE('whats_next', e.target.value)}
                rows={2} placeholder="Recommended next focus for this student"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
            </div>

            {/* Step 20: Homework (cues + free text) */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Homework * <span className="text-gray-400">(min 5 chars)</span></label>
              <div className="flex gap-1 mb-1 flex-wrap">
                {HOMEWORK_CUES.map(cue => (
                  <button key={cue} type="button"
                    onClick={() => setE('homework', evaluation.homework ? `${evaluation.homework}, ${cue}` : cue)}
                    className="px-2 py-1 text-[10px] rounded-full border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700">
                    + {cue}
                  </button>
                ))}
              </div>
              <textarea value={evaluation.homework} onChange={e => setE('homework', e.target.value)}
                rows={2} placeholder="Task for the student before next session"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
            </div>

            {/* Step 21: Total Duration */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Total Duration *</label>
              <div className="flex gap-1">
                {DURATION_OPTIONS.map(d => (
                  <button key={d.value} type="button" onClick={() => setD('duration_minutes', d.value)}
                    className={`flex-1 py-2 text-xs rounded-lg border transition-all ${
                      draft.duration_minutes === d.value
                        ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Internal Notes */}
            <div className="border-t border-gray-100 pt-3">
              <label className="block text-xs font-medium text-red-500 mb-1">Internal Notes <span className="text-gray-400">(coaches only — never sent to student)</span></label>
              <textarea value={evaluation.internal_notes || ''} onChange={e => setE('internal_notes', e.target.value)}
                rows={2} placeholder="Private observations, behavior notes..."
                className="w-full px-3 py-2 border border-red-100 bg-red-50 rounded-lg text-sm resize-none text-gray-700" />
            </div>

            {/* Step 22: Incident Report (optional toggle) */}
            <div className="border-t border-gray-100 pt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showIncident}
                  onChange={e => setShowIncident(e.target.checked)}
                  className="rounded" />
                <span className="text-xs text-gray-600">Report incident</span>
              </label>
              {showIncident && (
                <div className="mt-2 space-y-2 bg-red-50 rounded-lg p-3">
                  <select value={evaluation.incident_type || ''} onChange={e => setE('incident_type', e.target.value)}
                    className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm bg-white">
                    <option value="">Incident type...</option>
                    {INCIDENT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                  <textarea value={evaluation.incident_description || ''} onChange={e => setE('incident_description', e.target.value)}
                    rows={2} placeholder="What happened?"
                    className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm resize-none bg-white" />
                  <textarea value={evaluation.incident_action || ''} onChange={e => setE('incident_action', e.target.value)}
                    rows={2} placeholder="Action taken"
                    className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm resize-none bg-white" />
                </div>
              )}
            </div>

            {/* Validation summary */}
            {!validateMandatoryFields(evaluation).valid && evaluation.status && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-600 font-medium">Missing:</p>
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
        {moment > 0 && (
          <button onClick={() => setMoment(m => m - 1)}
            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
            Back
          </button>
        )}
        {moment < 2 ? (
          <button onClick={() => setMoment(m => m + 1)} disabled={!canAdvance()}
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
