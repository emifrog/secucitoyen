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

## Phase 2 — Chaîne d'alertes et données — FAITE le 10/09/2026

Validation : `tsc` et `next lint` sans erreur, 166 tests Jest (47 nouveaux : agrégateur,
départements, géolocalisation, seuils AQI, disjoncteur, validation push), suite Playwright
sur le build de production. Deux actions restent à faire hors code (déclencheur externe,
migration 005 à appliquer sur Supabase).

### 2.1 Page détail d'alerte sur données réelles — ÉLEVÉ

- [x] `app/alertes/[id]/page.tsx` : charge `/api/alerts?dept=<dept sauvegardé>` puis, à défaut, la vue nationale ; recherche par identifiant ; `AbortController` au démontage.
- [x] `lib/alertes.ts` : `mockAlerts` supprimé.
- [ ] `generateMetadata` : impossible sur une page `'use client'` → à faire avec le découpage serveur/client de la Phase 3 (3.3).

### 2.2 Géolocalisation fiable — ÉLEVÉ

- [x] Géocodage inverse officiel via la nouvelle route `app/api/geocode/route.ts` (geo.api.gouv.fr, coordonnées arrondies à 3 décimales, cache 24 h, rate limit, disjoncteur `geo-api-gouv`) ; `lib/geolocation.ts` réécrit : `resolveDepartmentFromCoords()` = API d'abord, plus proche point de référence en repli avec `estimated: true`. Les rectangles chevauchants ont disparu.
- [x] DROM (971, 972, 973, 974, 976) présents dans `lib/departements.ts` ; le sélecteur propose la liste complète via un `<select>` en plus des raccourcis.
- [x] `components/alertes/DepartmentSelector.tsx` : « (GPS) » quand l'API a répondu, « (estimé, vérifiez) » + bandeau explicatif en repli ; support géoloc évalué après montage (plus de risque d'hydratation).
- [x] `__tests__/lib/geolocation.test.ts` réécrit (API mockée : Neuilly → 92 ; repli : Lyon → 69, Pointe-à-Pitre → 971, La Réunion → 974 ; code invalide ignoré) ; `__tests__/lib/departements.test.ts` ajouté (101 entrées, codes valides, 13 cas de plus proche point).

### 2.3 Indice feu étiqueté comme estimation — ÉLEVÉ

- [x] Source `Estimation SécuCitoyen (non officielle)` (`lib/sources/meteo-forets.ts`, `lib/sources/fire-risk.ts`) ; titres « Risque incendie estimé » ; lien vers meteofrance.com/meteo-des-forets dans les conseils et les réponses API.
- [x] Plafonné à orange : `foretNiveauToLevel()` dans l'agrégateur et `calculateFireRiskLevel()` ne renvoient jamais rouge ; le cron n'envoie de toute façon que les sources officielles.
- [x] `lib/fire-index.ts` : descriptions marquées « (estimation) », renvoi vers la préfecture et la Météo des forêts.

### 2.4 Seuils qualité de l'air — ÉLEVÉ

- [x] `lib/sources/air-quality.ts` : bandes EAQI (vert ≤ 40, jaune ≤ 60, orange ≤ 80, rouge > 80) ; commentaire corrigé (CAMS via Open-Meteo).
- [x] lat/lon validés (bornes, `NaN` rejeté) et arrondis à 2 décimales ; département inconnu → aucune donnée (plus de repli sur Paris).
- [x] `__tests__/lib/air-quality-index.test.ts`.

### 2.5 Cron idempotent et robuste — ÉLEVÉ

