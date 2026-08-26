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
  // Los ASSETS de Next (/_next/*.js) van a la red, pero si la red falla NO se
  // les puede contestar con el HTML de '/': el navegador recibe "<!DOCTYPE" en
  // vez de JavaScript, tira error de sintaxis y el trozo nunca carga. Eso
  // rompía el analizador de video en la playa con señal mala — parecía que la
  // herramienta no abría. Mejor que falle limpio y Next reintente.
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(fetch(request).catch(() => caches.match(request).then((r) => r || Response.error())));
    return;
  }

  // Navegaciones y HTML sí pueden caer al shell cacheado.
  if (
    request.mode === 'navigate' ||
    request.headers.get('accept')?.includes('text/html')
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
