const CACHE_NAME = 'qa-v3'; // Mudei para v2 para o celular do pessoal atualizar!
const ASSETS = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/manifest.json',
  '/favicon.ico',     // Adicionado
  '/icon-192.png',    // Adicionado
  '/icon-512.png',    // Adicionado
  '/js/config.js',
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
