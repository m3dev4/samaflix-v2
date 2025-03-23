const CACHE_NAME = 'samaflix-v1';

// Fichiers à mettre en cache
const urlsToCache = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Nettoyage des anciens caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // Essaie d'abord de récupérer depuis le réseau
    fetch(event.request)
      .catch(() => {
        // En cas d'échec, vérifie si c'est une requête de navigation
        if (event.request.mode === 'navigate') {
          // Retourne la page offline depuis le cache
          return caches.match('/offline.html');
        }
        // Pour les autres ressources, essaie de les récupérer depuis le cache
        return caches.match(event.request);
      })
  );
});

// Gestion des messages
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
}); 