// ════════════════════════════════════════════════════════
//  Ethio Shop — Service Worker
//
//  UPDATE FLOW:
//    1. SW_VERSION ሲቀይሩ → browser አዲስ SW ያወርዳል
//    2. updatefound → index.html ውስጥ VERSION_KEY ይጥፋል
//    3. Version gate ወዲያው ይከፈታል — ምርቶቹ ይዘጋሉ
//    4. ተጠቃሚ "ዝማኔ አድርግ" ቁልፍ ሲጫን → PURGE + SKIP_WAITING + hard reload
//    5. ዝማኔ ካደረጉ በኋላ VERSION_KEY ይቀመጣልና gate ይከፈታል
//
//  ⚠️  APP_VERSION (shop-test.html) ና SW_VERSION ሁልጊዜ ተመሳሳይ ይሁኑ
// ════════════════════════════════════════════════════════

const SW_VERSION  = 'v8';                        // ← shop-test.html APP_VERSION ጋር ተዛምዶ
const CACHE_NAME  = `ethio-shop-${SW_VERSION}`;

const SHELL_FILES = [
  './manifest.json',
  './icon.png'
  // index.html / shop-test.html — network-only ስለሆነ pre-cache አያስፈልግም
];

// ── Bypass domains — never cache these ───────────────────────────────────
const BYPASS_DOMAINS = [
  'firebase', 'firestore', 'googleapis', 'gstatic',
  'cdnjs', 'tailwindcss', 'fontawesome', 'unsplash',
  'cloudinary', 'imgur', 'telegram', 'api.anthropic'
];

// ── Install ───────────────────────────────────────────────────────────────
self.addEventListener('install', e => {
  console.log(`[SW ${SW_VERSION}] install`);
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_FILES).catch(err =>
        console.warn('[SW] Cache addAll failed:', err)
      ))
    // skipWaiting አይደለም — SKIP_WAITING message ሲመጣ ብቻ
  );
});

// ── Purge every cache bucket (HTML + shell) ───────────────────────────────
function purgeAllCaches() {
  return caches.keys().then(keys =>
    Promise.all(keys.map(k => {
      console.log('[SW] cache ሰረዘ:', k);
      return caches.delete(k);
    }))
  );
}

// ── Activate: አሮጌ cache ሙሉ ሰርዝ → claim → shell ብቻ እንደገና ጨምር ─────────
self.addEventListener('activate', e => {
  console.log(`[SW ${SW_VERSION}] activate`);
  e.waitUntil(
    purgeAllCaches()
      .then(() => caches.open(CACHE_NAME))
      .then(cache => cache.addAll(SHELL_FILES).catch(err =>
        console.warn('[SW] shell re-cache failed:', err)
      ))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ includeUncontrolled: true }))
      .then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SW_ACTIVATED', version: SW_VERSION });
        });
      })
  );
});

// ── Message handler ───────────────────────────────────────────────────────
self.addEventListener('message', e => {
  if (!e.data) return;
  if (e.data.type === 'SKIP_WAITING') {
    console.log('[SW] SKIP_WAITING → purge + skipWaiting');
    e.waitUntil(
      purgeAllCaches()
        .then(() => self.skipWaiting())
    );
  }
  if (e.data.type === 'PURGE_CACHES') {
    e.waitUntil(purgeAllCaches());
  }
});

// ── Fetch ─────────────────────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // 1. Bypass: CDN / Firebase / external APIs
  if (BYPASS_DOMAINS.some(d => url.includes(d))) return;

  // 2. Bypass: version-check polling requests
  if (url.includes('_vcheck=')) return;

  // 3. HTML navigation — ሁልጊዜ ከኔትወርክ (no-store)
  if (
    e.request.mode === 'navigate' ||
    url.endsWith('index.html') ||
    url.endsWith('shop-test.html') ||
    url.endsWith('/')
  ) {
    e.respondWith(networkFirstHtml(e.request));
    return;
  }

  // 4. Cache-first: manifest, icon, static shell
  e.respondWith(cacheFirstWithNetwork(e.request));
});

// ── HTML: ሁልጊዜ ከኔትወርክ (no-store) — cache አይቀመጥም ───────────────────────
async function networkFirstHtml(request) {
  try {
    return await fetch(request, { cache: 'no-store' });
  } catch (err) {
    console.warn('[SW] network failed, serving cached HTML (offline only)');
    const cached = await caches.match(request);
    return cached || new Response(
      `<html><body style="font-family:sans-serif;text-align:center;padding:2rem;">
        <h2>📶 ኢንተርኔት የለም</h2>
        <p>እንደገና ለመሞከር ገጹን አድሱ።</p>
        <button onclick="location.reload()" style="padding:10px 24px;background:#f59e0b;border:none;border-radius:12px;font-weight:900;font-size:14px;cursor:pointer;">↺ አድስ</button>
      </body></html>`,
      { status: 503, headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// ── Cache-first for static assets ────────────────────────────────────────
async function cacheFirstWithNetwork(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // navigate fallback → offline page
    if (request.mode === 'navigate') {
      const cachedHtml = await caches.match('./index.html')
                      || await caches.match('./shop-test.html');
      if (cachedHtml) return cachedHtml;
    }
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}
