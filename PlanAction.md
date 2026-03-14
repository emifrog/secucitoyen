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

**Résultat : 42 tests, 4 suites, 100% passent**

**Reste à faire :**
- [ ] Ecrire des tests de composants (EmergencyFab, GlobalSearch, FavoriteButton)
- [ ] Tests `lib/i18n.ts` — traductions et détection langue
- [ ] Configurer la CI (GitHub Actions) pour exécuter les tests à chaque PR

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

**Reste à faire :**
- [ ] Configurer un Vercel Cron Job (toutes les 15 min) pour :
  - Vérifier les nouvelles alertes orange/rouge
  - Comparer aux dernières alertes envoyées (éviter les doublons)
  - Envoyer les push par département
- [ ] Stocker les dernières alertes envoyées dans Supabase (table `sent_notifications`)

---

## 2. Important

### 2.1 Externaliser les données statiques

**Constat :** Les 15 fiches secours, 52 conseils, 12 numéros d'urgence sont hardcodés dans `/lib`. Toute mise à jour nécessite un redéploiement.

**Note :** Supabase est maintenant activement utilisé (notifications push), ce qui facilite cette migration.

**Actions :**
- [ ] Migrer les données vers Supabase
  - [ ] Créer les tables : `fiches_secours`, `numeros_urgence`, `conseils_saison`, `checklists`
  - [ ] Ecrire un script de migration des données existantes
  - [ ] Créer les fonctions de fetch côté serveur avec ISR (revalidation 1h)
- [ ] Conserver un fallback local (données actuelles) en cas d'indisponibilité Supabase
- [ ] Optionnel : créer une interface admin simple pour éditer le contenu

---

### ~~2.2 Nettoyer la dépendance Supabase inutilisée~~ — RÉSOLU

**Supabase est maintenant utilisé activement** pour les notifications push (table `push_subscriptions`). Cette action n'est plus pertinente.

---

### 2.3 Renforcer le typage TypeScript

**Constat :** Certaines données et réponses API manquent de types stricts, ce qui augmente le risque d'erreurs runtime.

**Actions :**
- [ ] Auditer les fichiers `lib/` pour identifier les `any` et types manquants
- [ ] Créer des types stricts pour chaque réponse API externe
  - [ ] Type `MeteoFranceVigilance`
  - [ ] Type `OpenMeteoAirQuality`
  - [ ] Type `VigicruesResponse`
  - [ ] Type `FireRiskResponse`
  - [ ] Type `DefibrillateursResponse`
- [ ] Activer `noUncheckedIndexedAccess` dans `tsconfig.json`
- [ ] Ajouter la validation runtime avec Zod sur les réponses API (boundary validation)

---

### 2.4 Améliorer le système i18n

**Constat :** Les traductions sont inline dans le code, rendant la maintenance et l'ajout de langues difficile.

**Actions :**
- [ ] Extraire les traductions dans des fichiers JSON séparés (`/locales/fr.json`, `/locales/en.json`, `/locales/it.json`)
- [ ] Adopter une librairie i18n légère (next-intl ou i18next)
- [ ] Ajouter des langues prioritaires : Espagnol, Arabe, Portugais (populations significatives en France)
- [ ] Traduire les fiches de premiers secours (contenu critique)

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
| **Phase 2** | 2.1 Externaliser données vers Supabase + 2.3 Typage | A faire |
| **Phase 3** | 2.4 i18n + 3.2 SEO | A faire |
| **Phase 4** | 3.1 IndexedDB + 3.4 Performance | A faire |
| **Phase 5** | 3.3 Accessibilité + 3.5 Mode urgence | A faire |
