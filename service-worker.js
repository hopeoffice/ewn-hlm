const SW_VERSION = 'v2';
const CACHE_NAME = `ewn-hlm-${SW_VERSION}`;
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/products.json',
  '/manifest.json'
];

// Install: cache core assets, do NOT skipWaiting yet (wait for user confirmation)
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  // Don't call skipWaiting here — wait for 'SKIP_WAITING' message from UI
});

// Activate: wipe ALL old caches, then claim clients immediately
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Message: 'SKIP_WAITING' sent by "Update Now" button → take over immediately
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
