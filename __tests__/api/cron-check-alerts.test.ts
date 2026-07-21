/**
 * @jest-environment node
 */
import { GET } from '@/app/api/cron/check-alerts/route';

jest.mock('@/lib/supabase', () => ({
  getSupabaseAdmin: () => ({ from: () => ({ select: jest.fn(), or: jest.fn() }) }),
}));

jest.mock('web-push', () => ({
  __esModule: true,
  default: { setVapidDetails: jest.fn(), sendNotification: jest.fn() },
}));

function getRequest(headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/cron/check-alerts', { method: 'GET', headers });
}

describe('GET /api/cron/check-alerts — authentification', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    process.env = { ...OLD_ENV };
    delete process.env.CRON_SECRET;
    delete process.env.NOTIFICATIONS_API_KEY;
    // VAPID volontairement absent : une auth valide s'arrête au contrôle VAPID (500).
    delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("rejette l'absence totale d'authentification (401)", async () => {
    const res = await GET(getRequest());
    expect(res.status).toBe(401);
  });

  it('rejette le secret placeholder « your_cron_secret » (401)', async () => {
    process.env.CRON_SECRET = 'your_cron_secret';
    const res = await GET(getRequest({ authorization: 'Bearer your_cron_secret' }));
    expect(res.status).toBe(401);
  });

  it('rejette « Bearer undefined » quand CRON_SECRET est absent (401)', async () => {
    const res = await GET(getRequest({ authorization: 'Bearer undefined' }));
    expect(res.status).toBe(401);
  });

  it('accepte un CRON_SECRET fort (passe l\'auth, échoue plus loin sur VAPID)', async () => {
    process.env.CRON_SECRET = 'f4a9c1e7b2d84f0a9c1e7b2d84f0a9c1';
    const res = await GET(
      getRequest({ authorization: 'Bearer f4a9c1e7b2d84f0a9c1e7b2d84f0a9c1' })
    );
    expect(res.status).not.toBe(401);
  });
});
