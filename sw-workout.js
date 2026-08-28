const CACHE = 'workout-tracker-v2';
const FILES = [
    '/workout-tracker.html',
    '/workout-manifest.json',
    '/icon-workout.svg'
];
const OWNED = new Set(FILES);

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(cache => cache.addAll(FILES))
    );
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', e => {
    const req = e.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;
    if (!OWNED.has(url.pathname)) return;

    e.respondWith(
        fetch(req)
            .then(res => {
                if (res && res.ok) {
                    const copy = res.clone();
                    caches.open(CACHE).then(cache => cache.put(req, copy));
                }
                return res;
            })
            .catch(() => caches.match(req).then(c => c || caches.match('/workout-tracker.html')))
    );
});
