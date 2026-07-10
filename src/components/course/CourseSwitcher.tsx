'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { setActiveCourseKey } from '@/lib/actions/active-course';
import type { CourseKey } from '@/lib/constants/courses';

interface Props {
  portalToken: string;
  ownedCourses: { key: CourseKey; label: string }[];
  activeCourseKey: CourseKey;
}

export function CourseSwitcher({ portalToken, ownedCourses, activeCourseKey }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  if (ownedCourses.length < 2) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-3 py-2 flex items-center gap-2">
      <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 flex-shrink-0">
        Course
      </span>
      <div className="relative flex-1">
        <select
          value={activeCourseKey}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value as CourseKey;
            startTransition(async () => {
              try {
                await setActiveCourseKey(portalToken, next);
                router.refresh();
              } catch {
                // A failed switch must never white-screen the whole portal.
                alert('Could not switch course. Please try again.');
              }
            });
          }}
          className="w-full appearance-none bg-transparent text-sm font-semibold text-[var(--tss-navy)] pr-6 focus:outline-none disabled:opacity-50"
        >
          {ownedCourses.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--tss-cyan)] pointer-events-none"
        />
      </div>
    </div>
  );
}
