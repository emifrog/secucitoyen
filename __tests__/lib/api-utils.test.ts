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
});

describe('getCircuitState', () => {
  it('retourne un état fermé pour une source inconnue', () => {
    const state = getCircuitState('unknown-source');
    expect(state.isOpen).toBe(false);
    expect(state.failures).toBe(0);
  });
});
