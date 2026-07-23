const CACHE_NAME = 'qa-v6'; // Subimos a versão para descartar o cache das imagens antigas

const ASSETS = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/rastreabilidade.html',
  '/404.html',
  '/manifest.json',
  '/css/style.css',
  '/img/icon-192.png',
  '/img/icon-512.png',
  '/img/background-bimbo.png',
  '/js/config.js',
  '/js/auth.js',
  '/js/dashboard.js',
  '/js/rastreabilidade.js'
];

// 1. Instalação: Baixa os novos arquivos e força a ativação imediata
self.addEventListener('install', e => {
  self.skipWaiting(); // Não espera as abas antigas fecharem
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// 2. Ativação: Deleta o cache da v5 (com os ícones velhos) e assume o controle das abas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log(`[Service Worker] Apagando cache antigo: ${cache}`);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Busca de Arquivos
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
