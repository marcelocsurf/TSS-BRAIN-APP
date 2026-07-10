'use client';

import { useEffect, useState } from 'react';
import {
  listCoachResources,
  listStudentResourceGrants,
  setStudentResourceGrant,
  type CoachResource,
} from '@/lib/actions/coach-resources';
import { Presentation, Check } from 'lucide-react';

// Admin panel on the student profile: grant/revoke presentations for this student.
// Mirrors the coach PresentationGrants, using the student grant actions.
export function StudentPresentationGrants({ studentId }: { studentId: string }) {
  const [resources, setResources] = useState<CoachResource[]>([]);
  const [granted, setGranted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listCoachResources(), listStudentResourceGrants(studentId)])
      .then(([res, g]) => { setResources(res); setGranted(new Set(g)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [studentId]);

  const toggle = async (resourceId: string) => {
    const isGranted = granted.has(resourceId);
    setSavingId(resourceId);
    const res = await setStudentResourceGrant(studentId, resourceId, !isGranted);
    setSavingId(null);
    if (!res.ok) { alert(res.error || 'Could not update.'); return; }
    setGranted((prev) => {
      const next = new Set(prev);
      if (isGranted) next.delete(resourceId); else next.add(resourceId);
      return next;
    });
  };

  if (loading || resources.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
        <Presentation size={12} /> Presentations · grant to this student
      </p>
      <div className="space-y-2">
        {resources.map((r) => {
          const on = granted.has(r.id);
          return (
            <button
              key={r.id}
              onClick={() => toggle(r.id)}
              disabled={savingId === r.id}
              className={`w-full text-left rounded-xl border p-3 flex items-center gap-3 transition-colors ${
                on ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${on ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-transparent'}`}>
                <Check size={13} strokeWidth={3} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-[var(--tss-navy)] truncate">{r.title}</span>
                {r.description && <span className="block text-[11px] text-gray-500 truncate">{r.description}</span>}
              </span>
              <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider shrink-0" style={{ color: on ? '#059669' : '#9CA3AF' }}>
                {savingId === r.id ? '…' : on ? 'Granted' : 'Grant'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
