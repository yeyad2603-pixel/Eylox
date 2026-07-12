/* ============================================================
   EYLOX — Service Worker v1.0
   Cache-first offline strategy for full offline support
   ============================================================ */

const CACHE_NAME   = 'eylox-v1.1';
const CACHE_STATIC = 'eylox-static-v1.1';
const CACHE_FONTS  = 'eylox-fonts-v1.0';

/* ── All pages and assets to pre-cache on install ─────────── */
const CORE_PAGES = [
  'index.html',
  'events.html',
  'games.html',
  'shop.html',
  'profile.html',
  'achievements.html',
  'messages.html',
  'friends.html',
  'communities.html',
  'leaderboard.html',
  'leaderboards.html',
  'settings.html',
  'admin.html',
  'ai.html',
  'game.html',
  'game3d-city.html',
  'game3d-obby.html',
  'game3d-pirate.html',
  'game3d-treasure.html',
  'landing.html',
  'login.html',
  'help.html',
  'subscription.html',
  'eylox-studio.html',
  'live-events.html',
  'my-games.html',
  'safety.html',
  'dev-hub.html',
  'inventory.html',
  'pricing.html',
  'terms.html',
  'privacy.html',
  'refunds.html',
];

const CORE_STYLES = [
  'style.css',
  'ads.css',
  'eylox-dash.css',
  'pricing.css',
  'legal.css',
];

const DASH_SCRIPTS = [
  'eylox-dash.js',
  'admin-dashboard.js',
];

const CORE_SCRIPTS = [
  'api.js',
  'api-enhanced.js',
  'sidebar-links.js',
  'sidebar-collapse.js',
  'script.js',
  'pricing.js',
  'features.js',
  'effects.js',
  'platform-polish.js',
  'platform-enhancements.js',
  'polish.js',
  'wow.js',
  'security.js',
  'tooltip.js',
  'ads.js',
  'offline.js',
  'sw-register.js',
  'notifications.js',
  'device-compat.js',
  'graphics.js',
  'anticheat.js',
  'ranked.js',
  'ai-builder.js',
  'world-engine.js',
  'live-events.js',
  'creator-economy.js',
  'game-rewards.js',
  'tutorial-robot.js',
  'quick-access.js',
  'missions.js',
  'daily-rewards.js',
  'daily-challenge.js',
  'spin-wheel.js',
  'live-feed.js',
  'today-stats.js',
  'game-hub.js',
  'gaming-fortune.js',
  'thumbnails.js',
  'admin-button.js',
  'custom-games.js',
  'recently-played.js',
  'friends-local.js',
  'game-ratings.js',
  'pro-tips.js',
  'heatmap.js',
  'floating-dock.js',
  'achievement-popup.js',
  'messages-local.js',
  'seasonal-events.js',
  'theme-switcher.js',
  'game-stats.js',
  'streak-calendar.js',
  'quick-challenge.js',
  'player-card.js',
  'combo-meter.js',
  'xp-events.js',
  'user-persist.js',
  'level-badge.js',
  'coin-boost.js',
  'settings.js',
  'sound.js',
  'i18n.js',
  'party-system.js',
  'globalchat.js',
  'owner-theme.js',
  'session-tracker.js',
  'world-plaza.js',
  'premium.js',
  'creator-pass.js',
  'verification.js',
  'moderation.js',
  'emotes.js',
  'squad-system.js',
  'meta-universe.js',
  'ai-npc.js',
];

const ALL_ASSETS = [...CORE_PAGES, ...CORE_STYLES, ...CORE_SCRIPTS, ...DASH_SCRIPTS];

/* ── Install: pre-cache everything ───────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        /* Add files one-by-one so a single missing file won't abort */
        return Promise.allSettled(
          ALL_ASSETS.map(path =>
            cache.add(path).catch(() => { /* skip missing files */ })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: clean old caches and claim all clients ─────── */
self.addEventListener('activate', event => {
  const VALID = [CACHE_NAME, CACHE_STATIC, CACHE_FONTS];
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(k => !VALID.includes(k))
            .map(k => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ── Fetch: intercept all network requests ─────────────────── */
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  /* Skip localhost API calls — let them fail naturally so
     offline.js can substitute local data */
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return;
  }

  /* Skip non-GET requests (POST, PUT, DELETE) */
  if (req.method !== 'GET') return;

  /* ── Google Fonts — stale-while-revalidate ── */
  if (url.hostname === 'fonts.googleapis.com' ||
      url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(req, CACHE_FONTS));
    return;
  }

  /* ── Navigation requests (HTML pages) — network-first ── */
  if (req.mode === 'navigate') {
    event.respondWith(networkFirstWithCacheFallback(req));
    return;
  }

  /* ── All other static assets — cache-first ── */
  event.respondWith(cacheFirstWithNetworkFallback(req));
});

/* ── Strategy: network-first, fall back to cache ─────────── */
async function networkFirstWithCacheFallback(req) {
  try {
    const networkRes = await fetch(req);
    if (networkRes && networkRes.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, networkRes.clone());
      return networkRes;
    }
  } catch {}
  const cached = await caches.match(req);
  if (cached) return cached;
  /* Last resort: return the main page for unknown navigation */
  return caches.match('index.html') ||
         new Response('<h1>Eylox is offline</h1>', { headers: { 'Content-Type': 'text/html' } });
}

/* ── Strategy: cache-first, fall back to network ─────────── */
async function cacheFirstWithNetworkFallback(req) {
  const cached = await caches.match(req);
  if (cached) {
    /* Revalidate in background */
    fetch(req).then(res => {
      if (res && res.ok) {
        caches.open(CACHE_NAME).then(c => c.put(req, res));
      }
    }).catch(() => {});
    return cached;
  }
  try {
    const networkRes = await fetch(req);
    if (networkRes && networkRes.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, networkRes.clone());
    }
    return networkRes;
  } catch {
    return new Response('', { status: 503 });
  }
}

/* ── Strategy: stale-while-revalidate ────────────────────── */
async function staleWhileRevalidate(req, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req).then(res => {
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => cached);
  return cached || fetchPromise;
}

/* ── Message from client: force cache refresh ─────────────── */
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'CACHE_REFRESH') {
    caches.open(CACHE_NAME).then(cache => {
      ALL_ASSETS.forEach(path =>
        fetch(path).then(res => { if (res.ok) cache.put(path, res); }).catch(() => {})
      );
    });
  }
});
