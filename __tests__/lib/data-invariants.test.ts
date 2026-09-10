/**
 * @jest-environment node
 */
import fs from 'fs';
import path from 'path';
import { fichesSecours } from '@/lib/fiches-secours';
import { emergencyNumbers, getNumberByNumber } from '@/lib/numeros-urgence';
import { saisons } from '@/lib/conseils-saisonniers';

// Invariants sur le contenu statique. Ce sont des tests de 5 lignes, mais pour
// une application de sécurité civile un numéro faux ou une fiche dupliquée est
// un défaut grave : ils doivent casser la CI.

describe('lib/numeros-urgence — invariants', () => {
  it('les numéros sont uniques', () => {
    const numbers = emergencyNumbers.map((n) => n.number);
    expect(new Set(numbers).size).toBe(numbers.length);
  });

  it('les numéros ne contiennent que des chiffres et des espaces', () => {
    for (const n of emergencyNumbers) {
      expect(n.number).toMatch(/^\d[\d ]*\d$|^\d+$/);
    }
  });

  it('chaque numéro se retrouve depuis son slug de page (aller-retour)', () => {
    for (const n of emergencyNumbers) {
      const slug = n.number.replace(/\s/g, '-');
      expect(getNumberByNumber(slug)?.number).toBe(n.number);
    }
  });

  it('les numéros vitaux 15, 17, 18 et 112 sont présents', () => {
    const numbers = new Set(emergencyNumbers.map((n) => n.number));
    for (const vital of ['15', '17', '18', '112']) {
      expect(numbers.has(vital)).toBe(true);
    }
  });

  it('Canicule Info Service est le 0 800 06 66 66 (régression : 0 800 05 95 95 est une autre ligne)', () => {
    const canicule = emergencyNumbers.find((n) => n.name === 'Canicule Info Service');
    expect(canicule?.number).toBe('0 800 06 66 66');
    expect(emergencyNumbers.some((n) => n.number === '0 800 05 95 95')).toBe(false);
  });
});

describe('lib/alertes — les numéros cités dans les conseils existent', () => {
  it('tout numéro vert « 0 800 xx xx xx » cité est un numéro connu', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'lib', 'alertes.ts'), 'utf8');
    const cited = source.match(/0 800 \d{2} \d{2} \d{2}/g) ?? [];
    expect(cited.length).toBeGreaterThan(0);

    const known = new Set(emergencyNumbers.map((n) => n.number));
    for (const number of cited) {
      expect(known.has(number)).toBe(true);
    }
  });
});

describe('lib/fiches-secours — invariants', () => {
  it('les identifiants sont uniques et en kebab-case', () => {
    const ids = fichesSecours.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("chaque fiche renvoie vers un numéro d'urgence vital (15, 18 ou 112)", () => {
    for (const f of fichesSecours) {
      expect(f.callEmergency.number).toMatch(/\b(15|18|112)\b/);
    }
  });

  it('chaque fiche a au moins une étape et une consigne « à ne pas faire »', () => {
    for (const f of fichesSecours) {
      expect(f.steps.length).toBeGreaterThan(0);
      expect(f.doNot.length).toBeGreaterThan(0);
    }
  });
});

describe('lib/conseils-saisonniers — invariants', () => {
  it('les saisons couvrent les 12 mois exactement une fois', () => {
    const mois = saisons.flatMap((s) => s.mois).sort((a, b) => a - b);
    expect(mois).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
});
