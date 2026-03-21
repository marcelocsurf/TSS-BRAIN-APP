'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  scheduleEvaluation,
  bulkScheduleEvaluations,
  completeScheduledEvaluation,
} from '@/lib/actions/camps';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
}

interface ScheduledEval {
  id: string;
  student_id: string;
  scheduled_day: number;
  evaluation_type: string;
  completed: boolean;
  completed_at: string | null;
  notes: string | null;
  students?: Student;
  coaches?: { display_name: string } | null;
}

const EVAL_TYPE_OPTIONS = [
  { value: 'progress_check', label: 'Progress Check' },
  { value: 'sequence_evaluation', label: 'Sequence Evaluation' },
  { value: 'ocean_assessment', label: 'Ocean Assessment' },
  { value: 'final', label: 'Final Evaluation' },
];

const EVAL_TYPE_LABELS: Record<string, string> = {
  progress_check: 'Progress Check',
  sequence_evaluation: 'Sequence Eval',
  ocean_assessment: 'Ocean Assessment',
  final: 'Final',
};

interface Props {
  campInstanceId: string;
  coachId: string;
  participants: { students: Student }[];
  scheduledEvals: ScheduledEval[];
  totalDays: number;
}

export function ScheduledEvaluationsPanel({
  campInstanceId,
  coachId,
  participants,
  scheduledEvals,
  totalDays,
}: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedType, setSelectedType] = useState('progress_check');
  const [allStudents, setAllStudents] = useState(false);

  // Completion state
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const toggleAll = () => {
    if (allStudents) {
      setSelectedStudents([]);
      setAllStudents(false);
    } else {
      setSelectedStudents(participants.map((p) => p.students.id));
      setAllStudents(true);
    }
  };

  const handleSchedule = async () => {
    if (selectedStudents.length === 0) return;
    setLoading(true);
    try {
      if (selectedStudents.length > 1) {
        await bulkScheduleEvaluations(
          campInstanceId,
          selectedStudents.map((sid) => ({
            student_id: sid,
            scheduled_day: selectedDay,
            evaluation_type: selectedType,
          }))
        );
      } else {
        await scheduleEvaluation(
          campInstanceId,
          selectedStudents[0],
          selectedDay,
          selectedType
        );
      }
      setShowForm(false);
      setSelectedStudents([]);
      setAllStudents(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to schedule');
    }
    setLoading(false);
  };

  const handleQuickFinalAll = async () => {
    setLoading(true);
    try {
      await bulkScheduleEvaluations(
        campInstanceId,
        participants.map((p) => ({
          student_id: p.students.id,
          scheduled_day: totalDays,
          evaluation_type: 'final',
        }))
      );
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to schedule');
    }
    setLoading(false);
  };

  const handleComplete = async (evalId: string) => {
    setLoading(true);
    try {
      await completeScheduledEvaluation(evalId, coachId, completionNotes);
      setCompletingId(null);
      setCompletionNotes('');
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to complete');
    }
    setLoading(false);
  };

  const pendingEvals = scheduledEvals.filter((e) => !e.completed);
  const completedEvals = scheduledEvals.filter((e) => e.completed);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Scheduled Evaluations</h3>
          <p className="text-[10px] text-gray-400">
            {pendingEvals.length} pending &middot; {completedEvals.length} completed
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleQuickFinalAll}
            disabled={loading}
            className="px-3 py-1.5 text-[10px] bg-[var(--tss-gold)] text-white rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
          >
            Final Eval (All, Day {totalDays})
          </button>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="px-3 py-1.5 text-xs bg-[var(--tss-navy)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            {showForm ? 'Cancel' : 'Schedule'}
          </button>
        </div>
      </div>

      {/* Schedule form */}
      {showForm && (
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-gray-500 mb-1" style={{ fontFamily: 'var(--font-mono)' }}>Day</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(parseInt(e.target.value))}
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[var(--tss-gold)]"
              >
                {Array.from({ length: totalDays }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>Day {d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1" style={{ fontFamily: 'var(--font-mono)' }}>Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[var(--tss-gold)]"
              >
                {EVAL_TYPE_OPTIONS.map((et) => (
                  <option key={et.value} value={et.value}>{et.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-gray-500" style={{ fontFamily: 'var(--font-mono)' }}>Students</label>
              <button
                type="button"
                onClick={toggleAll}
                className="text-[10px] text-[var(--tss-cyan)] hover:underline"
              >
                {allStudents ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {participants.map((p) => {
                const s = p.students;
                const isSelected = selectedStudents.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleStudent(s.id)}
                    className={`px-2 py-1 text-[10px] rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-[var(--tss-navy)] text-white border-[var(--tss-navy)]'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {s.first_name} {s.last_name?.[0]}.
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSchedule}
            disabled={loading || selectedStudents.length === 0}
            className="w-full py-2 bg-[var(--tss-navy)] text-white rounded-xl text-xs font-medium hover:brightness-110 transition-all disabled:opacity-50"
          >
            {loading ? 'Scheduling...' : `Schedule for ${selectedStudents.length} student${selectedStudents.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {/* Scheduled list */}
      {scheduledEvals.length === 0 ? (
        <p className="px-4 py-6 text-xs text-gray-400 text-center">No evaluations scheduled yet.</p>
      ) : (
        <div className="divide-y divide-gray-50">
          {scheduledEvals.map((ev) => (
            <div key={ev.id} className="px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${ev.completed ? 'bg-green-400' : 'bg-amber-400'}`} />
                <div>
                  <p className="text-xs text-gray-800">
                    {ev.students?.first_name} {ev.students?.last_name}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Day {ev.scheduled_day} &middot; {EVAL_TYPE_LABELS[ev.evaluation_type] || ev.evaluation_type}
                    {ev.completed && ev.coaches && (
                      <span> &middot; by {ev.coaches.display_name}</span>
                    )}
                  </p>
                </div>
              </div>

              {ev.completed ? (
                <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                  Done
                </span>
              ) : completingId === ev.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="Notes..."
                    className="px-2 py-1 border border-gray-200 rounded-lg text-[10px] w-24 focus:outline-none focus:ring-1 focus:ring-[var(--tss-gold)]"
                  />
                  <button
                    type="button"
                    onClick={() => handleComplete(ev.id)}
                    disabled={loading}
                    className="px-2 py-1 text-[10px] bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompletingId(null)}
                    className="px-2 py-1 text-[10px] text-gray-400 hover:text-gray-600"
                  >
                    X
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCompletingId(ev.id)}
                  className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full hover:bg-amber-100 transition-colors"
                >
                  Pending
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
