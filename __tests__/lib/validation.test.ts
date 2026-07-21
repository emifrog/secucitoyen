/**
 * @jest-environment node
 */
import {
  isValidDepartmentCode,
  sanitizeDepartmentCode,
  isAllowedPushEndpoint,
  toSafeRelativePath,
  getTrustedBaseUrl,
} from '@/lib/validation';

describe('isValidDepartmentCode', () => {
  it('accepte les départements métropolitains (01–95)', () => {
    for (const code of ['01', '13', '75', '95']) {
      expect(isValidDepartmentCode(code)).toBe(true);
    }
  });

  it('accepte la Corse (2A/2B) et les DOM (971–976)', () => {
    for (const code of ['2A', '2B', '971', '974', '976']) {
      expect(isValidDepartmentCode(code)).toBe(true);
    }
  });

  it('rejette les valeurs hors périmètre', () => {
    for (const code of ['00', '96', '977', '100', '7', '2C', '', 'abc']) {
      expect(isValidDepartmentCode(code)).toBe(false);
    }
  });

  it("rejette les tentatives d'injection ODSQL/PostgREST", () => {
    for (const code of ["' OR '1'='1", "75',autre.eq.x", '75 AND 1=1', '75;drop']) {
      expect(isValidDepartmentCode(code)).toBe(false);
    }
  });
});

describe('sanitizeDepartmentCode', () => {
  it('renvoie le code valide normalisé en majuscules', () => {
    expect(sanitizeDepartmentCode('2a')).toBe('2A');
    expect(sanitizeDepartmentCode(' 75 ')).toBe('75');
  });

  it('renvoie null pour null, undefined, vide ou invalide', () => {
    expect(sanitizeDepartmentCode(null)).toBeNull();
    expect(sanitizeDepartmentCode(undefined)).toBeNull();
    expect(sanitizeDepartmentCode('')).toBeNull();
    expect(sanitizeDepartmentCode("75' OR 1=1")).toBeNull();
  });
});

describe('isAllowedPushEndpoint', () => {
  it('accepte les services de push connus en HTTPS', () => {
    const valides = [
      'https://fcm.googleapis.com/fcm/send/abc123',
      'https://updates.push.services.mozilla.com/wpush/v2/xyz',
      'https://web.push.apple.com/QABC',
      'https://par02p.notify.windows.com/w/?token=abc',
    ];
    for (const e of valides) expect(isAllowedPushEndpoint(e)).toBe(true);
  });

  it('rejette le HTTP non chiffré', () => {
    expect(isAllowedPushEndpoint('http://fcm.googleapis.com/fcm/send/x')).toBe(false);
  });

  it('rejette les hôtes internes, IP littérales et domaines arbitraires (SSRF)', () => {
    const invalides = [
      'https://evil.example.com/hook',
      'https://169.254.169.254/latest/meta-data',
      'https://localhost/x',
      'https://10.0.0.1/x',
      'https://fcm.googleapis.com.evil.com/x',
    ];
    for (const e of invalides) expect(isAllowedPushEndpoint(e)).toBe(false);
  });

  it('rejette les valeurs non-string ou non-URL', () => {
    expect(isAllowedPushEndpoint(undefined)).toBe(false);
    expect(isAllowedPushEndpoint(null)).toBe(false);
    expect(isAllowedPushEndpoint(42)).toBe(false);
    expect(isAllowedPushEndpoint('pas une url')).toBe(false);
  });
});

describe('toSafeRelativePath', () => {
  it('conserve un chemin relatif same-origin', () => {
    expect(toSafeRelativePath('/alertes', '/x')).toBe('/alertes');
    expect(toSafeRelativePath('/alertes/13-canicule', '/x')).toBe('/alertes/13-canicule');
  });

  it('rejette les URL externes et les schémas dangereux (fallback)', () => {
    expect(toSafeRelativePath('https://evil.example', '/alertes')).toBe('/alertes');
    expect(toSafeRelativePath('//evil.example', '/alertes')).toBe('/alertes');
    expect(toSafeRelativePath('javascript:alert(1)', '/alertes')).toBe('/alertes');
    expect(toSafeRelativePath(undefined, '/alertes')).toBe('/alertes');
    expect(toSafeRelativePath('', '/alertes')).toBe('/alertes');
  });
});

describe('getTrustedBaseUrl', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('privilégie NEXT_PUBLIC_SITE_URL (sans slash final)', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://secucitoyen.vercel.app/';
    const req = new Request('https://attacker.example/api/alerts');
    expect(getTrustedBaseUrl(req)).toBe('https://secucitoyen.vercel.app');
  });

  it('utilise VERCEL_URL en https si SITE_URL absent', () => {
    process.env.VERCEL_URL = 'secucitoyen.vercel.app';
    const req = new Request('https://attacker.example/api/alerts');
    expect(getTrustedBaseUrl(req)).toBe('https://secucitoyen.vercel.app');
  });

  it("retombe sur l'origine de la requête en dernier recours", () => {
    const req = new Request('https://secucitoyen.vercel.app/api/alerts');
    expect(getTrustedBaseUrl(req)).toBe('https://secucitoyen.vercel.app');
  });
});
