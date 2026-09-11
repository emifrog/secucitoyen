/**
 * @jest-environment node
 */
import { fetchWithCircuitBreaker } from '@/lib/api-utils';
import { aggregateAlerts, OFFICIAL_PUSH_SOURCES } from '@/lib/sources/aggregate';
import { FIRE_ESTIMATE_SOURCE } from '@/lib/sources/meteo-forets';

jest.mock('@/lib/api-utils', () => ({
  fetchWithCircuitBreaker: jest.fn(),
}));

const mockedFetch = fetchWithCircuitBreaker as jest.MockedFunction<typeof fetchWithCircuitBreaker>;

function jsonResponse(body: unknown, status = 200): Response {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as unknown as Response;
}

// Réponses amont réalistes, sélectionnées par URL.
function upstream(overrides: Partial<Record<'vigilance' | 'air' | 'vigicrues' | 'meteo', () => Promise<Response>>> = {}) {
  const defaults = {
    vigilance: async () =>
      jsonResponse({
        total_count: 2,
        results: [
          {
            domain_id: '13', echeance: 'J', phenomenon_id: 5, phenomenon: 'Canicule',
            color_id: 3, color: 'Orange', begin_time: '2026-07-01T06:00:00Z',
            end_time: '2026-07-02T06:00:00Z', product_datetime: '2026-07-01T05:00:00Z',
          },
          {
            domain_id: '13', echeance: 'J', phenomenon_id: 3, phenomenon: 'Orages',
            color_id: 2, color: 'Jaune', begin_time: '2026-07-01T06:00:00Z',
            end_time: '2026-07-02T06:00:00Z', product_datetime: '2026-07-01T05:00:00Z',
          },
        ],
      }),
    air: async () =>
      jsonResponse({ current: { time: '2026-07-01T05:00', european_aqi: 90, pm10: 40, pm2_5: 25, nitrogen_dioxide: 30, ozone: 120 } }),
    vigicrues: async () =>
      jsonResponse({
        type: 'FeatureCollection',
        features: [
          // Tronçon réel du Gard (le GeoJSON ne porte aucun code département :
          // il est résolu depuis lib/data/vigicrues-troncons.json).
          { type: 'Feature', geometry: { type: 'MultiLineString', coordinates: [] },
            properties: { NivInfViCr: 3, CdEntCru: 'GA1', lbentcru: 'Cèze amont' } },
        ],
      }),
    meteo: async () =>
      // Chaud, sec, venteux : indice « extrême » → doit être plafonné à orange.
      jsonResponse({ current: { time: '2026-07-01T05:00', temperature_2m: 40, relative_humidity_2m: 10, wind_speed_10m: 70, precipitation: 0 } }),
  };
  const handlers = { ...defaults, ...overrides };

  mockedFetch.mockImplementation(async (_source, url) => {
    if (url.includes('vigilance-meteo-departement')) return handlers.vigilance();
    if (url.includes('air-quality-api.open-meteo.com')) return handlers.air();
    if (url.includes('vigicrues.gouv.fr')) return handlers.vigicrues();
    if (url.includes('api.open-meteo.com/v1/forecast')) return handlers.meteo();
    throw new Error(`URL inattendue dans le test : ${url}`);
  });
}

beforeEach(() => {
  mockedFetch.mockReset();
});

describe('aggregateAlerts', () => {
  it('agrège vigilance, air et incendie pour un département, plafonne l\'incendie à orange', async () => {
    upstream();
    const result = await aggregateAlerts({ dept: '13' });

    expect(result.degraded).toBe(false);
    expect(result.sourceStatus['Météo-France']).toBe('ok');

    const canicule = result.alerts.find((a) => a.id === '13-canicule-J');
    expect(canicule).toMatchObject({ level: 'orange', category: 'meteo', source: 'Météo-France', department: 'Bouches-du-Rhône' });

    const orages = result.alerts.find((a) => a.id === '13-orages-J');
    expect(orages?.level).toBe('jaune');

    // EAQI 90 = rouge avec les bandes européennes (jaune avec les anciens seuils US).
    const pollution = result.alerts.find((a) => a.category === 'pollution');
    expect(pollution).toMatchObject({ level: 'rouge', departmentCode: '13', source: 'Open-Meteo Air Quality' });

    // Estimation incendie : jamais rouge, source étiquetée non officielle.
    const incendie = result.alerts.find((a) => a.category === 'incendie');
    expect(incendie).toMatchObject({ level: 'orange', source: FIRE_ESTIMATE_SOURCE, departmentCode: '13' });
    expect(incendie?.title).toMatch(/estimé/i);

    // Le tronçon Vigicrues du Gard (30) n'est pas remonté pour le 13.
    expect(result.alerts.some((a) => a.category === 'inondation')).toBe(false);

    // Tri : rouge d'abord, puis orange, puis jaune.
    const levels = result.alerts.map((a) => a.level);
    const order = { rouge: 0, orange: 1, jaune: 2, vert: 3 } as const;
    for (let i = 1; i < levels.length; i++) {
      expect(order[levels[i - 1]]).toBeLessThanOrEqual(order[levels[i]]);
    }
    expect(result.stats).toEqual({ meteo: 2, inondation: 0, incendie: 1, pollution: 1 });
  });

  it('marque `degraded` quand une source échoue, sans jamais fabriquer d\'alerte', async () => {
    upstream({ vigilance: async () => { throw new Error('opendatasoft down'); } });
    const result = await aggregateAlerts({ dept: '13' });

    expect(result.degraded).toBe(true);
    expect(result.sourceStatus['Météo-France']).toBe('degraded');
    expect(result.alerts.some((a) => a.category === 'meteo')).toBe(false);
    // Les autres sources restent servies.
    expect(result.alerts.some((a) => a.category === 'pollution')).toBe(true);
  });

  it('marque `degraded` sur une réponse 5xx (pas seulement une exception)', async () => {
    upstream({ vigilance: async () => jsonResponse({}, 503) });
    const result = await aggregateAlerts({ dept: '13' });
    expect(result.sourceStatus['Météo-France']).toBe('degraded');
    expect(result.alerts.some((a) => a.category === 'meteo')).toBe(false);
  });

  it('severeOnly : ne garde que orange/rouge et demande color_id>2 à Météo-France', async () => {
    upstream();
    const result = await aggregateAlerts({ dept: '13', severeOnly: true });

    expect(result.alerts.every((a) => a.level === 'orange' || a.level === 'rouge')).toBe(true);
    const vigilanceCall = mockedFetch.mock.calls.find(([, url]) => url.includes('vigilance-meteo-departement'));
    expect(decodeURIComponent(String(vigilanceCall?.[1]))).toContain('color_id>2');
  });

  it('les estimations (incendie, air) ne sont jamais des sources de push', () => {
    expect(OFFICIAL_PUSH_SOURCES.has('Météo-France')).toBe(true);
    expect(OFFICIAL_PUSH_SOURCES.has('Vigicrues')).toBe(true);
    expect(OFFICIAL_PUSH_SOURCES.has(FIRE_ESTIMATE_SOURCE)).toBe(false);
    expect(OFFICIAL_PUSH_SOURCES.has('Open-Meteo Air Quality')).toBe(false);
  });

  it('en vue nationale, remonte les crues Vigicrues avec leur département', async () => {
    upstream();
    const result = await aggregateAlerts({});
    const crue = result.alerts.find((a) => a.category === 'inondation');
    expect(crue).toMatchObject({ level: 'orange', departmentCode: '30', department: 'Gard', source: 'Vigicrues' });
  });
});
