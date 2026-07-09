const CACHE_NAME = 'qa-v4'; // Nova versão do cache

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

// 1. Instalação: Salva os arquivos e força a ativação imediata
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    }).then(() => {
      // Força o Service Worker atual a virar o "ativo" sem esperar o usuário fechar o app
      return self.skipWaiting();
    })
  );
});

// 2. Ativação: Varre o navegador e deleta de forma automática qualquer cache antigo (ex: qa-v2)
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          // Se o cache encontrado na memória for diferente do atual (qa-v3), apaga ele
          if (cache !== CACHE_NAME) {
            console.log(`[Service Worker] Deletando cache antigo obsoleto: ${cache}`);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      // Faz o Service Worker assumir o controle das páginas abertas imediatamente
      return self.clients.claim();
    })
  );
});

// 3. Estratégia de Busca: Responde com Cache se houver, senão busca na Rede
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
