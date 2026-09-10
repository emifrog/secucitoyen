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
 * - Timeout configurable (10s par défaut) ; un timeout est retenté comme
 *   n'importe quelle erreur réseau
 * - Ne retry pas les erreurs 4xx (client errors)
 * - Après la dernière tentative, une réponse 5xx est RETOURNÉE (pas levée) :
 *   c'est au circuit breaker de la compter comme un échec.
 */
export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const { retries = 3, baseDelay = 1000, timeout = 10000, ...fetchOptions } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    let response: Response;

    try {
      response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (lastError.name === 'AbortError') {
        lastError = new Error(`Timeout après ${timeout}ms pour ${url}`);
      }
      if (attempt < retries - 1) {
        await sleep(baseDelay * Math.pow(2, attempt));
      }
      continue;
    } finally {
      // Toujours annuler le timer, y compris quand fetch rejette (sinon un
      // timer de 10 s reste pendant à chaque échec).
      clearTimeout(timeoutId);
    }

    // Ne pas retry les erreurs client (4xx)
    if (response.status >= 400 && response.status < 500) {
      return response;
    }

    // Retry les erreurs serveur (5xx) et autres
    if (!response.ok && attempt < retries - 1) {
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      await sleep(baseDelay * Math.pow(2, attempt));
      continue;
    }

    return response;
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

function recordFailure(source: string, circuit: CircuitState): void {
  circuit.failures++;
  circuit.lastFailure = Date.now();
  if (circuit.failures >= CIRCUIT_THRESHOLD && !circuit.isOpen) {
    circuit.isOpen = true;
    console.warn(`[CircuitBreaker] Source "${source}" désactivée après ${CIRCUIT_THRESHOLD} échecs. Réactivation dans 5 min.`);
  }
  circuits.set(source, circuit);
}

/**
 * Fetch avec retry + circuit breaker.
 * Si une source échoue trop souvent (exception réseau OU réponse non-2xx
 * persistante), elle est désactivée temporairement.
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

  let response: Response;
  try {
    response = await fetchWithRetry(url, options);
  } catch (error) {
    recordFailure(source, circuit);
    throw error;
  }

  if (response.ok) {
    // Succès : réinitialiser le compteur
    circuit.failures = 0;
    circuit.isOpen = false;
    circuits.set(source, circuit);
  } else if (response.status >= 500) {
    // 5xx persistant après retries : c'est un échec de la source
    // (auparavant ignoré → une source en 503 continu n'ouvrait jamais le circuit).
    recordFailure(source, circuit);
  }

  return response;
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
