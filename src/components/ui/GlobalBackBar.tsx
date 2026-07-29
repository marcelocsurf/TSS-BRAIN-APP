'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

// Barra de flujo global del dashboard: "← Volver" + "Inicio" en toda página
// PROFUNDA (2+ segmentos: /students/xxx, /camps/xxx, /sessions/new, …).
// Las páginas de primer nivel ya tienen el sidebar como retorno — ahí no
// aparece, para no meter ruido. Cubre páginas presentes y futuras sin tocar
// cada una.
export function GlobalBackBar() {
  const pathname = usePathname();
  const router = useRouter();
  const segments = (pathname || '/').split('/').filter(Boolean);
  if (segments.length < 2) return null;
  if (pathname === '/dashboard') return null;

  const back = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push('/dashboard');
  };

  return (
    <div className="flex items-center gap-2 mb-4 -mt-1">
      <button
        type="button"
        onClick={back}
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-[var(--tss-cyan,#5AC3E7)] hover:text-[var(--tss-navy)] transition-colors"
      >
        <ArrowLeft size={13} strokeWidth={2.25} /> Volver
      </button>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-[var(--tss-cyan,#5AC3E7)] hover:text-[var(--tss-navy)] transition-colors"
      >
        <Home size={13} strokeWidth={2.25} /> Inicio
      </Link>
    </div>
  );
}
