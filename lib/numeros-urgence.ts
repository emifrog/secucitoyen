export interface EmergencyNumber {
  number: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'vital' | 'social' | 'special';
  details: string[];
  available: string;
  searchKeywords?: string[];
}

export const emergencyNumbers: EmergencyNumber[] = [
  // Urgences vitales
  {
    number: '15',
    name: 'SAMU',
    description: 'Urgences médicales',
    icon: '🏥',
    color: 'bg-red-600',
    category: 'vital',
    available: '24h/24, 7j/7',
    details: [
      'Détresse vitale : arrêt cardiaque, AVC, difficultés respiratoires',
      'Accidents graves avec blessés',
      'Intoxications et empoisonnements',
      'Douleurs thoraciques intenses',
      'Régulation médicale et conseil',
    ],
    searchKeywords: ['médecin', 'hôpital', 'ambulance', 'malaise', 'accident'],
  },
  {
    number: '17',
    name: 'Police secours',
    description: 'Police et gendarmerie',
    icon: '👮',
    color: 'bg-blue-600',
    category: 'vital',
    available: '24h/24, 7j/7',
    details: [
      'Violences en cours',
      'Cambriolage ou vol',
      'Accident de la route',
      'Tapage nocturne',
      'Disparition inquiétante',
    ],
    searchKeywords: ['vol', 'agression', 'cambriolage', 'violence', 'accident'],
  },
  {
    number: '18',
    name: 'Pompiers',
    description: 'Incendies et accidents',
    icon: '🚒',
    color: 'bg-red-600',
    category: 'vital',
    available: '24h/24, 7j/7',
    details: [
      'Incendies de toute nature',
      'Accidents de la route',
      'Inondations et catastrophes naturelles',
      'Fuite de gaz',
      'Secours à personnes',
    ],
    searchKeywords: ['feu', 'incendie', 'accident', 'inondation', 'gaz'],
  },
  {
    number: '112',
    name: 'Urgences européennes',
    description: 'Numéro universel',
    icon: '🆘',
    color: 'bg-green-700',
    category: 'vital',
    available: '24h/24, 7j/7',
    details: [
      'Fonctionne dans toute l\'Union Européenne',
      'Accessible même sans carte SIM',
      'Localisation automatique',
      'Multilingue',
      'Redirige vers le service approprié (15, 17, 18)',
    ],
    searchKeywords: ['europe', 'étranger', 'voyage', 'universel'],
  },
  {
    number: '114',
    name: 'Urgences par SMS',
    description: 'Personnes sourdes ou malentendantes',
    icon: '📱',
    color: 'bg-purple-600',
    category: 'special',
    available: '24h/24, 7j/7',
    details: [
      'Accessible par SMS, chat ou visio',
      'Pour personnes sourdes, malentendantes ou aphasiques',
      'Aussi utilisable si vous ne pouvez pas parler',
      'Transmet aux services 15, 17 ou 18',
      'Application dédiée disponible',
    ],
    searchKeywords: ['sourd', 'muet', 'sms', 'texto', 'silencieux'],
  },
  // Urgences sociales
  {
    number: '115',
    name: 'SAMU Social',
    description: 'Hébergement d\'urgence',
    icon: '🏠',
    color: 'bg-orange-700',
    category: 'social',
    available: '24h/24, 7j/7',
    details: [
      'Hébergement d\'urgence pour sans-abri',
      'Orientation vers les structures d\'accueil',
      'Maraudes et équipes mobiles',
      'Signalement de personnes en danger dans la rue',
    ],
    searchKeywords: ['sdf', 'sans-abri', 'hébergement', 'rue', 'froid'],
  },
  {
    number: '119',
    name: 'Enfance en danger',
    description: 'Protection de l\'enfance',
    icon: '👶',
    color: 'bg-pink-700',
    category: 'social',
    available: '24h/24, 7j/7',
    details: [
      'Maltraitance physique ou psychologique',
      'Négligences graves',
      'Abus sexuels',
      'Appel anonyme et confidentiel',
      'Aussi pour les enfants qui appellent eux-mêmes',
    ],
    searchKeywords: ['enfant', 'maltraitance', 'abus', 'violence', 'mineur'],
  },
  {
    number: '3114',
    name: 'Prévention suicide',
    description: 'Écoute et soutien',
    icon: '💜',
    color: 'bg-indigo-600',
    category: 'social',
    available: '24h/24, 7j/7',
    details: [
      'Écoute bienveillante et confidentielle',
      'Pour les personnes en détresse',
      'Pour les proches inquiets',
      'Orientation vers les soins si nécessaire',
      'Équipe de professionnels formés',
    ],
    searchKeywords: ['suicide', 'dépression', 'mal-être', 'écoute', 'aide'],
  },
  // Numéros spéciaux
  {
    number: '116 000',
    name: 'Enfants disparus',
    description: 'Disparition d\'enfant',
    icon: '🔍',
    color: 'bg-amber-700',
    category: 'special',
    available: '24h/24, 7j/7',
    details: [
      'Signalement de disparition d\'enfant',
      'Fugues',
      'Enlèvements parentaux',
      'Soutien aux familles',
      'Fonctionne dans toute l\'Europe',
    ],
    searchKeywords: ['disparition', 'enfant', 'fugue', 'enlèvement'],
  },
  {
    number: '3919',
    name: 'Violences conjugales',
    description: 'Violences faites aux femmes',
    icon: '🤝',
    color: 'bg-rose-700',
    category: 'social',
    available: '24h/24, 7j/7',
    details: [
      'Violences physiques, psychologiques, sexuelles',
      'Écoute, information et orientation',
      'Anonyme et confidentiel',
      'Aussi pour les proches et témoins',
      'Ne laisse pas de trace sur la facture téléphonique',
    ],
    searchKeywords: ['violence', 'femme', 'conjugale', 'couple', 'harcèlement'],
  },
  {
    number: '0 800 06 66 66',
    name: 'Canicule Info Service',
    description: 'En période de canicule',
    icon: '🌡️',
    color: 'bg-amber-700',
    category: 'special',
    available: '9h-19h en période d\'alerte',
    details: [
      'Conseils pour se protéger de la chaleur',
      'Informations sur les lieux rafraîchis',
      'Signalement de personnes vulnérables',
      'Numéro vert gratuit',
    ],
    searchKeywords: ['chaleur', 'canicule', 'été', 'chaud'],
  },
  {
    number: '196',
    name: 'Urgences en mer',
    description: 'Sauvetage maritime',
    icon: '⚓',
    color: 'bg-cyan-700',
    category: 'special',
    available: '24h/24, 7j/7',
    details: [
      'CROSS - Centres Régionaux de Surveillance',
      'Naufrage, homme à la mer',
      'Détresse en mer ou sur le littoral',
      'Pollution marine',
    ],
    searchKeywords: ['mer', 'bateau', 'noyade', 'plage', 'maritime'],
  },
  {
    number: '191',
    name: 'Urgence aéronautique',
    description: 'Aéronef en détresse, accident aérien',
    icon: '✈️',
    color: 'bg-sky-700',
    category: 'special',
    available: '24h/24, 7j/7',
    details: [
      'Centre national des opérations aériennes (armée de l\'Air)',
      'Aéronef en difficulté, disparu ou accidenté',
      'Témoin d\'un crash ou d\'un aéronef en détresse',
      'Appel gratuit',
    ],
    searchKeywords: ['avion', 'aérien', 'crash', 'ulm', 'hélicoptère', 'parapente'],
  },
  {
    number: '197',
    name: 'Alerte attentat / enlèvement',
    description: 'Témoignages pendant une alerte en cours',
    icon: '📢',
    color: 'bg-slate-700',
    category: 'special',
    available: 'Uniquement pendant une alerte déclenchée',
    details: [
      'Activé par les autorités lors d\'une alerte attentat ou d\'une alerte enlèvement',
      'Pour transmettre un témoignage ou une information utile aux enquêteurs',
      'Ne remplace pas le 17 pour signaler un danger immédiat',
      'Appel gratuit',
    ],
    searchKeywords: ['attentat', 'enlèvement', 'témoin', 'alerte', 'terrorisme'],
  },
  {
    number: '116 006',
    name: 'Aide aux victimes',
    description: 'Écoute et orientation des victimes d\'infractions',
    icon: '🤝',
    color: 'bg-violet-600',
    category: 'social',
    available: '7j/7, de 9h à 19h',
    details: [
      'Numéro européen d\'aide aux victimes (France Victimes)',
      'Victime ou proche d\'une victime d\'infraction, d\'accident ou de catastrophe',
      'Information sur vos droits, orientation vers une association locale',
      'Appel gratuit, anonyme et confidentiel',
    ],
    searchKeywords: ['victime', 'agression', 'vol', 'droits', 'plainte', 'aide'],
  },
  {
    number: '3018',
    name: 'Harcèlement et violences numériques',
    description: 'Jeunes victimes de harcèlement (école, internet)',
    icon: '📱',
    color: 'bg-indigo-600',
    category: 'social',
    available: '7j/7, de 9h à 23h',
    details: [
      'Harcèlement scolaire, cyberharcèlement, chantage à la webcam, contenus violents',
      'Pour les jeunes, les parents et les professionnels',
      'Peut faire retirer des contenus en quelques heures (plateformes partenaires)',
      'Appel gratuit, anonyme et confidentiel',
    ],
    searchKeywords: ['harcèlement', 'cyber', 'école', 'réseaux sociaux', 'ado', 'jeune'],
  },
  {
    number: '39 77',
    name: 'Maltraitance personnes âgées ou handicapées',
    description: 'Signaler une maltraitance ou une négligence',
    icon: '🧓',
    color: 'bg-teal-700',
    category: 'social',
    available: 'Lundi-vendredi, de 9h à 19h',
    details: [
      'Maltraitance physique, psychologique, financière ou négligence',
      'À domicile comme en établissement',
      'Pour les victimes, les proches et les professionnels',
      'Prix d\'un appel local',
    ],
    searchKeywords: ['maltraitance', 'âgé', 'senior', 'handicap', 'ehpad', 'négligence'],
  },
];

export const categories = {
  vital: {
    title: 'Urgences vitales',
    description: 'Appelez immédiatement en cas de danger',
    color: 'bg-red-100 border-red-200',
    textColor: 'text-red-800',
  },
  social: {
    title: 'Aide sociale',
    description: 'Écoute, soutien et orientation',
    color: 'bg-blue-100 border-blue-200',
    textColor: 'text-blue-800',
  },
  special: {
    title: 'Numéros spécialisés',
    description: 'Situations particulières',
    color: 'bg-amber-100 border-amber-200',
    textColor: 'text-amber-800',
  },
};

export function getNumbersByCategory(category: 'vital' | 'social' | 'special') {
  return emergencyNumbers.filter((n) => n.category === category);
}

export function searchNumbers(query: string): EmergencyNumber[] {
  const q = query.toLowerCase();
  return emergencyNumbers.filter(
    (n) =>
      n.name.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q) ||
      n.searchKeywords?.some((k) => k.includes(q))
  );
}

export function getNumberByNumber(number: string): EmergencyNumber | undefined {
  // Normaliser le numéro (remplacer les tirets par des espaces)
  const normalized = number.replace(/-/g, ' ');
  return emergencyNumbers.find((n) => n.number === normalized);
}
