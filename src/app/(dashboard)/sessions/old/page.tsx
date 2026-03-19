'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { listStudents, type StudentRow } from '@/lib/actions/students';
import {
  closeStandaloneSession, getCurrentCoach, getOceanRules,
  getPilarPartsForBelt, getDrillsFiltered,
  type SessionDraftInput, type SessionEvalInput, type MissionInput,
} from '@/lib/actions/sessions';
import { checkOceanRule, type OceanRule } from '@/lib/validations/ocean-rules';
import { canCoachStudent } from '@/lib/validations/coach-permissions';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';
import {
  OCEAN_CONDITIONS, SESSION_STATUS_OPTIONS, TRAINING_VENUES,
  WARMUP_OPTIONS, SIMULATION_OPTIONS, MENTAL_HACK_OPTIONS,
  MISSION_TIME_OPTIONS, DURATION_OPTIONS, FRUSTRATION_DESCRIPTORS,
  COACH_FEEDBACK_QUICK, HOMEWORK_CUES, INCIDENT_TYPES, SESSION_TYPES,
  type OceanCondition, type SessionStatus,
} from '@/lib/constants/brand';

const MOMENTS = [
  { id: 'context', label: 'Context', color: 'bg-blue-400' },
  { id: 'planning', label: 'Planning', color: 'bg-[var(--tss-gold)]' },
  { id: 'close', label: 'Close', color: 'bg-green-500' },
];

function emptyMission(order: number): MissionInput {
  return {
    sort_order: order,
    pilar_part: '',
    pilar: null,
    drill_id: '',
    mission: '',
    warm_up: '',
    simulation: '',
    mental_hack: '',
    mission_time: '',
    repetitions: undefined,
    status: '',
    focus_rating: 0,
    coach_notes: '',
  };
}

