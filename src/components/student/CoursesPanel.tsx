'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { COURSES } from '@/lib/constants/courses';
import { grantCourseToStudent, type CourseGrantRow } from '@/lib/actions/course-grants';

interface Props {
  studentId: string;
  grants: CourseGrantRow[];
  pendingCourses: string[];
  intakeComplete: boolean;
  canManage: boolean;
}

function courseLabel(key: string) {
  return COURSES.find((c) => c.key === key)?.label ?? key;
}

export function CoursesPanel({
  studentId,
  grants,
  pendingCourses,
  intakeComplete,
  canManage,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const grantedKeys = new Set(grants.map((g) => g.course_key));
  const grantable = COURSES.filter((c) => !grantedKeys.has(c.key));

  const handleGrant = async () => {
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      const res = await grantCourseToStudent(studentId, selected, 'manual');
      if (!res.ok) {
        setError(res.error || 'Failed to grant course.');
      } else {
        setSelected('');
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to grant course.');
    } finally {
      setBusy(false);
    }
  };

  // Pending courses that aren't already granted.
  const visiblePending = pendingCourses.filter((k) => !grantedKeys.has(k));

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50">
        <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Courses</h3>
      </div>
      <div className="px-4 py-3 space-y-3">
        {/* Granted courses */}
        {grants.length > 0 ? (
          <div className="space-y-1.5">
            {grants.map((g) => (
              <div key={g.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-base">&#10003;</span>
                  <span className="text-sm text-[var(--tss-navy)] font-medium">
                    {courseLabel(g.course_key)}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(g.granted_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">No courses granted yet.</p>
        )}

        {/* Pending (earmarked) courses */}
        {visiblePending.length > 0 && (
          <div className="space-y-1.5 border-t border-gray-50 pt-3">
            {visiblePending.map((k) => (
              <div key={k} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 text-base">&#9203;</span>
                  <span className="text-sm text-gray-500">{courseLabel(k)}</span>
                </div>
                <span className="text-[10px] text-amber-600">
                  Pending — activates after intake + waiver
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Grant a course (coordinator/admin only) */}
        {canManage && grantable.length > 0 && (
          <div className="border-t border-gray-50 pt-3 space-y-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase">
              Grant a course
            </p>
            <div className="flex gap-2">
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                disabled={!intakeComplete || busy}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-cyan)] disabled:opacity-50"
              >
                <option value="">Select a course…</option>
                {grantable.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleGrant}
                disabled={!intakeComplete || busy || !selected}
                className="px-4 py-2 bg-[var(--tss-navy)] text-white rounded-xl text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition-all"
              >
                {busy ? 'Granting…' : 'Grant'}
              </button>
            </div>
            {!intakeComplete && (
              <p className="text-[10px] text-amber-600">
                Student must finish intake + waiver first.
              </p>
            )}
            {error && <p className="text-xs text-[var(--tss-danger)]">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
