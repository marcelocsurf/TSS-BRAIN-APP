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
  const [description, setDescription] = useState('');
  const [action, setAction] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = () => {
    setError('');
    if (!type) { setError('Elegí el tipo de incidente.'); return; }
    if (!description.trim()) { setError('Escribí una breve descripción.'); return; }
    startTransition(async () => {
      try {
        await reportIncident({
          token,
          incident_type: type,
          student_id: studentId || null,
          student_name: students.find((s) => s.id === studentId)?.name || null,
          board_id: boardId || null,
          description,
          action_taken: action.trim() || null,
        });
        setDone(true);
        setType(''); setStudentId(''); setBoardId(''); setDescription(''); setAction('');
        setTimeout(() => { setDone(false); setOpen(false); }, 1800);
      } catch (e: any) {
        setError(e.message || 'No se pudo guardar el incidente.');
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
        <span className="text-sm font-semibold text-[var(--tss-navy)]">🚩 Reportar incidente</span>
        <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400">{open ? 'Cerrar' : 'Abrir'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-50 space-y-3">
          <p className="text-[11px] text-gray-500">
            Cualquier cosa que pasó en la sesión — con un alumno o general. El coordinador y el admin lo verán.
          </p>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Tipo *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-red-300"
            >
              <option value="">— Elegir —</option>
              {INCIDENT_TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Alumno involucrado (opcional)</label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-red-300"
            >
              <option value="">General — sin alumno específico</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          {boards.length > 0 && (type === 'board' || type === 'equipment') && (
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Tabla afectada (la marca en reparación)</label>
              <select
                value={boardId}
                onChange={(e) => setBoardId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-red-300"
              >
                <option value="">— Ninguna / no aplica —</option>
                {boards.map((b) => (
                  <option key={b.id} value={b.id}>{b.code}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Qué pasó *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-1 focus:ring-red-300"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Acción tomada (opcional)</label>
            <input
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-red-300"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          {done && <p className="text-xs text-emerald-600">✓ Incidente reportado.</p>}
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="w-full py-2.5 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
            style={{ background: '#B91C1C' }}
          >
            {pending ? 'Enviando…' : 'Reportar'}
          </button>
        </div>
      )}
    </div>
  );
}
