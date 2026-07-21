# Plan d'Action - SécuCitoyen

## 1. Critique

### 1.1 Ajouter des tests (unitaires + E2E) — FAIT

**Constat :** Aucun test n'existait dans le projet.

**Réalisé :**
- [x] Installer Jest + React Testing Library pour les tests unitaires
- [x] Installer Playwright pour les tests E2E
- [x] Configurer les scripts `test` et `test:e2e` dans `package.json`
- [x] Ecrire des tests unitaires pour les fonctions utilitaires (`lib/`)
  - [x] `lib/geolocation.ts` — mapping coordonnées vers département (6 tests)
  - [x] `lib/favorites-storage.ts` — lecture/écriture favoris (8 tests)
  - [x] `lib/alertes.ts` — types, niveaux et conseils (15 tests)
  - [x] `lib/api-utils.ts` — retry logic et circuit breaker (7 tests)
- [x] Ecrire des tests E2E pour les parcours critiques (Playwright)
  - [x] Navigation principale (accueil, urgences, secours, alertes, prévention)
  - [x] Numéros d'urgence (15, 17, 18, 112 visibles + page détail)
  - [x] Fiches secours (navigation et affichage des étapes)
  - [x] Bouton d'urgence FAB visible sur toutes les pages

**Résultat : 78 tests, 8 suites, 100% passent**

- [x] Tests de composants : EmergencyFab (5 tests), FavoriteButton (5 tests)
- [x] Tests `lib/i18n.ts` — traductions et détection langue (10 tests)
- [x] Tests `lib/global-search.ts` — recherche globale (8 tests)
- [x] CI GitHub Actions configurée (`.github/workflows/ci.yml`)
  - TypeScript check + Lint + Tests unitaires + Build

---

### 1.2 Ajouter une retry logic sur les APIs externes — FAIT

**Constat :** Les 5 APIs externes n'avaient aucune logique de retry.

**Réalisé :**
- [x] Créer un wrapper `fetchWithRetry()` dans `lib/api-utils.ts`
  - 3 tentatives max avec backoff exponentiel (1s, 2s, 4s)
  - Timeout configurable par source (défaut : 10s, 15s pour Vigicrues)
  - Ne retry pas les erreurs 4xx (client errors)
- [x] Appliquer le wrapper aux routes API existantes
  - [x] `/api/vigilance` (source: `meteo-france`)
  - [x] `/api/air-quality` (source: `open-meteo-air`)
  - [x] `/api/vigicrues` (source: `vigicrues`)
  - [x] `/api/meteo-forets` (source: `open-meteo-forecast`)
  - [x] `/api/fire-risk` (source: `open-meteo-forecast`)
  - [x] `/api/defibrillateurs` (source: `opendatasoft-dae`)
- [x] Implémenter un circuit breaker simple
  - Après 5 échecs consécutifs, source désactivée pendant 5 minutes
  - Classe `CircuitOpenError` pour identifier les sources bloquées
  - Endpoint `/api/health` pour monitorer l'état de toutes les sources
- [x] Améliorer les fallbacks UI dans `AlertsList.tsx`
  - [x] Bannière rouge en cas d'erreur de chargement + date dernières données valides
  - [x] Bannière ambre pour les sources temporairement indisponibles
  - [x] Distinction "pas de données" vs "erreur de chargement"

---

### 1.3 Implémenter les notifications push — FAIT

**Constat :** Le composant `NotificationPrompt` existait mais le backend n'était pas implémenté.

**Réalisé :**
- [x] Configurer Web Push avec VAPID keys
  - [x] Clés VAPID générées et ajoutées dans `.env.local`
  - [x] Table `push_subscriptions` créée dans Supabase (migration SQL exécutée)
- [x] Créer l'API d'enregistrement `/api/notifications/subscribe`
  - POST : enregistre/met à jour la subscription + département
  - DELETE : supprime la subscription
- [x] Créer l'API d'envoi `/api/notifications/send`
  - Envoi ciblé par département (ou national si pas de département)
  - Nettoyage automatique des subscriptions expirées (404/410)
  - Sécurisé par header `x-api-key`
- [x] Créer l'API `/api/notifications/vapid-key` pour exposer la clé publique
- [x] Créer le service worker push handler (`worker/index.js`)
  - Gestion événement `push` (affichage notification avec actions)
  - Gestion événement `notificationclick` (navigation vers /alertes)
