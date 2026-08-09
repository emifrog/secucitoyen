import withPWA from 'next-pwa';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';

const analyzeBundles = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  // skipWaiting piloté par l'utilisateur via UpdatePrompt (message SKIP_WAITING
  // au worker) : la nouvelle version attend une confirmation « Recharger »
  // plutôt que de s'activer silencieusement.
  skipWaiting: false,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      // Cache les pages de fiches secours pour offline.
      // StaleWhileRevalidate : disponible hors-ligne ET rafraîchi en tâche de
      // fond (une fiche de secours corrigée est repropagée sans attendre 30 j).
      urlPattern: /^https?:\/\/.*\/secours\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'secours-fiches',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
        },
      },
    },
    {
      // Pages de détail (urgences/[number], alertes/[id], prevention/[id],
      // conseils-saison/[id]) : garanties offline via NetworkFirst
      // (frais en ligne, dernier cache en secours hors-ligne).
      urlPattern: /^https?:\/\/.*\/(urgences|alertes|prevention|conseils-saison|defibrillateurs)\/[^/]+$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'detail-pages',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 40,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 jours
        },
      },
    },
    {
      // Cache les pages statiques (racines de section + accueil)
      urlPattern: /^https?:\/\/.*\/(secours|prevention|urgences|alertes)?$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24, // 1 jour
        },
      },
    },
    {
      // Cache les assets statiques
      urlPattern: /\.(?:js|css|woff|woff2|ttf|otf|ico|svg|png|jpg|jpeg|gif|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
        },
      },
    },
    {
      // Cache Google Fonts
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 an
        },
      },
    },
  ],
  fallbacks: {
    document: '/offline',
  },
});

// Content-Security-Policy. script/style en 'unsafe-inline' (script de thème
// inline + styled-jsx/Tailwind) — baseline à durcir ultérieurement via nonce.
// Les appels externes sont faits côté serveur (routes /api), donc connect-src
// ne liste que les destinations réellement appelées depuis le navigateur.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.gstatic.com data:",
  "connect-src 'self' https://*.supabase.co https://*.ingest.sentry.io https://*.sentry.io https://vitals.vercel-insights.com",
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

export default withSentryConfig(analyzeBundles(pwaConfig(nextConfig)), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
});
