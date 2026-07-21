/**
 * @jest-environment node
 */
import { fetchWithCircuitBreaker } from '@/lib/api-utils';
import { parseNiveau } from '@/lib/vigicrues-parse';
import { GET } from '@/app/api/vigicrues/route';

jest.mock('@/lib/api-utils', () => ({
  fetchWithCircuitBreaker: jest.fn(),
}));

const mockedFetch = fetchWithCircuitBreaker as jest.MockedFunction<
  typeof fetchWithCircuitBreaker
>;

describe('parseNiveau', () => {
  it('mappe les niveaux numériques Vigicrues', () => {
    expect(parseNiveau(1)).toBe('vert');
    expect(parseNiveau(2)).toBe('jaune');
    expect(parseNiveau(3)).toBe('orange');
    expect(parseNiveau(4)).toBe('rouge');
  });

  it('accepte les niveaux sous forme de chaîne', () => {
    expect(parseNiveau('3')).toBe('orange');
  });

  it('retombe sur vert pour une valeur inconnue', () => {
    expect(parseNiveau(0)).toBe('vert');
    expect(parseNiveau(9)).toBe('vert');
  });
});

describe('GET /api/vigicrues — parsing GeoJSON', () => {
  it('filtre le vert, extrait le département et trie par gravité', async () => {
    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [] },
          properties: {
            NivSituVigiCruEnt: 3, // orange
            CdEntVigiCru: '30A1',
            NomEntVigiCru: 'Le Gardon à Anduze',
            NomCoursEau: 'Le Gardon',
          },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [] },
          properties: {
            NivSituVigiCruEnt: 1, // vert → filtré
            CdEntVigiCru: '75Z9',
            NomEntVigiCru: 'La Seine',
          },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [] },
          properties: {
            NivSituVigiCruEnt: 4, // rouge
            CdEntVigiCru: '13B2',
            NomEntVigiCru: 'Le Rhône',
            NomCoursEau: 'Le Rhône',
          },
        },
      ],
    };

    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => geojson,
    } as unknown as Response);

    const res = await GET(new Request('http://localhost/api/vigicrues'));
    const body = await res.json();

    // Le tronçon vert (Seine) est exclu.
    expect(body.count).toBe(2);
    // Tri par gravité : rouge (13) avant orange (30).
    expect(body.alerts[0].niveau).toBe('rouge');
    expect(body.alerts[0].departementCode).toBe('13');
    expect(body.alerts[0].departement).toBe('Bouches-du-Rhône');
    expect(body.alerts[1].niveau).toBe('orange');
    expect(body.alerts[1].departementCode).toBe('30');
    expect(body.alerts[1].cours_eau).toBe('Le Gardon');
  });
});
