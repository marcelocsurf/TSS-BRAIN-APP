// Minimal service worker for TSS BRAIN PWA.
// Network-first for HTML (so portal content stays fresh), cache-first for
// static assets (icons, fonts) once the app has been opened.

const CACHE_NAME = 'tss-brain-v1';
const STATIC_ASSETS = [
  '/',
  '/tss-logo-white.png',
  '/tss-logo-color.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Network-first for navigations + HTML.
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then((r) => r || caches.match('/'))),
    );
    return;
  }

  // Cache-first for static assets we've stored.
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request)),
  );
});
