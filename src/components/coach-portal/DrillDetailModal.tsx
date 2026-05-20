'use client';

// M47 — Tap any drill / mission name inside the SessionPlanner and a
// modal slides in with the full canonical detail (description, key
// words, success criteria, timing) so the coach can refresh how to
// explain + run it without leaving the planning flow.

import { MarkdownContent } from '@/components/course/MarkdownContent';
import { X, Clock, RotateCcw, CheckCircle2 } from 'lucide-react';
import type { ServicePlanData } from '@/lib/actions/service-planner';

type Drill = ServicePlanData['availableDrills'][number];

interface Props {
  drill: Drill;
  onClose: () => void;
}

export function DrillDetailModal({ drill, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 bg-[var(--tss-navy)]/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="sticky top-0 px-4 py-3 flex items-start justify-between gap-3 border-b border-gray-100 bg-white z-10"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
              {drill.id} · {drill.type === 'drill' ? 'Drill' : 'Mission'}
              {drill.step_id ? ` · ${drill.step_id}` : ''}
              {drill.belt ? ` · ${drill.belt} belt` : ''}
            </p>
            <h3 className="text-base font-bold text-[var(--tss-navy)] mt-0.5">
              {drill.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-gray-400 hover:text-gray-700"
            aria-label="Close"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Quick facts */}
          <div className="flex flex-wrap gap-2">
            {drill.time_estimate && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 inline-flex items-center gap-1">
                <Clock size={11} strokeWidth={1.75} /> {drill.time_estimate}
              </span>
            )}
            {drill.reps_recommended && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 inline-flex items-center gap-1">
                <RotateCcw size={11} strokeWidth={1.75} /> {drill.reps_recommended}
              </span>
            )}
            {drill.block_name && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {drill.block_name}
              </span>
            )}
          </div>

          {/* Key words */}
          {drill.key_words && drill.key_words.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              <p className="text-[10px] font-mono uppercase tracking-wider text-amber-700 mb-1">
                Key words
              </p>
              <p className="text-sm font-bold text-amber-900 tracking-wide">
                {drill.key_words.join(' · ')}
              </p>
            </div>
          )}

          {/* Description / how to teach it */}
          {drill.description_md && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                How to teach it
              </p>
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                <MarkdownContent markdown={drill.description_md} />
              </div>
            </div>
          )}

          {/* Success criteria */}
          {drill.success_criteria && drill.success_criteria.length > 0 && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">
                How you know they got it
              </p>
              <ul className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 space-y-1">
                {drill.success_criteria.map((c, i) => (
                  <li key={i} className="flex gap-1.5 text-[12px] text-emerald-900">
                    <CheckCircle2
                      size={13}
                      strokeWidth={1.75}
                      className="text-emerald-600 shrink-0 mt-0.5"
                    />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!drill.description_md &&
            (!drill.success_criteria || drill.success_criteria.length === 0) && (
              <p className="text-[12px] text-gray-400 italic">
                No detailed description yet — open this drill in /content as
                Head Coach to fill it in.
              </p>
            )}
        </div>
      </div>
    </div>
  );
}
