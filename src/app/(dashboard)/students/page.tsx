import { listStudents } from '@/lib/actions/students';
import { BELT_DISPLAY, BELT_HIERARCHY, type BeltLevel } from '@/lib/constants/belts';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ belt?: string; status?: string; q?: string }>;
}

export default async function StudentRosterPage({ searchParams }: Props) {
  const params = await searchParams;
  const students = await listStudents({
    belt_level: params.belt as BeltLevel | undefined,
    status: params.status || 'active',
    search: params.q,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--tss-navy)]">Students</h2>
        <Link
          href="/students/new"
          className="px-4 py-2 bg-[var(--tss-navy)] text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
        >
          + Add Student
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <FilterLink href="/students" label="All" active={!params.belt} />
        {BELT_HIERARCHY.map((belt) => (
          <FilterLink
            key={belt}
            href={`/students?belt=${belt}`}
            label={BELT_DISPLAY[belt].levelName}
            active={params.belt === belt}
            color={BELT_DISPLAY[belt].color}
          />
        ))}
      </div>

      {/* Search */}
      <form className="mb-4">
        <input
          type="text"
          name="q"
          defaultValue={params.q}
          placeholder="Search by name..."
          className="w-full md:w-64 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--tss-gold)]"
        />
        {params.belt && <input type="hidden" name="belt" value={params.belt} />}
      </form>

      {/* Student list */}
      {students.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No students found</p>
          <Link href="/students/new" className="text-sm text-[var(--tss-gold)] hover:underline mt-2 inline-block">
            Add your first student
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {students.map((s) => (
            <Link
              key={s.id}
              href={`/students/${s.id}`}
              className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100 hover:border-[var(--tss-gold)] transition-colors"
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
                <p className="text-sm font-medium text-gray-900 truncate">
                  {s.first_name} {s.last_name}
                </p>
                <p className="text-xs text-gray-500">
                  {BELT_DISPLAY[s.belt_level]?.en} — Seq {s.current_sequence_number} / Step {s.current_step_order}
                </p>
              </div>

              {/* Last session indicator */}
              <div className="text-right shrink-0">
                {s.last_session_date ? (
                  <p className="text-[10px] text-gray-400">
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
    </div>
  );
}

function FilterLink({ href, label, active, color }: {
  href: string; label: string; active: boolean; color?: string;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
        active
          ? 'bg-[var(--tss-navy)] text-white border-[var(--tss-navy)]'
          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
      }`}
    >
      {color && (
        <span
          className="inline-block w-2 h-2 rounded-full mr-1.5"
          style={{ backgroundColor: color }}
        />
      )}
      {label}
    </Link>
  );
}
