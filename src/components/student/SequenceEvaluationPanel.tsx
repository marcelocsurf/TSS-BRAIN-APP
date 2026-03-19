'use client';

import { useState } from 'react';
import { evaluateStudentSequence } from '@/lib/actions/evaluations';

interface Props {
  studentId: string;
  coachId: string;
  currentSequence: number;
  currentStep: number;
  history: any[];
}

export function SequenceEvaluationPanel({ studentId, coachId, currentSequence, currentStep, history }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    sequenceNumber: currentSequence,
    stepNumber: currentStep,
    status: 'passed' as 'passed' | 'failed' | 'in_progress',
    evaluationType: 'progression' as 'progression' | 'assessment' | 'correction',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await evaluateStudentSequence({
        studentId,
        coachId,
        sequenceNumber: form.sequenceNumber,
        stepNumber: form.stepNumber,
        status: form.status,
        evaluationType: form.evaluationType,
        notes: form.notes || undefined,
      });
      setSuccess('Evaluation saved');
      setShowForm(false);
      // Page will revalidate
    } catch (err: any) {
      setError(err.message || 'Failed to save evaluation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Current position */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--tss-navy)]">
            Sequence #{currentSequence} / Step {currentStep}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
          className="text-xs px-3 py-1.5 bg-[var(--tss-navy)] text-white rounded-lg hover:opacity-90"
        >
          {showForm ? 'Cancel' : 'Evaluate Progression'}
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">New Sequence #</label>
              <input
                type="number"
                min={1}
                max={26}
                value={form.sequenceNumber}
                onChange={e => setForm(f => ({ ...f, sequenceNumber: Number(e.target.value) }))}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">New Step</label>
              <input
                type="number"
                min={1}
                value={form.stepNumber}
                onChange={e => setForm(f => ({ ...f, stepNumber: Number(e.target.value) }))}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
              >
                <option value="passed">Passed</option>
                <option value="in_progress">In Progress</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1">Type</label>
              <select
                value={form.evaluationType}
                onChange={e => setForm(f => ({ ...f, evaluationType: e.target.value as any }))}
                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
              >
                <option value="progression">Progression</option>
                <option value="assessment">Assessment</option>
                <option value="correction">Correction</option>
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
              placeholder="Evaluation notes..."
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
          {success && <p className="text-xs text-green-600">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[var(--tss-navy)] text-white text-sm rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Evaluation'}
          </button>
        </form>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <p className="text-[10px] font-semibold text-gray-400 uppercase">Recent Evaluations</p>
          {history.slice(0, 5).map((ev: any) => (
            <div key={ev.id} className="flex items-start justify-between gap-2 text-xs">
              <div className="min-w-0">
                <p className="text-gray-700">
                  Seq {ev.previous_sequence}/{ev.previous_step} → {ev.sequence_number}/{ev.step_number}
                </p>
                <p className="text-gray-400">
                  {new Date(ev.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {' · '}
                  {ev.coaches?.display_name || 'Coach'}
                </p>
                {ev.notes && <p className="text-gray-500 mt-0.5 truncate">{ev.notes}</p>}
              </div>
              <EvalStatusBadge status={ev.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EvalStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    passed: 'bg-green-50 text-green-700',
    in_progress: 'bg-amber-50 text-amber-700',
    failed: 'bg-red-50 text-red-700',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize shrink-0 ${styles[status] || 'bg-gray-50 text-gray-600'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}
