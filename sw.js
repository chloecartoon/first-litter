// Snoopy app service worker — offline cache
// Bump version whenever HTML changes to force re-install + cache purge
const CACHE_NAME = 'first-litter-v16';
const CORE_ASSETS = [
  './',
  'index.html',
  'app.html',
  'manifest.json',
  'js/state.js',
  'js/care-plan.js',
  'js/tasks.js',
  'js/backups.js',
  'js/notifications.js',
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

self.addEventListener('push', event => {
  let count = 1;
  try {
    const data = event.data ? event.data.json() : {};
    count = Math.max(1, Number(data.count) || 1);
  } catch (_) { /* use the privacy-safe default */ }
  const body = count === 1
    ? '1 important care task needs your attention today.'
    : `${count} important care tasks need your attention today.`;
  event.waitUntil(self.registration.showNotification('First Litter', {
    body,
    tag: 'first-litter-important-care',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    data: { url: 'app.html?open=today' }
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil((async () => {
    const openClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of openClients) {
      if ('focus' in client) {
        client.postMessage({ type: 'OPEN_TODAY' });
        return client.focus();
      }
    }
    return self.clients.openWindow('app.html?open=today');
  })());
});
