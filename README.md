# SécuCitoyen

Application Progressive Web App (PWA) de sécurité citoyenne pour la France. Prévention, alertes météo et accès rapide aux numéros d'urgence.

## Fonctionnalités

### Urgences
- Accès rapide aux numéros d'urgence (15, 17, 18, 112, etc.)
- Bouton flottant (FAB) pour appel d'urgence immédiat
- Favoris pour les numéros les plus utilisés
- Partage de position GPS par SMS

### Secours
- **15 fiches pratiques** des gestes qui sauvent
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

### Multi-langue
- **3 langues supportées** : Français, English, Italiano
- Détection automatique de la langue du navigateur
- Sélecteur de langue dans le header
- Sauvegarde des préférences

### PWA
- Installation sur l'écran d'accueil
- **Raccourcis** : Appel direct 15, 17, 18 et accès DAE
- **Widget** d'urgence pour l'écran d'accueil
- Fonctionnement hors-ligne
- Notifications push
- Mode sombre automatique

## Technologies

- **Framework** : Next.js 14 (App Router)
- **Styling** : Tailwind CSS
- **PWA** : next-pwa
- **TypeScript** : Typage strict
- **API** : Route handlers Next.js
- **i18n** : Système de traduction maison (FR, EN, IT)

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
│   │   ├── alerts/           # API unifiée (toutes alertes)
│   │   ├── vigilance/        # API Météo-France
│   │   ├── air-quality/      # API qualité de l'air
│   │   ├── vigicrues/        # API vigilance crues
│   │   ├── meteo-forets/     # API risque incendie forêt (IFM)
│   │   ├── fire-risk/        # API risque incendie (FWI)
│   │   ├── defibrillateurs/  # API DAE à proximité
│   │   └── widget/           # API widget PWA
│   ├── alertes/              # Page alertes
│   ├── conseils-saison/      # Page conseils saisonniers
│   ├── defibrillateurs/      # Page recherche DAE
│   ├── prevention/           # Page prévention
│   ├── secours/              # Page gestes de secours
│   ├── urgences/             # Page numéros d'urgence
│   ├── layout.tsx            # Layout principal
│   └── page.tsx              # Page d'accueil
├── components/
│   ├── alertes/              # Composants alertes
│   ├── favorites/            # Système de favoris
│   ├── home/                 # Composants accueil (SeasonalTips, etc.)
│   ├── layout/               # Header, Nav, FAB, Search, Install, LanguageSelector
│   ├── prevention/           # Composants prévention
│   ├── providers/            # Context providers (Theme)
│   ├── secours/              # Composants secours
│   ├── ui/                   # Composants UI (Card, Button)
│   └── urgences/             # Composants urgences
├── lib/
│   ├── i18n/                 # Système multi-langue
│   │   ├── context.tsx       # Provider et hooks
│   │   ├── translations.ts   # Traductions FR/EN/IT
│   │   └── index.ts          # Exports
│   ├── conseils-saisonniers.ts  # Données conseils par saison
│   ├── fiches-secours.ts     # 15 fiches premiers secours
│   ├── checklists-prevention.ts # Check-lists prévention
│   ├── geolocation.ts        # Géolocalisation & départements
│   ├── global-search.ts      # Recherche globale
│   ├── notifications.ts      # Système notifications
│   └── alertes.ts            # Types et données alertes
├── public/
│   ├── icons/                # Icônes PWA et raccourcis
│   └── manifest.json         # Manifest PWA avec shortcuts et widgets
└── data/
    └── emergency-numbers.ts
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

### Langue
L'application détecte automatiquement la langue du navigateur (FR, EN, IT) ou permet de changer via le sélecteur dans le header.

### Notifications
Les notifications push alertent l'utilisateur en cas de vigilance orange ou rouge dans son département.

## Sources de données

| Type | Source | Fréquence |
|------|--------|-----------|
| Vigilance météo | Météo-France via Opendatasoft | 5 min |
| Vigilance crues | Vigicrues (Ministère Transition écologique) | 5 min |
| Qualité de l'air | Open-Meteo Air Quality | 30 min |
| Risque incendie forêt | Météo des forêts (calcul IFM) | 30 min |
| Risque incendie | Calcul FWI (Open-Meteo) | 1 heure |
| Défibrillateurs | OpenDataSoft - DAE France | 1 heure |

## Contenu

| Section | Quantité |
|---------|----------|
| Fiches secours | 15 |
| Conseils prévention | 52 |
| Thématiques saisonnières | 18 |
| Numéros d'urgence | 12+ |
| Langues supportées | 3 |
| Sources d'alertes | 5 |

## Licence

MIT
