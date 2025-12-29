export type AlertLevel = 'vert' | 'jaune' | 'orange' | 'rouge';
export type AlertType =
  | 'vent'
  | 'pluie-inondation'
  | 'orages'
  | 'neige-verglas'
  | 'canicule'
  | 'grand-froid'
  | 'avalanches'
  | 'vagues-submersion'
  | 'crues'
  | 'pollution';

export interface Alert {
  id: string;
  type: AlertType;
  level: AlertLevel;
  title: string;
  description: string;
  department?: string;
  departmentCode?: string;
  startDate: string;
  endDate?: string;
  updatedAt: string;
  source: string;
  advice: string[];
}

export interface AlertTypeInfo {
  type: AlertType;
  name: string;
  icon: string;
  description: string;
  adviceByLevel: {
    jaune: string[];
    orange: string[];
    rouge: string[];
  };
}

export const alertLevels: Record<AlertLevel, { name: string; color: string; bgColor: string; borderColor: string; textColor: string }> = {
  vert: {
    name: 'Vigilance verte',
    color: '#22c55e',
    bgColor: 'bg-green-500',
    borderColor: 'border-green-500',
    textColor: 'text-green-800',
  },
  jaune: {
    name: 'Vigilance jaune',
    color: '#eab308',
    bgColor: 'bg-yellow-400',
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-800',
  },
  orange: {
    name: 'Vigilance orange',
    color: '#f97316',
    bgColor: 'bg-orange-500',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-800',
  },
  rouge: {
    name: 'Vigilance rouge',
    color: '#ef4444',
    bgColor: 'bg-red-600',
    borderColor: 'border-red-600',
    textColor: 'text-red-800',
  },
};

