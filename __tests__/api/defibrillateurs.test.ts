/**
 * @jest-environment node
 */
import { fetchWithCircuitBreaker } from '@/lib/api-utils';
import { GET } from '@/app/api/defibrillateurs/route';
import { DAE_SOURCE, toDefibrillateur } from '@/lib/sources/defibrillateurs';

jest.mock('@/lib/api-utils', () => ({
  fetchWithCircuitBreaker: jest.fn(),
}));

const mockedFetch = fetchWithCircuitBreaker as jest.MockedFunction<typeof fetchWithCircuitBreaker>;

// IP unique par requête : le rate limiter est un état de module partagé.
let ipSeq = 0;
function req(query: string) {
  ipSeq += 1;
  return new Request(`http://localhost/api/defibrillateurs${query}`, {
    headers: { 'x-forwarded-for': `203.0.113.${ipSeq}` },
  });
}

function upstream(results: unknown[], total?: number) {
  mockedFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({ results, total_count: total ?? results.length }),
  } as unknown as Response);
}

// Enregistrements au format réel du jeu osm-france-defibrillator (schéma Géo'DAE).
const NOTRE_DAME = { lat: 48.853, lon: 2.3499 };
const records = [
  {
    gid: '1', name: 'Mairie du 4e', adr_num: '2', adr_voie: 'place Baudoyer', com_cp: '75004', com_nom: 'Paris',
    acc: 'Accès libre', disp_j: '', disp_h: '', etat_fonct: 'En fonctionnement',
    meta_geo_point: { lat: 48.8562, lon: 2.3555 }, meta_osm_id: 'node/111',
  },
  {
    gid: '2', name: 'Pharmacie', adr_num: '', adr_voie: 'rue de Rivoli', com_cp: '75004', com_nom: 'Paris',
    acc: '', acc_lib: 'oui', disp_j: 'lun-sam', disp_h: '9h-20h',
    meta_geo_point: { lat: 48.8556, lon: 2.3579 }, meta_osm_id: 'node/222',
  },
  // Hors rayon (≈ 5 km) : doit être exclu même si l'amont le renvoie.
  { gid: '3', name: 'Loin', meta_geo_point: { lat: 48.89, lon: 2.39 }, meta_osm_id: 'node/333' },
  // Sans position : ignoré.
  { gid: '4', name: 'Sans position', meta_osm_id: 'node/444' },
];

beforeEach(() => {
  mockedFetch.mockReset();
});

describe('toDefibrillateur', () => {
  it('mappe les champs Géo\'DAE/OSM vers le format de l\'app', () => {
    const dae = toDefibrillateur(records[0], NOTRE_DAME);
    expect(dae).toMatchObject({
      id: 'node/111',
      nom: 'Mairie du 4e',
      adresse: '2 place Baudoyer',
      commune: 'Paris',
      codePostal: '75004',
      accessibilite: 'Accès libre',
      disponibilite: '24h/24, 7j/7 (déclaré)',
      etatFonctionnement: 'En fonctionnement',
    });
    expect(dae?.distance).toBeGreaterThan(300);
    expect(dae?.distance).toBeLessThan(700);
  });

  it('dérive accessibilité et disponibilité des champs secondaires', () => {
    const dae = toDefibrillateur(records[1], NOTRE_DAME);
    expect(dae?.accessibilite).toBe('Accès libre');
    expect(dae?.disponibilite).toBe('lun-sam 9h-20h');
    expect(dae?.adresse).toBe('rue de Rivoli');
  });

  it('renvoie null sans position', () => {
    expect(toDefibrillateur(records[3], NOTRE_DAME)).toBeNull();
  });
});

describe('GET /api/defibrillateurs', () => {
  it('interroge le jeu osm-france-defibrillator par rayon (within_distance sur meta_geo_point)', async () => {
    upstream(records);
    const res = await GET(req(`?lat=${NOTRE_DAME.lat}&lon=${NOTRE_DAME.lon}&radius=1000&limit=5`));
    expect(res.status).toBe(200);

    const [source, url] = mockedFetch.mock.calls[0];
    expect(source).toBe('opendatasoft-dae');
    expect(url).toContain('/datasets/osm-france-defibrillator/records');
    expect(decodeURIComponent(url)).toContain("within_distance(meta_geo_point, geom'POINT(2.350 48.853)', 1000m)");
  });

  it('trie par distance, exclut hors rayon et sans position, respecte limit', async () => {
    upstream(records, 4);
    const res = await GET(req(`?lat=${NOTRE_DAME.lat}&lon=${NOTRE_DAME.lon}&radius=1000&limit=1`));
    const body = await res.json();

    expect(body.count).toBe(1);
    expect(body.defibrillateurs[0].id).toBe('node/111');
    expect(body.source).toBe(DAE_SOURCE);
    expect(body.attribution).toMatch(/OpenStreetMap/);
    expect(body.searchRadius).toBe(1000);
  });

  it('borne radius et limit', async () => {
    upstream(records);
    const res = await GET(req(`?lat=${NOTRE_DAME.lat}&lon=${NOTRE_DAME.lon}&radius=999999&limit=5000000`));
    const body = await res.json();
    expect(body.searchRadius).toBe(10000);
    expect(decodeURIComponent(mockedFetch.mock.calls[0][1])).toContain('10000m');
    // limit plafonné à 50 : les 2 DAE dans le rayon élargi sont renvoyés (le 3e à 5 km aussi)
    expect(body.defibrillateurs.length).toBeLessThanOrEqual(50);
  });

  it('rejette des coordonnées absentes ou invalides (400)', async () => {
    expect((await GET(req(''))).status).toBe(400);
    expect((await GET(req('?lat=abc&lon=2'))).status).toBe(400);
    expect((await GET(req('?lat=91&lon=2'))).status).toBe(400);
    expect(mockedFetch).not.toHaveBeenCalled();
  });

  it('renvoie 503 et une liste vide si l\'amont échoue (jamais de DAE fictif)', async () => {
    mockedFetch.mockResolvedValueOnce({ ok: false, status: 502, json: async () => ({}) } as unknown as Response);
    const res = await GET(req('?lat=48.85&lon=2.35'));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.defibrillateurs).toEqual([]);
    expect(body.unavailable).toBe(true);

    mockedFetch.mockRejectedValueOnce(new Error('network'));
    const res2 = await GET(req('?lat=48.85&lon=2.35'));
    expect(res2.status).toBe(503);
  });
});
