# SécuCitoyen

Application Progressive Web App (PWA) de sécurité citoyenne pour la France. Prévention, alertes météo et accès rapide aux numéros d'urgence.

## Fonctionnalités

### Urgences
- Accès rapide aux numéros d'urgence (15, 17, 18, 112, etc.)
- Bouton flottant (FAB) pour appel d'urgence immédiat
- Favoris pour les numéros les plus utilisés
- Partage de position GPS par SMS

### Secours
- **14 fiches pratiques** des gestes qui sauvent
- Arrêt cardiaque, étouffement, hémorragie, brûlures, PLS
- AVC, noyade, électrocution, morsures, fractures
- Malaise cardiaque, hypothermie, convulsions, intoxication
- Instructions étape par étape avec alertes et conseils

### Défibrillateurs (DAE)
- **Localisation des DAE** à proximité via géolocalisation
- Recherche dans un rayon configurable (500m à 5km)
- Itinéraire vers le défibrillateur le plus proche
- Instructions d'utilisation d'un DAE

### Prévention
- **52 conseils** répartis en 5 check-lists interactives
- Sécurité domicile, kit d'urgence, sécurité routière
- Cybersécurité, risques naturels
- Système de priorités (haute, moyenne, basse)

### Conseils saisonniers
- **18 thématiques** adaptées à chaque saison
- Hiver : verglas, monoxyde de carbone, hypothermie, coupures courant
- Printemps : allergies, orages, tiques, jardinage
- Été : canicule, noyades, feux de forêt, piqûres, UV
- Automne : chasse, champignons, brouillard, tempêtes, grippe
- Affichage automatique selon la saison en cours

### Alertes en temps réel
- **Géolocalisation automatique** : Détection du département via GPS
- **Vigilances Météo-France** : Vent, orages, pluie, neige, canicule, grand-froid, avalanches, crues, vagues-submersion
- **Qualité de l'air** : Indice européen AQI, alertes pollution (PM10, PM2.5, NO2, O3)
- **Vigicrues** : Vigilance crues des cours d'eau en temps réel
- **Météo des forêts** : Risque incendie via calcul IFM (Indice Feu Météo)
- **Risque incendie** : Calcul FWI basé sur température, humidité et vent
- **Notifications push** : Alertes orange/rouge en temps réel
- **Filtres** : Par niveau (orange, rouge) ou catégorie (météo, pollution, incendie, crues)
- Rafraîchissement automatique toutes les 5 minutes

