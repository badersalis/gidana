const CACHE_VERSION = 'v8.0';
const STATIC_CACHE = `gidana-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `gidana-runtime-${CACHE_VERSION}`;
const ALL_CACHES = [STATIC_CACHE, RUNTIME_CACHE];

// PWA start URL — pre-cached so the splash screen renders instantly on first launch
const START_URL = '/?source=pwa';

// App shell — precached on install
const PRECACHE_URLS = [
    START_URL,
    '/offline',
    '/static/css/bootstrap.min.css',
    '/static/css/styles.css',
    '/static/css/fonts.css',
    '/static/css/libs/animate.min.css',
    '/static/icons/font/bootstrap-icons.css',
    '/static/js/libs/bootstrap.bundle.min.js',
    '/static/js/libs/jquery.min.js',
    '/static/feedbacks/account_circle_dark.svg',
    '/static/feedbacks/account_circle.svg',
    '/static/favicons/android-chrome-192x192.png',
    '/static/favicons/apple-touch-icon.png',
    // Fonts — required for standalone PWA to render correctly offline
    '/static/fonts/Poppins/Poppins-Regular.ttf',
    '/static/fonts/Poppins/Poppins-Medium.ttf',
    '/static/fonts/Poppins/Poppins-SemiBold.ttf',
    '/static/fonts/Poppins/Poppins-Bold.ttf',
    '/static/fonts/Poppins/Poppins-Light.ttf',
    '/static/icons/font/fonts/bootstrap-icons.woff2',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache =>
                Promise.allSettled(PRECACHE_URLS.map(url => cache.add(url)))
            )
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => !ALL_CACHES.includes(k)).map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('message', event => {
    if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    if (url.origin !== location.origin) return;
    if (request.method !== 'GET') return;
    // Let API calls go straight to network
    if (url.pathname.startsWith('/api/')) return;

    if (request.mode === 'navigate') {
        const isStartUrl = url.pathname === '/' && url.search.includes('source=pwa');

        if (isStartUrl) {
            // Cache-first with background revalidation: serve cached HTML instantly
            // so the splash screen renders without waiting for the network.
            // The background fetch keeps the cache fresh for the next launch.
            event.respondWith(
                caches.open(STATIC_CACHE).then(cache =>
                    cache.match(request).then(cached => {
                        const networkFetch = fetch(request).then(response => {
                            if (response.ok) cache.put(request, response.clone());
                            return response;
                        }).catch(() => null);
                        return cached || networkFetch;
                    })
                )
            );
            return;
        }

        // All other HTML pages — network-first, cache fallback, then /offline
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(RUNTIME_CACHE).then(cache => cache.put(request, clone));
                    }
                    return response;
                })
                .catch(() =>
                    caches.match(request).then(cached => cached || caches.match('/offline'))
                )
        );
        return;
    }

    // Static assets — cache-first, update in background (stale-while-revalidate)
    if (url.pathname.startsWith('/static/')) {
        event.respondWith(
            caches.open(STATIC_CACHE).then(cache =>
                cache.match(request).then(cached => {
                    const networkFetch = fetch(request).then(response => {
                        if (response.status === 200) cache.put(request, response.clone());
                        return response;
                    });
                    return cached || networkFetch;
                })
            )
        );
        return;
    }

    // Everything else — network with runtime cache fallback
    event.respondWith(
        caches.match(request).then(cached => {
            if (cached) return cached;
            return fetch(request).then(response => {
                if (response.status === 200) {
                    const clone = response.clone();
                    caches.open(RUNTIME_CACHE).then(cache => cache.put(request, clone));
                }
                return response;
            });
        })
    );
});
