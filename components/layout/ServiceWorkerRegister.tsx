'use client';

import { useEffect } from 'react';

/**
 * Enregistrement explicite du service worker.
 *
 * next-pwa 5.x (`register: true`) n'injecte son script d'enregistrement que
 * dans l'entrée webpack `main.js` du Pages Router. En App Router, seule
 * `main-app.js` est chargée : le worker n'était donc JAMAIS enregistré en
 * production (ni hors-ligne, ni push — `navigator.serviceWorker.ready` ne se
 * résolvait jamais). On enregistre donc nous-mêmes `/sw.js`, généré par
 * next-pwa au build (désactivé en développement : le fichier n'existe pas).
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // `updateViaCache: 'none'` : le navigateur revalide toujours sw.js auprès du
    // serveur, sinon une mise à jour peut rester invisible jusqu'à 24 h.
    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .catch((err) => {
        console.error('[SW] Enregistrement impossible :', err);
      });
  }, []);

  return null;
}
