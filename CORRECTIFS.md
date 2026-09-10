# Correctifs — SécuCitoyen

Issu de l'audit complet du 10 septembre 2026 (branche `main`, commit `cada8c9`).
Rapport détaillé : https://claude.ai/code/artifact/17df626c-9432-4d7a-8cad-13c39032b49e

Les références de ligne correspondent au commit `cada8c9` et peuvent se décaler.
Cocher les cases au fur et à mesure. Chaque phase peut être livrée indépendamment.

Répartition : 5 critiques · 17 élevés · 24 moyens · 12 faibles.

---

## Phase 1 — Urgence (une journée) — FAITE le 10/09/2026

Ces correctifs touchent directement la promesse de sécurité de l'application.
Validation : `tsc` et `next lint` sans erreur, 119 tests Jest, 60 tests Playwright
sur le build de production (dont 4 tests hors-ligne). Reste à vérifier en
production après déploiement (voir 1.4 et la section finale).

### 1.1 Numéro d'urgence faux — CRITIQUE

- [x] `lib/numeros-urgence.ts:187` : remplacer `0 800 05 95 95` (ligne « Viols Femmes Informations ») par `0 800 06 66 66` (Canicule Info Service, déjà utilisé dans `lib/alertes.ts:190`).
- [x] Créer `__tests__/lib/data-invariants.test.ts` :
  - tout numéro cité dans `lib/alertes.ts` existe dans `lib/numeros-urgence.ts` ;
  - identifiants de fiches uniques ;
  - `saisons[].mois` couvre 0 à 11 exactement une fois ;
  - `callEmergency.number` de chaque fiche est un numéro connu (15, 18, 112…) ;
  - test de régression explicite sur le numéro Canicule Info Service.

### 1.2 Alertes simulées poussées en notification réelle — CRITIQUE

