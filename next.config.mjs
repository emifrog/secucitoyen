import withSerwistInit from '@serwist/next';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs/config';
import { randomUUID } from 'node:crypto';

const analyzeBundles = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// Révision des entrées de précache ajoutées à la main : change à chaque build,
// donc `/` et `/offline` sont re-téléchargés après chaque déploiement.
const buildRevision = process.env.VERCEL_GIT_COMMIT_SHA || randomUUID();

// Serwist remplace next-pwa (non maintenu depuis 2022, et dont
// l'auto-enregistrement n'injectait rien en App Router).
const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
  // Le worker est enregistré par components/layout/ServiceWorkerRegister.tsx.
  register: false,
  reloadOnOnline: false,
  cacheOnNavigation: false,
  // - source maps : supprimées par Sentry après upload, précacher un .map
  //   absent (404) faisait échouer l'installation du worker ;
  // - app-build-manifest.json : fichier interne non servi sous /_next/ (404) ;
  // - chunks/pages : shim Pages Router inutile en App Router.
  exclude: [/\.map$/, /app-build-manifest\.json$/, /chunks\/pages\//],
  additionalPrecacheEntries: [
    { url: '/', revision: buildRevision },
    { url: '/offline', revision: buildRevision },
  ],
});

// Content-Security-Policy. script/style en 'unsafe-inline' (script de thème
// inline + styled-jsx/Tailwind) — baseline à durcir ultérieurement via nonce.
// Les appels externes sont faits côté serveur (routes /api), donc connect-src
// ne liste que les destinations réellement appelées depuis le navigateur.
// (Supabase et Google Fonts retirés : le navigateur ne leur parle jamais —
// next/font auto-héberge Inter, le client anon Supabase n'existe plus.)
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.ingest.sentry.io https://*.sentry.io https://vitals.vercel-insights.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // NB : pas de `upgrade-insecure-requests` — HSTS force déjà le HTTPS en prod,
  // toutes les sous-ressources sont same-origin, et cette directive casse
  // l'app sous Safari/webkit sur les origines HTTP (dev, CI e2e, previews HTTP).
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'geolocation=(self), camera=(), microphone=(), payment=(), usb=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default withSentryConfig(analyzeBundles(withSerwist(nextConfig)), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
});
