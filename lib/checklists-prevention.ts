export interface ChecklistItem {
  id: string;
  text: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ChecklistCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  items: ChecklistItem[];
}

export const checklistsPrevention: ChecklistCategory[] = [
  {
    id: 'domicile',
    title: 'Sécurité domicile',
    icon: '🏠',
    color: 'bg-blue-500',
    description: 'Vérifications essentielles pour sécuriser votre logement',
    items: [
      {
        id: 'dom-1',
        text: 'Installer des détecteurs de fumée',
        description: 'Au moins un par étage, obligatoire depuis 2015',
        priority: 'high',
      },
      {
        id: 'dom-2',
        text: 'Tester les détecteurs chaque mois',
        description: 'Appuyez sur le bouton test et changez les piles chaque année',
        priority: 'high',
      },
      {
        id: 'dom-3',
        text: 'Avoir un extincteur accessible',
        description: 'Idéalement dans la cuisine, vérifiez la date de péremption',
        priority: 'medium',
      },
      {
        id: 'dom-4',
        text: 'Installer un détecteur de monoxyde de carbone',
        description: 'Obligatoire si chauffage au gaz, bois ou fioul',
        priority: 'high',
      },
      {
        id: 'dom-5',
        text: 'Vérifier l\'installation électrique',
        description: 'Faire contrôler par un professionnel tous les 10 ans',
        priority: 'medium',
      },
      {
        id: 'dom-6',
        text: 'Ne pas surcharger les multiprises',
        description: 'Respecter la puissance maximale indiquée',
        priority: 'medium',
      },
      {
        id: 'dom-7',
        text: 'Stocker les produits dangereux en sécurité',
        description: 'Hors de portée des enfants, dans un placard fermé',
        priority: 'high',
      },
      {
        id: 'dom-8',
        text: 'Connaître l\'emplacement des vannes de gaz et eau',
        description: 'Pour pouvoir les couper rapidement en cas d\'urgence',
        priority: 'medium',
      },
      {
        id: 'dom-9',
        text: 'Afficher les numéros d\'urgence',
        description: 'Près du téléphone fixe ou sur le frigo',
        priority: 'low',
      },
      {
        id: 'dom-10',
        text: 'Établir un plan d\'évacuation familial',
        description: 'Avec un point de rassemblement à l\'extérieur',
        priority: 'medium',
      },
    ],
  },
  {
    id: 'kit-urgence',
    title: 'Kit d\'urgence',
    icon: '🎒',
    color: 'bg-red-500',
    description: 'Éléments à avoir prêts en cas d\'évacuation ou de confinement',
    items: [
      {
        id: 'kit-1',
        text: 'Eau potable (6L par personne)',
        description: 'Pour 3 jours, à renouveler tous les 6 mois',
        priority: 'high',
      },
      {
        id: 'kit-2',
        text: 'Nourriture non périssable',
        description: 'Conserves, barres énergétiques, fruits secs pour 3 jours',
        priority: 'high',
      },
      {
        id: 'kit-3',
        text: 'Radio à piles ou à manivelle',
        description: 'Pour suivre les consignes des autorités',
        priority: 'high',
      },
      {
        id: 'kit-4',
        text: 'Lampe torche + piles de rechange',
        description: 'Vérifiez le fonctionnement régulièrement',
        priority: 'high',
      },
      {
        id: 'kit-5',
        text: 'Trousse de premiers secours',
        description: 'Pansements, désinfectant, médicaments essentiels',
        priority: 'high',
      },
      {
        id: 'kit-6',
        text: 'Copies des documents importants',
        description: 'Carte d\'identité, assurance, ordonnances dans un sac étanche',
        priority: 'medium',
      },
      {
        id: 'kit-7',
        text: 'Argent liquide',
        description: 'Les distributeurs peuvent être hors service',
        priority: 'medium',
      },
      {
        id: 'kit-8',
        text: 'Chargeur de téléphone (batterie externe)',
        description: 'Gardez-la chargée',
        priority: 'medium',
      },
      {
        id: 'kit-9',
        text: 'Couverture de survie',
        description: 'Compacte et légère, pour le froid ou la chaleur',
        priority: 'medium',
      },
      {
        id: 'kit-10',
        text: 'Sifflet',
        description: 'Pour signaler votre présence aux secours',
        priority: 'low',
      },
      {
        id: 'kit-11',
        text: 'Masques de protection',
        description: 'FFP2 ou chirurgicaux',
        priority: 'medium',
      },
      {
        id: 'kit-12',
        text: 'Double des clés',
        description: 'Maison et voiture',
        priority: 'low',
      },
    ],
  },
  {
    id: 'routiere',
    title: 'Sécurité routière',
    icon: '🚗',
    color: 'bg-green-500',
    description: 'Équipements et vérifications pour la route',
    items: [
      {
        id: 'route-1',
        text: 'Gilet jaune dans l\'habitacle',
        description: 'Obligatoire et accessible sans sortir du véhicule',
        priority: 'high',
      },
      {
        id: 'route-2',
        text: 'Triangle de signalisation',
        description: 'Obligatoire, à placer à 30m minimum du véhicule',
        priority: 'high',
      },
      {
        id: 'route-3',
        text: 'Roue de secours ou kit anti-crevaison',
        description: 'Vérifiez la pression de la roue de secours',
        priority: 'high',
      },
      {
        id: 'route-4',
        text: 'Vérifier les pneus (usure et pression)',
        description: 'Chaque mois et avant un long trajet',
        priority: 'high',
      },
      {
        id: 'route-5',
        text: 'Trousse de premiers secours',
        description: 'Recommandée dans le véhicule',
        priority: 'medium',
      },
      {
        id: 'route-6',
        text: 'Câbles de démarrage',
        description: 'Pour batterie à plat',
        priority: 'low',
      },
      {
        id: 'route-7',
        text: 'Lampe torche',
        description: 'Pour les pannes de nuit',
        priority: 'medium',
      },
      {
        id: 'route-8',
        text: 'Constat amiable',
        description: 'Toujours avoir des exemplaires vierges',
        priority: 'medium',
      },
      {
        id: 'route-9',
        text: 'Vérifier les niveaux (huile, liquide de refroidissement)',
        description: 'Avant chaque long trajet',
        priority: 'medium',
      },
      {
        id: 'route-10',
        text: 'Éthylotest',
        description: 'Recommandé, non obligatoire depuis 2020',
        priority: 'low',
      },
    ],
  },
  {
    id: 'cyber',
    title: 'Cybersécurité',
    icon: '💻',
    color: 'bg-purple-500',
    description: 'Bonnes pratiques pour protéger vos données numériques',
    items: [
      {
        id: 'cyber-1',
        text: 'Utiliser des mots de passe forts et uniques',
        description: 'Au moins 12 caractères, mélange de lettres, chiffres, symboles',
        priority: 'high',
      },
      {
        id: 'cyber-2',
        text: 'Activer l\'authentification à deux facteurs',
        description: 'Sur tous les comptes importants (banque, email, réseaux sociaux)',
        priority: 'high',
      },
      {
        id: 'cyber-3',
        text: 'Utiliser un gestionnaire de mots de passe',
        description: 'Pour ne pas réutiliser les mêmes mots de passe',
        priority: 'high',
      },
      {
        id: 'cyber-4',
        text: 'Mettre à jour régulièrement les logiciels',
        description: 'Système d\'exploitation, navigateurs, applications',
        priority: 'high',
      },
      {
        id: 'cyber-5',
        text: 'Installer un antivirus',
        description: 'Et le maintenir à jour',
        priority: 'medium',
      },
      {
        id: 'cyber-6',
        text: 'Sauvegarder régulièrement ses données',
        description: 'Sur un disque dur externe ou dans le cloud',
        priority: 'high',
      },
      {
        id: 'cyber-7',
        text: 'Se méfier des emails suspects',
        description: 'Ne pas cliquer sur les liens, vérifier l\'expéditeur',
        priority: 'high',
      },
      {
        id: 'cyber-8',
        text: 'Éviter les réseaux Wi-Fi publics non sécurisés',
        description: 'Ou utiliser un VPN',
        priority: 'medium',
      },
      {
        id: 'cyber-9',
        text: 'Vérifier les paramètres de confidentialité',
        description: 'Sur les réseaux sociaux et applications',
        priority: 'medium',
      },
      {
        id: 'cyber-10',
        text: 'Ne jamais communiquer ses identifiants',
        description: 'Aucune banque ou administration ne les demande',
        priority: 'high',
      },
    ],
  },
  {
    id: 'risques-naturels',
    title: 'Risques naturels',
    icon: '🌊',
    color: 'bg-amber-500',
    description: 'Préparation face aux catastrophes naturelles',
    items: [
      {
        id: 'nat-1',
        text: 'Connaître les risques de sa commune',
        description: 'Consultez le DICRIM en mairie ou sur georisques.gouv.fr',
        priority: 'high',
      },
      {
        id: 'nat-2',
        text: 'S\'inscrire aux alertes de sa commune',
        description: 'Système d\'alerte SMS ou téléphone',
        priority: 'high',
      },
      {
        id: 'nat-3',
        text: 'Télécharger l\'app FR-Alert',
        description: 'Alertes géolocalisées sur smartphone',
        priority: 'high',
      },
      {
        id: 'nat-4',
        text: 'Identifier un lieu de mise à l\'abri',
        description: 'Point haut en cas d\'inondation, cave en cas de tempête',
        priority: 'medium',
      },
      {
        id: 'nat-5',
        text: 'Repérer les points de rassemblement',
        description: 'Indiqués sur le plan communal de sauvegarde',
        priority: 'medium',
      },
      {
        id: 'nat-6',
        text: 'Avoir le kit d\'urgence prêt',
        description: 'Voir la check-list dédiée',
        priority: 'high',
      },
      {
        id: 'nat-7',
        text: 'Savoir couper l\'eau, le gaz et l\'électricité',
        description: 'En cas d\'évacuation ou d\'inondation',
        priority: 'medium',
      },
      {
        id: 'nat-8',
        text: 'Avoir un plan d\'évacuation familial',
        description: 'Avec un point de rassemblement et contacts d\'urgence',
        priority: 'medium',
      },
      {
        id: 'nat-9',
        text: 'Suivre les bulletins météo',
        description: 'Vigilance Météo-France en période de risque',
        priority: 'medium',
      },
      {
        id: 'nat-10',
        text: 'Connaître les gestes réflexes',
        description: 'Inondation : montez, séisme : abritez-vous, tempête : rentrez',
        priority: 'high',
      },
    ],
  },
];

export function getChecklistById(id: string): ChecklistCategory | undefined {
  return checklistsPrevention.find((checklist) => checklist.id === id);
}

export function getChecklistsSummary() {
  return checklistsPrevention.map(({ id, title, icon, color, description, items }) => ({
    id,
    title,
    icon,
    color,
    description,
    itemCount: items.length,
  }));
}
