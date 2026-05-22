'use client';

import { useState } from 'react';
import { Dumbbell, Waves, Image as ImageIcon, type LucideIcon } from 'lucide-react';
import { MarkdownContent } from '@/components/course/MarkdownContent';
import { StpMediaGrid } from '@/components/coach-portal/StpMediaGrid';
import type { CoachStpDetail } from '@/lib/actions/coach-tools';

type Tab = 'drills' | 'missions' | 'media';

export function StpToolsClient({ detail }: { detail: CoachStpDetail }) {
  const { drills, missions, media } = detail;
  const initial: Tab =
    drills.length > 0
      ? 'drills'
      : missions.length > 0
      ? 'missions'
      : 'media';
  const [tab, setTab] = useState<Tab>(initial);

  const tabs: { key: Tab; label: string; count: number; Icon: LucideIcon }[] = [
    { key: 'drills',   label: 'Drills',   count: drills.length,   Icon: Dumbbell },
    { key: 'missions', label: 'Missions', count: missions.length, Icon: Waves },
    { key: 'media',    label: 'Media',    count: media.length,    Icon: ImageIcon },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map((t) => {
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                isActive
                  ? 'bg-white text-[var(--tss-navy)] border border-gray-300 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <t.Icon
                size={13}
                strokeWidth={1.75}
                className={isActive ? 'text-[var(--tss-cyan,#5AC3E7)]' : ''}
              />
              <span>{t.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-[var(--tss-cyan,#5AC3E7)]/10 text-[var(--tss-navy)]' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {tab === 'drills' && <ToolList items={drills} kind="drill" />}
      {tab === 'missions' && <ToolList items={missions} kind="mission" />}
      {tab === 'media' && <StpMediaGrid media={media} />}
    </div>
  );
}

function ToolList({ items, kind }: { items: any[]; kind: 'drill' | 'mission' }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic px-1">
        No {kind}s indexed for this step yet.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {items.map((t) => (
        <ToolCard key={t.id} tool={t} />
      ))}
    </div>
  );
}

function ToolCard({ tool }: { tool: any }) {
  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      <header className="space-y-1">
        <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
          {tool.id}
          {tool.block_name ? ` · ${tool.block_name}` : ''}
        </p>
        <h3 className="text-base font-bold text-[var(--tss-navy)] leading-tight">
          {tool.title}
        </h3>
        <div className="flex flex-wrap gap-3 text-[11px] text-gray-500">
          {tool.time_estimate && <span>⏱ {tool.time_estimate}</span>}
          {tool.reps_recommended && <span>↻ {tool.reps_recommended}</span>}
        </div>
      </header>

      {tool.description_md && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
            How it works
          </p>
          <MarkdownContent markdown={tool.description_md} />
        </div>
      )}

      {tool.success_criteria && tool.success_criteria.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
            Success criteria
          </p>
          <ul className="space-y-1">
            {tool.success_criteria.map((c: string, i: number) => (
              <li key={i} className="text-sm text-gray-700 flex gap-2">
                <span className="text-emerald-500">✓</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tool.key_words && tool.key_words.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
            Key words
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tool.key_words.map((k: string, i: number) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