- [x] Mettre à jour `lib/notifications.ts`
  - `subscribeToPush()` — inscription Web Push complète
  - `unsubscribeFromPush()` — désinscription
  - Helper `urlBase64ToUint8Array()` pour VAPID
- [x] Mettre à jour `NotificationPrompt.tsx` pour inscrire via Web Push
- [x] Mettre à jour `.env.local.example` avec les variables VAPID

- [x] Vercel Cron Job configuré (`vercel.json` + `/api/cron/check-alerts`)
  - Exécution toutes les 15 minutes
  - Vérifie les nouvelles alertes orange/rouge
  - Compare aux dernières envoyées (table `sent_notifications`)
  - Envoie les push ciblés par département
  - Nettoyage automatique des entrées > 7 jours
- [x] Table `sent_notifications` (migration `002_sent_notifications.sql`)

- [x] Migration `002_sent_notifications.sql` exécutée dans Supabase
- [x] `CRON_SECRET` ajouté dans les variables d'environnement Vercel

---

## 2. Important

### 2.1 Externaliser les données statiques — ANNULÉ (revenu au contenu statique)

**Constat :** Les 15 fiches secours, 52 conseils, 12 numéros d'urgence sont hardcodés dans `/lib`. Toute mise à jour nécessite un redéploiement.

**Décision :** la couche de contenu Supabase avait été livrée puis **jamais branchée** (les pages ont toujours lu les données statiques). Elle a été **supprimée** pour éliminer la double source de vérité :
- ❌ `supabase/migrations/003_content_tables.sql` — supprimé
- ❌ `scripts/seed-supabase.ts` + script `npm run seed` — supprimés
- ❌ `lib/supabase-content.ts` — supprimé
- ✅ Le contenu reste dans `lib/*.ts` (source de vérité unique, assumée statique)

> Supabase n'est donc utilisé que pour les notifications push (`push_subscriptions`,
> `sent_notifications`), pas pour le contenu. Si l'externalisation redevient un
> objectif (admin de contenu), tout est à refaire — et devra alors prévoir la
> dimension multilingue absente des anciennes tables.

**Si repris plus tard :**
- [ ] Tables de contenu **avec colonnes/JSON par langue**
- [ ] Couche de fetch réellement branchée dans les pages (avec fallback statique)
- [ ] Interface admin d'édition

---

### ~~2.2 Nettoyer la dépendance Supabase inutilisée~~ — RÉSOLU

**Supabase est maintenant utilisé activement** pour les notifications push (table `push_subscriptions`). Cette action n'est plus pertinente.

---

### 2.3 Renforcer le typage TypeScript — FAIT

**Constat :** Certaines données et réponses API manquent de types stricts, ce qui augmente le risque d'erreurs runtime.

**Réalisé :**
- [x] Audit des fichiers `lib/` — aucun `any` trouvé
- [x] Création de `lib/types/api-responses.ts` avec types stricts pour :
  - `VigicruesGeoJSON` + `VigicruesFeature`
  - `OpenMeteoCurrentResponse`
  - `OpenDataSoftDAEResponse` + `OpenDataSoftDAERecord`
  - Types internes : `AlertItem`, `AlertApiResponse`, etc.
- [x] Application des types aux routes API :
  - `/api/vigicrues` — GeoJSON typé, plus de `Record<string, unknown>`
  - `/api/meteo-forets` — `OpenMeteoCurrentResponse`
  - `/api/fire-risk` — `OpenMeteoCurrentResponse`
  - `/api/defibrillateurs` — `OpenDataSoftDAEResponse`
- [x] 0 erreurs TypeScript (`npx tsc --noEmit` passe)

**Non fait (hors scope actuel) :**
- [ ] Activer `noUncheckedIndexedAccess` (impacterait tout le code)
- [ ] Validation runtime Zod (ajouterait une dépendance)

---

### 2.4 Système i18n — RETIRÉ (application FR-only assumée)

**Constat :** L'infrastructure i18n (5 locales JSON parfaitement synchronisées) existait,
mais **aucun composant ne la consommait** hormis le `LanguageSelector` — changer de langue
ne traduisait rien à l'écran, et tout le contenu métier restait en français.

**Décision :** assumer le français uniquement et retirer la dette :
- ❌ `lib/i18n/` (context, translations) + `locales/*.json` — supprimés
- ❌ `components/layout/LanguageSelector.tsx` + `I18nProvider` du layout — supprimés
- ❌ `__tests__/lib/i18n.test.ts` — supprimé

