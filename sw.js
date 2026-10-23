const CACHE_NAME = 'auzef-tarih-v3.4';
const assetsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];

// Yükleme aşamasında dosyaları önbelleğe al ve bekletmeden aktifleştir
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(assetsToCache);
      })
  );
});

// Eski önbellekleri temizleme ve kontrolü ele alma
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// İstekleri yakala: Önce internetten güncelini çek (Network-First), internet yoksa önbellekten (Cache) sun
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // İnternetten güncel dosya geldiyse önbelleği de yenile
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // İnternet yoksa önbellekteki dosyayı çalıştır (Offline destek)
        return caches.match(event.request);
      })
  );
});
