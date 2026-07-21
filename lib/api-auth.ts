import { createHash, timingSafeEqual } from 'node:crypto';

// Secrets d'exemple qui ne doivent JAMAIS ouvrir une route en production.
const PLACEHOLDER_SECRETS = new Set([
  '',
  'your_cron_secret',
  'your_random_api_key',
  'your_notifications_api_key',
]);

/**
 * Compare un secret fourni à la valeur attendue en temps constant.
 *
 * - rejette les valeurs absentes/vides et les placeholders d'exemple ;
 * - hache les deux valeurs en SHA-256 avant `timingSafeEqual`, ce qui garantit
 *   des buffers de longueur égale et n'expose pas la longueur du secret.
 *
 * À utiliser côté serveur uniquement (dépend de node:crypto).
 */
export function isValidSecret(
  provided: string | null | undefined,
  expected: string | undefined
): boolean {
  if (!provided || !expected) return false;
  if (PLACEHOLDER_SECRETS.has(expected)) return false;

  const a = createHash('sha256').update(provided).digest();
  const b = createHash('sha256').update(expected).digest();
  return timingSafeEqual(a, b);
}
