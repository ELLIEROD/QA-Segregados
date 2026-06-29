const CACHE_NAME = 'qa-v6'; // Subi para v6 para forçar a atualização limpa!
const ASSETS = [
  './',
  './index.html',
  './dashboard.html',
  './manifest.json',
  './favicon.ico',      
  './img/icon-192.png',    // Ajustado com o caminho da pasta img
  './img/icon-512.png',    // Ajustado com o caminho da pasta img
  './js/config.js',
  './js/auth.js',
  './js/dashboard.js'
];

// Instalação do Service Worker e Cache dos arquivos essenciais
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // O truque do map evita que um único arquivo com erro trave o app todo enquanto testas
      return Promise.all(
        ASSETS.map(url => {
          return cache.add(url).catch(err => console.error('Erro ao colocar no cache:', url, err));
        })
      );
    })
  );
});

// Ativação e Limpeza de caches antigos (Crucial para não travar nos 3 pontinhos!)
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
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
