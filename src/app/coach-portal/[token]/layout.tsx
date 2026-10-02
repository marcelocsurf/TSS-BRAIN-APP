// Sin diseño propio: solo existe para que el not-found.tsx de este segmento
// atrape los notFound() de /seq, /teach, /circles, /loop, /course y /tools.
// En Next 14 un not-found de un segmento dinámico sin layout no se usa y caía
// en el 404 del ALUMNO ("Email me my portal link") (2026-10-01).
export default function CoachPortalTokenLayout({ children }: { children: React.ReactNode }) {
  return children;
}