- [x] `supabase/migrations/005_sent_notifications_unique.sql` : dédoublonnage puis `UNIQUE (alert_id)`.
- [x] `app/api/cron/check-alerts/route.ts` réécrit : `upsert(..., { onConflict: 'alert_id', ignoreDuplicates: true }).select()` **avant** l'envoi, envoi uniquement si la ligne a été créée.
- [x] Appel direct de l'agrégateur (plus de `fetch` HTTP vers soi-même) ; statut 502 si la vigilance Météo-France est indisponible (le workflow échoue et l'incident est visible).
- [x] Envois par lots de 10 (`Promise.allSettled`).
- [x] Alerte sans département : ignorée et comptée (`skippedNoDept`), jamais diffusée à tous les abonnés nationaux.
- [x] `maxDuration` : défini par configuration de segment (`export const maxDuration = 60` sur le cron, `30` sur `/api/alerts`) plutôt que dans `vercel.json` (équivalent, et versionné avec la route).
- [x] `.github/workflows/cron-alerts.yml` : `permissions` (contents: read, issues: write), `concurrency`, `timeout-minutes: 5`, secret via `env:`, `PRODUCTION_URL` lu depuis `vars.` (secret encore accepté), code HTTP vérifié, step `if: failure()` qui ouvre ou commente une issue `cron-alerts`.
- [ ] **Action manuelle** : appliquer la migration 005 sur Supabase, créer la variable de dépôt `PRODUCTION_URL`, et mettre en place un déclencheur externe redondant (cron-job.org ou UptimeRobot) sur `/api/cron/check-alerts`.

### 2.5 bis Défibrillateurs : la source amont n'a jamais fonctionné — CRITIQUE (découvert en Phase 2)

Le test de fumée après la Phase 1 a révélé que la route DAE renvoyait 503 en permanence :
le jeu de données `georef-france-defibrillateur-automatique-externe-dae` **n'existe pas** sur
OpenDataSoft et la clause `geo_point_2d within (...)` est une syntaxe ODSQL invalide. Avant la
Phase 1, chaque recherche de DAE affichait donc les défibrillateurs fictifs ; la fonctionnalité
n'a jamais interrogé de données réelles.

