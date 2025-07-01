const CACHE_NAME = 'breakout-game-v1';
const urlsToCache = [
  './gameObject.htm',
  './index.html',
  './player.js',
  './Ball.js',
  './Paddle.js', 
  './Brick.js',
  './Sakura.js',
  './Game.js',
  './manifest.json',
  './assets/bgm.mp3',
  './assets/bounce.mp3',
  './assets/blockSound.mp3',
  './assets/gameOver.mp3',
  './assets/winSound.mp3',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 