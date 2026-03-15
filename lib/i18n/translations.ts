import fr from '@/locales/fr.json';
import en from '@/locales/en.json';
import it from '@/locales/it.json';
import es from '@/locales/es.json';
import pt from '@/locales/pt.json';

export type Locale = 'fr' | 'en' | 'it' | 'es' | 'pt';

export interface Translations {
  nav: {
    home: string;
    emergencies: string;
    firstAid: string;
    prevention: string;
    alerts: string;
  };
  home: {
    welcome: string;
    subtitle: string;
    quickAccess: string;
    callEmergency: string;
    seasonalTips: string;
    viewAll: string;
  };
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
  fr: fr as Translations,
  en: en as Translations,
  it: it as Translations,
  es: es as Translations,
  pt: pt as Translations,
};

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  it: 'Italiano',
  es: 'Español',
  pt: 'Português',
};

export const supportedLocales: Locale[] = ['fr', 'en', 'it', 'es', 'pt'];

export function getTranslation(locale: Locale): Translations {
  return translations[locale] || translations.fr;
}