### PWA
- Installation sur l'écran d'accueil
- **Raccourcis** : Appel direct 15, 17, 18 et accès DAE
- Fonctionnement hors-ligne (fiches de secours en cache, appels d'urgence)
- Notifications push (vigilances orange/rouge)
- Mode sombre automatique

## Technologies

- **Framework** : Next.js 15 (App Router), React 19
- **Styling** : Tailwind CSS
- **PWA** : Serwist (service worker `app/sw.ts` : précache, fiches et numéros disponibles hors-ligne dès l'installation, push)
- **TypeScript** : Typage strict
- **API** : Route handlers Next.js
- **Base de données** : Supabase (abonnements push uniquement)
- **Notifications** : Web Push / VAPID
- **Monitoring** : Sentry + Vercel Analytics
- **Langue** : Français uniquement

## Installation

```bash
# Cloner le projet
git clone https://github.com/votre-repo/secucitoyen.git
cd secucitoyen

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build production
npm run build
npm start
```

## Structure du projet

```
secucitoyen/
├── app/
│   ├── api/
│   │   ├── alerts/           # API unifiée (agrégateur, toutes alertes)
│   │   ├── vigilance/        # Vigilance Météo-France
│   │   ├── air-quality/      # Qualité de l'air (indice européen)
│   │   ├── vigicrues/        # Vigilance crues
│   │   ├── meteo-forets/     # Estimation risque incendie (non officielle)
│   │   ├── fire-risk/        # Estimation ponctuelle (lat/lon)
│   │   ├── defibrillateurs/  # DAE à proximité (OpenStreetMap)
│   │   ├── geocode/          # Coordonnées → département (geo.api.gouv.fr)
│   │   ├── notifications/    # Abonnement + envoi Web Push
│   │   ├── cron/check-alerts # Cron de notifications (GitHub Actions)
│   │   └── health/           # État des circuit breakers
│   ├── sw.ts                 # Service worker (Serwist) : précache, offline, push
│   ├── alertes/              # Page alertes (+ détail)
│   ├── conseils-saison/      # Conseils saisonniers
│   ├── defibrillateurs/      # Recherche DAE
│   ├── prevention/           # Check-lists de prévention
│   ├── secours/              # Fiches de premiers secours
│   ├── urgences/             # Numéros d'urgence
│   ├── offline/, not-found.tsx, error.tsx
│   ├── layout.tsx            # Layout principal
│   └── page.tsx              # Page d'accueil
├── components/
│   ├── alertes/              # Liste, détail, sélecteur de département, push
│   ├── contact/, defibrillateurs/, offline/
│   ├── home/                 # Bannière d'alerte, numéros rapides, conseils
│   ├── layout/               # Header, navigations, FAB, invites PWA
│   ├── prevention/, secours/, urgences/
│   ├── providers/            # ThemeProvider
│   └── ui/                   # Card
├── lib/
│   ├── sources/              # Une fonction pure par source + agrégateur
│   ├── departements.ts       # Source unique des 101 départements
│   ├── geolocation.ts        # Position + résolution du département
│   ├── offline-urls.ts       # Pages préchauffées hors-ligne (fiches, numéros)
│   ├── nav.ts, ui-tokens.ts, storage-keys.ts, site.ts
│   ├── api-auth.ts           # Comparaison timing-safe des secrets
│   ├── api-utils.ts          # Retry + circuit breaker (APIs tierces)
│   ├── validation.ts         # Validation des entrées (anti-SSRF/injection)
│   ├── rate-limit.ts         # Limiteur de débit par IP
│   ├── supabase.ts           # Client service_role (serveur uniquement)
│   ├── fiches-secours.ts     # 14 fiches premiers secours
│   ├── numeros-urgence.ts    # Numéros d'urgence
│   ├── checklists-prevention.ts, conseils-saisonniers.ts, alertes.ts
│   ├── global-search.ts      # Recherche globale
│   └── notifications.ts      # Abonnement Web Push côté client
├── supabase/migrations/      # push_subscriptions, sent_notifications, RLS
└── public/
    ├── icons/                # Icônes PWA et raccourcis (PNG + SVG)
    └── manifest.json         # Manifest PWA avec raccourcis
```

## APIs

### API Alertes Unifiée

Combine toutes les sources d'alertes en une seule API :

```
GET /api/alerts?dept=75&lat=48.85&lon=2.35
```

Réponse :
```json
{
  "alerts": [
    {
      "id": "73-avalanches-J",
      "type": "avalanches",
      "category": "meteo",
      "level": "jaune",
      "title": "Vigilance jaune Avalanches",
      "department": "Savoie",
      "source": "Météo-France",
      "icon": "🏔️",
      "advice": [...]
    }
  ],
  "count": 5,
  "sources": ["Météo-France", "Open-Meteo Air Quality"],
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### API Vigilance Météo

```
GET /api/vigilance?dept=75
```

Données Météo-France via Opendatasoft (données départementales).

### API Qualité de l'air

```
GET /api/air-quality?lat=48.85&lon=2.35
GET /api/air-quality?dept=75
```

Indice européen AQI via Open-Meteo.

### API Vigicrues

```
GET /api/vigicrues?dept=30
```

Vigilance crues en temps réel depuis le service officiel Vigicrues.

Réponse :
```json
{
  "alerts": [
    {
      "id": "vigicrues-30A",
      "troncon": "Le Gardon à Anduze",
      "niveau": "orange",
      "cours_eau": "Le Gardon",
      "departement": "Gard",
      "departementCode": "30"
    }
  ],
  "count": 2,
  "source": "Vigicrues - Ministère de la Transition écologique"
}
```

### API Météo des Forêts

```
GET /api/meteo-forets?dept=83
```

Risque incendie forêt calculé via l'Indice Feu Météo (IFM). Surveille 16 départements à risque (Var, Bouches-du-Rhône, Corse, etc.).

Réponse :
```json
{
  "alerts": [
    {
      "id": "foret-83",
      "departement": "Var",
      "departementCode": "83",
      "niveau": "eleve",
      "ifm": 72,
      "description": "Risque élevé de feu de forêt"
    }
  ],
  "source": "Météo des forêts (calcul IFM)"
}
```

### API Risque Incendie (FWI)

```
GET /api/fire-risk?dept=13
```

Calcul Fire Weather Index (FWI) basé sur les données météo (backup).

### API Défibrillateurs

```
GET /api/defibrillateurs?lat=48.85&lon=2.35&radius=2000&limit=20
```

Recherche les DAE à proximité via OpenDataSoft.

Réponse :
```json
{
  "defibrillateurs": [
    {
      "id": "dae-123",
      "nom": "Mairie du 5ème",
      "adresse": "21 Place du Panthéon",
      "commune": "Paris",
      "codePostal": "75005",
      "latitude": 48.846,
      "longitude": 2.346,
      "accessibilite": "Accessible 24h/24",
      "disponibilite": "24h/24",
      "distance": 150
    }
  ],
  "count": 15,
  "source": "OpenDataSoft - DAE France",
  "searchRadius": 2000
}
```

## Géolocalisation

Le système de géolocalisation permet :
- Détection automatique du département via GPS
- Mapping des coordonnées vers les 101 départements français
- Recherche des DAE à proximité
- Sauvegarde en localStorage pour les sessions futures
- Fallback sur sélection manuelle

## Configuration

### Département
L'utilisateur peut :
1. Utiliser la géolocalisation automatique (bouton "Me localiser")
2. Sélectionner manuellement parmi les départements populaires

### Mode sombre
Le thème s'adapte automatiquement aux préférences système ou peut être changé manuellement via le bouton dans le header.

### Notifications
Les notifications push alertent l'utilisateur en cas de vigilance orange ou rouge dans son département.

## Sources de données

| Type | Source | Fréquence |
|------|--------|-----------|
| Vigilance météo | Météo-France via Opendatasoft | 5 min |
| Vigilance crues | Vigicrues (Ministère Transition écologique) | 5 min |
| Qualité de l'air | Open-Meteo Air Quality (indice européen, CAMS) | 30 min |
| Risque incendie | **Estimation SécuCitoyen** (indice simplifié, non officiel, plafonné à orange, jamais poussé en notification) | 30 min |
| Défibrillateurs | OpenStreetMap via OpenDataSoft (`osm-france-defibrillator`, ODbL) | 1 heure |
| Département depuis la position | geo.api.gouv.fr | 24 h |

Seules les sources officielles (Météo-France, Vigicrues) peuvent déclencher une notification push ; en cas d'indisponibilité d'une source, aucune donnée n'est simulée (drapeau `degraded`).

## Contenu

| Section | Quantité |
|---------|----------|
| Fiches secours | 14 |
| Conseils prévention | 52 |
| Thématiques saisonnières | 18 |
| Numéros d'urgence | 17 |
| Sources d'alertes | 4 (+ 1 estimation) |

## Déploiement, cron & monitoring

### Variables d'environnement (production)
Voir `.env.local.example`. Les indispensables :
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (secret, serveur uniquement)
- `NEXT_PUBLIC_SITE_URL` = `https://secucitoyen.vercel.app`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- `NOTIFICATIONS_API_KEY`, `CRON_SECRET` (secrets forts, pas les placeholders)
- `NEXT_PUBLIC_SENTRY_DSN` (+ `SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN` pour l'upload des sourcemaps)

Appliquer aussi les migrations SQL de `supabase/migrations/` (dont `004_secure_rls.sql` et `005_sent_notifications_unique.sql`).

### Tests
```bash
npm test                 # Jest (unitaires + routes API)
npm run test:e2e         # Playwright (navigation, responsive, a11y axe-core, page Alertes mockée)
# Tests hors-ligne (service worker) sur un build de production :
npx next build && npx next start
E2E_PWA=1 npx playwright test e2e/offline.spec.ts --project="Desktop Chrome"
```

### Cron des notifications
Le plan Vercel Hobby n'autorise pas de cron plus fréquent qu'une fois par jour.
Le déclenchement se fait donc via **GitHub Actions** (`.github/workflows/cron-alerts.yml`,
toutes les 15 min) qui appelle `/api/cron/check-alerts` avec `Authorization: Bearer $CRON_SECRET`.
Secrets GitHub requis : `PRODUCTION_URL`, `CRON_SECRET`.

> ⚠️ Les crons GitHub Actions sont **best-effort** (retards possibles) et sont
> **désactivés après 60 j d'inactivité** du dépôt. Pour une app d'alerte, prévoir
> un **déclencheur externe redondant** (cron-job.org, UptimeRobot…) pointant sur
> le même endpoint avec le même `Bearer $CRON_SECRET`.

### Monitoring
- `/api/health` renvoie `status: "healthy" | "degraded"` + l'état des circuit breakers
  par source. À surveiller via UptimeRobot (monitoring par **mot-clé** sur `"healthy"`)
  pour être alerté d'une dégradation.
- Erreurs applicatives : Sentry (client + serveur).
- Trafic : Vercel Analytics.

## Licence

MIT
