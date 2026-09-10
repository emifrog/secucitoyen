import { fetchWithRetry, fetchWithCircuitBreaker, CircuitOpenError, getCircuitState } from '@/lib/api-utils';

// Mock Response for jsdom
function mockResponse(body: string, init: { status: number; statusText?: string }) {
  return {
    ok: init.status >= 200 && init.status < 300,
    status: init.status,
    statusText: init.statusText || '',
    json: async () => JSON.parse(body),
    text: async () => body,
  } as unknown as Response;
}

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockReset();
});

describe('fetchWithRetry', () => {
  it('retourne la réponse si le premier appel réussit', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse('ok', { status: 200 }));

    const response = await fetchWithRetry('https://example.com/api', { retries: 3, baseDelay: 1 });
    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('retry après un échec 5xx puis réussit', async () => {
    mockFetch
      .mockResolvedValueOnce(mockResponse('error', { status: 500 }))
      .mockResolvedValueOnce(mockResponse('ok', { status: 200 }));

    const response = await fetchWithRetry('https://example.com/api', { retries: 3, baseDelay: 1 });
    expect(response.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('ne retry pas les erreurs 4xx', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse('not found', { status: 404 }));

    const response = await fetchWithRetry('https://example.com/api', { retries: 3, baseDelay: 1 });
    expect(response.status).toBe(404);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('throw après épuisement des retries', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'));

    await expect(
      fetchWithRetry('https://example.com/api', { retries: 3, baseDelay: 1 })
    ).rejects.toThrow('Network error');
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
});

describe('fetchWithCircuitBreaker', () => {
  it('laisse passer les appels quand le circuit est fermé', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse('ok', { status: 200 }));

    const response = await fetchWithCircuitBreaker('test-source', 'https://example.com/api', {
      retries: 1,
      baseDelay: 1,
    });
    expect(response.status).toBe(200);
  });

  it('ouvre le circuit après le seuil d\'échecs', async () => {
    for (let i = 0; i < 5; i++) {
      mockFetch.mockRejectedValueOnce(new Error('fail'));
      try {
        await fetchWithCircuitBreaker('cb-test-source', 'https://example.com/api', {
          retries: 1,
          baseDelay: 1,
        });
      } catch {
        // Expected
      }
    }

    const state = getCircuitState('cb-test-source');
    expect(state.isOpen).toBe(true);
    expect(state.failures).toBe(5);

    await expect(
      fetchWithCircuitBreaker('cb-test-source', 'https://example.com/api', {
        retries: 1,
        baseDelay: 1,
      })
    ).rejects.toThrow(CircuitOpenError);
  });

  it('ouvre le circuit sur des réponses 5xx persistantes (pas seulement les exceptions)', async () => {
    for (let i = 0; i < 5; i++) {
      mockFetch.mockResolvedValueOnce(mockResponse('down', { status: 503 }));
      const res = await fetchWithCircuitBreaker('cb-5xx-source', 'https://example.com/api', {
        retries: 1,
        baseDelay: 1,
      });
      expect(res.status).toBe(503);
    }

    expect(getCircuitState('cb-5xx-source')).toEqual({ isOpen: true, failures: 5 });
    await expect(
      fetchWithCircuitBreaker('cb-5xx-source', 'https://example.com/api', { retries: 1, baseDelay: 1 })
    ).rejects.toThrow(CircuitOpenError);
  });

  it('ne compte pas une 4xx comme un échec de la source', async () => {
    for (let i = 0; i < 6; i++) {
      mockFetch.mockResolvedValueOnce(mockResponse('nope', { status: 404 }));
      await fetchWithCircuitBreaker('cb-4xx-source', 'https://example.com/api', { retries: 1, baseDelay: 1 });
    }
    expect(getCircuitState('cb-4xx-source').isOpen).toBe(false);
  });

  it('passe en half-open après 5 min et se referme sur un succès', async () => {
    jest.useFakeTimers({ now: new Date('2026-09-10T10:00:00Z') });
    try {
      for (let i = 0; i < 5; i++) {
        mockFetch.mockRejectedValueOnce(new Error('fail'));
        await fetchWithCircuitBreaker('cb-halfopen', 'https://example.com/api', { retries: 1, baseDelay: 1 }).catch(() => {});
      }
      expect(getCircuitState('cb-halfopen').isOpen).toBe(true);

      // Avant l'expiration : toujours ouvert, fetch n'est pas appelé.
      mockFetch.mockClear();
      await expect(
        fetchWithCircuitBreaker('cb-halfopen', 'https://example.com/api', { retries: 1, baseDelay: 1 })
      ).rejects.toThrow(CircuitOpenError);
      expect(mockFetch).not.toHaveBeenCalled();

      // Après 5 min : une tentative passe (half-open) et un succès referme le circuit.
      jest.setSystemTime(new Date('2026-09-10T10:05:01Z'));
      expect(getCircuitState('cb-halfopen').isOpen).toBe(false);
      mockFetch.mockResolvedValueOnce(mockResponse('ok', { status: 200 }));
      const res = await fetchWithCircuitBreaker('cb-halfopen', 'https://example.com/api', { retries: 1, baseDelay: 1 });
      expect(res.status).toBe(200);
      expect(getCircuitState('cb-halfopen')).toEqual({ isOpen: false, failures: 0 });
    } finally {
      jest.useRealTimers();
    }
  });

  it('annule le timer de timeout même quand fetch rejette (pas de timer pendant)', async () => {
    jest.useFakeTimers();
    try {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      await expect(
        fetchWithRetry('https://example.com/api', { retries: 1, baseDelay: 1, timeout: 10000 })
      ).rejects.toThrow('Network error');
      expect(jest.getTimerCount()).toBe(0);
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('getCircuitState', () => {
  it('retourne un état fermé pour une source inconnue', () => {
    const state = getCircuitState('unknown-source');
    expect(state.isOpen).toBe(false);
    expect(state.failures).toBe(0);
  });
});
