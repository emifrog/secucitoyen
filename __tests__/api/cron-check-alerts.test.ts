/**
 * @jest-environment node
 */
import type { UnifiedAlert } from '@/lib/types/api-responses';
import type { AggregateResult, SourceStatus } from '@/lib/sources/aggregate';

// --- Mocks ---------------------------------------------------------------

// Mock Supabase CHAÎNABLE : chaque table enregistre les appels et renvoie des
// réponses configurables (l'ancien mock non chaînable faisait planter tout
// chemin post-auth en 500, rendant le test « accepte un secret » tautologique).
type Row = Record<string, unknown>;
const db = {
  claimResults: [] as Row[][], // réponses successives de upsert().select()
  subscriptions: [] as Row[],
  calls: [] as { table: string; op: string; args: unknown[] }[],
};

function chain(table: string) {
  const api: Record<string, unknown> = {};
  api.upsert = (...args: unknown[]) => {
    db.calls.push({ table, op: 'upsert', args });
    const data = db.claimResults.shift() ?? [];
    return { select: () => Promise.resolve({ data, error: null }) };
  };
  api.select = (...args: unknown[]) => {
    db.calls.push({ table, op: 'select', args });
    return {
      or: (...orArgs: unknown[]) => {
        db.calls.push({ table, op: 'or', args: orArgs });
        return Promise.resolve({ data: db.subscriptions, error: null });
      },
      in: () => Promise.resolve({ data: [], error: null }),
    };
  };
  api.delete = (...args: unknown[]) => {
    db.calls.push({ table, op: 'delete', args });
    return {
      in: () => Promise.resolve({ data: null, error: null }),
      lt: () => Promise.resolve({ data: null, error: null }),
    };
  };
  return api;
}

jest.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => ({ from: (table: string) => chain(table) }),
}));

jest.mock('web-push', () => ({
  __esModule: true,
  default: { setVapidDetails: jest.fn(), sendNotification: jest.fn() },
}));

jest.mock('@/lib/sources/aggregate', () => ({
  ...jest.requireActual('@/lib/sources/aggregate'),
  aggregateAlerts: jest.fn(),
}));

// La route lit les clés VAPID À L'IMPORT : chaque scénario recharge le module
// avec l'environnement voulu, et récupère les instances de mocks de CE
// chargement (sinon on configurerait des mocks que la route ne voit pas).
type RouteModule = typeof import('@/app/api/cron/check-alerts/route');

async function loadRoute(env: Record<string, string | undefined>) {
  jest.resetModules();
  for (const [key, value] of Object.entries(env)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  const route: RouteModule = await import('@/app/api/cron/check-alerts/route');
  const aggregate = await import('@/lib/sources/aggregate');
  const webpush = (await import('web-push')).default;
  return {
    GET: route.GET,
    mockedAggregate: aggregate.aggregateAlerts as jest.MockedFunction<typeof aggregate.aggregateAlerts>,
    mockedSend: webpush.sendNotification as unknown as jest.Mock,
  };
}

const SECRET = 'f4a9c1e7b2d84f0a9c1e7b2d84f0a9c1';
const VAPID_ENV = {
  CRON_SECRET: SECRET,
  NOTIFICATIONS_API_KEY: undefined,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: 'B'.repeat(87),
  VAPID_PRIVATE_KEY: 'p'.repeat(43),
};
const NO_VAPID_ENV = {
  CRON_SECRET: SECRET,
  NOTIFICATIONS_API_KEY: undefined,
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: undefined,
  VAPID_PRIVATE_KEY: undefined,
};

function getRequest(headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/cron/check-alerts', { method: 'GET', headers });
}
const authed = () => getRequest({ authorization: `Bearer ${SECRET}` });

const alert = (over: Partial<UnifiedAlert> = {}): UnifiedAlert => ({
  id: '13-canicule-J',
  type: 'canicule',
  category: 'meteo',
  level: 'orange',
  title: 'Vigilance orange Canicule',
  description: 'Fortes chaleurs',
  department: 'Bouches-du-Rhône',
  departmentCode: '13',
  updatedAt: '2026-07-01T05:00:00Z',
  source: 'Météo-France',
  advice: [],
  icon: '🌡️',
  ...over,
});

function aggregateResult(
  alerts: UnifiedAlert[],
  sourceStatus: Record<string, SourceStatus> = { 'Météo-France': 'ok' }
): AggregateResult {
  return {
    alerts,
    count: alerts.length,
    stats: { meteo: 0, inondation: 0, incendie: 0, pollution: 0 },
    sources: ['Météo-France'],
    degraded: Object.values(sourceStatus).includes('degraded'),
    sourceStatus,
    updatedAt: '2026-07-01T05:05:00Z',
  };
}

const OLD_ENV = process.env;
beforeEach(() => {
  process.env = { ...OLD_ENV };
  db.claimResults = [];
  db.subscriptions = [];
  db.calls = [];
});
afterAll(() => {
  process.env = OLD_ENV;
});

// --- Tests ---------------------------------------------------------------

describe('GET /api/cron/check-alerts — authentification', () => {
  it("rejette l'absence totale d'authentification (401)", async () => {
    const { GET } = await loadRoute({ ...NO_VAPID_ENV, CRON_SECRET: undefined });
    expect((await GET(getRequest())).status).toBe(401);
  });

  it('rejette le secret placeholder « your_cron_secret » (401)', async () => {
    const { GET } = await loadRoute({ ...NO_VAPID_ENV, CRON_SECRET: 'your_cron_secret' });
    expect((await GET(getRequest({ authorization: 'Bearer your_cron_secret' }))).status).toBe(401);
  });

  it('rejette « Bearer undefined » quand CRON_SECRET est absent (401)', async () => {
    const { GET } = await loadRoute({ ...NO_VAPID_ENV, CRON_SECRET: undefined });
    expect((await GET(getRequest({ authorization: 'Bearer undefined' }))).status).toBe(401);
  });

  it('sans VAPID, une auth valide échoue en 500 (configuration manquante)', async () => {
    const { GET } = await loadRoute(NO_VAPID_ENV);
    const res = await GET(authed());
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'VAPID non configuré' });
  });
});

