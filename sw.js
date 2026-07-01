const CACHE_NAME = 'qa-v2'; 
const ASSETS = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/404.html',
  '/manifest.json',
  '/css/style.css',        // Mapeando sua pasta de CSS
  '/img/icon-192.png',     // Mapeando sua pasta de imagens
  '/img/icon-512.png',
  '/img/background-bimbo.png',
  '/js/config.js',         // Mapeando sua pasta de JS
  '/js/auth.js',
  '/js/dashboard.js'
];

// Instalação do Service Worker e Cache dos arquivos essenciais
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// Resposta com Cache ou Rede
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});