export default function SessionCascadePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedStudent = searchParams.get('student');

  const [moment, setMoment] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Data
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [oceanRules, setOceanRules] = useState<OceanRule[]>([]);
  const [coach, setCoach] = useState<any>(null);
  const [pilarParts, setPilarParts] = useState<{ id: string; pilar: string; part_name: string }[]>([]);

  // Context (Moment 1)
  const [draft, setDraft] = useState<SessionDraftInput>({
    student_id: preselectedStudent || '',
    session_date: new Date().toISOString().slice(0, 10),
    session_time: '',
    training_venue: '',
    ocean_conditions: '3_4ft' as OceanCondition,
    risk_state: 'safe',
    is_safety_layer: false,
    session_type: 'Training',
    duration_minutes: 60,
    execution_notes: '',
  });

  // Missions (Moment 2)
  const [missions, setMissions] = useState<MissionInput[]>([emptyMission(1)]);
  const [activeMission, setActiveMission] = useState(0);

  // Close (Moment 3)
  const [evaluation, setEvaluation] = useState<SessionEvalInput>({
    coach_feedback: '',
    internal_notes: '',
    whats_next: '',
    homework: '',
    frustration_rating: 0,
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

  useEffect(() => {
    if (!draft.student_id || !draft.ocean_conditions) return;
    const student = students.find(s => s.id === draft.student_id);
    if (!student) return;
    const result = checkOceanRule(oceanRules, student.belt_level as BeltLevel, draft.ocean_conditions);
    setOceanCheck(result);
    setDraft(d => ({ ...d, risk_state: result.state as any }));
  }, [draft.student_id, draft.ocean_conditions, students, oceanRules]);

  useEffect(() => {
    const student = students.find(s => s.id === draft.student_id);
    if (!student) return;
    getPilarPartsForBelt(student.belt_level).then(setPilarParts).catch(() => {});
  }, [draft.student_id, students]);

  const selectedStudent = students.find(s => s.id === draft.student_id);
  const selectedVenue = TRAINING_VENUES.find(v => v.value === draft.training_venue);
  const isWaterVenue = selectedVenue?.isWater ?? true;

  const setD = (field: keyof SessionDraftInput, value: any) =>
    setDraft(d => ({ ...d, [field]: value }));
  const setE = (field: keyof SessionEvalInput, value: any) =>
    setEvaluation(e => ({ ...e, [field]: value }));

  // Mission helpers
  const updateMission = (index: number, field: keyof MissionInput, value: any) => {
    setMissions(prev => prev.map((m, i) => i === index ? { ...m, [field]: value } : m));
  };

  const addMission = () => {
    setMissions(prev => [...prev, emptyMission(prev.length + 1)]);
    setActiveMission(missions.length);
  };

  const removeMission = (index: number) => {
    if (missions.length <= 1) return;
    setMissions(prev => prev.filter((_, i) => i !== index).map((m, i) => ({ ...m, sort_order: i + 1 })));
    setActiveMission(Math.max(0, activeMission - 1));
  };

  const handlePilarPartSelect = (index: number, partName: string) => {
    const part = pilarParts.find(p => p.part_name === partName);
    const pilarMap: Record<string, string> = {
      'Technical': 'technical', 'Tactical': 'tactical',
      'Mental': 'mental', 'Physical': 'physical',
    };
    setMissions(prev => prev.map((m, i) =>
      i === index ? { ...m, pilar_part: partName, pilar: pilarMap[part?.pilar || ''] || null, drill_id: '' } : m
    ));
  };

  // ═══════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════

  const canAdvance = (): boolean => {
    switch (moment) {
      case 0:
        if (!draft.student_id || !draft.training_venue) return false;
        if (isWaterVenue && oceanCheck.state === 'blocked') return false;
        if (selectedStudent && coach) {
          const perm = canCoachStudent(coach.max_belt_permission, selectedStudent.belt_level as BeltLevel);
          if (!perm.allowed) return false;
        }
        return true;
      case 1:
        return missions.every(m => m.pilar_part && m.mission.trim().length >= 5);
      case 2:
        const allMissionsEvaluated = missions.every(m => m.status && m.focus_rating >= 1);
        const feedbackOk = evaluation.coach_feedback.trim().length >= 10;
        const nextOk = evaluation.whats_next.trim().length >= 5;
        const hwOk = evaluation.homework.trim().length >= 5;
        const frustOk = evaluation.frustration_rating >= 1;
        return allMissionsEvaluated && feedbackOk && nextOk && hwOk && frustOk;
      default: return false;
    }
  };

  const handleClose = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await closeStandaloneSession(draft, missions, evaluation);
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
        <p className="text-sm text-gray-500 mt-2">{missions.length} mission(s) saved. Redirecting...</p>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════

  const currentMission = missions[activeMission];

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

            {isWaterVenue && oceanCheck.state === 'blocked' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm font-medium text-amber-700">Safety Override — Dry land only</p>
                <p className="text-xs text-amber-600 mt-1">Conditions exceed student level. Select a non-water venue.</p>
              </div>
            )}
            {isWaterVenue && oceanCheck.state === 'alert' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm font-medium text-amber-700">ALERT — Proceed with caution</p>
                <p className="text-xs text-amber-600 mt-1">{oceanCheck.note}</p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
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
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Time</label>
                <input type="time" value={draft.session_time}
                  onChange={e => setD('session_time', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* MOMENT 2: PLANNING (Multi-mission) */}
        {/* ═══════════════════════════════════════ */}
        {moment === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[var(--tss-navy)] text-sm">Moment 2 — Planning</h3>

            {/* Mission tabs */}
            <div className="flex items-center gap-1">
              {missions.map((m, i) => (
                <button key={i} type="button" onClick={() => setActiveMission(i)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    activeMission === i
                      ? 'border-[var(--tss-gold)] bg-[var(--tss-gold)] text-white'
                      : m.pilar_part && m.mission
                        ? 'border-green-300 bg-green-50 text-green-700'
                        : 'border-gray-200 text-gray-500'
                  }`}>
                  M{i + 1}
                </button>
              ))}
              <button type="button" onClick={addMission}
                className="px-3 py-1.5 text-xs rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-gray-500 hover:text-gray-600">
                +
              </button>
              {missions.length > 1 && (
                <button type="button" onClick={() => removeMission(activeMission)}
                  className="px-2 py-1.5 text-xs text-red-400 hover:text-red-600 ml-auto">
                  Remove
                </button>
              )}
            </div>

            {currentMission && (
              <MissionForm
                key={activeMission}
                mission={currentMission}
                index={activeMission}
                pilarParts={pilarParts}
                studentBelt={selectedStudent?.belt_level || ''}
                isWaterVenue={isWaterVenue}
                trainingVenue={draft.training_venue}
                onUpdate={updateMission}
                onPilarPartSelect={handlePilarPartSelect}
                isFirst={activeMission === 0}
              />
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* MOMENT 3: CLOSE */}
        {/* ═══════════════════════════════════════ */}
        {moment === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[var(--tss-navy)] text-sm">Moment 3 — Close</h3>

            {/* Per-mission evaluation */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-600">Evaluate each mission:</p>
              {missions.map((m, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <p className="text-xs font-medium text-[var(--tss-navy)]">
                    Mission {i + 1}: {m.mission || '(no mission text)'}
                    {m.pilar_part && <span className="text-gray-400 ml-1">· {m.pilar_part}</span>}
                  </p>

                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">Status *</label>
                    <div className="grid grid-cols-4 gap-1">
                      {SESSION_STATUS_OPTIONS.map(opt => (
                        <button key={opt.value} type="button"
                          onClick={() => updateMission(i, 'status', opt.value)}
                          className={`py-1.5 text-[10px] rounded-lg border transition-all ${
                            m.status === opt.value
                              ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white'
                              : 'border-gray-200 text-gray-500 hover:border-gray-400'
                          }`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">Focus *</label>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} type="button"
                          onClick={() => updateMission(i, 'focus_rating', n)}
                          className={`w-7 h-7 rounded-full border text-[10px] font-medium transition-all ${
                            m.focus_rating === n
                              ? 'border-[var(--tss-gold)] bg-[var(--tss-gold)] text-white'
                              : 'border-gray-200 text-gray-500 hover:border-gray-400'
                          }`}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea value={m.coach_notes} onChange={e => updateMission(i, 'coach_notes', e.target.value)}
                    rows={1} placeholder="Quick note for this mission..."
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs resize-none" />
                </div>
              ))}
            </div>

            {/* Session-level evaluation */}
            <div className="border-t border-gray-200 pt-3 space-y-4">
              <p className="text-xs font-medium text-gray-600">Session overall:</p>

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

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Coach Feedback * <span className="text-gray-400">(min 10 chars)</span></label>
                <div className="flex gap-1 mb-1 flex-wrap">
                  {COACH_FEEDBACK_QUICK.map(cue => (
                    <button key={cue} type="button"
                      onClick={() => setE('coach_feedback', evaluation.coach_feedback ? `${evaluation.coach_feedback}. ${cue}` : cue)}
                      className="px-2 py-1 text-[10px] rounded-full border border-gray-200 text-gray-500 hover:border-gray-400">
                      + {cue}
                    </button>
                  ))}
                </div>
                <textarea value={evaluation.coach_feedback} onChange={e => setE('coach_feedback', e.target.value)}
                  rows={3} placeholder="What went well? What needs work?"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">What's Next *</label>
                {pilarParts.length > 0 && (
                  <div className="flex gap-1 mb-1 flex-wrap">
                    {pilarParts.slice(0, 6).map(p => (
                      <button key={p.id} type="button"
                        onClick={() => setE('whats_next', evaluation.whats_next ? `${evaluation.whats_next}, ${p.part_name}` : p.part_name)}
                        className="px-2 py-1 text-[10px] rounded-full border border-gray-200 text-gray-500 hover:border-gray-400">
                        + {p.part_name}
                      </button>
                    ))}
                  </div>
                )}
                <textarea value={evaluation.whats_next} onChange={e => setE('whats_next', e.target.value)}
                  rows={2} placeholder="Recommended next focus"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Homework *</label>
                <div className="flex gap-1 mb-1 flex-wrap">
                  {HOMEWORK_CUES.map(cue => (
                    <button key={cue} type="button"
                      onClick={() => setE('homework', evaluation.homework ? `${evaluation.homework}, ${cue}` : cue)}
                      className="px-2 py-1 text-[10px] rounded-full border border-gray-200 text-gray-500 hover:border-gray-400">
                      + {cue}
                    </button>
                  ))}
                </div>
                <textarea value={evaluation.homework} onChange={e => setE('homework', e.target.value)}
                  rows={2} placeholder="Task before next session"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
              </div>

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

              <div className="border-t border-gray-100 pt-3">
                <label className="block text-xs font-medium text-red-500 mb-1">Internal Notes <span className="text-gray-400">(never sent to student)</span></label>
                <textarea value={evaluation.internal_notes || ''} onChange={e => setE('internal_notes', e.target.value)}
                  rows={2} placeholder="Private observations..."
                  className="w-full px-3 py-2 border border-red-100 bg-red-50 rounded-lg text-sm resize-none text-gray-700" />
              </div>

              <div className="border-t border-gray-100 pt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={showIncident}
                    onChange={e => setShowIncident(e.target.checked)} className="rounded" />
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
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mb-4">{error}</p>}

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
            {loading ? 'Closing...' : `Close Session (${missions.length} mission${missions.length > 1 ? 's' : ''})`}
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// MISSION FORM COMPONENT
// ═══════════════════════════════════════

function MissionForm({
  mission, index, pilarParts, studentBelt, isWaterVenue, trainingVenue,
  onUpdate, onPilarPartSelect, isFirst,
}: {
  mission: MissionInput;
  index: number;
  pilarParts: { id: string; pilar: string; part_name: string }[];
  studentBelt: string;
  isWaterVenue: boolean;
  trainingVenue: string;
  onUpdate: (index: number, field: keyof MissionInput, value: any) => void;
  onPilarPartSelect: (index: number, partName: string) => void;
  isFirst: boolean;
}) {
  const [drills, setDrills] = useState<any[]>([]);
  const [drillSearch, setDrillSearch] = useState('');

  useEffect(() => {
    if (!mission.pilar_part || !studentBelt) { setDrills([]); return; }
    getDrillsFiltered({
      beltLevel: studentBelt,
      pilarPart: mission.pilar_part,
      isWaterVenue,
    }).then(setDrills).catch(() => {});
  }, [mission.pilar_part, studentBelt, isWaterVenue]);

  const filteredDrills = drillSearch
    ? drills.filter((d: any) =>
        d.drill_name.toLowerCase().includes(drillSearch.toLowerCase()) ||
        d.key_cue?.toLowerCase().includes(drillSearch.toLowerCase()))
    : drills;

  const selectedDrill = drills.find((d: any) => d.id === mission.drill_id);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">What to work on *</label>
        <select value={mission.pilar_part} onChange={e => onPilarPartSelect(index, e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="">Select...</option>
          {['Technical', 'Tactical', 'Mental', 'Physical'].map(pilar => {
            const parts = pilarParts.filter(p => p.pilar === pilar);
            if (!parts.length) return null;
            return (
              <optgroup key={pilar} label={pilar}>
                {parts.map(p => <option key={p.id} value={p.part_name}>{p.part_name}</option>)}
              </optgroup>
            );
          })}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Mission *</label>
        <textarea value={mission.mission} onChange={e => onUpdate(index, 'mission', e.target.value)}
          rows={2} placeholder="Session objective for this mission"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Drill {mission.pilar_part ? `(${filteredDrills.length})` : ''}
        </label>
        {mission.pilar_part ? (
          <>
            <input type="text" placeholder="Search..." value={drillSearch}
              onChange={e => setDrillSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-1" />
            <div className="border border-gray-200 rounded-lg max-h-32 overflow-y-auto">
              {filteredDrills.length > 0 ? filteredDrills.map((d: any) => (
                <button key={d.id} type="button"
                  onClick={() => { onUpdate(index, 'drill_id', d.id); setDrillSearch(''); }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 border-b border-gray-50 ${
                    mission.drill_id === d.id ? 'bg-blue-50' : ''
                  }`}>
                  <span className="font-medium">{d.drill_name}</span>
                  {d.key_cue && <span className="text-gray-400 ml-2">{d.key_cue}</span>}
                </button>
              )) : <p className="text-xs text-gray-400 p-3">No drills found.</p>}
            </div>
            {selectedDrill && (
              <p className="mt-1 text-[10px] text-blue-600">{selectedDrill.goal}</p>
            )}
          </>
        ) : <p className="text-xs text-gray-400">Select pilar part first.</p>}
      </div>

      {/* Warm-up only on first mission */}
      {isFirst && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Warm-up</label>
          <div className="grid grid-cols-2 gap-1">
            {WARMUP_OPTIONS.map(w => (
              <button key={w.value} type="button" onClick={() => onUpdate(index, 'warm_up', w.value)}
                className={`py-1.5 px-2 text-xs rounded-lg border transition-all text-left ${
                  mission.warm_up === w.value
                    ? 'border-[var(--tss-navy)] bg-[var(--tss-navy)] text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}>
                {w.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Simulation</label>
          <select value={mission.simulation} onChange={e => onUpdate(index, 'simulation', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">None</option>
            {SIMULATION_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Mental Hack</label>
          <select value={mission.mental_hack} onChange={e => onUpdate(index, 'mental_hack', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">None</option>
            {MENTAL_HACK_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Mission Time</label>
          <select value={mission.mission_time} onChange={e => onUpdate(index, 'mission_time', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">-</option>
            {MISSION_TIME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Reps</label>
          <input type="number" value={mission.repetitions || ''} min={1} max={50} placeholder="#"
            onChange={e => onUpdate(index, 'repetitions', parseInt(e.target.value) || undefined)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
      </div>
    </div>
  );
}
