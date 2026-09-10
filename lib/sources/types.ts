/**
 * Contrat commun des sources d'alertes (lib/sources/*).
 *
 * Chaque source est une fonction pure côté serveur qui interroge une API
 * tierce et renvoie ses éléments normalisés. Règle absolue : en cas d'échec,
 * une source renvoie une liste vide et `degraded: true` — jamais de données
 * simulées (une alerte fabriquée présentée comme réelle peut déclencher une
 * notification push à de vrais abonnés).
 */

export type AlertLevel = 'vert' | 'jaune' | 'orange' | 'rouge';

export interface SourceResult<T> {
  items: T[];
  /**
   * Libellé de la source. Propagé tel quel jusqu'à l'interface et utilisé par
   * le cron pour décider si une alerte peut être poussée (sources officielles
   * uniquement).
   */
  source: string;
  /** true si la source n'a pas répondu : la liste peut être incomplète. */
  degraded: boolean;
  error?: string;
  updatedAt: string;
  /** Données servies depuis un cache mémoire (éventuellement expiré). */
  cached?: boolean;
}

export function degradedResult<T>(source: string, error: string): SourceResult<T> {
  return {
    items: [],
    source,
    degraded: true,
    error,
    updatedAt: new Date().toISOString(),
  };
}

export const LEVEL_ORDER: Record<AlertLevel, number> = { rouge: 0, orange: 1, jaune: 2, vert: 3 };
