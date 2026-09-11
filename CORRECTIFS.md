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

## Phase 3 — Fondations — FAITE le 10/09/2026 (sauf items marqués)

Validation : `tsc` et `next lint` sans erreur, Jest (21 suites, 187 tests), build Next 15 +
Serwist, vérification du précache (65 entrées, 0 en 404, `/` et `/offline` précachés, worker
activé et caches `secours-fiches` = 14 / `detail-pages` = 17), suite Playwright complète sur les
3 projets (navigation, responsive 320/768/1024/1280, hors-ligne, page Alertes mockée, axe-core
WCAG 2.1 A/AA sur 7 pages sans violation).

### 3.1 Sécurité — MOYEN / FAIBLE

- [x] Rate limiting appliqué sur toutes les routes sources (vigilance, air-quality, fire-risk, meteo-forets, vigicrues, geocode) ; `/api/widget/emergency` et `/api/notifications/vapid-key` supprimées (code mort).
- [ ] Limiteur distribué (Upstash) ou règle WAF Vercel sur `/api/notifications/subscribe` : à décider (coût/abonnement), le limiteur mémoire + validation stricte des clés + cache CDN restent en place.
- [x] CSP : `*.supabase.co`, `fonts.googleapis.com`, `fonts.gstatic.com` retirés ; règle runtime Google Fonts supprimée avec next-pwa.
- [ ] CSP avec nonce + `'strict-dynamic'` : reporté (le script de thème inline et styled-jsx des illustrations imposent encore `'unsafe-inline'`).
- [x] Service worker (`app/sw.ts`) : URL de notification résolue et limitée à la même origine (sinon `/alertes`), comparaison d'origine stricte, repli `openWindow` si `navigate` échoue.
- [ ] `/api/health` : réponse inchangée (utilisée par UptimeRobot et par la page Alertes pour les sources dégradées) ; à restreindre si abus constaté.
- [x] `window.open(..., 'noopener,noreferrer')` dans LocationFinder et la recherche de DAE.
- [x] `.github/workflows/ci.yml` : `permissions: contents: read`, actions épinglées par SHA (checkout v4.4.0, setup-node v4.4.0, upload-artifact v4.6.2), `concurrency`, `timeout-minutes`, Node 22 via `.nvmrc`, job build redondant supprimé, navigateurs Playwright limités à Chromium + WebKit.
- [x] `.github/dependabot.yml` (npm hebdomadaire groupé mineures/patchs, majeures Next/React exclues ; actions GitHub).
- [x] `REVOKE ... FROM authenticated` : inclus dans la migration 005 (Phase 2).
- [x] `lib/supabase.ts` : client anon et proxy supprimés, seul `getSupabaseAdmin()` subsiste.
- [x] RGPD : la politique de confidentialité décrit désormais les abonnements push (données conservées, rétention, purge à l'expiration, historique 7 jours) et le géocodage inverse.

### 3.2 PWA — MOYEN / FAIBLE

- [x] **next-pwa remplacé par Serwist** (`@serwist/next` 9.5) : service worker en TypeScript dans `app/sw.ts` (précache des assets + `/` + `/offline`, préchauffage des fiches et numéros, stratégies runtime, SKIP_WAITING, push) ; `worker/` supprimé ; exclusions `.map` / `app-build-manifest.json` / `chunks/pages` conservées ; `register: false` (enregistrement par `ServiceWorkerRegister`).
- [x] Règle `NetworkFirst` sur `/api/alerts` (timeout 5 s, 1 h) : hors-ligne, la liste garde le dernier état connu ; `AlertsList` affiche « Données du HH:MM » et, en erreur, la date des données affichées.
- [x] Polling suspendu quand l'onglet est caché (`visibilitychange`) dans `AlertsList` et `AlertBanner`, rafraîchissement immédiat au retour.
- [x] `lib/idb-cache.ts` et la dépendance `idb` supprimés.
- [x] `viewportFit: 'cover'` ; zones sûres iOS sur le header, la barre basse, le FAB, les invites d'installation et de mise à jour.
- [x] Icônes de notification en PNG (worker, `lib/notifications.ts`, route `send`, cron).
- [x] `client.navigate()` protégé avec repli `openWindow`.
- [x] `public/manifest.json` : `id`, `scope`, `display_override`, `orientation: any`, `background_color` aligné sur le fond de page, raccourcis en PNG 96 px (générés par `scripts/generate-icons.mjs`). Pas de `screenshots` (à produire à la main).
- [x] `themeColor` par thème (`media`).
- [x] `app/offline/page.tsx` : bouton « Réessayer », état en ligne/hors-ligne, liste des pages réellement en cache (`components/offline/CachedPagesList.tsx`).
- [x] Matchers par fonction (`url.origin`, `request.mode === 'navigate'`) pour toutes les règles de pages.

### 3.3 Architecture et code — ÉLEVÉ / MOYEN / FAIBLE

- [x] `GlobalSearch` chargé en `next/dynamic` au premier clic (l'index complet du contenu ne pèse plus sur le layout) ; `onClose` stabilisé par `useCallback`.
- [ ] Sentry Replay : configuration inchangée (`replaysOnErrorSampleRate: 1`), l'intégration n'est pas ajoutée explicitement ; à mesurer avec `npm run analyze` avant de trancher.
- [x] `'use client'` retiré de `Card`, `Footer`, `SeasonalTips`, `EmergencyNumbers`, `VigilanceMap` et des modules `lib/*` non-React ; `Button.tsx` supprimé.
- [x] Pages découpées en page serveur (avec `metadata` et `canonical`) + feuille client : `urgences` (page serveur directe), `defibrillateurs` (`components/defibrillateurs/DefibrillateursFinder.tsx`), `contact` (`components/contact/ContactForm.tsx`), `alertes/[id]` (`components/alertes/AlertDetail.tsx` + `generateMetadata`, `noindex`), `cgu`, `confidentialite`, `mentions-legales` (`noindex`), `conseils-saison` et `conseils-saison/[id]` (`generateMetadata`).
- [x] `DepartmentSelector` : support géoloc évalué après montage (Phase 2).
- [x] `AlertsList` : `AbortController` (une requête en vol), `loading` distinct de `refreshing`, libellés de filtres explicites.
- [x] Recherche de DAE : une seule source de déclenchement (position + rayon), plus de double fetch, requête précédente annulée, plus de `eslint-disable`.
- [x] `setTimeout` nettoyés (`FavoriteButton`, `ShareLocation`, `InstallPrompt`).
- [x] Types morts de `lib/types/api-responses.ts` supprimés ; `Defibrillateur` partagé via `lib/sources/defibrillateurs.ts` ; les `response.json()` des composants passent par des vérifications (`Array.isArray`, `=== true`). Pas de Zod (dépendance évitée).
- [x] Code mort supprimé : `lib/meteo-france.ts` (Phase 2), `lib/idb-cache.ts`, `components/ui/Button.tsx`, `app/api/widget/emergency`, `app/api/notifications/vapid-key`, `FavoriteHeaderButton`, exports orphelins (`resetAllChecklists`, `getConseilsSaisonActuelle`, `getSaisonsSummary`, `unsubscribeFromPush`, `effectiveTheme`, `getSupabase`) ; `getOverallProgress` désormais utilisé par `OverallProgress`.
- [x] Barrels inutilisés supprimés (`alertes`, `home`, `prevention`, `secours`, `urgences`) ; `ui/index.ts` réduit à `Card`.
- [x] `lib/nav.ts` (SideNav + menu burger), `lib/ui-tokens.ts` (urgences des fiches, priorités des check-lists, durées), `lib/storage-keys.ts` (toutes les clés localStorage), `lib/site.ts` (origine du site pour metadataBase, sitemap, robots).
- [x] `lib/numeros-urgence.ts` consommé par `EmergencyNumbers` et `EmergencyFab` (la page hors-ligne garde ses numéros en dur, volontairement, pour ne dépendre d'aucun module).
- [x] `getCurrentPosition()` sans effet de bord (Phase 2) ; hook `lib/hooks/useGeolocation.ts` utilisé par `LocationFinder` et `ShareLocation`.
- [x] styled-jsx retiré du FAB et de la recherche (`keyframes`/`animation` Tailwind : `slide-up`, `slide-down`, `pulse-ring`) ; doublon `.animate-slide-up` supprimé. Les 5 illustrations gardent leur styled-jsx (animations SVG spécifiques).
- [x] `transition-colors` global remplacé par une classe `theme-transition` posée 250 ms au changement de thème (`lib/theme.ts`).
- [x] `console.log` du worker supprimé avec `worker/index.js`.
- [x] Nombres magiques centralisés dans `TIMINGS` (`lib/ui-tokens.ts`).

### 3.4 Dépendances et environnement — ÉLEVÉ / FAIBLE

- [x] **Next 15.5.25 + React 19.3** : `params` asynchrones sur les pages dynamiques, `withSentryConfig` importé depuis `@sentry/nextjs/config`, `eslint-config-next` et `@next/bundle-analyzer` alignés. `eslint` reste en 8 (`next lint` est déprécié en 16 : migrer vers la CLI ESLint 9 / flat config lors du passage à Next 16).
- [x] Node 22 : `.nvmrc`, `node-version-file` en CI, `"engines": { "node": ">=22" }`.
- [x] Supprimés : `ts-jest`, `playwright`, `@jest/globals`, `@testing-library/user-event`, `idb`, `next-pwa`. Ajoutés : `@serwist/next`, `serwist`, `@axe-core/playwright`.
- [x] Mises à jour mineures appliquées (`@supabase/supabase-js`, `@sentry/nextjs`, `@playwright/test`, `jest`, `@testing-library/*`, `sharp`, `postcss`).
- [x] `.env.local.example` : clé `PUBLISHABLE_DEFAULT_KEY` retirée.
- [ ] `npm audit` : reste 8 avis (Next 15.5 : 1 modéré + `postcss` via Next ; `@serwist/next` : `browserslist`/`brace-expansion` transitifs build-time ; `js-yaml`, `fast-uri` corrigeables par `npm audit fix`). Aucun n'est exploitable à l'exécution sur Vercel ; Dependabot suivra les correctifs.

### 3.5 Tests et CI — ÉLEVÉ / MOYEN

- [x] Agrégateur testé (`__tests__/lib/aggregate.test.ts`, Phase 2) : mapping, plafonnement incendie, bandes AQI, dégradation, `severeOnly`, crues.
- [x] `parseVigilanceData` exportée depuis `lib/sources/vigilance.ts` et testée (`__tests__/lib/vigilance-parse.test.ts`).
- [ ] Route `send` : clés VAPID toujours lues à l'import ; seul le 401 est testé (le cron, qui partage la logique d'envoi, est couvert).
- [x] Route DAE testée (`__tests__/api/defibrillateurs.test.ts`, Phase 2).
- [x] Cron testé de bout en bout avec un mock Supabase chaînable et un rechargement du module par scénario : réclamation avant envoi, idempotence, sources non officielles et alertes sans département ignorées, endpoints expirés, 502 si Météo-France indisponible, `severeOnly`.
- [x] `not.toBe(401)` remplacé par des assertions réelles.
- [x] `FavoriteButton.test.tsx` : `localStorage` réel de jsdom, assertions via `getFavorites()`/`isFavorite()`, `aria-pressed` ; `EmergencyFab.test.tsx` : noms lus dans la source unique, test Échap + retour du focus (qui a révélé et fait corriger un bug réel du FAB).
- [ ] `__tests__/lib/rate-limit.test.ts` : expiration de fenêtre et `sweep` non couverts.
- [x] `jest.config.js` : `setupFilesAfterEnv` (jest-dom global), `app/api/**` inclus dans la couverture.
- [ ] Seuil de couverture : non posé (à fixer après une mesure stable ; la CI affiche le résumé).
- [x] E2E : hors-ligne (Phase 1), page Alertes et page de détail avec `/api/alerts` intercepté (`e2e/alertes.spec.ts`), bannière dégradée, menu burger clavier. Non faits : prompt d'installation, mode sombre, recherche globale, persistance favoris/check-lists, DAE avec géolocalisation mockée.
- [x] `@axe-core/playwright` + `e2e/a11y.spec.ts` (WCAG 2.1 A/AA) sur 7 pages.
- [x] `e2e/responsive.spec.ts` : `expect.poll` au lieu de `waitForTimeout`, largeurs 320/768/1024/1280, test tablette (FAB aligné sur la colonne de contenu).
- [ ] `playwright.config.ts` : reporter `github` non ajouté ; en local, `next dev` reste le serveur par défaut (`E2E_PWA=1` documenté pour le worker).
- [x] `ci.yml` : job `build` redondant supprimé, `npx playwright install --with-deps chromium webkit`, couverture affichée.

### 3.6 Accessibilité, SEO, UI — ÉLEVÉ / MOYEN / FAIBLE

- [x] Métadonnées (`title`, `description`, `canonical`) sur toutes les pages ; `generateMetadata` sur `conseils-saison/[id]` et `alertes/[id]` ; pages légales et détail d'alerte en `noindex`.
- [x] Suffixe « - SécuCitoyen » retiré des titres (le template du layout suffit).
- [x] `openGraph.images` répété sur les fiches, `canonical` partout.
- [x] `app/not-found.tsx` en français (numéros d'urgence, liens principaux).
- [x] `app/sitemap.ts` dérivé des modules de données, `lastModified` = date de contenu ; `SITE_URL` partagé (`lib/site.ts`).
- [x] Compteurs de l'accueil et de la page Secours dérivés des données (14 fiches, 17 numéros).
- [x] Lien d'évitement « Aller au contenu » + `id="contenu"` sur `<main>`.
- [x] `BottomNav` : `aria-current`, `aria-label`, SVG décoratifs masqués.
- [x] Menu burger : `<Link>`, `aria-expanded`/`aria-controls`/`aria-haspopup`, Échap, focus sur le premier lien puis retour au bouton, fermeture à la navigation, `aria-current` (testé en e2e).
- [x] Recherche globale : piège de focus (Tab), retour du focus au déclencheur, résultats en liste `aria-live`.
- [x] Check-lists : `role="checkbox"` + `aria-checked`, barre de progression `role="progressbar"` ; fiches : `aria-pressed` sur les étapes, texte lu « étape faite », « Conseil : » / « Attention : » annoncés.
- [x] Bouton favori sorti des liens (page Urgences et favoris) : plus de bouton imbriqué dans un lien.
- [x] Cibles tactiles ≥ 44 px sur les boutons d'icône (header, thème, fermetures des invites, bannière, favoris, filtres, retours).
- [x] `prefers-reduced-motion` respecté globalement (`globals.css`).
- [x] Sous-en-têtes collants sous le header (`top-16`).
- [x] Illustrations rendues côté serveur (plus de `ssr: false`), espace réservé pendant le chargement du chunk.
- [x] Mode sombre complété dans les fiches et les check-lists (via `lib/ui-tokens.ts`).
- [x] Tablette : barre basse, FAB et recherche alignés sur la colonne de contenu (`md:max-w-2xl`), vérifié en e2e.
- [x] Un seul `<h1>` par page (marque en `<p>`, titres de pages en `<h1>`, sections en `<h2>`).
- [x] `aria-hidden` sur les emojis et SVG décoratifs des pages et composants retouchés.
- [x] Libellés de filtres explicites (« Vigilance crues », « Risque incendie (estimation) »), distances « 1,5 km ».
- [x] `ThemeToggle` : libellé en français annonçant le thème courant et le suivant.
- [x] Plus de texte sous 12 px dans la bannière.
- [x] **Contrastes WCAG AA (4,5:1) corrigés** après passage d'axe-core sur les 7 pages :
  - fonds des numéros, saisons et check-lists passés en nuance 700 quand le blanc ne passait pas sur la 500/600 (`bg-green-700`, `bg-orange-700`, `bg-pink-700`, `bg-amber-700`, `bg-rose-700`, `bg-cyan-700`, `bg-sky-700`, `bg-teal-700`) ; boutons `bg-blue-500`/`bg-green-500` → 600/700 (sélecteur de département, localisation, partage de position, FAB 112, page numéro, conseils) ;
  - texte sombre (`text-gray-900`) sur orange et vert : `alertLevels.textOnBg`, `urgencyConfig.high.fg`, bannière d'alerte ; pastilles translucides `bg-white/20` → `bg-black/10` (les fonds clairs sous texte sombre) ;
  - opacités et blancs translucides (`opacity-70/80/90`, `text-white/60-80`) retirés des petits textes sur fonds colorés (accueil, urgences, fiches, alertes, check-lists, FAB, favoris) ;
  - liens et états actifs `text-accent` (orange-500, 3,2:1 sur blanc) → `text-orange-700/800` en clair, `text-orange-300/400` en sombre (menu, SideNav, BottomNav, « Voir tout », astuce du jour, progression) ; bouton d'activation des notifications et lien d'évitement en `bg-orange-700` ;
  - gris trop clairs (`text-gray-400/500` sur `bg-gray-100`) → `text-gray-600` (pied de page, nombre d'éléments des check-lists, « ou choisir », badge de l'astuce) ; ligne « En cas d'urgence » du pied de page et mentions rouges en `text-red-700` ; texte de la carte de vigilance foncé dans les deux thèmes (le dégradé vert n'a pas de variante sombre).
- [x] Accueil à 320 px : les quatre numéros rapides passent en grille 2 × 2 sous 640 px (« Urgences européennes » ne tenait pas dans un quart d'écran et faisait déborder la page de 25 px) ; header en `px-3` et titre `text-base` sous 640 px.

### 3.7 Contenu et documentation — MOYEN / FAIBLE

- [x] Formulaire de contact : ouvre la messagerie de l'utilisateur avec un e-mail prérempli (`mailto:`), texte honnête sur le fonctionnement ; plus de faux « Message envoyé ».
- [x] Mentions légales : éditeur (projet personnel, contact), hébergeur Vercel (adresse) et Supabase renseignés ; sources de données mises à jour (OSM/ODbL, estimation incendie). **Si l'application est publiée par une personne morale**, compléter raison sociale, adresse et SIRET (commentaire `TODO` dans le fichier).
- [x] Politique de confidentialité : ligne « langue » retirée, notifications push et géocodage décrits, rétention précisée, date mise à jour.
- [x] Numéros ajoutés : 191 (urgence aéronautique), 197 (alerte attentat/enlèvement), 116 006 (aide aux victimes), 3018 (harcèlement numérique), 39 77 (maltraitance personnes âgées/handicapées). 116 117 non ajouté (permanence des soins non déployée dans tous les départements). Mention « même sans carte SIM » retirée des pages Urgences et Accueil.
- [x] README : structure du projet, stack (Next 15, Serwist), sources de données, compteurs, tests.
- [x] PlanAction.md : statuts corrigés et renvoi vers ce fichier.

### 3.8 Vigilance crues Vigicrues — CRITIQUE — corrigé le 11/09/2026

Découvert en vérifiant le point « format réel des codes `CdEntVigiCru` » ci-dessous : la
source Vigicrues n'avait jamais rien pu remonter, alors qu'elle est annoncée dans
l'interface, les CGU et la politique de confidentialité, et qu'elle est l'une des deux
seules sources autorisées à déclencher une notification push.

- [x] **Noms de champs alignés sur le flux réel.** Le parseur lit désormais `NivInfViCr` / `CdEntCru` / `lbentcru`, avec repli sur `NivSituVigiCruEnt` / `CdEntVigiCru` / `NomEntVigiCru` (nommage de l'API v1.1) pour ne pas dépendre du millésime du service. Un tronçon dont le niveau est absent est ignoré explicitement, au lieu d'être traité comme vert.
- [x] **Départements dérivés de la géométrie, plus par heuristique.** `scripts/build-vigicrues-departements.mjs` échantillonne 12 sommets par tronçon et les géocode en inverse par lot via api-adresse.data.gouv.fr, puis écrit `lib/data/vigicrues-troncons.json` (337 tronçons, 34 Ko, 96 départements couverts, 0 tronçon non résolu). Un code absent de la table reste sans département : l'alerte s'affiche au niveau national mais n'est jamais poussée.
- [x] **Tronçons multi-départements.** 127 des 337 tronçons traversent plusieurs départements (l'Alagnon en traverse 3) : `VigicrueAlert` expose `departements[]`, le filtre départemental teste la liste complète, et l'agrégateur émet une alerte par département concerné afin que la notification atteigne tous les abonnés. Sans cela, seuls les abonnés du premier département auraient été prévenus.
- [x] **Date du bulletin** (`DtHrInfoVigiCru`) propagée dans `updatedAt` à la place de l'heure de la requête.
- [x] Tests réécrits sur des tronçons réels (`GA1` Gard, `GA9` Bouches-du-Rhône, `AL2` sur 3 départements) avec rechargement du module entre scénarios pour neutraliser le cache mémoire de 5 minutes ; couverture ajoutée pour le nommage v1.1 et pour un code inconnu. 190 tests au total.
- [ ] Aucun tronçon n'était au-dessus du vert le 11/09/2026 (337 sur 337 au niveau 1) : la remontée d'une vraie vigilance crues n'a donc pas pu être observée en conditions réelles. À recontrôler lors du prochain épisode de crue.

---

## Vérifications à faire en production (non couvertes par l'audit)

- [x] **Service worker en production vérifié le 11/09/2026** sur https://secucitoyen.vercel.app : état `activated`, page contrôlée par le worker, `sw.js` servi en 200. Caches : précache 63 entrées (dont `/` et `/offline`, aucun `.map`, pas de `app-build-manifest.json`), `secours-fiches` = 14, `detail-pages` = 17, `pages` = 2. Préchauffage complet en moins de 10 s après le premier chargement.
- [ ] Abonnements push existants en base : **non vérifiable depuis ce poste**. Toute requête vers l'API Supabase portant une vraie clé expire sans réponse (une clé factice reçoit un 401 en 0,12 s, le domaine répond en 0,03 s) — blocage local (antivirus/proxy/DLP), déjà observé avec l'erreur « Failed to fetch » sur api.supabase.com lors de la migration 005. À exécuter dans l'éditeur SQL Supabase :
  ```sql
  select count(*) as total,
         min(created_at) as premier, max(created_at) as dernier,
         count(*) filter (where department_code is null) as sans_departement
  from push_subscriptions;
  ```
  Des abonnements antérieurs au déploiement de la Phase 1 ont été créés alors que le worker ne s'enregistrait jamais en production : ils proviennent du développement et peuvent être purgés.
- [ ] Migration `004_secure_rls.sql` effectivement appliquée sur Supabase (le client anon ne doit rien lire dans `push_subscriptions`) — même blocage réseau, à vérifier depuis l'éditeur SQL ou un autre poste.
- [x] **Format des codes de tronçon Vigicrues vérifié le 11/09/2026 sur le flux réel — l'heuristique était fausse et la source entièrement inopérante.** Le GeoJSON (`/services/1/InfoVigiCru.geojson`, 337 tronçons) ne contient ni `CdEntVigiCru` ni `NivSituVigiCruEnt` : ces deux champs sont présents sur **0 tronçon**. Les noms réels sont `CdEntCru`, `NivInfViCr` et `lbentcru`. Conséquence : `parseNiveau(undefined)` renvoyait `vert` et **toutes les crues étaient silencieusement filtrées**, quel que soit le niveau réel. De plus les codes de tronçon sont des acronymes de territoire (`CO1` Corse, `NO50` Normandie, `ML101` Maine-Loire) : leurs deux premiers caractères ne sont jamais un numéro de département. Corrigé (voir 3.8).
- [x] Tests Playwright relancés le 11/09/2026 : 142 passés, 8 ignorés, 0 échec sur les 3 projets.
