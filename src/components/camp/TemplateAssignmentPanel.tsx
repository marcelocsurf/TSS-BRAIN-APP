'use client';

// Platform admin only — shows which academies have a global template
// assigned, and lets the admin toggle assignments. Hidden for academy
// coordinators (they only see templates they own or templates already
// assigned to them).

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setTemplateAssignments } from '@/lib/actions/camps';
import { Building2 } from 'lucide-react';

type Academy = { id: string; name: string };

interface Props {
  templateId: string;
  academies: Academy[];
  initialAssignedIds: string[];
}

export function TemplateAssignmentPanel({
  templateId,
  academies,
  initialAssignedIds,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set(initialAssignedIds));
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSaved(false);
  };

  const save = () => {
    startTransition(async () => {
      try {
        await setTemplateAssignments(templateId, Array.from(selected));
        setSaved(true);
        router.refresh();
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  return (
    <div className="mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Building2 size={14} strokeWidth={1.75} className="text-[var(--tss-cyan,#5AC3E7)]" />
          <h3 className="text-sm font-bold text-[var(--tss-navy)]" style={{ fontFamily: 'var(--font-heading)' }}>
            Assigned academies
          </h3>
        </div>
        <span
          className="text-[10px] uppercase tracking-wider text-gray-400"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          {selected.size} of {academies.length}
        </span>
      </div>

      <p className="text-[11px] text-gray-500 mb-3">
        Pick the academies that should see this template in their <code>/camps/templates</code> and use it in their calendar. Unticking removes access — existing camp instances are not affected.
      </p>

      {academies.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No academies registered yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {academies.map((a) => {
            const isOn = selected.has(a.id);
            return (
              <label
                key={a.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                  isOn
                    ? 'bg-[var(--tss-cyan,#5AC3E7)]/10 border-[var(--tss-cyan,#5AC3E7)]/30'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isOn}
                  onChange={() => toggle(a.id)}
                  className="rounded accent-[var(--tss-cyan,#5AC3E7)]"
                />
                <span className="text-sm text-gray-700 truncate">{a.name}</span>
              </label>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="px-4 py-2 bg-[var(--tss-navy)] text-white text-xs font-semibold rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {pending ? 'Saving…' : 'Save assignments'}
        </button>
        {saved && (
          <span className="text-[11px] text-emerald-600">Saved.</span>
        )}
      </div>
    </div>
  );
}
