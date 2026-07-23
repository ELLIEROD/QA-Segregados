const CACHE_NAME = 'qa-v10'; // Versão incrementada para forçar o descarte

const ASSETS = [
  './',
  './index.html',
  './dashboard.html',
  './rastreabilidade.html',
  './404.html',
  './manifest.json',
  './css/style.css',
  './img/icon-192.png',
  './img/icon-512.png',
  './img/background-bimbo.png',
  './js/config.js',
  './js/auth.js',
  './js/dashboard.js',
  './js/rastreabilidade.js'
];

// Instalação
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// Ativação
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log(`[Service Worker] Limpando cache antigo: ${cache}`);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
