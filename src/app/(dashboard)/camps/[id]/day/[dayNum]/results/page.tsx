'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCampSession, closeCampSessionResult } from '@/lib/actions/camps';
import { BELT_DISPLAY, type BeltLevel } from '@/lib/constants/belts';
import { SESSION_STATUS_OPTIONS, type SessionStatus } from '@/lib/constants/brand';

export default function CampResultsPage() {
  const router = useRouter();
  const params = useParams();
  const campId = params.id as string;
  const dayNum = parseInt(params.dayNum as string);

  const [data, setData] = useState<any>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<Set<string>>(new Set());

  // Per-student evaluation state
  const [evals, setEvals] = useState<Record<string, {
    status: SessionStatus | '';
    focus_rating: number;
    frustration_rating: number;
    coach_feedback: string;
    whats_next: string;
    homework: string;
  }>>({});

  useEffect(() => {
    getCampSession(campId, dayNum).then(d => {
      setData(d);
      // Initialize eval state for each participant
      const initial: typeof evals = {};
      const alreadyDone = new Set(d.existingResults.map((r: any) => r.student_id));
      setSaved(alreadyDone);
      d.participants.forEach((p: any) => {
        initial[p.students?.id] = {
          status: '',
          focus_rating: 0,
          frustration_rating: 0,
          coach_feedback: '',
          whats_next: '',
          homework: '',
        };
      });
      setEvals(initial);
    });
  }, [campId, dayNum]);

  if (!data) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  const pendingParticipants = data.participants.filter(
    (p: any) => !saved.has(p.students?.id)
  );

  if (pendingParticipants.length === 0) {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✓</span>
        </div>
        <h2 className="text-xl font-bold text-[var(--tss-navy)]">All Students Evaluated</h2>
        <p className="text-sm text-gray-500 mt-2">Day {dayNum} is complete.</p>
        <button onClick={() => router.push(`/camps/${campId}`)}
          className="mt-4 px-6 py-2 bg-[var(--tss-navy)] text-white text-sm rounded-lg hover:opacity-90">
          Back to Camp
        </button>
      </div>
    );
  }

  const current = pendingParticipants[currentIdx >= pendingParticipants.length ? 0 : currentIdx];
  const student = current?.students;
  if (!student) return null;

  const ev = evals[student.id] || { status: '', focus_rating: 0, frustration_rating: 0, coach_feedback: '', whats_next: '', homework: '' };
  const setEv = (field: string, value: any) => {
    setEvals(prev => ({
      ...prev,
      [student.id]: { ...prev[student.id], [field]: value },
    }));
  };

  const canSave = ev.status && ev.focus_rating >= 1 && ev.frustration_rating >= 1 &&
    ev.coach_feedback.trim().length >= 10 && ev.whats_next.trim().length >= 5 && ev.homework.trim().length >= 5;

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      await closeCampSessionResult({
        camp_session_id: data.session.id,
        camp_instance_id: campId,
        student_id: student.id,
        mission: data.session.camp_template_days?.day_goal || `Day ${dayNum}`,
        pilar: data.blocks?.[0]?.pilar || null,
        status: ev.status as SessionStatus,
        focus_rating: ev.focus_rating,
        frustration_rating: ev.frustration_rating,
        coach_feedback: ev.coach_feedback,
        whats_next: ev.whats_next,
        homework: ev.homework,
      });
      setSaved(prev => new Set([...prev, student.id]));
      // Move to next student
      if (currentIdx < pendingParticipants.length - 1) {
        setCurrentIdx(i => i + 1);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
      setLoading(false);
    }
  };

  const belt = BELT_DISPLAY[student.belt_level as BeltLevel];

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-400">
          Day {dayNum} · Student {currentIdx + 1} of {pendingParticipants.length} remaining
        </p>
        <button onClick={() => router.push(`/camps/${campId}/day/${dayNum}`)}
          className="text-xs text-gray-400 hover:text-gray-600">← Back</button>
      </div>

      {/* Student header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full text-white font-bold flex items-center justify-center"
          style={{ backgroundColor: belt?.color || '#999' }}>
          {student.first_name[0]}{student.last_name[0]}
        </div>
        <div>
          <p className="font-semibold text-[var(--tss-navy)]">{student.first_name} {student.last_name}</p>
          <p className="text-xs text-gray-500">{belt?.en}</p>
          {student.last_homework && (
            <p className="text-[10px] text-amber-600 mt-0.5">HW: {student.last_homework}</p>
          )}
        </div>
      </div>

      {/* Evaluation card */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Status *</label>
          <div className="grid grid-cols-4 gap-1">
            {SESSION_STATUS_OPTIONS.map(opt => (
              <button key={opt.value} type="button" onClick={() => setEv('status', opt.value)}
                className={`py-2 text-xs rounded-lg border ${
                  ev.status === opt.value ? 'bg-[var(--tss-navy)] text-white border-[var(--tss-navy)]' : 'border-gray-200 text-gray-600'
                }`}>{opt.label}</button>
            ))}
          </div>
        </div>

        {/* Ratings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Focus (1-5) *</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} type="button" onClick={() => setEv('focus_rating', n)}
                  className={`w-8 h-8 rounded-full border text-xs font-medium ${
                    ev.focus_rating === n ? 'bg-[var(--tss-gold)] border-[var(--tss-gold)] text-white' : 'border-gray-200 text-gray-500'
                  }`}>{n}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Frustration (1-10) *</label>
            <div className="flex gap-0.5 flex-wrap">
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button key={n} type="button" onClick={() => setEv('frustration_rating', n)}
                  className={`w-6 h-6 rounded text-[10px] font-medium border ${
                    ev.frustration_rating === n ? 'bg-red-400 border-red-400 text-white' : 'border-gray-200 text-gray-500'
                  }`}>{n}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Text fields */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Coach Feedback * (min 10)</label>
          <textarea value={ev.coach_feedback} onChange={e => setEv('coach_feedback', e.target.value)}
            rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">What's Next * (min 5)</label>
          <input type="text" value={ev.whats_next} onChange={e => setEv('whats_next', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Homework * (min 5)</label>
          <input type="text" value={ev.homework} onChange={e => setEv('homework', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg mt-3">{error}</p>}

      {/* Nav between students + save */}
      <div className="flex gap-3 mt-4">
        {currentIdx > 0 && (
          <button onClick={() => setCurrentIdx(i => i - 1)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600">
            ← Prev
          </button>
        )}
        <button onClick={handleSave} disabled={loading || !canSave}
          className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-30">
          {loading ? 'Saving...' : `Save ${student.first_name}'s Result`}
        </button>
      </div>
    </div>
  );
}
