'use client';

import { useEffect, useState } from 'react';

/**
 * Bannière « nouvelle version disponible ». Détecte un service worker en
 * attente (mise à jour installée) et propose de recharger. À l'acceptation,
 * envoie SKIP_WAITING au worker ; l'activation déclenche `controllerchange`,
 * qui recharge la page avec les nouveaux assets.
 */
export default function UpdatePrompt() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    navigator.serviceWorker.ready.then((reg) => {
      // Une mise à jour attendait déjà à l'ouverture.
      if (reg.waiting && navigator.serviceWorker.controller) {
        setWaiting(reg.waiting);
      }
      // Nouvelle mise à jour détectée pendant la session.
      reg.addEventListener('updatefound', () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            setWaiting(reg.waiting ?? installing);
          }
        });
      });
    });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  if (!waiting) return null;

  const reload = () => {
    waiting.postMessage({ type: 'SKIP_WAITING' });
    // `controllerchange` recharge la page automatiquement.
  };

  return (
    <div className="fixed inset-x-0 bottom-24 lg:bottom-6 z-[60] px-4 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto bg-primary text-white rounded-xl shadow-2xl p-4 flex items-center gap-3">
        <span className="text-xl" aria-hidden="true">🔄</span>
        <p className="flex-1 text-sm font-medium">
          Une nouvelle version est disponible.
        </p>
        <button
          onClick={reload}
          className="bg-white text-primary font-semibold text-sm px-3 py-1.5 rounded-lg hover:bg-white/90 transition-colors"
        >
          Recharger
        </button>
        <button
          onClick={() => setWaiting(null)}
          aria-label="Ignorer la mise à jour"
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
