import withPWA from 'next-pwa';
import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';

const analyzeBundles = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const pwaConfig = withPWA({
  dest: 'public',
  // L'auto-enregistrement de next-pwa n'injecte son script que dans l'entrée
  // `main.js` (Pages Router) : en App Router il ne s'exécute jamais. Le worker
  // est enregistré par components/layout/ServiceWorkerRegister.tsx.
  register: false,
  // skipWaiting piloté par l'utilisateur via UpdatePrompt (message SKIP_WAITING
  // au worker) : la nouvelle version attend une confirmation « Recharger »
  // plutôt que de s'activer silencieusement.
  skipWaiting: false,
  disable: process.env.NODE_ENV === 'development',
  // Le SDK Sentry supprime les source maps APRÈS leur upload (comportement par
  // défaut quand SENTRY_AUTH_TOKEN est défini), alors que Workbox a déjà figé
  // son manifeste de précache. Précacher un .map absent → 404 →
  // `bad-precaching-response` → l'installation du SW échoue (ni offline, ni
  // push). On exclut donc les maps du précache, ainsi que le shim pages-router
  // (_app/_error) inutile en App Router.
  // `app-build-manifest.json` : fichier interne du build App Router que Next ne
  // sert pas sous /_next/ (404). next-pwa 5.x n'exclut que son équivalent
  // Pages Router (`build-manifest.json`) ; sans cette exclusion l'installation
  // du worker échouait systématiquement.
  buildExcludes: [/\.map$/, /chunks\/pages\//, /app-build-manifest\.json$/],
  // `/` est précaché avec la révision du build (sinon next-pwa le sert en
  // NetworkFirst sans timeout : sur réseau dégradé, l'ouverture de l'app
  // attend le timeout navigateur avant de retomber sur le cache).
  dynamicStartUrl: false,
  runtimeCaching: [
    {
      // Fiches de secours : préchauffées à l'installation du SW
      // (worker/index.js + worker/precache-urls.js) pour être disponibles
      // hors-ligne AVANT toute visite, puis StaleWhileRevalidate (servies du
      // cache, rafraîchies en tâche de fond).
      // Matcher par fonction : uniquement les navigations same-origin, ce qui
      // exclut les préchargements RSC (`?_rsc=`) et les chunks
      // /_next/static/chunks/app/secours/… qui saturaient `maxEntries`.
      urlPattern: ({ url, request }) =>
        url.origin === self.location.origin &&
        request.mode === 'navigate' &&
        url.pathname.startsWith('/secours/'),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'secours-fiches',
        // Les entrées préchauffées sont ajoutées sans en-têtes de négociation :
        // ne pas laisser un `Vary` amont faire échouer la correspondance.
        matchOptions: { ignoreVary: true },
        expiration: {
          maxEntries: 40,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
        },
      },
    },
    {
      // Pages de détail (urgences/[number], alertes/[id], prevention/[id],
      // conseils-saison/[id]) : NetworkFirst avec timeout court (frais en ligne,
      // dernier cache en secours hors-ligne). Les numéros d'urgence y sont
      // préchauffés à l'installation.
      urlPattern: /^https?:\/\/.*\/(urgences|alertes|prevention|conseils-saison|defibrillateurs)\/[^/]+$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'detail-pages',
        networkTimeoutSeconds: 3,
        matchOptions: { ignoreVary: true },
        expiration: {
          maxEntries: 40,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 jours
        },
      },
    },
    {
      // Racines de section (accueil précaché par ailleurs). Timeout réseau court :
      // une app d'urgence ne doit jamais attendre le timeout navigateur.
      urlPattern: /^https?:\/\/.*\/(secours|prevention|urgences|alertes)?$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        networkTimeoutSeconds: 3,
        matchOptions: { ignoreVary: true },
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
