// Kaihatsu Akademi service worker — "önce ağ" stratejisi:
// İnternet varken her zaman en güncel dosyalar gelir; yokken son görülen sürüm önbellekten açılır.
const CACHE = 'kaihatsu-v1';

self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Sadece kendi dosyalarımız ve yazı tipleri önbelleğe alınır; GitHub/Claude API istekleri asla.
  const same = url.origin === self.location.origin && url.pathname.startsWith(new URL('./', self.location).pathname);
  const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!same && !fonts) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetch(req);
      if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
      return res;
    } catch {
      const hit = await cache.match(req, { ignoreSearch: url.origin === self.location.origin });
      if (hit) return hit;
      if (req.mode === 'navigate') { const idx = await cache.match('./') || await cache.match('./index.html'); if (idx) return idx; }
      throw new Error('çevrimdışı ve önbellekte yok');
    }
  })());
});
