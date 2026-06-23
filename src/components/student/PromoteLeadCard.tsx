'use client';

// Shown on /students/[id] when the student is still a Lead. Lets a
// coach/coordinator promote them to Member by choosing which course
// (white_belt or yellow_belt) they bought.
//
// promoteLeadToMember() seeds students.pending_courses with the chosen
// course and flips lifecycle_status to 'member'. If the student already
// signed the waiver + completed intake, the next createCampInstance
// (or a separate auto-grant pass) actually grants the course.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { promoteLeadToMember } from '@/lib/actions/leads';

interface Props {
  studentId: string;
}

export function PromoteLeadCard({ studentId }: Props) {
  const router = useRouter();
  const [course, setCourse] = useState<'white_belt' | 'yellow_belt' | 'blue_belt'>('white_belt');
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const promote = () => {
    setError('');
    startTransition(async () => {
      try {
        await promoteLeadToMember(studentId, course);
        setDone(true);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not promote.');
      }
    });
  };

  if (done) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
        <CheckCircle2 size={20} className="text-emerald-700 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-emerald-900">Promoted to Member.</p>
          <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
            Course queued. Next intake submission will auto-grant access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
      <div>
        <p className="text-sm font-semibold text-amber-900">This student is a Lead.</p>
        <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
          They can attend trial classes but don't have portal access yet. Pick which course they bought to promote them to Member.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={course}
          onChange={(e) => setCourse(e.target.value as 'white_belt' | 'yellow_belt' | 'blue_belt')}
          className="flex-1 px-3 py-2 border border-amber-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="white_belt">White Belt Masterclass</option>
          <option value="yellow_belt">Yellow Belt Masterclass</option>
          <option value="blue_belt">Blue Belt Masterclass</option>
        </select>
        <button
          type="button"
          onClick={promote}
          disabled={pending}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--tss-navy)] text-white rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          {pending ? 'Promoting…' : 'Promote'}
          <ArrowRight size={14} />
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 p-2 rounded-lg">{error}</p>
      )}
    </div>
  );
}
