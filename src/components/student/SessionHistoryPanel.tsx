'use client';

import { useState } from 'react';
import { PILAR_LABELS, type Pilar } from '@/lib/constants/brand';

interface SessionEntry {
  id: string;
  source: 'standalone' | 'cascade';
  date: string;
  coachName: string | null;
  mission: string | null;
  pilar: string | null;
  status: string | null;
  coachFeedback: string | null;
  homework: string | null;
  whatsNext: string | null;
  duration: string | number | null;
  venue: string | null;
}

interface Props {
  sessions: SessionEntry[];
}

const PAGE_SIZE = 10;

export function SessionHistoryPanel({ sessions }: Props) {
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalPages = Math.ceil(sessions.length / PAGE_SIZE);
  const paginated = sessions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (sessions.length === 0) {
    return <p className="text-sm text-gray-400 py-4 text-center">No sessions recorded yet</p>;
  }

  return (
    <div className="space-y-2">
      {paginated.map((s) => {
        const isExpanded = expandedId === s.id;
        return (
          <div key={s.id} className="border-b border-gray-50 pb-2 last:border-0 last:pb-0">
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : s.id)}
              className="w-full text-left"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {s.mission || 'Session'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(s.date).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                    {s.coachName && ` · ${s.coachName}`}
                    {s.venue && ` · ${s.venue}`}
                    {s.duration && ` · ${s.duration}min`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={s.status} />
                  {s.pilar && (
                    <span className="text-[10px] text-gray-400">
                      {PILAR_LABELS[s.pilar as Pilar] || s.pilar}
                    </span>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    s.source === 'cascade' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {s.source === 'cascade' ? 'CSC' : 'STD'}
                  </span>
                  <svg
                    className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            {isExpanded && (
              <div className="mt-2 pl-2 space-y-1.5">
                {s.coachFeedback && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase">Feedback</p>
                    <p className="text-xs text-gray-600 bg-gray-50 rounded p-2 leading-relaxed">
                      {s.coachFeedback}
                    </p>
                  </div>
                )}
                {s.homework && (
                  <p className="text-xs text-amber-700">
                    <span className="font-medium">HW:</span> {s.homework}
                  </p>
                )}
                {s.whatsNext && (
                  <p className="text-xs text-blue-700">
                    <span className="font-medium">Next:</span> {s.whatsNext}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-30"
          >
            Previous
          </button>
          <span className="text-xs text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return null;
  const styles: Record<string, string> = {
    mastered: 'bg-green-50 text-green-700',
    competent: 'bg-blue-50 text-blue-700',
    partial: 'bg-amber-50 text-amber-700',
    not_yet: 'bg-gray-50 text-gray-600',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${styles[status] || 'bg-gray-50 text-gray-600'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
