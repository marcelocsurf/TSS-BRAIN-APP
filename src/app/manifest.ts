import type { MetadataRoute } from 'next';

// PWA manifest. Marcelo: drop properly sized PNG icons in /public/icons/
// when ready. For now the manifest references the existing TSS logo so the
// install still works (browsers will scale it, may look soft on large icons).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'The Surf Sequence',
    short_name: 'The Surf Sequence',
    description: 'The Surf Sequence — your structured path to mastery',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0a1628',
    theme_color: '#5AC3E7',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        // Fallback to the existing TSS color logo so the manifest validates
        // even if the icon files above aren't dropped in yet.
        src: '/tss-logo-color.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
