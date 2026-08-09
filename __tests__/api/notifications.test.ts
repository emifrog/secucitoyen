/**
 * @jest-environment node
 */
import {
  POST as subscribePOST,
  DELETE as subscribeDELETE,
} from '@/app/api/notifications/subscribe/route';
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

// IP unique par requête : évite que le rate limiter (état de module partagé)
// ne couple les tests entre eux.
let ipSeq = 0;
function jsonRequest(method: string, url: string, body: unknown, headers: Record<string, string> = {}) {
  ipSeq += 1;
  return new Request(url, {
    method,
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': `203.0.113.${ipSeq}`,
      ...headers,
    },
    body: JSON.stringify(body),
  });
}
const postRequest = (url: string, body: unknown, headers: Record<string, string> = {}) =>
  jsonRequest('POST', url, body, headers);

beforeEach(() => {
  upsertMock.mockClear();
  deleteMock.mockClear();
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

describe('DELETE /api/notifications/subscribe', () => {
  it('rejette un endpoint hors allowlist (pas de suppression arbitraire)', async () => {
    const res = await subscribeDELETE(
      jsonRequest('DELETE', 'http://localhost/api/notifications/subscribe', {
        endpoint: 'https://evil.example/hook',
      })
    );
    expect(res.status).toBe(400);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it('supprime une subscription pour un endpoint de push valide', async () => {
    const res = await subscribeDELETE(
      jsonRequest('DELETE', 'http://localhost/api/notifications/subscribe', {
        endpoint: 'https://fcm.googleapis.com/fcm/send/valid-token',
      })
    );
    expect(res.status).toBe(200);
    expect(deleteMock).toHaveBeenCalledTimes(1);
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
