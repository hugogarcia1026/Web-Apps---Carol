// =====================================================
// Service Worker — GelatoArt Repositor
// =====================================================

const CACHE_REPOSITOR = 'gelatoart-repositor-v1';

// Gravação estática no cache dos arquivos essenciais do App Shell
const ASSETS_ESTATICOS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './icon.svg'
];

// Evento de Instalação: salva os recursos estáticos no cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_REPOSITOR).then(cache => {
            console.log('[SW] Salvando o formulário de reposição no Cache...');
            return cache.addAll(ASSETS_ESTATICOS);
        })
    );
    self.skipWaiting();
});

// Evento de Ativação: remove versões antigas do cache
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(chaves => {
            return Promise.all(
                chaves.map(chave => {
                    if (chave !== CACHE_REPOSITOR) {
                        console.log('[SW] Apagando cache antigo:', chave);
                        return caches.delete(chave);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Evento Fetch: estratégia Cache First com fallback de rede.
// Garante que o formulário de reposição de sorvetes carregue offline.
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(respostaCache => {
            if (respostaCache) return respostaCache;

            return fetch(event.request).catch(() => {
                // Sem rede e sem cache: navegações caem no index.html em cache
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});

// Clique na notificação: foca ou abre o aplicativo
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(janelas => {
            if (janelas.length > 0) return janelas[0].focus();
            return self.clients.openWindow('./');
        })
    );
});
