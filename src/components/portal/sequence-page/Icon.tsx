// Los íconos de la barra de las páginas sueltas (mismos trazos que SequencePage).
export function Icon({ name }: { name: 'home' | 'course' | 'play' }) {
  const p: Record<string, React.ReactNode> = {
    home: <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
    course: <><path d="M2 8.5 12 4l10 4.5-10 4.5z" /><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" /></>,
    play: <path d="M7 4.5v15l12-7.5z" />,
  };
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{p[name]}</svg>;
}
