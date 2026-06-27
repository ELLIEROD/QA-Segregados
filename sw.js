const CACHE_NAME = 'qa-v7'; // Força o navegador a jogar o lixo velho fora

const ASSETS = [
  './',
  './index.html',
  './dashboard.html',
  './manifest.json',
  './css/style.css',       // <--- ADICIONADO (Ajuste o nome do arquivo se for diferente de style.css)
  './js/config.js',
  './js/auth.js',
  './js/dashboard.js',
  './img/icon-192.png',
  './img/icon-512.png'
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
// Limpa os caches antigos e ativa o novo Service Worker imediatamente
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Removendo cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim()) // Força o app a usar o SW novo na hora
  );
});
