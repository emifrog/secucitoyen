# Plan d'Action - SécuCitoyen

## 1. Critique

### 1.1 Ajouter des tests (unitaires + E2E)

**Constat :** Aucun test n'existe dans le projet. Toute modification risque d'introduire des régressions non détectées.

**Actions :**
- [ ] Installer Jest + React Testing Library pour les tests unitaires
- [ ] Installer Playwright pour les tests E2E
- [ ] Configurer les scripts `test` et `test:e2e` dans `package.json`
- [ ] Ecrire des tests unitaires pour les fonctions utilitaires (`lib/`)
  - [ ] `lib/geolocation.ts` — mapping coordonnées vers département
  - [ ] `lib/storage.ts` — lecture/écriture favoris
  - [ ] `lib/i18n.ts` — traductions et détection langue
  - [ ] `lib/alerts.ts` — parsing et tri des alertes
- [ ] Ecrire des tests de composants pour les composants critiques
  - [ ] `EmergencyFab` — vérifier que le bouton 112 fonctionne
  - [ ] `GlobalSearch` — vérifier la recherche dans fiches, numéros, conseils
  - [ ] `FavoriteButton` — vérifier l'ajout/suppression de favoris
  - [ ] `LocationFinder` — vérifier le fallback si géolocalisation refusée
- [ ] Ecrire des tests E2E pour les parcours critiques
  - [ ] Accueil > Appeler un numéro d'urgence
  - [ ] Accueil > Consulter une fiche secours > Naviguer les étapes
  - [ ] Alertes > Sélectionner un département > Voir les vigilances
  - [ ] Installation PWA + mode offline
- [ ] Configurer la CI (GitHub Actions) pour exécuter les tests à chaque PR

---

### 1.2 Ajouter une retry logic sur les APIs externes

**Constat :** Les 5 APIs externes (Météo-France, Open-Meteo, Vigicrues, Météo Forêts, OpenDataSoft) n'ont aucune logique de retry. Un échec réseau = données manquantes silencieusement.

**Actions :**
- [ ] Créer un wrapper `fetchWithRetry()` dans `lib/api-utils.ts`
  - 3 tentatives max avec backoff exponentiel (1s, 2s, 4s)
  - Timeout configurable par source (défaut : 10s)
  - Logging des échecs vers Sentry
- [ ] Appliquer le wrapper aux routes API existantes
  - [ ] `/api/vigilance`
  - [ ] `/api/air-quality`
  - [ ] `/api/vigicrues`
  - [ ] `/api/meteo-forets`
  - [ ] `/api/fire-risk`
  - [ ] `/api/defibrillateurs`
- [ ] Implémenter un circuit breaker simple
  - Après 5 échecs consécutifs sur une source, la désactiver pendant 5 minutes
  - Afficher un indicateur visuel côté client ("source temporairement indisponible")
- [ ] Améliorer les fallbacks existants
  - [ ] Afficher la date de dernière donnée valide en cache
  - [ ] Distinguer "pas de données" vs "erreur de chargement" dans l'UI

---

### 1.3 Implémenter les notifications push

**Constat :** Le composant `NotificationPrompt` existe mais le backend de notifications n'est pas implémenté. Les citoyens ne reçoivent aucune alerte proactive.

**Actions :**
- [ ] Configurer Web Push avec VAPID keys
  - Générer les clés VAPID (variable d'environnement)
  - Stocker les subscriptions dans Supabase (table `push_subscriptions`)
- [ ] Créer l'API d'enregistrement `/api/notifications/subscribe`
  - Recevoir et stocker le PushSubscription du navigateur
  - Associer au département sélectionné par l'utilisateur
- [ ] Créer le service worker push handler
  - Personnaliser `sw.js` pour gérer les événements `push` et `notificationclick`
  - Afficher les notifications avec titre, corps, icône et action (lien vers l'alerte)
- [ ] Créer un CRON ou webhook pour déclencher les notifications
  - [ ] Option A : Vercel Cron Job toutes les 15 min → vérifier nouvelles alertes
  - [ ] Option B : Webhook depuis les APIs quand disponible
  - Comparer les alertes actuelles aux dernières envoyées (éviter les doublons)
- [ ] Envoyer des notifications par département
  - Alertes météo rouge/orange uniquement (éviter le spam)
  - Crues niveau orange/rouge
  - Risque incendie élevé

---

## 2. Important

### 2.1 Externaliser les données statiques

**Constat :** Les 15 fiches secours, 52 conseils, 12 numéros d'urgence sont hardcodés dans `/lib`. Toute mise à jour nécessite un redéploiement.

**Actions :**
- [ ] Evaluer les options : Supabase (déjà configuré) vs CMS headless (Strapi, Sanity)
- [ ] Migrer les données vers Supabase
  - [ ] Créer les tables : `fiches_secours`, `numeros_urgence`, `conseils_saison`, `checklists`
  - [ ] Ecrire un script de migration des données existantes
  - [ ] Créer les fonctions de fetch côté serveur avec ISR (revalidation 1h)
- [ ] Conserver un fallback local (données actuelles) en cas d'indisponibilité Supabase
- [ ] Optionnel : créer une interface admin simple pour éditer le contenu

---

### 2.2 Nettoyer la dépendance Supabase inutilisée

**Constat :** `@supabase/supabase-js` est installé et configuré mais n'est pas utilisé activement, ajoutant du poids au bundle.

**Actions :**
- [ ] Si 2.1 est planifié à court terme : garder la dépendance, commencer la migration
- [ ] Sinon : retirer `@supabase/supabase-js` de `package.json` et supprimer le fichier de config Supabase
- [ ] Supprimer les variables d'environnement Supabase inutilisées si non utilisées

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

## Priorisation Recommandée

| Phase | Actions | Estimation |
|-------|---------|------------|
| **Phase 1** | 1.2 Retry APIs + 2.2 Nettoyage Supabase + 2.3 Typage | Sprint 1 |
| **Phase 2** | 1.1 Tests (unitaires d'abord) + 3.2 SEO | Sprint 2 |
| **Phase 3** | 2.1 Externaliser données + 2.4 i18n | Sprint 3 |
| **Phase 4** | 1.3 Notifications push + 3.1 IndexedDB | Sprint 4 |
| **Phase 5** | 3.3 Accessibilité + 3.4 Performance + 3.5 Mode urgence | Sprint 5 |
