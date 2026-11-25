const CACHE_GELATOART = 'gelatoart-v1';
const ASSETS_ESTATICOS = [
    './',
    './index.html',
    './style.css',
    './app.js'
];

// Evento de Instalação: Salva recursos no cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_GELATOART).then(cache => {
            console.log('[SW] Salvando páginas da sorveteria no Cache...');
            return cache.addAll(ASSETS_ESTATICOS);
        })
    );
});

// Evento de Ativação: Limpa versões antigas
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(chaves => {
            return Promise.all(
                chaves.map(chave => {
                    if (chave !== CACHE_GELATOART) {
                        console.log('[SW] Apagando cache antigo:', chave);
                        return caches.delete(chave);
                    }
                })
            );
        })
    );
});

// Evento Fetch: Estratégia Cache First com fallback de rede
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then(respostaCache => {
            return respostaCache || fetch(event.request);
        })
    );
});
