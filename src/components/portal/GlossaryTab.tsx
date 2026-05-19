'use client';

import { useMemo, useState } from 'react';
import { WB_GLOSSARY } from '@/lib/constants/wb-glossary';
import { BookOpen } from 'lucide-react';

// Glossary tab — quick-reference lookup for the 35 essential White Belt terms.
// Plain client-side filter, no DB calls. Source: 09_GLOSSARY.md (canon v1 EN).

export function GlossaryTab() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return WB_GLOSSARY;
    return WB_GLOSSARY.filter(
      (t) =>
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-3 pb-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
          <BookOpen size={13} strokeWidth={1.75} />
          Glossary
        </p>
        <h2 className="text-base font-bold text-[var(--tss-navy)]">
          {WB_GLOSSARY.length} essential White Belt terms
        </h2>
        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
          Look up anything you don&apos;t fully remember. Tap the search to
          filter by term or definition.
        </p>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="mt-3 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
          <p className="text-sm text-gray-400">
            No terms match &ldquo;{query}&rdquo;.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((t) => (
            <div
              key={t.term}
              className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm"
            >
              <p className="text-sm font-bold text-[var(--tss-navy)]">{t.term}</p>
              <p className="text-[12px] text-gray-600 leading-relaxed mt-0.5">
                {t.definition}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
