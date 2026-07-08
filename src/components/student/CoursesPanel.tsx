'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { COURSES } from '@/lib/constants/courses';
import {
  grantCourseToStudent,
  revokeCourseGrant,
  type CourseGrantRow,
  type GrantSource,
} from '@/lib/actions/course-grants';

interface Props {
  studentId: string;
  grants: CourseGrantRow[];
  pendingCourses: string[];
  intakeComplete: boolean;
  canManage: boolean;
  /** True when the current viewer is the platform admin (Marcelo). */
  isPlatformAdmin?: boolean;
  /** True when the student has no academy_id (TSS direct purchase). */
  isDirectPurchase?: boolean;
}

function courseLabel(key: string) {
  return COURSES.find((c) => c.key === key)?.label ?? key;
}

const SOURCE_LABELS: Record<string, string> = {
  manual: 'Manual',
  auto_on_intake: 'Auto (intake)',
  auto_on_camp_enrol: 'Auto (camp)',
  direct_purchase: 'Direct (TSS)',
  override: 'Override',
};

export function CoursesPanel({
  studentId,
  grants,
  pendingCourses,
  intakeComplete,
  canManage,
  isPlatformAdmin = false,
  isDirectPurchase = false,
}: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [override, setOverride] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  const activeGrants = grants.filter((g) => !g.revoked_at);
  const revokedGrants = grants.filter((g) => g.revoked_at);
  const grantedKeys = new Set(activeGrants.map((g) => g.course_key));
  const grantable = COURSES.filter((c) => !grantedKeys.has(c.key));

  const handleGrant = async () => {
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      // For TSS-direct purchases, the source itself bypasses the waiver
      // gate AND keeps the grant unbillable to any academy. For
      // regular academy grants the admin can also tick "Override".
      const source: GrantSource = isDirectPurchase ? 'direct_purchase' : 'manual';
      const res = await grantCourseToStudent(studentId, selected, source, {
        override: override && isPlatformAdmin,
      });
      if (!res.ok) {
        setError(res.error || 'Failed to grant course.');
      } else {
        setSelected('');
        setOverride(false);
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to grant course.');
    } finally {
      setBusy(false);
    }
  };

  const handleRevoke = async (grantId: string) => {
    if (!confirm('Revoke this course? The student will lose access immediately. The audit record is kept.')) {
      return;
    }
    setRevoking(grantId);
    setError('');
    try {
      const res = await revokeCourseGrant(grantId);
      if (!res.ok) {
        setError(res.error || 'Failed to revoke.');
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to revoke.');
    } finally {
      setRevoking(null);
    }
  };

  // Pending courses that aren't already granted.
  const visiblePending = pendingCourses.filter((k) => !grantedKeys.has(k));

  const grantDisabled =
    busy ||
    !selected ||
    (!intakeComplete && !override && !isDirectPurchase);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--tss-navy)]">Courses</h3>
        {isDirectPurchase && (
          <span
            className="text-[9px] uppercase tracking-wider bg-[var(--tss-cyan,#5AC3E7)]/15 text-[var(--tss-navy)] px-2 py-0.5 rounded-full font-semibold"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            The Surf Sequence Direct
          </span>
        )}
      </div>
      <div className="px-4 py-3 space-y-3">
        {/* Active granted courses */}
        {activeGrants.length > 0 ? (
          <div className="space-y-1.5">
            {activeGrants.map((g) => (
              <div key={g.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-green-600 text-base shrink-0">&#10003;</span>
                  <span className="text-sm text-[var(--tss-navy)] font-medium truncate">
                    {courseLabel(g.course_key)}
                  </span>
                  <span
                    className="text-[9px] uppercase tracking-wider text-gray-400 shrink-0"
                    style={{ fontFamily: 'DM Mono, monospace' }}
                  >
                    {SOURCE_LABELS[g.source] ?? g.source}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400">
                    {new Date(g.granted_at).toLocaleDateString()}
                  </span>
                  {isPlatformAdmin && (
                    <button
                      type="button"
                      onClick={() => handleRevoke(g.id)}
                      disabled={revoking === g.id}
                      className="text-[10px] text-red-500 hover:text-red-700 uppercase tracking-wider font-mono disabled:opacity-50"
                    >
                      {revoking === g.id ? '…' : 'Revoke'}
                    </button>
                  )}
                </div>
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

        {/* Revoked history — shown only to admin for context */}
        {isPlatformAdmin && revokedGrants.length > 0 && (
          <div className="space-y-1 border-t border-gray-50 pt-3">
            <p
              className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider"
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              Revoked (audit trail)
            </p>
            {revokedGrants.map((g) => (
              <div key={g.id} className="flex items-center justify-between gap-3 opacity-60">
                <span className="text-xs text-gray-500 line-through">
                  {courseLabel(g.course_key)}
                </span>
                <span className="text-[10px] text-gray-400">
                  revoked {g.revoked_at ? new Date(g.revoked_at).toLocaleDateString() : ''}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Grant a course (coordinator/admin only) */}
        {canManage && grantable.length > 0 && (
          <div className="border-t border-gray-50 pt-3 space-y-2">
            <p
              className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider"
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              Grant a course
            </p>
            <div className="flex gap-2">
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                disabled={busy}
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
                disabled={grantDisabled}
                className="px-4 py-2 bg-[var(--tss-navy)] text-white rounded-xl text-sm font-semibold hover:brightness-110 disabled:opacity-50 transition-all"
              >
                {busy ? 'Granting…' : 'Grant'}
              </button>
            </div>

            {/* Override toggle — only the platform admin sees it. */}
            {isPlatformAdmin && !isDirectPurchase && !intakeComplete && (
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={override}
                  onChange={(e) => setOverride(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span>
                  <strong>Override</strong> — grant without intake+waiver
                  (logged as source <code className="text-[10px]">override</code>)
                </span>
              </label>
            )}

            {!intakeComplete && !override && !isDirectPurchase && (
              <p className="text-[10px] text-amber-600">
                Student must finish intake + waiver first.
              </p>
            )}
            {isDirectPurchase && (
              <p className="text-[10px] text-[var(--tss-cyan,#5AC3E7)]">
                The Surf Sequence Direct — no academy invoiced. Source: <code>direct_purchase</code>.
              </p>
            )}
            {error && <p className="text-xs text-[var(--tss-danger)]">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
