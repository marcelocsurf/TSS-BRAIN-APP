// ═══ La barra de abajo de las páginas sueltas del alumno ═══
// (secuencia, Tres Círculos, Infinite Circle). Marca la pestaña desde la que
// llegó el alumno, no siempre "Course" (Marcelo 2026-10-01: continuidad).
import { Icon } from './Icon';

const INK = '#10263B';
const CYAN = '#00D2FF';
const ITEM = 'relative flex flex-col items-center justify-center gap-1 min-h-[68px] text-[11px] font-bold uppercase no-underline';

export type PortalNavTab = 'home' | 'course' | 'sequence';

export function PortalBottomNav({ portal, active = 'course' }: { portal: string; active?: PortalNavTab }) {
  const items: { key: PortalNavTab; label: string; icon: 'home' | 'course' | 'play' }[] = [
    { key: 'home', label: 'Home', icon: 'home' },
    { key: 'course', label: 'Course', icon: 'course' },
    { key: 'sequence', label: "Let's Play", icon: 'play' },
  ];
  return (
    <nav className="tss-bottom-nav" aria-label="Main navigation"><div className="tss-bottom-nav-inner">
      {items.map((it) => {
        const on = it.key === active;
        return (
          <a key={it.key} href={`${portal}?tab=${it.key}`} aria-current={on ? 'page' : undefined} className={ITEM} style={{ color: INK, letterSpacing: '0.055em' }}>
            {on ? <span style={{ color: CYAN }}><Icon name={it.icon} /></span> : <Icon name={it.icon} />}
            {it.label}
            {on && <span className="absolute bottom-[5px] w-[72%] h-1 rounded-full" style={{ background: CYAN }} />}
          </a>
        );
      })}
    </div></nav>
  );
}
