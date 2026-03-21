import { getDraftSessions } from '@/lib/actions/cascade-sessions';
import { DeleteDraftButton } from '@/components/session/DeleteDraftButton';
import Link from 'next/link';

export default async function DraftsPage() {
  const drafts = await getDraftSessions();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--tss-navy)]">Draft Sessions</h2>
          <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>
            {drafts.length} draft{drafts.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <Link
          href="/sessions/new"
          className="px-4 py-2 bg-[var(--tss-navy)] text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
        >
          New Session
        </Link>
      </div>

      {drafts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-400">No draft sessions</p>
          <p className="text-xs text-gray-300 mt-1">Drafts are saved when you exit a session before completing it.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--tss-navy)] truncate">
                  {draft.student_name}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {draft.mission && (
                    <span className="text-xs text-gray-500 truncate max-w-[180px]">
                      {draft.mission}
                    </span>
                  )}
                  {draft.training_venue && (
                    <span className="text-[10px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded capitalize">
                      {draft.training_venue.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-300 mt-1">
                  {new Date(draft.created_at).toLocaleDateString()} &middot; {new Date(draft.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/sessions/new?student=${draft.student_id}&draft=${draft.id}`}
                  className="px-3 py-1.5 bg-[var(--tss-cyan)] text-white text-xs rounded-lg hover:opacity-90 transition-opacity"
                >
                  Resume
                </Link>
                <DeleteDraftButton draftId={draft.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
