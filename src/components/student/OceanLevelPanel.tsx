'use client';

import { useState } from 'react';
import { evaluateOceanLevel } from '@/lib/actions/evaluations';

interface Props {
  studentId: string;
  coachId: string;
  currentLevel: string | null;
  history: any[];
}

const OCEAN_LEVELS = ['beginner', 'supervised', 'autonomous', 'advanced'];

export function OceanLevelPanel({ studentId, coachId, currentLevel, history }: Props) {
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
    autonomous: 'bg-green-50 text-green-700',
    advanced: 'bg-purple-50 text-purple-700',
  };

  return (
    <div className="space-y-3">
      {/* Current level */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${levelColor[currentLevel || ''] || 'bg-gray-50 text-gray-600'}`}>
            {currentLevel || 'Not set'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
          className="text-xs px-3 py-1.5 bg-[var(--tss-navy)] text-white rounded-lg hover:opacity-90"
        >
          {showForm ? 'Cancel' : 'Update Ocean Level'}
        </button>
      </div>

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
                  <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
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
