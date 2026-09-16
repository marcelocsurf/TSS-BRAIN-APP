'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { actAsAcademy } from '@/lib/actions/auth';
import { Globe, Eye } from 'lucide-react';

interface AcademyOption {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  academies: AcademyOption[];
  currentActAsId: string | null;
}

// M7+ — Dropdown switcher visible only to platform admin. Lets Marcelo
// jump between academies (or back to "Platform admin · See all") from
// the sidebar without going to /academies first.
export function AcademySwitcher({ academies, currentActAsId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const switchTo = (id: string | null) => {
    startTransition(async () => {
      try {
        await actAsAcademy(id);
        setOpen(false);
        router.refresh();
      } catch (e: any) {
        alert(e.message || 'Failed to switch');
      }
    });
  };

  const current = currentActAsId
    ? academies.find((a) => a.id === currentActAsId)
    : null;

  return (
    <div ref={ref} className="relative px-3 py-2 border-b border-white/10">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-[11px] hover:bg-[#F7F9FA]/5 transition-colors"
      >
        <span className="flex flex-col items-start min-w-0">
          <span className="text-[9px] uppercase tracking-wider text-white/40 font-mono">
            Viewing
          </span>
          <span className="text-white/90 truncate text-left max-w-[140px] inline-flex items-center gap-1.5">
            {current ? (
              <>
                <Eye size={11} strokeWidth={2} />
                {current.name}
              </>
            ) : (
              'Platform · all academies'
            )}
          </span>
        </span>
        <span className="text-white/40 shrink-0">▾</span>
      </button>

      {open && (
        <div className="absolute left-3 right-3 top-full mt-1 bg-[#F7F9FA] text-[var(--tss-navy)] rounded-lg shadow-2xl border border-[#DCD7C6] z-50 overflow-hidden">
          <button
            type="button"
            onClick={() => switchTo(null)}
            disabled={pending}
            className={`w-full text-left px-3 py-2 text-xs hover:bg-[#F7F9FA] ${!currentActAsId ? 'font-bold' : ''}`}
          >
            <span className="inline-flex items-center gap-1.5">
              <Globe size={12} strokeWidth={1.75} />
              Platform admin
            </span>
            <span className="block text-[10px] text-[#55666E]">See all academies</span>
          </button>

          <div className="border-t border-[#DCD7C6]" />

          <div className="max-h-64 overflow-y-auto">
            {academies.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => switchTo(a.id)}
                disabled={pending}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-[#F7F9FA] ${
                  currentActAsId === a.id ? 'font-bold bg-amber-50' : ''
                }`}
              >
                <span className="block">{a.name}</span>
                <span className="block text-[10px] text-[#55666E] font-mono">{a.slug}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-[#DCD7C6]" />
          <Link
            href="/academies"
            onClick={() => setOpen(false)}
            className="block px-3 py-2 text-[11px] text-center text-[var(--tss-navy)] hover:bg-[#F7F9FA] font-semibold"
          >
            Manage academies →
          </Link>
        </div>
      )}
    </div>
  );
}
