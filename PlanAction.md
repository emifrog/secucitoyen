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

### 2.1 Externaliser les données statiques — FAIT

**Constat :** Les 15 fiches secours, 52 conseils, 12 numéros d'urgence sont hardcodés dans `/lib`. Toute mise à jour nécessite un redéploiement.

**Réalisé :**
- [x] Migration SQL `003_content_tables.sql` — 5 tables créées :
  - `numeros_urgence`, `fiches_secours`, `checklists_prevention`, `conseils_saisonniers`, `saisons`
  - Index, RLS (lecture publique), triggers auto `updated_at`
- [x] Script de seed `scripts/seed-supabase.ts` — insère toutes les données locales dans Supabase
  - Script `npm run seed` ajouté dans `package.json`
- [x] Couche de fetch avec fallback : `lib/supabase-content.ts`
  - `fetchEmergencyNumbers()`, `fetchFichesSecours()`, `fetchFicheById()`
  - `fetchChecklists()`, `fetchSaisons()`, `fetchConseilById()`
  - Fallback automatique sur données locales si Supabase indisponible
- [x] Données locales conservées en fallback

- [x] Migration `003_content_tables.sql` exécutée dans Supabase
- [x] Seed exécuté avec succès (`npx tsx scripts/seed-supabase.ts`)

**Optionnel :**
- [ ] Créer une interface admin simple pour éditer le contenu

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

### 2.4 Améliorer le système i18n — FAIT

**Constat :** Les traductions sont inline dans le code, rendant la maintenance et l'ajout de langues difficile.

**Réalisé :**
- [x] Traductions extraites dans des fichiers JSON séparés : `/locales/{fr,en,it,es,pt}.json`
- [x] `translations.ts` réécrit pour importer les JSON (plus de données inline)
- [x] 2 nouvelles langues ajoutées : Espagnol (es) et Portugais (pt)
- [x] `LanguageSelector.tsx` mis à jour pour afficher les 5 langues
- [x] Détection automatique du navigateur étendue aux 5 langues
- [x] Exports ajoutés : `localeNames`, `supportedLocales`

**Non fait :**
- [ ] Arabe (nécessite support RTL, complexe)
- [ ] Traduire les fiches de premiers secours (contenu critique, nécessite traducteur professionnel)

---

## 3. Améliorations Suggérées

### 3.1 Ajouter IndexedDB pour le cache persistant

**Constat :** Le localStorage est limité à 5MB. Les données d'alertes et de défibrillateurs pourraient dépasser cette limite.

**Actions :**
- [ ] Installer `idb` (wrapper IndexedDB léger)
- [ ] Migrer le stockage des alertes en cache vers IndexedDB
- [ ] Stocker les fiches de premiers secours consultées pour un accès offline complet
- [ ] Conserver localStorage pour les préférences simples (thème, langue, département)

---

### 3.2 Améliorer le SEO

**Constat :** Pas de sitemap dynamique, pas d'images Open Graph, métadonnées minimales.

**Actions :**
- [ ] Générer un `sitemap.xml` dynamique via `app/sitemap.ts`
- [ ] Ajouter des métadonnées Open Graph par page (titre, description, image)
- [ ] Créer des images OG dynamiques avec `next/og` (ImageResponse)
- [ ] Ajouter le balisage JSON-LD (schema.org) pour les fiches secours
- [ ] Ajouter `robots.txt` optimisé

---

### 3.3 Améliorer l'accessibilité (a11y)

**Actions :**
- [ ] Auditer avec axe-core ou Lighthouse Accessibility
- [ ] Vérifier les contrastes de couleurs (dark mode inclus)
- [ ] Ajouter les attributs `aria-label` sur les boutons d'action (appel, favoris, partage)
- [ ] Tester la navigation clavier complète
- [ ] Ajouter `role="alert"` sur les notifications d'alerte

---

### 3.4 Optimiser les performances

**Actions :**
- [ ] Analyser le bundle avec `@next/bundle-analyzer`
- [ ] Lazy-load les illustrations SVG des fiches secours
- [ ] Implémenter le prefetch des fiches les plus consultées
- [ ] Optimiser les appels API avec `React.Suspense` et streaming
- [ ] Mesurer les Core Web Vitals et fixer un budget performance

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
| **Phase 3** | 3.2 SEO | A faire |
| **Phase 3** | 3.1 IndexedDB + 3.4 Performance | A faire |
| **Phase 4** | 3.3 Accessibilité + 3.5 Mode urgence | A faire |
