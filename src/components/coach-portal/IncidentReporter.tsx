'use client';

import { useState, useTransition } from 'react';
import { reportIncident } from '@/lib/actions/coach-portal';
import { INCIDENT_TYPE_OPTIONS } from '@/lib/constants/brand';

// Coach-facing incident reporter. A flagged incident (accident, broken board,
// fin/leash, fight in the water, mishandled frustration, misunderstanding, or
// anything general about the session) lands in the coordinator + admin
// dashboard so everyone stays informed and it's on record.
export function IncidentReporter({
  token,
  students = [],
  boards = [],
}: {
  token: string;
  students?: { id: string; name: string }[];
  boards?: { id: string; code: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('');
  const [studentId, setStudentId] = useState('');
  const [boardId, setBoardId] = useState('');
  const [boardAction, setBoardAction] = useState<'repair' | 'retire' | 'keep'>('repair');
  const [description, setDescription] = useState('');
  const [action, setAction] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = () => {
    setError('');
    if (!type) { setError('Pick the incident type.'); return; }
    if (!description.trim()) { setError('Write a short description.'); return; }
    startTransition(async () => {
      try {
        await reportIncident({
          token,
          incident_type: type,
          student_id: studentId || null,
          student_name: students.find((s) => s.id === studentId)?.name || null,
          board_id: boardId || null,
          board_action: boardId ? boardAction : undefined,
          description,
          action_taken: action.trim() || null,
        });
        setDone(true);
        setType(''); setStudentId(''); setBoardId(''); setBoardAction('repair'); setDescription(''); setAction('');
        setTimeout(() => { setDone(false); setOpen(false); }, 1800);
      } catch (e: any) {
        setError(e.message || 'Could not save the incident.');
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-[var(--tss-navy)]">🚩 Report incident</span>
        <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">{open ? 'Close' : 'Open'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-50 space-y-3">
          <p className="text-[11px] text-gray-500">
            Anything that happened in the session — with a student or general. The coordinator and admin will see it.
          </p>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Type *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-red-300"
            >
              <option value="">— Choose —</option>
              {INCIDENT_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Student involved (optional)</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-red-300"
            >
              <option value="">General — no specific student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          {boards.length > 0 && (type === 'board' || type === 'equipment') && (
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Board affected</label>
              <select
                value={boardId}
                onChange={(e) => setBoardId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-red-300"
              >
                <option value="">— None / N/A —</option>
                {boards.map((b) => (
                  <option key={b.id} value={b.id}>{b.code}</option>
                ))}
              </select>
              {boardId && (
                <div className="mt-2">
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">What happens to this board?</label>
                  <select
                    value={boardAction}
                    onChange={(e) => setBoardAction(e.target.value as 'repair' | 'retire' | 'keep')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-red-300"
                  >
                    <option value="repair">Send to repair — out of the pool</option>
                    <option value="retire">Retire — broken for good</option>
                    <option value="keep">Keep in service — just log it</option>
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {boardAction === 'keep'
                      ? 'The board stays available; the incident is recorded.'
                      : 'The board leaves the assignable inventory and its condition drops to Poor.'}
                  </p>
                </div>
              )}
            </div>
          )}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">What happened *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-red-300"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Action taken (optional)</label>
            <input
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-300"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          {done && <p className="text-xs text-emerald-600">✓ Incident reported.</p>}
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="w-full py-2.5 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
            style={{ background: '#B91C1C' }}
          >
            {pending ? 'Sending…' : 'Report'}
          </button>
        </div>
      )}
    </div>
  );
}
