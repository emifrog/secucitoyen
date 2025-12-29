'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, Translations, getTranslation } from './translations';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'secucitoyen_locale';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('fr');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Récupérer la langue sauvegardée ou détecter la langue du navigateur
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && ['fr', 'en', 'it'].includes(saved)) {
      setLocaleState(saved);
    } else {
      // Détecter la langue du navigateur
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'en' || browserLang === 'it') {
        setLocaleState(browserLang as Locale);
      }
    }
    setIsHydrated(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    // Mettre à jour l'attribut lang du HTML
    document.documentElement.lang = newLocale === 'fr' ? 'fr' : newLocale === 'it' ? 'it' : 'en';
  };

  const t = getTranslation(locale);

  // Éviter le flash de contenu avec la mauvaise langue
  if (!isHydrated) {
    return null;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function useTranslation() {
  const { t } = useI18n();
  return t;
}
