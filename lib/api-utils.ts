// Utilitaires pour les appels API externes : retry avec backoff exponentiel + circuit breaker

interface FetchWithRetryOptions extends RequestInit {
  retries?: number;
  baseDelay?: number;
  timeout?: number;
  next?: { revalidate: number };
}

/**
 * Fetch avec retry automatique et backoff exponentiel.
 * - 3 tentatives par défaut (1s, 2s, 4s)
 * - Timeout configurable (10s par défaut)
 * - Ne retry pas les erreurs 4xx (client errors)
 */
export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const { retries = 3, baseDelay = 1000, timeout = 10000, ...fetchOptions } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Ne pas retry les erreurs client (4xx)
      if (response.status >= 400 && response.status < 500) {
        return response;
      }

      // Retry les erreurs serveur (5xx) et autres
      if (!response.ok && attempt < retries - 1) {
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        const delay = baseDelay * Math.pow(2, attempt);
        await sleep(delay);
        continue;
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Ne pas retry si abort volontaire (timeout)
      if (lastError.name === 'AbortError') {
        lastError = new Error(`Timeout après ${timeout}ms pour ${url}`);
      }

      if (attempt < retries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error(`Échec après ${retries} tentatives pour ${url}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- Circuit Breaker ---

interface CircuitState {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
}

const circuits: Map<string, CircuitState> = new Map();
const CIRCUIT_THRESHOLD = 5;        // Nombre d'échecs avant ouverture
const CIRCUIT_RESET_TIME = 5 * 60 * 1000; // 5 minutes avant de retenter

/**
 * Fetch avec retry + circuit breaker.
 * Si une source échoue trop souvent, elle est désactivée temporairement.
 */
export async function fetchWithCircuitBreaker(
  source: string,
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const circuit = circuits.get(source) || { failures: 0, lastFailure: 0, isOpen: false };

  // Vérifier si le circuit est ouvert
  if (circuit.isOpen) {
    const elapsed = Date.now() - circuit.lastFailure;
    if (elapsed < CIRCUIT_RESET_TIME) {
      throw new CircuitOpenError(source, CIRCUIT_RESET_TIME - elapsed);
    }
    // Half-open : on laisse passer une tentative
    circuit.isOpen = false;
  }

  try {
    const response = await fetchWithRetry(url, options);

    if (response.ok) {
      // Succès : réinitialiser le compteur
      circuit.failures = 0;
      circuit.isOpen = false;
      circuits.set(source, circuit);
    }

    return response;
  } catch (error) {
    // Échec : incrémenter le compteur
    circuit.failures++;
    circuit.lastFailure = Date.now();

    if (circuit.failures >= CIRCUIT_THRESHOLD) {
      circuit.isOpen = true;
      console.warn(`[CircuitBreaker] Source "${source}" désactivée après ${CIRCUIT_THRESHOLD} échecs. Réactivation dans 5 min.`);
    }

    circuits.set(source, circuit);
    throw error;
  }
}

export class CircuitOpenError extends Error {
  public remainingMs: number;

  constructor(source: string, remainingMs: number) {
    super(`Source "${source}" temporairement désactivée (${Math.ceil(remainingMs / 1000)}s restantes)`);
    this.name = 'CircuitOpenError';
    this.remainingMs = remainingMs;
  }
}

/**
 * Retourne l'état du circuit breaker pour une source donnée.
 */
export function getCircuitState(source: string): { isOpen: boolean; failures: number } {
  const circuit = circuits.get(source);
  if (!circuit) return { isOpen: false, failures: 0 };

  // Vérifier si le circuit s'est réinitialisé par timeout
  if (circuit.isOpen && Date.now() - circuit.lastFailure >= CIRCUIT_RESET_TIME) {
    return { isOpen: false, failures: circuit.failures };
  }

  return { isOpen: circuit.isOpen, failures: circuit.failures };
}
