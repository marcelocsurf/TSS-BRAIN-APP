// Concentric rings — the spiral / golden-ratio motif, tinted per belt color.
// Used as the level indicator across the student course + sequence views.
export function ConcentricRings({ color, size = 26 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} aria-hidden="true" className="flex-shrink-0">
      <circle cx="12" cy="12" r="10" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="6.2" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="2.6" fill={color} stroke="none" />
    </svg>
  );
}
