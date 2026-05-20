const CACHE = 'fitlife-v5';
const ASSETS = [
  './', './index.html', './css/app.css',
  './js/storage.js', './js/gemini.js', './js/data.js', './js/app.js',
  './manifest.json', './icons/icon.svg',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('generativelanguage.googleapis.com')) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }))
  );
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'FitLife', body: 'Es hora de tu rutina!' };
  e.waitUntil(self.registration.showNotification(data.title, {
    body: data.body, icon: './icons/icon.svg', badge: './icons/icon.svg'
  }));
});
