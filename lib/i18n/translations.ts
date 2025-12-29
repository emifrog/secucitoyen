export type Locale = 'fr' | 'en' | 'it';

export interface Translations {
  // Navigation
  nav: {
    home: string;
    emergencies: string;
    firstAid: string;
    prevention: string;
    alerts: string;
  };
  // Page d'accueil
  home: {
    welcome: string;
    subtitle: string;
    quickAccess: string;
    callEmergency: string;
    seasonalTips: string;
    viewAll: string;
  };
  // Urgences
  emergencies: {
    title: string;
    subtitle: string;
    call: string;
    favorites: string;
    allNumbers: string;
    shareLocation: string;
    shareLocationDesc: string;
    medical: string;
    fire: string;
    police: string;
    european: string;
  };
  // Premiers secours
  firstAid: {
    title: string;
    subtitle: string;
    emergency: string;
    callBefore: string;
    steps: string;
    doNot: string;
    whenToCall: string;
    whatToSay: string;
    offline: string;
    offlineDesc: string;
    training: string;
    trainingDesc: string;
  };
  // Prévention
  prevention: {
    title: string;
    subtitle: string;
    checklist: string;
    items: string;
    priority: {
      high: string;
      medium: string;
      low: string;
    };
  };
  // Alertes
  alerts: {
    title: string;
    subtitle: string;
    current: string;
    noAlerts: string;
    filter: {
      all: string;
      orange: string;
      red: string;
      weather: string;
      pollution: string;
      fire: string;
    };
    locate: string;
    locating: string;
    department: string;
    sources: string;
    updated: string;
  };
  // Défibrillateurs
  defibrillators: {
    title: string;
    subtitle: string;
    find: string;
    finding: string;
    nearest: string;
    distance: string;
    availability: string;
    access: string;
    directions: string;
    howToUse: string;
    cardiacArrest: string;
    cardiacArrestSteps: string[];
  };
  // Conseils saisonniers
  seasonal: {
    title: string;
    subtitle: string;
    current: string;
    tips: string;
    otherSeasons: string;
    seasons: {
      winter: string;
      spring: string;
      summer: string;
      autumn: string;
    };
  };
  // Commun
  common: {
    back: string;
    search: string;
    searchPlaceholder: string;
    loading: string;
    error: string;
    retry: string;
    close: string;
    more: string;
    install: string;
    installDesc: string;
    later: string;
    language: string;
  };
}

