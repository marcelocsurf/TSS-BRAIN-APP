'use client';

import { useState } from 'react';
import { evaluateOceanLevel } from '@/lib/actions/evaluations';
import { OCEAN_LEVELS, OCEAN_LEVEL_INFO } from '@/lib/constants/ocean-levels';
import { Hourglass } from 'lucide-react';

interface Props {
  studentId: string;
  coachId: string;
  currentLevel: string | null;
  history: any[];
  /** True when the level came from the student's intake quiz, awaiting coach validation. */
  provisional?: boolean;
}

export function OceanLevelPanel({ studentId, coachId, currentLevel, history, provisional }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    newLevel: currentLevel || 'beginner',
    method: 'coach_assessment' as 'quiz' | 'coach_assessment' | 'evaluation',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await evaluateOceanLevel({
        studentId,
        coachId,
        newLevel: form.newLevel,
        method: form.method,
        notes: form.notes || undefined,
      });
      setSuccess('Ocean level updated');
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update ocean level');
    } finally {
      setLoading(false);
    }
  };

  const levelColor: Record<string, string> = {
    beginner: 'bg-gray-100 text-gray-700',
    supervised: 'bg-blue-50 text-blue-700',
    semi_autonomous: 'bg-teal-50 text-teal-700',
    autonomous: 'bg-green-50 text-green-700',
    advanced: 'bg-purple-50 text-purple-700',
  };

  const currentInfo = currentLevel
    ? OCEAN_LEVEL_INFO[currentLevel as keyof typeof OCEAN_LEVEL_INFO]
    : null;

  return (
    <div className="space-y-3">
      {/* Current level */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full ${levelColor[currentLevel || ''] || 'bg-gray-50 text-gray-600'}`}>
            {currentInfo ? `${currentInfo.short} · ${currentInfo.name}` : (currentLevel || 'Not set')}
          </span>
          {provisional && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold inline-flex items-center gap-1"
              title="Auto-assigned by the student's intake quiz. Confirm or adjust to clear this badge."
            >
              <Hourglass size={10} strokeWidth={1.75} />
              Provisional — quiz-assigned
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
          className="text-xs px-3 py-1.5 bg-[var(--tss-navy)] text-white rounded-lg hover:opacity-90"
        >
          {showForm ? 'Cancel' : provisional ? 'Confirm Level' : 'Update Ocean Level'}
        </button>
      </div>
      {currentInfo && (
        <p className="text-[11px] text-gray-500 italic">{currentInfo.cleared}</p>
      )}

      {/* Inline form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">New Level</label>
              <select
                value={form.newLevel}
                onChange={e => setForm(f => ({ ...f, newLevel: e.target.value }))}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
              >
                {OCEAN_LEVELS.map(level => (
                  <option key={level} value={level}>
                    {OCEAN_LEVEL_INFO[level].short} · {OCEAN_LEVEL_INFO[level].name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Method</label>
              <select
                value={form.method}
                onChange={e => setForm(f => ({ ...f, method: e.target.value as any }))}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
              >
                <option value="coach_assessment">Coach Assessment</option>
                <option value="quiz">Quiz</option>
                <option value="evaluation">Evaluation</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-gray-500 mb-1">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm resize-none"
              placeholder="Assessment notes..."
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
          {success && <p className="text-xs text-green-600">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[var(--tss-navy)] text-white text-sm rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Update Level'}
          </button>
        </form>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <p className="text-[10px] font-semibold text-gray-400 uppercase">Level Change History</p>
          {history.slice(0, 5).map((ev: any) => (
            <div key={ev.id} className="flex items-start justify-between gap-2 text-xs">
              <div className="min-w-0">
                <p className="text-gray-700">
                  {ev.previous_level || 'none'} → {ev.new_level}
                </p>
                <p className="text-gray-400">
                  {new Date(ev.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {' · '}
                  {ev.coaches?.display_name || 'Coach'}
                  {' · '}
                  <span className="capitalize">{ev.method?.replace(/_/g, ' ')}</span>
                </p>
                {ev.notes && <p className="text-gray-500 mt-0.5 truncate">{ev.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