**Si le multilingue redevient un objectif :** repartir d'une base qui traduit aussi le
**contenu** (fiches, conseils, numéros), pas seulement le chrome de l'UI — idéalement via
des colonnes/JSON par langue côté données.

---

## 3. Améliorations Suggérées

### 3.1 Ajouter IndexedDB pour le cache persistant — FAIT

**Constat :** Le localStorage est limité à 5MB.

**Réalisé :**
- [x] `idb` installé (wrapper IndexedDB léger, 1.2KB)
- [x] Module `lib/idb-cache.ts` créé avec 3 stores :
  - `fiches_secours` — cache 30 jours pour accès offline
  - `alertes_cache` — cache 5 min pour réduire les appels API
  - `defibrillateurs_cache` — cache 1h pour les résultats DAE
- [x] API générique avec TTL, nettoyage automatique, fallback silencieux
- [x] localStorage conservé pour les préférences simples (thème, langue, département)

---

### 3.2 Améliorer le SEO — FAIT

**Constat :** Pas de sitemap dynamique, pas d'images Open Graph, métadonnées minimales.

**Réalisé :**
- [x] `app/sitemap.ts` — sitemap dynamique (60+ URLs : pages, fiches, numéros, conseils, checklists)
- [x] `app/robots.ts` — robots.txt optimisé (bloque /api/ et /offline)
- [x] Métadonnées Open Graph globales dans `layout.tsx` (og:title, og:description, og:image, twitter:card)
- [x] Métadonnées par page : secours, alertes, prevention + fiches individuelles
- [x] JSON-LD `HowTo` (schema.org) sur chaque fiche secours avec étapes structurées
- [x] Template de titre : `%s | SécuCitoyen`

---

### 3.3 Améliorer l'accessibilité (a11y) — FAIT

**Réalisé :**
- [x] Audit complet des composants (30+ fichiers analysés)
- [x] `aria-label` ajoutés sur les boutons icône :
  - GlobalSearch (fermer), SearchNumbers (effacer)
  - EmergencyFab et FavoriteButton (déjà présents)
- [x] `role="alert"` ajouté sur toutes les bannières d'erreur :
  - AlertsList (erreur + sources dégradées)
  - ShareLocation, LocationFinder, DepartmentSelector
- [x] `aria-live="polite"` sur AlertBanner (alertes rotatives)

**Non fait (amélioration future) :**
- [ ] role="checkbox" + aria-checked sur ChecklistContent
- [ ] aria-expanded sur les accordions FicheContent
- [ ] aria-hidden sur les SVG décoratifs

---

### 3.4 Optimiser les performances — FAIT

**Réalisé :**
- [x] `@next/bundle-analyzer` installé et configuré (`npm run analyze`)
- [x] Illustrations SVG déjà lazy-loaded avec `next/dynamic` (ssr: false)
- [x] IndexedDB cache pour réduire les appels API (3.1)
- [x] PWA caching stratégies déjà optimisées (CacheFirst/NetworkFirst)

**Non fait (amélioration future) :**
- [ ] Prefetch des fiches les plus consultées
- [ ] React.Suspense + streaming sur les pages alertes

---

### 3.5 Ajouter un mode "situation d'urgence"

**Actions :**
- [ ] Créer un mode spécial activable d'un tap
  - Interface simplifiée au maximum
  - Gros boutons d'appel 15/17/18/112
  - Partage de position GPS en un tap
  - Lampe torche (API Torch si disponible)
  - Ecran haute luminosité
- [ ] Accessible depuis le `EmergencyFab` existant

---

## Priorisation Recommandée (mise à jour)

| Phase | Actions | Statut |
|-------|---------|--------|
| **Phase 1** | 1.2 Retry APIs + Circuit Breaker | FAIT |
| **Phase 1** | 1.1 Tests unitaires + E2E | FAIT |
| **Phase 1** | 1.3 Notifications push | FAIT |
| **Phase 2** | 2.1 Externaliser données vers Supabase | FAIT |
| **Phase 2** | 2.3 Renforcer le typage TypeScript | FAIT |
| **Phase 2** | 2.4 Améliorer le système i18n | FAIT |
| **Phase 3** | 3.1 IndexedDB cache persistant | FAIT |
| **Phase 3** | 3.2 SEO (sitemap, OG, JSON-LD, robots) | FAIT |
| **Phase 3** | 3.3 Accessibilité (a11y) | FAIT |
| **Phase 3** | 3.4 Optimisation performances | FAIT |
| **Phase 4** | 3.5 Mode urgence | A faire |
