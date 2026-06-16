// Branded loading splash — shown while a route segment streams in, so the
// app reads as "loading, TSS" instead of a blank black screen.
import Image from 'next/image';

export function BrandSplash() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[var(--tss-navy)] gap-5">
      <Image
        src="/tss-logo-white.png?v=2"
        alt="The Surf Sequence"
        width={200}
        height={100}
        priority
        className="animate-pulse"
      />
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-[var(--tss-cyan)] animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-[var(--tss-cyan)] animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-[var(--tss-cyan)] animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <p className="tss-tagline text-[var(--tss-cyan)] text-sm">Evolve through play</p>
    </div>
  );
}