export const alertTypes: AlertTypeInfo[] = [
  {
    type: 'vent',
    name: 'Vent violent',
    icon: '💨',
    description: 'Rafales de vent pouvant atteindre des vitesses dangereuses',
    adviceByLevel: {
      jaune: [
        'Soyez prudent lors de vos déplacements',
        'Rangez les objets susceptibles d\'être emportés',
      ],
      orange: [
        'Limitez vos déplacements',
        'Mettez à l\'abri les objets sensibles au vent',
        'N\'intervenez pas sur les toitures',
        'Éloignez-vous des arbres et panneaux publicitaires',
      ],
      rouge: [
        'Restez chez vous',
        'Mettez-vous à l\'abri dans un bâtiment solide',
        'Ne prenez pas la route',
        'Débranchez les appareils électriques',
      ],
    },
  },
  {
    type: 'pluie-inondation',
    name: 'Pluie-Inondation',
    icon: '🌧️',
    description: 'Fortes précipitations pouvant causer des inondations',
    adviceByLevel: {
      jaune: [
        'Tenez-vous informé de l\'évolution météo',
        'Évitez les zones habituellement inondables',
      ],
      orange: [
        'Reportez vos déplacements',
        'Ne vous engagez pas sur une route inondée',
        'Montez à pied dans les étages',
        'Coupez gaz et électricité si l\'eau monte',
      ],
      rouge: [
        'Restez ou montez en lieu sûr',
        'N\'allez pas chercher vos enfants à l\'école',
        'Ne descendez pas dans les sous-sols',
        'Appelez le 18 si vous êtes en danger',
      ],
    },
  },
  {
    type: 'orages',
    name: 'Orages',
    icon: '⛈️',
    description: 'Orages violents avec risque de foudre, grêle et rafales',
    adviceByLevel: {
      jaune: [
        'Soyez prudent en extérieur',
        'Évitez les activités en plein air',
      ],
      orange: [
        'Abritez-vous dans un bâtiment solide',
        'Évitez les arbres isolés et les structures métalliques',
        'Reportez les activités de plein air',
        'Débranchez les appareils électriques sensibles',
      ],
      rouge: [
        'Restez à l\'abri',
        'Ne sortez sous aucun prétexte',
        'Éloignez-vous des fenêtres',
        'En voiture, arrêtez-vous en lieu sûr',
      ],
    },
  },
  {
    type: 'neige-verglas',
    name: 'Neige-Verglas',
    icon: '❄️',
    description: 'Chutes de neige ou formation de verglas',
    adviceByLevel: {
      jaune: [
        'Préparez votre véhicule (pneus, chaînes)',
        'Conduisez prudemment',
      ],
      orange: [
        'Limitez vos déplacements',
        'Munissez-vous d\'équipements spéciaux',
        'Protégez vos canalisations du gel',
        'Dégagez les trottoirs devant chez vous',
      ],
      rouge: [
        'Ne prenez pas la route',
        'Restez chez vous au chaud',
        'Prenez des nouvelles des personnes vulnérables',
        'En cas de coupure de chauffage, appelez le 15',
      ],
    },
  },
  {
    type: 'canicule',
    name: 'Canicule',
    icon: '🌡️',
    description: 'Températures très élevées pendant plusieurs jours',
    adviceByLevel: {
      jaune: [
        'Buvez régulièrement de l\'eau',
        'Évitez les efforts physiques aux heures chaudes',
      ],
      orange: [
        'Passez plusieurs heures dans un lieu frais',
        'Mouiller-vous le corps régulièrement',
        'Évitez de sortir entre 11h et 21h',
        'Prenez des nouvelles de vos proches',
      ],
      rouge: [
        'Danger pour toute la population',
        'Restez dans des lieux climatisés',
        'Mouillez-vous et ventilez-vous',
        'Appelez le 15 en cas de malaise',
        'Signalez les personnes isolées au 0 800 06 66 66',
      ],
    },
  },
  {
    type: 'grand-froid',
    name: 'Grand froid',
    icon: '🥶',
    description: 'Températures très basses avec risque pour la santé',
    adviceByLevel: {
      jaune: [
        'Couvrez-vous bien',
        'Vérifiez votre chauffage',
      ],
      orange: [
        'Limitez les efforts physiques',
        'Habillez-vous chaudement (multicouches)',
        'Chauffez normalement votre logement',
        'Signalez les sans-abri au 115',
      ],
      rouge: [
        'Restez chez vous si possible',
        'Évitez tout effort physique',
        'Surveillez les personnes fragiles',
        'Appelez le 15 en cas de gelures ou hypothermie',
      ],
    },
  },
  {
    type: 'avalanches',
    name: 'Avalanches',
    icon: '🏔️',
    description: 'Risque élevé d\'avalanches en montagne',
    adviceByLevel: {
      jaune: [
        'Restez sur les pistes balisées',
        'Consultez les bulletins d\'estimation du risque',
      ],
      orange: [
        'Évitez le hors-piste',
        'Soyez équipé (DVA, pelle, sonde)',
        'Ne partez jamais seul',
        'Informez quelqu\'un de votre itinéraire',
      ],
      rouge: [
        'Ne pratiquez pas d\'activité en montagne',
        'Respectez les interdictions',
        'Évitez les zones exposées',
      ],
    },
  },
  {
    type: 'vagues-submersion',
    name: 'Vagues-Submersion',
    icon: '🌊',
    description: 'Risque de submersion marine sur le littoral',
    adviceByLevel: {
      jaune: [
        'Évitez de vous promener sur le littoral',
        'Ne vous baignez pas',
      ],
      orange: [
        'Éloignez-vous du rivage',
        'Ne restez pas dans votre véhicule en bord de mer',
        'Mettez-vous à l\'abri sur les hauteurs',
        'Fermez portes et volets côté mer',
      ],
      rouge: [
        'Évacuez les zones littorales basses',
        'Montez à l\'étage ou sur un point haut',
        'N\'allez pas chercher vos enfants à l\'école',
        'Coupez gaz et électricité avant de partir',
      ],
    },
  },
  {
    type: 'crues',
    name: 'Crues',
    icon: '🌊',
    description: 'Risque de débordement des cours d\'eau',
    adviceByLevel: {
      jaune: [
        'Tenez-vous informé',
        'Évitez les abords des cours d\'eau',
      ],
      orange: [
        'Ne descendez pas dans les sous-sols',
        'Garez vos véhicules en hauteur',
        'Préparez un kit d\'urgence',
        'Montez les meubles et objets de valeur',
      ],
      rouge: [
        'Évacuez si demandé',
        'Montez aux étages supérieurs',
        'Ne franchissez jamais une zone inondée',
        'Appelez le 18 si danger immédiat',
      ],
    },
  },
  {
    type: 'pollution',
    name: 'Pollution',
    icon: '😷',
    description: 'Pic de pollution atmosphérique',
    adviceByLevel: {
      jaune: [
        'Personnes sensibles : limitez les efforts',
        'Privilégiez les transports en commun',
      ],
      orange: [
        'Évitez les efforts intenses en extérieur',
        'Personnes sensibles : restez à l\'intérieur',
        'Limitez l\'usage de la voiture',
        'Ne faites pas de feu de cheminée',
      ],
      rouge: [
        'Restez à l\'intérieur',
        'Reportez tous les efforts physiques',
        'Respectez les restrictions de circulation',
        'Consultez un médecin si gêne respiratoire',
      ],
    },
  },
];

export function getAlertTypeInfo(type: AlertType): AlertTypeInfo | undefined {
  return alertTypes.find((t) => t.type === type);
}

export function getAdviceForAlert(type: AlertType, level: AlertLevel): string[] {
  if (level === 'vert') return [];
  const typeInfo = getAlertTypeInfo(type);
  return typeInfo?.adviceByLevel[level] || [];
}

// Alertes simulées (sera remplacé par l'API)
export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    type: 'orages',
    level: 'orange',
    title: 'Vigilance orange orages',
    description: 'Des orages violents sont attendus. Ils seront accompagnés de fortes rafales de vent et de grêle.',
    department: 'Haute-Garonne',
    departmentCode: '31',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'Météo-France',
    advice: [],
  },
  {
    id: 'alert-2',
    type: 'canicule',
    level: 'jaune',
    title: 'Vigilance jaune canicule',
    description: 'Températures élevées prévues. Pic attendu en milieu d\'après-midi.',
    department: 'Paris',
    departmentCode: '75',
    startDate: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: 'Météo-France',
    advice: [],
  },
];
