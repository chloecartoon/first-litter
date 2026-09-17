// Snoopy app service worker — offline cache
// Bump version whenever HTML changes to force re-install + cache purge
const CACHE_NAME = 'first-litter-v4';
const CORE_ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'assets/snoopy/snoopy-happy-cut.png',
  'assets/snoopy/snoopy-curious-cut.png',
  'assets/snoopy/snoopy-sleepy-cut.png',
  'assets/snoopy/snoopy-excited-cut.png',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c =>
      Promise.all(CORE_ASSETS.map(url =>
        c.add(url).catch(err => console.warn('cache add failed:', url, err))
      ))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Only handle same-origin GETs
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  // Network-first for HTML + manifest so updates land fast
  const isHtml = url.pathname === '/' ||
    url.pathname.endsWith('/index.html') ||
    url.pathname.endsWith('index.html') ||
    url.pathname.endsWith('/app.html') ||
    url.pathname.endsWith('app.html');
  if (isHtml || url.pathname.endsWith('/manifest.json')) {
    e.respondWith(
      fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
        return resp;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for everything else (icons, snoopy PNGs)
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(resp => {
        if (resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
        }
        return resp;
      }).catch(() => cached)
    )
  );
});
