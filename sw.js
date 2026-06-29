const CACHE_NAME = 'qa-v10'; // Subimos bem a versão para forçar o reset total
const NOM_REPOSITORIO = '/QA-Segregados'; // Caminho do seu projeto no GitHub

const ASSETS = [
  `${NOM_REPOSITORIO}/`,
  `${NOM_REPOSITORIO}/index.html`,
  `${NOM_REPOSITORIO}/dashboard.html`,
  `${NOM_REPOSITORIO}/manifest.json`,
  `${NOM_REPOSITORIO}/favicon.ico`,      
  `${NOM_REPOSITORIO}/img/icon-192.png`,  
  `${NOM_REPOSITORIO}/img/icon-512.png`,  
  `${NOM_REPOSITORIO}/js/config.js`,
  `${NOM_REPOSITORIO}/js/auth.js`,
  `${NOM_REPOSITORIO}/js/dashboard.js`
];

// Instalação do Service Worker com tratamento de erro individual por arquivo
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        ASSETS.map(url => {
          return cache.add(url).catch(err => console.error('Arquivo não encontrado no GitHub:', url, err));
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// Ativação e Limpeza profunda de caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Limpando cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estratégia de resposta: Tenta Rede primeiro, se falhar ou estiver offline, usa o Cache
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => {
      return caches.match(e.request);
    })
  );
});