- [x] `app/api/vigilance/route.ts` : les deux appels à `generateSeasonalAlerts()` sont remplacés par `degradedResponse()` → `{ alerts: [], source: 'Météo-France', degraded: true, error }`.
- [x] `app/api/vigilance/route.ts` : `generateSeasonalAlerts` supprimée (pas de mode démo conservé).
- [x] `app/api/alerts/route.ts` : `source` amont propagée telle quelle ; champ `degraded` renvoyé (vrai dès qu'une source amont ne répond pas).
- [x] `app/api/cron/check-alerts/route.ts` : `OFFICIAL_PUSH_SOURCES = {Météo-France, Vigicrues}` ; les indices calculés (incendie, qualité de l'air) ne sont plus poussés.
- [x] `components/alertes/AlertsList.tsx` : bannière ambre affichée quand `degraded === true`, avec lien vers vigilance.meteofrance.fr.

### 1.3 Défibrillateurs fictifs — CRITIQUE

- [x] `app/api/defibrillateurs/route.ts` : fallbacks supprimés ; réponse 503 `{ defibrillateurs: [], error, unavailable: true }`.
- [x] `app/api/defibrillateurs/route.ts` : `generateFallbackDAE` supprimée.
- [x] `app/api/defibrillateurs/route.ts` : `limit` borné à [1, 50], `radius` à [100, 10000], `NaN` rejeté, lat/lon validés (400 sinon).
- [x] `app/defibrillateurs/page.tsx` : état bloquant rouge « Service indisponible, appelez le 15 ou le 112 » avec bouton d'appel et « Réessayer » ; la liste n'est plus affichée en cas d'erreur.

### 1.4 Service worker : installation qui échouait — CRITIQUE

Trois causes cumulées, toutes corrigées (le worker n'a jamais fonctionné en production) :

- [x] **Le worker n'était jamais enregistré en App Router** : next-pwa 5.x n'injecte son script d'enregistrement que dans l'entrée `main.js` du Pages Router. Nouveau composant `components/layout/ServiceWorkerRegister.tsx` monté dans `app/layout.tsx` (`register: false` dans `next.config.mjs`).
- [x] **`/_next/app-build-manifest.json` précaché mais non servi (404)** : next-pwa n'exclut que `build-manifest.json`. Ajouté à `buildExcludes`.
- [x] **Source maps précachées mais supprimées par Sentry** : `buildExcludes: [/\.map$/, /chunks\/pages\//, /app-build-manifest\.json$/]`.
- [x] `sourcemaps.deleteSourcemapsAfterUpload` laissé par défaut (les sources ne sont pas publiées).
- [x] Vérifié après build : 0 entrée `.map`, 62/62 entrées de précache répondent 200, worker actif et contrôlant la page.
- [ ] **Après déploiement** : DevTools › Application › Service Workers doit afficher « activated » ; `Cache Storage` doit contenir `secours-fiches` (14) et `detail-pages` (12).

### 1.5 Fiches et numéros disponibles hors-ligne dès l'installation — CRITIQUE

- [x] `worker/index.js` : gestionnaire `install` qui préchauffe `pages` (`/secours`, `/urgences`), `secours-fiches` (14 fiches) et `detail-pages` (12 numéros) via `cache.add(new Request(u, { cache: 'reload' }))` + `Promise.allSettled` (un échec ne bloque jamais l'installation).
- [x] `worker/precache-urls.js` : liste maintenue à la main ; `__tests__/lib/precache-urls.test.ts` la compare aux identifiants de `lib/fiches-secours.ts` et `lib/numeros-urgence.ts`.
- [x] `next.config.mjs` : `dynamicStartUrl: false` (`/` précaché avec la révision du build).
- [x] `next.config.mjs` : matcher par fonction sur les navigations same-origin `/secours/*` (exclut les préchargements RSC et les chunks), `maxEntries` 40, `matchOptions: { ignoreVary: true }` sur les trois caches de pages.
- [x] `next.config.mjs` : `networkTimeoutSeconds: 3` sur `pages` et `detail-pages`.
- [x] `e2e/offline.spec.ts` : fiche et numéro jamais visités ouverts hors-ligne (Chromium, build de production ; `CI=1` ou `E2E_PWA=1`).

### 1.6 Correctifs rapides livrables avec la phase 1 — ÉLEVÉ

- [x] `components/layout/UpdatePrompt.tsx` : rechargement sur `controllerchange` uniquement si un contrôleur existait au montage (plus de reload à la première installation).
- [x] `components/layout/UpdatePrompt.tsx` : `bottom-36` (ne recouvre plus le bouton d'urgence).
- [x] Contraste blanc sur jaune : champ `textOnBg` ajouté à `alertLevels` (`lib/alertes.ts`) et utilisé dans `AlertsList.tsx` et `app/alertes/[id]/page.tsx` ; champ `fg` dans `urgencyConfig` de `FicheContent.tsx`.
- [x] `components/home/AlertBanner.tsx` : index remis à zéro au changement de liste + garde `currentIndex % alerts.length`.
- [x] `app/error.tsx` créé (erreur de segment en français, numéros d'urgence, « Réessayer », retour accueil).

---

## Phase 2 — Chaîne d'alertes et données (une à deux semaines)

### 2.1 Page détail d'alerte sur données réelles — ÉLEVÉ

- [ ] `app/alertes/[id]/page.tsx:17-19` : supprimer le délai artificiel et la recherche dans `mockAlerts` ; charger `/api/alerts?dept=<dept sauvegardé>` et filtrer par `params.id`, ou passer l'alerte via l'état de navigation.
- [ ] `lib/alertes.ts:326-354` : supprimer `mockAlerts`.
- [ ] Ajouter `generateMetadata` à la page.

### 2.2 Géolocalisation fiable — ÉLEVÉ

- [ ] `lib/geolocation.ts` : implémenter le géocodage inverse via `https://geo.api.gouv.fr/communes?lat=&lon=&fields=departement&format=json` ; garder les rectangles uniquement en secours hors-ligne.
- [ ] Ajouter les départements 971 à 976 dans `lib/geolocation.ts` et `components/alertes/DepartmentSelector.tsx:23-49`.
- [ ] `components/alertes/DepartmentSelector.tsx:113-115` : afficher « département estimé, vérifiez » au lieu de « (GPS) ».
- [ ] `__tests__/lib/geolocation.test.ts` : réécrire avec des cas exacts (Neuilly → 92, Lyon → 69, Vincennes → 94, Pointe-à-Pitre → 971, Saint-Denis Réunion → 974) et supprimer les assertions `not.toBeNull()`.

### 2.3 Indice feu étiqueté comme estimation — ÉLEVÉ

- [ ] `app/api/meteo-forets/route.ts:115,132`, `app/api/fire-risk/route.ts:228`, `app/api/alerts/route.ts:257` : remplacer « Météo des forêts » / « Calcul FWI » par « Estimation SécuCitoyen (non officielle) ».
- [ ] `app/api/alerts/route.ts:192-194` : plafonner le niveau incendie à `orange` (pas de push rouge sur un calcul maison).
- [ ] `lib/fire-index.ts:59` : retirer « Interdiction possible de certains massifs » ; ajouter un lien vers le produit officiel Météo-France.

### 2.4 Seuils qualité de l'air — ÉLEVÉ

- [ ] `app/api/air-quality/route.ts:53-58` : passer aux bandes de l'indice européen : vert ≤ 40, jaune ≤ 60, orange ≤ 80, rouge > 80.
- [ ] `app/api/air-quality/route.ts:4` : corriger le commentaire (source CAMS via Open-Meteo, pas ATMO France).
- [ ] `app/api/air-quality/route.ts` : valider `lat`/`lon` (rejeter `NaN`), arrondir à 2 décimales avant l'appel amont.
- [ ] Ajouter un test unitaire sur la fonction de niveau.

### 2.5 Cron idempotent et robuste — ÉLEVÉ

- [ ] Nouvelle migration `supabase/migrations/005_sent_notifications_unique.sql` : `ALTER TABLE sent_notifications ADD CONSTRAINT sent_notifications_alert_id_key UNIQUE (alert_id);`
- [ ] `app/api/cron/check-alerts/route.ts:63-73,122-126` : insérer **avant** l'envoi avec `upsert(..., { onConflict: 'alert_id', ignoreDuplicates: true })` et n'envoyer que si la ligne a été créée.
- [ ] `app/api/cron/check-alerts/route.ts:50-51` : vérifier `alertsResponse.ok` ; renvoyer un statut 502 sinon (pour faire échouer `curl -f`).
- [ ] `app/api/cron/check-alerts/route.ts:105-119` : envoyer par lots (concurrence bornée à 10 via `Promise.allSettled`) avec un budget de temps.
- [ ] `app/api/cron/check-alerts/route.ts:83-86` : ne pas diffuser à tous les abonnés nationaux une alerte sans `departmentCode`.
- [ ] `vercel.json` : définir `maxDuration` pour `/api/cron/check-alerts` et `/api/alerts`.
- [ ] `.github/workflows/cron-alerts.yml` : ajouter `permissions: {}`, `concurrency: { group: cron-alerts, cancel-in-progress: false }`, `timeout-minutes: 5`, un step `if: failure()` qui ouvre ou commente une issue ; passer `CRON_SECRET` via `env:` et `PRODUCTION_URL` via `vars.`.
- [ ] Mettre en place le déclencheur externe redondant (cron-job.org ou UptimeRobot) déjà suggéré dans le README.

### 2.6 Validation des abonnements push — ÉLEVÉ

- [ ] `app/api/notifications/subscribe/route.ts:25-38` : valider `keys.p256dh` (`^[A-Za-z0-9_-]{87,88}$`) et `keys.auth` (`^[A-Za-z0-9_-]{22}$`) ; rejeter un corps > 4 Ko.
- [ ] Purge SQL one-shot des endpoints hors allowlist : `DELETE FROM push_subscriptions WHERE endpoint !~ '^https://(.*\.)?(push\.services\.mozilla\.com|fcm\.googleapis\.com|push\.apple\.com|notify\.windows\.com)/';` (adapter à l'allowlist de `lib/validation.ts:32-60`).
- [ ] `app/api/notifications/send/route.ts:43-50,82-90` : valider `level` (vert/jaune/orange/rouge), plafonner titre et corps (payload < 4 Ko).

### 2.7 Agrégateur d'alertes — ÉLEVÉ

- [ ] Créer `lib/sources/vigilance.ts`, `lib/sources/air-quality.ts`, `lib/sources/vigicrues.ts`, `lib/sources/meteo-forets.ts`, `lib/sources/fire-risk.ts` : fonctions pures `fetchX(dept?)` retournant `UnifiedAlert[]`.
- [ ] `app/api/alerts/route.ts:68-233` : appeler ces fonctions directement via `Promise.allSettled` au lieu de cinq `fetch` HTTP séquentiels vers ses propres routes.
- [ ] `app/api/meteo-forets/route.ts:63-106` et `app/api/fire-risk/route.ts:180-219` : paralléliser les boucles départementales.
- [ ] `app/api/alerts/route.ts` : ajouter `Cache-Control: s-maxage=300, stale-while-revalidate=600` sur la réponse.
- [ ] Supprimer les exports `revalidate` contradictoires avec `dynamic = 'force-dynamic'` (`alerts:12`, `vigilance:84`, `air-quality:51`, `fire-risk:44`) et `app/alertes/page.tsx:13`.
- [ ] `app/api/vigilance/route.ts:97` : filtrer côté API sur `color_id > 2` pour le cron, ou paginer au-delà de `limit=100`.

### 2.8 Disjoncteur et retry — ÉLEVÉ

- [ ] `lib/api-utils.ts:42-49,105-115` : compter `!response.ok` comme un échec du disjoncteur.
- [ ] `lib/api-utils.ts:27-34` : déplacer `clearTimeout` dans un `finally`.
- [ ] `lib/api-utils.ts:53-61` : aligner le commentaire et le comportement sur les aborts.
- [ ] Tests : half-open et remise à zéro du disjoncteur avec `jest.useFakeTimers()`.

### 2.9 Fiches de secours — ÉLEVÉ / MOYEN

- [ ] `lib/fiches-secours.ts:85-139` (étouffement) : ajouter la section « Nourrisson (moins d'un an) » : 5 tapes dorsales puis 5 compressions thoraciques, à plat ventre sur l'avant-bras, jamais de compressions abdominales.
- [ ] `lib/fiches-secours.ts:32` : retirer « Aucun pouls perceptible » (la prise de pouls n'est pas recommandée aux non-soignants).
- [ ] `lib/fiches-secours.ts:172-175` : retirer « surélevez le membre » (abandonné depuis 2015).
- [ ] `lib/fiches-secours.ts:220` : remplacer « dans les 30 minutes » par « utile jusqu'à 3 heures après la brûlure ».
- [ ] `lib/fiches-secours.ts:302` : nuancer la PLS et le rachis (les voies aériennes priment chez l'inconscient qui respire).
- [ ] `lib/fiches-secours.ts:533` : remplacer « avec du sable » par « avec une carte rigide ou une pince, rincer à l'eau de mer ».
- [ ] `lib/alertes.ts:181` : corriger la coquille « Mouiller-vous ».

### 2.10 Bannière d'accueil et notifications client — MOYEN

- [ ] `components/home/AlertBanner.tsx:44` : supprimer le département par défaut `'75'` ; ne rien afficher tant qu'aucun département n'est choisi.
- [ ] `components/home/AlertBanner.tsx:76-84` : pause de la rotation au survol et au focus, bouton pause.
- [ ] `components/home/AlertBanner.tsx:94` : `role="status"` seul, retirer `aria-live` du contenu tournant.
- [ ] `components/home/AlertBanner.tsx:86-94` : réserver la hauteur pour éviter le décalage de mise en page.
- [ ] `lib/notifications.ts:235` et `components/alertes/NotificationPrompt.tsx:38,60` : supprimer `checkAndNotifyAlerts` (doublon du push serveur, sans département).

### 2.11 Départements : source unique — MOYEN

- [ ] Créer `lib/departements.ts` : `{ code, nom, centroide, bbox, risqueIncendie }` pour les 101 départements.
- [ ] Remplacer les tables dupliquées : `components/alertes/DepartmentSelector.tsx:23-49`, `lib/meteo-france.ts:46-74`, `app/api/vigilance/route.ts:37-64`, `app/api/vigicrues/route.ts:28-54`, `lib/geolocation.ts:5-102`, `app/api/air-quality/route.ts:37-48`, listes incendie de `alerts:174`, `fire-risk:27-41`, `meteo-forets:31-48`.
- [ ] `app/api/air-quality/route.ts:121-127` : renvoyer `null` pour un département inconnu au lieu de retomber sur Paris.
- [ ] Passer `dept` par `sanitizeDepartmentCode()` et utiliser `Object.hasOwn` dans `air-quality:101-116`, `fire-risk:116-133`, `vigicrues:126`, `meteo-forets:52`.

### 2.12 Saisons — MOYEN

- [ ] `app/conseils-saison/page.tsx` et `app/conseils-saison/[id]/page.tsx` : `export const revalidate = 86400` (saison figée à la date du build), ou calcul côté client dans un effet comme `DailyTip.tsx:52-59`.
- [ ] `components/home/SeasonalTips.tsx` : même traitement.

---

## Phase 3 — Fondations (en continu)

### 3.1 Sécurité — MOYEN / FAIBLE

- [ ] Rate limiting : appliquer `rateLimited` sur `/api/vigilance`, `/api/air-quality`, `/api/fire-risk`, `/api/meteo-forets`, `/api/vigicrues`, `/api/health`, `/api/widget/emergency`, `/api/notifications/vapid-key`.
- [ ] Envisager un limiteur distribué (Upstash Ratelimit) ou une règle WAF Vercel sur `/api/notifications/subscribe`.
- [ ] `next.config.mjs:95-99` : retirer `https://*.supabase.co` de `connect-src` et `fonts.googleapis.com` / `fonts.gstatic.com` de `style-src` / `font-src` (inutilisés) ; supprimer la règle runtime Google Fonts `:71-82`.
- [ ] CSP avec nonce par requête via middleware et `'strict-dynamic'` (après la montée de version Next, cf. 3.4).
- [ ] `worker/index.js:28,56,62-68` : résoudre l'URL avec `new URL(url, self.location.origin)` et n'ouvrir que si l'origine est identique, sinon `/alertes` ; remplacer `includes` par une comparaison d'origine.
- [ ] `app/api/health/route.ts:14-31` : réduire la réponse publique à `status`, ou ajouter `Cache-Control: s-maxage=30`.
- [ ] `components/urgences/LocationFinder.tsx:90,96` et `app/defibrillateurs/page.tsx:72` : `window.open(url, '_blank', 'noopener,noreferrer')`.
- [ ] `.github/workflows/ci.yml` : `permissions: { contents: read }`, épingler les actions par SHA, ajouter `concurrency` et `timeout-minutes`.
- [ ] Ajouter `.github/dependabot.yml`.
- [ ] `supabase/migrations` : par hygiène, `REVOKE ALL ON push_subscriptions, sent_notifications FROM authenticated;`.
- [ ] `lib/supabase.ts:11-18,42-46` : supprimer `getSupabase()` et le proxy `supabase` (client anon jamais utilisé).
- [ ] RGPD : définir une rétention des abonnements silencieux et l'indiquer dans `app/confidentialite/page.tsx`.

### 3.2 PWA — MOYEN / FAIBLE

- [ ] `next.config.mjs` : règle runtime `NetworkFirst` ciblée sur `/api/alerts` (`networkTimeoutSeconds: 5`, `maxAgeSeconds: 3600`) pour un dernier état connu hors-ligne ; afficher « Données du HH:MM » via `lastUpdate` dans `AlertsList.tsx`.
- [ ] `components/alertes/AlertsList.tsx:85` et `components/home/AlertBanner.tsx:70` : suspendre le polling quand l'onglet est caché (`visibilitychange`).
- [ ] Supprimer `lib/idb-cache.ts` et la dépendance `idb` (jamais branchés), ou les brancher réellement.
- [ ] `app/layout.tsx:41-47` : `viewportFit: 'cover'` ; `components/layout/BottomNav.tsx:50` : `pb-[env(safe-area-inset-bottom)]` ; `components/layout/EmergencyFab.tsx:39` : `bottom-[calc(5rem+env(safe-area-inset-bottom))]`.
- [ ] `worker/index.js:22-23` et `lib/notifications.ts:85-86` : `icon` et `badge` en PNG (`/icons/icon-192x192.png`).
- [ ] `worker/index.js:59-64` : `if ('navigate' in client)` et `.catch(() => clients.openWindow(url))`.
- [ ] `public/manifest.json` : ajouter `id`, `scope`, `screenshots`, `display_override` ; `orientation: 'any'` ; `background_color` aligné sur le fond de page ; raccourcis en PNG 96 px.
- [ ] `app/layout.tsx:42` : `themeColor` en tableau avec `media` pour le mode sombre.
- [ ] `app/offline/page.tsx` : bouton « Réessayer » et liste des fiches en cache (`caches.open('secours-fiches').keys()`, filtrer `_rsc`).
- [ ] `next.config.mjs:22,36,49` : remplacer les regex non ancrées par des matchers par fonction (`url.origin`, `request.mode === 'navigate'`).
- [ ] Remplacer `next-pwa` (non maintenu) par `@serwist/next`.

### 3.3 Architecture et code — ÉLEVÉ / MOYEN / FAIBLE

- [ ] `components/layout/Header.tsx:6` : charger `GlobalSearch` en `next/dynamic` au premier clic ; construire un index de recherche léger (titre, description, lien) côté serveur au lieu d'importer `lib/fiches-secours.ts` entier dans le layout.
- [ ] `instrumentation-client.ts:9-10` : charger Replay à l'idle via `Sentry.addIntegration(Sentry.replayIntegration())` ou le retirer (107 kB gzip de JS partagé).
- [ ] Retirer `'use client'` des composants sans interactivité : `components/ui/Card.tsx`, `components/ui/Button.tsx`, `components/layout/Footer.tsx`, `components/home/SeasonalTips.tsx`, `components/home/EmergencyNumbers.tsx`, `components/alertes/VigilanceMap.tsx` ; et des modules non-React `lib/theme.ts`, `lib/geolocation.ts`, `lib/favorites-storage.ts`, `lib/checklist-storage.ts`, `lib/notifications.ts`.
- [ ] Pages entièrement client à découper (feuille interactive en enfant, page serveur avec `metadata`) : `app/urgences/page.tsx`, `app/defibrillateurs/page.tsx`, `app/contact/page.tsx`, `app/cgu/page.tsx`, `app/confidentialite/page.tsx`, `app/mentions-legales/page.tsx`, `app/alertes/[id]/page.tsx`.
- [ ] `components/alertes/DepartmentSelector.tsx:134,193` : dériver `isGeolocationSupported()` dans un `useEffect` (risque d'erreur d'hydratation).
- [ ] `components/alertes/AlertsList.tsx:41-87` : `AbortController`, garde contre les réponses obsolètes, séparer `loading` de `refreshing`.
- [ ] `app/defibrillateurs/page.tsx:63,81-86` : supprimer le double fetch au premier geolocate, retirer le `eslint-disable`.
- [ ] `setTimeout` sans nettoyage : `components/urgences/FavoriteButton.tsx:27`, `components/urgences/ShareLocation.tsx:101`, `components/layout/InstallPrompt.tsx:52`.
- [ ] `components/layout/Header.tsx:59` : `useCallback` sur `onClose` passé à `GlobalSearch`.
- [ ] Types : remplacer les `response.json()` non typés (`alerts:74,112,143,186,236`, `cron:51`, `fire-risk:189`, `AlertsList:51,73`, `AlertBanner:47`, `defibrillateurs/page:36`) par des type guards ou schémas Zod ; supprimer les types morts de `lib/types/api-responses.ts:94-172` ; partager `Defibrillateur` via `lib/types`.
- [ ] `app/api/vigilance/route.ts:256-265` : remplacer les six `!` par une construction typée.
- [ ] Supprimer le code mort : `lib/meteo-france.ts`, `components/ui/Button.tsx`, `app/api/widget/emergency/route.ts`, `app/api/notifications/vapid-key/route.ts` (le client lit `NEXT_PUBLIC_VAPID_PUBLIC_KEY`), `components/urgences/FavoriteHeaderButton.tsx`, exports orphelins (`getSavedLocation`, `resetAllChecklists`, `getOverallProgress`, `getConseilsSaisonActuelle`, `getSaisonsSummary`, `unsubscribeFromPush`, `effectiveTheme`).
- [ ] Barrels `components/*/index.ts` : supprimer ceux qui ne sont pas importés (`alertes`, `home`, `prevention`, `secours`, `urgences`) ou les compléter.
- [ ] Créer `lib/nav.ts` (navigation définie dans `BottomNav`, `SideNav`, `Header`, `GlobalSearch`), `lib/ui-tokens.ts` (couleurs de niveau et d'urgence définies à cinq endroits), `lib/storage-keys.ts` (clé `'secucitoyen_department'` en dur dans trois fichiers).
- [ ] Consommer `lib/numeros-urgence.ts` dans `components/home/EmergencyNumbers.tsx`, `components/layout/EmergencyFab.tsx`, `app/offline/page.tsx` au lieu de recopier les numéros.
- [ ] `lib/geolocation.ts:174-179` : retirer l'écriture localStorage de `getCurrentPosition()` (effet de bord) ; factoriser la géolocalisation dupliquée dans `LocationFinder.tsx:43-83` et `ShareLocation.tsx:17-57` en un hook `useGeolocation()`.
- [ ] styled-jsx (`EmergencyFab.tsx:120-153`, `GlobalSearch.tsx:178-192`, illustrations) → `keyframes`/`animation` dans `tailwind.config.ts` ; supprimer le doublon `.animate-slide-up` (`globals.css:51` vs `EmergencyFab:131`).
- [ ] `app/globals.css:33-37` : scoper `transition-colors` à une classe posée pendant le changement de thème au lieu de `*`.
- [ ] `worker/index.js:76` : retirer le `console.log`.
- [ ] Nombres magiques : constantes partagées pour `5 * 60 * 1000`, `3000`, 7 jours.

### 3.4 Dépendances et environnement — ÉLEVÉ / FAIBLE

- [ ] Migrer vers Next 15.5 LTS (ou 16) ; mettre à jour `eslint-config-next`, `eslint`, `@next/bundle-analyzer` en cohérence.
- [ ] CI : Node 22 (`.nvmrc` + `node-version-file`) et `"engines": { "node": ">=22" }` dans `package.json`.
- [ ] Supprimer les dépendances inutilisées : `ts-jest`, `playwright` (doublon de `@playwright/test`), `@jest/globals`, `@testing-library/user-event`, `idb` (si 3.2 supprime `idb-cache.ts`).
- [ ] Mettre à jour : `@supabase/supabase-js`, `@sentry/nextjs`, `@playwright/test`, `jest` et `jest-environment-jsdom`, `@testing-library/*`, `sharp`.
- [ ] `.env.local.example:3` : retirer `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (inutilisé).

### 3.5 Tests et CI — ÉLEVÉ / MOYEN

- [ ] Créer `__tests__/api/alerts.test.ts` : `fetch` mocké par URL, vérifier mapping des niveaux incendie, dédoublonnage, tri, comportement quand une source échoue ou renvoie `degraded`.
- [ ] Extraire `parseVigilanceData` dans `lib/vigilance-parse.ts` et le tester (modèle : `lib/vigicrues-parse.ts`).
- [ ] `app/api/notifications/send/route.ts:10-11` : lire les clés VAPID dans le handler (pas à l'import) pour rendre le chemin heureux testable ; tester emoji de niveau, `toSafeRelativePath`, purge 404/410.
- [ ] Tester `app/api/defibrillateurs` : haversine, filtre rayon, tri, bornes, 400 sans lat/lon.
- [ ] Tester le cron : dédoublonnage, envoi, purge, échec amont → statut non-2xx (mock Supabase chaînable).
- [ ] `__tests__/api/cron-check-alerts.test.ts:54` : remplacer `not.toBe(401)` par une assertion réelle.
- [ ] `__tests__/lib/favorites-storage.test.ts` et `FavoriteButton.test.tsx` : utiliser le `localStorage` de jsdom et asserter via `getFavorites()`.
- [ ] `__tests__/lib/rate-limit.test.ts` : expiration de fenêtre et `sweep` avec fake timers.
- [ ] `jest.config.js` : référencer `jest.setup.ts` dans `setupFilesAfterEnv` ; inclure `app/**` dans `collectCoverageFrom` ; ajouter un seuil de couverture.
- [ ] E2E : mode hors-ligne, prompt d'installation, page Alertes avec APIs externes mockées (variable `E2E_MOCK_EXTERNAL=1` lue par `fetchWithCircuitBreaker`), mode sombre, recherche globale, persistance favoris et check-lists, page DAE avec `context.grantPermissions(['geolocation'])`.
- [ ] Ajouter `@axe-core/playwright` et un test d'accessibilité sur les six pages principales.
- [ ] `e2e/responsive.spec.ts:39` : remplacer `waitForTimeout(300)` par `expect.poll` ; ajouter les largeurs 768 et 1024.
- [ ] `playwright.config.ts` : ajouter le reporter `github` ; envisager `next build && next start` en local aussi pour exercer le worker.
- [ ] `.github/workflows/ci.yml` : supprimer le job `build` redondant (ou publier `.next` en artefact), installer uniquement Chromium et WebKit.

### 3.6 Accessibilité, SEO, UI — ÉLEVÉ / MOYEN / FAIBLE

- [ ] Métadonnées : exporter `metadata` sur `app/urgences`, `app/defibrillateurs`, `app/contact`, `app/cgu`, `app/confidentialite`, `app/mentions-legales`, `app/conseils-saison` ; `generateMetadata` sur `app/conseils-saison/[id]` et `app/alertes/[id]`.
- [ ] `app/urgences/[number]/page.tsx:23` et `app/prevention/[id]/page.tsx:21` : retirer le suffixe manuel « - SécuCitoyen » (doublon du template).
- [ ] `app/secours/[id]/page.tsx:24-28` : répéter `openGraph.images` (pas de fusion profonde) et ajouter `alternates.canonical`.
- [ ] Créer `app/not-found.tsx` en français avec liens `tel:` et retour accueil.
- [ ] `app/sitemap.ts:5-23` : importer les modules de données au lieu de recopier les identifiants ; `lastModified` réaliste.
- [ ] `app/page.tsx:76,80` et `app/secours/page.tsx:38` : dériver les compteurs de `fichesSecours.length` et `emergencyNumbers.length` (« 15 fiches » et « 8 numéros » sont faux).
- [ ] `app/layout.tsx` : lien d'évitement « Aller au contenu » (`sr-only focus:not-sr-only`) et `id="main"` sur `<main>`.
- [ ] `components/layout/BottomNav.tsx:49-65` : `aria-current="page"` via `usePathname`, `aria-label` sur `<nav>`.
- [ ] `components/layout/Header.tsx:46-143` : `aria-expanded` / `aria-controls` sur le burger, fermeture à Échap, gestion du focus, `<Link>` au lieu de `<a>`.
- [ ] `components/layout/GlobalSearch.tsx:17-37` : piège de focus (ou `inert` sur le reste) et retour du focus sur le bouton loupe à la fermeture.
- [ ] `components/prevention/ChecklistContent.tsx:119-127` : `role="checkbox"` et `aria-checked` ; `components/secours/FicheContent.tsx:142-145` : `aria-pressed`.
- [ ] `app/urgences/page.tsx:108-127` et `components/urgences/FavoriteNumbers.tsx:36-51` : sortir `FavoriteButton` du `Link` (bouton imbriqué dans un lien).
- [ ] Cibles tactiles ≥ 44 px : `Header.tsx:36-44`, `ThemeToggle.tsx:15-20`, boutons « Fermer » de `InstallPrompt.tsx:155-163`, `NotificationPrompt.tsx:118-126`, `UpdatePrompt.tsx:67-75`, `AlertBanner.tsx:117-128`, `DepartmentSelector.tsx:194-203`.
- [ ] `app/globals.css` : bloc `@media (prefers-reduced-motion: reduce)` global ; images fixes pour les illustrations de gestes.
- [ ] Sous-en-têtes sticky : `top-16` sur `app/secours/[id]/page.tsx:59`, `app/urgences/[number]/page.tsx:42`, `app/alertes/[id]/page.tsx:65`, `app/prevention/[id]/page.tsx:36`.
- [ ] `components/secours/FicheContent.tsx:9-13` : retirer `ssr: false` sur les illustrations et réserver l'espace.
- [ ] Mode sombre : variantes `dark:` dans `FicheContent.tsx:129-176` et `ChecklistContent.tsx:92-125` (modèle : `app/urgences/[number]/page.tsx:98-137`).
- [ ] Tablette : appliquer `max-w-app md:max-w-2xl` à `BottomNav.tsx:50`, `EmergencyFab.tsx:40`, `GlobalSearch.tsx:67`.
- [ ] Hiérarchie de titres : marque en `<p>` dans `Header.tsx:33`, un seul `<h1>` par page.
- [ ] `aria-hidden` sur les emojis et chevrons décoratifs (`app/page.tsx:102,140`, `secours/page.tsx:44,64`, `FicheContent.tsx:75,115,130,185,200`, `AlertsList.tsx:128,231`).
- [ ] `components/alertes/AlertsList.tsx:240,249` : libellés via `categoryLabels` ; `app/defibrillateurs/page.tsx:78` : « 1,5 km ».
- [ ] `components/layout/ThemeToggle.tsx:18` : `aria-label` en français.
- [ ] `components/home/AlertBanner.tsx:102` : pas de texte sous 12 px.

### 3.7 Contenu et documentation — MOYEN / FAIBLE

- [ ] `app/contact/page.tsx:15-19` : brancher un envoi réel (route + service) ou remplacer le formulaire par un `mailto:` explicite.
- [ ] `app/mentions-legales/page.tsx:27-32,42-47` et `app/confidentialite/page.tsx:41-46` : compléter les encadrés « Complétez cette section » (obligation LCEN).
- [ ] `app/confidentialite/page.tsx:66` : retirer « Préférence de langue (FR/EN/IT) ».
- [ ] `lib/numeros-urgence.ts` : ajouter 191, 197, 116 117, 116 006, 3018, 39 77 ; vérifier la mention « accessible sans carte SIM » (`:76`).
- [ ] `README.md:112,135-136` : retirer `components/favorites/` et `data/emergency-numbers.ts` (inexistants) ; corriger « 15 fiches ».
- [ ] `PlanAction.md:87,255-257` : corriger les statuts (2.1 et 2.4 sont annulés, 3.1 non branché, cron GitHub Actions et non Vercel).

---

## Vérifications à faire en production (non couvertes par l'audit)

- [ ] État du service worker sur https://secucitoyen.vercel.app après déploiement de la Phase 1 (DevTools › Application › Service Workers : « activated » ; Cache Storage : `secours-fiches` = 14, `detail-pages` = 12). Avant la Phase 1, le worker n'était jamais enregistré : les abonnements push existants en base ont probablement tous été créés en développement, à vérifier.
- [ ] Migration `004_secure_rls.sql` effectivement appliquée sur Supabase (le client anon ne doit rien lire dans `push_subscriptions`).
- [ ] Format réel des codes `CdEntVigiCru` renvoyés par Vigicrues pour valider l'extraction du département (`app/api/vigicrues/route.ts:99-105`).
- [ ] Relancer les tests Playwright (dernier rapport du 9 août).
