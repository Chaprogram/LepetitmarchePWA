const CACHE_NAME = 'petit-marche-cache-v2'; // Changez la version
const urlsToCache = [
  // Pages HTML
  "/templates/index.html",
  "/templates/user.html",
  '/templates/admin.html',
  '/templates/cart.html',
  '/templates/offline.html', // Page de secours

  // Fichiers CSS
  '/static/css/admin.css',
  '/static/css/cart.css',
  '/static/css/index.css',
  '/static/css/login.css',
  '/static/css/menu.css',
  '/static/css/produits.css',
  '/static/css/register.css',

  // Fichiers JavaScript
  '/static/js/app.js', // Le fichier actuel est dans le même dossier (static/js/)
  '/static/js/app-admin.js',
  '/static/js/app-user.js',
  '/static/js/cart.js',
  '/static/js/scripts.js',

  // Images
  '/static/images/icon-192x192.png',
  '/static/images/icon-512x512.png',

  // Autres fichiers
  '/static/manifest.json',
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force l'activation du nouveau Service Worker
  console.log('Tentative d\'installation du Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache ouvert, ajout des fichiers...');
        return cache.addAll(urlsToCache)
          .then(() => {
            console.log('Tous les fichiers ont été mis en cache avec succès.');
          })
          .catch((error) => {
            console.error('Erreur lors de la mise en cache :', error);
          });
      })
  );
});

self.addEventListener('fetch', (event) => {
  console.log('Fetch intercepté :', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('Réponse trouvée dans le cache :', event.request.url);
          return cachedResponse;
        }
        console.log('Tentative de requête réseau :', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              console.log('Mise en cache de la réponse :', event.request.url);
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, networkResponse.clone());
                });
            }
            return networkResponse;
          })
          .catch(() => {
            console.log('Mode hors ligne, renvoi de la page de secours.');
            return caches.match('../../templates/offline.html');
          });
      })
  );
});