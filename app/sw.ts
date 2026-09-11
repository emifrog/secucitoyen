/// <reference lib="webworker" />
/* eslint-disable @typescript-eslint/no-explicit-any */

// Service worker SécuCitoyen, construit par Serwist (@serwist/next) au build.
// Remplace next-pwa (non maintenu, n'enregistrait pas le worker en App Router).
//
// Responsabilités :
//   1. précache des assets du build + `/` + `/offline` (manifeste injecté) ;
//   2. préchauffage des fiches de secours et des numéros d'urgence à
//      l'installation (disponibles hors-ligne AVANT toute visite) ;
//   3. stratégies runtime (fiches : StaleWhileRevalidate ; pages de détail et
//      racines : NetworkFirst avec timeout court ; assets : CacheFirst ;
//      /api/alerts : NetworkFirst pour un « dernier état connu ») ;
//   4. mise à jour pilotée par l'utilisateur (SKIP_WAITING) ;
//   5. notifications push (affichage + clic).

import {
  CacheFirst,
  ExpirationPlugin,
  NetworkFirst,
  Serwist,
  StaleWhileRevalidate,
  type PrecacheEntry,
  type RuntimeCaching,
  type SerwistGlobalConfig,
} from 'serwist';
import { defaultCache } from '@serwist/next/worker';
import { OFFLINE_URLS } from '../lib/offline-urls';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const DAY = 60 * 60 * 24;

const isSameOriginNavigation = (url: URL, request: Request) =>
  url.origin === self.location.origin && request.mode === 'navigate';

// Ordre important : la première route qui correspond gagne.
const runtimeCaching: RuntimeCaching[] = [
  {
    // Fiches de secours : préchauffées à l'installation (voir plus bas), puis
    // servies depuis le cache et rafraîchies en tâche de fond.
    matcher: ({ url, request }) => isSameOriginNavigation(url, request) && url.pathname.startsWith('/secours/'),
    handler: new StaleWhileRevalidate({
      cacheName: 'secours-fiches',
      // Les entrées préchauffées sont ajoutées sans en-têtes de négociation :
      // ne pas laisser un `Vary` amont faire échouer la correspondance.
      matchOptions: { ignoreVary: true },
      plugins: [new ExpirationPlugin({ maxEntries: 40, maxAgeSeconds: 30 * DAY })],
    }),
  },
  {
    // Pages de détail (numéros d'urgence préchauffés, alertes, prévention,
    // conseils) : frais en ligne, cache en secours, sans attendre le timeout
    // navigateur.
    matcher: ({ url, request }) =>
      isSameOriginNavigation(url, request) &&
      /^\/(urgences|alertes|prevention|conseils-saison|defibrillateurs)\/[^/]+$/.test(url.pathname),
    handler: new NetworkFirst({
      cacheName: 'detail-pages',
      networkTimeoutSeconds: 3,
      matchOptions: { ignoreVary: true },
      plugins: [new ExpirationPlugin({ maxEntries: 40, maxAgeSeconds: 7 * DAY })],
    }),
  },
  {
    // Racines de section (l'accueil est précaché par ailleurs).
    matcher: ({ url, request }) =>
      isSameOriginNavigation(url, request) &&
      /^\/(secours|prevention|urgences|alertes|defibrillateurs|conseils-saison)$/.test(url.pathname),
    handler: new NetworkFirst({
      cacheName: 'pages',
      networkTimeoutSeconds: 3,
      matchOptions: { ignoreVary: true },
      plugins: [new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: DAY })],
    }),
  },
  {
    // Dernier état connu des alertes : hors-ligne, la liste affiche les
    // dernières données reçues (avec leur horodatage) plutôt qu'une erreur.
    matcher: ({ url }) => url.origin === self.location.origin && url.pathname === '/api/alerts',
    handler: new NetworkFirst({
      cacheName: 'api-alerts',
      networkTimeoutSeconds: 5,
      plugins: [new ExpirationPlugin({ maxEntries: 8, maxAgeSeconds: 60 * 60 })],
    }),
  },
  {
    // Assets statiques hors précache (images, polices…).
    matcher: ({ url }) =>
      url.origin === self.location.origin &&
      /\.(?:js|css|woff2?|ttf|otf|ico|svg|png|jpe?g|gif|webp)$/i.test(url.pathname),
    handler: new CacheFirst({
      cacheName: 'static-assets',
      plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * DAY })],
    }),
  },
  // Stratégies par défaut de Serwist pour Next (RSC, images next/image, etc.).
  ...defaultCache,
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  // Mise à jour pilotée par l'utilisateur (UpdatePrompt envoie SKIP_WAITING) :
  // la nouvelle version attend une confirmation « Recharger ».
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching,
  fallbacks: {
    // `/offline` est ajouté au précache par next.config.mjs (additionalPrecacheEntries).
    entries: [
      {
        url: '/offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

serwist.addEventListeners();

// ── Préchauffage du contenu critique ──────────────────────────────────
// Les fiches de secours et les numéros d'urgence doivent être disponibles
// hors-ligne DÈS l'installation, sans avoir été visités. Un échec de
// préchauffage ne doit jamais faire échouer l'installation (allSettled).
self.addEventListener('install', (event) => {
  event.waitUntil(warmOfflineCaches());
});

async function warmOfflineCaches(): Promise<void> {
  for (const [cacheName, urls] of Object.entries(OFFLINE_URLS)) {
    try {
      const cache = await caches.open(cacheName);
      await Promise.allSettled(
        urls.map((url) =>
          // `cache: 'reload'` : contourne le cache HTTP du navigateur pour
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

// ── Mise à jour à la demande ──────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── Notifications push ────────────────────────────────────────────────
interface PushPayload {
  title?: string;
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  requireInteraction?: boolean;
}

/** Force une URL de notification à rester same-origin (sinon /alertes). */
function safeNotificationUrl(url: unknown): string {
  if (typeof url !== 'string') return '/alertes';
  try {
    const resolved = new URL(url, self.location.origin);
    return resolved.origin === self.location.origin ? resolved.pathname + resolved.search : '/alertes';
  } catch {
    return '/alertes';
  }
}

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data: PushPayload;
  try {
    data = event.data.json() as PushPayload;
  } catch (error) {
    console.error('[SW] Payload push invalide :', error);
    return;
  }

  const options: NotificationOptions & { renotify?: boolean; actions?: { action: string; title: string }[] } = {
    body: data.body || '',
    // PNG : Chrome Android ignore les icônes SVG des notifications.
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-192x192.png',
    tag: data.tag || 'secucitoyen-alert',
    renotify: true,
    requireInteraction: data.requireInteraction === true,
    data: { url: safeNotificationUrl(data.url) },
    actions: [
      { action: 'open', title: 'Voir les détails' },
      { action: 'dismiss', title: 'Fermer' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title || 'SécuCitoyen', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const url = safeNotificationUrl((event.notification.data as { url?: unknown } | undefined)?.url);

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (windowClients) => {
      // Si une fenêtre de l'app est déjà ouverte, la focus et naviguer.
      for (const client of windowClients) {
        if (new URL(client.url).origin === self.location.origin) {
          try {
            if ('navigate' in client) {
              await client.navigate(url);
            }
            return client.focus();
          } catch {
            // Client non contrôlé : ouvrir une nouvelle fenêtre ci-dessous.
          }
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
