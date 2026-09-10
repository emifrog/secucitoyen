/**
 * @jest-environment node
 */
import {
  DEPARTEMENTS,
  DEPARTEMENTS_RISQUE_INCENDIE,
  findNearestDepartement,
  getDepartement,
  getDepartementNom,
} from '@/lib/departements';
import { isValidDepartmentCode } from '@/lib/validation';

describe('lib/departements — table de référence', () => {
  it('contient les 101 départements (96 métropole + Corse, 5 DROM)', () => {
    expect(DEPARTEMENTS).toHaveLength(101);
  });

  it('a des codes uniques, tous acceptés par la validation des routes', () => {
    const codes = DEPARTEMENTS.map((d) => d.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const code of codes) {
      expect(isValidDepartmentCode(code)).toBe(true);
    }
  });

  it('inclut la Corse et les DROM', () => {
    for (const code of ['2A', '2B', '971', '972', '973', '974', '976']) {
      expect(getDepartement(code)).toBeDefined();
    }
  });

  it('a des coordonnées plausibles (métropole ou DROM)', () => {
    for (const d of DEPARTEMENTS) {
      const metropole = d.lat > 41 && d.lat < 51.5 && d.lon > -5.5 && d.lon < 10;
      const drom = d.code.startsWith('97');
      expect(metropole || drom).toBe(true);
    }
  });

  it('résout un nom depuis un code, insensible à la casse', () => {
    expect(getDepartementNom('2a')).toBe('Corse-du-Sud');
    expect(getDepartementNom('75')).toBe('Paris');
    expect(getDepartementNom('974')).toBe('La Réunion');
    expect(getDepartementNom('00')).toBeUndefined();
    expect(getDepartementNom(null)).toBeUndefined();
  });

  it('expose les départements à risque incendie', () => {
    const codes = DEPARTEMENTS_RISQUE_INCENDIE.map((d) => d.code);
    expect(codes).toEqual(expect.arrayContaining(['13', '83', '2A', '2B', '30', '33', '40']));
    expect(codes).not.toContain('75');
  });
});

describe('findNearestDepartement — repli « plus proche » (estimation)', () => {
  const cases: Array<[string, number, number, string]> = [
    ['Marseille', 43.2965, 5.3698, '13'],
    ['Lyon', 45.764, 4.8357, '69'],
    ['Villeurbanne', 45.7719, 4.8902, '69'],
    ['Ajaccio', 41.9267, 8.7369, '2A'],
    ['Bastia', 42.7028, 9.4503, '2B'],
    ['Nanterre', 48.8924, 2.2071, '92'],
    ['Issy-les-Moulineaux', 48.8245, 2.27, '92'],
    ['Strasbourg', 48.5734, 7.7521, '67'],
    ['Pointe-à-Pitre', 16.2411, -61.5331, '971'],
    ['Fort-de-France', 14.6161, -61.0588, '972'],
    ['Cayenne', 4.9224, -52.3135, '973'],
    ['Saint-Denis (Réunion)', -20.8823, 55.4504, '974'],
    ['Mamoudzou', -12.7806, 45.2278, '976'],
  ];

  it.each(cases)('%s → %s', (_label, lat, lon, expected) => {
    expect(findNearestDepartement(lat, lon).code).toBe(expected);
  });

  it('renvoie toujours un département, même loin de la France', () => {
    // Londres → un département du nord.
    expect(['59', '62', '80', '76', '50']).toContain(findNearestDepartement(51.5, -0.12).code);
  });
});
