// service-worker.js
const CACHE_NAME = 'restaurante-v1';
const urlsToCache = [
  '/',
  '/carta.html',
  '/style.css',
  '/carta.js',
  '/admin.html',
  '/admin.css',
  '/admin.js',
  '/restaurante.html',
  '/restaurante.css',
  '/restaurante.js',
  '/manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Intercepción de peticiones
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retornar respuesta
        if (response) {
          return response;
        }
        
        // Clone la petición
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Verifica si recibimos una respuesta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone la respuesta
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
      })
      .catch(() => {
        // Si falla todo, mostrar página offline personalizada
        return caches.match('/carta.html');
      })
  );
});