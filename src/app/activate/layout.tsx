import type { ReactNode } from 'react';

export default function ActivateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Minimal header */}
      <header className="py-5 flex justify-center border-b border-gray-100 bg-white">
        <span
          className="text-xl font-bold tracking-tight"
          style={{ color: 'var(--tss-navy, #0d2240)' }}
        >
          TSS <span style={{ color: 'var(--tss-cyan, #00c2e0)' }}>·</span> Surf Academy
        </span>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="py-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} TSS Surf Academy. All rights reserved.
      </footer>
    </div>
  );
}