export const translations: Record<Locale, Translations> = {
  fr: {
    nav: {
      home: 'Accueil',
      emergencies: 'Urgences',
      firstAid: 'Secours',
      prevention: 'Prévention',
      alerts: 'Alertes',
    },
    home: {
      welcome: 'SécuCitoyen',
      subtitle: 'Votre sécurité au quotidien',
      quickAccess: 'Accès rapide',
      callEmergency: 'Appeler les urgences',
      seasonalTips: 'Conseils de saison',
      viewAll: 'Voir tout',
    },
    emergencies: {
      title: 'Numéros d\'urgence',
      subtitle: 'Appelez en un clic',
      call: 'Appeler',
      favorites: 'Favoris',
      allNumbers: 'Tous les numéros',
      shareLocation: 'Partager ma position',
      shareLocationDesc: 'Envoyer votre position GPS par SMS',
      medical: 'Urgence médicale',
      fire: 'Incendie et secours',
      police: 'Police secours',
      european: 'Numéro européen',
    },
    firstAid: {
      title: 'Premiers secours',
      subtitle: 'Les gestes qui sauvent',
      emergency: 'Urgence vitale',
      callBefore: 'Appelez le 15 ou 112 avant d\'agir',
      steps: 'Étapes',
      doNot: 'À ne pas faire',
      whenToCall: 'Quand appeler',
      whatToSay: 'Quoi dire',
      offline: 'Disponible hors-ligne',
      offlineDesc: 'Ces fiches sont sauvegardées sur votre téléphone',
      training: 'Se former',
      trainingDesc: 'Ces fiches ne remplacent pas une formation PSC1',
    },
    prevention: {
      title: 'Prévention',
      subtitle: 'Conseils et check-lists',
      checklist: 'Check-list',
      items: 'éléments',
      priority: {
        high: 'Priorité haute',
        medium: 'Priorité moyenne',
        low: 'Priorité basse',
      },
    },
    alerts: {
      title: 'Alertes',
      subtitle: 'Vigilances en temps réel',
      current: 'Alertes en cours',
      noAlerts: 'Aucune alerte en cours',
      filter: {
        all: 'Toutes',
        orange: 'Orange',
        red: 'Rouge',
        weather: 'Météo',
        pollution: 'Air',
        fire: 'Feux',
      },
      locate: 'Me localiser',
      locating: 'Localisation...',
      department: 'Votre département',
      sources: 'Sources',
      updated: 'Mis à jour',
    },
    defibrillators: {
      title: 'Défibrillateurs (DAE)',
      subtitle: 'Trouvez un défibrillateur à proximité',
      find: 'Trouver les DAE près de moi',
      finding: 'Recherche en cours...',
      nearest: 'Le plus proche',
      distance: 'Distance',
      availability: 'Disponibilité',
      access: 'Accessibilité',
      directions: 'Itinéraire',
      howToUse: 'Comment utiliser un DAE ?',
      cardiacArrest: 'En cas d\'arrêt cardiaque',
      cardiacArrestSteps: [
        'Appelez le 15 ou 112',
        'Commencez le massage cardiaque',
        'Envoyez quelqu\'un chercher un DAE',
      ],
    },
    seasonal: {
      title: 'Conseils saisonniers',
      subtitle: 'Risques et prévention adaptés',
      current: 'Saison actuelle',
      tips: 'conseils',
      otherSeasons: 'Autres saisons',
      seasons: {
        winter: 'Hiver',
        spring: 'Printemps',
        summer: 'Été',
        autumn: 'Automne',
      },
    },
    common: {
      back: 'Retour',
      search: 'Rechercher',
      searchPlaceholder: 'Rechercher...',
      loading: 'Chargement...',
      error: 'Erreur',
      retry: 'Réessayer',
      close: 'Fermer',
      more: 'Plus',
      install: 'Installer l\'application',
      installDesc: 'Ajoutez SécuCitoyen à votre écran d\'accueil',
      later: 'Plus tard',
      language: 'Langue',
    },
  },
  en: {
    nav: {
      home: 'Home',
      emergencies: 'Emergency',
      firstAid: 'First Aid',
      prevention: 'Prevention',
      alerts: 'Alerts',
    },
    home: {
      welcome: 'SécuCitoyen',
      subtitle: 'Your daily safety companion',
      quickAccess: 'Quick access',
      callEmergency: 'Call emergency',
      seasonalTips: 'Seasonal tips',
      viewAll: 'View all',
    },
    emergencies: {
      title: 'Emergency numbers',
      subtitle: 'Call with one tap',
      call: 'Call',
      favorites: 'Favorites',
      allNumbers: 'All numbers',
      shareLocation: 'Share my location',
      shareLocationDesc: 'Send your GPS position via SMS',
      medical: 'Medical emergency',
      fire: 'Fire and rescue',
      police: 'Police emergency',
      european: 'European number',
    },
    firstAid: {
      title: 'First aid',
      subtitle: 'Life-saving gestures',
      emergency: 'Life-threatening emergency',
      callBefore: 'Call 15 or 112 before acting',
      steps: 'Steps',
      doNot: 'Do not',
      whenToCall: 'When to call',
      whatToSay: 'What to say',
      offline: 'Available offline',
      offlineDesc: 'These guides are saved on your phone',
      training: 'Get trained',
      trainingDesc: 'These guides do not replace proper training',
    },
    prevention: {
      title: 'Prevention',
      subtitle: 'Tips and checklists',
      checklist: 'Checklist',
      items: 'items',
      priority: {
        high: 'High priority',
        medium: 'Medium priority',
        low: 'Low priority',
      },
    },
    alerts: {
      title: 'Alerts',
      subtitle: 'Real-time warnings',
      current: 'Current alerts',
      noAlerts: 'No alerts at this time',
      filter: {
        all: 'All',
        orange: 'Orange',
        red: 'Red',
        weather: 'Weather',
        pollution: 'Air',
        fire: 'Fire',
      },
      locate: 'Locate me',
      locating: 'Locating...',
      department: 'Your area',
      sources: 'Sources',
      updated: 'Updated',
    },
    defibrillators: {
      title: 'Defibrillators (AED)',
      subtitle: 'Find a defibrillator nearby',
      find: 'Find AEDs near me',
      finding: 'Searching...',
      nearest: 'Nearest',
      distance: 'Distance',
      availability: 'Availability',
      access: 'Accessibility',
      directions: 'Directions',
      howToUse: 'How to use an AED?',
      cardiacArrest: 'In case of cardiac arrest',
      cardiacArrestSteps: [
        'Call 15 or 112',
        'Start chest compressions',
        'Send someone to get an AED',
      ],
    },
    seasonal: {
      title: 'Seasonal tips',
      subtitle: 'Adapted risks and prevention',
      current: 'Current season',
      tips: 'tips',
      otherSeasons: 'Other seasons',
      seasons: {
        winter: 'Winter',
        spring: 'Spring',
        summer: 'Summer',
        autumn: 'Autumn',
      },
    },
    common: {
      back: 'Back',
      search: 'Search',
      searchPlaceholder: 'Search...',
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry',
      close: 'Close',
      more: 'More',
      install: 'Install app',
      installDesc: 'Add SécuCitoyen to your home screen',
      later: 'Later',
      language: 'Language',
    },
  },
  it: {
    nav: {
      home: 'Home',
      emergencies: 'Emergenze',
      firstAid: 'Pronto soccorso',
      prevention: 'Prevenzione',
      alerts: 'Allerte',
    },
    home: {
      welcome: 'SécuCitoyen',
      subtitle: 'La tua sicurezza quotidiana',
      quickAccess: 'Accesso rapido',
      callEmergency: 'Chiama emergenza',
      seasonalTips: 'Consigli stagionali',
      viewAll: 'Vedi tutto',
    },
    emergencies: {
      title: 'Numeri di emergenza',
      subtitle: 'Chiama con un tocco',
      call: 'Chiama',
      favorites: 'Preferiti',
      allNumbers: 'Tutti i numeri',
      shareLocation: 'Condividi posizione',
      shareLocationDesc: 'Invia la tua posizione GPS via SMS',
      medical: 'Emergenza medica',
      fire: 'Vigili del fuoco',
      police: 'Polizia',
      european: 'Numero europeo',
    },
    firstAid: {
      title: 'Pronto soccorso',
      subtitle: 'Gesti salvavita',
      emergency: 'Emergenza vitale',
      callBefore: 'Chiama il 15 o 112 prima di agire',
      steps: 'Passi',
      doNot: 'Da non fare',
      whenToCall: 'Quando chiamare',
      whatToSay: 'Cosa dire',
      offline: 'Disponibile offline',
      offlineDesc: 'Queste schede sono salvate sul telefono',
      training: 'Formazione',
      trainingDesc: 'Queste schede non sostituiscono la formazione',
    },
    prevention: {
      title: 'Prevenzione',
      subtitle: 'Consigli e checklist',
      checklist: 'Checklist',
      items: 'elementi',
      priority: {
        high: 'Priorità alta',
        medium: 'Priorità media',
        low: 'Priorità bassa',
      },
    },
    alerts: {
      title: 'Allerte',
      subtitle: 'Avvisi in tempo reale',
      current: 'Allerte in corso',
      noAlerts: 'Nessuna allerta in corso',
      filter: {
        all: 'Tutte',
        orange: 'Arancione',
        red: 'Rosso',
        weather: 'Meteo',
        pollution: 'Aria',
        fire: 'Incendi',
      },
      locate: 'Localizzami',
      locating: 'Localizzazione...',
      department: 'La tua zona',
      sources: 'Fonti',
      updated: 'Aggiornato',
    },
    defibrillators: {
      title: 'Defibrillatori (DAE)',
      subtitle: 'Trova un defibrillatore vicino',
      find: 'Trova DAE vicino a me',
      finding: 'Ricerca...',
      nearest: 'Più vicino',
      distance: 'Distanza',
      availability: 'Disponibilità',
      access: 'Accessibilità',
      directions: 'Indicazioni',
      howToUse: 'Come usare un DAE?',
      cardiacArrest: 'In caso di arresto cardiaco',
      cardiacArrestSteps: [
        'Chiama il 15 o 112',
        'Inizia il massaggio cardiaco',
        'Manda qualcuno a prendere un DAE',
      ],
    },
    seasonal: {
      title: 'Consigli stagionali',
      subtitle: 'Rischi e prevenzione adattati',
      current: 'Stagione attuale',
      tips: 'consigli',
      otherSeasons: 'Altre stagioni',
      seasons: {
        winter: 'Inverno',
        spring: 'Primavera',
        summer: 'Estate',
        autumn: 'Autunno',
      },
    },
    common: {
      back: 'Indietro',
      search: 'Cerca',
      searchPlaceholder: 'Cerca...',
      loading: 'Caricamento...',
      error: 'Errore',
      retry: 'Riprova',
      close: 'Chiudi',
      more: 'Altro',
      install: 'Installa app',
      installDesc: 'Aggiungi SécuCitoyen alla schermata home',
      later: 'Più tardi',
      language: 'Lingua',
    },
  },
};

export function getTranslation(locale: Locale): Translations {
  return translations[locale] || translations.fr;
}
