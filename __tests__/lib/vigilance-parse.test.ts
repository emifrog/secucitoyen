/**
 * @jest-environment node
 */
import { parseVigilanceData, VIGILANCE_SOURCE, type DeptVigilanceRecord } from '@/lib/sources/vigilance';

const record = (over: Partial<DeptVigilanceRecord>): DeptVigilanceRecord => ({
  domain_id: '13',
  echeance: 'J',
  phenomenon_id: 5,
  phenomenon: 'Canicule',
  color_id: 3,
  color: 'Orange',
  begin_time: '2026-07-01T06:00:00Z',
  end_time: '2026-07-02T06:00:00Z',
  product_datetime: '2026-07-01T05:00:00Z',
  ...over,
});

describe('parseVigilanceData', () => {
  it('convertit un enregistrement Opendatasoft en alerte normalisée', () => {
    const [alert] = parseVigilanceData({ total_count: 1, results: [record({})] });
    expect(alert).toMatchObject({
      id: '13-canicule-J',
      type: 'canicule',
      level: 'orange',
      title: 'Vigilance orange Canicule',
      department: 'Bouches-du-Rhône',
      departmentCode: '13',
      startDate: '2026-07-01T06:00:00Z',
      endDate: '2026-07-02T06:00:00Z',
      source: VIGILANCE_SOURCE,
    });
    expect(alert.advice.length).toBeGreaterThan(0);
  });

  it('mappe les libellés Météo-France avec espaces et barres obliques', () => {
    const alerts = parseVigilanceData({
      total_count: 3,
      results: [
        record({ phenomenon: 'Vent violent', color: 'Jaune', color_id: 2, echeance: 'J1' }),
        record({ phenomenon: 'Pluie / Inondation', color: 'Rouge', color_id: 4 }),
        record({ phenomenon: 'Neige / Verglas', color: 'Orange' }),
      ],
    });
    expect(alerts.map((a) => a.type)).toEqual(expect.arrayContaining(['vent', 'pluie-inondation', 'neige-verglas']));
  });

  it('exclut le niveau vert, le domaine national FRA et les phénomènes inconnus', () => {
    const alerts = parseVigilanceData({
      total_count: 3,
      results: [
        record({ color: 'Vert', color_id: 1 }),
        record({ domain_id: 'FRA' }),
        record({ phenomenon: 'Phénomène inconnu' }),
      ],
    });
    expect(alerts).toEqual([]);
  });

  it('trie rouge > orange > jaune puis par département', () => {
    const alerts = parseVigilanceData({
      total_count: 4,
      results: [
        record({ domain_id: '75', color: 'Jaune', color_id: 2 }),
        record({ domain_id: '30', color: 'Orange' }),
        record({ domain_id: '13', color: 'Rouge', color_id: 4 }),
        record({ domain_id: '06', color: 'Orange' }),
      ],
    });
    expect(alerts.map((a) => `${a.level}:${a.departmentCode}`)).toEqual([
      'rouge:13',
      'orange:06', // Alpes-Maritimes avant Gard (ordre alphabétique du nom)
      'orange:30',
      'jaune:75',
    ]);
  });

  it('utilise le code brut comme nom pour un domaine inconnu (ex. Andorre 99)', () => {
    const [alert] = parseVigilanceData({ total_count: 1, results: [record({ domain_id: '99' })] });
    expect(alert.department).toBe('99');
  });

  it('tolère une réponse sans `results`', () => {
    expect(parseVigilanceData({ total_count: 0 } as never)).toEqual([]);
  });
});
