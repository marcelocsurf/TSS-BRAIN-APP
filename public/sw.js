// Minimal service worker for TSS BRAIN PWA.
// Network-first for HTML (so portal content stays fresh), cache-first for
// static assets (icons, fonts) once the app has been opened.

const CACHE_NAME = 'tss-brain-v2';
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

  const url = new URL(request.url);

  // Network-first for navigations, HTML, AND Next.js build assets — so a new
  // deploy is picked up immediately instead of serving a stale cached app shell
  // (this is what made code fixes appear "not deployed" on installed devices).
  if (
    request.mode === 'navigate' ||
    request.headers.get('accept')?.includes('text/html') ||
    url.pathname.startsWith('/_next/')
  ) {
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
