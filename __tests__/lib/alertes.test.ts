import { getAlertTypeInfo, getAdviceForAlert, alertLevels, alertTypes } from '@/lib/alertes';

describe('alertLevels', () => {
  it('contient les 4 niveaux de vigilance', () => {
    expect(Object.keys(alertLevels)).toEqual(['vert', 'jaune', 'orange', 'rouge']);
  });

  it('chaque niveau a un nom, une couleur et un bgColor', () => {
    for (const level of Object.values(alertLevels)) {
      expect(level.name).toBeDefined();
      expect(level.color).toMatch(/^#[0-9a-f]{6}$/);
      expect(level.bgColor).toBeDefined();
      expect(level.borderColor).toBeDefined();
    }
  });
});

describe('alertTypes', () => {
  it('contient 10 types d\'alerte', () => {
    expect(alertTypes).toHaveLength(10);
  });

  it('chaque type a un nom, un icône et des conseils pour chaque niveau', () => {
    for (const type of alertTypes) {
      expect(type.name).toBeDefined();
      expect(type.icon).toBeDefined();
      expect(type.description).toBeDefined();
      expect(type.adviceByLevel.jaune.length).toBeGreaterThan(0);
      expect(type.adviceByLevel.orange.length).toBeGreaterThan(0);
      expect(type.adviceByLevel.rouge.length).toBeGreaterThan(0);
    }
  });

  const expectedTypes = [
    'vent', 'pluie-inondation', 'orages', 'neige-verglas',
    'canicule', 'grand-froid', 'avalanches', 'vagues-submersion',
    'crues', 'pollution',
  ];

  it.each(expectedTypes)('contient le type "%s"', (type) => {
    expect(alertTypes.find((t) => t.type === type)).toBeDefined();
  });
});

describe('getAlertTypeInfo', () => {
  it('retourne les infos pour un type existant', () => {
    const info = getAlertTypeInfo('canicule');
    expect(info).toBeDefined();
    expect(info!.name).toBe('Canicule');
    expect(info!.icon).toBe('🌡️');
  });

  it('retourne undefined pour un type inexistant', () => {
    // @ts-expect-error Testing invalid type
    const info = getAlertTypeInfo('inexistant');
    expect(info).toBeUndefined();
  });
});

describe('getAdviceForAlert', () => {
  it('retourne des conseils pour une alerte orange canicule', () => {
    const advice = getAdviceForAlert('canicule', 'orange');
    expect(advice.length).toBeGreaterThan(0);
    expect(advice.some((a) => a.toLowerCase().includes('frais'))).toBe(true);
  });

  it('retourne un tableau vide pour le niveau vert', () => {
    const advice = getAdviceForAlert('canicule', 'vert');
    expect(advice).toEqual([]);
  });

  it('retourne des conseils différents selon le niveau', () => {
    const jaune = getAdviceForAlert('vent', 'jaune');
    const rouge = getAdviceForAlert('vent', 'rouge');
    expect(jaune).not.toEqual(rouge);
    expect(rouge.length).toBeGreaterThanOrEqual(jaune.length);
  });
});
