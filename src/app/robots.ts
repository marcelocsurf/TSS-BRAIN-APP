import type { MetadataRoute } from 'next';

// Los portales por link no se indexan (auditoría de lanzamiento 2026-09-25):
// un link de portal pegado en un lugar público no debe terminar en Google.
// Lo público de verdad: la portada, el quiz, el sitio y las páginas legales.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/quiz', '/web', '/legal'],
        disallow: [
          '/portal', '/coach-portal', '/manager-portal', '/front-desk', '/feedback', '/experience',
          '/intake', '/respond', '/equipo', '/one-wave', '/gift', '/booking', '/join', '/my-portal',
          '/dashboard', '/api', '/manual',
        ],
      },
    ],
  };
}
