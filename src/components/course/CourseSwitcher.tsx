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
    <div className="mx-2 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(247,249,250,.10)' }}>
      <span className="text-[10px] flex-shrink-0" style={{ fontFamily: 'var(--font-plex), IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(247,249,250,.40)' }}>
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
          className="w-full appearance-none bg-transparent text-[13px] font-bold uppercase text-white pr-6 focus:outline-none disabled:opacity-50"
          style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', fontStretch: '125%', letterSpacing: '0.02em' }}
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
