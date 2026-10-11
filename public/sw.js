// Minimal service worker: only here to satisfy PWA installability.
// Never caches /api/* or the HTML shell — task/schedule data must always come from the network.
const STATIC_CACHE = 'st-static-v1';
const STATIC_ASSETS = ['./icon-192.png', './icon-512.png', './manifest.json'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(STATIC_CACHE).then((c) => c.addAll(STATIC_ASSETS)).catch(() => {}));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return; // always network, never cached
  if (!STATIC_ASSETS.some((a) => url.pathname.endsWith(a.replace('./', '/')))) return;
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
