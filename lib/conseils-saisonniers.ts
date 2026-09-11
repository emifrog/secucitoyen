export interface ConseilSaisonnier {
  id: string;
  titre: string;
  description: string;
  icon: string;
  conseils: string[];
  urgence?: string;
}

export interface Saison {
  id: string;
  nom: string;
  icon: string;
  mois: number[]; // 0-11
  couleur: string;
  conseils: ConseilSaisonnier[];
}

export const saisons: Saison[] = [
  {
    id: 'hiver',
    nom: 'Hiver',
    icon: '❄️',
    mois: [11, 0, 1], // Décembre, Janvier, Février
    couleur: 'bg-blue-600',
    conseils: [
      {
        id: 'verglas',
        titre: 'Verglas et routes glissantes',
        description: 'Prévenir les accidents sur la route et les trottoirs',
        icon: '🧊',
        conseils: [
          'Équipez votre véhicule de pneus hiver ou chaînes',
          'Réduisez votre vitesse et augmentez les distances de sécurité',
          'Évitez les freinages brusques',
          'Portez des chaussures antidérapantes',
          'Salez vos entrées et trottoirs',
          'Gardez une raclette et du liquide lave-glace dans la voiture',
        ],
      },
      {
        id: 'monoxyde',
        titre: 'Intoxication au monoxyde de carbone',
        description: 'Le CO tue chaque hiver en France',
        icon: '💨',
        urgence: 'Maux de tête, nausées, vertiges chez plusieurs personnes = Aérez et évacuez, appelez le 15',
        conseils: [
          'Faites réviser vos appareils de chauffage avant l\'hiver',
          'N\'obstruez jamais les aérations',
          'N\'utilisez jamais un groupe électrogène à l\'intérieur',
          'Installez un détecteur de CO',
          'N\'utilisez pas un chauffage d\'appoint en continu',
          'En cas de doute : aérez et sortez immédiatement',
        ],
      },
      {
        id: 'hypothermie-hiver',
        titre: 'Prévenir l\'hypothermie',
        description: 'Protégez-vous du froid extrême',
        icon: '🥶',
        conseils: [
          'Superposez plusieurs couches de vêtements',
          'Protégez les extrémités : bonnet, gants, écharpe',
          'Évitez l\'alcool qui favorise la perte de chaleur',
          'Mangez suffisamment et buvez chaud',
          'Limitez les sorties en cas de grand froid',
          'Signalez les personnes sans-abri au 115',
        ],
      },
      {
        id: 'coupures-courant',
        titre: 'Coupures de courant',
        description: 'Se préparer aux pannes hivernales',
        icon: '🔦',
        conseils: [
          'Gardez des lampes torches et piles de rechange',
          'Ayez des bougies et allumettes (attention au feu)',
          'Prévoyez des couvertures chaudes',
          'Gardez votre téléphone chargé (batterie externe)',
          'Débranchez les appareils sensibles',
          'Gardez le réfrigérateur fermé pour conserver le froid',
        ],
      },
    ],
  },
  {
    id: 'printemps',
    nom: 'Printemps',
    icon: '🌸',
    mois: [2, 3, 4], // Mars, Avril, Mai
    couleur: 'bg-green-700',
    conseils: [
      {
        id: 'allergies',
        titre: 'Allergies aux pollens',
        description: 'Limiter l\'exposition aux allergènes',
        icon: '🤧',
        conseils: [
          'Consultez les bulletins polliniques',
          'Aérez tôt le matin ou tard le soir',
          'Lavez-vous les cheveux le soir',
          'Portez des lunettes de soleil à l\'extérieur',
          'Évitez de sécher le linge dehors',
          'Gardez les fenêtres fermées en voiture',
        ],
      },
      {
        id: 'orages-printemps',
        titre: 'Orages de printemps',
        description: 'Les orages sont fréquents et violents',
        icon: '⛈️',
        conseils: [
          'Surveillez les bulletins météo',
          'Rentrez à l\'abri dès les premiers signes d\'orage',
          'Éloignez-vous des arbres et points d\'eau',
          'Ne vous abritez pas sous un parapluie métallique',
          'En voiture, restez à l\'intérieur',
          'Débranchez les appareils électriques',
        ],
      },
      {
        id: 'tiques',
        titre: 'Morsures de tiques',
        description: 'Prévenir la maladie de Lyme',
        icon: '🦠',
        urgence: 'Rougeur en cercle autour de la morsure = Consultez un médecin',
        conseils: [
          'Portez des vêtements longs et clairs en forêt',
          'Utilisez un répulsif anti-tiques',
          'Restez sur les sentiers balisés',
          'Inspectez-vous après chaque sortie nature',
          'Retirez la tique avec un tire-tique (pas de produit)',
          'Notez la date de la morsure',
        ],
      },
      {
        id: 'jardinage',
        titre: 'Jardinage en sécurité',
        description: 'Reprendre le jardin sans se blesser',
        icon: '🧑‍🌾',
        conseils: [
          'Portez des gants épais pour tailler',
          'Vérifiez l\'état de vos outils',
          'Attention aux câbles électriques enterrés',
          'Protégez-vous des UV même au printemps',
          'Faites des pauses régulières',
          'Vaccin tétanos à jour ?',
        ],
      },
    ],
  },
  {
    id: 'ete',
    nom: 'Été',
    icon: '☀️',
    mois: [5, 6, 7], // Juin, Juillet, Août
    couleur: 'bg-yellow-700',
    conseils: [
      {
        id: 'canicule',
        titre: 'Canicule',
        description: 'Survivre aux vagues de chaleur',
        icon: '🌡️',
        urgence: 'Température corporelle > 40°C, confusion, peau sèche = Appelez le 15',
        conseils: [
          'Buvez régulièrement même sans soif',
          'Restez dans des endroits frais (climatisés)',
          'Fermez volets et fenêtres la journée',
          'Mouillez-vous régulièrement (brumisateur, douche)',
          'Évitez les efforts physiques aux heures chaudes',
          'Prenez des nouvelles des personnes vulnérables',
        ],
      },
      {
        id: 'noyades',
        titre: 'Prévention des noyades',
        description: 'La noyade est la 1ère cause de mortalité estivale',
        icon: '🏊',
        conseils: [
          'Ne nagez jamais seul',
          'Surveillez constamment les enfants (1 adulte désigné)',
          'Apprenez à nager dès le plus jeune âge',
          'Respectez les drapeaux sur les plages',
          'Entrez progressivement dans l\'eau',
          'Évitez l\'alcool avant la baignade',
        ],
      },
      {
        id: 'feux-foret',
        titre: 'Feux de forêt',
        description: 'Prévenir et réagir aux incendies',
        icon: '🔥',
        urgence: 'Feu de forêt : appelez le 18 et fuyez vers une zone dégagée',
        conseils: [
          'Ne jetez jamais de mégot par la fenêtre',
          'N\'allumez pas de feu en forêt (même barbecue)',
          'Respectez les interdictions d\'accès aux massifs',
          'Débroussaillez autour de votre maison',
          'En cas de feu : fuyez dos au vent',
          'Réfugiez-vous dans un bâtiment si impossible de fuir',
        ],
      },
      {
        id: 'piqures-ete',
        titre: 'Piqûres et morsures',
        description: 'Guêpes, moustiques, vives, méduses',
        icon: '🐝',
        urgence: 'Gonflement du visage ou difficultés à respirer = Appelez le 15',
        conseils: [
          'Ne marchez pas pieds nus dans l\'herbe',
          'Évitez les parfums sucrés en extérieur',
          'Couvrez les aliments lors des repas dehors',
          'Portez des chaussures en plastique dans l\'eau',
          'En cas de piqûre de méduse : rincez à l\'eau de mer',
          'Gardez de l\'antihistaminique si vous êtes allergique',
        ],
      },
      {
        id: 'uv',
        titre: 'Protection solaire',
        description: 'Éviter les coups de soleil et cancers de la peau',
        icon: '🧴',
        conseils: [
          'Appliquez de la crème solaire SPF50 toutes les 2h',
          'Évitez l\'exposition entre 12h et 16h',
          'Portez chapeau, lunettes et vêtements couvrants',
          'Les enfants doivent porter un t-shirt anti-UV',
          'Même à l\'ombre ou par temps nuageux, protégez-vous',
          'Surveillez vos grains de beauté',
        ],
      },
    ],
  },
  {
    id: 'automne',
    nom: 'Automne',
    icon: '🍂',
    mois: [8, 9, 10], // Septembre, Octobre, Novembre
    couleur: 'bg-orange-700',
    conseils: [
      {
        id: 'chasse',
        titre: 'Période de chasse',
        description: 'Cohabiter en toute sécurité',
        icon: '🦌',
        conseils: [
          'Renseignez-vous sur les jours de chasse locaux',
          'Portez des couleurs vives en forêt',
          'Restez sur les sentiers balisés',
          'Signalez votre présence (parlez, sifflez)',
          'Tenez vos chiens en laisse',
          'Respectez les panneaux "chasse en cours"',
        ],
      },
      {
        id: 'champignons',
        titre: 'Cueillette de champignons',
        description: 'Éviter les intoxications mortelles',
        icon: '🍄',
        urgence: 'Vomissements après champignons = Appelez le 15 avec un échantillon',
        conseils: [
          'Ne cueillez que les champignons que vous connaissez',
          'Faites vérifier votre récolte en pharmacie',
          'Un seul champignon toxique peut contaminer le panier',
          'Ne donnez pas de champignons sauvages aux enfants',
          'Photographiez les champignons avant de les cuisiner',
          'Conservez un échantillon cru au frigo 48h',
        ],
      },
      {
        id: 'brouillard',
        titre: 'Conduite par brouillard',
        description: 'Adapter sa conduite à la visibilité réduite',
        icon: '🌫️',
        conseils: [
          'Allumez vos feux de brouillard avant et arrière',
          'Réduisez fortement votre vitesse',
          'Augmentez les distances de sécurité',
          'Ne doublez pas et ne vous arrêtez pas sur la chaussée',
          'Utilisez le marquage au sol comme repère',
          'En cas de brouillard givrant : attention au verglas',
        ],
      },
      {
        id: 'tempetes',
        titre: 'Tempêtes automnales',
        description: 'Se protéger des vents violents',
        icon: '💨',
        conseils: [
          'Rentrez ou fixez les objets qui pourraient s\'envoler',
          'Restez chez vous pendant les rafales',
          'Évitez les promenades en forêt',
          'Garez-vous loin des arbres et panneaux',
          'Préparez lampes et bougies (coupures de courant)',
          'Après la tempête : attention aux branches instables',
        ],
      },
      {
        id: 'grippe',
        titre: 'Prévention grippe et virus',
        description: 'Préparer l\'hiver sanitaire',
        icon: '💉',
        conseils: [
          'Vaccinez-vous contre la grippe (personnes à risque)',
          'Lavez-vous les mains régulièrement',
          'Aérez votre logement 10 min par jour',
          'Toussez dans votre coude',
          'Évitez de serrer les mains en période épidémique',
          'Restez chez vous si vous êtes malade',
        ],
      },
    ],
  },
];

/**
 * Retourne la saison actuelle basée sur le mois
 */
export function getSaisonActuelle(): Saison {
  const mois = new Date().getMonth();
  return saisons.find((s) => s.mois.includes(mois)) || saisons[0];
}

/**
 * Retourne un conseil spécifique par ID
 */
export function getConseilById(id: string): ConseilSaisonnier | undefined {
  for (const saison of saisons) {
    const conseil = saison.conseils.find((c) => c.id === id);
    if (conseil) return conseil;
  }
  return undefined;
}
