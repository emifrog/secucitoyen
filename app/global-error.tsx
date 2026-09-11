'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          margin: 0,
          padding: '1.5rem',
          textAlign: 'center',
          background: '#0F2744',
          color: '#fff',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          Une erreur est survenue
        </h1>
        <p style={{ opacity: 0.8, marginBottom: '1.5rem' }}>
          En cas d&apos;urgence vitale, composez le 112, le 15 ou le 18.
        </p>
        {/* Lien natif volontaire : après un plantage du layout racine, le
            routeur client n'est plus fiable — un rechargement complet est
            plus sûr qu'une navigation <Link>. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/"
          style={{
            background: '#F97316',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Retour à l&apos;accueil
        </a>
      </body>
    </html>
  );
}
