// Extracted from /camps/page.tsx and /camps/[id]/page.tsx so the
// calendar (and any future surface) can render the same chip without
// duplicating the style map.

export function CampStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    planned: 'bg-[var(--tss-cyan,#5AC3E7)]/15 text-[var(--tss-navy)]',
    active: 'bg-emerald-50 text-emerald-700',
    completed: 'bg-gray-100 text-gray-700',
    draft: 'bg-gray-50 text-gray-500',
    cancelled: 'bg-red-50 text-red-600',
  };
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold shrink-0 ${
        styles[status] || 'bg-gray-50'
      }`}
    >
      {status}
    </span>
  );
}
