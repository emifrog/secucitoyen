import { findDepartmentFromCoords, resolveDepartmentFromCoords } from '@/lib/geolocation';

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('findDepartmentFromCoords (estimation locale)', () => {
  it('trouve Paris pour le centre de Paris', () => {
    expect(findDepartmentFromCoords(48.8566, 2.3522)).toEqual({ code: '75', name: 'Paris' });
  });

  it('trouve le Rhône pour Lyon (et non l\'Isère)', () => {
    expect(findDepartmentFromCoords(45.764, 4.8357).code).toBe('69');
  });

  it("trouve la Guadeloupe pour Pointe-à-Pitre (et non un département métropolitain)", () => {
    expect(findDepartmentFromCoords(16.2411, -61.5331).code).toBe('971');
  });

  it('trouve La Réunion pour Saint-Denis', () => {
    expect(findDepartmentFromCoords(-20.8823, 55.4504).code).toBe('974');
  });
});

describe('resolveDepartmentFromCoords (géocodage inverse + repli)', () => {
  it('utilise le département renvoyé par /api/geocode (exact, non estimé)', async () => {
    // Neuilly-sur-Seine : le plus proche centroïde est ambigu, l'API tranche.
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ departmentCode: '92', departmentName: 'Hauts-de-Seine' }),
    });

    const result = await resolveDepartmentFromCoords(48.8846, 2.2686);
    expect(result).toEqual({ code: '92', name: 'Hauts-de-Seine', estimated: false });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(String(mockFetch.mock.calls[0][0])).toMatch(/^\/api\/geocode\?lat=48\.8846&lon=2\.2686$/);
  });

  it('retombe sur l\'estimation locale si l\'API est indisponible', async () => {
    mockFetch.mockRejectedValueOnce(new Error('offline'));

    const result = await resolveDepartmentFromCoords(43.2965, 5.3698);
    expect(result.code).toBe('13');
    expect(result.estimated).toBe(true);
  });

  it('retombe sur l\'estimation locale si l\'API répond sans département', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ departmentCode: null }) });

    const result = await resolveDepartmentFromCoords(45.764, 4.8357);
    expect(result).toEqual({ code: '69', name: 'Rhône', estimated: true });
  });

  it('retombe sur l\'estimation locale si l\'API répond 503', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) });

    const result = await resolveDepartmentFromCoords(48.5734, 7.7521);
    expect(result.code).toBe('67');
    expect(result.estimated).toBe(true);
  });

  it('ignore un code invalide renvoyé par l\'API', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ departmentCode: 'constructor' }) });

    const result = await resolveDepartmentFromCoords(48.8566, 2.3522);
    expect(result).toEqual({ code: '75', name: 'Paris', estimated: true });
  });
});
