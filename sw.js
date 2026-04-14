const CACHE_NAME = 'games-world-v5';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',

  // CSS
  './css/main.css',
  './css/fonts.css',
  './css/fonts-games.css',

  // JS
  './js/main.js',
  './js/libs/three.min.js',

  // Fonts - Fredoka One
  './fonts/fredoka/FredokaOne-Regular.woff2',

  // Fonts - Tajawal
  './fonts/tajawal/Tajawal-Regular-ar.woff2',
  './fonts/tajawal/Tajawal-Regular-la.woff2',
  './fonts/tajawal/Tajawal-Bold-ar.woff2',
  './fonts/tajawal/Tajawal-Bold-la.woff2',
  './fonts/tajawal/Tajawal-Black-ar.woff2',
  './fonts/tajawal/Tajawal-Black-la.woff2',

  // Games
  './games/space-shooter.html',
  './games/color-blast.html',
  './games/froggy-jump.html',
  './games/car-run.html',
  './games/balloon-pop.html',
  './games/gold-miner.html',
  './games/fish-catch.html',
  './games/color-tanks.html',
  './games/coloring-letters.html',

  // Images
  './images/camo.png',
  './images/ground.png',
  './images/icon-192.png',
  './images/icon-512.png',
  './images/apple-touch-icon.png',

  // Sounds
  './sounds/mixkit-arcade-rising-231.wav',
  './sounds/mixkit-completion-of-a-level-2063.wav',
  './sounds/mixkit-extra-bonus-in-a-video-game-2045.wav',
  './sounds/mixkit-game-blood-pop-slide-2363.wav',
  './sounds/mixkit-game-bonus-reached-2065.wav',
  './sounds/mixkit-game-level-completed-2059.wav',
  './sounds/mixkit-long-game-over-notification-276.wav',
  './sounds/mixkit-martial-arts-fast-punch-2047.wav',
  './sounds/mixkit-mechanical-crate-pick-up-3154.wav',
  './sounds/mixkit-medieval-show-fanfare-announcement-226.wav',
  './sounds/mixkit-negative-guitar-tone-2324.wav',
  './sounds/mixkit-player-jumping-in-a-video-game-2043.wav',
  './sounds/mixkit-player-losing-or-failing-2042.wav',
  './sounds/mixkit-retro-video-game-bubble-laser-277.wav',
  './sounds/mixkit-unlock-new-item-game-notification-254.wav',
  './sounds/mixkit-video-game-bomb-alert-2803.wav',
  './sounds/mixkit-video-game-health-recharge-2837.wav',
  './sounds/mixkit-video-game-treasure-2066.wav',
  './sounds/action.mp3',
  './sounds/clear.mp3',
  './sounds/join.mp3',
  './sounds/leave.mp3',
  './sounds/new_messages.mp3',
  './sounds/new_news.mp3',
  './sounds/notify.mp3',
  './sounds/private.mp3',
  './sounds/username.mp3',
  './sounds/whistle.mp3',
];

// Install: cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching all assets...');
      return cache.addAll(ASSETS);
    }).then(() => {
      console.log('[SW] All assets cached successfully!');
      return self.skipWaiting(); // Activate immediately
    })
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      )
    ).then(() => self.clients.claim()) // Take control of all clients
  );
});

// Fetch: Cache First strategy (offline-first)
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Serve from cache
      }
      // Not in cache: try network, then cache it
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline fallback for HTML pages
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
