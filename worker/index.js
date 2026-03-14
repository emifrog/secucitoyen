// Custom Service Worker - Push Notifications Handler
// Ce fichier est automatiquement injecté par next-pwa dans le service worker

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