- [x] `lib/sources/defibrillateurs.ts` (nouveau) + `app/api/defibrillateurs/route.ts` réduite à une enveloppe : seul jeu national interrogeable par rayon, `osm-france-defibrillator` (27 943 DAE, OpenStreetMap, ODbL, schéma Géo'DAE) avec `within_distance(meta_geo_point, geom'POINT(lon lat)', Nm)` ; champs mappés (`name`, `adr_num`+`adr_voie`, `com_nom`, `com_cp`, `acc`/`acc_lib`, `disp_j`/`disp_h`, `etat_fonct`, `meta_osm_id`) ; coordonnées arrondies à 3 décimales pour le cache ; `Cache-Control` 1 h ; source et attribution renvoyées.
- [x] `lib/types/api-responses.ts` : `OpenDataSoftDAERecord` aligné sur le schéma réel.
- [x] `app/defibrillateurs/page.tsx` : bandeau « données contributives (OpenStreetMap), le régulateur du 15/112 connaît les DAE officiels ».
- [x] `__tests__/api/defibrillateurs.test.ts` : mapping, filtre rayon, tri, bornes, 400, 503 sans DAE fictif.
- [ ] Vérifié en production après déploiement : une recherche renvoie des DAE réels (test de fumée local OK : 171 DAE dans 1,5 km autour de Notre-Dame).
- [ ] Si la base officielle Géo'DAE (geodae.atlasante.fr) ouvre une API de requête, la préférer aux données OSM.

### 2.6 Validation des abonnements push — ÉLEVÉ

- [x] `app/api/notifications/subscribe/route.ts` : `p256dh` (`^[A-Za-z0-9_-]{87,88}$`) et `auth` (`^[A-Za-z0-9_-]{22}$`) obligatoires, seules ces deux clés sont stockées, corps > 4 Ko → 413, JSON invalide → 400. Tests ajoutés.
- [x] Purge SQL des endpoints hors allowlist et des clés au mauvais format : incluse dans la migration 005 (même liste de suffixes que `lib/validation.ts`).
- [x] `app/api/notifications/send/route.ts` : `level` validé, titre ≤ 120 et corps ≤ 500 caractères, `tag` assaini, icônes PNG.

### 2.7 Agrégateur d'alertes — ÉLEVÉ

- [x] `lib/sources/{types,vigilance,air-quality,vigicrues,meteo-forets,fire-risk,aggregate}.ts` : chaque source est une fonction pure (`SourceResult<T>` : `items`, `source`, `degraded`, `error`), l'agrégateur `aggregateAlerts()` les appelle en parallèle via `Promise.allSettled` et renvoie `alerts`, `sources`, `degraded`, `sourceStatus`.
- [x] `app/api/alerts/route.ts` réduit à une enveloppe (rate limit, validation, `aggregateAlerts`, `Cache-Control: s-maxage=300, stale-while-revalidate=600`). Les cinq routes sources deviennent des enveloppes avec rate limit et `Cache-Control`.
- [x] Boucles départementales de meteo-forets et fire-risk parallélisées (`Promise.allSettled`) ; en vue par département, une seule requête Open-Meteo au lieu de 29.
- [x] Exports `revalidate` contradictoires supprimés (routes réécrites, `app/alertes/page.tsx`).
- [x] `fetchVigilance({ minLevel: 'orange' })` : le cron demande `color_id>2` (plus de troncature des jaunes en épisode national).
- [x] `__tests__/lib/aggregate.test.ts` : agrégation par département, plafonnement incendie, bandes AQI, dégradation sur exception et sur 5xx, `severeOnly`, crues en vue nationale.

### 2.8 Disjoncteur et retry — ÉLEVÉ

- [x] `lib/api-utils.ts` : une réponse 5xx persistante compte comme un échec de la source (le circuit s'ouvre enfin sur une source en 503 continu) ; 4xx jamais comptée.
- [x] `clearTimeout` dans un `finally` (plus de timer pendant après un rejet).
- [x] Commentaires alignés : un timeout est retenté comme une erreur réseau.
- [x] Tests : ouverture sur 5xx, 4xx ignorées, half-open et fermeture à 5 min (fake timers), aucun timer pendant.

### 2.9 Fiches de secours — ÉLEVÉ / MOYEN

- [x] Étouffement : étape « Nourrisson (moins d'un an) » (tapes dorsales + compressions thoraciques à deux doigts, jamais abdominales), interdit ajouté, description mise à jour.
- [x] Arrêt cardiaque : « Aucun pouls perceptible » remplacé par « Ne cherchez pas le pouls ».
- [x] Hémorragie : « surélevez » retiré, étape « Allongez et couvrez ».
- [x] Brûlure : refroidissement utile jusqu'à 3 heures.
- [x] PLS : nuance traumatisme (limiter les mouvements du cou, mais PLS quand même).
- [x] Méduse : carte rigide ou pince, sans sable.
- [x] `lib/alertes.ts` : coquille « Mouiller-vous » corrigée.

### 2.10 Bannière d'accueil et notifications client — MOYEN

- [x] `components/home/AlertBanner.tsx` : plus de département par défaut (rien tant qu'aucun département n'est choisi), lien vers le détail de l'alerte courante.
- [x] Rotation en pause au survol et au focus.
- [x] `role="status"` seul.
- [ ] Hauteur réservée : non faite volontairement (une bande vide permanente sur l'accueil serait pire que le décalage ponctuel quand une alerte orange/rouge existe).
- [x] `checkAndNotifyAlerts` et `showAlertNotification` supprimés de `lib/notifications.ts` ; `NotificationPrompt` ne notifie plus côté client.

### 2.11 Départements : source unique — MOYEN

- [x] `lib/departements.ts` : 101 départements `{ code, nom, lat, lon, risqueIncendie? }` + `getDepartement`, `getDepartementNom`, `DEPARTEMENTS_RISQUE_INCENDIE`, `findNearestDepartement`, `haversineDistance`.
- [x] Tables dupliquées remplacées dans le sélecteur, la vigilance, Vigicrues, la qualité de l'air, meteo-forets, fire-risk et l'agrégateur ; `lib/meteo-france.ts` (code mort) supprimé.
- [x] Qualité de l'air : département inconnu → `alert: null`, plus de repli sur Paris.
- [x] `sanitizeDepartmentCode()` appliqué dans toutes les routes ; les lookups passent par une `Map` (plus de `departmentCenters[deptCode]` sur un objet brut).

### 2.12 Saisons — MOYEN

- [x] `export const revalidate = 86400` sur `app/conseils-saison/page.tsx`, `app/conseils-saison/[id]/page.tsx` et `app/page.tsx`.
- [x] `components/home/SeasonalTips.tsx` : composant serveur (plus de `'use client'`, plus de divergence d'hydratation, quatre saisons retirées du bundle client).

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
