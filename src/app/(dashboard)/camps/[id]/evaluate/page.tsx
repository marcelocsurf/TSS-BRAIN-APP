'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  getCampDetail,
  getCampEvaluations,
  submitFinalEvaluation,
} from '@/lib/actions/camps';
import { getCurrentCoach } from '@/lib/actions/auth';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';

const OCEAN_LEVELS = ['beginner', 'supervised', 'autonomous', 'advanced'];

interface EvalState {
  overall_rating: number;
  technical_progress: string;
  tactical_progress: string;
  mental_progress: string;
  physical_progress: string;
  sequence_recommendation: string;
  ocean_level_recommendation: string;
  strengths: string;
  areas_to_improve: string;
  homework_for_after_camp: string;
  general_notes: string;
}

const EMPTY_EVAL: EvalState = {
  overall_rating: 0,
  technical_progress: '',
  tactical_progress: '',
  mental_progress: '',
  physical_progress: '',
  sequence_recommendation: '',
  ocean_level_recommendation: '',
  strengths: '',
  areas_to_improve: '',
  homework_for_after_camp: '',
  general_notes: '',
};

export default function CampEvaluatePage() {
  const router = useRouter();
  const params = useParams();
  const campId = params.id as string;

  const [camp, setCamp] = useState<any>(null);
  const [coach, setCoach] = useState<any>(null);
  const [evals, setEvals] = useState<Record<string, EvalState>>({});
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    Promise.all([
      getCampDetail(campId),
      getCampEvaluations(campId),
      getCurrentCoach(),
    ]).then(([campData, existingEvals, currentCoach]) => {
      setCamp(campData);
      setCoach(currentCoach);

      const initial: Record<string, EvalState> = {};
      const submitted = new Set<string>();

      // Initialize for all participants
      campData.participants.forEach((p: any) => {
        if (p.students) {
          initial[p.students.id] = { ...EMPTY_EVAL };
        }
      });

      // Pre-fill with existing evaluations
      existingEvals.forEach((ev: any) => {
        initial[ev.student_id] = {
          overall_rating: ev.overall_rating || 0,
          technical_progress: ev.technical_progress || '',
          tactical_progress: ev.tactical_progress || '',
          mental_progress: ev.mental_progress || '',
          physical_progress: ev.physical_progress || '',
          sequence_recommendation: ev.sequence_recommendation?.toString() || '',
          ocean_level_recommendation: ev.ocean_level_recommendation || '',
          strengths: ev.strengths || '',
          areas_to_improve: ev.areas_to_improve || '',
          homework_for_after_camp: ev.homework_for_after_camp || '',
          general_notes: ev.general_notes || '',
        };
        submitted.add(ev.student_id);
      });

      setEvals(initial);
      setSubmittedIds(submitted);
    });
  }, [campId]);

  const updateEval = (studentId: string, field: keyof EvalState, value: string | number) => {
    setEvals(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const handleSubmit = async (studentId: string) => {
    if (!coach) return;
    setSaving(studentId);
    setError('');
    setSuccess('');

    const ev = evals[studentId];
    if (!ev || ev.overall_rating < 1) {
      setError('Overall rating is required.');
      setSaving(null);
      return;
    }

    try {
      await submitFinalEvaluation(campId, studentId, coach.id, {
        overall_rating: ev.overall_rating,
        technical_progress: ev.technical_progress,
        tactical_progress: ev.tactical_progress,
        mental_progress: ev.mental_progress,
        physical_progress: ev.physical_progress,
        sequence_recommendation: ev.sequence_recommendation ? parseInt(ev.sequence_recommendation) : null,
        ocean_level_recommendation: ev.ocean_level_recommendation,
        general_notes: ev.general_notes,
        strengths: ev.strengths,
        areas_to_improve: ev.areas_to_improve,
        homework_for_after_camp: ev.homework_for_after_camp,
      });

      setSubmittedIds(prev => new Set([...prev, studentId]));
      setSuccess('Evaluation submitted.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit evaluation.');
    } finally {
      setSaving(null);
    }
  };

  if (!camp || !coach) {
    return <div className="text-center py-12 text-gray-400">Loading...</div>;
  }

  const { instance, participants } = camp;
  const totalStudents = participants.length;
  const evaluatedCount = submittedIds.size;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push(`/camps/${campId}`)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          &larr; Back to camp
        </button>
        <h2 className="text-xl font-bold text-[var(--tss-navy)] mt-1">Final Evaluations</h2>
        <p className="text-sm text-gray-600 mt-0.5">{instance.camp_name}</p>
        <div className="flex gap-3 mt-1 text-xs text-gray-400">
          <span>{instance.start_date} &rarr; {instance.end_date}</span>
          <span>{evaluatedCount}/{totalStudents} evaluated</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-green-500 h-full rounded-full transition-all"
          style={{ width: `${totalStudents > 0 ? (evaluatedCount / totalStudents) * 100 : 0}%` }}
        />
      </div>

      {/* Messages */}
      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
      {success && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{success}</p>}

      {/* Students */}
      {participants.map((p: any) => {
        const student = p.students;
        if (!student) return null;
        const ev = evals[student.id] || EMPTY_EVAL;
        const belt = BELT_DISPLAY[student.belt_level as BeltLevel];
        const isSubmitted = submittedIds.has(student.id);
        const isExpanded = expandedId === student.id;
        const isSaving = saving === student.id;

        return (
          <div key={student.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Student row */}
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : student.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div
                className="w-10 h-10 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0"
                style={{ backgroundColor: belt?.color || '#999' }}
              >
                {student.first_name[0]}{student.last_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {student.first_name} {student.last_name}
                </p>
                <p className="text-[10px] text-gray-400">
                  {belt?.en}
                  {ev.overall_rating > 0 && ` · Rating: ${ev.overall_rating}/5`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isSubmitted ? (
                  <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Evaluated</span>
                ) : (
                  <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">Pending</span>
                )}
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Evaluation form */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-1 border-t border-gray-50 space-y-4">
                {/* Overall Rating */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Overall Rating *
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => updateEval(student.id, 'overall_rating', n)}
                        className={`w-10 h-10 rounded-full border text-sm font-medium transition-colors ${
                          ev.overall_rating >= n
                            ? 'bg-[var(--tss-gold)] border-[var(--tss-gold)] text-white'
                            : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4 Pillars of Progress */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Technical Progress</label>
                    <textarea
                      value={ev.technical_progress}
                      onChange={e => updateEval(student.id, 'technical_progress', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--tss-navy)]"
                      placeholder="Paddle technique, pop-up, stance..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Tactical Progress</label>
                    <textarea
                      value={ev.tactical_progress}
                      onChange={e => updateEval(student.id, 'tactical_progress', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--tss-navy)]"
                      placeholder="Wave selection, positioning..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Mental Progress</label>
                    <textarea
                      value={ev.mental_progress}
                      onChange={e => updateEval(student.id, 'mental_progress', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--tss-navy)]"
                      placeholder="Focus, confidence, resilience..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Physical Progress</label>
                    <textarea
                      value={ev.physical_progress}
                      onChange={e => updateEval(student.id, 'physical_progress', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--tss-navy)]"
                      placeholder="Endurance, flexibility, strength..."
                    />
                  </div>
                </div>

                {/* Recommendations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Sequence Recommendation</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={ev.sequence_recommendation}
                      onChange={e => updateEval(student.id, 'sequence_recommendation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--tss-navy)]"
                      placeholder="e.g. 5"
                    />
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      What sequence number should this student be at?
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Ocean Level Recommendation</label>
                    <select
                      value={ev.ocean_level_recommendation}
                      onChange={e => updateEval(student.id, 'ocean_level_recommendation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[var(--tss-navy)] bg-white"
                    >
                      <option value="">-- Select --</option>
                      {OCEAN_LEVELS.map(level => (
                        <option key={level} value={level} className="capitalize">
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Updates student profile if changed
                    </p>
                  </div>
                </div>

                {/* Strengths & Areas */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Strengths</label>
                  <textarea
                    value={ev.strengths}
                    onChange={e => updateEval(student.id, 'strengths', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--tss-navy)]"
                    placeholder="What this student does well..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Areas to Improve</label>
                  <textarea
                    value={ev.areas_to_improve}
                    onChange={e => updateEval(student.id, 'areas_to_improve', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--tss-navy)]"
                    placeholder="Focus areas going forward..."
                  />
                </div>

                {/* Homework */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Homework for After Camp</label>
                  <textarea
                    value={ev.homework_for_after_camp}
                    onChange={e => updateEval(student.id, 'homework_for_after_camp', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--tss-navy)]"
                    placeholder="Practice drills, exercises to do at home..."
                  />
                </div>

                {/* General Notes */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">General Notes</label>
                  <textarea
                    value={ev.general_notes}
                    onChange={e => updateEval(student.id, 'general_notes', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--tss-navy)]"
                    placeholder="Any additional comments..."
                  />
                </div>

                {/* Submit */}
                <button
                  type="button"
                  onClick={() => handleSubmit(student.id)}
                  disabled={isSaving || ev.overall_rating < 1}
                  className="w-full py-3 bg-green-600 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-30"
                >
                  {isSaving
                    ? 'Submitting...'
                    : isSubmitted
                      ? `Update ${student.first_name}'s Evaluation`
                      : `Submit ${student.first_name}'s Evaluation`
                  }
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* All done indicator */}
      {evaluatedCount === totalStudents && totalStudents > 0 && (
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-sm text-green-700 font-medium">
            All {totalStudents} students have been evaluated.
          </p>
          <button
            onClick={() => router.push(`/camps/${campId}`)}
            className="mt-2 px-6 py-2 bg-[var(--tss-navy)] text-white text-sm rounded-lg hover:opacity-90"
          >
            Back to Camp
          </button>
        </div>
      )}
    </div>
  );
}
