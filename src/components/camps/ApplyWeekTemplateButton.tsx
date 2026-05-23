'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Layers, X } from 'lucide-react';
import { applyWeekTemplate, type WeekTemplateRow } from '@/lib/actions/week-templates';

interface Props {
  weekTemplates: WeekTemplateRow[];
  mondayDate: string; // YYYY-MM-DD of the current week's Monday
  weekLabel: string;  // e.g. "Mon 18 → Sun 24 · May 2026"
}

export function ApplyWeekTemplateButton({
  weekTemplates,
  mondayDate,
  weekLabel,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  const apply = (id: string, name: string) => {
    if (!confirm(`Stamp "${name}" onto the week of ${weekLabel}? This creates new camp instances.`)) return;
    startTransition(async () => {
      try {
        const r = await applyWeekTemplate(id, mondayDate);
        setResult(`Created ${r.created} service${r.created === 1 ? '' : 's'}.`);
        router.refresh();
      } catch (err: any) {
        setResult(`Error: ${err.message}`);
      }
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setResult(null);
        }}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-[var(--tss-navy)] bg-white text-[var(--tss-navy)] hover:bg-gray-50"
      >
        <Layers size={13} strokeWidth={2} />
        Apply Week Template
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-30 w-72 bg-white rounded-xl border border-gray-200 shadow-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <p
              className="text-[10px] uppercase tracking-wider text-gray-500"
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              Stamp onto {weekLabel}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-700"
            >
              <X size={12} strokeWidth={2} />
            </button>
          </div>

          {weekTemplates.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-xs text-gray-500 mb-2">No week templates yet.</p>
              <Link
                href="/camps/week-templates/new"
                className="text-xs text-[var(--tss-navy)] underline"
                onClick={() => setOpen(false)}
              >
                Create one →
              </Link>
            </div>
          ) : (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {weekTemplates.map((wt) => (
                <button
                  key={wt.id}
                  type="button"
                  onClick={() => apply(wt.id, wt.name)}
                  disabled={pending}
                  className="w-full text-left px-2 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-800">{wt.name}</p>
                  <p className="text-[10px] text-gray-400">
                    {wt.slots.length} slot{wt.slots.length !== 1 ? 's' : ''}
                  </p>
                </button>
              ))}
            </div>
          )}

          {result && (
            <p
              className={`text-[11px] mt-2 ${
                result.startsWith('Error') ? 'text-red-600' : 'text-emerald-700'
              }`}
            >
              {result}
            </p>
          )}

          <div className="mt-2 pt-2 border-t border-gray-100">
            <Link
              href="/camps/week-templates"
              className="text-[11px] text-gray-500 hover:text-[var(--tss-navy)]"
              onClick={() => setOpen(false)}
            >
              Manage week templates →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
