/**
 * Utilitaires de validation des entrées pour les routes API.
 * Centralise les gardes contre l'injection (ODSQL/PostgREST), le SSRF
 * (endpoints push arbitraires, redirection de notification) et
 * l'usurpation d'origine (en-tête Host).
 */

/**
 * Valide un code département français : 01–95, Corse (2A/2B),
 * DOM (971–976). Rejette tout le reste (protège les clauses ODSQL et
 * les filtres PostgREST construits par concaténation).
 */
export function isValidDepartmentCode(code: string): boolean {
  // 01–95 (métropole), 2A/2B (Corse), 971–976 (DOM). Exclut 00, 96, 97–99.
  return /^(?:0[1-9]|[1-8]\d|9[0-5]|2[AB]|97[1-6])$/.test(code);
}

/**
 * Renvoie le code département s'il est valide, sinon null.
 */
export function sanitizeDepartmentCode(
  code: string | null | undefined
): string | null {
  if (!code) return null;
  const trimmed = code.trim().toUpperCase();
  return isValidDepartmentCode(trimmed) ? trimmed : null;
}

// Suffixes des hôtes des services de push légitimes (Mozilla, Chrome/FCM,
// Apple, Microsoft/Edge). Toute souscription pointant ailleurs est rejetée
// pour empêcher un SSRF déclenché par web-push.
const ALLOWED_PUSH_HOST_SUFFIXES = [
  'push.services.mozilla.com',
  'fcm.googleapis.com',
  'android.googleapis.com',
  'push.apple.com',
  'notify.windows.com',
  'wns.windows.com',
  'push.microsoft.com',
];

/**
 * Vérifie qu'un endpoint de souscription push est en HTTPS et pointe vers
 * un service de push connu (allowlist). Bloque les IP littérales et les
 * hôtes internes (SSRF).
 */
export function isAllowedPushEndpoint(endpoint: unknown): endpoint is string {
  if (typeof endpoint !== 'string') return false;
  let url: URL;
  try {
    url = new URL(endpoint);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;
  const host = url.hostname.toLowerCase();
  return ALLOWED_PUSH_HOST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`)
  );
}

/**
 * Force une URL de notification à rester un chemin relatif same-origin
 * (commence par un seul « / »). Empêche la redirection d'une notification
 * d'apparence officielle vers un site externe de phishing.
 */
export function toSafeRelativePath(
  url: string | null | undefined,
  fallback: string
): string {
  if (typeof url === 'string' && /^\/(?!\/)/.test(url)) {
    return url;
  }
  return fallback;
}

/**
 * Renvoie l'origine de confiance du site pour les appels serveur→serveur,
 * en priorité depuis la configuration plutôt que depuis l'en-tête Host de
 * la requête entrante (protège contre l'usurpation d'origine / SSRF).
 */
export function getTrustedBaseUrl(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, '');

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  return new URL(request.url).origin;
}
