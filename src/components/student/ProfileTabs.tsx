'use client';

import { useState, type ReactNode } from 'react';

// Student-profile tab shell (M138). The page stays a server component — each
// tab's sections are server-rendered and passed in as ReactNode slots; this
// wrapper only switches which slot is visible. All three stay mounted (hidden
// via CSS) so collapsible state, forms and client panels inside survive
// switching tabs.

const TABS = [
  { key: 'bitacora', label: '📓 Bitácora' },
  { key: 'progresion', label: '📈 Progresión' },
  { key: 'perfil', label: '👤 Perfil' },
] as const;
type TabKey = (typeof TABS)[number]['key'];

export function ProfileTabs({ bitacora, progresion, perfil }: {
  bitacora: ReactNode;
  progresion: ReactNode;
  perfil: ReactNode;
}) {
  const [tab, setTab] = useState<TabKey>('bitacora');

  return (
    <div>
      {/* Tab bar — sticky so it stays reachable while scrolling a long tab. */}
      <div
        className="sticky top-0 z-30 -mx-1 px-1 py-2 mb-3"
        style={{ background: 'linear-gradient(180deg, var(--tss-gray-50, #F9FAFB) 75%, transparent)' }}
      >
        <div className="grid grid-cols-3 gap-1.5 bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`py-2 rounded-xl text-[13px] font-semibold transition-all ${
                tab === t.key
                  ? 'bg-[var(--tss-navy)] text-white shadow-sm'
                  : 'text-gray-500 hover:text-[var(--tss-navy)] hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className={tab === 'bitacora' ? 'space-y-4' : 'hidden'}>{bitacora}</div>
      <div className={tab === 'progresion' ? 'space-y-4' : 'hidden'}>{progresion}</div>
      <div className={tab === 'perfil' ? 'space-y-4' : 'hidden'}>{perfil}</div>
    </div>
  );
}
