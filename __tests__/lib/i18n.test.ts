import { getTranslation, translations } from '@/lib/i18n/translations';
import type { Locale } from '@/lib/i18n/translations';

describe('translations', () => {
  const locales: Locale[] = ['fr', 'en', 'it'];

  it('contient les 3 langues', () => {
    expect(Object.keys(translations)).toEqual(expect.arrayContaining(['fr', 'en', 'it']));
  });

  it.each(locales)('la langue "%s" a toutes les sections de navigation', (locale) => {
    const t = translations[locale];
    expect(t.nav.home).toBeDefined();
    expect(t.nav.emergencies).toBeDefined();
    expect(t.nav.firstAid).toBeDefined();
    expect(t.nav.prevention).toBeDefined();
    expect(t.nav.alerts).toBeDefined();
  });

  it.each(locales)('la langue "%s" a les textes d\'accueil', (locale) => {
    const t = translations[locale];
    expect(t.home.welcome.length).toBeGreaterThan(0);
    expect(t.home.subtitle.length).toBeGreaterThan(0);
  });

  it.each(locales)('la langue "%s" a les textes d\'urgence', (locale) => {
    const t = translations[locale];
    expect(t.emergencies.title.length).toBeGreaterThan(0);
    expect(t.emergencies.call.length).toBeGreaterThan(0);
  });

  it('les traductions françaises sont cohérentes', () => {
    const fr = translations.fr;
    expect(fr.nav.home).toBe('Accueil');
    expect(fr.nav.emergencies).toBe('Urgences');
    expect(fr.emergencies.call).toBe('Appeler');
  });

  it('les traductions anglaises sont différentes du français', () => {
    expect(translations.en.nav.home).not.toBe(translations.fr.nav.home);
    expect(translations.en.emergencies.title).not.toBe(translations.fr.emergencies.title);
  });
});

describe('getTranslation', () => {
  it('retourne les traductions françaises pour "fr"', () => {
    const t = getTranslation('fr');
    expect(t.nav.home).toBe('Accueil');
  });

  it('retourne les traductions anglaises pour "en"', () => {
    const t = getTranslation('en');
    expect(t.nav.home).toBe('Home');
  });

  it('retourne les traductions italiennes pour "it"', () => {
    const t = getTranslation('it');
    expect(t.nav.home).toBeDefined();
    expect(t.nav.home.length).toBeGreaterThan(0);
  });

  it('fallback sur le français pour une langue inconnue', () => {
    // @ts-expect-error Testing invalid locale
    const t = getTranslation('xx');
    expect(t.nav.home).toBe('Accueil');
  });
});
