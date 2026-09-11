'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CachedPage {
  href: string;
  label: string;
}

const CACHE_NAMES = ['secours-fiches', 'detail-pages', 'pages'] as const;

function labelFor(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 'secours') {
    return parts[1] ? `Fiche : ${parts[1].replace(/-/g, ' ')}` : 'Fiches de secours';
  }
  if (parts[0] === 'urgences') {
    return parts[1] ? `Numéro ${parts[1].replace(/-/g, ' ')}` : "Numéros d'urgence";
  }
  return pathname;
}

/**
 * Liste les pages réellement disponibles hors-ligne (lues dans Cache Storage),
 * pour que la page /offline mène quelque part au lieu d'être une impasse.
 */
export default function CachedPagesList() {
  const [pages, setPages] = useState<CachedPage[] | null>(null);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    (async () => {
      if (typeof caches === 'undefined') {
        setPages([]);
        return;
      }
      const found = new Map<string, CachedPage>();
      for (const name of CACHE_NAMES) {
        try {
          const cache = await caches.open(name);
          for (const request of await cache.keys()) {
            const url = new URL(request.url);
            // Ignorer les préchargements RSC et les doublons.
            if (url.search.includes('_rsc')) continue;
            if (url.pathname === '/offline') continue;
            found.set(url.pathname, { href: url.pathname, label: labelFor(url.pathname) });
          }
        } catch {
          // Cache indisponible : on continue.
        }
      }
      setPages(Array.from(found.values()).sort((a, b) => a.href.localeCompare(b.href)));
    })();

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return (
    <div className="w-full max-w-sm mt-8 space-y-4">
      <button
        onClick={() => window.location.reload()}
        className="w-full rounded-xl bg-white text-primary font-semibold py-3 hover:bg-white/90 transition-colors"
      >
        {online ? 'Réessayer' : 'Réessayer (toujours hors connexion)'}
      </button>

      {pages === null ? (
        <p className="text-center text-gray-300 text-sm" role="status">Recherche des pages disponibles…</p>
      ) : pages.length === 0 ? (
        <p className="text-center text-gray-300 text-sm">
          Aucune page enregistrée pour le hors-ligne sur cet appareil.
        </p>
      ) : (
        <nav aria-label="Pages disponibles hors connexion">
          <p className="text-sm text-gray-300 mb-2">Disponible sans réseau :</p>
          <ul className="space-y-1">
            {pages.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className="block rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 text-sm"
                >
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
