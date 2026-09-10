'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import Link from 'next/link';

/**
 * Error boundary de segment : capture les erreurs de rendu d'une page sans
 * remplacer tout le layout (header, navigation, FAB restent disponibles).
 * `global-error.tsx` ne prend le relais que si le layout racine lui-même casse.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="p-4 space-y-5">
      <section className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
        <h2 className="text-lg font-bold text-red-800 dark:text-red-300 mb-1">
          Cette page a rencontré une erreur
        </h2>
        <p className="text-sm text-red-700 dark:text-red-400">
          En cas d&apos;urgence vitale, n&apos;attendez pas : appelez le{' '}
          <a href="tel:112" className="font-bold underline">112</a>, le{' '}
          <a href="tel:15" className="font-bold underline">15</a> ou le{' '}
          <a href="tel:18" className="font-bold underline">18</a>.
        </p>
      </section>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="flex-1 px-4 py-3 text-center bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-100 rounded-xl font-medium transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>

      {error.digest && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Référence : {error.digest}
        </p>
      )}
    </div>
  );
}
