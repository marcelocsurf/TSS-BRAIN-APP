import { listStudents } from '@/lib/actions/students';
import { BELT_DISPLAY, BELT_HIERARCHY, type BeltLevel } from '@/lib/constants/belts';
import Link from 'next/link';
import { StudentSearch } from './student-search';

interface Props {
  searchParams: Promise<{ belt?: string; status?: string; q?: string; page?: string }>;
}

export default async function StudentRosterPage({ searchParams }: Props) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || '1', 10));
  const limit = 20;

  const { students, total } = await listStudents({
    belt_level: params.belt as BeltLevel | undefined,
    status: params.status || 'active',
    search: params.q,
    page: currentPage,
    limit,
  });

  const totalPages = Math.ceil(total / limit);

  // Build base URL for pagination links preserving current filters
  const buildPageUrl = (page: number) => {
    const p = new URLSearchParams();
    if (params.belt) p.set('belt', params.belt);
    if (params.status) p.set('status', params.status);
    if (params.q) p.set('q', params.q);
    p.set('page', String(page));
    return `/students?${p.toString()}`;
  };

  // Build filter URL preserving search but resetting page
  const buildFilterUrl = (belt?: string) => {
    const p = new URLSearchParams();
    if (belt) p.set('belt', belt);
    if (params.q) p.set('q', params.q);
    return `/students${p.toString() ? '?' + p.toString() : ''}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--tss-navy)]">Students</h2>
          <p className="text-xs text-[var(--tss-gray-500)] mt-0.5" style={{ fontFamily: 'var(--font-mono)' }}>{total} student{total !== 1 ? 's' : ''} total</p>
        </div>
        <Link
          href="/students/new"
          className="px-4 py-2.5 bg-[var(--tss-navy)] text-white text-sm font-medium rounded-xl hover:brightness-110 transition-all shadow-sm"
        >
          + Add Student
        </Link>
      </div>

      {/* Belt filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        <FilterLink href={buildFilterUrl()} label="All" active={!params.belt} />
        {BELT_HIERARCHY.map((belt) => (
          <FilterLink
            key={belt}
            href={buildFilterUrl(belt)}
            label={BELT_DISPLAY[belt].levelName}
            active={params.belt === belt}
            color={BELT_DISPLAY[belt].color}
          />
        ))}
      </div>

      {/* Search with debounce */}
      <StudentSearch
        defaultValue={params.q || ''}
        belt={params.belt}
        status={params.status}
      />

      {/* Student list */}
      {students.length === 0 ? (
        <div className="text-center py-12 text-[var(--tss-gray-500)]">
          <p className="text-lg">No students found</p>
          <Link href="/students/new" className="text-sm text-[var(--tss-cyan)] hover:underline mt-2 inline-block">
            Add your first student
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {students.map((s) => (
            <Link
              key={s.id}
              href={`/students/${s.id}`}
              className="flex items-center gap-3 bg-white rounded-xl p-3 border border-[var(--tss-gray-100)] hover:border-[var(--tss-gray-300)] hover:shadow-sm transition-all"
              style={{ borderLeftWidth: '3px', borderLeftColor: BELT_DISPLAY[s.belt_level]?.color || '#C8D0DC' }}
            >
              {/* Photo or initials */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: BELT_DISPLAY[s.belt_level]?.color || '#999' }}
              >
                {s.photo_url ? (
                  <img src={s.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  `${s.first_name[0]}${s.last_name[0]}`
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--tss-gray-900)] truncate">
                  {s.first_name} {s.last_name}
                </p>
                <p className="text-xs text-[var(--tss-gray-500)]">
                  {BELT_DISPLAY[s.belt_level]?.en} — Seq {s.current_sequence_number} / Step {s.current_step_order}
                </p>
              </div>

              {/* Badges & indicators */}
              <div className="text-right shrink-0 flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5">
                  {/* Waiver status badge */}
                  {s.waiver_signed ? (
                    <span className="text-[10px] bg-green-50 text-[var(--tss-success)] px-1.5 py-0.5 rounded-full" title="Waiver signed">
                      &#10003;
                    </span>
                  ) : (
                    <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full" title="Waiver not signed">
                      &#9888;
                    </span>
                  )}
                  {/* Intake tier badge */}
                  {s.intake_tier && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      s.intake_tier === 'extended'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-[var(--tss-gray-50)] text-[var(--tss-gray-500)]'
                    }`}>
                      {s.intake_tier === 'extended' ? 'Full' : 'Basic'}
                    </span>
                  )}
                </div>
                {!s.intake_completed_at && !s.intake_tier && (
                  <span className="text-[10px] bg-orange-50 text-[var(--tss-warm)] px-2 py-0.5 rounded-full">
                    No profile
                  </span>
                )}
                {s.last_session_date ? (
                  <p className="text-[10px] text-[var(--tss-gray-500)]">
                    {new Date(s.last_session_date).toLocaleDateString()}
                  </p>
                ) : (
                  <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                    No sessions
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--tss-gray-100)]">
          <p className="text-xs text-[var(--tss-gray-500)]" style={{ fontFamily: 'var(--font-mono)' }}>
            Page {currentPage} of {totalPages} ({total} students)
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link
                href={buildPageUrl(currentPage - 1)}
                className="px-4 py-2 text-xs border border-[var(--tss-gray-200)] rounded-xl bg-white text-[var(--tss-gray-700)] hover:border-[var(--tss-gray-300)] transition-all"
              >
                Previous
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={buildPageUrl(currentPage + 1)}
                className="px-4 py-2 text-xs bg-[var(--tss-navy)] text-white rounded-xl hover:brightness-110 transition-all"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FilterLink({ href, label, active, color }: {
  href: string; label: string; active: boolean; color?: string;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
        active
          ? 'text-white border-transparent shadow-sm'
          : 'bg-white text-[var(--tss-gray-700)] border-[var(--tss-gray-200)] hover:border-[var(--tss-gray-300)]'
      }`}
      style={active ? { backgroundColor: color || 'var(--tss-navy)', borderColor: color || 'var(--tss-navy)' } : undefined}
    >
      {color && !active && (
        <span
          className="inline-block w-2 h-2 rounded-full mr-1.5"
          style={{ backgroundColor: color }}
        />
      )}
      {label}
    </Link>
  );
}
