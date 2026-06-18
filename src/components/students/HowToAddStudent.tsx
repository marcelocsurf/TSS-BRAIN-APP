'use client';

import { useState } from 'react';
import { HelpCircle, ChevronDown, UserPlus, Send, CalendarPlus, ShieldQuestion } from 'lucide-react';

// On-demand tutorial: the official procedure to add a student and know their
// level before assigning them to a service. Collapsed by default — the user
// opens it whenever they want a refresher. Reusable on /students/new and the
// camp student manager.

const STEPS = [
  {
    icon: UserPlus,
    title: '1 · Create the student as a Lead',
    body: 'Just name + contact (and Member or Drop-in). Don’t enter the level yourself — the quiz decides it, not your guess. This creates a profile with its own intake link.',
  },
  {
    icon: Send,
    title: '2 · Send the intake link',
    body: 'The student opens it on their phone: a 60-second scenario quiz sets their provisional belt + ocean level automatically, then they sign the waiver and add medical info. You do nothing by hand — the system calculates the level and the coach confirms it later.',
  },
  {
    icon: CalendarPlus,
    title: '3 · Assign to a service',
    body: 'Now that the level is known, add them to a camp or lesson from the service detail. If you must assign before they finish the intake, you still can — they’ll show an INTAKE PENDING badge until it’s complete, and the coach sees it.',
  },
];

export function HowToAddStudent({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <HelpCircle size={16} className="text-[var(--tss-cyan,#5AC3E7)] shrink-0" />
        <span className="text-sm font-semibold text-[var(--tss-navy)] flex-1">
          How to add a student (the right way)
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 pt-3">
            The level is never something you type by hand — it comes from the quiz (objective) and the
            coach confirms it. This avoids the ~37% of surfers who overestimate themselves.
          </p>

          {STEPS.map((s) => (
            <div key={s.title} className="flex gap-3">
              <div className="shrink-0 w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center">
                <s.icon size={15} className="text-[var(--tss-cyan,#5AC3E7)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--tss-navy)]">{s.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{s.body}</p>
              </div>
            </div>
          ))}

          <div className="flex gap-3 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2.5">
            <ShieldQuestion size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed">
              <strong>“I already know their level.”</strong> Still send the intake — the quiz takes under a
              minute and leaves an objective record instead of your judgment. Only a single-class{' '}
              <strong>Drop-in</strong> can skip the full quiz.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
