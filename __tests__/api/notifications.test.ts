/**
 * @jest-environment node
 */
import { POST as subscribePOST } from '@/app/api/notifications/subscribe/route';
import { POST as sendPOST } from '@/app/api/notifications/send/route';

// Mock de la couche Supabase (client admin) : évite toute vraie connexion.
const upsertMock = jest.fn(
  async (_row?: Record<string, unknown>, _opts?: unknown) => ({ error: null })
);
const deleteMock = jest.fn(() => ({ eq: jest.fn(async () => ({ error: null })) }));
jest.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => ({
    from: () => ({ upsert: upsertMock, delete: deleteMock }),
  }),
}));

// Mock de web-push (la route send l'importe au chargement).
jest.mock('web-push', () => ({
  __esModule: true,
  default: { setVapidDetails: jest.fn(), sendNotification: jest.fn() },
}));

function postRequest(url: string, body: unknown, headers: Record<string, string> = {}) {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  upsertMock.mockClear();
});

describe('POST /api/notifications/subscribe', () => {
  const validSubscription = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/valid-token',
    keys: { p256dh: 'BPabc', auth: 'auth123' },
  };

  it('rejette un endpoint hors allowlist (garde SSRF)', async () => {
    const res = await subscribePOST(
      postRequest('http://localhost/api/notifications/subscribe', {
        subscription: { endpoint: 'https://evil.example/hook', keys: validSubscription.keys },
      })
    );
    expect(res.status).toBe(400);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it('rejette une subscription sans clés ECDH', async () => {
    const res = await subscribePOST(
      postRequest('http://localhost/api/notifications/subscribe', {
        subscription: { endpoint: validSubscription.endpoint },
      })
    );
    expect(res.status).toBe(400);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it('enregistre une subscription valide avec département assaini', async () => {
    const res = await subscribePOST(
      postRequest('http://localhost/api/notifications/subscribe', {
        subscription: validSubscription,
        departmentCode: '2a',
      })
    );
    expect(res.status).toBe(200);
    expect(upsertMock).toHaveBeenCalledTimes(1);
    expect(upsertMock.mock.calls[0][0]).toMatchObject({ department_code: '2A' });
  });

  it('neutralise un département invalide en null', async () => {
    await subscribePOST(
      postRequest('http://localhost/api/notifications/subscribe', {
        subscription: validSubscription,
        departmentCode: "75' OR 1=1",
      })
    );
    expect(upsertMock.mock.calls[0][0]).toMatchObject({ department_code: null });
  });
});

describe('POST /api/notifications/send', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    process.env = { ...OLD_ENV, NOTIFICATIONS_API_KEY: 'secret-test-key' };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('rejette une clé API absente ou incorrecte (401)', async () => {
    const res = await sendPOST(
      postRequest(
        'http://localhost/api/notifications/send',
        { title: 'T', body: 'B' },
        { 'x-api-key': 'mauvaise-cle' }
      )
    );
    expect(res.status).toBe(401);
  });
});
