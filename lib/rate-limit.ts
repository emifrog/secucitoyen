import { NextResponse } from 'next/server';

/**
 * Limiteur de débit en mémoire (fenêtre fixe) par IP.
 *
 * Volontairement sans dépendance : l'état vit dans le module, donc il est
 * conservé sur une instance serverless chaude (même logique que le circuit
 * breaker de lib/api-utils). Limite : non partagé entre instances. Pour un
 * plafonnement distribué strict, remplacer le store par Upstash Redis
 * (@upstash/ratelimit) — l'interface `rateLimited()` resterait identique.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

// Nettoyage paresseux des entrées expirées (évite la croissance de la Map).
function sweep(now: number): void {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  buckets.forEach((bucket, key) => {
    if (bucket.resetAt <= now) buckets.delete(key);
  });
}

export function getClientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

/**
 * Renvoie une réponse 429 si l'IP a dépassé `limit` requêtes sur `windowMs`,
 * sinon `null` (la route continue).
 */
export function rateLimited(
  request: Request,
  opts: { key: string; limit: number; windowMs: number }
): NextResponse | null {
  const now = Date.now();
  sweep(now);

  const id = `${opts.key}:${getClientIp(request)}`;
  const bucket = buckets.get(id);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(id, { count: 1, resetAt: now + opts.windowMs });
    return null;
  }

  bucket.count += 1;
  if (bucket.count > opts.limit) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    return NextResponse.json(
      { error: 'Trop de requêtes, réessayez plus tard.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }
  return null;
}
