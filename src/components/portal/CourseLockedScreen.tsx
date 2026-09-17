// Pantalla de candado (server-safe): el curso ya es del alumno pero se abre
// un día antes de su camp. Se ve qué incluye, no se puede entrar todavía.
import { formatUnlockDate } from '@/lib/portal/course-lock';

export function CourseLockedScreen({ token, unlocksOn, campName, what }: { token: string; unlocksOn: string; campName: string | null; what: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ background: '#061C2B' }}>
      <div className="w-full max-w-md rounded-lg p-6" style={{ background: '#0A2532', border: '1px solid rgba(0,210,255,.35)' }}>
        <p className="text-[12px] font-mono uppercase tracking-[0.16em]" style={{ color: '#00D2FF' }}>Locked until your camp</p>
        <h1 className="mt-2 text-[28px] leading-[1.05] font-black uppercase" style={{ fontFamily: 'var(--font-archivo), Archivo, sans-serif', color: '#F7F9FA' }}>{what}</h1>
        <p className="mt-3 text-[15px] leading-snug" style={{ color: 'rgba(247,249,250,.85)' }}>
          This is part of your course and it opens on <strong style={{ color: '#F7F9FA' }}>{formatUnlockDate(unlocksOn)}</strong>, one day before {campName ? `your ${campName}` : 'your camp'}.
        </p>
        <p className="mt-2 text-[14px] leading-snug" style={{ color: 'rgba(247,249,250,.7)' }}>Until then, work through the Pre-Course: it is what your camp builds on.</p>
        <a href={`/portal/${token}?tab=course`} className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-[5px] text-[14px] font-black uppercase no-underline" style={{ background: '#00D2FF', color: '#061C2B', fontFamily: 'var(--font-archivo), Archivo, sans-serif' }}>Back to your Pre-Course</a>
      </div>
    </div>
  );
}
