const CACHE_NAME = 'qa-v15'; // Sempre que mudar produtos, suba esse número (v16, v17...)

// Arquivos que serão guardados para funcionar OFFLINE (HTML e design estrutural)
const ASSETS = [
  './',
  './index.html',
  './dashboard.html',
  './manifest.json',
  './favicon.ico',      
  './img/icon-192.png',  
  './img/icon-512.png',  
  './js/config.js',
  './js/auth.js'
  // 🚨 REMOVEMOS o dashboard.js daqui para ele nunca mais travar por cache viciado!
];

// Instalação
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        ASSETS.map(url => {
          return cache.add(url).catch(err => console.log('Aviso cache:', url));
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Ativação e limpeza de lixo antigo
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
    }).then(() => self.clients.claim())
  );
});

// 🚀 A SOLUÇÃO COMPLETA: Estratégia Dinâmica de Resposta
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Se o navegador estiver pedindo o dashboard.js, ele SEMPRE vai buscar direto na internet (GitHub)
  if (url.pathname.includes('dashboard.js')) {
    e.respondWith(
      fetch(e.request).catch(() => {
        // Se a internet da fábrica cair completamente, aí sim ele pega o que estiver salvo de reserva
        return caches.match(e.request);
      })
    );
  } else {
    // Para os outros arquivos normais (imagens, login), usa o padrão seguro
    e.respondWith(
      caches.match(e.request).then(cachedResponse => {
        return cachedResponse || fetch(e.request);
      })
    );
  }
});
