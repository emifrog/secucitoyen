import { globalSearch, typeLabels, typeColors } from '@/lib/global-search';

describe('globalSearch', () => {
  it('retourne un tableau vide pour une requête vide', () => {
    expect(globalSearch('')).toEqual([]);
  });

  it('retourne un tableau vide pour une requête trop courte (< 2 chars)', () => {
    expect(globalSearch('a')).toEqual([]);
  });

  it('trouve le SAMU en cherchant "samu"', () => {
    const results = globalSearch('samu');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.type === 'urgence' && r.title.includes('15'))).toBe(true);
  });

  it('trouve les pompiers en cherchant "pompier"', () => {
    const results = globalSearch('pompier');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.type === 'urgence' && r.title.includes('18'))).toBe(true);
  });

  it('trouve des fiches secours en cherchant "cardiaque"', () => {
    const results = globalSearch('cardiaque');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.type === 'secours')).toBe(true);
  });

  it('trouve des alertes en cherchant "canicule"', () => {
    const results = globalSearch('canicule');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.type === 'alerte')).toBe(true);
  });

  it('limite les résultats à 10 maximum', () => {
    // Recherche très large
    const results = globalSearch('de');
    expect(results.length).toBeLessThanOrEqual(10);
  });

  it('chaque résultat a un id, type, title, href', () => {
    const results = globalSearch('urgence');
    for (const result of results) {
      expect(result.id).toBeDefined();
      expect(result.type).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.href).toBeDefined();
      expect(result.href.startsWith('/')).toBe(true);
    }
  });
});

describe('typeLabels', () => {
  it('contient les 4 types de résultat', () => {
    expect(typeLabels.urgence).toBe('Urgence');
    expect(typeLabels.secours).toBe('Secours');
    expect(typeLabels.prevention).toBe('Prévention');
    expect(typeLabels.alerte).toBe('Alerte');
  });
});

describe('typeColors', () => {
  it('chaque type a des classes CSS définies', () => {
    for (const color of Object.values(typeColors)) {
      expect(color).toBeDefined();
      expect(color.length).toBeGreaterThan(0);
    }
  });
});
