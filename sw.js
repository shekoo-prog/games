const CACHE_NAME = 'games-world-v-1.0.1'; // Change this to force cache update

const ASSETS = [
  './',
  './index.html',
  './manifest.json',

  // CSS
  './assets/css/main.css',
  './assets/css/fonts.css',
  './assets/css/fonts-games.css',

  // JS
  './js/main.js',
  './js/libs/three.min.js',

  // Fonts
  './assets/fonts/fredoka/FredokaOne-Regular.woff2',
  './assets/fonts/tajawal/Tajawal-Regular-ar.woff2',
  './assets/fonts/tajawal/Tajawal-Regular-la.woff2',
  './assets/fonts/tajawal/Tajawal-Bold-ar.woff2',
  './assets/fonts/tajawal/Tajawal-Bold-la.woff2',
  './assets/fonts/tajawal/Tajawal-Black-ar.woff2',
  './assets/fonts/tajawal/Tajawal-Black-la.woff2',

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
  './games/bowling-3d.html',
  './games/archery-master.html',
  './games/word-connect.html',
  './games/math-quest.html',
  './games/memory-match.html',
  './games/neon-runner.html',
  './games/hexa-puzzle.html',
  './games/dungeon-crawler.html',
  './games/color-maze.html',
  './games/monster-hunt-3d.html',
  './games/neo-2048.html',
  './games/knife-hit.html',
  './games/super-platformer.html',
  './games/neo-snake.html',
  './games/basketball-physics.html',
  './games/penalty-shootout.html',

  // Images from assets
  './assets/images/camo.png',
  './assets/images/ground.png',
  './assets/images/icon-192.png',
  './assets/images/icon-512.png',
  './assets/images/apple-touch-icon.png',
  './assets/images/monsters.png',
  './assets/images/weapon.png',
  './assets/images/wall.png',

  // Sounds from assets
  './assets/sounds/mixkit-arcade-rising-231.wav',
  './assets/sounds/mixkit-completion-of-a-level-2063.wav',
  './assets/sounds/mixkit-extra-bonus-in-a-video-game-2045.wav',
  './assets/sounds/mixkit-game-blood-pop-slide-2363.wav',
  './assets/sounds/mixkit-game-bonus-reached-2065.wav',
  './assets/sounds/mixkit-game-level-completed-2059.wav',
  './assets/sounds/mixkit-long-game-over-notification-276.wav',
  './assets/sounds/mixkit-martial-arts-fast-punch-2047.wav',
  './assets/sounds/mixkit-mechanical-crate-pick-up-3154.wav',
  './assets/sounds/mixkit-medieval-show-fanfare-announcement-226.wav',
  './assets/sounds/mixkit-negative-guitar-tone-2324.wav',
  './assets/sounds/mixkit-player-jumping-in-a-video-game-2043.wav',
  './assets/sounds/mixkit-player-losing-or-failing-2042.wav',
  './assets/sounds/mixkit-retro-video-game-bubble-laser-277.wav',
  './assets/sounds/mixkit-unlock-new-item-game-notification-254.wav',
  './assets/sounds/mixkit-video-game-bomb-alert-2803.wav',
  './assets/sounds/mixkit-video-game-health-recharge-2837.wav',
  './assets/sounds/mixkit-video-game-treasure-2066.wav',
  './assets/sounds/action.mp3',
  './assets/sounds/clear.mp3',
  './assets/sounds/join.mp3',
  './assets/sounds/leave.mp3',
  './assets/sounds/new_messages.mp3',
  './assets/sounds/new_news.mp3',
  './assets/sounds/notify.mp3',
  './assets/sounds/private.mp3',
  './assets/sounds/username.mp3',
  './assets/sounds/whistle.mp3',
];

// Install: cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching all assets...');
      return cache.addAll(ASSETS);
    }).then(() => {
      console.log('[SW] All assets cached successfully!');
      return self.skipWaiting();
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
    ).then(() => self.clients.claim())
  );
});

// Fetch: Stale-While-Revalidate strategy
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      });

      return cachedResponse || fetchPromise;
    })
  );
});

