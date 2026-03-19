'use client';

import { useState, useEffect } from 'react';
import { submitDailyFeedback, getDailyFeedback } from '@/lib/actions/camps';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  belt_level: string;
}

interface Participant {
  id: string;
  students: Student | null;
}

interface FeedbackState {
  status: string;
  focus_rating: number;
  effort_rating: number;
  notes: string;
  highlights: string;
  areas_to_improve: string;
}

const EMPTY_FEEDBACK: FeedbackState = {
  status: 'attended',
  focus_rating: 0,
  effort_rating: 0,
  notes: '',
  highlights: '',
  areas_to_improve: '',
};

const ATTENDANCE_OPTIONS = [
  { value: 'attended', label: 'Attended', icon: '✓' },
  { value: 'absent', label: 'Absent', icon: '✗' },
  { value: 'partial', label: 'Partial', icon: '½' },
];

interface Props {
  campId: string;
  dayNumber: number;
  coachId: string;
  participants: Participant[];
}

export function CampDailyFeedbackForm({ campId, dayNumber, coachId, participants }: Props) {
  const [feedbacks, setFeedbacks] = useState<Record<string, FeedbackState>>({});
  const [saving, setSaving] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load existing feedback
  useEffect(() => {
    getDailyFeedback(campId, dayNumber).then(existing => {
      const initial: Record<string, FeedbackState> = {};
      const saved = new Set<string>();

      // Initialize all participants with empty feedback
      participants.forEach(p => {
        if (p.students) {
          initial[p.students.id] = { ...EMPTY_FEEDBACK };
        }
      });

      // Override with existing data
      existing.forEach((fb: any) => {
        initial[fb.student_id] = {
          status: fb.status || 'attended',
          focus_rating: fb.focus_rating || 0,
          effort_rating: fb.effort_rating || 0,
          notes: fb.notes || '',
          highlights: fb.highlights || '',
          areas_to_improve: fb.areas_to_improve || '',
        };
        saved.add(fb.student_id);
      });

      setFeedbacks(initial);
      setSavedIds(saved);
    }).catch(() => {
      // Initialize empty if fetch fails
      const initial: Record<string, FeedbackState> = {};
      participants.forEach(p => {
        if (p.students) {
          initial[p.students.id] = { ...EMPTY_FEEDBACK };
        }
      });
      setFeedbacks(initial);
    });
  }, [campId, dayNumber, participants]);

  const updateFeedback = (studentId: string, field: keyof FeedbackState, value: string | number) => {
    setFeedbacks(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const promises = participants
        .filter(p => p.students)
        .map(p => {
          const fb = feedbacks[p.students!.id];
          if (!fb) return null;
          return submitDailyFeedback(campId, dayNumber, p.students!.id, coachId, fb);
        })
        .filter(Boolean);

      await Promise.all(promises);
      const allIds = new Set(participants.map(p => p.students?.id).filter(Boolean) as string[]);
      setSavedIds(allIds);
      setSuccess('All feedback saved successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save feedback.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSingle = async (studentId: string) => {
    setSaving(true);
    setError('');
    try {
      const fb = feedbacks[studentId];
      if (!fb) return;
      await submitDailyFeedback(campId, dayNumber, studentId, coachId, fb);
      setSavedIds(prev => new Set([...prev, studentId]));
      setSuccess(`Feedback saved.`);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (participants.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-4">No students enrolled.</p>;
  }

  return (
    <div className="space-y-3">
      {participants.map(p => {
        const student = p.students;
        if (!student) return null;
        const fb = feedbacks[student.id] || EMPTY_FEEDBACK;
        const belt = BELT_DISPLAY[student.belt_level as BeltLevel];
        const isSaved = savedIds.has(student.id);
        const isExpanded = expandedId === student.id;

        return (
          <div key={student.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {/* Student row — always visible */}
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : student.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div
                className="w-8 h-8 rounded-full text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                style={{ backgroundColor: belt?.color || '#999' }}
              >
                {student.first_name[0]}{student.last_name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {student.first_name} {student.last_name}
                </p>
                <p className="text-[10px] text-gray-400">
                  {belt?.en} &middot; {fb.status}
                  {fb.focus_rating > 0 && ` · Focus ${fb.focus_rating}/5`}
                  {fb.effort_rating > 0 && ` · Effort ${fb.effort_rating}/5`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isSaved && (
                  <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full">Saved</span>
                )}
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Expanded feedback form */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-1 border-t border-gray-50 space-y-3">
                {/* Attendance */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Attendance</label>
                  <div className="flex gap-2">
                    {ATTENDANCE_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateFeedback(student.id, 'status', opt.value)}
                        className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${
                          fb.status === opt.value
                            ? opt.value === 'absent'
                              ? 'bg-red-500 text-white border-red-500'
                              : opt.value === 'partial'
                                ? 'bg-amber-500 text-white border-amber-500'
                                : 'bg-green-600 text-white border-green-600'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ratings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Focus (1-5)</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => updateFeedback(student.id, 'focus_rating', n)}
                          className={`w-8 h-8 rounded-full border text-xs font-medium transition-colors ${
                            fb.focus_rating === n
                              ? 'bg-[var(--tss-gold)] border-[var(--tss-gold)] text-white'
                              : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Effort (1-5)</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => updateFeedback(student.id, 'effort_rating', n)}
                          className={`w-8 h-8 rounded-full border text-xs font-medium transition-colors ${
                            fb.effort_rating === n
                              ? 'bg-blue-500 border-blue-500 text-white'
                              : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Text fields */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                  <textarea
                    value={fb.notes}
                    onChange={e => updateFeedback(student.id, 'notes', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--tss-navy)]"
                    placeholder="General observations..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Highlights</label>
                  <textarea
                    value={fb.highlights}
                    onChange={e => updateFeedback(student.id, 'highlights', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--tss-navy)]"
                    placeholder="What went well..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Areas to Improve</label>
                  <textarea
                    value={fb.areas_to_improve}
                    onChange={e => updateFeedback(student.id, 'areas_to_improve', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--tss-navy)]"
                    placeholder="What to work on..."
                  />
                </div>

                {/* Save single */}
                <button
                  type="button"
                  onClick={() => handleSaveSingle(student.id)}
                  disabled={saving}
                  className="w-full py-2 text-xs font-medium rounded-lg bg-[var(--tss-navy)] text-white hover:opacity-90 transition-opacity disabled:opacity-30"
                >
                  {saving ? 'Saving...' : `Save ${student.first_name}'s Feedback`}
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Save All + messages */}
      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
      {success && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">{success}</p>}

      <button
        type="button"
        onClick={handleSaveAll}
        disabled={saving}
        className="w-full py-3 bg-[var(--tss-navy)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-30"
      >
        {saving ? 'Saving All...' : 'Save All Feedback'}
      </button>
    </div>
  );
}