describe('GET /api/cron/check-alerts — envoi (VAPID configuré)', () => {
  it("réclame l'alerte AVANT l'envoi et n'envoie qu'aux abonnés du département", async () => {
    const { GET, mockedAggregate, mockedSend } = await loadRoute(VAPID_ENV);
    mockedAggregate.mockResolvedValue(aggregateResult([alert()]));
    db.claimResults = [[{ alert_id: '13-canicule-J' }]]; // insérée → à envoyer
    db.subscriptions = [
      { endpoint: 'https://fcm.googleapis.com/fcm/send/a', keys: { p256dh: 'x', auth: 'y' } },
      { endpoint: 'https://fcm.googleapis.com/fcm/send/b', keys: { p256dh: 'x', auth: 'y' } },
    ];
    mockedSend.mockResolvedValue({});

    const res = await GET(authed());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({ severe: 1, newAlerts: 1, alreadySent: 0, sent: 2, failed: 0 });
    // Ordre : upsert (réclamation) puis select des abonnés puis envoi.
    const ops = db.calls.map((c) => `${c.table}.${c.op}`);
    expect(ops.indexOf('sent_notifications.upsert')).toBeLessThan(ops.indexOf('push_subscriptions.select'));
    expect(db.calls.find((c) => c.op === 'or')?.args[0]).toBe('department_code.eq.13,department_code.is.null');
    expect(mockedSend).toHaveBeenCalledTimes(2);
    const payload = JSON.parse(mockedSend.mock.calls[0][1] as string);
    expect(payload).toMatchObject({ url: '/alertes/13-canicule-J', icon: '/icons/icon-192x192.png' });
    expect(payload.title).toContain('Vigilance orange Canicule');
    // severeOnly : le cron ne demande que orange/rouge à l'agrégateur.
    expect(mockedAggregate).toHaveBeenCalledWith({ severeOnly: true });
  });

  it('ne renvoie pas une alerte déjà réclamée (idempotence)', async () => {
    const { GET, mockedAggregate, mockedSend } = await loadRoute(VAPID_ENV);
    mockedAggregate.mockResolvedValue(aggregateResult([alert()]));
    db.claimResults = [[]]; // conflit → déjà envoyée
    db.subscriptions = [{ endpoint: 'https://fcm.googleapis.com/fcm/send/a', keys: {} }];

    const body = await (await GET(authed())).json();
    expect(body).toMatchObject({ severe: 1, newAlerts: 0, alreadySent: 1, sent: 0 });
    expect(mockedSend).not.toHaveBeenCalled();
  });

  it('ignore les sources non officielles et les alertes sans département', async () => {
    const { GET, mockedAggregate, mockedSend } = await loadRoute(VAPID_ENV);
    mockedAggregate.mockResolvedValue(
      aggregateResult([
        alert({ id: 'foret-13', source: 'Estimation SécuCitoyen (non officielle)' }),
        alert({ id: 'vigicrues-XX', source: 'Vigicrues', departmentCode: '' }),
        alert({ id: '13-orages-J', level: 'jaune' }),
      ])
    );
    db.subscriptions = [{ endpoint: 'https://fcm.googleapis.com/fcm/send/a', keys: {} }];

    const body = await (await GET(authed())).json();
    expect(body).toMatchObject({ severe: 1, skippedNoDept: 1, newAlerts: 0, sent: 0 });
    expect(mockedSend).not.toHaveBeenCalled();
  });

  it('collecte les endpoints expirés (404/410) pour nettoyage', async () => {
    const { GET, mockedAggregate, mockedSend } = await loadRoute(VAPID_ENV);
    mockedAggregate.mockResolvedValue(aggregateResult([alert()]));
    db.claimResults = [[{ alert_id: '13-canicule-J' }]];
    db.subscriptions = [
      { endpoint: 'https://fcm.googleapis.com/fcm/send/ok', keys: {} },
      { endpoint: 'https://fcm.googleapis.com/fcm/send/gone', keys: {} },
    ];
    mockedSend.mockImplementation((sub: { endpoint: string }) =>
      sub.endpoint.endsWith('gone') ? Promise.reject({ statusCode: 410 }) : Promise.resolve({})
    );

    const body = await (await GET(authed())).json();
    expect(body).toMatchObject({ sent: 1, failed: 1, expired: 1 });
    expect(db.calls.some((c) => c.table === 'push_subscriptions' && c.op === 'delete')).toBe(true);
  });

  it('répond 502 quand la vigilance Météo-France est indisponible (le workflow échoue)', async () => {
    const { GET, mockedAggregate } = await loadRoute(VAPID_ENV);
    mockedAggregate.mockResolvedValue(aggregateResult([], { 'Météo-France': 'degraded' }));
    const res = await GET(authed());
    expect(res.status).toBe(502);
    expect(await res.json()).toMatchObject({ error: 'Vigilance Météo-France indisponible', degraded: true });
  });
});
