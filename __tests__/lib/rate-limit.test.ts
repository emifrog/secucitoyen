/**
 * @jest-environment node
 */
import { rateLimited } from '@/lib/rate-limit';

function req(ip: string): Request {
  return new Request('http://localhost/api/x', {
    headers: { 'x-forwarded-for': ip },
  });
}

describe('rateLimited', () => {
  it('laisse passer sous la limite puis bloque au-delà (429 + Retry-After)', () => {
    const opts = { key: 'test-a', limit: 3, windowMs: 60_000 };
    const ip = '1.1.1.1';
    expect(rateLimited(req(ip), opts)).toBeNull(); // 1
    expect(rateLimited(req(ip), opts)).toBeNull(); // 2
    expect(rateLimited(req(ip), opts)).toBeNull(); // 3
    const blocked = rateLimited(req(ip), opts); // 4 → dépassement
    expect(blocked).not.toBeNull();
    expect(blocked!.status).toBe(429);
    expect(Number(blocked!.headers.get('Retry-After'))).toBeGreaterThan(0);
  });

  it('compte les IP indépendamment', () => {
    const opts = { key: 'test-b', limit: 1, windowMs: 60_000 };
    expect(rateLimited(req('2.2.2.2'), opts)).toBeNull();
    expect(rateLimited(req('2.2.2.2'), opts)).not.toBeNull(); // même IP → bloquée
    expect(rateLimited(req('3.3.3.3'), opts)).toBeNull(); // autre IP → OK
  });

  it('isole les compteurs par clé de route', () => {
    const ip = '4.4.4.4';
    expect(rateLimited(req(ip), { key: 'route-x', limit: 1, windowMs: 60_000 })).toBeNull();
    // Même IP, autre route → compteur distinct.
    expect(rateLimited(req(ip), { key: 'route-y', limit: 1, windowMs: 60_000 })).toBeNull();
  });

  it('prend la première IP de x-forwarded-for', () => {
    const opts = { key: 'test-c', limit: 1, windowMs: 60_000 };
    const r = new Request('http://localhost/api/x', {
      headers: { 'x-forwarded-for': '9.9.9.9, 10.0.0.1' },
    });
    expect(rateLimited(r, opts)).toBeNull();
    expect(rateLimited(r, opts)).not.toBeNull(); // même client (9.9.9.9) → bloqué
  });
});
