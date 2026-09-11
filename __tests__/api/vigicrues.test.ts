/**
 * @jest-environment node
 */
import { parseNiveau } from '@/lib/vigicrues-parse';
import type { fetchWithCircuitBreaker as FetchType } from '@/lib/api-utils';

jest.mock('@/lib/api-utils', () => ({
  fetchWithCircuitBreaker: jest.fn(),
}));

/**
 * La source Vigicrues garde un cache mémoire de 5 minutes : chaque scénario
 * recharge le module pour repartir d'un état neuf (même motif que le test du
 * cron), sinon le premier jeu de données servirait tous les suivants.
 */
async function loadRoute() {
  jest.resetModules();
  const apiUtils = await import('@/lib/api-utils');
  const { GET } = await import('@/app/api/vigicrues/route');
  return {
    GET,
    mockedFetch: apiUtils.fetchWithCircuitBreaker as jest.MockedFunction<typeof FetchType>,
  };
}

/** Un tronçon du GeoJSON officiel (géométrie inutile au parsing). */
function troncon(properties: Record<string, unknown>) {
  return { type: 'Feature', geometry: { type: 'MultiLineString', coordinates: [] }, properties };
}

function geojson(features: ReturnType<typeof troncon>[]) {
  return {
    type: 'FeatureCollection',
    DtHrInfoVigiCru: '2026-09-10T13:56:17+00:00',
    features,
  };
}

async function call(
  mockedFetch: jest.MockedFunction<typeof FetchType>,
  GET: (request: Request) => Promise<Response>,
  body: unknown,
  query = '',
) {
  mockedFetch.mockResolvedValueOnce({ ok: true, json: async () => body } as unknown as Response);
  const res = await GET(new Request(`http://localhost/api/vigicrues${query}`));
  return res.json();
}

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

describe('GET /api/vigicrues — parsing du GeoJSON officiel', () => {
  it('filtre le vert, résout le département par le code de tronçon et trie par gravité', async () => {
    const { GET, mockedFetch } = await loadRoute();
    const body = await call(
      mockedFetch,
      GET,
      geojson([
        troncon({ NivInfViCr: 3, CdEntCru: 'GA1', lbentcru: 'Cèze amont' }), // Gard
        troncon({ NivInfViCr: 1, CdEntCru: 'GA2', lbentcru: 'Cèze aval' }), // vert → filtré
        troncon({ NivInfViCr: 4, CdEntCru: 'GA9', lbentcru: "Rhône d'Avignon à la mer" }), // Bouches-du-Rhône
      ]),
    );

    expect(body.count).toBe(2);
    // Tri par gravité : rouge avant orange.
    expect(body.alerts[0]).toMatchObject({
      niveau: 'rouge',
      departementCode: '13',
      departement: 'Bouches-du-Rhône',
      troncon: "Rhône d'Avignon à la mer",
    });
    expect(body.alerts[1]).toMatchObject({ niveau: 'orange', departementCode: '30', departement: 'Gard' });
    // La date affichée est celle du bulletin, pas celle de la requête.
    expect(body.updatedAt).toBe('2026-09-10T13:56:17+00:00');
  });

  it('expose tous les départements traversés et filtre sur la liste complète', async () => {
    const { GET, mockedFetch } = await loadRoute();
    // L'Alagnon traverse le Cantal, la Haute-Loire et le Puy-de-Dôme.
    const alagnon = geojson([troncon({ NivInfViCr: 2, CdEntCru: 'AL2', lbentcru: 'Alagnon' })]);

    const national = await call(mockedFetch, GET, alagnon);
    expect(national.alerts[0].departements).toEqual(['15', '43', '63']);

    // Le filtre départemental doit matcher un département autre que le premier.
    const { GET: GET2, mockedFetch: fetch2 } = await loadRoute();
    const hauteLoire = await call(fetch2, GET2, alagnon, '?dept=43');
    expect(hauteLoire.count).toBe(1);
  });

  it("accepte aussi le nommage de l'API v1.1", async () => {
    const { GET, mockedFetch } = await loadRoute();
    const body = await call(
      mockedFetch,
      GET,
      geojson([troncon({ NivSituVigiCruEnt: 3, CdEntVigiCru: 'GA1', NomEntVigiCru: 'Cèze amont', NomCoursEau: 'La Cèze' })]),
    );

    expect(body.count).toBe(1);
    expect(body.alerts[0]).toMatchObject({ niveau: 'orange', departementCode: '30', cours_eau: 'La Cèze' });
  });

  it('un code de tronçon inconnu reste sans département (jamais diffusé en push)', async () => {
    const { GET, mockedFetch } = await loadRoute();
    const body = await call(
      mockedFetch,
      GET,
      geojson([troncon({ NivInfViCr: 3, CdEntCru: 'CODE-INEXISTANT', lbentcru: 'Tronçon inconnu' })]),
    );

    expect(body.count).toBe(1);
    expect(body.alerts[0].departements).toEqual([]);
    expect(body.alerts[0].departementCode).toBe('');
  });
});
