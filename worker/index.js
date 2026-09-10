// Custom Service Worker - Push Notifications Handler + préchauffage hors-ligne
// Ce fichier est automatiquement injecté par next-pwa dans le service worker
// (bundlé par webpack : les imports relatifs sont résolus).

import { OFFLINE_URLS } from './precache-urls';

// Préchauffage du contenu critique à l'installation : les fiches de secours et
// les numéros d'urgence doivent être disponibles hors-ligne DÈS l'installation,
// sans avoir été visités. Les caches ciblés sont ceux des règles runtimeCaching
// de next.config.mjs, servis ensuite par Workbox (StaleWhileRevalidate /
// NetworkFirst). Un échec de préchauffage ne doit jamais faire échouer
// l'installation du worker (allSettled + catch), sinon ni offline ni push.
self.addEventListener('install', (event) => {
  event.waitUntil(warmOfflineCaches());
});

async function warmOfflineCaches() {
  for (const [cacheName, urls] of Object.entries(OFFLINE_URLS)) {
    try {
      const cache = await caches.open(cacheName);
      await Promise.allSettled(
        urls.map((url) =>
          // `cache: 'reload'` : on contourne le cache HTTP du navigateur pour
          // stocker la version fraîche du build en cours.
          cache.add(new Request(url, { cache: 'reload' })).catch((err) => {
            console.warn('[SW] Préchauffage impossible pour', url, err);
          })
        )
      );
    } catch (err) {
      console.warn('[SW] Préchauffage du cache', cacheName, 'impossible :', err);
    }
  }
}

// Mise à jour à la demande : le client envoie SKIP_WAITING quand l'utilisateur
// accepte la nouvelle version (voir UpdatePrompt). Le SW en attente s'active
// alors immédiatement, ce qui déclenche `controllerchange` côté page → reload.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Gestion des événements push
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();

    const options = {
      body: data.body || '',
      icon: data.icon || '/icons/icon-192x192.svg',
      badge: data.badge || '/icons/icon-72x72.svg',
      tag: data.tag || 'secucitoyen-alert',
      renotify: true,
      requireInteraction: data.requireInteraction || false,
      data: {
        url: data.url || '/alertes',
      },
      actions: [
        {
          action: 'open',
          title: 'Voir les détails',
        },
        {
          action: 'dismiss',
          title: 'Fermer',
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'SécuCitoyen', options)
    );
  } catch (error) {
    console.error('[SW] Erreur traitement push:', error);
  }
});

// Gestion du clic sur la notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/alertes';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Si une fenêtre est déjà ouverte, la focus et naviguer
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin)) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Sinon ouvrir une nouvelle fenêtre
      return clients.openWindow(url);
    })
  );
});

// Gestion de la fermeture de notification (analytics futur)
self.addEventListener('notificationclose', (event) => {
  // Peut être utilisé pour du tracking
  console.log('[SW] Notification fermée:', event.notification.tag);
});
